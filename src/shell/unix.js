'use strict';

export const shellEscape = s => "'" + String(s).replace(/'/g, "'\\''") + "'";
