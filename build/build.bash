#!/bin/bash

cat <(node build/gen-specs.js specs) <(browserify src/js/entry.js) > public/generated/bundle.js
find src/ -name '*.css' | xargs cat > public/generated/all.css