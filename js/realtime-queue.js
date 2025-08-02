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
                .select(`
                    *,
                    appointments (
                        id,
                        specialty_id,
                        price,
                        status,
                        specialties (name, icon)
                    )
                `)
                .eq('patient_id', this.currentUser.id)
                .eq('status', 'waiting')
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                console.log('🔄 Usuário já está em fila:', data);
                this.currentAppointment = data.appointments;
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
            console.log('💳 Processando pagamento para:', specialtyData.name);

            // Mostrar loading de pagamento
            this.showPaymentLoading();

            // Simular processamento de pagamento
            // TODO: Integrar com Mercado Pago API
            const paymentResult = await this.simulatePayment(specialtyData, paymentData);
            
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

    // Simular pagamento (será substituído pela integração com Mercado Pago)
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
                patient_id: this.currentUser.id,
                specialty_id: specialtyData.id,
                scheduled_date: new Date().toISOString().split('T')[0],
                scheduled_time: new Date().toTimeString().split(' ')[0],
                duration: specialtyData.duration || 30,
                status: 'paid',
                type: 'video',
                price: specialtyData.price,
                payment_id: paymentResult.transactionId,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('appointments')
                .insert([appointmentData])
                .select(`
                    *,
                    specialties (name, icon, description)
                `)
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
                patient_id: this.currentUser.id,
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
                filter: `patient_id=eq.${this.currentUser.id}`
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
                        <button onclick="realTimeQueue.exitQueue()" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
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

    // Mostrar notificação de consulta pronta
    showConsultationNotification(doctorData) {
        // Verificar se modal já existe
        let notificationModal = document.getElementById('consultationReadyModal');
        
        if (!notificationModal) {
            notificationModal = this.createConsultationNotificationModal();
            document.body.appendChild(notificationModal);
        }

        // Preencher dados do médico
        document.getElementById('readyDoctorName').textContent = doctorData.name;
        document.getElementById('readyDoctorSpecialty').textContent = doctorData.specialty;
        document.getElementById('readyDoctorCrm').textContent = doctorData.crm;
        document.getElementById('readyDoctorRating').textContent = `${doctorData.rating} ⭐`;
        document.getElementById('readyDoctorExperience').textContent = `${doctorData.experience} anos`;

        // Mostrar modal
        notificationModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        console.log('📞 Notificação de consulta pronta exibida');
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
                .eq('patient_id', this.currentUser.id)
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
            document.body.removeChild(loadingDiv);
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
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.realTimeQueue = new RealTimeQueueSystem();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealTimeQueueSystem;
}