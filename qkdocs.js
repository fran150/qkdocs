#!/usr/bin/env node
var chalk = require('chalk');

var help = require('./help');
var file = require('./file');

var rest = require('./rest');
var log = require('./log');

var moduleProcessor = require('./module');
var componentsProcessor = require('./components');
var servicesProcessor = require('./services');
var bindingsProcessor = require('./bindings');

log.verbose("Running in verbose mode...");
log.debug("Running in debug mode...");

function finish(error, action, data) {
    if (!error) {
        log.success('Docs ' + action + '!');
    } else {
        log.error("Error:");
        log.error(JSON.stringify(data, null, 4));
    }
}

function count(object) {
    var count = 0;

    for (var name in object) {
        count++
    }

    return count;
}

console.log(chalk.bold.yellow('Running the quark documentation processor...'));

var config = file.readModuleConfig(function(bower, main) {
    var result = {};

    moduleProcessor.process(bower, main, result);

    componentsProcessor.process(main, result, function(result) {
        servicesProcessor.process(main, result, function(result) {
            bindingsProcessor.process(main, result, function(result) {

                log.info("  Processed " + count(result.components) + " components");
                log.info("  Processed " + count(result.services) + " services");
                log.info("  Processed " + count(result.bindings) + " bindings");

                result.components = JSON.stringify(result.components);
                result.services = JSON.stringify(result.services);
                result.bindings = JSON.stringify(result.bindings);

                rest.getDoc(result.name, function(err, data) {
                    data = JSON.parse(data);

                    if (data.length > 0) {
                        rest.updateDoc(data[0].id, JSON.stringify(result), function(err, data) {
                            finish(err, "Updated", data);
                        });
                    } else {
                        rest.saveDoc(JSON.stringify(result), function(err, data) {
                            finish(err, "Saved", data);
                        });
                    }
                });
            });
        });
    });
});
