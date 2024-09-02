export type SpawnStreamState = 'piped' | 'ignore' | 'inherit' | 'pipe' | null;

export interface SpawnOptions {
  cwd?: string;
  env?: {[key: string]: string | undefined};
  stdin?: SpawnStreamState;
  stdout?: SpawnStreamState;
  stderr?: SpawnStreamState;
}

export interface Subprocess<R = string> {
  readonly command: string[];
  readonly options: SpawnOptions | undefined;
  readonly exited: Promise<number>;
  readonly finished: boolean;
  readonly killed: boolean;
  readonly exitCode: number | null;
  readonly signalCode: string | null;
  readonly stdin: WritableStream<R> | null;
  readonly stdout: ReadableStream<R> | null;
  readonly stderr: ReadableStream<R> | null;
  kill(): void;
}

export declare function spawn(command: string[], options?: SpawnOptions): Subprocess;

export declare function cwd(): string;
export declare function currentExecPath(): string;
export declare const runFileArgs: string[];

export interface ShellEscapeOptions {
  shell?: string;
}

export declare function shellEscape(s: {toString(): string}, options?: ShellEscapeOptions): string;

export declare function currentShellPath(): string;
export declare function buildShellCommand(shell: string | undefined, args: string[] | undefined, command: string): string[];

type Backticks<R> = (strings: TemplateStringsArray, ...args: unknown[]) => R;

interface Dollar<R, O = SpawnOptions> extends Backticks<R> {
  (options: O): Backticks<R>;
}

export declare const $$: Dollar<Subprocess>;

export interface DollarResult {
  code: number | null;
  signal: string | null;
  killed: boolean;
}

interface DuplexPair<R = string> {
  readable: ReadableStream<R>;
  writable: WritableStream<R>;
}

interface DollarImpl<R = string> extends Dollar<Promise<DollarResult>> {
  from: Dollar<ReadableStream<R>>;
  to: Dollar<WritableStream<R>>;
  through: Dollar<DuplexPair<R>>;
  io: Dollar<DuplexPair<R>>;
}

export declare const $: DollarImpl;

export interface ShellOptions extends SpawnOptions {
  shellPath?: string;
  shellArgs?: string[];
}

export declare const shell: Dollar<Subprocess, ShellOptions>;

interface ShellImpl<R = string> extends Dollar<Promise<DollarResult>, ShellOptions> {
  from: Dollar<ReadableStream<R>, ShellOptions>;
  to: Dollar<WritableStream<R>, ShellOptions>;
  through: Dollar<DuplexPair<R>, ShellOptions>;
  io: Dollar<DuplexPair<R>, ShellOptions>;
}

export declare const $sh: ShellImpl;

export default $;
