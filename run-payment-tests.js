#!/usr/bin/env node

/**
 * Script Executável - Testes de Pagamento
 * Execute: node run-payment-tests.js
 */

const { RealPaymentTester } = require('./tests/payment-test-runner.js');

async function main() {
    console.log('🧪 EXECUTANDO TESTES DE PAGAMENTO SIMULADO');
    console.log('==========================================\n');
    
    const tester = new RealPaymentTester();
    
    try {
        // Executar teste completo
        const result = await tester.testCompleteFlow();
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 RESULTADO FINAL');
        console.log('='.repeat(50));
        
        if (result.success) {
            console.log('🎉 TODOS OS TESTES PASSARAM!');
            console.log(`⏱️  Tempo total: ${result.duration}ms`);
            console.log(`📋 Consulta criada: ${result.consultation?.id}`);
            console.log('✅ Sistema de pagamento funcionando perfeitamente!');
        } else {
            console.log('❌ ALGUNS TESTES FALHARAM!');
            console.log('🔍 Verifique os logs acima para detalhes.');
        }
        
        console.log('\n📝 Logs detalhados:');
        result.results.forEach((log, index) => {
            const emoji = log.type === 'success' ? '✅' : 
                         log.type === 'error' ? '❌' : 
                         log.type === 'warning' ? '⚠️' : 'ℹ️';
            console.log(`${index + 1}. ${emoji} ${log.message}`);
        });
        
        // Cleanup opcional
        if (result.consultation?.id) {
            console.log('\n🧹 Limpando dados de teste...');
            await tester.cleanup(result.consultation.id);
        }
        
        process.exit(result.success ? 0 : 1);
        
    } catch (error) {
        console.error('\n💥 ERRO FATAL:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Executar
main();
