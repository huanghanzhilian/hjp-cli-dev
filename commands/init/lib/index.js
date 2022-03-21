'use strict';

const fs = require('fs')
const Command = require("@hjp-cli-dev/command")
const inquirer = require('inquirer');
const log = require('@hjp-cli-dev/log')
const fse = require('fs-extra')

function init(programName, options, commandObj) {
  const cmd = new InitCommand(programName, options, commandObj)
}

class InitCommand extends Command {

  init() {
    if (!this.args.length) throw new Error('argument of init command is required')
    this.projectName = arguments[0]
    this.force = this.args[1].force
    this.runPath = process.cwd()
  }

  async exec() {
    try {
      await this.prepare()
      // 下载内容
    } catch (e) {
      log.error('error in init command execution: ', e)
    }
  }

  async prepare() {
    // 不为空
    if (!this.isDirEmpty()) {
      let isClearDir
      if (!this.force) {
        // Asks whether clearing the current directory
        const {clearDir} = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'clearDir',
            default: false,
            message: 'The current directory is not empty.Do you want to clear the current directory ?'
          }
        ])
        isClearDir = clearDir
      }

      if (isClearDir || this.force) {
        await fse.emptydir(this.runPath)
      }
    }
  }

  isDirEmpty() {
    let files = fs.readdirSync(this.runPath)
    files = files.filter(fileName =>
      // fileName filter
      !fileName.startsWith('.') && !'node_modules'.includes(fileName)
    )
    return files.length === 0
  }
}

module.exports = init;
