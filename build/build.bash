#!/bin/bash

# doesn't work with process substitution for some reason, so this will do
echo 'Combining specs...'
node build/gen-specs.js specs /tmp/specs.js public/generated/sitemap.txt
[[ $1 == 'production' ]] && cssMini='csso' || cssMini='cat'
echo 'Bundling scripts...'
# TODO: maybe add --noparse /tmp/specs.js but last time i tried it didn't make a noticeable difference (but mithril did)
browserify -r /tmp/specs.js:spec-data --noparse mithril --debug src/js/entry.js > public/generated/bundle.js
if [[ $1 == 'production' ]]
then
    echo 'Compiling and minifying scripts...'
    babel public/generated/bundle.js | uglifyjs --compress --mangle --screw-ie8 > /tmp/bundle.js
    mv /tmp/bundle.js public/generated/bundle.js
fi
echo 'Bundling styles...'
cat src/css/*.css | $cssMini > public/generated/all.css
echo 'Build complete'
