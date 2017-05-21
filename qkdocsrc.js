var fs = require('fs');
var merge = require('merge');

function getDefaultConfig() {
    return {
        docs: {
            path: "/docs"
        },
        http: {
            host: "localhost",
            port: 2403,
        }
    }
}

module.exports = {
    read: function(callback) {
        var rcFile = {};

        var target = "./.qkdocsrc";

        if (fs.existsSync(target)) {
            fs.readFile(target, 'utf8', function(err, fileContent) {
                if (err) {
                    console.log(chalk.red("Error Reading File:"));
                    console.log(chalk.red("%j"), err);
                }

                rcFile = JSON.parse(fileContent);

                var config = merge.recursive(getDefaultConfig(), rcFile);

                callback(config);
            });
        } else {
            callback(getDefaultConfig());
        }
    }
}
