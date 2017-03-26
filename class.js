var chalk = require('chalk');
var args = require('./args');

var comments = require('./comment');

function ClassProcessor() {
    var self = this;

    this.process = function(node, result) {
        var fn = node[0].body.body;

        for (var i = 0; i < fn.length; i++) {
            comments.process(fn[i], result);
        }

    }
}

module.exports = new ClassProcessor();
