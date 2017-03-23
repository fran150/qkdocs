
function Sync(actions, then) {
    var self = this;
    var waiting = [];

    function checkReady() {
        var args = [];

        for (var i = 0; i < waiting.length; i++) {
            var w = waiting[i];

            if (!w.ready) {
                return;
            } else {
                args = args.concat(w.arguments);
            }
        }

        then.apply(null, args);
    }

    this.wait = function() {
        var state = {
            index: waiting.length,
            ready: false,
            arguments: []
        }

        waiting.push(state);

        // Return the callback for this wait
        return function() {
            state.ready = true;
            for (var i  = 0; i < arguments.length; i++) {
                state.arguments.push(arguments[i]);
            }

            checkReady();
        };
    }

    actions(self);
}

module.exports = Sync;
