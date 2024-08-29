'use strict';

import {getEnv, toBase64} from '../utils.js';

export const currentShellPath = () => getEnv('ComSpec') || 'cmd.exe';

const isCmd = s => /^(?:.*\\)?cmd(?:\.exe)?$/i.test(s);
const isPwsh = s => /^(?:.*\\)?(?:pwsh|powershell)(?:\.exe)?$/i.test(s);

export const shellEscape = (s, options) => {
  s = String(s);
  const shell = options?.shell || currentShellPath();
  // return s.replace(/[\\'"\^%]|(?:\r?\n)/g, '^$&');
  if (isCmd(shell)) return s.replace(/[\\'"\^%]|(?:\r?\n)/g, '^$&');
  // if (isPwsh(shell)) return '"' + s.replace(/"/g, "`\"") + '"';
  return s;
};

export const buildShellCommand = (shell, args, command) => {
  shell ||= currentShellPath();
  // derived from https://github.com/nodejs/node/blob/43f699d4d2799cfc17cbcad5770e1889075d5dbe/lib/child_process.js#L620
  if (isCmd(shell)) return [shell, ...(args || ['/d', '/s', '/c']), command];
  if (isPwsh(shell)) return [shell, ...(args || ['-e']), toBase64(command)];
  return [shell, ...(args || ['-c']), command];
};
