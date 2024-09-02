type SpawnStreamState = 'piped' | 'ignore' | 'inherit' | 'pipe' | null;

interface SpawnOptions {
  cwd?: string;
  env?: {[key: string]: string | undefined};
  stdin?: SpawnStreamState;
  stdout?: SpawnStreamState;
  stderr?: SpawnStreamState;
}

interface Subprocess {
  readonly command: string[];
  readonly options: SpawnOptions | undefined;
  readonly exited: Promise<number>;
  readonly finished: boolean;
  readonly killed: boolean;
  readonly exitCode: number | null;
  readonly signalCode: string | null;
  readonly stdin: WritableStream<string> | null;
  readonly stdout: ReadableStream<string> | null;
  readonly stderr: ReadableStream<string> | null;
  kill(): void;
}

export declare function spawn(command: string[], options?: SpawnOptions): Subprocess;

export declare function cwd(): string;
export declare function currentExecPath(): string;
export declare const runFileArgs: string[];

interface shellEscapeOptions {
  shell?: string;
}

export declare function shellEscape(s: {toString(): string}, options?: shellEscapeOptions): string;

export declare function currentShellPath(): string;
export declare function buildShellCommand(shell: string | undefined, args: string[] | undefined, command: string): string[];

type backticks<R> = (strings: TemplateStringsArray, ...args: unknown[]) => R;

interface Dollar<R, O = SpawnOptions> extends backticks<R> {
  (options: O): backticks<R>;
}

export const $$: Dollar<Subprocess>;

interface DollarResult {
  code: number | null;
  signal: string | null;
  killed: boolean;
}

interface DuplexPair {
  readable: ReadableStream<string>;
  writable: WritableStream<string>;
}

interface DollarImpl extends Dollar<Promise<DollarResult>> {
  from: Dollar<ReadableStream<string>>;
  to: Dollar<WritableStream<string>>;
  through: Dollar<DuplexPair>;
  io: Dollar<DuplexPair>;
}

export declare const $: DollarImpl;

interface ShellOptions extends SpawnOptions {
  shellPath?: string;
  shellArgs?: string[];
}

export declare const shell: Dollar<Subprocess, ShellOptions>;

interface ShellImpl extends Dollar<Promise<DollarResult>, ShellOptions> {
  from: Dollar<ReadableStream<string>, ShellOptions>;
  to: Dollar<WritableStream<string>, ShellOptions>;
  through: Dollar<DuplexPair, ShellOptions>;
  io: Dollar<DuplexPair, ShellOptions>;
}

export declare const $sh: ShellImpl;

export default $;
