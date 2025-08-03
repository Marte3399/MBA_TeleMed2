// Sistema de Fila em Tempo Real - Tarefa 6
// Integração completa com Supabase Real-time e preparação para Mercado Pago

class RealTimeQueueSystem {
    constructor() {
        this.currentUser = null;
        this.currentAppointment = null;
        this.queueSubscription = null;
        this.notificationSubscription = null;
        this.doctorSubscription = null;
        this.isInQueue = false;
        this.queuePosition = 0;
        this.estimatedWaitTime = 0;
        this.init();
    }

    async init() {
        console.log('🔄 Inicializando Sistema de Fila em Tempo Real...');
        
        // Verificar usuário autenticado
        await this.checkAuthenticatedUser();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Verificar se usuário já está em alguma fila
        await this.checkExistingQueue();
        
        console.log('✅ Sistema de Fila em Tempo Real inicializado');
    }

    // Verificar usuário autenticado
    async checkAuthenticatedUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) throw error;
            
            if (user) {
                this.currentUser = user;
                console.log('👤 Usuário autenticado:', user.email);
            } else {
                console.log('❌ Usuário não autenticado');
            }
        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Listener para mudanças de autenticação
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.checkExistingQueue();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.clearQueue();
            }
        });
    }

    // Verificar se usuário já está em alguma fila
    async checkExistingQueue() {
        if (!this.currentUser) return;

        try {
            const { data, error } = await supabase
                .from('consultation_queue')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'WAITING')
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                console.log('🔄 Usuário já está em fila:', data);
                
                // Buscar dados da consulta separadamente
                if (data.consultation_id) {
                    const { data: consultationData } = await supabase
                        .from('consultations')
                        .select('*')
                        .eq('id', data.consultation_id)
                        .single();
                    
                    this.currentAppointment = consultationData;
                } else {
                    this.currentAppointment = null;
                }
                
                this.isInQueue = true;
                this.queuePosition = data.position;
                this.estimatedWaitTime = data.estimated_wait_time;
                
                // Mostrar interface de fila
                this.showQueueInterface();
                
                // Iniciar monitoramento em tempo real
                this.startRealTimeMonitoring();
            }
        } catch (error) {
            console.error('❌ Erro ao verificar fila existente:', error);
        }
    }

    // Processar pagamento e entrar na fila
    async processPaymentAndJoinQueue(specialtyData, paymentData = null) {
        if (!this.currentUser) {
            alert('Você precisa estar logado para agendar uma consulta.');
            return false;
        }

        try {
            console.log('💳 Processando pagamento para:', specialtyData?.name || 'Especialidade');
            console.log('📊 Dados da especialidade recebidos:', specialtyData);
            
            // Validar dados obrigatórios
            if (!specialtyData) {
                throw new Error('Dados da especialidade não fornecidos');
            }
            
            if (!specialtyData.price || isNaN(parseFloat(specialtyData.price))) {
                throw new Error('Preço da especialidade inválido: ' + specialtyData.price);
            }
            
            if (parseFloat(specialtyData.price) <= 0) {
                throw new Error('Preço deve ser maior que zero: ' + specialtyData.price);
            }

            // Mostrar loading de pagamento
            this.showPaymentLoading();

            // Processar pagamento com Mercado Pago
            const paymentResult = await this.processPaymentWithMercadoPago(specialtyData, paymentData);
            
            if (!paymentResult.success) {
                throw new Error(paymentResult.error || 'Falha no pagamento');
            }

            // Criar consulta no banco de dados
            const appointment = await this.createAppointment(specialtyData, paymentResult);
            
            // Adicionar à fila
            const queueEntry = await this.addToQueue(appointment);
            
            // Configurar estado atual
            this.currentAppointment = appointment;
            this.isInQueue = true;
            this.queuePosition = queueEntry.position;
            this.estimatedWaitTime = queueEntry.estimated_wait_time;

            // Esconder loading
            this.hidePaymentLoading();

            // Mostrar interface de fila
            this.showQueueInterface();

            // Iniciar monitoramento em tempo real
            this.startRealTimeMonitoring();

            console.log('✅ Pagamento processado e usuário adicionado à fila');
            return true;

        } catch (error) {
            console.error('❌ Erro no processamento:', error);
            this.hidePaymentLoading();
            alert('Erro ao processar pagamento: ' + error.message);
            return false;
        }
    }

    // Processar pagamento com Mercado Pago
    async processPaymentWithMercadoPago(specialtyData, paymentData = null) {
        try {
            console.log('💳 Iniciando pagamento com Mercado Pago...');

            // Criar modal de pagamento Mercado Pago
            const paymentResult = await this.showMercadoPagoModal(specialtyData);
            
            return paymentResult;

        } catch (error) {
            console.error('❌ Erro no pagamento Mercado Pago:', error);
            return {
                success: false,
                error: error.message || 'Erro no processamento do pagamento'
            };
        }
    }

    // Mostrar modal de pagamento Mercado Pago
    async showMercadoPagoModal(specialtyData) {
        return new Promise((resolve) => {
            // Criar modal de pagamento
            const modal = this.createMercadoPagoModal(specialtyData, resolve);
            document.body.appendChild(modal);

            // Inicializar Mercado Pago
            this.initializeMercadoPago(specialtyData, resolve);
        });
    }

    // Criar modal de pagamento Mercado Pago
    createMercadoPagoModal(specialtyData, resolve) {
        const modal = document.createElement('div');
        modal.id = 'mercadoPagoModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <span class="text-3xl mr-3">💳</span>
                            <div>
                                <h2 class="text-xl font-bold text-gray-900">Pagamento Seguro</h2>
                                <p class="text-gray-600">Mercado Pago</p>
                            </div>
                        </div>
                        <button onclick="this.closest('#mercadoPagoModal').remove(); resolve({success: false, error: 'Pagamento cancelado'})" 
                                class="text-gray-400 hover:text-gray-600 text-xl">×</button>
                    </div>
                </div>

                <!-- Detalhes da Consulta -->
                <div class="p-6 border-b border-gray-200">
                    <h3 class="font-bold text-gray-900 mb-3">📋 Detalhes da Consulta</h3>
                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-gray-600">Especialidade:</span>
                            <span class="font-medium">${specialtyData?.name || 'Consulta Médica'}</span>
                        </div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-gray-600">Duração:</span>
                            <span class="font-medium">${specialtyData?.duration || 30} min</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600 text-lg font-bold">Total:</span>
                            <span class="text-2xl font-bold text-green-600">R$ ${parseFloat(specialtyData?.price || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <!-- Container do Mercado Pago -->
                <div class="p-6">
                    <div id="cardPaymentBrick_container"></div>
                    
                    <!-- Loading -->
                    <div id="mpLoading" class="text-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p class="text-gray-600">Carregando formulário de pagamento...</p>
                    </div>

                    <!-- Botão de Preenchimento Automático -->
                    <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div class="flex items-center justify-between">
                            <div class="text-sm text-yellow-800">
                                <strong>💡 Dados de Teste MVP:</strong><br>
                                <span class="text-xs">TESTUSER1621783976 • 5031 4332 1540 6351 • 123 • 11/30</span>
                            </div>
                            <button onclick="
                                // Carregar e executar o sistema de auto-preenchimento melhorado
                                if (typeof fillMercadoPagoTestData === 'function') {
                                    fillMercadoPagoTestData();
                                } else {
                                    // Carregar script se não estiver disponível
                                    const script = document.createElement('script');
                                    script.src = 'js/mercado-pago-autofill-final.js';
                                    script.onload = () => {
                                        if (typeof fillMercadoPagoTestData === 'function') {
                                            fillMercadoPagoTestData();
                                        }
                                    };
                                    document.head.appendChild(script);
                                }
                            " 
                                    class="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors">
                                ⚡ Preencher
                            </button>
                        </div>
                    </div>

                    <!-- Botões -->
                    <div class="mt-6 flex space-x-4">
                        <button onclick="this.closest('#mercadoPagoModal').remove(); resolve({success: false, error: 'Pagamento cancelado'})" 
                                class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button id="mpPayButton" onclick="window.mpBrickController?.getFormData()" disabled
                                class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium">
                            💳 Pagar Agora
                        </button>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    // Inicializar Mercado Pago
    async initializeMercadoPago(specialtyData, resolve) {
        try {
            // Carregar SDK do Mercado Pago se não estiver carregado
            if (!window.MercadoPago) {
                await this.loadMercadoPagoSDK();
            }

            // Configurar Mercado Pago
            const mp = new MercadoPago('TEST-f3632b3e-aaf2-439b-89ee-d445d6acf932', {
                locale: 'pt-BR'
            });

            // Configurar Card Payment Brick
            const bricksBuilder = mp.bricks();
            
            const renderCardPaymentBrick = async () => {
                // Validar dados obrigatórios
                const amount = parseFloat(specialtyData?.price || 0);
                const email = this.currentUser?.email || 'test@test.com';
                
                console.log('💰 Configurando pagamento:', { amount, email, specialtyData });
                
                if (!amount || amount <= 0) {
                    throw new Error('Valor da consulta inválido');
                }

                const settings = {
                    initialization: {
                        amount: amount,
                        payer: {
                            email: email
                        }
                    },
                    customization: {
                        visual: {
                            style: {
                                theme: 'default'
                            }
                        },
                        paymentMethods: {
                            creditCard: 'all',
                            debitCard: 'all'
                        }
                    },
                    callbacks: {
                        onReady: () => {
                            console.log('✅ Mercado Pago Brick carregado');
                            document.getElementById('mpLoading').style.display = 'none';
                            document.getElementById('mpPayButton').disabled = false;
                            
                            // Dados carregados - botão de preenchimento disponível
                        },
                        onSubmit: async (cardFormData) => {
                            console.log('💳 Processando pagamento...', cardFormData);
                            
                            try {
                                // Processar pagamento
                                const paymentResult = await this.processMercadoPagoPayment(cardFormData, specialtyData);
                                
                                // Fechar modal
                                document.getElementById('mercadoPagoModal').remove();
                                
                                // Resolver promise
                                resolve(paymentResult);
                                
                            } catch (error) {
                                console.error('❌ Erro no pagamento:', error);
                                alert('Erro no pagamento: ' + error.message);
                                resolve({
                                    success: false,
                                    error: error.message
                                });
                            }
                        },
                        onError: (error) => {
                            console.error('❌ Erro no Mercado Pago Brick:', error);
                            alert('Erro no formulário de pagamento. Tente novamente.');
                        }
                    }
                };

                window.mpBrickController = await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', settings);
            };

            await renderCardPaymentBrick();

        } catch (error) {
            console.error('❌ Erro ao inicializar Mercado Pago:', error);
            document.getElementById('mpLoading').innerHTML = `
                <div class="text-center py-8 text-red-600">
                    <div class="text-4xl mb-2">❌</div>
                    <p>Erro ao carregar pagamento</p>
                    <p class="text-sm mt-2">${error.message}</p>
                </div>
            `;
        }
    }

    // Carregar SDK do Mercado Pago
    loadMercadoPagoSDK() {
        return new Promise((resolve, reject) => {
            if (window.MercadoPago) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://sdk.mercadopago.com/js/v2';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Falha ao carregar SDK do Mercado Pago'));
            document.head.appendChild(script);
        });
    }

    // Processar pagamento no Mercado Pago
    async processMercadoPagoPayment(cardFormData, specialtyData) {
        try {
            console.log('🔄 Enviando dados para processamento...');

            // Simular chamada para backend (você deve implementar seu backend)
            const paymentData = {
                token: cardFormData.token,
                transaction_amount: parseFloat(specialtyData?.price || 0),
                description: `Consulta - ${specialtyData?.name || 'Consulta Médica'}`,
                payment_method_id: cardFormData.payment_method_id,
                payer: {
                    email: this.currentUser?.email || 'test@test.com'
                },
                installments: cardFormData.installments,
                issuer_id: cardFormData.issuer_id
            };

            // Por enquanto, simular sucesso (você deve implementar a chamada real para seu backend)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simular resposta do Mercado Pago
            const success = Math.random() > 0.1; // 90% de sucesso

            if (success) {
                return {
                    success: true,
                    transactionId: 'MP_' + Date.now(),
                    paymentMethod: cardFormData.payment_method_id,
                    amount: specialtyData?.price || 0,
                    status: 'approved',
                    mercadoPagoData: paymentData
                };
            } else {
                throw new Error('Pagamento recusado. Verifique os dados do cartão.');
            }

        } catch (error) {
            console.error('❌ Erro no processamento:', error);
            throw error;
        }
    }

    // Simular pagamento (fallback)
    async simulatePayment(specialtyData, paymentData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular 95% de sucesso
                if (Math.random() > 0.05) {
                    resolve({
                        success: true,
                        transactionId: 'TXN_' + Date.now(),
                        paymentMethod: 'credit_card',
                        amount: specialtyData.price,
                        status: 'approved'
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Cartão recusado. Tente outro cartão.'
                    });
                }
            }, 2000);
        });
    }

    // Criar consulta no banco de dados
    async createAppointment(specialtyData, paymentResult) {
        try {
            const appointmentData = {
                user_id: this.currentUser.id,
                specialty_id: specialtyData?.id || null,
                scheduled_date: new Date().toISOString().split('T')[0],
                scheduled_time: new Date().toTimeString().split(' ')[0],
                duration: specialtyData?.duration || 30,
                status: 'scheduled', // Changed from 'paid' to 'scheduled' (valid status)
                type: 'video',
                price: specialtyData?.price || 0,
                payment_id: paymentResult.transactionId
                // Removed created_at as it has a default value
            };

            const { data, error } = await supabase
                .from('consultations')
                .insert([appointmentData])
                .select('*')
                .single();

            if (error) throw error;

            console.log('✅ Consulta criada:', data.id);
            return data;

        } catch (error) {
            console.error('❌ Erro ao criar consulta:', error);
            throw new Error('Erro ao criar consulta no sistema');
        }
    }

    // Adicionar à fila
    async addToQueue(appointment) {
        try {
            // Obter próxima posição na fila para esta especialidade
            const { data: queueData } = await supabase
                .from('consultation_queue')
                .select('position')
                .eq('specialty_id', appointment.specialty_id)
                .eq('status', 'waiting')
                .order('position', { ascending: false })
                .limit(1);

            const nextPosition = queueData && queueData.length > 0 ? queueData[0].position + 1 : 1;
            const estimatedWaitTime = nextPosition * 10; // 10 min por posição

            const queueEntry = {
                appointment_id: appointment.id,
                specialty_id: appointment.specialty_id,
                user_id: this.currentUser.id,
                position: nextPosition,
                estimated_wait_time: estimatedWaitTime,
                status: 'waiting',
                joined_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('consultation_queue')
                .insert([queueEntry])
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Adicionado à fila na posição:', nextPosition);
            return data;

        } catch (error) {
            console.error('❌ Erro ao adicionar à fila:', error);
            throw new Error('Erro ao entrar na fila de espera');
        }
    }

    // Iniciar monitoramento em tempo real
    startRealTimeMonitoring() {
        if (!this.currentUser || !this.currentAppointment) return;

        console.log('🔄 Iniciando monitoramento em tempo real...');

        // Subscription para mudanças na fila
        this.queueSubscription = supabase
            .channel('queue-updates')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'consultation_queue',
                filter: `user_id=eq.${this.currentUser.id}`
            }, (payload) => {
                console.log('🔄 Atualização da fila:', payload);
                this.handleQueueUpdate(payload);
            })
            .subscribe();

        // Subscription para notificações
        this.notificationSubscription = supabase
            .channel('user-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${this.currentUser.id}`
            }, (payload) => {
                console.log('📢 Nova notificação:', payload);
                this.handleNotification(payload.new);
            })
            .subscribe();

        // Subscription para status de médicos
        this.doctorSubscription = supabase
            .channel('doctor-status')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'doctors',
                filter: `specialty_id=eq.${this.currentAppointment.specialty_id}`
            }, (payload) => {
                console.log('👨‍⚕️ Status do médico atualizado:', payload);
                this.updateDoctorAvailability(payload.new);
            })
            .subscribe();

        console.log('✅ Monitoramento em tempo real ativo');
    }

    // Lidar com atualizações da fila
    handleQueueUpdate(payload) {
        const { eventType, new: newData, old: oldData } = payload;

        switch (eventType) {
            case 'UPDATE':
                if (newData.status === 'ready') {
                    // É a vez do usuário
                    this.showConsultationReady(newData);
                } else {
                    // Atualizar posição
                    this.updateQueuePosition(newData);
                }
                break;
            
            case 'DELETE':
                // Usuário foi removido da fila
                this.handleQueueRemoval();
                break;
        }
    }

    // Atualizar posição na fila
    updateQueuePosition(queueData) {
        const oldPosition = this.queuePosition;
        this.queuePosition = queueData.position;
        this.estimatedWaitTime = queueData.estimated_wait_time;

        // Atualizar interface
        this.updateQueueInterface();

        // Notificações baseadas na posição
        if (this.queuePosition <= 3 && oldPosition > 3) {
            this.showPreparationNotification();
        }

        if (this.queuePosition === 1 && oldPosition > 1) {
            this.showNextInLineNotification();
        }
    }

    // Mostrar que é a vez do usuário
    async showConsultationReady(queueData) {
        try {
            // Buscar dados do médico
            const doctorData = await this.getAssignedDoctor();
            
            // Esconder interface de fila
            this.hideQueueInterface();
            
            // Mostrar notificação de consulta pronta
            this.showConsultationNotification(doctorData);
            
            // Tocar som de notificação
            this.playNotificationSound();
            
        } catch (error) {
            console.error('❌ Erro ao mostrar consulta pronta:', error);
        }
    }

    // Buscar médico designado
    async getAssignedDoctor() {
        try {
            // Simular designação de médico
            const doctors = [
                { 
                    name: 'Dr. João Silva', 
                    crm: '12345-SP', 
                    specialty: this.currentAppointment.specialties?.name || 'Medicina Geral',
                    rating: 4.8,
                    experience: 15
                },
                { 
                    name: 'Dra. Maria Santos', 
                    crm: '67890-RJ', 
                    specialty: this.currentAppointment.specialties?.name || 'Medicina Geral',
                    rating: 4.9,
                    experience: 12
                },
                { 
                    name: 'Dr. Pedro Costa', 
                    crm: '11111-MG', 
                    specialty: this.currentAppointment.specialties?.name || 'Medicina Geral',
                    rating: 4.7,
                    experience: 20
                }
            ];

            return doctors[Math.floor(Math.random() * doctors.length)];
        } catch (error) {
            console.error('❌ Erro ao buscar médico:', error);
            return {
                name: 'Dr. Médico',
                crm: '00000-XX',
                specialty: 'Medicina Geral',
                rating: 4.5,
                experience: 10
            };
        }
    }

    // Mostrar interface de fila
    showQueueInterface() {
        // Verificar se modal já existe
        let queueModal = document.getElementById('realTimeQueueModal');
        
        if (!queueModal) {
            // Criar modal de fila
            queueModal = this.createQueueModal();
            document.body.appendChild(queueModal);
        }

        // Atualizar dados
        this.updateQueueInterface();

        // Mostrar modal
        queueModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        console.log('✅ Interface de fila exibida');
    }

    // Criar modal de fila
    createQueueModal() {
        const modal = document.createElement('div');
        modal.id = 'realTimeQueueModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <span id="queueSpecialtyIcon" class="text-3xl mr-3">🏥</span>
                            <div>
                                <h2 class="text-xl font-bold text-gray-900">Fila de Atendimento</h2>
                                <p id="queueSpecialtyName" class="text-gray-600">Especialidade</p>
                            </div>
                        </div>
                        <button onclick="closeQueueModal()" class="text-gray-400 hover:text-gray-600 text-xl" title="Fechar">×</button>
                    </div>
                </div>

                <!-- Conteúdo -->
                <div class="p-6">
                    <!-- Posição na Fila -->
                    <div class="text-center mb-6">
                        <div id="queuePositionDisplay" class="text-5xl font-bold text-blue-600 mb-2">0</div>
                        <p class="text-gray-600">Sua posição na fila</p>
                    </div>

                    <!-- Tempo Estimado -->
                    <div class="bg-blue-50 rounded-lg p-4 mb-6">
                        <div class="flex items-center justify-between">
                            <span class="font-medium text-blue-900">Tempo estimado:</span>
                            <span id="queueTimeDisplay" class="text-xl font-bold text-blue-600">0 min</span>
                        </div>
                    </div>

                    <!-- Status -->
                    <div id="queueStatusDisplay" class="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200 mb-6">
                        <div class="text-yellow-800 font-medium">⏳ Aguardando na fila...</div>
                    </div>

                    <!-- Informações da Consulta -->
                    <div class="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 class="font-bold text-gray-900 mb-3">📋 Detalhes da Consulta</h3>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Data:</span>
                                <span id="queueConsultationDate" class="font-medium">Hoje</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Valor:</span>
                                <span id="queueConsultationPrice" class="font-medium text-green-600">R$ 0,00</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">ID:</span>
                                <span id="queueConsultationId" class="font-medium text-xs">-</span>
                            </div>
                        </div>
                    </div>

                    <!-- Preparação -->
                    <div class="bg-green-50 rounded-lg p-4">
                        <h3 class="font-bold text-green-900 mb-3">✅ Enquanto aguarda</h3>
                        <ul class="text-sm text-green-800 space-y-1">
                            <li>• Teste sua câmera e microfone</li>
                            <li>• Tenha seus documentos em mãos</li>
                            <li>• Encontre um local silencioso</li>
                            <li>• Prepare suas dúvidas</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    // Atualizar interface de fila
    updateQueueInterface() {
        if (!this.currentAppointment) return;

        // Atualizar posição
        const positionDisplay = document.getElementById('queuePositionDisplay');
        if (positionDisplay) {
            positionDisplay.textContent = this.queuePosition;
        }

        // Atualizar tempo
        const timeDisplay = document.getElementById('queueTimeDisplay');
        if (timeDisplay) {
            timeDisplay.textContent = `${this.estimatedWaitTime} min`;
        }

        // Atualizar especialidade
        const specialtyIcon = document.getElementById('queueSpecialtyIcon');
        const specialtyName = document.getElementById('queueSpecialtyName');
        if (specialtyIcon && specialtyName) {
            specialtyIcon.textContent = this.currentAppointment.specialties?.icon || '🏥';
            specialtyName.textContent = this.currentAppointment.specialties?.name || 'Consulta Médica';
        }

        // Atualizar detalhes
        const consultationDate = document.getElementById('queueConsultationDate');
        const consultationPrice = document.getElementById('queueConsultationPrice');
        const consultationId = document.getElementById('queueConsultationId');
        
        if (consultationDate) {
            consultationDate.textContent = new Date().toLocaleDateString('pt-BR');
        }
        if (consultationPrice) {
            consultationPrice.textContent = `R$ ${parseFloat(this.currentAppointment.price).toFixed(2)}`;
        }
        if (consultationId) {
            consultationId.textContent = this.currentAppointment.id.substring(0, 8) + '...';
        }

        // Atualizar status baseado na posição
        this.updateQueueStatus();
    }

    // Atualizar status da fila
    updateQueueStatus() {
        const statusDisplay = document.getElementById('queueStatusDisplay');
        if (!statusDisplay) return;

        if (this.queuePosition === 1) {
            statusDisplay.innerHTML = '<div class="text-green-800 font-medium">🟢 Você é o próximo! Mantenha-se pronto</div>';
            statusDisplay.className = 'text-center p-4 rounded-lg bg-green-50 border border-green-200 mb-6';
        } else if (this.queuePosition <= 3) {
            statusDisplay.innerHTML = '<div class="text-orange-800 font-medium">🟡 Quase sua vez! Prepare-se</div>';
            statusDisplay.className = 'text-center p-4 rounded-lg bg-orange-50 border border-orange-200 mb-6';
        } else {
            statusDisplay.innerHTML = '<div class="text-yellow-800 font-medium">⏳ Aguardando na fila...</div>';
            statusDisplay.className = 'text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200 mb-6';
        }
    }

    // Esconder interface de fila
    hideQueueInterface() {
        const queueModal = document.getElementById('realTimeQueueModal');
        if (queueModal) {
            queueModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    // Fechar modal sem sair da fila
    closeModal() {
        console.log('🚪 Fechando modal da fila (sem sair da fila)...');
        const queueModal = document.getElementById('realTimeQueueModal');
        if (queueModal) {
            queueModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    // Mostrar notificação de consulta pronta
    showConsultationNotification(doctorData) {
        console.log('📞 Mostrando notificação de consulta pronta:', doctorData);
        
        // Usar a modal existente no HTML
        const notificationModal = document.getElementById('consultationNotification');
        
        if (!notificationModal) {
            console.error('❌ Modal consultationNotification não encontrada!');
            return;
        }

        // Preencher dados do médico usando os IDs corretos do HTML
        const doctorNameEl = document.getElementById('doctorName');
        const doctorSpecialtyEl = document.getElementById('doctorSpecialty');
        const doctorCrmEl = document.getElementById('doctorCrm');
        
        if (doctorNameEl) doctorNameEl.textContent = doctorData.name || 'Dr. João Silva';
        if (doctorSpecialtyEl) doctorSpecialtyEl.textContent = doctorData.specialty || 'Medicina Geral';
        if (doctorCrmEl) doctorCrmEl.textContent = doctorData.crm || '12345-SP';

        // Mostrar modal
        notificationModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Tocar som de notificação
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            audio.play().catch(() => {}); // Ignorar erros de autoplay
        } catch (error) {
            console.log('Som de notificação não disponível');
        }

        console.log('✅ Notificação de consulta pronta exibida');
    }

    // Criar modal de notificação de consulta pronta
    createConsultationNotificationModal() {
        const modal = document.createElement('div');
        modal.id = 'consultationReadyModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center';
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl max-w-md w-full mx-4 text-center animate-pulse">
                <div class="p-6">
                    <div class="text-6xl mb-4">📞</div>
                    <h2 class="text-2xl font-bold text-green-600 mb-4">Sua Consulta Está Pronta!</h2>
                    <p class="text-gray-600 mb-6">O médico está aguardando você na sala de consulta.</p>
                    
                    <!-- Dados do Médico -->
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                        <h3 class="font-bold text-green-900 mb-3">👨‍⚕️ Seu Médico</h3>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-green-700">Nome:</span>
                                <span id="readyDoctorName" class="font-medium">Dr. João Silva</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-green-700">Especialidade:</span>
                                <span id="readyDoctorSpecialty" class="font-medium">Cardiologia</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-green-700">CRM:</span>
                                <span id="readyDoctorCrm" class="font-medium">12345-SP</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-green-700">Avaliação:</span>
                                <span id="readyDoctorRating" class="font-medium">4.8 ⭐</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-green-700">Experiência:</span>
                                <span id="readyDoctorExperience" class="font-medium">15 anos</span>
                            </div>
                        </div>
                    </div>

                    <!-- Botões -->
                    <div class="flex space-x-4">
                        <button onclick="realTimeQueue.declineConsultation()" 
                                class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Não Posso Agora
                        </button>
                        <button onclick="realTimeQueue.startVideoConsultation()" 
                                class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                            🎥 Entrar na Consulta
                        </button>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    // Iniciar videoconsulta
    startVideoConsultation() {
        try {
            console.log('🎥 Iniciando videoconsulta...');

            // Fechar modal de notificação
            const notificationModal = document.getElementById('consultationReadyModal');
            if (notificationModal) {
                notificationModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }

            // Gerar sala única
            const roomName = `consultation-${this.currentAppointment.id}`;
            
            // Abrir Jitsi Meet
            const jitsiUrl = `https://8x8.vc/${roomName}`;
            const videoWindow = window.open(jitsiUrl, '_blank', 'width=1200,height=800');
            
            if (videoWindow) {
                console.log('✅ Videoconsulta iniciada:', roomName);
                
                // Atualizar status da consulta
                this.updateAppointmentStatus('in_progress');
                
                // Mostrar confirmação
                this.showSuccessNotification('Videoconsulta iniciada com sucesso!');
                
                // Limpar fila
                this.clearQueue();
                
            } else {
                throw new Error('Não foi possível abrir a videochamada. Verifique se pop-ups estão bloqueados.');
            }

        } catch (error) {
            console.error('❌ Erro ao iniciar videoconsulta:', error);
            alert('Erro ao iniciar videoconsulta: ' + error.message);
        }
    }

    // Recusar consulta
    async declineConsultation() {
        if (confirm('Tem certeza que não pode atender agora? Você perderá sua posição na fila.')) {
            try {
                // Remover da fila
                await this.removeFromQueue();
                
                // Fechar modal
                const notificationModal = document.getElementById('consultationReadyModal');
                if (notificationModal) {
                    notificationModal.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                }
                
                // Limpar estado
                this.clearQueue();
                
                console.log('❌ Consulta recusada pelo usuário');
                alert('Consulta cancelada. Você pode agendar uma nova consulta a qualquer momento.');
                
            } catch (error) {
                console.error('❌ Erro ao recusar consulta:', error);
                alert('Erro ao cancelar consulta. Tente novamente.');
            }
        }
    }

    // Sair da fila
    async exitQueue() {
        if (confirm('Tem certeza que deseja sair da fila? Você perderá sua posição.')) {
            try {
                await this.removeFromQueue();
                this.hideQueueInterface();
                this.clearQueue();
                
                console.log('👋 Usuário saiu da fila');
                
            } catch (error) {
                console.error('❌ Erro ao sair da fila:', error);
                alert('Erro ao sair da fila. Tente novamente.');
            }
        }
    }

    // Remover da fila
    async removeFromQueue() {
        if (!this.currentUser || !this.currentAppointment) return;

        try {
            const { error } = await supabase
                .from('consultation_queue')
                .delete()
                .eq('user_id', this.currentUser.id)
                .eq('appointment_id', this.currentAppointment.id);

            if (error) throw error;

            console.log('✅ Removido da fila');

        } catch (error) {
            console.error('❌ Erro ao remover da fila:', error);
            throw error;
        }
    }

    // Atualizar status da consulta
    async updateAppointmentStatus(status) {
        if (!this.currentAppointment) return;

        try {
            const { error } = await supabase
                .from('appointments')
                .update({ 
                    status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentAppointment.id);

            if (error) throw error;

            console.log('✅ Status da consulta atualizado:', status);

        } catch (error) {
            console.error('❌ Erro ao atualizar status:', error);
        }
    }

    // Limpar estado da fila
    clearQueue() {
        this.currentAppointment = null;
        this.isInQueue = false;
        this.queuePosition = 0;
        this.estimatedWaitTime = 0;

        // Parar subscriptions
        if (this.queueSubscription) {
            this.queueSubscription.unsubscribe();
            this.queueSubscription = null;
        }
        if (this.notificationSubscription) {
            this.notificationSubscription.unsubscribe();
            this.notificationSubscription = null;
        }
        if (this.doctorSubscription) {
            this.doctorSubscription.unsubscribe();
            this.doctorSubscription = null;
        }
    }

    // Mostrar loading de pagamento
    showPaymentLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'paymentLoading';
        loadingDiv.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        loadingDiv.innerHTML = `
            <div class="bg-white rounded-xl p-8 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <h3 class="text-lg font-bold text-gray-900">Processando Pagamento...</h3>
                <p class="text-gray-600">Aguarde um momento</p>
            </div>
        `;
        document.body.appendChild(loadingDiv);
    }

    // Esconder loading de pagamento
    hidePaymentLoading() {
        const loadingDiv = document.getElementById('paymentLoading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    // Mostrar notificação de sucesso
    showSuccessNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="text-xl mr-2">✅</span>
                <div>
                    <div class="font-bold">Sucesso!</div>
                    <div class="text-sm opacity-90">${message}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 5000);
    }

    // Tocar som de notificação
    playNotificationSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            audio.play().catch(() => {}); // Ignorar erros de autoplay
        } catch (error) {
            console.log('🔇 Som de notificação não disponível');
        }
    }

    // Mostrar notificação de preparação
    showPreparationNotification() {
        this.showSuccessNotification('Prepare-se! Você está entre os próximos 3 da fila.');
    }

    // Mostrar notificação de próximo na fila
    showNextInLineNotification() {
        this.showSuccessNotification('Você é o próximo! Mantenha-se pronto.');
        this.playNotificationSound();
    }

    // Lidar com notificações
    handleNotification(notification) {
        console.log('📢 Processando notificação:', notification);
        
        switch (notification.type) {
            case 'consultation_ready':
                // Já tratado pelo handleQueueUpdate
                break;
            case 'queue_position_update':
                this.showSuccessNotification(notification.message);
                break;
            default:
                console.log('📢 Notificação genérica:', notification.message);
        }
    }

    // Atualizar disponibilidade de médicos
    updateDoctorAvailability(doctorData) {
        console.log('👨‍⚕️ Disponibilidade de médico atualizada:', doctorData);
        // Implementar lógica de atualização se necessário
    }

    // Lidar com remoção da fila
    handleQueueRemoval() {
        console.log('❌ Usuário removido da fila');
        this.hideQueueInterface();
        this.clearQueue();
        alert('Você foi removido da fila. Entre em contato com o suporte se isso foi um erro.');
    }

    // Função otimizada para preencher campos específicos do Mercado Pago
    fillTestDataFixed() {
        console.log('⚡ Preenchendo campos específicos do Mercado Pago (versão otimizada)...');
        
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
                this.showAutoFillNotification('❌ Formulário não encontrado', 'error');
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

                // Identificar campos por placeholder (baseado na imagem do formulário)
                if (placeholder.includes('1234 1234 1234 1234') || placeholder.includes('1234')) {
                    if (fillField(input, testData.cardNumber, delay)) {
                        filledCount++;
                        console.log('✅ Número do cartão preenchido');
                        delay += 200;
                    }
                }
                else if (placeholder.includes('mm/aa') || placeholder.includes('mm/yy')) {
                    if (fillField(input, testData.expirationDate, delay)) {
                        filledCount++;
                        console.log('✅ Data de vencimento preenchida');
                        delay += 200;
                    }
                }
                else if (placeholder.includes('ex.: 123') || placeholder.includes('123') || placeholder.includes('cvv')) {
                    if (fillField(input, testData.securityCode, delay)) {
                        filledCount++;
                        console.log('✅ Código de segurança preenchido');
                        delay += 200;
                    }
                }
                else if (name === 'holder_name' || (inputMode === 'text' && !placeholder.includes('1234'))) {
                    if (fillField(input, testData.cardholderName, delay)) {
                        filledCount++;
                        console.log('✅ Nome do titular preenchido');
                        delay += 200;
                    }
                }
                else if (name === 'document' || (inputMode === 'numeric' && placeholder.includes('999.999.999'))) {
                    if (fillField(input, testData.identificationNumber, delay)) {
                        filledCount++;
                        console.log('✅ CPF preenchido');
                        delay += 200;
                    }
                }
                // Identificação por name como fallback
                else if (name === 'cardnumber' || name === 'card_number') {
                    if (fillField(input, testData.cardNumber, delay)) {
                        filledCount++;
                        console.log('✅ Número do cartão preenchido (name)');
                        delay += 200;
                    }
                }
                else if (name === 'expirationdate' || name === 'expiration_date') {
                    if (fillField(input, testData.expirationDate, delay)) {
                        filledCount++;
                        console.log('✅ Data de vencimento preenchida (name)');
                        delay += 200;
                    }
                }
                else if (name === 'securitycode' || name === 'security_code') {
                    if (fillField(input, testData.securityCode, delay)) {
                        filledCount++;
                        console.log('✅ Código de segurança preenchido (name)');
                        delay += 200;
                    }
                }
            });

            // Resultado final
            setTimeout(() => {
                if (filledCount > 0) {
                    console.log(`✅ ${filledCount} campos preenchidos automaticamente`);
                    this.showAutoFillNotification(`✅ ${filledCount} campos preenchidos!`, 'success');
                } else {
                    console.log('⚠️ Nenhum campo foi preenchido automaticamente');
                    this.showAutoFillNotification('⚠️ Preencha manualmente', 'warning');
                }
            }, 1500);
        }, 500);
    }

    // Função para preencher dados de teste (chamada pelo botão)
    fillTestData() {
        console.log('⚡ Preenchendo dados de teste do Mercado Pago...');
        
        // Dados de teste do Mercado Pago
        const testData = {
            cardNumber: '5031433215406351',
            cardholderName: 'TESTUSER1621783976',
            expirationMonth: '11',
            expirationYear: '30',
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

        // Função para identificar o tipo de campo baseada nas informações fornecidas
        const identifyFieldType = (element) => {
            const placeholder = (element.placeholder || '').toLowerCase();
            const name = (element.name || '').toLowerCase();
            const id = (element.id || '').toLowerCase();
            const autocomplete = (element.autocomplete || '').toLowerCase();
            const type = element.type || '';
            const inputMode = (element.inputMode || '').toLowerCase();
            const maxLength = element.maxLength;
            
            // Log para debug
            console.log('Analisando campo:', {
                placeholder,
                name,
                id,
                autocomplete,
                type,
                inputMode,
                maxLength,
                element
            });
            
            // Identificar número do cartão - name="cardNumber" (exato)
            if (
                name === 'cardnumber' ||
                name === 'card_number' ||
                name.includes('cardnumber') ||
                placeholder.includes('número do cartão') ||
                placeholder.includes('numero do cartao') ||
                placeholder.includes('1234') ||
                autocomplete.includes('cc-number')
            ) {
                return 'cardNumber';
            }
            
            // Identificar nome no cartão - name="holder_name" ou inputmode="text"
            if (
                name === 'holder_name' ||
                name.includes('holder_name') ||
                inputMode === 'text' ||
                placeholder.includes('nome do titular') ||
                placeholder.includes('titular') ||
                placeholder.includes('nome') ||
                placeholder.includes('maria santos') ||
                autocomplete.includes('cc-name')
            ) {
                return 'cardholderName';
            }
            
            // Identificar código de segurança - name="securityCode" (exato)
            if (
                name === 'securitycode' ||
                name === 'security_code' ||
                name.includes('securitycode') ||
                placeholder.includes('código de segurança') ||
                placeholder.includes('codigo de seguranca') ||
                placeholder.includes('cvv') ||
                placeholder.includes('cvc') ||
                autocomplete.includes('cc-csc')
            ) {
                return 'securityCode';
            }
            
            // Identificar ano de vencimento - name="expirationYear"
            if (
                name === 'expirationyear' ||
                name.includes('expirationyear') ||
                placeholder.includes('ano de vencimento') ||
                placeholder.includes('ano') ||
                placeholder.includes('aa') ||
                placeholder.includes('yy') ||
                autocomplete.includes('cc-exp-year')
            ) {
                return 'expirationYear';
            }
            
            // Identificar mês de vencimento - name="expirationMonth" ou select
            if (
                name === 'expirationmonth' ||
                name.includes('expirationmonth') ||
                placeholder.includes('mês de vencimento') ||
                placeholder.includes('mes de vencimento') ||
                placeholder.includes('mês') ||
                placeholder.includes('mm') ||
                autocomplete.includes('cc-exp-month') ||
                (type === 'select-one' && element.options && element.options.length <= 13) // Select com meses
            ) {
                return 'expirationMonth';
            }
            
            // Identificar data de vencimento - name="expirationDate" (exato)
            if (
                name === 'expirationdate' ||
                name === 'expiration_date' ||
                name.includes('expirationdate') ||
                placeholder.includes('data de vencimento') ||
                placeholder.includes('mm/aa') ||
                placeholder.includes('mm/yy') ||
                placeholder.includes('validade')
            ) {
                return 'expirationDate';
            }
            
            // Identificar CPF - name="document" ou inputmode="numeric"
            if (
                name === 'document' ||
                name.includes('document') ||
                inputMode === 'numeric' ||
                placeholder.includes('cpf') ||
                placeholder.includes('documento') ||
                placeholder.includes('identification') ||
                placeholder.includes('999.999.999-99') ||
                name.includes('identification') ||
                name.includes('cpf')
            ) {
                return 'identificationNumber';
            }
            
            return 'unknown';
        };

        // Procurar e preencher campos
        setTimeout(() => {
            const container = document.getElementById('cardPaymentBrick_container');
            if (!container) {
                console.log('❌ Container do Mercado Pago não encontrado');
                this.showAutoFillNotification('❌ Formulário não encontrado', 'error');
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

            // Preencher campos identificados
            const fillOrder = [
                { type: 'cardNumber', value: testData.cardNumber, name: 'Número do Cartão' },
                { type: 'cardholderName', value: testData.cardholderName, name: 'Nome no Cartão' },
                { type: 'expirationDate', value: `${testData.expirationMonth}/${testData.expirationYear}`, name: 'Data de Vencimento' },
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

            // Se não conseguiu identificar campos, tentar por posição como fallback
            if (filledCount === 0 && allInputs.length >= 4) {
                console.log('🔄 Tentando preenchimento por posição como fallback...');
                
                // Assumir ordem padrão do Mercado Pago
                const fallbackMappings = [
                    { index: 0, value: testData.cardNumber, name: 'Número do Cartão (pos 0)' },
                    { index: 1, value: testData.cardholderName, name: 'Nome no Cartão (pos 1)' },
                    { index: 2, value: testData.expirationMonth, name: 'Mês (pos 2)' },
                    { index: 3, value: testData.expirationYear, name: 'Ano (pos 3)' },
                    { index: 4, value: testData.securityCode, name: 'CVV (pos 4)' },
                    { index: 5, value: testData.identificationNumber, name: 'CPF (pos 5)' }
                ];

                fallbackMappings.forEach(({ index, value, name }) => {
                    if (allInputs[index]) {
                        if (simulateTyping(allInputs[index], value, index * 200)) {
                            filledCount++;
                            console.log(`✅ ${name} preenchido por fallback`);
                        }
                    }
                });
            }

            // Resultado
            setTimeout(() => {
                if (filledCount > 0) {
                    console.log(`✅ ${filledCount} campos preenchidos`);
                    this.showAutoFillNotification(`✅ ${filledCount} campos preenchidos!`, 'success');
                } else {
                    console.log('⚠️ Nenhum campo foi preenchido');
                    this.showAutoFillNotification('⚠️ Preencha manualmente', 'warning');
                    
                    // Mostrar informações dos campos para debug
                    console.log('📋 Campos encontrados para debug:');
                    allInputs.forEach((input, index) => {
                        console.log(`Campo ${index}:`, {
                            placeholder: input.placeholder,
                            name: input.name,
                            id: input.id,
                            type: input.type,
                            autocomplete: input.autocomplete
                        });
                    });
                }
            }, 2000);
        }, 500);
    }

    // Auto-preencher dados de teste do Mercado Pago para MVP
    autoFillTestCardData() {
        try {
            console.log('🔄 Preenchendo dados de teste do Mercado Pago...');
            
            // Dados de teste do Mercado Pago
            const testCardData = {
                cardNumber: '5031433215406351', // Sem espaços para o Mercado Pago
                cardholderName: 'TESTUSER1621783976',
                expirationMonth: '11',
                expirationYear: '30',
                securityCode: '123',
                identificationType: 'CPF',
                identificationNumber: '12345678909'
            };

            // Função para preencher campo com simulação de digitação real
            const fillFieldAdvanced = (element, value) => {
                if (!element) return false;
                
                // Focar no campo
                element.focus();
                element.click();
                
                // Limpar campo existente
                element.value = '';
                
                // Simular digitação caractere por caractere
                let currentValue = '';
                for (let i = 0; i < value.length; i++) {
                    currentValue += value[i];
                    element.value = currentValue;
                    
                    // Disparar eventos para cada caractere
                    element.dispatchEvent(new KeyboardEvent('keydown', { key: value[i], bubbles: true }));
                    element.dispatchEvent(new KeyboardEvent('keypress', { key: value[i], bubbles: true }));
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new KeyboardEvent('keyup', { key: value[i], bubbles: true }));
                }
                
                // Eventos finais
                element.dispatchEvent(new Event('change', { bubbles: true }));
                element.dispatchEvent(new Event('blur', { bubbles: true }));
                
                return true;
            };

            // Tentar múltiplas vezes com diferentes delays
            const attemptFill = (attempt = 1) => {
                console.log(`🔄 Tentativa ${attempt} de preenchimento...`);
                
                // Procurar pelo container do Mercado Pago Brick
                const brickContainer = document.getElementById('cardPaymentBrick_container');
                if (!brickContainer) {
                    console.log('❌ Container do Mercado Pago não encontrado');
                    return;
                }
                
                console.log('✅ Container do Mercado Pago encontrado');
                
                // Seletores mais específicos para o Mercado Pago Brick atual
                const fieldSelectors = [
                    // Número do cartão - múltiplas variações
                    { 
                        selectors: [
                            'input[name="cardNumber"]',
                            'input[data-testid="form-input-cardNumber"]',
                            'input[placeholder*="1234"]',
                            'input[placeholder*="número"]',
                            'input[placeholder*="Número"]',
                            'input[autocomplete="cc-number"]',
                            'input[type="tel"][maxlength="19"]',
                            '#cardNumber',
                            '.card-number-input'
                        ], 
                        value: testCardData.cardNumber,
                        name: 'Número do Cartão'
                    },
                    
                    // Nome no cartão
                    { 
                        selectors: [
                            'input[name="cardholderName"]',
                            'input[data-testid="form-input-cardholderName"]',
                            'input[placeholder*="nome"]',
                            'input[placeholder*="Nome"]',
                            'input[autocomplete="cc-name"]',
                            '#cardholderName',
                            '.cardholder-name-input'
                        ], 
                        value: testCardData.cardholderName,
                        name: 'Nome no Cartão'
                    },
                    
                    // Mês de expiração
                    { 
                        selectors: [
                            'input[name="cardExpirationMonth"]',
                            'select[name="cardExpirationMonth"]',
                            'input[data-testid="form-input-cardExpirationMonth"]',
                            'input[placeholder*="MM"]',
                            'input[autocomplete="cc-exp-month"]',
                            '#cardExpirationMonth'
                        ], 
                        value: testCardData.expirationMonth,
                        name: 'Mês de Expiração'
                    },
                    
                    // Ano de expiração
                    { 
                        selectors: [
                            'input[name="cardExpirationYear"]',
                            'select[name="cardExpirationYear"]',
                            'input[data-testid="form-input-cardExpirationYear"]',
                            'input[placeholder*="AA"]',
                            'input[placeholder*="YY"]',
                            'input[autocomplete="cc-exp-year"]',
                            '#cardExpirationYear'
                        ], 
                        value: testCardData.expirationYear,
                        name: 'Ano de Expiração'
                    },
                    
                    // Código de segurança
                    { 
                        selectors: [
                            'input[name="securityCode"]',
                            'input[data-testid="form-input-securityCode"]',
                            'input[placeholder*="CVV"]',
                            'input[placeholder*="CVC"]',
                            'input[placeholder*="código"]',
                            'input[autocomplete="cc-csc"]',
                            '#securityCode',
                            '.security-code-input'
                        ], 
                        value: testCardData.securityCode,
                        name: 'Código de Segurança'
                    },
                    
                    // CPF
                    { 
                        selectors: [
                            'input[name="identificationType"]',
                            'input[name="identificationNumber"]',
                            'input[data-testid="form-input-identificationNumber"]',
                            'input[placeholder*="CPF"]',
                            'input[placeholder*="documento"]',
                            '#identificationNumber',
                            '.identification-input'
                        ], 
                        value: testCardData.identificationNumber,
                        name: 'CPF'
                    }
                ];

                let filledFields = 0;
                
                // Tentar preencher cada tipo de campo
                fieldSelectors.forEach(({ selectors, value, name }) => {
                    let fieldFilled = false;
                    
                    for (const selector of selectors) {
                        const field = document.querySelector(selector);
                        if (field && !fieldFilled) {
                            if (fillFieldAdvanced(field, value)) {
                                filledFields++;
                                fieldFilled = true;
                                console.log(`✅ ${name} preenchido: ${selector} = ${value}`);
                                break;
                            }
                        }
                    }
                    
                    if (!fieldFilled) {
                        console.log(`⚠️ ${name} não encontrado`);
                    }
                });

                // Procurar em todos os inputs visíveis como fallback
                if (filledFields === 0) {
                    console.log('🔍 Procurando campos por fallback...');
                    
                    const allInputs = brickContainer.querySelectorAll('input');
                    console.log(`📋 Encontrados ${allInputs.length} inputs no container`);
                    
                    allInputs.forEach((input, index) => {
                        console.log(`Input ${index}:`, {
                            name: input.name,
                            placeholder: input.placeholder,
                            type: input.type,
                            id: input.id,
                            className: input.className
                        });
                    });
                    
                    // Tentar preencher por posição (método de último recurso)
                    if (allInputs.length >= 4) {
                        const fieldMappings = [
                            { index: 0, value: testCardData.cardNumber, name: 'Número do Cartão (pos 0)' },
                            { index: 1, value: testCardData.cardholderName, name: 'Nome no Cartão (pos 1)' },
                            { index: 2, value: testCardData.expirationMonth, name: 'Mês (pos 2)' },
                            { index: 3, value: testCardData.expirationYear, name: 'Ano (pos 3)' },
                            { index: 4, value: testCardData.securityCode, name: 'CVV (pos 4)' },
                            { index: 5, value: testCardData.identificationNumber, name: 'CPF (pos 5)' }
                        ];
                        
                        fieldMappings.forEach(({ index, value, name }) => {
                            if (allInputs[index]) {
                                if (fillFieldAdvanced(allInputs[index], value)) {
                                    filledFields++;
                                    console.log(`✅ ${name} preenchido por posição`);
                                }
                            }
                        });
                    }
                }

                // Resultado final
                if (filledFields > 0) {
                    console.log(`✅ ${filledFields} campos preenchidos automaticamente`);
                    
                    // Mostrar notificação de sucesso
                    this.showAutoFillNotification(`✅ ${filledFields} campos preenchidos automaticamente!`, 'success');
                    
                } else {
                    console.log('⚠️ Nenhum campo foi preenchido automaticamente');
                    
                    // Tentar novamente se for a primeira tentativa
                    if (attempt < 3) {
                        setTimeout(() => attemptFill(attempt + 1), 2000);
                    } else {
                        this.showAutoFillNotification('⚠️ Preencha os dados manualmente', 'warning');
                    }
                }
            };

            // Iniciar tentativas de preenchimento
            setTimeout(() => attemptFill(1), 1500);

        } catch (error) {
            console.error('❌ Erro ao preencher dados de teste:', error);
            this.showAutoFillNotification('❌ Erro no preenchimento automático', 'error');
        }
    }

    // Mostrar notificação de preenchimento automático
    showAutoFillNotification(message, type = 'success') {
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
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.realTimeQueue = new RealTimeQueueSystem();
    window.currentRealTimeQueue = window.realTimeQueue; // Para acesso no botão
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealTimeQueueSystem;
}

// Função global para fechar modal da fila
function closeQueueModal() {
    console.log(' Fechando modal da fila...');
    
    const queueModal = document.getElementById('queueModal');
    if (queueModal) {
        queueModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        console.log(' Modal da fila fechado');
    } else {
        console.warn(' Modal da fila não encontrado');
    }
}