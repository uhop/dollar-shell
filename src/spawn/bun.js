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
    this.finished = false;

    const spawnOptions = {};
    if (options.windowsVerbatimArguments) spawnOptions.windowsVerbatimArguments = true;
    options.cwd && (spawnOptions.cwd = options.cwd);
    options.env && (spawnOptions.env = options.env);

    spawnOptions.stdin = sanitize(options.stdin);
    spawnOptions.stdout = sanitize(options.stdout);
    spawnOptions.stderr = sanitize(options.stderr);

    this.spawnOptions = spawnOptions;

    try {
      this.childProcess = Bun.spawn(command, spawnOptions);
    } catch (error) {
      this.childProcess = null;
      this.finished = true;
      this.exited = Promise.reject(error);
      this.stdin = null;
      this.stdout = null;
      this.stderr = null;
      return;
    }
    this.exited = this.childProcess.exited.then(code => {
      this.finished = true;
      return code;
    });

    // @ts-expect-error TODO: Bun's `FileSink` is not a Web Streams `UnderlyingSink` —
    // `start`/`write` happen to line up but `close` does not (FileSink uses `end`),
    // so closing this WritableStream won't signal EOF to the child process.
    this.stdin = this.childProcess.stdin ? new WritableStream(this.childProcess.stdin) : null;
    this.stdout = this.childProcess.stdout || null;
    this.stderr = this.childProcess.stderr || null;
  }

  get exitCode() {
    return this.childProcess ? this.childProcess.exitCode : null;
  }

  get signalCode() {
    return this.childProcess ? this.childProcess.signalCode : null;
  }

  get asDuplex() {
    return {readable: this.stdout, writable: this.stdin};
  }

  kill() {
    this.killed = true;
    this.childProcess.kill();
  }
}

export const currentExecPath = () => process.execPath;
export const runFileArgs = ['run'];

export const cwd = () => process.cwd();

const bunSpawn = (command, options = {}) => new Subprocess(command, options);
export {bunSpawn as spawn};
