'use strict';

const fs = require('fs')
const path = require("path");

const {homedir} = require('os');
const Command = require("@hjp-cli-dev/command")
const customRequest = require('@hjp-cli-dev/request');
const Package = require('@hjp-cli-dev/package');
const log = require('@hjp-cli-dev/log')
const { spinnerStart, sleep } = require("@hjp-cli-dev/utils");

const inquirer = require('inquirer');
const semver = require('semver');

const fse = require('fs-extra')

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

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
      // 0.获取模板基本信息
      this.projerctTemplate = await this.getTemplateList();

      if (!this.projerctTemplate || !this.projerctTemplate.length) {
        throw new Error('无可用项目模板');
      }
      // 1.准备阶段
      const info = await this.prepare();

      // 2.下载模板
      await this.downTemplate(info);
      // 3.安装模板
    } catch (e) {
      log.error('error in init command execution: ', e)
    }
  }

  async getTemplateList() {
    return customRequest('/project/template')
  }

  async downTemplate(info) {
    const targetPath = path.resolve(homedir(), '.hjp-cli', 'template');
    const storePath = path.resolve(homedir(), '.hjp-cli', 'template', 'node_modules');
    const {npmName, version} = this.projerctTemplate.find(item => item.npmName === info.template)
    const pkg = new Package({
      name: npmName,
      path: targetPath,
      storePath,
      version
    })

    if(!await pkg.exists()){
      const spinner = spinnerStart('正在下载模板...')
      await sleep();
      await pkg.install();
      spinner.stop(true);
      log.success('下载模板成功');
    } else {
      const spinner = spinnerStart('正在更新模板...');
      await sleep();
      await pkg.update();
      spinner.stop(true);
      log.success('更新模板成功');
    }
  }

  async prepare() {
    if (!this.isDirEmpty()) {
      let isClearDir
      if (!this.force) {
        const {clearDir} = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'clearDir',
            default: false,
            message: '当前文件夹不为空，是否继续创建项目？'
          }
        ])
        isClearDir = clearDir
      }

      if (isClearDir || this.force) {
        let {confirmDel} = await inquirer.prompt({
          type: 'confirm',
          name: 'confirmDel',
          message: '是否确认清空当前目录下的文件？',
          default: false
        })
        if (confirmDel) {
          await fse.emptydir(this.runPath)
        }
        return null
      } else {
        return null
      }

    }

    return await this.getProjectInfo();
  }

  async getProjectInfo() {
    const isValidName = v => {
      return /^(@[a-zA-Z0-9-_]+\/)?[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v);
    }

    let {type} = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: '请选择创建项目或组件',
      default: TYPE_PROJECT,
      choices: [
        {name: '项目', value: TYPE_PROJECT},
        {name: '组件', value: TYPE_COMPONENT}
      ]
    })
    let option = {};
    if (type === TYPE_PROJECT) {
      option = await inquirer.prompt([{
        type: 'input',
        name: 'projectName',
        message: '请输入项目名称',
        default: '',
        validate(val) {
          const done = this.async()
          setTimeout(function () {
            if (!isValidName(val)) {
              done('请输入有效合法的项目名称');
              return;
            }
            done(null, true);
          }, 0);
        }
      }, {
        type: 'input',
        name: 'version',
        message: '请输入版本号',
        default: '1.0.0',
        validate(val) {
          const done = this.async()
          setTimeout(function () {
            if (!semver.valid(val)) {
              done('请输入有效合法的版本号');
              return;
            }
            done(null, true);
          }, 0);
        },
        filter: function (val) {
          if (!!semver.valid(val)) {
            return semver.valid(val);
          } else {
            return val;
          }
        }
      }, {
        type: 'list',
        name: 'template',
        message: '请选择项目模板',
        default: 0,
        choices: this.projerctTemplate.map(item => new Object({name: item.name, value: item.npmName}))
      }])
    } else if (type === TYPE_COMPONENT) {

    }
    return {
      ...option,
      type
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
