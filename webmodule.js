var chalk = require('chalk');
var args = require('./args');

function WebModuleProcessor() {
    var self = this;


    this.process = function(node, result) {
        result.dependencies = [];

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

                                    result.dependencies.push(dep.value);
                                }
                            }

                            var moduleFn = body.expression.arguments[1];

                            if (moduleFn.type == "FunctionExpression") {
                                if (moduleFn.body.type == "BlockStatement") {
                                    return moduleFn.body.body;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = new WebModuleProcessor();
