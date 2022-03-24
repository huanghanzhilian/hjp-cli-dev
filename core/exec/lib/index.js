'use strict';

const path = require("path");
const cp = require('child_process')

const Package = require('@hjp-cli-dev/package')
const log = require('@hjp-cli-dev/log')
const { exec: spawn } = require('@hjp-cli-dev/utils');

module.exports = exec;
// 指令对应包的配置表
const cmd2Package = {
  // init: '@imooc-cli-hxq/init'
  init: 'path-exists'
}

async function exec() {
  const cmdObj = arguments[arguments.length - 1]
  const cmdName = cmdObj.name()
  const userHomePath = process.env.CLI_HOME_PATH
  let targetPath = process.env.TARGET_PATH
  let storePath
  const rootPath = targetPath || path.resolve(userHomePath, 'dependencise')
  if (!targetPath) {
    // 未指定具体包路径，设置默认路径
    storePath = path.resolve(rootPath, 'node_modules')
  }

  // todo resolove init arg projectName
  const pkgIns = new Package({
    path: rootPath,
    storePath,
    name: cmd2Package[cmdName],
    version: 'latest',
    // version: '1.0.0'
  })
  if (!targetPath) {
    if (await pkgIns.exists()) {
      await pkgIns.update()
    } else {
      await pkgIns.install()
    }
  }

  const pkgRootFile = await pkgIns.getEntryFilePath()
  if (pkgRootFile) {
    // require(pkgRootFile).apply(null, arguments)
    /*处理参数
    1、去掉parent 防止JSON.stringify报错
    2、去掉以_开头的内部属性
    * */
    const commandObj = Object.create(null)
    Object.entries(arguments[arguments.length - 1]).forEach(([key, val]) => {
      if (!key.startsWith('_') && key !== 'commands' && key !== 'parent' || key === '_optionValueSources') {
        commandObj[key] = val
      }
    })
    arguments[arguments.length - 1] = commandObj
    const code = `require('${pkgRootFile}').apply(null, ${JSON.stringify(Array.from(arguments))})`
    const childProcess = spawn('node', ['-e', code], {
      cwd: process.cwd(),
      stdio: "inherit"
    })
    childProcess.on('error', err => {
      console.log(err)
      process.exit(1)
    })
    childProcess.on('exit', code => {
      if (code === 0) log.info('Init command executed successfully\n')
    })
  }

}

module.exports = exec;
