'use strict';
const axios = require("axios");
const urlJoin = require('url-join');
const {gt} = require("semver");

// 获取npm包信息
const getNpmInfo = (npmName, registry) => {
  if (!npmName) {
    return Promise.reject(null);
  }
  registry = registry || getDefaultRegistry();
  let url = urlJoin(registry, npmName)
  return axios.get(url).then(res => {
    if (res.status === 200) {
      return res.data;
    }
    return null
  }).catch(e => Promise.reject(e))
}
// 获取npm包的所有版本号
const getNpmVersions = async (npmName, registry) => {
  try {
    let info = await getNpmInfo(npmName, registry);
    return Object.keys(info.versions);
  } catch (e) {
    return []
  }
}
// 获取npm包的所有符合条件的版本号
const getSemverNpmVersions = async (npmName, current, registry) => {
  return (await getNpmVersions(npmName, registry))
    .filter(item => gt(item, current))
    .sort((a, b) => gt(a, b) ? -1 : 1)
}

// 使用原始源或淘宝源
const getDefaultRegistry = (isOriginal) => {
  return isOriginal ? 'https://registry.npmjs.org/' : 'https://registry.npm.taobao.org'
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getSemverNpmVersions,
  getDefaultRegistry
};
