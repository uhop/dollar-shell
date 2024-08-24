'use strict';

const sanitize = (value, defaultValue = 'ignore') => {
  switch (value) {
    case 'pipe':
    case 'ignore':
    case 'inherit':
      return value;
    case 'piped':
      return 'pipe';
    case null:
      return 'ignore';
  }
  return defaultValue;
};

class Subprocess {
  constructor(command, options) {
    this.command = command;
    this.options = options;

    this.killed = false;

    const spawnOptions = {};
    options.cwd && (spawnOptions.cwd = options.cwd);
    options.env && (spawnOptions.env = options.env);

    spawnOptions.stdin = sanitize(options.stdin);
    spawnOptions.stdout = sanitize(options.stdout);
    spawnOptions.stderr = sanitize(options.stderr);

    this.spawnOptions = spawnOptions;

    this.childProcess = Bun.spawn(command, spawnOptions);

    this.stdin = this.childProcess.stdin ? new WritableStream(this.childProcess.stdin) : null;
    this.stdout = this.childProcess.stdout || null;
    this.stderr = this.childProcess.stderr || null;
  }

  get exited() {
    return this.childProcess.exited;
  }

  get finished() {
    return this.childProcess.killed;
  }

  get exitCode() {
    return this.childProcess.exitCode;
  }

  get signalCode() {
    return this.childProcess.signalCode;
  }

  kill() {
    this.killed = true;
    this.childProcess.kill();
  }
}

export const currentExecPath = () => process.execPath;
export const runFileArgs = ['run'];

// Bun doesn't run on Windows as of now. It can run on WSL.
export const currentShellPath = () => (process.platform === 'win32' ? Bun.env.ComSpec || 'cmd.exe' : Bun.env.SHELL || '/bin/sh');
export const shellArgs = process.platform === 'win32' ? ['/d', '/s', '/c'] : ['-c'];

export const cwd = () => process.cwd();

const bunSpawn = (command, options = {}) => new Subprocess(command, options);
export {bunSpawn as spawn};
