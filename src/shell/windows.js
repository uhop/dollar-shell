'use strict';

import {getEnv, toBase64} from '../utils.js';

export const currentShellPath = () => getEnv('ComSpec') || 'cmd.exe';

const isCmd = s => /^(?:.*\\)?cmd(?:\.exe)?$/i.test(s);
const isPwsh = s => /^(?:.*\\)?(?:pwsh|powershell)(?:\.exe)?$/i.test(s);

const mapControls = {
  '\b': '`b',
  '\t': '`t',
  '\n': '`n',
  '\f': '`f',
  '\r': '`r',
  '\x00': '`0',
  '\x07': '`a',
  '\x1B': '`e',
  '\x0B': '`v'
};

const escapePowerShell = (_, controls, nonAlphas, theRest) => {
  if (controls) return mapControls[controls] || '';
  if (nonAlphas) return '`' + nonAlphas;
  return theRest;
};

const escapeCmd = (_, nonAlphas, theRest) => {
  if (nonAlphas) return '^' + nonAlphas;
  return theRest;
};

export const shellEscape = (s, options) => {
  s = String(s);
  const shell = options?.shellPath || currentShellPath();
  // if (isCmd(shell)) return s.replace(/./g, '^$&');
  if (isCmd(shell)) return s.replace(/([\W])|(.+)/g, escapeCmd);
  if (isPwsh(shell)) return s.replace(/([\t\r\n\f\x00\x1B\x07\x08\x0B])|([\W])|(.+)/g, escapePowerShell);
  return s;
};

export const buildShellCommand = (shell, args, command) => {
  shell ||= currentShellPath();
  if (isCmd(shell)) return [shell, ...(args || ['/d', '/s', '/c']), command];
  if (isPwsh(shell)) {
    args ||= ['-c'];
    if (args.includes('-e')) command = toBase64(command);
    return [shell, ...args, command];
  }
  return [shell, ...(args || ['-c']), command];
};
