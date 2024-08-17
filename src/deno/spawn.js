'use strict';

const sanitize = (value, defaultValue = 'null') => {
  switch (value) {
    case 'pipe':
    case 'piped':
      return 'piped';
    case 'ignore':
    case null:
      return 'null';
    case 'inherit':
      return value;
  }
  return defaultValue;
};

class Subprocess {
  constructor(command, options) {
    this.command = command;
    this.options = options;

    this.exitCode = null;
    this.signalCode = null;
    this.killed = false;

    this.controller = new AbortController();

    const spawnOptions = {signal: this.controller.signal, args: command.slice(1)};
    options.cwd && (spawnOptions.cwd = options.cwd);
    options.env && (spawnOptions.env = options.env);

    spawnOptions.stdin = sanitize(options.stdin);
    spawnOptions.stdout = sanitize(options.stdout);
    spawnOptions.stderr = sanitize(options.stderr);

    this.spawnOptions = spawnOptions;

    this.childProcess = new Deno.Command(command[0], spawnOptions).spawn();

    this.exited = this.childProcess.status.then(status => {
      this.exitCode = status.code;
      this.signalCode = status.signal;
      return status.code;
    });
  }

  get stdin() {
    return this.spawnOptions.stdin === 'piped' ? this.childProcess.stdin : null;
  }

  get stdout() {
    return this.spawnOptions.stdout === 'piped' ? this.childProcess.stdout : null;
  }

  get stderr() {
    return this.spawnOptions.stderr === 'piped' ? this.childProcess.stderr : null;
  }

  kill() {
    this.killed = true;
    this.controller.abort();
  }
}

const denoSpawn = (command, options = {}) => new Subprocess(command, options);

export {denoSpawn as spawn};
