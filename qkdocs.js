#!/usr/bin/env node
var chalk = require('chalk');

var help = require('./help');
var file = require('./file');
var args = require('./args');

var moduleProcessor = require('./module');
var componentsProcessor = require('./components');

if (args.flags.verbose) {
    console.log(chalk.bold.white("Running in verbose mode..."));
}

var config = file.readModuleConfig(function(bower, main) {
    var result = {};

    result = moduleProcessor.process(bower, main, result);
    componentsProcessor.process(main, result, function(result) {
        //console.log(JSON.stringify(result, null, 4));
    });
});
