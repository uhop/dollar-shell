'use strict';

import {$sh} from 'dollar-shell';

const result = await $sh({stdout: 'inherit'})`echo ${`hello'  \\wo"rld`}  ${'two   three'}`;
// const result = await $sh({shellArgs: ['-ic'], stdout: 'inherit'})`nvm ls`;

console.log(result);
