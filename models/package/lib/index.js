'use strict';

const path = require("path");
const {isObject, formatPath} = require("@hjp-cli-dev/utils");
const getPkgDir = require('pkg-dir').sync
const {getDefaultRegistryUrl, getLatestNpmVersion} = require('@hjp-cli-dev/get-npm-info')
const pathExists = require('path-exists')
const npminstall = require('npminstall')
const SemVer = require("semver");


class Package {
  constructor(options) {
    if (!options) {
      throw new Error('argument of class Package\'s constructor is required!')
    }
    if (!isObject(options)) {
      throw new Error('argument of class Package\'s must be Object !')
    }
    // package的目标路径
    this.path = options.path
    // 缓存package的路径
    this.storePath = options.storePath
    // package的name
    this.packageName = options.name
    // package的version
    this.packageVersion = options.version
    // package 的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_');
  }

  get cacheFilePath () {
    return path.resolve(this.storePath, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
  }

  // 判断当前 Package 是否存在
  async exists() {
    if (this.storePath) {
      //去storePath里找包对应文件夹
      const pkgInstallDirName = await genPackageFileNameByVersion(this.packageName, this.packageVersion)
      const pkgName = this.packageName.includes('/')? this.packageName.split('/')[1] : ''
      this.path = path.resolve(this.storePath, pkgInstallDirName,pkgName)
      return pathExists(this.path)
    } else {
      // 判断指定目录的包是否存在
      return !!getPkgDir(this.path)
    }
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
    const latestVersion = await getLatestNpmVersion(this.packageName, getDefaultRegistryUrl())
    if (this.packageVersion !== 'latest') {
      if (SemVer.lt(this.packageVersion, latestVersion))
        return npminstall({
          root: this.path,
          storeDir: this.storePath,
          registry: getDefaultRegistryUrl(),
          pkgs: [
            {name: this.packageName, version: 'latest'}
          ]
        })
    }

  }

  // 获取入口文件的路径
  async getEntryFilePath() {
    if (this.storePath && !await this.exists()) {
      return null
    }
    const pkgRootDir = getPkgDir(this.path)
    const pkgJsonDir = path.resolve(pkgRootDir, 'package.json')
    const pkgJsonObj = require(pkgJsonDir)
    if (pkgJsonObj && pkgJsonObj.main) {
      return formatPath(path.resolve(pkgRootDir, pkgJsonObj.main))
    }
    return null
  }
}

/**
 *
 * @param {string} packageName
 * @param {string} version
 */
async function genPackageFileNameByVersion(packageName, version) {
  let specificVersion = version
  if (version === 'latest') {
    specificVersion = await getLatestNpmVersion(packageName,getDefaultRegistryUrl())
  }
  //e.g. _path-exists@5.0.0@path-exists
  //     _@imooc-cli_init@1.1.2@@imooc-cli
  return `_${packageName.replace(/\//g,'_')}@${specificVersion}@${packageName.split('/')[0]}`
}

module.exports = Package;
