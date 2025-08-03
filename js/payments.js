// Sistema de Pagamentos Integrado com Jitsi Meet
// Fluxo: Pagamento → Validação → Fila → Videoconsulta

class PaymentSystem {
    constructor() {
        this.jitsiConfig = {
            appId: 'vpaas-magic-cookie-d4eb95e56d4140978d223283225476be',
            apiKey: 'vpaas-magic-cookie-d4eb95e56d4140978d223283225476be/feda42'
        };
        this.currentAppointment = null;
        this.paymentModal = null;
        this.init();
    }

    init() {
        this.createPaymentModal();
        this.setupEventListeners();
        console.log('💳 Sistema de Pagamentos inicializado');
    }

    // Criar modal de pagamento
    createPaymentModal() {
        const modalHTML = `
            <div id="paymentModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
                <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4 transform transition-all">
                    <div class="text-center mb-6">
                        <div class="text-4xl mb-4">💳</div>
                        <h2 class="text-2xl font-bold text-gray-900">Finalizar Pagamento</h2>
                        <p class="text-gray-600">Confirme os dados da sua consulta</p>
                    </div>

                    <!-- Detalhes da Consulta -->
                    <div id="consultationDetails" class="bg-gray-50 rounded-lg p-4 mb-6">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium">Especialidade:</span>
                            <span id="specialtyName" class="text-gray-700"></span>
                        </div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium">Duração:</span>
                            <span id="consultationDuration" class="text-gray-700"></span>
                        </div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium">Médicos Online:</span>
                            <span id="doctorsOnline" class="text-green-600 font-medium"></span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-lg">Total:</span>
                            <span id="totalPrice" class="text-2xl font-bold text-green-600"></span>
                        </div>
                    </div>

                    <!-- Formulário de Pagamento -->
                    <form id="paymentForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Número do Cartão</label>
                            <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                   maxlength="19" required>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Validade</label>
                                <input type="text" id="cardExpiry" placeholder="MM/AA" 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       maxlength="5" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                                <input type="text" id="cardCvv" placeholder="123" 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       maxlength="4" required>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nome no Cartão</label>
                            <input type="text" id="cardName" placeholder="João Silva" 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                   required>
                        </div>

                        <!-- Botões -->
                        <div class="flex space-x-4 pt-4">
                            <button type="button" onclick="paymentSystem.closePaymentModal()" 
                                    class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" id="payButton"
                                    class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                                <span id="payButtonText">Pagar Agora</span>
                                <div id="payButtonLoading" class="hidden">
                                    <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                </div>
                            </button>
                        </div>
                    </form>

                    <!-- Mensagem de Erro -->
                    <div id="paymentError" class="hidden mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div class="flex">
                            <div class="text-red-400">⚠️</div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-red-800">Erro no Pagamento</h3>
                                <p id="paymentErrorMessage" class="text-sm text-red-700 mt-1"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.paymentModal = document.getElementById('paymentModal');
    }

    // Configurar event listeners
    setupEventListeners() {
        // Formatação automática do número do cartão
        document.getElementById('cardNumber').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });

        // Formatação da data de validade
        document.getElementById('cardExpiry').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });

        // Apenas números no CVV
        document.getElementById('cardCvv').addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        // Submit do formulário
        document.getElementById('paymentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment();
        });
    }

    // Abrir modal de pagamento
    openPaymentModal(specialtyData) {
        this.currentAppointment = {
            specialtyId: specialtyData.id,
            specialtyName: specialtyData.name,
            price: specialtyData.price,
            duration: specialtyData.duration || 30,
            doctorsOnline: specialtyData.doctorsOnline || 0
        };

        // Preencher detalhes da consulta
        document.getElementById('specialtyName').textContent = specialtyData.name;
        document.getElementById('consultationDuration').textContent = `${specialtyData.duration || 30} minutos`;
        document.getElementById('doctorsOnline').textContent = `${specialtyData.doctorsOnline || 0} médicos`;
        document.getElementById('totalPrice').textContent = `R$ ${parseFloat(specialtyData.price).toFixed(2)}`;

        // Mostrar modal
        this.paymentModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        console.log('💳 Modal de pagamento aberto para:', specialtyData.name);
    }

    // Fechar modal de pagamento
    closePaymentModal() {
        this.paymentModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.clearForm();
        this.hideError();
    }

    // Processar pagamento
    async processPayment() {
        const payButton = document.getElementById('payButton');
        const payButtonText = document.getElementById('payButtonText');
        const payButtonLoading = document.getElementById('payButtonLoading');

        try {
            // Mostrar loading
            payButtonText.classList.add('hidden');
            payButtonLoading.classList.remove('hidden');
            payButton.disabled = true;

            // Validar formulário
            if (!this.validatePaymentForm()) {
                throw new Error('Por favor, preencha todos os campos corretamente');
            }

            // Simular processamento de pagamento
            await this.simulatePaymentProcessing();

            // Criar consulta no banco (status PENDING)
            const consultationId = await this.createAppointment();

            // Fechar modal e mostrar sucesso
            this.closePaymentModal();
            this.showPaymentSuccess(consultationId);

            // Simular aprovação de pagamento (apenas para testes)
            if (window.paymentSimulator && this.currentConsultation) {
                window.paymentSimulator.simulatePaymentApproval(
                    this.currentConsultation.id, 
                    this.currentConsultation.payment_id
                );
            }

            // Redirecionar para "Minhas Consultas" onde o paciente aguardará a confirmação do pagamento
            setTimeout(() => {
                this.redirectToMyConsultations();
            }, 2000);

        } catch (error) {
            console.error('❌ Erro no pagamento:', error);
            this.showError(error.message);
        } finally {
            // Restaurar botão
            payButtonText.classList.remove('hidden');
            payButtonLoading.classList.add('hidden');
            payButton.disabled = false;
        }
    }

    // Validar formulário de pagamento
    validatePaymentForm() {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCvv = document.getElementById('cardCvv').value;
        const cardName = document.getElementById('cardName').value;

        if (cardNumber.length < 13 || cardNumber.length > 19) {
            throw new Error('Número do cartão inválido');
        }

        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            throw new Error('Data de validade inválida');
        }

        if (cardCvv.length < 3 || cardCvv.length > 4) {
            throw new Error('CVV inválido');
        }

        if (cardName.trim().length < 2) {
            throw new Error('Nome no cartão é obrigatório');
        }

        return true;
    }

    // Simular processamento de pagamento
    async simulatePaymentProcessing() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular 95% de sucesso
                if (Math.random() > 0.05) {
                    resolve({ success: true, transactionId: 'TXN_' + Date.now() });
                } else {
                    reject(new Error('Cartão recusado. Tente outro cartão ou entre em contato com seu banco.'));
                }
            }, 2000);
        });
    }

    // Criar consulta no banco de dados
    async createAppointment() {
        try {
            console.log('🔍 Iniciando criação de consulta...');
            
            const { data: user } = await supabase.auth.getUser();
            console.log('👤 Usuário obtido:', user?.user?.id, user?.user?.email);
            
            if (!user.user) {
                throw new Error('Usuário não autenticado');
            }

            // Gerar um payment_id único que será usado pelo Mercado Pago
            const paymentId = 'MP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            console.log('💳 Payment ID gerado:', paymentId);

            const consultationData = {
                user_id: user.user.id,
                specialty_id: this.currentAppointment.specialtyId,
                specialty_name: this.currentAppointment.specialtyName,
                price: this.currentAppointment.price,
                payment_id: paymentId,
                status: 'PENDING', // Status válido para consultations
                patient_name: user.user.email, // Usar email como nome temporário
                patient_email: user.user.email,
                symptoms: document.getElementById('symptoms')?.value || 'Consulta agendada via simulador'
            };
            
            console.log('📋 Dados da consulta:', consultationData);

            const { data, error } = await supabase
                .from('consultations')
                .insert([consultationData])
                .select()
                .single();

            if (error) {
                console.error('❌ Erro detalhado na inserção:', error);
                throw error;
            }

            console.log('✅ Consulta criada:', data.id, 'Payment ID:', paymentId);
            
            // Armazenar dados para uso posterior
            this.currentConsultation = data;
            
            return data.id;

        } catch (error) {
            console.error('❌ Erro ao criar consulta:', error);
            throw new Error('Erro ao processar consulta. Tente novamente.');
        }
    }

    // Adicionar à fila de espera
    async addToQueue(appointmentId) {
        try {
            // Obter próxima posição na fila
            const { data: queueData } = await supabase
                .from('consultation_queue')
                .select('position')
                .eq('specialty_id', this.currentAppointment.specialtyId)
            console.log('✅ Adicionado à fila na posição:', nextPosition);
            return data;

        } catch (error) {
            console.error('❌ Erro ao adicionar à fila:', error);
            throw new Error('Erro ao entrar na fila. Tente novamente.');
        }
    }

    // Mostrar sucesso do pagamento
    showPaymentSuccess(consultationId) {
        const successHTML = `
            <div id="paymentSuccess" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
                    <div class="text-6xl mb-4">✅</div>
                    <h2 class="text-2xl font-bold text-green-600 mb-4">Pagamento Processado!</h2>
                    <p class="text-gray-600 mb-4">Sua consulta foi registrada. Aguarde a confirmação do pagamento.</p>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p class="text-sm text-blue-800">
                            <strong>ID da Consulta:</strong> ${consultationId.substring(0, 8)}...<br>
                            <strong>Especialidade:</strong> ${this.currentAppointment.specialtyName}<br>
                            <strong>Status:</strong> Aguardando confirmação
                        </p>
                    </div>
                    <p class="text-sm text-gray-500">Redirecionando para "Minhas Consultas"...</p>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', successHTML);

        // Enviar notificação multi-canal de confirmação de pagamento
        if (typeof window.sendPaymentConfirmationNotification === 'function') {
            const appointmentData = {
                id: consultationId,
                specialty: this.currentAppointment.specialtyName,
                price: this.currentAppointment.price,
                queuePosition: 1, // Será atualizado quando entrar na fila
                patientPhone: null, // Seria obtido do perfil do usuário
                patientEmail: null  // Seria obtido do perfil do usuário
            };
            window.sendPaymentConfirmationNotification(appointmentData);
        }

        // Remover após 3 segundos
        setTimeout(() => {
            const successModal = document.getElementById('paymentSuccess');
            if (successModal) {
                successModal.remove();
            }
        }, 3000);
    }

    // Redirecionar para fila de espera
    redirectToQueue(appointmentId) {
        // Aqui você pode redirecionar para uma página específica da fila
        // ou mostrar a interface da fila na mesma página
        console.log('🔄 Redirecionando para fila de espera...');
        
        // Por enquanto, vamos mostrar a interface da fila
        if (window.queueSystem) {
            window.queueSystem.showQueueInterface(appointmentId);
        }
    }

    // Redirecionar para "Minhas Consultas"
    redirectToMyConsultations() {
        console.log('🔄 Redirecionando para Minhas Consultas...');
        
        // Se estivermos no dashboard, mostrar a seção de consultas
        if (window.showSection) {
            window.showSection('appointments');
        } else {
            // Se não estivermos no dashboard, redirecionar para lá
            window.location.href = 'dashboard.html#appointments';
        }
    }

    // Mostrar erro
    showError(message) {
        const errorDiv = document.getElementById('paymentError');
        const errorMessage = document.getElementById('paymentErrorMessage');
        
        errorMessage.textContent = message;
        errorDiv.classList.remove('hidden');

        // Esconder erro após 5 segundos
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    // Esconder erro
    hideError() {
        const errorDiv = document.getElementById('paymentError');
        errorDiv.classList.add('hidden');
    }

    // Limpar formulário
    clearForm() {
        document.getElementById('paymentForm').reset();
        this.hideError();
    }
}

// Função global para abrir modal de pagamento
function selectSpecialty(specialtyId, specialtyName, price) {
    // Buscar dados completos da especialidade
    const specialtyData = {
        id: specialtyId,
        name: specialtyName,
        price: price,
        duration: 30, // Padrão
        doctorsOnline: Math.floor(Math.random() * 10) + 1 // Simulado
    };

    // Abrir modal de pagamento
    if (window.paymentSystem) {
        window.paymentSystem.openPaymentModal(specialtyData);
    } else {
        console.error('Sistema de pagamentos não inicializado');
    }
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.paymentSystem = new PaymentSystem();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentSystem;
}function createModal(id, title) {
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