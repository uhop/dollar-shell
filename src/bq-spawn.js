'use strict';

import {verifyStrings, isRawValue, getRawValue} from './utils.js';

const impl =
  (spawn, options) =>
  (strings, ...args) => {
    const result = [];

    let previousSpace = true;
    for (let i = 0; i < strings.length; i++) {
      // process a string

      let string = strings[i];
      previousSpace ||= /^\s/.test(string);
      if (previousSpace) string = string.trimStart();
      const lastSpace = /\s$/.test(string);
      if (lastSpace) string = string.trimEnd();

      let parts = string.split(/\s+/g).filter(part => part);
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

      // process an argument

      if (i >= args.length) continue;

      const arg = String(isRawValue(args[i]) ? getRawValue(args[i]) : args[i]);
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

    return spawn(result, options);
  };

const bqSpawn = (spawn, options = {}) => {
  const bq = (strings, ...args) => {
    if (verifyStrings(strings)) return impl(spawn, options)(strings, ...args);
    Object.assign(options, strings);
    return bq;
  };
  return bq;
};

export default bqSpawn;
