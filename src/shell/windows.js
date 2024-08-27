'use strict';

import {getEnv} from '../utils.js';

export const shellEscape = s => String(s);

export const currentShellPath = () => getEnv('ComSpec') || 'cmd.exe';

export const buildShellCommand = (shell, args, command) => {
  // derived from https://github.com/nodejs/node/blob/43f699d4d2799cfc17cbcad5770e1889075d5dbe/lib/child_process.js#L620
  if (/^(?:.*\\)?cmd(?:\.exe)?$/i.test(shell)) return [shell || currentShellPath(), ...(args || ['/d', '/s', '/c']), '"' + command + '"'];
  return [shell || currentShellPath(), ...(args || ['-c']), command];
};
