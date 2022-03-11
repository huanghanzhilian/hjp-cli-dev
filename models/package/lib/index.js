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

    this.path = options.path
    this.storePath = options.storePath
    this.packageName = options.name
    this.packageVersion = options.version
  }

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

  async update() {
    const latestVersion = await getLatestNpmVersion(this.packageName, getDefaultRegistryUrl())
    if (this.packageVersion !== 'latest') {
      if (SemVer.lt(this.packageVersion, latestVersion))
        return npmInstall({
          root: this.path,
          storeDir: this.storePath,
          registry: getDefaultRegistryUrl(),
          pkgs: [
            {name: this.packageName, version: 'latest'}
          ]
        })
    }

  }

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
