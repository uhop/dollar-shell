'use strict';

import process from 'node:process';

for (const arg of process.argv) {
  console.log(JSON.stringify(arg));
}
