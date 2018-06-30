PATH       := .node_modules/.bin:${PATH}

tests      := tests/*.js

css_output := public/all.css
css_input  := src/css/*.css

js_output  := public/bundle.js
js_input   := ${shell find src/js -name '*.js' -type f}
js_entry   := src/js/entry.js
js_noparse := mithril

# pathnames should be relative to where?
sw_root    := public
# where to output, relative to sw_root
sw_basename:= sw.js
sw_output  := ${sw_root}/${sw_basename}
# files to cache
sw_input   := public/**

spec_output:= ./tmp/specs.js
spec_input := ${shell find specs -name '*.yaml' -type f}
spec_folder:= specs
map_output := public/sitemap.txt

prod := false

development: ${dev_guard} ${css_output} ${js_output}
production: prod := true
production: clean ${prod_guard} ${css_output} ${js_output} \
	${sw_output} ${map_output}
test:
	tape ${tests} | tap-spec
watch:
	find specs src | entr make

${css_output} : ${css_input}
	cat ${css_input} > ${css_output}
	if ${prod}; then csso ${css_output} ${css_output}; fi

${js_output} : ${js_input} ${spec_output}
	browserify -r ${spec_output}:spec-data \
		--noparse ${js_noparse} --debug ${js_entry} \
		> ${js_output}
	if ${prod}; then babel ${js_output} | \
		uglifyjs -cmo ${js_output}; fi

${sw_output} : ${sw_input}
	sw-precache --root=${sw_root} --sw-file=sw.js \
		--static-file-globs='${sw_input}'
	uglifyjs -cmo ${sw_output} \
		${sw_output} 2>/dev/null

${spec_output} ${map_output} : ${spec_input}
	node build/gen-specs.js ${spec_folder} ${spec_output} \
		${map_output}

clean:
	rm -f ${css_output} ${js_output} ${sw_output} \
		${spec_output} ${map_output}

.PHONY: development production test clean
