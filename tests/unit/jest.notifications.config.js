/**
 * Configuração Jest para Testes de Notificações Multi-Canal
 * Configuração específica para testar o sistema de notificações da Tarefa 7
 */

module.exports = {
    // Diretório raiz do projeto
    rootDir: '../../',
    
    // Ambiente de teste
    testEnvironment: 'jsdom',
    
    // Padrão de arquivos de teste
    testMatch: [
        '<rootDir>/tests/unit/multi-channel-notifications.test.js'
    ],
    
    // Configuração de cobertura
    collectCoverage: true,
    coverageDirectory: '<rootDir>/tests/coverage/notifications',
    coverageReporters: ['text', 'lcov', 'html'],
    
    // Arquivos para análise de cobertura
    collectCoverageFrom: [
        '<rootDir>/js/queue.js',
        '<rootDir>/js/payments.js'
    ],
    
    // Thresholds de cobertura (desabilitado temporariamente)
    // coverageThreshold: {
    //     global: {
    //         branches: 80,
    //         functions: 85,
    //         lines: 85,
    //         statements: 85
    //     }
    // },
    
    // Setup de testes
    setupFilesAfterEnv: ['<rootDir>/tests/unit/setup-notifications.js'],
    
    // Mocks globais
    globals: {
        'window': {},
        'document': {},
        'navigator': {},
        'localStorage': {},
        'sessionStorage': {}
    },
    
    // Transformações
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    
    // Módulos a serem ignorados
    modulePathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/dist/'
    ],
    
    // Configuração de timeout
    testTimeout: 10000,
    
    // Configuração de reporters
    reporters: [
        'default',
        ['jest-html-reporters', {
            publicPath: './tests/reports/notifications',
            filename: 'notifications-test-report.html',
            expand: true,
            hideIcon: false,
            pageTitle: 'Relatório de Testes - Notificações Multi-Canal'
        }]
    ],
    
    // Configuração de mock
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    
    // Configuração de verbose
    verbose: true,
    
    // Configuração de bail (parar nos primeiros erros)
    bail: false,
    
    // Configuração de cache
    cache: true,
    cacheDirectory: '<rootDir>/tests/.jest-cache',
    
    // Configuração de watch
    watchPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/tests/coverage/',
        '<rootDir>/tests/reports/'
    ]
};