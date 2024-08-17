'use strict';

import {spawn} from 'dollar-shell';

const cmd = spawn(['ls', '-l', '-a', 'src'], {stdout: 'inherit', stderr: 'inherit'});
console.log(cmd.stdin, cmd.stdout, cmd.stderr);

await cmd.exited;
console.log('DONE:', cmd.killed, cmd.exitCode, cmd.signalCode)
