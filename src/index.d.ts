type SpawnStreamStatus = 'piped' | 'ignore' | 'inherit' | 'pipe' | null;

interface SpawnOptions {
  cwd?: string;
  env?: {[key: string]: string | undefined};
  stdin?: SpawnStreamStatus;
  stdout?: SpawnStreamStatus;
  stderr?: SpawnStreamStatus;
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

export function spawn(command: string[], options?: SpawnOptions): Subprocess;

export function cwd(): string;
export function currentExecPath(): string;
export const runFileArgs: string[];

interface shellEscapeOptions {
  shell?: string;
}

export function shellEscape(s: {toString(): string}, options?: shellEscapeOptions): string;

export function currentShellPath(): string;
export function buildShellCommand(shell: string | undefined, args: string[] | undefined, command: string): string[];

interface backticks<R> {
  (strings: TemplateStringsArray, ...args: unknown[]): R;
}

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

export const $: DollarImpl;

interface ShellOptions extends SpawnOptions {
  shellPath?: string;
  shellArgs?: string[];
}

export const shell: Dollar<Subprocess, ShellOptions>;

interface ShellImpl extends Dollar<Promise<DollarResult>, ShellOptions> {
  from: Dollar<ReadableStream<string>, ShellOptions>;
  to: Dollar<WritableStream<string>, ShellOptions>;
  through: Dollar<DuplexPair, ShellOptions>;
  io: Dollar<DuplexPair, ShellOptions>;
}

export const $sh: ShellImpl;

export default $;
