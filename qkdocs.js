#!/usr/bin/env node
var minimist = require('minimist');
var help = require('./help');
var file = require('./file');
var componentsProcessor = require('./components');

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

var config = file.readModuleConfig(function(bower, main) {
    if (main && main.namespaces) {

        var components = componentsProcessor.process(main.namespaces, '');

        console.log(components);
    }
});
