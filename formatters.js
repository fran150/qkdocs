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

function FormattersProcessor() {
    var self = this;

    this.process = function(main, result, callback) {
        var name = "";

        log.tab();

        log.verbose("Check if \"Formatters\" folder exists...");

        log.tab();

        if (!main.formatters) {
            main.formatters = {};
        }

        var formatters = main.formatters;

        new Sync(function(sync) {
            let f = sync.wait();
            fs.stat('src/formatters', function(err, status) {
                if (!err) {
                    if (status.isDirectory()) {
                        log.verbose("\"formatters\" folder found...");

                        let d = sync.wait();
                        fs.readdir('src/formatters', function(errDir, filenames) {
                            if (!errDir) {
                                filenames.forEach(function(filename) {
                                    log.verbose("Processing formatters (file : " + filename + ")");

                                    let w = sync.wait();

                                    fs.readFile("src/formatters/" + filename, "utf8", function(errFile, content) {
                                        var ast = esprima.parse(content, { range: true, tokens: true, comment: true });
                                        ast = escodegen.attachComments(ast, ast.comments, ast.tokens);

                                        if (ast.leadingComments) {
                                            comments.process(ast, formatters);
                                        }

                                        var node = webmodule.process(ast, formatters);

                                        direct.process(node, formatters);

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

            result.formatters = formatters;
            callback(result);
        });
    }


}

module.exports = new FormattersProcessor();
