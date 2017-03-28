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

function BindingsProcessor() {
    var self = this;

    this.process = function(main, result, callback) {
        var name = "";

        if (args.flags.verbose) {
            console.log(chalk.bold.white("Check if \"Bindings\" folder exists..."));
        }

        var bindings = {};

        new Sync(function(sync) {
            let f = sync.wait();
            fs.stat('src/bindings', function(err, status) {
                if (!err) {
                    if (status.isDirectory()) {
                        if (args.flags.verbose) {
                            console.log(chalk.bold.white("  \"bindings\" folder found..."));
                        }

                        let d = sync.wait();
                        fs.readdir('src/bindings', function(errDir, filenames) {
                            if (!errDir) {
                                filenames.forEach(function(filename) {
                                    if (args.flags.verbose) {
                                        console.log(chalk.white("Processing binding..."));
                                        console.log(chalk.white("  File: %s"), chalk.blue(filename));
                                    }

                                    let w = sync.wait();

                                    fs.readFile("src/bindings/" + filename, "utf8", function(errFile, content) {
                                        var ast = esprima.parse(content, { range: true, tokens: true, comment: true });
                                        ast = escodegen.attachComments(ast, ast.comments, ast.tokens);

                                        var binding = {};

                                        if (ast.leadingComments) {
                                            comments.process(ast, binding);
                                        }

                                        var node = webmodule.process(ast, binding);

                                        if (binding.name) {
                                            bindings[binding.name] = binding;
                                        }

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
            result.bindings = bindings;
            callback(result);
        });
    }


}

module.exports = new BindingsProcessor();
