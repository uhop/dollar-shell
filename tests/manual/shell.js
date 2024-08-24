'use strict';

import {$sh} from 'dollar-shell';

const result = await $sh({stdout: 'inherit'})`echo ${`hello'  \\wo"rld`}  ${'two   three'}`;

console.log(result);
