/// <reference types="node" />
import type {Readable, Writable} from 'node:stream';
import type {
  SpawnStreamState,
  SpawnOptions,
  ShellEscapeOptions,
  DollarResult,
  ShellOptions
} from '../index.js';

// The stream-free half of the public API is identical to the main entry — reuse it verbatim.
export type {SpawnStreamState, SpawnOptions, ShellEscapeOptions, DollarResult, ShellOptions};
export {
  cwd,
  currentExecPath,
  runFileArgs,
  isWindows,
  raw,
  winCmdEscape,
  shellEscape,
  currentShellPath,
  buildShellCommand
} from '../index.js';

/**
 * Object with readable and writable Node streams. It can be used as a duplex stream.
 */
interface DuplexPair {
  /**
   * The readable stream.
   */
  readable: Readable;
  /**
   * The writable stream.
   */
  writable: Writable;
}

/**
 * Sub-process object. Identical to the main entry's `Subprocess`, except the standard
 * streams are Node streams ([`Readable`]/[`Writable`]) instead of Web streams.
 */
export interface Subprocess {
  /**
   * The raw command that was run as an array of strings.
   */
  readonly command: string[];
  /**
   * The options that were passed to `spawn()`.
   */
  readonly options: SpawnOptions | undefined;
  /**
   * The promise that will be resolved with the exit code when the process exits.
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
   * The standard input stream as a Node `Writable`.
   * It is `null` if `options.stdin` was not set to `'pipe'`.
   */
  readonly stdin: Writable | null;
  /**
   * The standard output stream as a Node `Readable`.
   * It is `null` if `options.stdout` was not set to `'pipe'`.
   */
  readonly stdout: Readable | null;
  /**
   * The standard error stream as a Node `Readable`.
   * It is `null` if `options.stderr` was not set to `'pipe'`.
   */
  readonly stderr: Readable | null;
  /**
   * A duplex pair `{readable: this.stdout, writable: this.stdin}`.
   */
  readonly asDuplex: DuplexPair;
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
 * Backticks (tag) function.
 */
type Backticks<R> = (strings: TemplateStringsArray, ...args: unknown[]) => R;

/**
 * The type of the $ (tag) function. It can be used as a tag function for a template string,
 * or it can take an options object and return self with updated defaults.
 */
interface Dollar<R, O = SpawnOptions> extends Backticks<R> {
  (options: O): Dollar<R, O>;
}

/**
 * `$$` (tag) function: spawns a process and returns a {@link Subprocess}.
 */
export declare const $$: Dollar<Subprocess>;

/**
 * The type of the {@link $} function.
 */
export interface DollarImpl extends Dollar<Promise<DollarResult>> {
  /**
   * Returns the `stdout` of the process as a Node `Readable`.
   */
  from: Dollar<Readable>;
  /**
   * Returns the `stdin` of the process as a Node `Writable`.
   */
  to: Dollar<Writable>;
  /**
   * Returns the `stdin`/`stdout` of the process as a {@link DuplexPair}. Alias of `io`.
   */
  through: Dollar<DuplexPair>;
  /**
   * Returns the `stdin`/`stdout` of the process as a {@link DuplexPair}. Alias of `through`.
   */
  io: Dollar<DuplexPair>;
}

/**
 * The `$` function with custom properties (`from`, `to`, `through`, `io`). Used as a tag
 * function it spawns a process and resolves to a simplified result. It is the default export.
 */
export declare const $: DollarImpl;

/**
 * The shell tag function: runs a command through a shell and returns a {@link Subprocess}.
 */
export declare const shell: Dollar<Subprocess, ShellOptions>;
/**
 * An alias of `shell`.
 */
export declare const sh: typeof shell;

/**
 * The type of the `$sh` function.
 */
export interface ShellImpl extends Dollar<Promise<DollarResult>, ShellOptions> {
  /**
   * Returns the `stdout` of the shell process as a Node `Readable`.
   */
  from: Dollar<Readable, ShellOptions>;
  /**
   * Returns the `stdin` of the shell process as a Node `Writable`.
   */
  to: Dollar<Writable, ShellOptions>;
  /**
   * Returns the `stdin`/`stdout` of the shell process as a {@link DuplexPair}. Alias of `io`.
   */
  through: Dollar<DuplexPair, ShellOptions>;
  /**
   * Returns the `stdin`/`stdout` of the shell process as a {@link DuplexPair}. Alias of `through`.
   */
  io: Dollar<DuplexPair, ShellOptions>;
}

/**
 * The `$sh` function with custom properties (`from`, `to`, `through`, `io`). Used as a tag
 * function it runs a shell command and resolves to a simplified result.
 */
export declare const $sh: ShellImpl;

export default $;
