
var chalk = require('chalk');
var log = require('./log');

function ModuleProcessor() {
    var self = this;

    this.process = function(bower, main, result) {
        log.tab();

        log.verbose("Processing Module Data...");

        if (bower.name) {
            result.name = bower.name;
        } else {
            log.error("Must specify a module name in bower.json");
        }

        result.description = bower.description;
        result.dependencies = bower.dependencies;
        result.keywords = bower.keywords;
        result.authors = bower.authors;
        result.license = bower.license;
        result.version = bower.version;

        result.prefix = main.prefix;

        log.debug("Data Found:");
        log.debug(JSON.stringify(result, null, 4));

        log.untab();
    }
}

module.exports = new ModuleProcessor();
