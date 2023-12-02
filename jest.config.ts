import type { Config } from '@jest/types';

const esModules = ['d3', 'd3-array'].join('|');

const config: Config.InitialOptions = {
    moduleNameMapper: {
        '^d3$': '<rootDir>/node_modules/d3/dist/d3.min.js',
    },
    verbose: true,
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
};
export default config;