const { Command } = require('commander');
const colors = require("colors");  // 对输入的log染色

const pkg = require('../package.json');
const log = require('@hjp-cli-dev/log');

const core = function (argv) {
  try {
    registerCommander();
  } catch (e) {
    log.error(e.message)
  }
}

const program = new Command();

const registerCommander = () => {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<comment> [options]')
    .version(pkg.version)
    .option('-d ,--debug', '开启debug模式', false)
    .option('-tp ,--targetPath <targetPath>', '执行路径', '')

  // 启用debug模式
  program.on('option:debug', () => {
    process.env.LOG_LEVEL = program.opts().debug ? 'verbose' : 'info';
    log.level = process.env.LOG_LEVEL;
    log.verbose('已启用debug模式');
  })

  // 未知命令处理
  program.on('command:*', (obj) => {
    console.log(colors.red('不存在的命令：' + obj[0]));
    console.log(colors.red('可用命令：' + program.commands.map(cmd => cmd.name).join()));
  })

  // 未输入命令打印帮助文档
  if(!program.args || !program.args.length){
    program.outputHelp()
    console.log();
  }

  // 这句话要写在结尾， 解析参数
  program.parse(process.argv);
}


module.exports = core