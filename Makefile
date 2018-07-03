PATH       := node_modules/.bin:${PATH}

tests      := tests/*.js

css_output := public/all.css
css_input  := ${wildcard src/css/*.css}

js_output  := public/bundle.js
js_input   := ${shell find src/js -name '*.js' -type f}
js_entry   := src/js/entry.js
js_noparse := mithril

n_sentinel := .npm-make-sentinel

# pathnames should be relative to where?
sw_root    := public
# where to output, relative to sw_root
sw_basename:= sw.js
sw_output  := ${sw_root}/${sw_basename}
# files to cache
sw_input   := public/**

# ./ so `browserify` understands it
spec_output:= ./tmp/specs.js

# custom/authoritative specs
athr_output:= tmp/authoritative.json
athr_input := ${shell find specs -name '*.yaml' -type f}
athr_folder:=specs

map_output := public/sitemap.txt

# we separate scrape and parse because 14mb is too much to keep redownloading.
intc_scrape:= tmp/intel-scrape.json
intc_parse := tmp/intel-parse.json

prod       := false

development: ${n_sentinel} ${dev_guard} ${css_output} ${js_output}
production: prod := true
production: ${n_sentinel} ${prod_guard} ${css_output} \
	${js_output} ${sw_output} ${map_output}
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
		--static-file-globs=${sw_input}
	uglifyjs -cmo ${sw_output} \
		${sw_output} 2>/dev/null

${spec_output} ${map_output} : ${athr_output} ${intc_parse} build/combine-specs.js
	node build/combine-specs.js ${spec_output} ${map_output} ${athr_output} ${intc_parse}

${athr_output} : ${athr_input} build/gen-specs.js
	node build/gen-specs.js ${athr_folder} ${athr_output}

${intc_scrape} :
	curl -o ${intc_scrape} 'https://odata.intel.com/API/v1_0/Products/Processors()?$$format=json'

${intc_parse} : build/intel-parse.js ${intc_scrape}
	node build/intel-parse.js ${intc_scrape} ${intc_parse}

${n_sentinel} : package.json
	npm install
	touch ${n_sentinel}

clean:
	rm -f ${css_output} ${js_output} ${sw_output} \
		${spec_output} ${map_output} ${intc_scrape} \
		${intc_parse} ${athr_output} ${n_sentinel}

.PHONY: development production test clean watch
