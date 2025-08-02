// Função melhorada para preenchimento automático do Mercado Pago
// Baseada nos logs reais do sistema

function fillMercadoPagoTestData() {
    console.log('⚡ Preenchendo dados de teste do Mercado Pago (versão melhorada)...');

    // Dados de teste do Mercado Pago
    const testData = {
        cardNumber: '5031433215406351',
        cardholderName: 'TESTUSER1621783976',
        expirationDate: '11/30',
        securityCode: '123',
        identificationNumber: '12345678909'
    };

    // Função para simular digitação real
    const simulateTyping = (element, value, delay = 0) => {
        if (!element) return false;

        setTimeout(() => {
            element.focus();
            element.click();
            element.value = '';

            // Simular digitação caractere por caractere
            let currentValue = '';
            for (let i = 0; i < value.length; i++) {
                setTimeout(() => {
                    currentValue += value[i];
                    element.value = currentValue;

                    // Disparar eventos
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));

                    // Se é o último caractere
                    if (i === value.length - 1) {
                        element.blur();
                    }
                }, i * 30);
            }
        }, delay);

        return true;
    };

    // Função para identificar campos baseada nos logs reais
    const identifyFieldType = (element) => {
        const placeholder = (element.placeholder || '').toLowerCase();
        const name = (element.name || '').toLowerCase();
        const inputMode = (element.inputMode || '').toLowerCase();
        const type = element.type || '';

        console.log('Analisando campo:', {
            placeholder,
            name,
            inputMode,
            type,
            tagName: element.tagName
        });

        // Identificar por name exato (mais confiável)
        if (name === 'holder_name') return 'cardholderName';
        if (name === 'document') return 'identificationNumber';
        if (name === 'cardnumber') return 'cardNumber';
        if (name === 'securitycode') return 'securityCode';
        if (name === 'expirationmonth') return 'expirationMonth';
        if (name === 'expirationyear') return 'expirationYear';

        // Identificar por inputMode
        if (inputMode === 'text' && placeholder.includes('maria santos')) return 'cardholderName';
        if (inputMode === 'numeric' && placeholder.includes('999.999.999')) return 'identificationNumber';

        // Identificar por placeholder
        if (placeholder.includes('número do cartão') || placeholder.includes('1234')) return 'cardNumber';
        if (placeholder.includes('código de segurança') || placeholder.includes('cvv')) return 'securityCode';
        if (placeholder.includes('mês') || placeholder.includes('mm')) return 'expirationMonth';
        if (placeholder.includes('ano') || placeholder.includes('aa') || placeholder.includes('yy')) return 'expirationYear';

        // Identificar selects (provavelmente mês ou ano)
        if (type === 'select-one') {
            if (element.options && element.options.length <= 13) return 'expirationMonth';
            if (element.options && element.options.length > 13) return 'expirationYear';
        }

        return 'unknown';
    };

    // Procurar e preencher campos
    setTimeout(() => {
        const container = document.getElementById('cardPaymentBrick_container');
        if (!container) {
            console.log('❌ Container do Mercado Pago não encontrado');
            return;
        }

        const allInputs = container.querySelectorAll('input, select');
        console.log(`📋 Encontrados ${allInputs.length} campos no formulário`);

        // Mapear campos por tipo identificado
        const fieldMap = {};
        allInputs.forEach((input, index) => {
            const fieldType = identifyFieldType(input);
            console.log(`Campo ${index}: ${fieldType}`);

            if (fieldType !== 'unknown') {
                fieldMap[fieldType] = input;
            }
        });

        console.log('Mapeamento de campos:', fieldMap);

        let filledCount = 0;
        let delay = 0;

        // Preencher campos identificados na ordem correta
        const fillOrder = [
            { type: 'cardNumber', value: testData.cardNumber, name: 'Número do Cartão' },
            { type: 'cardholderName', value: testData.cardholderName, name: 'Nome no Cartão' },
            { type: 'expirationMonth', value: testData.expirationMonth, name: 'Mês de Expiração' },
            { type: 'expirationYear', value: testData.expirationYear, name: 'Ano de Expiração' },
            { type: 'securityCode', value: testData.securityCode, name: 'Código de Segurança' },
            { type: 'identificationNumber', value: testData.identificationNumber, name: 'CPF' }
        ];

        fillOrder.forEach(({ type, value, name }) => {
            if (fieldMap[type]) {
                if (simulateTyping(fieldMap[type], value, delay)) {
                    filledCount++;
                    console.log(`✅ ${name} preenchido`);
                    delay += 200; // Delay entre campos
                }
            } else {
                console.log(`⚠️ Campo ${name} não encontrado`);
            }
        });

        // Fallback: tentar preencher campos que ainda não foram preenchidos
        if (filledCount < 4) { // Esperamos pelo menos 4 campos principais
            console.log('🔄 Tentando fallback por posição...');

            // Tentar identificar campos vazios e preencher por posição
            const emptyInputs = Array.from(allInputs).filter(input => !input.value);

            if (emptyInputs.length > 0) {
                // Assumir ordem comum do Mercado Pago
                const fallbackData = [
                    testData.cardNumber,
                    testData.cardholderName,
                    testData.expirationMonth,
                    testData.expirationYear,
                    testData.securityCode,
                    testData.identificationNumber
                ];

                emptyInputs.forEach((input, index) => {
                    if (fallbackData[index]) {
                        if (simulateTyping(input, fallbackData[index], (index + 1) * 200)) {
                            filledCount++;
                            console.log(`✅ Campo ${index} preenchido por fallback`);
                        }
                    }
                });
            }
        }

        // Resultado final
        setTimeout(() => {
            if (filledCount > 0) {
                console.log(`✅ ${filledCount} campos preenchidos automaticamente`);

                // Mostrar notificação de sucesso
                showNotification(`✅ ${filledCount} campos preenchidos!`, 'success');

            } else {
                console.log('⚠️ Nenhum campo foi preenchido automaticamente');
                showNotification('⚠️ Preencha manualmente', 'warning');
            }
        }, 2000);
    }, 500);
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