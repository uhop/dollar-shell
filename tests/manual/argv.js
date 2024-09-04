'use strict';

import process from 'node:process';

for (let i = 0; i < process.argv.length; ++i) {
  console.log(i, '=', process.argv[i]);
}
