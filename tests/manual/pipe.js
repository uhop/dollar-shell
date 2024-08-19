'use strict';

import $, {from$, to$, sh} from 'dollar-shell';

import process from 'node:process';
import {Writable} from 'node:stream';

// Bun does not implement `Writable.toWeb()` yet
// and it doesn't provide a simple way to write to `stdout` using web streams
// from$`ls -l ${'.'}`.pipeThrough(sh`wc`).pipeTo(Writable.toWeb(process.stdout));

// Bun:
// from$`ls -l ${'.'}`.pipeThrough(sh`wc`).pipeTo(new WritableStream(Bun.stdout.writer()));

// from$({cwd: '/tmp'})`pwd`.pipeTo(Writable.toWeb(process.stdout));

// await $({stdout: 'inherit'})`ls -l .`;

from$`ls -l .`.pipeThrough(sh`grep LIC`).pipeTo(to$({stdout: 'inherit'})`wc`);
