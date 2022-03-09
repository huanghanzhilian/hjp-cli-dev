const os = require('os');
const path = require("path");

const semver = require('semver');  // 对比版本号
const colors = require("colors");  // 对输入的log染色
const pathExists = require('path-exists').sync; // 判断目标文件或文件夹是否存在
const minimist = require("minimist"); // 解析参数
const dotenv = require('dotenv');

const pkg = require('../package.json');
const log = require('@hjp-cli-dev/log');
const {getSemverNpmVersions} = require('@hjp-cli-dev/npm-info');

const {NODE_LOW_VERSION} = require('./const');
const rootCheck = require("root-check");

let args = null;

const core = async function () {
  try {
    checkVersion()
    checkLowNodeVersion()
    checkRoot()
    checkUserHome()
    checkInputArgs()
    log.verbose('debug', 'test debug log')
    checkEnv()
    await checkGlobalUpdate()
  } catch (e) {
    log.error(e.message)
  }
}

const checkGlobalUpdate = async function () {
  // 1.获取当前版本号
  // 2.使用npm API获取最新版本号
  // 3.对比脚手架版本提醒用户更新
  const current = pkg.version;
  const name = pkg.name;
  let versions = await getSemverNpmVersions(name, current);
  let lastVersion = versions.length ? versions[0] : null;
  if (lastVersion && semver.lt(current, lastVersion)) {
    log.notice(colors.yellow(`新版本已推出！本地版本为${current},请手动更新到${lastVersion}
        使用npm install ${name} -g 更新到最新版本`));
  }
}

const checkEnv = function () {
  const envPath = path.resolve(os.homedir(), '.env');
  dotenv.config({
    path: envPath
  })
}

const checkInputArgs = function () {
  args = minimist(process.argv.slice(2));
  checkArgs();
}

const checkArgs = function () {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose';
  } else {
    process.env.LOG_LEVEL = 'info';
  }
  log.level = process.env.LOG_LEVEL;
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
