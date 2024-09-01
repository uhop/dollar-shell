'use strict';

import $ from '../src/index.js';

const result = await $({stdout: 'inherit'})`ls -l ${'.'}`;

console.log(result);
