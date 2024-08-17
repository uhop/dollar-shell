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

export default $;
