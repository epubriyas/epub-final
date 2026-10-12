import * as migration_20261007_103004_baseline from './20261007_103004_baseline'
import * as migration_20261007_103126_enterprise from './20261007_103126_enterprise'
import * as migration_20261009_075405_resources_navigation from './20261009_075405_resources_navigation'
import * as migration_20261011_111342_services_premium from './20261011_111342_services_premium'
import * as migration_20261011_123958_portfolio_samples from './20261011_123958_portfolio_samples'

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
  {
    up: migration_20261011_111342_services_premium.up,
    down: migration_20261011_111342_services_premium.down,
    name: '20261011_111342_services_premium',
  },
  {
    up: migration_20261011_123958_portfolio_samples.up,
    down: migration_20261011_123958_portfolio_samples.down,
    name: '20261011_123958_portfolio_samples',
  },
]
