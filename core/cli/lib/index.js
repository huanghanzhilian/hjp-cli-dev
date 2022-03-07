const semver = require('semver');  // 对比版本号
const colors = require("colors");  // 对输入的log染色
const os = require('os');
const pathExists = require('path-exists').sync; // 判断目标文件或文件夹是否存在

const pkg = require('../../../package.json');
const log = require('@hjp-cli-dev/log');

const {NODE_LOW_VERSION} = require('./const');

const core = function () {
  try {
    checkVersion();
    checkLowNodeVersion();
    checkRoot()
    checkUserHome()
  } catch (e) {
    log.error(e.message)
  }
}

const checkUserHome = () => {
  const userHome = os.homedir();
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('用户目录不存在！'))
  }
}

const checkRoot = function () {
  const rootCheck = require('root-check');  // root降级，使用普通用户启动脚手架
  rootCheck()
  // console.log(process.getuid())
}

const checkVersion = function () {
  log.info('cli', pkg.version)
}

const checkLowNodeVersion = function () {
  let current = process.version;
  if (!semver.gte(current, NODE_LOW_VERSION)) {
    throw new Error(colors.red(`不符合最低Node版本要求，要求最低${NODE_LOW_VERSION}`))
  }
}

module.exports = core
