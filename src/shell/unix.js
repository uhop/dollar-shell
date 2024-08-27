'use strict';

import {getEnv} from '../utils.js';

export const shellEscape = s => "'" + String(s).replace(/'/g, "'\\''") + "'";

export const currentShellPath = () => getEnv('SHELL') || '/bin/sh';

// derived from https://github.com/nodejs/node/blob/43f699d4d2799cfc17cbcad5770e1889075d5dbe/lib/child_process.js#L620
export const buildShellCommand = (shell, args, command) => [shell || currentShellPath(), ...(args || ['-c']), command];
