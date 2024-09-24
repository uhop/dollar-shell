'use strict';

import {verifyStrings, isRawValue, getRawValue} from './utils.js';

const appendString = (s, previousSpace, result) => {
  previousSpace ||= /^\s/.test(s);
  if (previousSpace) s = s.trimStart();

  const lastSpace = /\s$/.test(s);
  if (lastSpace) s = s.trimEnd();

  let parts = s.split(/\s+/g).filter(part => part);
  if (parts.length) {
    if (!previousSpace) {
      if (result.length) {
        result[result.length - 1] += parts[0];
      } else {
        result.push(parts[0]);
      }
      parts = parts.slice(1);
    }
    result.push(...parts);
    previousSpace = lastSpace;
  } else {
    previousSpace ||= lastSpace;
  }

  return previousSpace;
};

const impl =
  (spawn, options) =>
  (strings, ...args) => {
    const result = [];

    let previousSpace = true;
    for (let i = 0; i < strings.length; i++) {
      // process a string

      previousSpace = appendString(strings[i], previousSpace, result);

      // process an argument

      if (i >= args.length) continue;

      if (isRawValue(args[i])) {
        const arg = String(getRawValue(args[i]));
        if (!arg) continue;
        previousSpace = appendString(arg, previousSpace, result);
      } else {
        const arg = String(args[i]);
        if (!arg) continue;
        if (previousSpace) {
          result.push(arg);
        } else {
          if (result.length) {
            result[result.length - 1] += arg;
          } else {
            result.push(arg);
          }
        }
        previousSpace = false;
      }
    }

    return spawn(result, options);
  };

const bqSpawn = (spawn, options = {}) => {
  const bq = (strings, ...args) => {
    if (verifyStrings(strings)) return impl(spawn, options)(strings, ...args);
    return Object.assign(bqSpawn(spawn, {...options, ...strings}), bq);
  };
  return bq;
};

export default bqSpawn;
