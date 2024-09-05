'use strict';

import {$sh, currentExecPath} from 'dollar-shell';

const $cmd = $sh({stdout: 'inherit', stderr: 'inherit'});
const $pwsh = $cmd({shellPath: 'pwsh.exe'});

console.log(await $pwsh`echo ${'12""3'}`);
console.log(await $pwsh`echo ${`hello  \\wor"ld`}`);
console.log(await $pwsh`${currentExecPath()} ${'tests\\manual\\argv.js'} ${`hello  \\wor"ld`}`);
