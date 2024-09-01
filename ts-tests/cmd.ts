'use strict';

import {spawn} from '../src/index.js';

const cmd = spawn(['ls', '-l', '.'], {stdout: 'inherit', stderr: 'inherit'});

await cmd.exited;
console.log('DONE:', cmd.finished, cmd.killed, cmd.exitCode, cmd.signalCode)
