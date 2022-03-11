'use strict';

const urlJoin = require('url-join')
const axios = require('axios')
const semver = require('semver')

function getDefaultRegistryUrl(isDefault = true) {
  return isDefault ? 'https://registry.npmjs.org/' : 'https://registry.npm.taobao.org/url-join'
}

function getNpmInfo(moduleName, registryUrl) {
  if (!moduleName) {
    return null
  }
  registryUrl = registryUrl || getDefaultRegistryUrl()
  const fullUrl = urlJoin(registryUrl, moduleName)
  return axios.get(fullUrl).then(response => {
    if (response.status === 200) {
      return response.data
    } else {
      throw new Error(`http request error in getting npm info of module ${moduleName}`)
    }
  })
}

async function getNpmVersionsGreatThanEqual(moduleName, targetVersion, registryUrl) {
  const {versions} = await getNpmInfo(moduleName, registryUrl)
  return Object.keys(versions).filter(item => semver.satisfies(item, `^${targetVersion}`)).sort((a, b) => {
    if(semver.lt(a, b)) {
      return -1
    } else if (a === b) {
      return 0
    } else {
      return 1
    }
  })
}

async function getLatestNpmVersion(moduleName, registryUrl) {
  const {versions} = await getNpmInfo(moduleName, registryUrl)
  if (Object.keys(versions).length) {
    const sorted = Object.keys(versions).sort(
      (a, b) => {
        if(semver.gt(a, b)) {
          return -1
        } else if (a === b) {
          return 0
        } else {
          return 1
        }
      }
    )
    return sorted[0]
  } else {
    return null
  }
}

module.exports = {
  getNpmInfo,
  getLatestNpmVersion,
  getDefaultRegistryUrl,
  getNpmVersionsGreatThanEqual
};
