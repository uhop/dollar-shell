/**
 * State of a standard stream.
 */
export type SpawnStreamState = 'pipe' | 'ignore' | 'inherit' | 'piped' | null;

/**
 * Options to configure the process.
 */
export interface SpawnOptions {
  /**
   * The working directory for the child process.
   */
  cwd?: string;
  /**
   * Environment variables for the child process. Otherwise the current process environment is used.
   */
  env?: {[key: string]: string | undefined};
  /**
   * State of the standard input stream.
   */
  stdin?: SpawnStreamState;
  /**
   * State of the standard output stream.
   */
  stdout?: SpawnStreamState;
  /**
   * State of the standard error stream.
   */
  stderr?: SpawnStreamState;
}

/**
 * Sub-process object.
 */
export interface Subprocess<R = any> {
  /**
   * The raw command that was run as an array of strings.
   */
  readonly command: string[];
  /**
   * The options that were passed to `spawn()`.
   */
  readonly options: SpawnOptions | undefined;
  /**
   * The promise that will be resolved when the process exits.
   * It returns the exit code of the process: `exitCode`.
   */
  readonly exited: Promise<number>;
  /**
   * Whether the process has finished running.
   */
  readonly finished: boolean;
  /**
   * Whether the process was killed when finished.
   */
  readonly killed: boolean;
  /**
   * The exit code of the process when it was finished.
   */
  readonly exitCode: number | null;
  /**
   * The signal code of the process when it was finished.
   */
  readonly signalCode: string | null;
  /**
   * The standard input stream.
   * It is `null` if `options.stdin` was not set to `'pipe'`.
   */
  readonly stdin: WritableStream<R> | null;
  /**
   * The standard output stream.
   * It is `null` if `options.stdout` was not set to `'pipe'`.
   */
  readonly stdout: ReadableStream<R> | null;
  /**
   * The standard error stream.
   * It is `null` if `options.stderr` was not set to `'pipe'`.
   */
  readonly stderr: ReadableStream<R> | null;
  /**
   * Kill the process.
   */
  kill(): void;
}

/**
 * Spawn a process with advanced ways to configure and control it.
 */
export declare function spawn(command: string[], options?: SpawnOptions): Subprocess;

/**
 * The current working directory.
 */
export declare function cwd(): string;

/**
 * The path of the current executable (Node, Deno, Bun, etc).
 */
export declare function currentExecPath(): string;

/**
 * The arguments that should be passed to run the current executable.
 * They don't include any permission options.
 */
export declare const runFileArgs: string[];

/**
 * The function marks a value as raw. The value will be passed as-is to the shell.
 * It is used to bypass the default shell escaping rules.
 */
export declare function raw(value: unknown): object;

/**
 * The function escapes the value for the Windows command line using an alternative method.
 * See the documentation.
 */
export declare function winCmdEscape(value: unknown): object | string;

/**
 * Escape configuration options.
 */
export interface ShellEscapeOptions {
  /**
   * Specify the path of the shell to use. Defaults to `currentShellPath()`.
   */
  shellPath?: string;
}

/**
 * Escapes a value using the specified options.
 */
export declare function shellEscape(value: {toString(): string}, options?: ShellEscapeOptions): string;

/**
 * The path of the current shell.
 */
export declare function currentShellPath(): string;

/**
 * Builds a shell command from a command using the `shell` and its `args`.
 */
export declare function buildShellCommand(shell: string | undefined, args: string[] | undefined, command: string): string[];

/**
 * Backticks (tag) function.
 */
type Backticks<R> = (strings: TemplateStringsArray, ...args: unknown[]) => R;

/**
 * The type of the $ (tag) function. It can be used as a tag function for a template string.
 * Or it can take an options object and return self with updated defaults.
 */
interface Dollar<R, O = SpawnOptions> extends Backticks<R> {
  /**
   * The function can take an options object and return self with updated defaults.
   */
  (options: O): Dollar<R, O>;
}

/**
 * $$ (tag) function that parses the template string, spawns a process and returns a sub-process object.
 * It can take an option object and return self with updated defaults.
 */
export declare const $$: Dollar<Subprocess>;

/**
 * Object with simplified result of the process.
 */
export interface DollarResult {
  /**
   * The exit code of the process.
   */
  code: number | null;
  /**
   * The signal code of the process.
   */
  signal: string | null;
  /**
   * Whether the process was killed.
   */
  killed: boolean;
}

/**
 * Object with readable and writable streams. It can be used as a duplex stream.
 */
interface DuplexPair<R = any> {
  /**
   * The readable stream.
   */
  readable: ReadableStream<R>;
  /**
   * The writable stream.
   */
  writable: WritableStream<R>;
}

/**
 * The type of the {@link $} function.
 */
interface DollarImpl<R = any> extends Dollar<Promise<DollarResult>> {
  /**
   * The tag function that can be used as a template string.
   * It can take an options object and return self with updated defaults.
   *
   * The tag function returns the `stdout` stream of the process as a `ReadableStream` .
   */
  from: Dollar<ReadableStream<R>>;

  /**
   * The tag function that can be used as a template string.
   * It can take an options object and return self with updated defaults.
   *
   * The tag function returns the `stdin` stream of the process as a `WritableStream` .
   */
  to: Dollar<WritableStream<R>>;

  /**
   * The tag function that can be used as a template string.
   * It can take an options object and return self with updated defaults.
   *
   * The tag function returns the `stdin` and `stdout` streams of the process as a {@link DuplexPair}.
   *
   * It is an alias of {@link $.io}.
   */
  through: Dollar<DuplexPair<R>>;

  /**
   * The tag function that can be used as a template string.
   * It can take an options object and return self with updated defaults.
   *
   * The tag function returns the `stdin` and `stdout` streams of the process as a {@link DuplexPair}.
   *
   * It is an alias of {@link $.through}.
   */
  io: Dollar<DuplexPair<R>>;
}

/**
 * The $ function with custom properties ({@link $.from}, {@link $.to}, {@link $.through}, {@link $.io}).
 * When used as a tag function with a template string it starts a new process and returns
 * a promise with the simplified result (exit code, signal code, and the "killed" status).
 * Or it can take an options object and return self with updated defaults.
 */
export declare const $: DollarImpl;

/**
 * Options for the shell functions.
 */
export interface ShellOptions extends SpawnOptions {
  /**
   * Specify the path of the shell to use.
   */
  shellPath?: string;
  /**
   * Specify the arguments of the shell.
   */
  shellArgs?: string[];
}

/**
 * The shell function that can be used as a template string.
 * It can take an options object and return self with updated defaults.
 *
 * When used as a tag function with a template string it starts a new process and returns
 * a sub-process object that can be used to control the process.
 */
export declare const shell: Dollar<Subprocess, ShellOptions>;
/**
 * The shell function that can be used as a template string.
 * It can take an options object and return self with updated defaults.
 *
 * When used as a tag function with a template string it starts a new process and returns
 * a sub-process object that can be used to control the process.
 *
 * This is an alias of `shell`.
 */
export declare const sh = shell;

/**
 * The type of the $sh function.
 */
interface ShellImpl<R = any> extends Dollar<Promise<DollarResult>, ShellOptions> {
  /**
   * The tag function that can be used as a template string.
   * It can take an options object and return self with updated defaults.
   *
   * The tag function runs a shell command and returns the `stdout` stream of the process as a `ReadableStream` .
   */
  from: Dollar<ReadableStream<R>, ShellOptions>;

  /**
   * The tag function that can be used as a template string.
   * It can take an options object and return self with updated defaults.
   *
   * The tag function runs a shell command and returns the `stdin` stream of the process as a `WritableStream` .
   */
  to: Dollar<WritableStream<R>, ShellOptions>;

  /**
   * The tag function that can be used as a template string.
   * It can take an options object and return self with updated defaults.
   *
   * The tag function runs a shell command and returns the `stdin` and `stdout` streams of the process as a {@link DuplexPair}.
   *
   * It is an alias of {@link $sh.io}.
   */
  through: Dollar<DuplexPair<R>, ShellOptions>;

  /**
   * The tag function that can be used as a template string.
   * It can take an options object and return self with updated defaults.
   *
   * The tag function runs a shell command and returns the `stdin` and `stdout` streams of the process as a {@link DuplexPair}.
   *
   * It is an alias of {@link $sh.through}.
   */
  io: Dollar<DuplexPair<R>, ShellOptions>;
}

/**
 * The $sh function with custom properties ({@link $sh.from}, {@link $sh.to}, {@link $sh.through}, {@link $sh.io}).
 *
 * When used as a tag function with a template string it starts a new shell process and returns
 * a promise with the simplified result (exit code, signal code, and the "killed" status).
 * Or it can take an options object and return self with updated defaults.
 */
export declare const $sh: ShellImpl;

export default $;
