var minimist = require('minimist');

var argv = minimist(process.argv.slice(2));

var flags = {
    verbose: false,
    debug: false
}

if (argv["h"] || argv["help"]) {
    help.usage();
    return;
}

if (argv["d"] || argv["debug"]) {
    flags.debug = true;
}

if (argv["v"] || argv["verbose"]) {
    flags.verbose = true;
}

module.exports = flags;
