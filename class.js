var chalk = require('chalk');
var args = require('./args');

var comments = require('./comment');
var processMemberExpression = require('./memberExpression');

function ClassProcessor() {
    var self = this;

    this.process = function(node, result) {
        var fn = node[0].body.body;

        for (var i = 0; i < fn.length; i++) {
            var expr = fn[i];

            if (expr.type == "ExpressionStatement") {
                // Process $$.parameters
                if (expr.expression.type == "CallExpression") {
                    if (expr.expression.callee.type == "MemberExpression") {
                        if (expr.expression.callee.property) {
                            if (expr.expression.callee.property.type == "Identifier") {
                                if (expr.expression.callee.property.name == "parameters") {
                                    if (expr.expression.arguments) {
                                        if (expr.expression.arguments[0].type == "ObjectExpression") {
                                            var properties = expr.expression.arguments[0].properties;

                                            for (var j = 0; j < properties.length; j++) {
                                                comments.process(properties[j], result);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Process Assignments
                if (expr.expression.type == "AssignmentExpression") {
                    var name = "";
                    if (expr.expression.operator = "=") {
                        if (expr.expression.left.type == "MemberExpression") {
                            name = processMemberExpression(expr.expression.left);
                        }

                        if (expr.expression.left.type == "Identifier") {
                            name = expr.expression.left.name;
                        }

                        if (expr.expression.right.type == "ObjectExpression") {
                            for (var j = 0; j < expr.expression.right.properties.length; j++) {
                                var property = expr.expression.right.properties[j];

                                comments.process(property, result, name);
                            }
                        } else {
                            comments.process(expr, result, name);
                        }
                    }
                }

                // Process Calls
                if (expr.expression.type == "CallExpression") {
                    comments.process(expr, result, name);
                }
            }
        }

    }
}

module.exports = new ClassProcessor();
