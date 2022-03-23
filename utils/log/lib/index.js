'use strict';
const log = require('npmlog');

// 低于这个等级的不会被打印，debug的时候有用
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'
// 添加自定义前缀
log.heading = 'hjp-cli';
log.headingStyle = {bg:'blue',fg:'black'}

// 添加自定义类型
log.addLevel('debug', 2000,{ fg: 'yellow' })
log.addLevel('success', 2000, {fg: 'green', bold: true}); // 添加自定义命令

module.exports = log;
