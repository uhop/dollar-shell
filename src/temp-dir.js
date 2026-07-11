import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

export const withTempDir = async (fn, options) => {
  const dir = await mkdtemp(join(tmpdir(), options?.prefix ?? 'dsh-'));
  let done = false;
  try {
    const result = await fn(dir);
    done = true;
    return result;
  } finally {
    try {
      await rm(dir, {recursive: true, force: true});
    } catch (error) {
      // fn's error wins; a cleanup failure surfaces only on success
      if (done) throw error;
    }
  }
};
