#!/usr/bin/env node

/**
 * SCRIPT PARA EXECUTAR TESTES UNITÁRIOS
 * Sistema de Telemedicina - Tarefa 2
 * 
 * Este script facilita a execução dos testes unitários
 * sem precisar navegar para o diretório específico
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

function printHeader() {
    console.log(colorize('\n🏥 SISTEMA DE TELEMEDICINA - TESTES UNITÁRIOS', 'cyan'));
    console.log(colorize('📋 Tarefa 2: Sistema de Cadastro e Aprovação de Médicos\n', 'blue'));
}

function printUsage() {
    console.log(colorize('📖 USO:', 'yellow'));
    console.log('  node tests/run-unit-tests.js [comando]\n');
    
    console.log(colorize('🚀 COMANDOS DISPONÍVEIS:', 'yellow'));
    console.log('  test              - Executar todos os testes');
    console.log('  test:watch        - Executar testes em modo watch');
    console.log('  test:coverage     - Executar testes com cobertura');
    console.log('  test:doctor       - Executar apenas testes de cadastro médico');
    console.log('  test:form         - Executar apenas testes de validação de formulário');
    console.log('  test:verbose      - Executar testes com saída detalhada');
    console.log('  install           - Instalar dependências');
    console.log('  help              - Mostrar esta ajuda\n');
    
    console.log(colorize('💡 EXEMPLOS:', 'yellow'));
    console.log('  node tests/run-unit-tests.js test');
    console.log('  node tests/run-unit-tests.js test:coverage');
    console.log('  node tests/run-unit-tests.js install\n');
}

function checkDependencies() {
    const unitTestDir = path.join(__dirname, 'unit');
    const packageJsonPath = path.join(unitTestDir, 'package.json');
    const nodeModulesPath = path.join(unitTestDir, 'node_modules');
    
    if (!fs.existsSync(packageJsonPath)) {
        console.log(colorize('❌ Arquivo package.json não encontrado em tests/unit/', 'red'));
        return false;
    }
    
    if (!fs.existsSync(nodeModulesPath)) {
        console.log(colorize('⚠️  Dependências não instaladas. Execute: node tests/run-unit-tests.js install', 'yellow'));
        return false;
    }
    
    return true;
}

function installDependencies() {
    console.log(colorize('📦 Instalando dependências...', 'blue'));
    
    const unitTestDir = path.join(__dirname, 'unit');
    
    try {
        process.chdir(unitTestDir);
        execSync('npm install', { stdio: 'inherit' });
        console.log(colorize('✅ Dependências instaladas com sucesso!', 'green'));
    } catch (error) {
        console.log(colorize('❌ Erro ao instalar dependências:', 'red'));
        console.log(error.message);
        process.exit(1);
    }
}

function runCommand(command) {
    const unitTestDir = path.join(__dirname, 'unit');
    
    if (!checkDependencies()) {
        console.log(colorize('💡 Execute primeiro: node tests/run-unit-tests.js install', 'yellow'));
        return;
    }
    
    const commands = {
        'test': 'npm test',
        'test:watch': 'npm run test:watch',
        'test:coverage': 'npm run test:coverage',
        'test:doctor': 'npm run test:doctor-registration',
        'test:form': 'npx jest doctor-form-validation.test.js',
        'test:verbose': 'npm run test:verbose'
    };
    
    const npmCommand = commands[command];
    
    if (!npmCommand) {
        console.log(colorize(`❌ Comando '${command}' não reconhecido.`, 'red'));
        printUsage();
        return;
    }
    
    console.log(colorize(`🚀 Executando: ${npmCommand}`, 'blue'));
    console.log(colorize('📁 Diretório: tests/unit/\n', 'blue'));
    
    try {
        process.chdir(unitTestDir);
        execSync(npmCommand, { stdio: 'inherit' });
        console.log(colorize('\n✅ Testes executados com sucesso!', 'green'));
    } catch (error) {
        console.log(colorize('\n❌ Erro ao executar testes:', 'red'));
        console.log(error.message);
        process.exit(1);
    }
}

function showTestResults() {
    console.log(colorize('\n📊 RESULTADOS DOS TESTES:', 'cyan'));
    console.log('• Verifique o output acima para detalhes dos testes');
    console.log('• Relatório de cobertura: tests/coverage/lcov-report/index.html');
    console.log('• Logs detalhados disponíveis no terminal\n');
}

function main() {
    printHeader();
    
    const command = process.argv[2];
    
    if (!command || command === 'help') {
        printUsage();
        return;
    }
    
    if (command === 'install') {
        installDependencies();
        return;
    }
    
    runCommand(command);
    showTestResults();
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    console.log(colorize('\n❌ Erro não tratado:', 'red'));
    console.log(error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log(colorize('\n❌ Promise rejeitada:', 'red'));
    console.log(reason);
    process.exit(1);
});

// Executar script principal
if (require.main === module) {
    main();
}

module.exports = {
    runCommand,
    installDependencies,
    checkDependencies
};