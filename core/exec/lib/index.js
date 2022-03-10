'use strict';

const log = require('@hjp-cli-dev/log');

const Package = require('@hjp-cli-dev/package')


// 指令对应包的配置表
const cmd2Package = {
  init: '@hjp-cli-dev/init'
}
function exec () {
  const cmdObj = arguments[arguments.length - 1]
  const cmdName = cmdObj.name()
  const pkgIns = new Package({
    path: process.env.CLI_TARGET_PATH,
    storePath: process.env.CLI_HOME_PATH,
    name: cmd2Package[cmdName], // todo 应该取 init 指令的 projectName 参数？
    version: 'latest'
  })
  console.log(pkgIns)
  const entryFilePath = pkgIns.getEntryFilePath()
  console.log(entryFilePath)
}

module.exports = exec;
