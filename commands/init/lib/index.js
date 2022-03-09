'use strict';

const init = (projectName, cmdObj) => {
  console.log('init', projectName, cmdObj.Force, process.env.CLI_TARGET_PATH)
}

module.exports = init;
