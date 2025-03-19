import * as migration_20250319_152401 from './20250319_152401';

export const migrations = [
  {
    up: migration_20250319_152401.up,
    down: migration_20250319_152401.down,
    name: '20250319_152401'
  },
];
