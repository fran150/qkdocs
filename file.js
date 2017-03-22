var fs = require('fs');
var Sync = require('sync');
var Future = Sync.Future();

// Run in a fiber
Sync(function(){
    function File() {
        var self = this;

        this.readModuleConfig = function() {
            var bowerFile = './bower.json';
            var quarkFile = './src/main.json';

            var bowerExists;
            var quarkExists;

            fs.exists(bowerFile, function(exists) { existsReady(exists); });
            fs.exists(quarkFile, function(exists) { existsReady(undefined, exists); });

            existsReady(exists1, exists2) {

            }

            if (bowerExists.result && quarkExists.result) {
                var bowerJson = fs.readFile.future(bowerFile, 'utf8');
                var quarkJson = fs.readFile.future(quarkFile, 'utf8');

                console.log(bowerJson.result);
                console.log(quarkJson.result);
            }
        }
    }

    module.exports = new File();
});
