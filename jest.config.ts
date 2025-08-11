import type { Config } from 'jest'

const config: Config = {
  reporters: [
    'default',
    [
      'tdd-guard-jest',
      {
        projectRoot: '/home/tinpavlic1/claude-projects/ChecklistApp',
      },
    ],
  ],
}

export default config