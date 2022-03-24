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

function exec (command, args, options) {
  const win32 = process.platform === 'win32';
  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
  return require('child_process').spawn(cmd, cmdArgs, options || {});
}

function execAsync (command, args, options) {
  return new Promise((resolve, reject) => {
    const p = exec(command, args, options);
    p.on('error', e => {
      reject(e);
    });
    p.on('exit', c => {
      resolve(c);
    });
  });
}

module.exports = {
  isObject,
  formatPath,
  spinnerStart,
  sleep,
  exec,
  execAsync,
};
