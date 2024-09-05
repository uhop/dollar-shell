'use strict';

import {getEnv, toBase64} from '../utils.js';

export const currentShellPath = () => getEnv('ComSpec') || 'cmd.exe';

const isCmd = s => /^(?:.*\\)?cmd(?:\.exe)?$/i.test(s);
const isPwsh = s => /^(?:.*\\)?(?:pwsh|powershell)(?:\.exe)?$/i.test(s);

const mapControls = {
  '\b': '`b',
  '\t': '`t',
  '\r': '`r',
  '\n': '`n',
  '\f': '`f',
  '\x00': '`0',
  '\x07': '`a',
  '\x1B': '`e',
  '\x0B': '`v',
  '"': '`\\"'
};

const escapePowerShell = (_, controls, nonAlphas, theRest) => {
  if (controls) return mapControls[controls] || '';
  if (nonAlphas) return '`' + nonAlphas;
  return theRest;
};

const escapeCmd = (_, doubleQuote, nonAlphas, theRest) => {
  if (doubleQuote) return '""';
  if (nonAlphas) return '^' + nonAlphas;
  return theRest;
};

export const shellEscape = (s, options, isFirst) => {
  s = String(s);
  const shell = options?.shellPath || currentShellPath();
  if (isCmd(shell)) {
    // based on https://github.com/nodejs/node/blob/dc74f17f6c37b1bb2d675216066238f33790ed29/deps/uv/src/win/process.c#L449
    if (!s) return '""';
    if (!/\s|[\t\"]/.test(s)) return s;
    if (!/[\"\\]/.test(s)) return `"${s}"`;

    let quoteHit = true;
    const result =
      '"' +
      [...s]
        .map(c => {
          if (quoteHit && c === '\\') return '\\\\';
          if (c === '"') {
            quoteHit = true;
            return '\\"';
          }
          quoteHit = false;
          return c;
        })
        .join('') +
      '"';
    return isFirst ? result.replace(/(0xFF)|([\W])|(\w+)/g, escapeCmd) : result;
  }
  if (isPwsh(shell)) return s.replace(/([\t\r\n\f\x00\x1B\x07\x08\x0B\"])|([\W])|(\w+)/g, escapePowerShell);
  return s;
};

export const buildShellCommand = (shell, args, command) => {
  shell ||= currentShellPath();
  if (isCmd(shell)) {
    args ||= ['/d', '/s', '/c'];
  } else if (isPwsh(shell)) {
    args ||= ['-c'];
    if (args.includes('-e')) command = toBase64(command);
  } else {
    args ||= ['-c'];
  }
  return [shell, ...args, command];
};
