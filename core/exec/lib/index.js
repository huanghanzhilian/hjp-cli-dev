'use strict';

const path = require("path");

const Package = require('@hjp-cli-dev/package')


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
    version: 'latest'
  })

  if (!targetPath) {
    if (pkgIns.exists()) {
      // 更新
      pkgIns.update()
    } else {
      await pkgIns.install()
    }
  }

  const pkgRootFile = pkgIns.getEntryFilePath()
  if (pkgRootFile) {
    console.log(pkgRootFile)
    require(pkgRootFile).apply(null, arguments)
  }
}

module.exports = exec;
