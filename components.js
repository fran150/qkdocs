var fs = require('fs');
var chalk = require('chalk');
var merge = require('merge');
var esprima = require('esprima');
var escodegen = require('escodegen');

var log = require('./log');
var utils = require('./utils');
var Sync = require('./sync');

var webmodule = require('./webmodule');
var webModuleClass = require('./class');
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

        log.tab();

        if (main.prefix) {
            tag = main.prefix;
        }

        log.verbose("Reading components location...");

        log.tab();

        var components = {};

        if (main.namespaces) {
            components = readPaths(main.namespaces, tag);
        }

        if (main.components) {
            components = merge(components, readPaths(main.components, tag));
        }

        new Sync(function(sync) {
            for (let tag in components) {
                let w = sync.wait();

                let component = components[tag];
                let path = component.path;

                log.verbose("Reading component " + tag);
                log.verbose(" (file: " + path + ")");

                fs.readFile("src/" + path + ".js", "utf8", function(err, content) {
                    log.verbose("Parsing file: " + path);

                    var ast = esprima.parse(content, { range: true, tokens: true, comment: true });
                    ast = escodegen.attachComments(ast, ast.comments, ast.tokens);

                    if (ast.leadingComments) {
                        comments.process(ast, component);
                    }

                    var node = webmodule.process(ast, component);

                    webModuleClass.process(node, component);

                    w();
                });
            }
        }, function() {
            log.untab();
            log.untab();
            result.components = components;
            callback(result);
        });
    }


}

module.exports = new ComponentsProcessor();
