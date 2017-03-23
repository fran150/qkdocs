var fs = require('fs');
var chalk = require('chalk');
var merge = require('merge');
var esprima = require('esprima');

var args = require('./args');
var utils = require('./utils');
var Sync = require('./sync');

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

    function getWebModuleDependencies(node, component) {
        component.dependencies = [];

        if (node.type == "Program") {
            var body = node.body[0];
            if (body.type == "ExpressionStatement") {
                if (body.expression.type == "CallExpression") {
                    if (body.expression.callee.type == "Identifier") {
                        if (body.expression.callee.name == "define") {
                            var deps = body.expression.arguments[0];

                            if (deps.type == "ArrayExpression") {
                                for (var i = 0; i < deps.elements.length; i++) {
                                    var dep = deps.elements[i];

                                    component.dependencies.push(dep.value);
                                }
                            }

                            var moduleContent = body.expression.arguments[1];

                            if (moduleContent.type == "FunctionExpression") {
                                if (moduleContent.body.type == "BlockStatement") {
                                    if (moduleContent.body.body[0].type == "FunctionDeclaration") {
                                        for (var i = 0; i < moduleContent.body.body[0].body.body.length; i++) {
                                            var expr = moduleContent.body.body[0].body.body[i];
                                            console.log(expr.type);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
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
                    var parsed = esprima.parse(content);

                    getWebModuleDependencies(parsed, component);

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
