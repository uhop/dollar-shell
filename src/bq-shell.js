'use strict';

import {isRawValue, getRawValue, verifyStrings} from './utils.js';

const impl =
  (shellEscape, shell, options) =>
  (strings, ...args) => {
    const result = [];

    for (let i = 0; i < strings.length; i++) {
      // process a string
      result.push(strings[i]);

      // process an argument
      if (i >= args.length) continue;
      if (isRawValue(args[i])) {
        const arg = String(getRawValue(args[i]));
        arg && result.push(arg);
      } else {
        const arg = String(args[i]);
        arg && result.push(shellEscape(arg, options, !i && /^\s*$/.test(strings[i])));
      }
    }

    return shell(result.join(''), options);
  };

const bqShell = (shellEscape, shell, options = {}) => {
  const bq = (strings, ...args) => {
    if (verifyStrings(strings)) return impl(shellEscape, shell, options)(strings, ...args);
    return Object.assign(bqShell(shellEscape, shell, {...options, ...strings}), bq);
  };
  return bq;
};

export default bqShell;
