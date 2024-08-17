'use strict';

import {spawn} from 'dollar-shell';

const cmd = spawn(['ls', '-l', '-a', 'src'], {stdout: 'inherit', stderr: 'inherit'});

await cmd.exited;
console.log('DONE:', cmd.finished, cmd.killed, cmd.exitCode, cmd.signalCode)
