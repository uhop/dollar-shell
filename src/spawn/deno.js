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
    this.finished = false;

    this.controller = new AbortController();

    const spawnOptions = {
      signal: this.controller.signal,
      args: command.slice(1)
    };
    if (options.windowsVerbatimArguments) spawnOptions.windowsRawArguments = true;
    options.cwd && (spawnOptions.cwd = options.cwd);
    options.env && (spawnOptions.env = options.env);

    spawnOptions.stdin = sanitize(options.stdin);
    spawnOptions.stdout = sanitize(options.stdout);
    spawnOptions.stderr = sanitize(options.stderr);

    this.spawnOptions = spawnOptions;

    try {
      this.childProcess = new Deno.Command(command[0], spawnOptions).spawn();
    } catch (error) {
      this.childProcess = null;
      this.finished = true;
      this.exited = Promise.reject(error);
      return;
    }

    this.exited = this.childProcess.status
      .then(status => {
        this.finished = true;
        this.exitCode = status.code;
        this.signalCode = status.signal;
        return status.code;
      })
      .catch(error => {
        this.finished = true;
        return Promise.reject(error);
      });
  }

  get stdin() {
    return this.childProcess && this.spawnOptions.stdin === 'piped'
      ? this.childProcess.stdin
      : null;
  }

  get stdout() {
    return this.childProcess && this.spawnOptions.stdout === 'piped'
      ? this.childProcess.stdout
      : null;
  }

  get stderr() {
    return this.childProcess && this.spawnOptions.stderr === 'piped'
      ? this.childProcess.stderr
      : null;
  }

  get asDuplex() {
    return {readable: this.stdout, writable: this.stdin};
  }

  kill() {
    this.killed = true;
    this.controller.abort();
  }
}

export const currentExecPath = () => Deno.execPath();
export const runFileArgs = ['run'];

export const cwd = () => Deno.cwd();

const denoSpawn = (command, options = {}) => new Subprocess(command, options);
export {denoSpawn as spawn};
