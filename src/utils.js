'use strict';

export const escapeArgument = arg => {
  arg = String(arg);
  const escaped = arg.replace("'", "'\\''");
  return escaped !== arg ? "'" + escaped + "'" : arg;
};
