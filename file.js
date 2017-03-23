var fs = require('fs');
var chalk = require('chalk');
var args = require('./args');
var Sync = require('./sync');

// Run in a fiber
function File() {
    var self = this;

    this.readModuleConfig = function(callback) {
        var bowerFile = './bower.json';
        var quarkFile = './src/main.json';

        new Sync(function(sync) {
            var w1 = sync.wait();
            var w2 = sync.wait();

            if (args.flags.verbose) {
                console.log(chalk.bold.white("Reading bower.json and src/main.json"));
            }

            fs.readFile(bowerFile, 'utf8', w1);
            fs.readFile(quarkFile, 'utf8', w2);
        }, function(err1, bowerJson, err2, mainJson) {
            if (!err1 && !err2) {
                var bower = JSON.parse(bowerJson);
                var main = JSON.parse(mainJson);

                if (args.flags.debug) {
                    console.log(chalk.bold.yellow("\nbower.json contents:"))
                    console.log(chalk.yellow(JSON.stringify(bower, null, 4)));
                    console.log(chalk.bold.yellow("\nsrc/main.json contents:"))
                    console.log(chalk.yellow(JSON.stringify(main, null, 4)));
                }

                callback(bower, main);
            } else {
                console.log(chalk.bold.red("Debe ejecutar el comando en el directorio raiz de un modulo quark con los archivos bower.json y src/main.json"));
            }
        });
    }
}

module.exports = new File();
