import * as migration_20261007_103004_baseline from './20261007_103004_baseline'
import * as migration_20261007_103126_enterprise from './20261007_103126_enterprise'
import * as migration_20261009_075405_resources_navigation from './20261009_075405_resources_navigation'

export const migrations = [
  {
    up: migration_20261007_103004_baseline.up,
    down: migration_20261007_103004_baseline.down,
    name: '20261007_103004_baseline',
  },
  {
    up: migration_20261007_103126_enterprise.up,
    down: migration_20261007_103126_enterprise.down,
    name: '20261007_103126_enterprise',
  },
  {
    up: migration_20261009_075405_resources_navigation.up,
    down: migration_20261009_075405_resources_navigation.down,
    name: '20261009_075405_resources_navigation',
  },
]
