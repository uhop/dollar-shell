'use strict';

import {verifyStrings} from './utils.js';

const impl =
  (shellEscape, shell, options) =>
  (strings, ...args) => {
    const result = [];

    for (let i = 0; i < strings.length; i++) {
      // process a string
      result.push(strings[i]);

      // process an argument
      if (i >= args.length) continue;
      const arg = String(args[i]);
      if (!arg) continue;
      result.push(shellEscape(arg, options));
    }

    return shell(result.join(''), options);
  };

const bqShell =
  (shellEscape, shell) =>
  (strings, ...args) => {
    if (verifyStrings(strings)) return impl(shellEscape, shell, {})(strings, ...args);
    return impl(shellEscape, shell, strings);
  };

export default bqShell;
