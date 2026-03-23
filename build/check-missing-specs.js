#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROW_DATA = path.resolve(__dirname, '../src/js/row-data.js');
const SPECS_DIR = path.resolve(__dirname, '../specs');
const CONFIG_DIR = path.resolve(__dirname, '../config');

// optional mapping: spec type -> rows specific to that type (moved to config/)
const ROW_TYPE_MAP_FILE = path.join(CONFIG_DIR, 'row-type-map.yaml');
let rowTypeMap = {};
if (fs.existsSync(ROW_TYPE_MAP_FILE)) {
  try {
    rowTypeMap = yaml.load(fs.readFileSync(ROW_TYPE_MAP_FILE, 'utf8')) || {};
  } catch (e) {
    console.error('Failed to parse', ROW_TYPE_MAP_FILE, e.message);
    rowTypeMap = {};
  }
}

function findSpecFile(baseName) {
  const results = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(p);
      } else if (e.isFile() && path.parse(e.name).name === baseName && path.extname(e.name).toLowerCase() === '.yaml') {
        results.push(p);
      }
    }
  }
  walk(SPECS_DIR);
  return results;
}

function loadYaml(file) {
  try {
    return yaml.load(fs.readFileSync(file, 'utf8')) || {};
  } catch (e) {
    console.error('Failed to parse', file, e.message);
    return {};
  }
}

function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node build/check-missing-specs.js <SpecBaseName>');
    process.exit(2);
  }

  // load row definitions
  let rowDefs;
  try {
    rowDefs = require(ROW_DATA).sections.map(s => s.rows.map(r => r.name)).flat();
  } catch (e) {
    console.error('Failed to load row-data.js:', e.message);
    process.exit(3);
  }

  // find main spec file(s)
  const specFiles = findSpecFile(arg);
  if (specFiles.length === 0) {
    console.error('Spec', arg, 'not found under specs/');
    process.exit(4);
  }

  console.log('Checking spec:', arg);
  for (const specFile of specFiles) {
    const spec = loadYaml(specFile);
    console.log('\nMain file:', specFile);

    // collect members from sections where present
    const members = [];
    if (Array.isArray(spec.sections)) {
      for (const s of spec.sections) {
        if (Array.isArray(s.members)) {
          for (const m of s.members) members.push(m);
        }
      }
    }

    if (members.length === 0) {
      console.log('  No members listed in sections for this spec.');
      continue;
    }

    const missingMemberFiles = [];
    const memberMissingRows = {};

    // recursively collect data and types from a spec file following "inherits"
    const seenFiles = new Set();
    function collectDataFromSpec(specPath) {
      if (!specPath || seenFiles.has(specPath)) return { data: {}, types: [] };
      seenFiles.add(specPath);
      const y = loadYaml(specPath);
      let combinedData = {};
      let combinedTypes = [];
      if (Array.isArray(y.inherits)) {
        for (const inh of y.inherits) {
          const found = findSpecFile(inh);
          if (found.length === 0) continue;
          for (const f of found) {
            const parent = collectDataFromSpec(f);
            combinedData = Object.assign({}, parent.data, combinedData);
            combinedTypes = Array.from(new Set([...combinedTypes, ...(parent.types || [])]));
          }
        }
      }
      const ownData = y.data || {};
      combinedData = Object.assign({}, combinedData, ownData);
      // collect own types (support `types` array or `type` string)
      let ownTypes = [];
      if (Array.isArray(y.types)) ownTypes = y.types.map(String);
      else if (typeof y.types === 'string') ownTypes = [y.types];
      else if (typeof y.type === 'string') ownTypes = [y.type];
      combinedTypes = Array.from(new Set([...combinedTypes, ...ownTypes]));
      return { data: combinedData, types: combinedTypes };
    }

    for (const m of members) {
      const found = findSpecFile(m);
      if (found.length === 0) {
        missingMemberFiles.push(m);
        continue;
      }
      // build merged data and types from member and its inheritance chain
      seenFiles.clear();
      const merged = collectDataFromSpec(found[0]);
      const mergedData = merged.data || {};
      const mergedTypes = merged.types || [];

      // Treat `config/row-type-map.yaml` as authoritative: it maps spec types
      // -> rows that are specific to that type. For any given `rowName`:
      // - If the row is mapped to one or more types, only check it when the
      //   part's `types` intersects that mapped set.
      // - If the row is not mapped (i.e. generic), always check it.
      // This avoids the previous "skip everything the part doesn't have"
      // behavior and makes the map define where rows belong.
      const ignoreMap = process.env.IGNORE_ROW_TYPE_MAP === '1';
      if (ignoreMap) console.log('  NOTE: IGNORE_ROW_TYPE_MAP=1 — checking all rows from row-data.js');

      const missing = [];
      if (ignoreMap) {
        // When overriding, check every row from row-data.js regardless of map.
        for (const rowName of rowDefs) {
          if (!(rowName in mergedData)) missing.push(rowName);
        }
      } else {
        const rowToTypes = {};
        for (const [t, rows] of Object.entries(rowTypeMap || {})) {
          if (!Array.isArray(rows)) continue;
          for (const r of rows) {
            rowToTypes[r] = rowToTypes[r] || new Set();
            rowToTypes[r].add(t);
          }
        }

        // Only check rows that are present in the mapping. The mapping is
        // authoritative: unmapped rows are ignored entirely.
        for (const rowName of rowDefs) {
          const mappedTypes = rowToTypes[rowName];
          if (!mappedTypes) continue; // skip unmapped rows
          // If the part has no declared types, we skip type-specific rows.
          if (!mergedTypes || mergedTypes.length === 0) continue;
          const hasIntersection = mergedTypes.some(mt => mappedTypes.has(mt));
          if (!hasIntersection) continue; // not relevant for this part
          if (!(rowName in mergedData)) missing.push(rowName);
        }
      }
      if (missing.length) memberMissingRows[m] = missing;
    }

    // report
    if (missingMemberFiles.length) {
      console.log('  Missing member spec files:');
      for (const mm of missingMemberFiles) console.log('    -', mm);
    } else {
      console.log('  All member spec files found.');
    }

    if (Object.keys(memberMissingRows).length) {
      console.log('\n  Missing rows in member specs:');
      for (const [member, rows] of Object.entries(memberMissingRows)) {
        console.log('    ' + member + ': ' + rows.length + ' missing rows');
        for (const r of rows) console.log('      -', r);
      }
    } else {
      console.log('\n  No missing rows detected in member specs (within checked keys).');
    }
  }
}

main();
