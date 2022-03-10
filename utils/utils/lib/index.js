'use strict';

const path = require('path')

function isObject(arg) {
  return Object.prototype.toString.call(arg) === '[object Object]'
}

function formatPath(arg) {
  if (arg && typeof arg === 'string' && path.sep === '\\'){
    return arg.replace(/\\/g, '/')
  }
  return arg
}

module.exports = {
  isObject,
  formatPath
};
