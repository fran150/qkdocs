var chalk = require('chalk');

function Help() {
    this.usage = function() {

        console.log(chalk.bold.white('\nUsage: qkdocs', chalk.cyan('(options)')));

        console.log(chalk.white('\nOptions:'));
        console.log(chalk.yellow('    -h, --help\t\t'), chalk.white('Shows this help'));
        console.log(chalk.yellow('    -v, --verbose\t'), chalk.white('Makes output more verbose'));
        console.log(chalk.yellow('    -d, --debug\t\t'), chalk.white('Show debug outputs'));
    }
}

module.exports = new Help();
