'use strict';

const fs = require('fs')
const path = require("path");

const {homedir} = require('os');
const Command = require("@hjp-cli-dev/command")
const customRequest = require('@hjp-cli-dev/request');
const Package = require('@hjp-cli-dev/package');
const log = require('@hjp-cli-dev/log')
const { spinnerStart, sleep, execAsync } = require("@hjp-cli-dev/utils");

const inquirer = require('inquirer');
const semver = require('semver');

const fse = require('fs-extra')

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

const TEMPLATE_TYPE_NORMAL = 'normal';
const TEMPLATE_TYPE_CUSTOM = 'custom';

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

      // 1. 准备阶段
      const projectInfo = await this.prepare();
      if (projectInfo) {
        // 2. 下载模板
        this.projectInfo = projectInfo;
        await this.downTemplate();
        // 3. 安装模板
        await this.installTemplate();
      }
    } catch (e) {
      log.error('error in init command execution: ', e)
    }
  }

  async installTemplate () {
    log.verbose('templateInfo', this.templateInfo);
    if (this.templateInfo) {
      if (!this.templateInfo.type) {
        this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
      }
      if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) {
        // 标准安装
        await this.installNormalTemplate();
      } else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
        // 自定义安装
        await this.installCustomTemplate();
      } else {
        throw new Error('无法识别项目模板类型!');
      }
    }else {
      throw new Error('项目模板信息不存在！');
    }
  }

  /**
   * 安装标准模板
   */
  async installNormalTemplate () {
    // 拷贝模板代码至当前目录
    let spinner = spinnerStart('正在安装模板...');
    await sleep();
    try {
      // 去缓存目录中拿template下的文件路径
      const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template');
      //当前执行脚手架目录
      const targetPath = process.cwd();
      //确保使用前缓存生成目录存在，若不存在则创建
      fse.ensureDirSync(templatePath);
      //确保当前脚手架安装目录存在，若不存在则创建
      fse.ensureDirSync(targetPath);
      //将缓存目录下文件copy至当前目录
      fse.copySync(templatePath, targetPath);
    }catch(e){
      throw e;
    } finally {
      spinner.stop(true);
      log.success('模板安装成功！');
    }

    console.log(this.templateInfo)
    // 依赖安装
    const { installCommand, startCommand } = this.templateInfo;

    let installRet;
    if (installCommand) {
      const installCmd = installCommand.split(' ');
      const cmd = installCmd[0];
      const args = installCmd.slice(1);
      installRet = await execAsync(cmd, args, {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    }
    if (installRet !== 0) {
      throw new Error('依赖安装过程中失败！');
    }
    // 启动命令执行
    if (startCommand) {
      const startCmd = startCommand.split(' ');
      const cmd = startCmd[0];
      const args = startCmd.slice(1);
      await execAsync(cmd, args, {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    }

  }

  async installCustomTemplate () {
    console.log('安装自定义模板');
  }

  async getTemplateList() {
    return customRequest('/project/template')
  }

  async downTemplate() {
    const targetPath = path.resolve(homedir(), '.hjp-cli', 'template');
    const storePath = path.resolve(homedir(), '.hjp-cli', 'template', 'node_modules');
    const { template } = this.projectInfo;
    const templateInfo = this.projerctTemplate.find(item => item.npmName === template)
    const { npmName, version } = templateInfo
    this.templateInfo = templateInfo;
    const pkg = new Package({
      name: npmName,
      path: targetPath,
      storePath,
      version
    })

    if(!await pkg.exists()){
      const spinner = spinnerStart('正在下载模板...');
      await sleep();
      try{
        await pkg.install();
      }catch(e){
        throw e;
      }finally {
        spinner.stop(true);
        if (await pkg.exists()) {
          log.success('下载模板成功');
          this.templateNpm = pkg;
        }
      }
    } else {
      const spinner = spinnerStart('正在更新模板...');
      await sleep();
      try {
        await pkg.update();
      }catch(e) {
        throw e;
      }finally{
        spinner.stop(true);
        if (await pkg.exists()) {
          log.success('更新模板成功');
          this.templateNpm = pkg;
        }
      }
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
        if (!isClearDir) return
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
        } else {
          return
        }
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
        choices: this.createTemplateChoices()
      }])
    } else if (type === TYPE_COMPONENT) {

    }
    return {
      ...option,
      type
    }
  }

  createTemplateChoices () {
    return this.projerctTemplate.map(item => ({
      value: item.npmName,
      name: item.name,
    }));
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
