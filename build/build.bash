#!/bin/bash

# doesn't work with process substitution for some reason, so this will do
echo 'Combining specs...'
node build/gen-specs.js specs > /tmp/specs.js
[[ $1 == 'production' ]] && debugOpt='' || debugOpt='--debug'
echo 'Bundling scripts...'
browserify -r /tmp/specs.js:spec-data $debugOpt src/js/entry.js > public/generated/bundle.js
echo 'Bundling styles...'
find src/ -name '*.css' | xargs cat > public/generated/all.css
echo 'Build complete'