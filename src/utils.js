'use strict';

let getEnv;
if (typeof Deno !== 'undefined') {
  getEnv = name => Deno.env.get(name);
} else if (typeof Bun !== 'undefined') {
  getEnv = name => Bun.env[name];
} else {
  getEnv = name => process.env[name];
}
export {getEnv};
