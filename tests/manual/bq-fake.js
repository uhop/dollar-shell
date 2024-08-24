'use strict';

import bqSpawn from 'dollar-shell/bq-spawn.js';

const fakeSpawn = (command, options) => {
  console.log(command, options);
};

const $ = bqSpawn(fakeSpawn);

$(42)`${2} ls -l ${1} .`;
