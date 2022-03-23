'use strict';

const path = require('path')

const {Spinner} = require('cli-spinner');
const dots = require('cli-spinners');

function isObject(arg) {
  return Object.prototype.toString.call(arg) === '[object Object]'
}

function formatPath(arg) {
  if (arg && typeof arg === 'string' && path.sep === '\\'){
    return arg.replace(/\\/g, '/')
  }
  return arg
}

function spinnerStart(msg) {
  const s = new Spinner('%s ' + msg);
  const _dots = Object.keys(dots);
  const r = Math.ceil(Math.random() * _dots.length);
  s.setSpinnerString(dots[_dots[r]].frames.join(''));
  s.start();
  return s
}

function sleep (timeout=1000) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

module.exports = {
  isObject,
  formatPath,
  spinnerStart,
  sleep
};
