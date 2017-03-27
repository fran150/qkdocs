var fs = require('fs');
var chalk = require('chalk');
var esprima = require('esprima');
var escodegen = require('escodegen');

var args = require('./args');
var utils = require('./utils');
var Sync = require('./sync');

var webmodule = require('./webmodule');
var webModuleClass = require('./class');
var comments = require('./comment');

function ServicesProcessor() {
    var self = this;

    this.process = function(main, result, callback) {
        var name = "";

        if (args.flags.verbose) {
            console.log(chalk.bold.white("Leyendo ubicación de servicios..."));
        }

        var services = {};

        if (main.require && main.require.config && main.require.config.services) {
            for (var name in main.require.config.services) {
                var path = main.require.config.services[name];

                var index = path.indexOf("/");
                path = path.substring(index + 1);

                services[name] = {
                    name: name,
                    path: path
                };
            }
        }

        new Sync(function(sync) {
            for (var name in services) {
                let w = sync.wait();

                let service = services[name];

                if (args.flags.verbose) {
                    console.log(chalk.white("Processing service %s"), chalk.bold.cyan(name));
                    console.log(chalk.white("  File: %s"), chalk.magenta(service.path));
                }

                fs.readFile("src/" + service.path + ".service.js", "utf8", function(err, content) {
                    var ast = esprima.parse(content, { range: true, tokens: true, comment: true });
                    ast = escodegen.attachComments(ast, ast.comments, ast.tokens);

                    if (ast.leadingComments) {
                        comments.process(ast, service);
                    }

                    var node = webmodule.process(ast, service);

                    webModuleClass.process(node, service);

                    w();
                });
            }
        }, function() {
            result.services = services;
            callback(result);
        });
    }


}

module.exports = new ServicesProcessor();
