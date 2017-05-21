var fs = require('fs');
var chalk = require('chalk');
var Sync = require('./sync');
var log = require('./log');

// Run in a fiber
function File() {
    var self = this;

    this.readModuleConfig = function(callback) {
        var bowerFile = './bower.json';
        var quarkFile = './src/main.json';

        new Sync(function(sync) {
            var w1 = sync.wait();
            var w2 = sync.wait();

            log.tab();
            log.verbose("Reading bower.json and src/main.json");

            fs.readFile(bowerFile, 'utf8', w1);
            fs.readFile(quarkFile, 'utf8', w2);
        }, function(err1, bowerJson, err2, mainJson) {
            if (!err1 && !err2) {
                var bower = JSON.parse(bowerJson);
                var main = JSON.parse(mainJson);

                log.debug("bower.json read!");
                log.debug("src/main.json read!");

                log.untab();

                callback(bower, main);
            } else {
                log.error("Debe ejecutar el comando en el directorio raiz de un modulo quark con los archivos bower.json y src/main.json");
            }
        });
    }
}

module.exports = new File();
