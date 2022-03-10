'use strict';
const path = require("path");

const npminstall = require('npminstall')
const getPkgDir = require('pkg-dir').sync

const { isObject, formatPath } = require("@hjp-cli-dev/utils");
const {getDefaultRegistryUrl} = require('@hjp-cli-dev/get-npm-info')


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
    this.packageName = options.name;
    // package 的version
    this.packageVersion = options.version;
  }

  // 执行前Package是否存在
  exists() {
    return false
  }

  // 安装Package
  install() {
    return npminstall({
      root: this.path,
      storeDir: this.storePath,
      registry: getDefaultRegistryUrl(),
      pkgs: [
        {name: this.packageName, version: this.packageVersion}
      ]
    })
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
    const pkgJsonDir = pkgRootDir ? path.resolve(pkgRootDir, 'package.json') : null
    const pkgJsonObj = pkgJsonDir ? require(pkgJsonDir) : null
    if (pkgJsonObj && pkgJsonObj.main) {
      return formatPath(path.resolve(pkgRootDir, pkgJsonObj.main))
    }
  }
}

module.exports = Package;