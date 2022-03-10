'use strict';

const { isObject } = require("@hjp-cli-dev/utils");

class Package {
  constructor(options) {
    if (!options) {
      throw new Error('argument of class Package\'s constructor is required!')
    }
    if (!isObject(options)){
      throw new Error('argument of class Package\'s must be Object !')
    }

    // package 的路径
    this.path = options.path;
    // package 的存储路径
    this.storePath = options.storePath;
    // package 的name
    this.name = options.name;
    // package 的version
    this.version = options.version;
  }

  // 执行前Package是否存在
  async exists() {

  }

  // 安装Package
  install() {

  }

  // 更新Package
  async update() {

  }

  // 获取入口文件的路径
  getRootFilePath() {

  }
}

module.exports = Package;