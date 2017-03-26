
var chalk = require('chalk');
var args = require('./args');

function ModuleProcessor() {
    var self = this;

    this.process = function(bower, main, result) {
        if (args.flags.verbose) {
            console.log(chalk.bold.white("Processing Module Data..."));
        }

        if (bower.name) {
            result.name = bower.name;
        } else {
            console.log(chalk.bold.red("Must specify a module name in bower.json"));
        }

        result.description = bower.description;
        result.dependencies = bower.dependencies;
        result.keywords = bower.keywords;
        result.authors = bower.authors;
        result.license = bower.license;

        result.prefix = main.prefix;
    }
}

module.exports = new ModuleProcessor();
