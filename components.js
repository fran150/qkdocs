var fs = require('fs');
var chalk = require('chalk');
var merge = require('merge');
var esprima = require('esprima');
var escodegen = require('escodegen');

var args = require('./args');
var utils = require('./utils');
var Sync = require('./sync');

var webmodule = require('./webmodule');
var comments = require('./comment');

function ComponentsProcessor() {
    var self = this;

    function readPaths(components, tag) {
        var result = {};

        for (var name in components) {
            var component = components[name];
            var fullName;

            if (tag) {
                if (name) {
                    fullName = tag + '-' + name;
                } else {
                    fullName = tag;
                }
            } else {
                fullName = name;
            }

            if (utils.isString(component)) {
                result[fullName] = {
                    path: component
                }
            } else {
                merge(result, readPaths(component, fullName));
            }
        }

        return result;
    }


    this.process = function(main, result, callback) {
        var tag = "";

        if (main.prefix) {
            tag = main.prefix;
        }

        if (args.flags.verbose) {
            console.log(chalk.bold.white("Leyendo ubicación de componentes..."));
        }

        var components = {};

        if (main.namespaces) {
            components = readPaths(main.namespaces, tag);
        }

        if (main.components) {
            components = merge(components, readPaths(main.components, tag));
        }

        new Sync(function(sync) {
            for (var tag in components) {
                let w = sync.wait();

                let component = components[tag];

                if (args.flags.verbose) {
                    console.log(chalk.bold.white("Reading File %s"), chalk.white(component.path));
                }

                fs.readFile("src/" + component.path + ".js", "utf8", function(err, content) {
                    var ast = esprima.parse(content, { range: true, tokens: true, comment: true });
                    ast = escodegen.attachComments(ast, ast.comments, ast.tokens);

                    var node = webmodule.process(ast, component);

                    var fn = node[0].body.body;

                    for (var i = 0; i < fn.length; i++) {
                        var docs = comments.process(fn[i], component);
                    }

                    w();
                });
            }
        }, function() {
            result.components = components;
            callback(result);
        });
    }


}

module.exports = new ComponentsProcessor();
