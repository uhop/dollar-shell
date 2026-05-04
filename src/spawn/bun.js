/**
 * Adapt Bun's `FileSink` to a Web Streams `UnderlyingSink`. `FileSink` exposes
 * `write`/`end` (close + flush) but no `close`/`abort` matching the spec, so
 * `new WritableStream(fileSink)` would only work because of an undocumented
 * runtime `.close` alias. This adapter sticks to the documented `.end` API.
 *
 * @param {import('bun').FileSink} sink
 * @returns {UnderlyingSink}
 */
const makeStdinSink = sink => ({
  async write(/** @type {any} */ chunk) {
    await sink.write(chunk);
  },
  async close() {
    await sink.end();
  },
  async abort(reason) {
    await sink.end(reason instanceof Error ? reason : new Error(String(reason)));
  }
});

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

    const stdinSink = this.childProcess.stdin;
    this.stdin =
      stdinSink && typeof stdinSink !== 'number'
        ? new WritableStream(makeStdinSink(stdinSink))
        : null;
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
