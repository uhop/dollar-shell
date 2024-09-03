'use strict';

import {sh} from 'dollar-shell';

const p = sh`./tests/manual/inf.sh`;

console.log('Started...');
await new Promise(resolve => setTimeout(resolve, 1000));
p.kill();
console.log('Killed...');
await p.exited;
console.log(p.finished, p.killed, p.exitCode, p.signalCode);
