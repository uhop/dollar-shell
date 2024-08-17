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
  }

  get exited() {
    return this.childProcess.exited;
  }

  get exitCode() {
    return this.childProcess.exitCode;
  }

  get signalCode() {
    return this.childProcess.signalCode;
  }

  get stdin() {
    return this.childProcess.stdin || null;
  }

  get stdout() {
    return this.childProcess.stdout || null;
  }

  get stderr() {
    return this.childProcess.stderr || null;
  }

  kill() {
    this.killed = true;
    this.childProcess.kill();
  }
}

const bunSpawn = (command, options = {}) => new Subprocess(command, options);

export {bunSpawn as spawn};
