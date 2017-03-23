var fs = require('fs');
var chalk = require('chalk');
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

            fs.readFile(bowerFile, w1);
            fs.readFile(quarkFile, w2);
        }, function(err1, bowerJson, err2, mainJson) {
            if (!err1 && !err2) {
                var bower = JSON.parse(bowerJson);
                var main = JSON.parse(mainJson);

                callback(bower, main);
            } else {
                console.log(chalk.bold.red("Debe ejecutar el comando en el directorio raiz de un modulo quark con los archivos bower.json y src/main.json"));
            }
        });
    }
}

module.exports = new File();
