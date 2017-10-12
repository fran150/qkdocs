var chalk = require('chalk');
var log = require('./log');
var processMemberExpression = require('./memberExpression');

function CommentsProcessor() {
    var self = this;

    this.process = function(node, result, rootName) {
        rootName = rootName || "";

        var baseResult = result;

        log.tab();

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
                                case "@allowcontent":
                                    self.commandAllowContent(commandStr, node, result);
                                    break;
                                case "@service":
                                    self.commandService(commandStr, node, result);
                                    break;
                                case "@binding":
                                    result = self.commandBinding(commandStr, node, result);
                                    break;
                                case "@behaviour":
                                    self.commandBehaviour(commandStr, node, result);
                                    break;
                                case "@observable":
                                    self.commandObservable(commandStr, node, result);
                                    break;
                                case "@computed":
                                    self.commandComputed(commandStr, node, result);
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
                                case "@exposed":
                                    self.commandExposed(commandStr, node, result);
                                    break;
                                case "@signature":
                                    self.commandSignature(commandStr, node, result);
                                    break;
                                case "@end":
                                    result = baseResult;
                                    break;
                            }
                        }
                    }
                }
            }
        }

        log.untab();

        return result;
    }

    this.commandObservable = function(command, node, result) {
        log.debug("Found command Observable");
        result.isObservable = true;
    }

    this.commandAllowContent = function(command, node, result) {
        log.debug("Found command AllowContent");
        result.allowContent = true;
    }

    this.commandComputed = function(command, node, result) {
        log.debug("Found command Computed");
        result.isComputed = true;
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

        log.debug("Found command Property: " + rootName);

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

        result.methods[method.name] = method;

        log.debug("Found command Method: " + rootName);

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

            var match;

            match = command.match(/(\{[\s\S]+\})/);

            if (match && match.length > 0) {
                command = command.replace(match[0], "");
                parameter.name = match[0].replace("{", "").replace("}", "");
            }


            let type = command.match(/(\w+)/);
            command = command.replace(type[0], "");

            parameter.type = type[0];
            parameter.description = command.trim();

            result.parameters[parameterName] = parameter;

            log.debug("Found command Parameter: " + parameterName);

            return parameter;
        }

        return result;
    }

    this.commandParam = function(command, node, result) {
        let name = command.match(/(\w+)/);
        command = command.replace(name[0], "").trim();

        let type = command.match(/(\w+)/);
        command = command.replace(type[0], "").trim();

        if (!result.params) {
            result.params = {};
        }

        var param = {
            name: name[0],
            type: type[0],
            description: command.trim()
        };

        log.debug("Found command param: " + param.name);

        result.params[param.name] = param;
    }

    this.commandSignature = function(command, node, result) {
        log.debug("Found command signature: " + command.trim());

        result.signature = command.trim();
    }

    this.commandReturns = function(command, node, result) {
        let type = command.match(/(\w+)/);
        command = command.replace(type[0], "").trim();

        var returns = {
            type: type[0],
            description: command.trim()
        };

        log.debug("Found command returns: " + returns.type);

        result.returns = returns;
    }

    this.commandComponent = function(command, node, result) {
        result.description = command.trim();
        log.debug("Found command Component");
    }

    this.commandService = function(command, node, result) {
        result.description = command.trim();
        log.debug("Found command Service");
    }

    this.commandBinding = function(command, node, result) {
        let match = command.match(/(\w+)/);
        command = command.replace(match[0], "").trim();

        result.name = match[0];
        result.description = command.trim();

        log.debug("Found command Binding");

        return result;
    }

    this.commandBehaviour = function(command, node, result) {
        let match = command.match(/(\w+)/);
        command = command.replace(match[0], "").trim();

        result.name = match[0];
        result.description = command.trim();

        log.debug("Found command Behaviour");
    }


    this.commandExposed = function(command, node, result) {
        var cmd = command.trim();
        if (cmd == "") {
            if (result.name) {
                result.exposed = result.name;
            } else {
                result.exposed = true;
            }
        } else {
            result.exposed = cmd;
        }

        log.debug("Found command Exposed");
    }

}

module.exports = new CommentsProcessor();
