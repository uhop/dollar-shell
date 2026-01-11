import {fileURLToPath} from 'node:url';

import {spawn, currentExecPath, runFileArgs} from 'dollar-shell';

const program = fileURLToPath(new URL('../data/console.js', import.meta.url)),
  args = [...runFileArgs];

if (typeof Deno == 'object') args.push('--allow-read');

const cmd = spawn([currentExecPath(), ...args, program], {stdout: 'pipe', stderr: 'pipe'});
cmd.stdout.pipeThrough(new TextDecoderStream()).pipeTo(
  new WritableStream({
    write(chunk) {
      console.log('stdout:', chunk.toString());
    }
  })
);
cmd.stderr.pipeThrough(new TextDecoderStream()).pipeTo(
  new WritableStream({
    write(chunk) {
      console.log('stderr:', chunk.toString());
    }
  })
);

await cmd.exited;
console.log('DONE:', cmd.finished, cmd.killed, cmd.exitCode, cmd.signalCode);
