#!/bin/bash

# doesn't work with process substitution for some reason, so this will do
node build/gen-specs.js specs > /tmp/specs.js
[[ $1 == 'production' ]] && debugOpt='' || debugOpt='--debug'
browserify -r /tmp/specs.js:spec-data $debugOpt src/js/entry.js > public/generated/bundle.js
find src/ -name '*.css' | xargs cat > public/generated/all.css