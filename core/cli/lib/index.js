'use strict';

module.exports = core;

const dotenv = require('dotenv')
const path = require('path')
const semver = require('semver')
const log = require('@hjp-cli-dev/log')
const os = require('os')
const userHome = os.homedir()
const {sync: pathExistsSync} = require("path-exists");
const commander = require('commander')

const {DEFAULT_CLI_HOME} = require('./const')
const pkg = require('../package.json')
const {getNpmVersionsGreatThanEqual} = require("@hjp-cli-dev/get-npm-info");
const exec = require('@hjp-cli-dev/exec')

const program = new commander.Command()

async function core() {
  try {
    await prepare()
    registerCommand()
  } catch (e) {
    log.error(e.message)
    // todo error stack trace
    // if (program._optionValues.debug){
    log.error(e)
    // }
  }
}

async function checkNewestVersion() {
  //1. 获取当前版本
  const pkgName = pkg.name
  const currentVersion = pkg.version
  //2. 获取远程版本
  const versions = await getNpmVersionsGreatThanEqual(pkgName, currentVersion)
  //3. 对比提示
  if (versions && versions.length) {
    const latestVersion = versions[0]
    if (semver.gt(latestVersion, currentVersion)) {
      log.warn('imooc-cli-dev update info', `you can update, latest version is ${latestVersion}, your current version is ${currentVersion}
            update command: npm i @imooc-cli-hxq/core -g`)
    }
  }
}

async function prepare() {
  checkPkgVersion()
  rootCheck()
  checkUserHome()
  checkCliHome()
  await checkNewestVersion()
}

function checkCliHome() {
  // todo parse .env file
  const dotEnvFilePath = path.resolve(userHome, '.env')
  if (pathExistsSync(dotEnvFilePath)) {
    dotenv.config({
      path: dotEnvFilePath
    })
  }
  createDefaultCliPath()
}

function createDefaultCliPath() {
  if (process.env.CLI_HOME) {
    process.env.CLI_HOME_PATH = path.join(userHome, process.env.CLI_HOME)
  } else {
    process.env.CLI_HOME_PATH = path.join(userHome, DEFAULT_CLI_HOME)
  }
}


function checkUserHome() {
  const homeDir = userHome
  if (!homeDir || !pathExistsSync(homeDir)) {
    throw new Error('用户目录不存在！')
  }
}

function rootCheck() {
  // windows 无法使用 process.geteU
  const fn = require('root-check') // 使用1.*版本 才可使用require
  fn()
}


function checkPkgVersion() {
  log.notice('imooc-cli-dev version: ', pkg.version)
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', 'enter debug mode', false)
    .option('-tp, --targetPath <filepath>', 'exec command file path', '')

  program.on('option:debug', function () {
    if (program._optionValues.debug) {
      process.env.LOG_LEVEL = 'verbose'
      log.verbose('Enter Debug Mode')
    } else {
      process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
  })

  program.command('init [programName]')
    .option('-f,--force','force init program ')
    .action(exec)

  // resolve unknown command
  program.on('command:*', function (arr) {
    const availebleCommands = program.commands.map(item => item.name())
    console.log('unknown command: ', arr[0])
    console.log('availeble commands: ', availebleCommands.join(','))
  })

  program.on('option:targetPath', function () {
    process.env.TARGET_PATH = program._optionValues.targetPath
  })

  // todo bug show help when 'command init myproject -f'
  // if (program.args.length < 1) {
  //     program.outputHelp()
  //     console.log()
  // }

  program.parse(process.argv)
}