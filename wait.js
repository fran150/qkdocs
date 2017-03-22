
function Sync() {
    var self = this;

    var callback;
    var waiting = [];

    function checkReady() {
        var args = [];

        for (var name in waiting) {
            var w = waiting[name];

            if (!w.ready) {
                return;
            } else {
                args = args.concat(waiting.arguments);
            }
        }

        callback(args);
    }

    this.wait = function() {
        var wait = {
            ready: false,
            arguments: []
        }

        waiting.push(wait);

        return function() {
            waiting[].ready = true;
            waiting[name].arguments = arguments;
        };
    }

    this.then = function(callback) {
    }
}
