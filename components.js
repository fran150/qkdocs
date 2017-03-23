var merge = require('merge');
var utils = require('./utils');

function ComponentsProcessor() {
    var self = this;

    this.process = function(namespace, tag) {
        var result = {};

        for (var name in namespace) {
            var component = namespace[name];
            var fullName;

            if (tag) {
                if (name) {
                    fullName = tag + '-' + name;
                } else {
                    fullName = tag;
                }
            } else {
                fullName = name;
            }

            console.log(fullName);

            if (utils.isString(component)) {
                result[fullName] = component;
            } else {
                merge(result, self.process(component, fullName));
            }
        }

        return result;
    }
}

module.exports = new ComponentsProcessor();
