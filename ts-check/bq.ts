'use strict';

import $ from 'dollar-shell';

const result = await $({stdout: 'inherit'})`ls -l ${'.'}`;

console.log(result);
