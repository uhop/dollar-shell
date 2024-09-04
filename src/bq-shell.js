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

const bqShell = (shellEscape, shell, options = {}) => {
  const bq = (strings, ...args) => {
    if (verifyStrings(strings)) return impl(shellEscape, shell, options)(strings, ...args);
    Object.assign(options, strings);
    return bq;
  };
  return bq;
};

export default bqShell;
