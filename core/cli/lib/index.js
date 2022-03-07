const pkg = require('../../../package.json');

const log = require('@hjp-cli-dev/log');

const core = function () {
  log.notice('cli', pkg.version)
}

module.exports = core