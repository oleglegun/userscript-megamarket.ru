#!/bin/sh
SCRIPT_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\" ,]//g');
cat script.meta.js | sed "s/{{version}}/$SCRIPT_VERSION/g"
