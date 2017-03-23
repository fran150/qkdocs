module.exports = {
    isDefined: function (variable) {
        if (typeof variable === 'undefined') {
            return false;
        };

        return true;
    },

    // Check if the specified var is a string
    isString: function (variable) {
        if (typeof variable === 'string' || variable instanceof String) {
            return true;
        }

        return false;
    }
}
