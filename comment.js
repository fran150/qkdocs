var chalk = require('chalk');
var args = require('./args');

function CommentsProcessor() {
    var self = this;

    this.process = function(node, result) {
        if (node.leadingComments) {
            if (node.leadingComments[0].type == "Block") {
                if (node.leadingComments[0].value.startsWith("*")) {
                    var comment = node.leadingComments[0].value;

                    // Get all commands in comment
                    var commands = comment.match(/\@[\w]+/g);

                    // For each command in comment
                    for (var i = 0; i < commands.length; i++) {
                        // Get the command string
                        var command = commands[i];

                        // Get the start position of the command text
                        var start = comment.indexOf(command);
                        var end = undefined;

                        // If there is another command on same comment get it's position if not
                        // scan to the end of comment
                        if ((i + 1) < commands.length) {
                            end = comment.indexOf(commands[i + 1], start + 1);
                        }

                        // Get the full command string using the obtained positions
                        var commandStr = comment.slice(start, end);
                        // Delete the found command string from comment to avoid reprocessing
                        comment = comment.replace(commandStr, "");
                        // Delete the command from the command string
                        commandStr = commandStr.replace(command, "");
                        // Trim the command string
                        commandStr = commandStr.trim();

                        switch (command.toLowerCase()) {
                            case "@observable":
                                self.commandObservable(commandStr, node, result);
                                break;
                            case "@property":
                                result = self.commandProperty(commandStr, node, result);
                                break;
                            case "@method":
                                result = self.commandMethod(commandStr, node, result);
                                break;
                            case "@param":
                                self.commandParam(commandStr, node, result);
                                break;
                            case "@returns":
                                self.commandReturns(commandStr, node, result);
                                break;
                        }
                    }
                }
            }
        }

        return result;
    }

    this.commandObservable = function(command, node, result) {
        result.isObservable = true;
        return result;
    }

    function processMemberExpression(node) {
        var name = "";

        if (node.object.type == "ThisExpression") {
            name += "this";
        }

        if (node.object.type == "MemberExpression") {
            name += processMemberExpression(node.object);
        }

        if (node.property.type == "Identifier") {
            name += "." + node.property.name;
        }

        return name;
    }

    this.commandProperty = function(command, node, result) {
        if (node.type == "ExpressionStatement") {
            if (node.expression.type == "AssignmentExpression") {
                if (node.expression.left.type == "MemberExpression") {
                    if (!result.properties) {
                        result.properties = {};
                    }

                    let propertyName = processMemberExpression(node.expression.left);
                    let property = {
                        name: propertyName
                    };

                    let type = command.match(/(\w+)?/);
                    command = command.replace(type[0], "");

                    property.type = type[0];
                    property.description = command.trim();

                    result.properties[propertyName] = property;
                    return property;
                }
            }
        }

        return result;
    }

    this.commandMethod = function(command, node, result) {
        if (node.type == "ExpressionStatement") {
            if (node.expression.type == "AssignmentExpression") {
                if (node.expression.left.type == "MemberExpression") {
                    if (!result.methods) {
                        result.methods = {};
                    }

                    let methodName = processMemberExpression(node.expression.left);
                    let method = {
                        name: methodName
                    };

                    method.description = command.trim();

                    result.methods[methodName] = method;
                    return method;
                }
            }
        }

        return result;
    }

    this.commandParam = function(command, node, result) {
        let name = command.match(/(\w+)?/);
        command = command.replace(name[0], "").trim();

        let type = command.match(/(\w+)?/);
        command = command.replace(type[0], "").trim();

        if (!result.params) {
            result.params = {};
        }

        var param = {
            name: name[0],
            type: type[0],
            description: command.trim()
        };

        result.params[param.name] = param;
    }

    this.commandReturns = function(command, node, result) {
        let type = command.match(/(\w+)?/);
        command = command.replace(type[0], "").trim();

        var returns = {
            type: type[0],
            description: command.trim()
        };

        result.returns = returns;
    }


}

module.exports = new CommentsProcessor();
