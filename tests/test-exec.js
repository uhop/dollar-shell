'use strict';

import test from 'tape-six';

import {$$, shell, currentExecPath, runFileArgs, raw} from 'dollar-shell';

import {fileURLToPath} from 'node:url';

const program = fileURLToPath(new URL('./data/args-json.js', import.meta.url));

test('Running JS with spawn()', t => {
  const cp = $$({stdout: 'pipe'})`${currentExecPath()} ${program} ${raw(runFileArgs.join(' '))} 123`;
  t.deepEqual(cp.command, [t.any, ...runFileArgs, t.any, '123']);

  const decoder = new TextDecoder();
  let result = '';

  return new Promise(resolve => {
    cp.stdout.pipeTo(new WritableStream({
      write(chunk) {
        result += decoder.decode(chunk);
      },
      async close() {
        await cp.exited;
        const objects = result.split('\n').map(line => line && JSON.parse(line));
        t.ok(objects.length >= 2);
        t.equal(objects[2], '123');
        resolve();
      }
    }));
  });
});

test('Running JS with shell', t => {
  const cp = shell({stdout: 'pipe'})`${currentExecPath()} ${program} ${raw(runFileArgs.join(' '))} 123`;

  const decoder = new TextDecoder();
  let result = '';

  return new Promise(resolve => {
    cp.stdout.pipeTo(new WritableStream({
      write(chunk) {
        result += decoder.decode(chunk);
      },
      async close() {
        await cp.exited;
        const objects = result.split('\n').map(line => line && JSON.parse(line));
        t.ok(objects.length >= 2);
        t.equal(objects[2], '123');
        resolve();
      }
    }));
  });
});
