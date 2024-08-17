'use strict';

let mod;

if (typeof Deno !== 'undefined') {
  mod = await import('./deno/spawn.js');
} else if (typeof Bun !== 'undefined') {
  mod = await import('./bun/spawn.js');
} else {
  mod = await import('./node/spawn.js');
}

export const spawn = mod.spawn;
