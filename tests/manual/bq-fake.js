'use strict';

import {backQuote} from 'dollar-shell/back-quote.js';

const fakeSpawn = (command, options) => {
  console.log(command, options);
};

const $ = backQuote(fakeSpawn);

$(42)`${2} ls -l ${1} .`;
