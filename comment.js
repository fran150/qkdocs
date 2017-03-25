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

                        console.log("Comando %s: %s", command, commandStr);
                    }
                }
            }
        }
    }
}

module.exports = new CommentsProcessor();
