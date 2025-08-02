// Sistema de Auto-preenchimento Mercado Pago - Versão Final
// Baseado na estrutura real do formulário mostrada pelo usuário

function fillMercadoPagoTestData() {
    console.log('🚀 Iniciando preenchimento automático Mercado Pago...');

    // Dados de teste do Mercado Pago
    const testData = {
        cardNumber: '5031433215406351',
        expirationMonth: '11',
        expirationYear: '30',
        securityCode: '123',
        cardholderName: 'TESTUSER1621783976',
        identificationNumber: '12345678909'
    };

    // Função para aguardar elemento aparecer
    const waitForElement = (selector, timeout = 5000) => {
        return new Promise((resolve) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, timeout);
        });
    };

    // Função para preencher campo com simulação de digitação
    const fillField = async (element, value, delay = 100) => {
        if (!element) return false;

        console.log(`📝 Preenchendo campo com valor: ${value}`);

        // Focar no campo
        element.focus();
        element.click();

        // Limpar campo
        element.value = '';
        element.dispatchEvent(new Event('input', { bubbles: true }));

        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, delay));

        // Definir valor
        element.value = value;

        // Disparar eventos necessários
        element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));

        // Aguardar processamento
        await new Promise(resolve => setTimeout(resolve, delay));

        console.log(`✅ Campo preenchido: ${element.placeholder || element.name || 'sem nome'}`);
        return true;
    };

    // Função principal de preenchimento
    const performFill = async () => {
        try {
            // Aguardar container do Mercado Pago
            console.log('⏳ Aguardando container do Mercado Pago...');
            const container = await waitForElement('#cardPaymentBrick_container');
            
            if (!container) {
                console.log('❌ Container não encontrado');
                showNotification('❌ Formulário não encontrado', 'error');
                return;
            }

            console.log('✅ Container encontrado');

            // Aguardar um pouco para garantir que o formulário está totalmente carregado
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Buscar todos os inputs no container
            const allInputs = container.querySelectorAll('input');
            console.log(`📋 Encontrados ${allInputs.length} campos de input`);

            if (allInputs.length === 0) {
                console.log('❌ Nenhum campo encontrado');
                showNotification('❌ Campos não encontrados', 'error');
                return;
            }

            // Mapear campos por características
            const fieldMap = {};
            
            allInputs.forEach((input, index) => {
                const placeholder = (input.placeholder || '').toLowerCase();
                const name = (input.name || '').toLowerCase();
                const type = input.type || '';
                const maxLength = input.maxLength;

                console.log(`Campo ${index}:`, {
                    placeholder,
                    name,
                    type,
                    maxLength,
                    value: input.value
                });

                // Identificar por placeholder específico (baseado na imagem do usuário)
                if (placeholder.includes('1234 1234 1234 1234') || placeholder.includes('número do cartão')) {
                    fieldMap.cardNumber = input;
                } else if (placeholder.includes('mm/aa') || placeholder.includes('data de vencimento')) {
                    fieldMap.expiration = input;
                } else if (placeholder.includes('ex.: 123') || placeholder.includes('código de segurança')) {
                    fieldMap.securityCode = input;
                } else if (placeholder.includes('maria santos pereira') || placeholder.includes('nome do titular')) {
                    fieldMap.cardholderName = input;
                } else if (placeholder.includes('999.999.999-99') || placeholder.includes('documento do titular')) {
                    fieldMap.identificationNumber = input;
                }

                // Identificar por características do campo
                if (!fieldMap.cardNumber && maxLength >= 16 && type === 'text') {
                    fieldMap.cardNumber = input;
                } else if (!fieldMap.securityCode && maxLength <= 4 && type === 'text') {
                    fieldMap.securityCode = input;
                } else if (!fieldMap.expiration && maxLength === 5 && type === 'text') {
                    fieldMap.expiration = input;
                }
            });

            console.log('🗺️ Mapeamento de campos:', Object.keys(fieldMap));

            let filledCount = 0;

            // Preencher número do cartão
            if (fieldMap.cardNumber) {
                if (await fillField(fieldMap.cardNumber, testData.cardNumber, 200)) {
                    filledCount++;
                }
            }

            // Preencher data de expiração (formato MM/AA)
            if (fieldMap.expiration) {
                const expirationValue = `${testData.expirationMonth}/${testData.expirationYear}`;
                if (await fillField(fieldMap.expiration, expirationValue, 200)) {
                    filledCount++;
                }
            }

            // Preencher código de segurança
            if (fieldMap.securityCode) {
                if (await fillField(fieldMap.securityCode, testData.securityCode, 200)) {
                    filledCount++;
                }
            }

            // Preencher nome do titular
            if (fieldMap.cardholderName) {
                if (await fillField(fieldMap.cardholderName, testData.cardholderName, 200)) {
                    filledCount++;
                }
            }

            // Preencher CPF
            if (fieldMap.identificationNumber) {
                if (await fillField(fieldMap.identificationNumber, testData.identificationNumber, 200)) {
                    filledCount++;
                }
            }

            // Fallback: tentar preencher por posição se poucos campos foram preenchidos
            if (filledCount < 3) {
                console.log('🔄 Tentando preenchimento por posição...');
                
                const emptyInputs = Array.from(allInputs).filter(input => !input.value.trim());
                const fallbackValues = [
                    testData.cardNumber,
                    `${testData.expirationMonth}/${testData.expirationYear}`,
                    testData.securityCode,
                    testData.cardholderName,
                    testData.identificationNumber
                ];

                for (let i = 0; i < Math.min(emptyInputs.length, fallbackValues.length); i++) {
                    if (await fillField(emptyInputs[i], fallbackValues[i], 300)) {
                        filledCount++;
                    }
                }
            }

            // Resultado final
            if (filledCount > 0) {
                console.log(`✅ ${filledCount} campos preenchidos com sucesso!`);
                showNotification(`✅ ${filledCount} campos preenchidos!`, 'success');
            } else {
                console.log('⚠️ Nenhum campo foi preenchido');
                showNotification('⚠️ Preencha manualmente', 'warning');
            }

        } catch (error) {
            console.error('❌ Erro no preenchimento:', error);
            showNotification('❌ Erro no preenchimento', 'error');
        }
    };

    // Executar preenchimento
    performFill();
}

// Função para mostrar notificação
function showNotification(message, type = 'success') {
    const colors = {
        success: { bg: '#10b981', text: 'white' },
        warning: { bg: '#f59e0b', text: 'white' },
        error: { bg: '#ef4444', text: 'white' }
    };

    const color = colors[type] || colors.success;

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color.bg};
        color: ${color.text};
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
    `;
    notification.innerHTML = message;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remover após 4 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Tornar função disponível globalmente
window.fillMercadoPagoTestData = fillMercadoPagoTestData;

console.log('🔧 Sistema de auto-preenchimento Mercado Pago carregado');