'use strict';

const Command = require("@hjp-cli-dev/command")

function init(programName, options, commandObj) {
  const cmd = new InitCommand(programName, options, commandObj)
}

class InitCommand extends Command {

  init() {
    if (!this.args.length) throw new Error('argument of init command is required')
    this.projectName = arguments[0]
    this.force = this.args[1].force
  }

  exec() {
    console.log('init command exec')
  }
}

module.exports = init;
