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

export const verifyStrings = strings => Array.isArray(strings) && strings.every(s => typeof s === 'string');

export const toBase64 = s => {
  // const buf = new TextEncoder().encode(s),
  //   bytes = Array.from(buf, b => String.fromCharCode(b >> 8) + String.fromCharCode(b & 0xFF)).join('');
  const bytes = Array.from(s, c => {
    const code = c.charCodeAt(0);
    return String.fromCharCode(code & 0xff) + String.fromCharCode((code >> 8) & 0xff);
  }).join('');
  return btoa(bytes);
};

const rawValueSymbol = Symbol.for('object-stream.raw-value');

export const raw = value => ({[rawValueSymbol]: value});
export const isRawValue = value => value && typeof value === 'object' && rawValueSymbol in value;
export const getRawValue = value => value[rawValueSymbol];

export const winCmdEscape = isWindows ? value => raw(String(value).replace(/./g, '^$&')) : value => String(value);
