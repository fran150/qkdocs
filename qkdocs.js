#!/usr/bin/env node
var minimist = require('minimist');
var help = require('./help');
var file = require('./file');

var argv = minimist(process.argv.slice(2));

var debug = false;
var verbose = false;

if (argv["h"] || argv["help"]) {
    help.usage();
    return;
}

if (argv["d"] || argv["debug"]) {
    debug = true;
}

if (argv["v"] || argv["verbose"]) {
    debug = true;
}

file.readModuleConfig();
