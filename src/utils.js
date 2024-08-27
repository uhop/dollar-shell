'use strict';

let getEnv, isWindows, isAndroid;
if (typeof Deno !== 'undefined') {
  getEnv = name => Deno.env.get(name);
  isWindows = Deno.build.os === 'windows';
  isAndroid = Deno.build.os === 'android';
} else if (typeof Bun !== 'undefined') {
  getEnv = name => Bun.env[name];
  isWindows = process.platform === 'win32';
  isAndroid = process.platform === 'android';
} else {
  getEnv = name => process.env[name];
  isWindows = process.platform === 'win32';
  isAndroid = process.platform === 'android';
}
export {getEnv, isWindows, isAndroid};
