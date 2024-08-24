'use strict';

import $, {currentShellPath} from 'dollar-shell';

const result = await $({stdout: 'inherit'})`${currentShellPath()} -i -c ${'nvm ls'}`;

console.log(result);
