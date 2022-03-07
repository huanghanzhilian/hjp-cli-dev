'use strict';

const axios = require("axios");
const urlJoin = require('url-join');

const getNpmInfo = (npmName, registry) => {
  if (!npmName) return null
  registry = registry || getDefaultRegistry();
  let url = urlJoin(registry, npmName)
  console.log(url)
  return axios.get(url).then(res => {
    if (res.status === 200) {
      return res.data
    } else {
      return null
    }
  }).catch(err => {
    return Promise.reject(err)
  })
}
const getDefaultRegistry = (isOriginal = false) => {
  return isOriginal ? 'https://registry.npmjs.org/' : 'https://registry.npm.taobao.org'
}

module.exports = {
  getNpmInfo
};
