// Função otimizada para preenchimento automático do Mercado Pago
// Baseada nos nomes exatos dos campos: cardNumber, expirationDate, securityCode

function fillMercadoPagoFields() {
    console.log('⚡ Preenchendo campos específicos do Mercado Pago...');
    
    // Dados de teste do Mercado Pago
    const testData = {
        cardNumber: '5031433215406351',
        cardholderName: 'TESTUSER1621783976',
        expirationDate: '11/30', // Formato MM/YY para campo único
        expirationMonth: '11',
        expirationYear: '30',
        securityCode: '123',
        identificationNumber: '12345678909'
    };

    // Função para simular digitação real
    const fillField = (element, value, delay = 0) => {
        if (!element) return false;
        
        setTimeout(() => {
            console.log(`Preenchendo campo:`, element.name || element.placeholder, 'com valor:', value);
            
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

    // Procurar e preencher campos
    setTimeout(() => {
        const container = document.getElementById('cardPaymentBrick_container');
        if (!container) {
            console.log('❌ Container do Mercado Pago não encontrado');
            return;
        }

        const allInputs = container.querySelectorAll('input, select');
        console.log(`📋 Encontrados ${allInputs.length} campos no formulário`);

        let filledCount = 0;
        let delay = 0;

        // Mapear campos por name exato
        allInputs.forEach((input, index) => {
            const name = (input.name || '').toLowerCase();
            const placeholder = (input.placeholder || '').toLowerCase();
            const inputMode = (input.inputMode || '').toLowerCase();
            
            console.log(`Campo ${index}:`, {
                name: input.name,
                placeholder: input.placeholder,
                inputMode: input.inputMode,
                type: input.type
            });

            // Identificar e preencher por name exato
            if (name === 'cardnumber' || name === 'card_number') {
                if (fillField(input, testData.cardNumber, delay)) {
                    filledCount++;
                    console.log('✅ Número do cartão preenchido');
                    delay += 200;
                }
            }
            else if (name === 'holder_name' || inputMode === 'text') {
                if (fillField(input, testData.cardholderName, delay)) {
                    filledCount++;
                    console.log('✅ Nome do titular preenchido');
                    delay += 200;
                }
            }
            else if (name === 'expirationdate' || name === 'expiration_date') {
                if (fillField(input, testData.expirationDate, delay)) {
                    filledCount++;
                    console.log('✅ Data de vencimento preenchida');
                    delay += 200;
                }
            }
            else if (name === 'expirationmonth' || name === 'expiration_month') {
                if (fillField(input, testData.expirationMonth, delay)) {
                    filledCount++;
                    console.log('✅ Mês de vencimento preenchido');
                    delay += 200;
                }
            }
            else if (name === 'expirationyear' || name === 'expiration_year') {
                if (fillField(input, testData.expirationYear, delay)) {
                    filledCount++;
                    console.log('✅ Ano de vencimento preenchido');
                    delay += 200;
                }
            }
            else if (name === 'securitycode' || name === 'security_code') {
                if (fillField(input, testData.securityCode, delay)) {
                    filledCount++;
                    console.log('✅ Código de segurança preenchido');
                    delay += 200;
                }
            }
            else if (name === 'document' || inputMode === 'numeric') {
                if (fillField(input, testData.identificationNumber, delay)) {
                    filledCount++;
                    console.log('✅ CPF preenchido');
                    delay += 200;
                }
            }
            // Fallback por placeholder
            else if (placeholder.includes('número') || placeholder.includes('1234')) {
                if (fillField(input, testData.cardNumber, delay)) {
                    filledCount++;
                    console.log('✅ Número do cartão preenchido (placeholder)');
                    delay += 200;
                }
            }
            else if (placeholder.includes('código') || placeholder.includes('cvv')) {
                if (fillField(input, testData.securityCode, delay)) {
                    filledCount++;
                    console.log('✅ Código de segurança preenchido (placeholder)');
                    delay += 200;
                }
            }
            else if (placeholder.includes('mm/aa') || placeholder.includes('validade')) {
                if (fillField(input, testData.expirationDate, delay)) {
                    filledCount++;
                    console.log('✅ Data de vencimento preenchida (placeholder)');
                    delay += 200;
                }
            }
        });

        // Resultado final
        setTimeout(() => {
            if (filledCount > 0) {
                console.log(`✅ ${filledCount} campos preenchidos automaticamente`);
                showNotification(`✅ ${filledCount} campos preenchidos!`, 'success');
            } else {
                console.log('⚠️ Nenhum campo foi preenchido automaticamente');
                showNotification('⚠️ Preencha manualmente', 'warning');
            }
        }, 1500);
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
window.fillMercadoPagoFields = fillMercadoPagoFields;