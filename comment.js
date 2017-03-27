var chalk = require('chalk');
var args = require('./args');
var processMemberExpression = require('./memberExpression');

function CommentsProcessor() {
    var self = this;

    this.process = function(node, result, rootName) {
        rootName = rootName || "";

        if (node.leadingComments) {
            if (node.leadingComments[0].type == "Block") {
                if (node.leadingComments[0].value.startsWith("*")) {
                    var comment = node.leadingComments[0].value;

                    // Get all commands in comment
                    var commands = comment.match(/\@[\w]+/g);

                    if (commands && commands != null) {

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
                                case "@component":
                                    self.commandComponent(commandStr, node, result);
                                    break;
                                case "@service":
                                    self.commandService(commandStr, node, result);
                                    break;
                                case "@observable":
                                    self.commandObservable(commandStr, node, result);
                                    break;
                                case "@property":
                                    result = self.commandProperty(commandStr, node, rootName, result);
                                    break;
                                case "@method":
                                    result = self.commandMethod(commandStr, node, rootName, result);
                                    break;
                                case "@param":
                                    self.commandParam(commandStr, node, result);
                                    break;
                                case "@returns":
                                    self.commandReturns(commandStr, node, result);
                                    break;
                                case "@parameter":
                                    result = self.commandParameter(commandStr, node, result);
                                    break;
                            }
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

    this.commandProperty = function(command, node, rootName, result) {
        if (!result.properties) {
            result.properties = {};
        }

        let property = {
            name: rootName
        };

        var match;

        match = command.match(/(\{[\s\S]+\})/);

        if (match && match.length > 0) {
            command = command.replace(match[0], "");
            property.name = match[0].replace("{", "").replace("}", "");
        }

        match = command.match(/(\w+)/);
        if (match && match.length > 0) {
            command = command.replace(match, "");
            property.type = match[0];
        }

        property.description = command.trim();

        result.properties[rootName] = property;
        return property;
    }

    this.commandMethod = function(command, node, rootName, result) {
        if (!result.methods) {
            result.methods = {};
        }

        let method = {
            name: rootName
        };

        var match = command.match(/(\{[\s\S]+\})/);

        if (match && match.length > 0) {
            command = command.replace(match[0], "");
            method.name = match[0].replace("{", "").replace("}", "");
        }

        method.description = command.trim();

        result.methods[rootName] = method;

        return method;
    }

    this.commandParameter = function(command, node, result) {
        if (node.type == "Property") {
            if (!result.parameters) {
                result.parameters = {};
            }

            let parameterName;

            if (node.key.type == "MemberExpression") {
                parameterName = processMemberExpression(node.expression.left);
            } else if (node.key.type == "Identifier") {
                parameterName = node.key.name;
            }

            let parameter = {
                name: parameterName
            };

            let type = command.match(/(\w+)?/);
            command = command.replace(type[0], "");

            parameter.type = type[0];
            parameter.description = command.trim();

            result.parameters[parameterName] = parameter;
            return parameter;
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

    this.commandComponent = function(command, node, result) {
        result.description = command.trim();
    }

    this.commandService = function(command, node, result) {
        result.description = command.trim();
    }

}

module.exports = new CommentsProcessor();
