'use strict';

import {spawn} from 'node:child_process';
import {Readable, Writable} from 'node:stream';

const setStdio = (stdio, fd, value) => {
  switch (value) {
    case 'pipe':
    case 'ignore':
    case 'inherit':
      stdio[fd] = value;
      break;
    case 'piped':
      stdio[fd] = 'pipe';
      break;
    case null:
      stdio[fd] = 'ignore';
      break;
  }
};

class Subprocess {
  constructor(command, options) {
    this.command = command;
    this.options = options;

    this.exitCode = null;
    this.signalCode = null;
    this.killed = false;
    this.finished = false;

    this.controller = new AbortController();

    const spawnOptions = {signal: this.controller.signal, stdio: ['ignore', 'ignore', 'ignore']};
    options.cwd && (spawnOptions.cwd = options.cwd);
    options.env && (spawnOptions.env = options.env);

    setStdio(spawnOptions.stdio, 0, options.stdin);
    setStdio(spawnOptions.stdio, 1, options.stdout);
    setStdio(spawnOptions.stdio, 2, options.stderr);

    this.spawnOptions = spawnOptions;

    this.childProcess = spawn(command[0], command.slice(1), spawnOptions);
    this.childProcess.on('exit', (code, signal) => {
      this.finished = true;
      this.exitCode = code;
      this.signalCode = signal;
      this.resolve(code);
    });
    this.childProcess.on('error', error => {
      this.finished = true;
      this.reject(error);
    });

    this.exited = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    this.stdin = this.childProcess.stdin && Writable.toWeb(this.childProcess.stdin);
    this.stdout = this.childProcess.stdout && Readable.toWeb(this.childProcess.stdout);
    this.stderr = this.childProcess.stderr && Readable.toWeb(this.childProcess.stderr);
  }

  kill() {
    this.killed = true;
    this.controller.abort();
  }
}

export const currentExecPath = () => process.execPath;
export const currentShellPath = () => (process.platform === 'win32' ? process.env.ComSpec || 'cmd.exe' : process.env.SHELL || '/bin/sh');

const nodeSpawn = (command, options = {}) => new Subprocess(command, options);
export {nodeSpawn as spawn};
