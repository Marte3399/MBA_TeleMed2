/**
 * CONFIGURAÇÃO DO JEST PARA TESTES UNITÁRIOS
 * Sistema de Telemedicina - Tarefa 2
 */

module.exports = {
  // Ambiente de teste
  testEnvironment: 'jsdom',
  
  // Padrão de arquivos de teste
  testMatch: [
    '**/tests/unit/**/*.test.js'
  ],
  
  // Configuração de cobertura
  collectCoverage: true,
  coverageDirectory: 'tests/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Arquivos para análise de cobertura
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/supabase.js', // Excluir configuração do Supabase
    '!**/node_modules/**'
  ],
  
  // Setup de testes
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
  
  // Mocks globais
  globals: {
    'supabase': {
      from: jest.fn()
    }
  },
  
  // Transformações
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Módulos a serem ignorados
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/'
  ],
  
  // Timeout para testes assíncronos
  testTimeout: 10000,
  
  // Configuração de verbose
  verbose: true,
  
  // Limpar mocks entre testes
  clearMocks: true,
  
  // Restaurar mocks após cada teste
  restoreMocks: true
};