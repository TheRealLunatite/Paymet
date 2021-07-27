const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig')

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots : ['<rootDir>'],
  modulePaths : ['<rootDir>'],
  moduleNameMapper : pathsToModuleNameMapper(compilerOptions.paths),
  setupFilesAfterEnv : ['<rootDir>/jest.setup.ts']
};