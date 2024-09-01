'use strict';

import {$sh} from '../src/index.js';

// const result = await $sh({shellPath: 'pwsh.exe', stdout: 'inherit', stderr: 'inherit'})`echo "${`hello  \\wor"ld`}  ${'two   three'}"`;
// const result = await $sh({shellPath: 'pwsh.exe', stdout: 'inherit', stderr: 'inherit'})`echo "hello'  \\wor\`\"ld two   three"`;
// const result = await $sh({shellPath: 'pwsh.exe', stdout: 'inherit', stderr: 'inherit'})`echo 'hello\`\'  \\wor\`\"ld two   three"`;
// const result = await $sh({stdout: 'inherit'})`echo hello'  \\wo"rld two   three`;
// const result = await $sh({stdout: 'inherit'})`dir src`; // Windows
const result = await $sh({stdout: 'inherit'})`echo ${'123'}`;
// const result = await $sh({shellArgs: ['-ic'], stdout: 'inherit'})`nvm ls`;
// const result = await $sh({stdout: 'inherit'})`ls -l . | grep LIC | wc`;

console.log(result);

// $sh.from`ls -l .`.pipeThrough($sh.io`grep LIC`).pipeTo($sh.to({stdout: 'inherit'})`wc`);
