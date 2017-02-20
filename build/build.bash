#!/bin/bash

browserify src/entry.js > public/generated/bundle.js
node process-specs.js > public/generated/specs.json