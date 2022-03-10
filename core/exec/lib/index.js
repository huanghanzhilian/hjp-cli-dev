'use strict';

const Package = require('@hjp-cli-dev/package')

const index = () => {
  const pkg = new Package()
  console.log(pkg)
  console.log(process.env.CLI_TARGET_PATH)
}

module.exports = index;
