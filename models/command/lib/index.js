'use strict';

const semver = require('semver')
const log = require("@hjp-cli-dev/log")
const colors = require('colors/safe') // change cmd text color
const LOWEST_NODE_VERSION = '12.0.0'

class Command {
  constructor(...args) {
    const chain = Promise.resolve()
    chain.then(() => {
      checkNodeVersion()
      this.args = args
      this.initArgs()
      this.init()
      this.exec()
    }).catch(e => {
      log.error(e.message)
      if (log.level === 'verbose') {
        console.log(e)
      }
    })
  }

  initArgs() {
    this.cmdObj = this.args[this.args.length - 1]
  }

  init() {
    throw new Error('init function must be implemented')
  }

  exec() {
    throw new Error('exec function must be implemented')
  }
}

function checkNodeVersion() {
  const currentVersion = process.version
  if (semver.lt(currentVersion, LOWEST_NODE_VERSION)) {
    throw new Error(colors.red(`node版本过低！imooc-cli-dev使用要求node版本为v${LOWEST_NODE_VERSION}`))
  }
}

module.exports = Command;
