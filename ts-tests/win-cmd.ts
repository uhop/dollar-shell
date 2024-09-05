'use strict';

import {$sh, currentExecPath, winCmdEscape, raw} from 'dollar-shell';

const $cmd = $sh({stdout: 'inherit', stderr: 'inherit'});

console.log(await $cmd`echo ${winCmdEscape('12""3')} ${raw('abc')}`);
console.log(await $cmd`echo ${winCmdEscape(`hello  \\wor"ld`)}`);
console.log(await $cmd`${currentExecPath()} ${'tests\\manual\\argv.js'} ${`hello  \\wor"ld`}`);
