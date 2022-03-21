'use strict';

const fs = require('fs')

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
    // 前险
    this.prepare()
    // 下载内容
  }

  prepare() {
    // Check whether the directory is empty
    if(!this.isDirEmpty()){
      // Asks whether clearing the current directory
    }
  }

  isDirEmpty() {
    let files = fs.readdirSync(process.cwd())
    files = files.filter(fileName =>
      // fileName filter
      !fileName.startsWith('.') && !'node_modules'.includes(fileName)
    )
    console.log(files.length === 0)
    return files.length === 0
  }
}

module.exports = init;
