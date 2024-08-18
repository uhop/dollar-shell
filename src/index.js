'use strict';

import backQuote from './back-quote.js';

let mod;
if (typeof Deno !== 'undefined') {
  mod = await import('./deno/spawn.js');
} else if (typeof Bun !== 'undefined') {
  mod = await import('./bun/spawn.js');
} else {
  mod = await import('./node/spawn.js');
}
export const spawn = mod.spawn;

export const $$ = backQuote(spawn);

export const $ = backQuote((command, options) => {
  const sp = spawn(command, options);
  return sp.exited.then(() => ({code: sp.exitCode, signal: sp.signalCode, killed: sp.killed}));
});

export const fromShell = backQuote((command, options) => {
  const sp = spawn(command, Object.assign({}, options, {stdout: 'pipe'}));
  return sp.stdout;
});

export const toShell = backQuote((command, options) => {
  const sp = spawn(command, Object.assign({}, options, {stdin: 'pipe'}));
  return sp.stdin;
});

export const sh = backQuote((command, options) => {
  const sp = spawn(command, Object.assign({}, options, {stdin: 'pipe', stdout: 'pipe'}));
  return {readable: sp.stdout, writable: sp.stdin};
});

export default $;
