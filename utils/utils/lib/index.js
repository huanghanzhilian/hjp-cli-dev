'use strict';

module.exports = {
  isObject
};

function isObject(arg) {
  return Object.prototype.toString.call(arg) === '[object Object]'
}
