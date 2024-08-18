'use strict';

import {fromShell, toShell, sh} from 'dollar-shell';

// import process from 'node:process';
// import {Writable} from 'node:stream';

// Bun does not implement `Writable.toWeb()` yet
// and it doesn't provide a simple way to write to `stdout` using web streams
// fromShell`ls -l ${'.'}`.pipeThrough(sh`wc`).pipeTo(Writable.toWeb(process.stdout));
// fromShell`ls -l ${'.'}`.pipeThrough(sh`wc`).pipeTo(new WritableStream(Bun.stdout.writer()));

fromShell`ls -l .`.pipeThrough(sh`grep LIC`).pipeTo(toShell({stdout: 'inherit'})`wc`);
