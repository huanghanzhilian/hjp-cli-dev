'use strict';

const { isObject, formatPath } = require("@hjp-cli-dev/utils");
const path = require("path");
const getPkgDir = require('pkg-dir').sync

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
  getEntryFilePath() {
    // 1. 获取package.json 所在目录 - pkg-dir
    // 2. 读取package.json - require
    // 3. 寻找main/lib - path
    // 4. 路径兼容（macOS/windows）
    const pkgRootDir = getPkgDir(this.path)
    const pkgJsonDir = path.resolve(pkgRootDir, 'package.json')
    const pkgJsonObj = require(pkgJsonDir)
    if (pkgJsonObj && pkgJsonObj.main) {
      return formatPath(path.resolve(pkgRootDir, pkgJsonObj.main))
    }
  }
}

module.exports = Package;