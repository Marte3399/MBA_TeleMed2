// TeleMed - Sistema de Pagamentos

/**
 * CONFIGURAÇÃO DE PAGAMENTOS
 * Define métodos de pagamento disponíveis, taxas e configurações do sistema
 */
const PAYMENT_CONFIG = {
    methods: {                          // Métodos de pagamento disponíveis
        pix: {                          // Configuração do PIX
            name: 'PIX',                // Nome exibido para o usuário
            icon: '📱',                 // Ícone representativo
            processingTime: 'Instantâneo',  // Tempo de processamento
            discount: 0.05,             // Desconto de 5% para PIX
            enabled: true               // Se está habilitado
        },
        credit: {                       // Configuração do Cartão de Crédito
            name: 'Cartão de Crédito',
            icon: '💳',
            processingTime: '2-3 minutos',
            discount: 0,                // Sem desconto
            enabled: true
        },
        boleto: {                       // Configuração do Boleto Bancário
            name: 'Boleto Bancário',
            icon: '🧾',
            processingTime: '1-2 dias úteis',
            discount: 0,
            enabled: true
        },
        debit: {                        // Configuração do Cartão de Débito
            name: 'Cartão de Débito',
            icon: '💳',
            processingTime: 'Instantâneo',
            discount: 0,
            enabled: true
        }
    },
    taxes: {                            // Taxas do sistema
        processing: 0.029,              // Taxa de processamento: 2.9%
        platform: 0.01                 // Taxa da plataforma: 1%
    }
};

/**
 * PROCESSAR PAGAMENTO
 * Função principal que coordena o processamento de pagamentos
 * @param {string} method - Método de pagamento escolhido ('pix', 'credit', 'boleto', 'debit')
 */
function processPayment(method) {
    // Verifica se uma especialidade foi selecionada
    if (!TeleMed.selectedSpecialty) {
        showNotification('Erro', 'Nenhuma especialidade selecionada', 'error');
        return;
    }
    
    // Verifica se o método de pagamento é válido e está habilitado
    const paymentMethod = PAYMENT_CONFIG.methods[method];
    if (!paymentMethod || !paymentMethod.enabled) {
        showNotification('Erro', 'Método de pagamento não disponível', 'error');
        return;
    }
    
    // Calcula o valor final com desconto (se aplicável)
    const baseAmount = TeleMed.selectedSpecialty.price;
    const discount = paymentMethod.discount * baseAmount;
    const finalAmount = baseAmount - discount;
    
    // Cria objeto com dados do pagamento para rastreamento
    const paymentData = {
        id: generateId(),                           // ID único do pagamento
        specialtyId: TeleMed.selectedSpecialty.id,  // ID da especialidade
        specialty: TeleMed.selectedSpecialty.name,  // Nome da especialidade
        method: method,                             // Método de pagamento
        methodName: paymentMethod.name,             // Nome do método
        baseAmount: baseAmount,                     // Valor original
        discount: discount,                         // Valor do desconto
        finalAmount: finalAmount,                   // Valor final a pagar
        status: 'processing',                       // Status inicial
        timestamp: new Date(),                      // Data/hora do pagamento
        user: TeleMed.currentUser                   // Dados do usuário
    };
    
    // Fecha o modal de pagamento
    closeModal('paymentModal');
    
    // Mostra notificação de processamento
    showNotification('Processando pagamento', 
        `Processando ${paymentMethod.name} - ${formatCurrency(finalAmount)}`, 
        'info'
    );
    
    // Direciona para o processamento específico do método escolhido
    switch(method) {
        case 'pix':
            processPixPayment(paymentData);
            break;
        case 'credit':
            processCreditCardPayment(paymentData);
            break;
        case 'boleto':
            processBoletoPayment(paymentData);
            break;
        case 'debit':
            processDebitCardPayment(paymentData);
            break;
    }
}

/**
 * PROCESSAR PAGAMENTO PIX
 * Gerencia o fluxo de pagamento via PIX, exibindo QR Code e simulando processamento
 * @param {Object} paymentData - Dados do pagamento a ser processado
 */
function processPixPayment(paymentData) {
    // Exibe modal com QR Code do PIX para o usuário escanear
    showPixQRCode(paymentData);
    
    // Simula o processamento do PIX (em produção seria integração real)
    setTimeout(() => {
        paymentData.status = 'completed';                    // Marca como concluído
        paymentData.transactionId = 'PIX' + Date.now();      // Gera ID da transação
        
        // Finaliza o pagamento e adiciona à fila de consultas
        completePayment(paymentData);
    }, 3000); // 3 segundos para simular processamento instantâneo do PIX
}

// Process Credit Card Payment
function processCreditCardPayment(paymentData) {
    // Show credit card form
    showCreditCardForm(paymentData);
}

// Process Boleto Payment
function processBoletoPayment(paymentData) {
    // Generate boleto
    generateBoleto(paymentData);
    
    // Simulate boleto processing (immediate for demo)
    setTimeout(() => {
        paymentData.status = 'pending';
        paymentData.transactionId = 'BOL' + Date.now();
        
        showNotification('Boleto gerado', 
            'Boleto enviado para seu email. Prazo de pagamento: 2 dias úteis', 
            'success'
        );
        
        // Add to payment history
        addPaymentToHistory(paymentData);
    }, 2000);
}

// Process Debit Card Payment
function processDebitCardPayment(paymentData) {
    // Show debit card form
    showDebitCardForm(paymentData);
}

// Show PIX QR Code
function showPixQRCode(paymentData) {
    const qrCodeModal = createModal('pixQRCode', 'Pagamento PIX');
    
    const discount = paymentData.discount > 0 ? 
        `<div class="text-green-600 text-sm mb-2">💰 Desconto PIX: ${formatCurrency(paymentData.discount)}</div>` : '';
    
    qrCodeModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">📱 Pagamento PIX</h3>
                <button onclick="closeModal('pixQRCode')" class="modal-close">&times;</button>
            </div>
            <div class="modal-body text-center">
                <div class="mb-4">
                    <div class="text-2xl font-bold text-green-600">${formatCurrency(paymentData.finalAmount)}</div>
                    ${discount}
                </div>
                
                <div class="bg-gray-100 p-8 rounded-lg mb-4">
                    <div class="text-8xl mb-4">📱</div>
                    <div class="text-sm text-gray-600">
                        QR Code PIX seria exibido aqui
                    </div>
                </div>
                
                <div class="space-y-2 text-sm text-gray-600">
                    <div>1. Abra o app do seu banco</div>
                    <div>2. Acesse a área PIX</div>
                    <div>3. Escaneie o QR Code</div>
                    <div>4. Confirme o pagamento</div>
                </div>
                
                <div class="mt-6">
                    <div class="text-sm text-gray-500">
                        Aguardando pagamento... ⏳
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(qrCodeModal);
    qrCodeModal.classList.remove('hidden');
}

// Show Credit Card Form
function showCreditCardForm(paymentData) {
    const cardModal = createModal('creditCardForm', 'Cartão de Crédito');
    
    cardModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">💳 Cartão de Crédito</h3>
                <button onclick="closeModal('creditCardForm')" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="mb-4 text-center">
                    <div class="text-2xl font-bold text-blue-600">${formatCurrency(paymentData.finalAmount)}</div>
                </div>
                
                <form id="creditCardFormData" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Número do Cartão</label>
                        <input type="text" placeholder="1234 5678 9012 3456" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                               maxlength="19" oninput="formatCardNumber(this)">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Validade</label>
                            <input type="text" placeholder="MM/AA" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   maxlength="5" oninput="formatExpiry(this)">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                            <input type="text" placeholder="123" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   maxlength="3">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nome no Cartão</label>
                        <input type="text" placeholder="João Silva" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <input type="text" placeholder="123.456.789-00" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                               maxlength="14" oninput="formatCPF(this)">
                    </div>
                    
                    <button type="button" onclick="submitCreditCard()" 
                            class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                        Pagar ${formatCurrency(paymentData.finalAmount)}
                    </button>
                </form>
                
                <div class="mt-4 text-center text-sm text-gray-500">
                    🔒 Transação segura e criptografada
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(cardModal);
    cardModal.classList.remove('hidden');
    
    // Store payment data for form submission
    cardModal.paymentData = paymentData;
}

// Submit Credit Card Payment
function submitCreditCard() {
    const modal = document.getElementById('creditCardForm');
    const paymentData = modal.paymentData;
    
    // Simulate card processing
    closeModal('creditCardForm');
    
    showNotification('Processando...', 'Validando dados do cartão', 'info');
    
    setTimeout(() => {
        // Simulate successful payment
        paymentData.status = 'completed';
        paymentData.transactionId = 'CC' + Date.now();
        
        completePayment(paymentData);
    }, 4000);
}

// Generate Boleto
function generateBoleto(paymentData) {
    const boletoModal = createModal('boletoGenerated', 'Boleto Bancário');
    
    boletoModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">🧾 Boleto Bancário</h3>
                <button onclick="closeModal('boletoGenerated')" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="mb-4 text-center">
                    <div class="text-2xl font-bold text-orange-600">${formatCurrency(paymentData.finalAmount)}</div>
                </div>
                
                <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <div class="text-sm text-orange-800">
                        <div class="font-semibold mb-2">📄 Boleto gerado com sucesso!</div>
                        <div>Número: ${paymentData.transactionId}</div>
                        <div>Vencimento: ${formatDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000))}</div>
                    </div>
                </div>
                
                <div class="space-y-3 text-sm text-gray-600">
                    <div>• Boleto enviado para ${TeleMed.currentUser.email}</div>
                    <div>• Prazo de pagamento: 2 dias úteis</div>
                    <div>• Após pagamento, liberação em até 2 dias úteis</div>
                    <div>• Valor não pago após vencimento: multa de 2%</div>
                </div>
                
                <div class="mt-6 space-y-2">
                    <button onclick="downloadBoleto()" 
                            class="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-semibold">
                        📥 Baixar Boleto PDF
                    </button>
                    <button onclick="sendBoletoEmail()" 
                            class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                        📧 Reenviar por Email
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(boletoModal);
    boletoModal.classList.remove('hidden');
}

// Complete Payment
function completePayment(paymentData) {
    // Close any open modals
    closeModal('pixQRCode');
    closeModal('creditCardForm');
    
    // Update payment status
    paymentData.status = 'completed';
    paymentData.completedAt = new Date();
    
    // Add to payment history
    addPaymentToHistory(paymentData);
    
    // Create consultation
    createConsultation(paymentData);
    
    // Show success notification
    showNotification('Pagamento aprovado!', 
        `Pagamento de ${formatCurrency(paymentData.finalAmount)} aprovado com sucesso!`, 
        'success'
    );
    
    // Add to consultation queue
    addToConsultationQueue(paymentData);
}

// Add Payment to History
function addPaymentToHistory(paymentData) {
    if (!TeleMed.paymentHistory) {
        TeleMed.paymentHistory = [];
    }
    
    TeleMed.paymentHistory.push(paymentData);
    
    // Store in localStorage
    localStorage.setItem('telemed-payments', JSON.stringify(TeleMed.paymentHistory));
}

// Create Consultation
function createConsultation(paymentData) {
    const consultation = {
        id: generateId(),
        paymentId: paymentData.id,
        specialtyId: paymentData.specialtyId,
        specialty: paymentData.specialty,
        patient: paymentData.user,
        doctor: TeleMed.selectedSpecialty.doctors[0], // Assign first available doctor
        scheduledFor: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        status: 'waiting',
        type: 'video',
        amount: paymentData.finalAmount
    };
    
    // Add to consultations
    if (!TeleMed.consultations) {
        TeleMed.consultations = [];
    }
    
    TeleMed.consultations.push(consultation);
    
    // Store in localStorage
    localStorage.setItem('telemed-consultations', JSON.stringify(TeleMed.consultations));
}

// Add to Consultation Queue
function addToConsultationQueue(paymentData) {
    const queueItem = {
        id: generateId(),
        patient: paymentData.user.name,
        specialty: paymentData.specialty,
        amount: paymentData.finalAmount,
        timestamp: new Date(),
        status: 'waiting',
        position: 1, // This would be calculated based on actual queue
        estimatedWaitTime: 5 // minutes
    };
    
    // Add to queue
    if (!TeleMed.consultationQueue) {
        TeleMed.consultationQueue = [];
    }
    
    TeleMed.consultationQueue.push(queueItem);
    
    // Show queue notification
    setTimeout(() => {
        showNotification('Você está na fila!', 
            `Posição: ${queueItem.position} • Tempo estimado: ${queueItem.estimatedWaitTime} minutos`, 
            'info'
        );
    }, 2000);
}

// Utility Functions
function createModal(id, title) {
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal-overlay hidden';
    return modal;
}

function formatCardNumber(input) {
    let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || '';
    if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19);
    input.value = formattedValue;
}

function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
}

function formatCPF(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = value;
}

function downloadBoleto() {
    showNotification('Download iniciado', 'Boleto sendo baixado...', 'info');
    // Simulate download
    setTimeout(() => {
        showNotification('Download concluído', 'Boleto salvo na pasta Downloads', 'success');
    }, 2000);
}

function sendBoletoEmail() {
    showNotification('Email enviado', 'Boleto reenviado para seu email', 'success');
}

// Load Payment History
function loadPaymentHistory() {
    const stored = localStorage.getItem('telemed-payments');
    if (stored) {
        try {
            TeleMed.paymentHistory = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading payment history:', e);
            TeleMed.paymentHistory = [];
        }
    } else {
        TeleMed.paymentHistory = [];
    }
}

// Get Payment History
function getPaymentHistory() {
    return TeleMed.paymentHistory || [];
}

// Get Payment by ID
function getPaymentById(id) {
    return TeleMed.paymentHistory?.find(payment => payment.id === id);
}

// Initialize payment system
document.addEventListener('DOMContentLoaded', function() {
    loadPaymentHistory();
});

// Export functions
window.processPayment = processPayment;
window.submitCreditCard = submitCreditCard;
window.downloadBoleto = downloadBoleto;
window.sendBoletoEmail = sendBoletoEmail;
window.getPaymentHistory = getPaymentHistory;
window.getPaymentById = getPaymentById;
window.formatCardNumber = formatCardNumber;
window.formatExpiry = formatExpiry;
window.formatCPF = formatCPF;

console.log('✅ TeleMed Payment System Loaded');