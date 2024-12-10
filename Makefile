PATH       := ./node_modules/.bin:${PATH}
# to dl, this followed by output file followed by url
curl       := curl -A "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0" --retry 5 --retry-delay 5 --connect-timeout 30 -fo
node       := node ${NODE_OPTS}

tests      := ./tests/*.js

css_output := ./public/all.css
css_input  := ${wildcard ./src/css/*.css}

js_output  := ./public/bundle.js
js_input   := ${shell find src/js -name '*.js' -type f}
js_entry   := ./src/js/entry.js
js_noparse := mithril

n_sentinel := ./.npm-make-sentinel

# pathnames should be relative to where?
sw_root    := ./public
# where to output, relative to sw_root
sw_basename:= ./sw.js
sw_output  := ${sw_root}/${sw_basename}
# files to cache
# m_input is make-friendly glob, s_input excludes _redirects too	
sw_m_input := ./public/**
sw_s_input := ./public/**/!(_redirects)

# ./ so `browserify` understands it
spec_output:= ./tmp/specs.js

# custom/authoritative specs
athr_output:= ./tmp/authoritative-parse.json
athr_input := ${shell find specs -name '*.yaml' -type f}
athr_folder:= ./specs

map_output := ./public/sitemap.txt

ubch_cpus  := ./tmp/scrape/userbenchmark-scrape-cpus.csv
ubch_gpus  := ./tmp/scrape/userbenchmark-scrape-gpus.csv
ubch_scrape:= ${ubch_cpus} ${ubch_gpus}
ubch_parse := ./tmp/userbenchmark-parse.json

3dmk_cpus  := ./tmp/scrape/3dmark-scrape-cpus.html
3dmk_gpus  := ./tmp/scrape/3dmark-scrape-gpus.html
3dmk_scrape:= ${3dmk_cpus} ${3dmk_gpus}
3dmk_parse := ./tmp/3dmark-parse.json

gbch_cpus := ./tmp/scrape/geekmench-scrape-cpus.csv
gbch_gpus_opencl := ./tmp/scrape/geekmench-scrape-gpus-opencl.csv
gbch_gpus_vulkan := ./tmp/scrape/geekbench-scrape-gpus-vulkan.csv
gbch_scrape:= ${gbch_cpus} ${gbch_gpus_opencl} ${gbch_gpus_vulkan}
gbch_parse := ./tmp/geekbench-parse.json

psmk_gpus := ./tmp/scrape/pass-mark-scrape-gpus.html
psmk_scrape := ${psmk_gpus}
psmk_parse := ./tmp/pass-mark-parse.json

prod       := false

development: ${n_sentinel} ${dev_guard} ${css_output} ${js_output}
production: prod := true
production: ${n_sentinel} ${prod_guard} ${css_output} \
	${js_output} ${sw_output} ${map_output}
test:
	tape ${tests} | tap-summary
watch:
	find specs src build | entr ${MAKE}

${css_output} : ${css_input}
	cat ${css_input} > ${css_output}
	if ${prod}; then csso ${css_output} -o ${css_output}; fi

${js_output} : ${js_input} ${spec_output}
	browserify -r ${spec_output}:spec-data \
		--noparse ${js_noparse} --debug ${js_entry} \
		> ${js_output}
	if ${prod}; then babel ${js_output} | \
		uglifyjs -cmo ${js_output}; fi

${sw_output} : ${sw_m_input}
	sw-precache --root=${sw_root} --sw-file=sw.js \
		--static-file-globs='${sw_s_input}'
	uglifyjs -cmo ${sw_output} \
		${sw_output} 2>/dev/null

${spec_output} ${map_output} : ${athr_output} ${intc_parse} ${ubch_parse} ${3dmk_parse} \
	${gbch_parse} ${psmk_parse} build/combine-specs.js build/combine-util.js build/util.js
	${node} build/combine-specs.js ${spec_output} ${map_output} \
		${athr_output} ${ubch_parse} ${3dmk_parse} ${gbch_parse} ${psmk_parse} ${intc_parse}

${athr_output} : ${athr_input} build/gen-specs.js
	${node} build/gen-specs.js ${athr_folder} ${athr_output}

${ubch_scrape} :
	${curl} ${ubch_cpus} 'http://www.userbenchmark.com/resources/download/csv/CPU_UserBenchmarks.csv'
	${curl} ${ubch_gpus} 'http://www.userbenchmark.com/resources/download/csv/GPU_UserBenchmarks.csv'

${ubch_parse} : ${ubch_scrape} build/userbenchmark-parse.js
	${node} build/userbenchmark-parse.js ${ubch_scrape} ${ubch_parse}

${3dmk_scrape} :
	${curl} ${3dmk_cpus} 'https://benchmarks.ul.com/compare/best-cpus'
	${curl} ${3dmk_gpus} 'https://benchmarks.ul.com/compare/best-gpus'

${3dmk_parse} : ${3dmk_scrape} build/3dmark-parse.js
	${node} build/3dmark-parse.js ${3dmk_scrape} ${3dmk_parse}

${gbch_scrape} :
	@echo "Downloading Geekbench data..."
	${curl} ${gbch_cpus} 'https://browser.geekbench.com/processor-benchmarks'
	${curl} ${gbch_gpus_opencl} 'https://browser.geekbench.com/opencl-benchmarks'
	${curl} ${gbch_gpus_vulkan} 'https://browser.geekbench.com/vulkan-benchmarks'
	@echo "Geekbench data downloaded."

# MAYBE: an implicit rule for -parse.json
${gbch_parse} : ${gbch_scrape} build/geekbench-parse.js
	${node} build/geekbench-parse.js ${gbch_scrape} ${gbch_parse}

${psmk_scrape} :
	@echo "Downloading PassMark GPU data..."
	${curl} ${psmk_gpus} 'https://www.videocardbenchmark.net/high_end_gpus.html'
	@echo "PassMark GPU data download complete."

${psmk_parse} : ${psmk_scrape} build/passmark-parse.js
	${node} build/passmark-parse.js ${psmk_scrape} ${psmk_parse}

${n_sentinel} : package.json
	npm install
	touch ${n_sentinel}

# clean everything
clean:
	${MAKE} clean-nonet
	rm -f ${n_sentinel} ${intc_scrape} ${3dmk_scrape} ${ubch_scrape} ${gbch_scrape} ${psmk_scrape}

# only clean things that can be regenerated without a network connection
clean-nonet:
	rm -f ${css_output} ${js_output} ${sw_output} \
		${spec_output} ${map_output} ${intc_parse} \
		${ubch_parse} ${3dmk_parse} ${gbch_parse} \
		${psmk_parse} ${athr_output}

.PHONY: development production test clean clean-nonet watch
