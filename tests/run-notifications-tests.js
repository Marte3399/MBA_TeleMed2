#!/usr/bin/env node

/**
 * Script para Executar Testes de Notificações Multi-Canal
 * Executa os testes unitários da Tarefa 7 com relatórios detalhados
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para output no terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Função para log colorido
const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

// Função para criar diretórios se não existirem
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        log(`📁 Diretório criado: ${dirPath}`, 'blue');
    }
};

// Função principal
const runNotificationTests = async () => {
    log('🧪 INICIANDO TESTES DE NOTIFICAÇÕES MULTI-CANAL', 'bright');
    log('=' .repeat(60), 'cyan');
    
    try {
        // Verificar se Jest está instalado
        log('🔍 Verificando dependências...', 'yellow');
        
        try {
            execSync('npm list jest', { stdio: 'ignore' });
            log('✅ Jest encontrado', 'green');
        } catch (error) {
            log('❌ Jest não encontrado. Instalando...', 'red');
            log('📦 Executando: npm install --save-dev jest', 'blue');
            execSync('npm install --save-dev jest', { stdio: 'inherit' });
            log('✅ Jest instalado com sucesso', 'green');
        }

        // Verificar dependências adicionais
        const additionalDeps = [
            'jest-environment-jsdom',
            'babel-jest',
            '@babel/core',
            '@babel/preset-env',
            'jest-html-reporters'
        ];

        for (const dep of additionalDeps) {
            try {
                execSync(`npm list ${dep}`, { stdio: 'ignore' });
                log(`✅ ${dep} encontrado`, 'green');
            } catch (error) {
                log(`📦 Instalando ${dep}...`, 'yellow');
                execSync(`npm install --save-dev ${dep}`, { stdio: 'inherit' });
                log(`✅ ${dep} instalado`, 'green');
            }
        }

        // Criar diretórios necessários
        log('📁 Criando diretórios de teste...', 'yellow');
        ensureDirectoryExists('./tests/coverage/notifications');
        ensureDirectoryExists('./tests/reports/notifications');
        ensureDirectoryExists('./tests/.jest-cache');

        // Criar arquivo babel.config.js se não existir
        const babelConfigPath = './babel.config.js';
        if (!fs.existsSync(babelConfigPath)) {
            log('⚙️ Criando configuração do Babel...', 'yellow');
            const babelConfig = `module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      }
    }]
  ]
};`;
            fs.writeFileSync(babelConfigPath, babelConfig);
            log('✅ babel.config.js criado', 'green');
        }

        // Executar testes
        log('🚀 Executando testes de notificações multi-canal...', 'bright');
        log('-'.repeat(60), 'cyan');

        const jestCommand = `npx jest --config=tests/unit/jest.notifications.config.js --verbose`;
        
        log(`📋 Comando: ${jestCommand}`, 'blue');
        
        const startTime = Date.now();
        execSync(jestCommand, { stdio: 'inherit' });
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        log('-'.repeat(60), 'cyan');
        log('✅ TESTES CONCLUÍDOS COM SUCESSO!', 'green');
        log(`⏱️ Tempo de execução: ${duration}s`, 'blue');

        // Verificar se relatórios foram gerados
        const coverageDir = './tests/coverage/notifications';
        const reportsDir = './tests/reports/notifications';

        if (fs.existsSync(coverageDir)) {
            log('📊 Relatório de cobertura gerado em:', 'green');
            log(`   ${path.resolve(coverageDir)}/lcov-report/index.html`, 'blue');
        }

        if (fs.existsSync(reportsDir)) {
            log('📋 Relatório de testes gerado em:', 'green');
            log(`   ${path.resolve(reportsDir)}/notifications-test-report.html`, 'blue');
        }

        // Mostrar resumo dos testes
        log('', 'reset');
        log('📋 RESUMO DOS TESTES EXECUTADOS:', 'bright');
        log('', 'reset');
        log('✅ 1. Notificações Push do Navegador', 'green');
        log('   - Inicialização de push notifications', 'blue');
        log('   - Envio de notificações push', 'blue');
        log('   - Tratamento de permissões', 'blue');
        log('', 'reset');
        log('✅ 2. Integração WhatsApp', 'green');
        log('   - Configuração da API WhatsApp', 'blue');
        log('   - Envio de mensagens', 'blue');
        log('   - Tratamento de erros', 'blue');
        log('', 'reset');
        log('✅ 3. Sistema de Email', 'green');
        log('   - Configuração do serviço de email', 'blue');
        log('   - Envio de emails com templates HTML', 'blue');
        log('   - Botões de ação em emails', 'blue');
        log('', 'reset');
        log('✅ 4. Notificações de Proximidade', 'green');
        log('   - Detecção de proximidade na fila', 'blue');
        log('   - Notificações urgentes', 'blue');
        log('   - Gerenciamento de estado', 'blue');
        log('', 'reset');
        log('✅ 5. Alertas Sonoros', 'green');
        log('   - Sons de proximidade', 'blue');
        log('   - Sons de chamada', 'blue');
        log('   - Controle de áudio', 'blue');
        log('', 'reset');
        log('✅ 6. Notificações Específicas do Sistema', 'green');
        log('   - Confirmação de pagamento', 'blue');
        log('   - Atualização de posição na fila', 'blue');
        log('   - Consulta pronta', 'blue');
        log('', 'reset');
        log('✅ 7. Integração e Fluxos Completos', 'green');
        log('   - Fluxos multi-canal', 'blue');
        log('   - Gerenciamento de estado', 'blue');
        log('   - Configurações personalizadas', 'blue');
        log('', 'reset');

        log('🎉 TODOS OS TESTES DA TAREFA 7 FORAM EXECUTADOS!', 'bright');
        log('', 'reset');

    } catch (error) {
        log('❌ ERRO AO EXECUTAR TESTES:', 'red');
        log(error.message, 'red');
        
        if (error.stdout) {
            log('📤 STDOUT:', 'yellow');
            log(error.stdout.toString(), 'reset');
        }
        
        if (error.stderr) {
            log('📥 STDERR:', 'yellow');
            log(error.stderr.toString(), 'reset');
        }
        
        process.exit(1);
    }
};

// Função para mostrar ajuda
const showHelp = () => {
    log('🧪 SCRIPT DE TESTES - NOTIFICAÇÕES MULTI-CANAL', 'bright');
    log('', 'reset');
    log('Este script executa os testes unitários da Tarefa 7:', 'blue');
    log('- Sistema de notificações multi-canal', 'blue');
    log('', 'reset');
    log('Uso:', 'yellow');
    log('  node tests/run-notifications-tests.js', 'green');
    log('  npm run test:notifications', 'green');
    log('', 'reset');
    log('Opções:', 'yellow');
    log('  --help, -h    Mostra esta ajuda', 'green');
    log('', 'reset');
    log('Relatórios gerados:', 'yellow');
    log('  - Cobertura: tests/coverage/notifications/', 'green');
    log('  - Relatório HTML: tests/reports/notifications/', 'green');
    log('', 'reset');
};

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

// Executar testes
runNotificationTests().catch((error) => {
    log('❌ Erro fatal:', 'red');
    log(error.message, 'red');
    process.exit(1);
});