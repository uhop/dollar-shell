'use strict';

import {spawn} from 'node:child_process';

// const cp = spawn('cmd.exe', ['/d', '/s', '/c', 'echo', '1"23'], {stdio: 'inherit', windowsVerbatimArguments: true});

// WORKS
// const cp = spawn(
//   'cmd.exe',
//   [
//     '/d',
//     '/s',
//     '/c',
//     'echo ^a^"^ ^ ^b'
//     // [
//     // '"C:\\Program Files\\nodejs\\node.exe"'.replace(/./g, '^$&'),
//     // '"tests\\manual\\argv.js"'.replace(/./g, '^$&'),
//     // '"a  b"'.replace(/./g, '^$&'),
//     // `^"a""b^"`
//     // ].join(' ')
//   ],
//   {stdio: 'inherit', windowsVerbatimArguments: true}
// );

// WORKS
const cp = spawn(
  'pwsh.exe',
  [
    '-c',
    [
    'C:\\Program Files\\nodejs\\node.exe'.replace(/[\W]/g, '`$&'),
    'tests\\manual\\argv.js'.replace(/[\W]/g, '`$&'),
    'a  b `\'"#$x@;&~'.replace(/[\W]/g, c => c === '"' ? '`\\"' : ('`' + c))
    ].join(' ')
  ],
  {stdio: 'inherit', windowsVerbatimArguments: true}
);

// const cp = spawn(
//   'pwsh.exe',
//   [
//     '-c',
//     [
//       // 'echo',
//       '&',
//       'C:\\Program Files\\nodejs\\node.exe'.replace(/[\W]/g, '`$&'),
//       // '@\'\nC:\\Program Files\\nodejs\\node.exe\n\'@',
//       '@\'\ntests\\manual\\argv.js\n\'@',
//       '@\'\na  b `\'\\"#$x@;&~\n\'@'
//     ].join(' ')
//   ],
//   {stdio: 'inherit', windowsVerbatimArguments: true}
// );

cp.on('exit', (code, signal) => console.log('Done:', code, signal));
cp.on('error', error => console.error('Error:', error));

// import {spawn, currentExecPath, currentShellPath} from 'dollar-shell';
// import { toBase64 } from 'dollar-shell/utils.js';

// console.log('currentExecPath:', currentExecPath());
// console.log('currentShellPath:', currentShellPath());

// // cmd

// // const cmd = spawn(['cmd.exe', '/d', '/s', '/c', `echo 1^"23`], {stdout: 'inherit', stderr: 'inherit'});
// // const cmd = spawn(['cmd.exe', '/d', '/s', '/c', `node tests\\manual\\argv.js ^"a  b^"`], {stdout: 'inherit', stderr: 'inherit'});
// const cmd = spawn([currentShellPath(), '/d', '/s', '/c', `${currentExecPath().replace(/./g, '^$&')}`, 'tests\\manual\\argv.js', "a  b",  "a \\\" b", "\\c\\"], {stdout: 'inherit', stderr: 'inherit'});

// // node

// // const cmd = spawn([currentExecPath(), 'tests\\manual\\argv.js', "a  b",  "a \\\" b", "\\c\\"], {stdout: 'inherit', stderr: 'inherit'});

// // pwsh

// // const cmd = spawn(['pwsh', '-e', toBase64(`"${currentExecPath()}\\" tests\\manual\\argv.js "a  b",  "a \\\" b", "\\c\\"`)], {stdout: 'inherit', stderr: 'inherit'});

// await cmd.exited;
