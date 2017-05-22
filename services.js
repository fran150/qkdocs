var fs = require('fs');
var chalk = require('chalk');
var esprima = require('esprima');
var escodegen = require('escodegen');

var log = require('./log');
var utils = require('./utils');
var Sync = require('./sync');

var webmodule = require('./webmodule');
var webModuleClass = require('./class');
var comments = require('./comment');

function ServicesProcessor() {
    var self = this;

    this.process = function(main, result, callback) {
        var name = "";

        log.tab();

        log.verbose("Reading services location...");

        log.tab();

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

                log.verbose("Processing service " + name);
                log.verbose(" (File: " + service.path + ")");

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
            log.untab();
            log.untab();

            result.services = services;
            callback(result);
        });
    }


}

module.exports = new ServicesProcessor();
