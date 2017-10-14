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

function BindingsProcessor() {
    var self = this;

    this.process = function(main, result, callback) {
        var name = "";

        log.tab();

        log.verbose("Check if \"Bindings\" folder exists...");

        log.tab();

        if (!main.bindings) {
            main.bindings = {};
        }

        var bindings = main.bindings;

        new Sync(function(sync) {
            let f = sync.wait();
            fs.stat('src/bindings', function(err, status) {
                if (!err) {
                    if (status.isDirectory()) {
                        log.verbose("\"bindings\" folder found...");

                        let d = sync.wait();
                        fs.readdir('src/bindings', function(errDir, filenames) {
                            if (!errDir) {
                                filenames.forEach(function(filename) {
                                    log.verbose("Processing binding (file : " + filename + ")");

                                    let w = sync.wait();

                                    fs.readFile("src/bindings/" + filename, "utf8", function(errFile, content) {
                                        var ast = esprima.parse(content, { range: true, tokens: true, comment: true });
                                        ast = escodegen.attachComments(ast, ast.comments, ast.tokens);

                                        if (ast.leadingComments) {
                                            comments.process(ast, bindings);
                                        }

                                        var node = webmodule.process(ast, bindings);

                                        direct.process(node, bindings);

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

            result.bindings = bindings;
            callback(result);
        });
    }


}

module.exports = new BindingsProcessor();
