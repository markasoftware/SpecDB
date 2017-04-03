#!/bin/bash

# doesn't work with process substitution for some reason, so this will do
echo 'Combining specs...'
node build/gen-specs.js specs /tmp/specs.js public/generated/sitemap.txt
[[ $1 == 'production' ]] && cssMini='csso' || cssMini='cat'
[[ $1 == 'production' ]] && jsMini='babili' || jsMini='cat'
echo 'Bundling scripts...'
# TODO: maybe add --noparse /tmp/specs.js but last time i tried it didn't make a noticeable difference (but mithril did)
browserify -r /tmp/specs.js:spec-data --noparse mithril --debug src/js/entry.js | $jsMini > public/generated/bundle.js
echo 'Bundling styles...'
find src/ -name '*.css' | xargs cat | $cssMini > public/generated/all.css
echo 'Build complete'
