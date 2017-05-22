var chalk = require('chalk');
var args = require('./args');

var tabs = "";
var tabCount = 0;


module.exports = {

    info: function(text) {
        console.log(tabs + chalk.bold.white(text));
    },

    success: function(text) {
        console.log(tabs + chalk.bold.green(text));
    },

    error: function(text) {
        console.log(tabs + chalk.bold.red(text));
    },

    verbose: function(text) {
        if (args.verbose) {
            console.log(tabs + chalk.cyan(text));
        }
    },

    debug: function(text) {
        if (args.debug) {
            console.log(chalk.yellow(text));
        }
    },

    tab: function() {
        tabCount++;

        tabs = "";

        for (var i = 0; i < tabCount; i++) {
            tabs += "  ";
        }
    },

    untab: function() {
        tabCount--;

        tabs = "";

        for (var i = 0; i < tabCount; i++) {
            tabs += "  ";
        }
    }
}
