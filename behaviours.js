var fs = require('fs');
var chalk = require('chalk');
var esprima = require('esprima');
var escodegen = require('escodegen');

var log = require('./log');
var utils = require('./utils');
var Sync = require('./sync');

var webmodule = require('./webmodule');
var direct = require('./direct');
var comments = require('./comment');

function BehavioursProcessor() {
    var self = this;

    this.process = function(main, result, callback) {
        var name = "";

        log.tab();

        log.verbose("Check if \"Behaviours\" folder exists...");

        log.tab();

        if (!main.behaviours) {
            main.behaviours = {};
        }

        var behaviours = main.behaviours;

        new Sync(function(sync) {
            let f = sync.wait();
            fs.stat('src/behaviours', function(err, status) {
                if (!err) {
                    if (status.isDirectory()) {
                        log.verbose("\"behaviours\" folder found...");

                        let d = sync.wait();
                        fs.readdir('src/behaviours', function(errDir, filenames) {
                            if (!errDir) {
                                filenames.forEach(function(filename) {
                                    log.verbose("Processing behaviour (file : " + filename + ")");

                                    let w = sync.wait();

                                    fs.readFile("src/behaviours/" + filename, "utf8", function(errFile, content) {
                                        var ast = esprima.parse(content, { range: true, tokens: true, comment: true });
                                        ast = escodegen.attachComments(ast, ast.comments, ast.tokens);

                                        if (ast.leadingComments) {
                                            comments.process(ast, behaviours);
                                        }

                                        var node = webmodule.process(ast, behaviours);

                                        direct.process(node, behaviours);

                                        w();
                                    });
                                });
                            }

                            d();
                        });
                    }
                }

                f();
            });
        }, function() {
            log.untab();
            log.untab();

            result.behaviours = behaviours;
            callback(result);
        });
    }


}

module.exports = new BehavioursProcessor();
