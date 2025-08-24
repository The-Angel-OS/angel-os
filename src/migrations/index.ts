import * as migration_20250818_185234 from './20250818_185234';
import * as migration_20250819_002627 from './20250819_002627';
import * as migration_20250819_013345 from './20250819_013345';

export const migrations = [
  {
    up: migration_20250818_185234.up,
    down: migration_20250818_185234.down,
    name: '20250818_185234',
  },
  {
    up: migration_20250819_002627.up,
    down: migration_20250819_002627.down,
    name: '20250819_002627',
  },
  {
    up: migration_20250819_013345.up,
    down: migration_20250819_013345.down,
    name: '20250819_013345',
  },
];
