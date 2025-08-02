// Sistema de Fila de Consultas com Jitsi Meet
// Gerencia fila em tempo real e integração com videochamadas

class QueueSystem {
    constructor() {
        this.currentQueueEntry = null;
        this.queueSubscription = null;
        this.notificationSubscription = null;
        this.jitsiConfig = {
            appId: 'vpaas-magic-cookie-d4eb95e56d4140978d223283225476be',
            apiKey: 'vpaas-magic-cookie-d4eb95e56d4140978d223283225476be/feda42'
        };
        this.init();
    }

    init() {
        this.createQueueInterface();
        console.log('⏳ Sistema de Fila inicializado');
    }

    // Criar interface da fila
    createQueueInterface() {
        const queueHTML = `
            <div id="queueInterface" class="fixed inset-0 bg-gray-50 hidden z-40">
                <!-- Header -->
                <div class="bg-white shadow-sm border-b">
                    <div class="max-w-4xl mx-auto px-4 py-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="text-2xl mr-3">⏳</div>
                                <div>
                                    <h1 class="text-xl font-bold text-gray-900">Fila de Atendimento</h1>
                                    <p class="text-sm text-gray-600">Aguarde sua vez para a consulta</p>
                                </div>
                            </div>
                            <button onclick="queueSystem.exitQueue()" 
                                    class="text-red-600 hover:text-red-700 font-medium">
                                Sair da Fila
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Conteúdo Principal -->
                <div class="max-w-4xl mx-auto px-4 py-8">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        <!-- Status da Fila -->
                        <div class="lg:col-span-2">
                            <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                                <h2 class="text-lg font-bold text-gray-900 mb-4">Sua Posição na Fila</h2>
                                
                                <!-- Posição Atual -->
                                <div class="text-center mb-6">
                                    <div id="queuePosition" class="text-6xl font-bold text-blue-600 mb-2">-</div>
                                    <p class="text-gray-600">Posição na fila</p>
                                </div>

                                <!-- Tempo Estimado -->
                                <div class="bg-blue-50 rounded-lg p-4 mb-6">
                                    <div class="flex items-center justify-between">
                                        <span class="font-medium text-blue-900">Tempo estimado:</span>
                                        <span id="estimatedTime" class="text-xl font-bold text-blue-600">-- min</span>
                                    </div>
                                </div>

                                <!-- Progresso Visual -->
                                <div class="mb-6">
                                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Progresso</span>
                                        <span id="progressText">0%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-3">
                                        <div id="progressBar" class="bg-blue-600 h-3 rounded-full transition-all duration-500" style="width: 0%"></div>
                                    </div>
                                </div>

                                <!-- Status -->
                                <div id="queueStatus" class="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                                    <div class="text-yellow-600 font-medium">⏳ Aguardando na fila...</div>
                                </div>
                            </div>

                            <!-- Detalhes da Consulta -->
                            <div class="bg-white rounded-xl shadow-lg p-6">
                                <h3 class="text-lg font-bold text-gray-900 mb-4">Detalhes da Consulta</h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Especialidade:</span>
                                        <span id="consultationSpecialty" class="font-medium">-</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Data:</span>
                                        <span id="consultationDate" class="font-medium">-</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Duração:</span>
                                        <span id="consultationDuration" class="font-medium">-</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">ID da Consulta:</span>
                                        <span id="consultationId" class="font-medium text-sm">-</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Painel Lateral -->
                        <div class="space-y-6">
                            
                            <!-- Notificações -->
                            <div class="bg-white rounded-xl shadow-lg p-6">
                                <h3 class="text-lg font-bold text-gray-900 mb-4">Notificações</h3>
                                <div id="queueNotifications" class="space-y-3">
                                    <div class="text-gray-500 text-center py-4">
                                        Nenhuma notificação ainda
                                    </div>
                                </div>
                            </div>

                            <!-- Preparação para Consulta -->
                            <div class="bg-white rounded-xl shadow-lg p-6">
                                <h3 class="text-lg font-bold text-gray-900 mb-4">Preparação</h3>
                                <div class="space-y-3 text-sm">
                                    <div class="flex items-center">
                                        <div class="text-green-500 mr-2">✓</div>
                                        <span>Teste sua câmera e microfone</span>
                                    </div>
                                    <div class="flex items-center">
                                        <div class="text-green-500 mr-2">✓</div>
                                        <span>Tenha seus documentos em mãos</span>
                                    </div>
                                    <div class="flex items-center">
                                        <div class="text-green-500 mr-2">✓</div>
                                        <span>Encontre um local silencioso</span>
                                    </div>
                                </div>
                                
                                <button onclick="queueSystem.testDevices()" 
                                        class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Testar Câmera/Microfone
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- Modal de Chamada -->
                <div id="callModal" class="fixed inset-0 bg-black bg-opacity-75 hidden z-50 flex items-center justify-center">
                    <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
                        <div class="text-6xl mb-4 animate-pulse">📞</div>
                        <h2 class="text-2xl font-bold text-green-600 mb-4">Sua Consulta Está Pronta!</h2>
                        <p class="text-gray-600 mb-6">O médico está aguardando você na sala de consulta.</p>
                        
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p class="text-sm text-green-800">
                                <strong>Médico:</strong> <span id="doctorName">Dr. João Silva</span><br>
                                <strong>Especialidade:</strong> <span id="doctorSpecialty">Cardiologia</span>
                            </p>
                        </div>

                        <div class="flex space-x-4">
                            <button onclick="queueSystem.declineCall()" 
                                    class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                Não Posso Agora
                            </button>
                            <button onclick="queueSystem.joinVideoCall()" 
                                    class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                                Entrar na Consulta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', queueHTML);
    }    /
/ Mostrar interface da fila
    async showQueueInterface(appointmentId) {
        try {
            // Buscar dados da consulta
            const appointmentData = await this.getAppointmentData(appointmentId);
            if (!appointmentData) {
                throw new Error('Consulta não encontrada');
            }

            // Buscar posição na fila
            const queueData = await this.getQueueData(appointmentId);
            if (!queueData) {
                throw new Error('Posição na fila não encontrada');
            }

            this.currentQueueEntry = queueData;

            // Preencher dados na interface
            this.updateQueueInterface(appointmentData, queueData);

            // Mostrar interface
            document.getElementById('queueInterface').classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            // Iniciar monitoramento em tempo real
            this.startRealTimeUpdates();

            console.log('✅ Interface da fila exibida');

        } catch (error) {
            console.error('❌ Erro ao mostrar fila:', error);
            alert('Erro ao carregar fila de espera. Tente novamente.');
        }
    }

    // Buscar dados da consulta
    async getAppointmentData(appointmentId) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    specialties (name, duration)
                `)
                .eq('id', appointmentId)
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('❌ Erro ao buscar consulta:', error);
            return null;
        }
    }

    // Buscar dados da fila
    async getQueueData(appointmentId) {
        try {
            const { data, error } = await supabase
                .from('consultation_queue')
                .select('*')
                .eq('appointment_id', appointmentId)
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('❌ Erro ao buscar fila:', error);
            return null;
        }
    }

    // Atualizar interface da fila
    updateQueueInterface(appointmentData, queueData) {
        // Atualizar posição
        document.getElementById('queuePosition').textContent = queueData.position;
        
        // Atualizar tempo estimado
        const estimatedMinutes = queueData.estimated_wait_time || (queueData.position * 15);
        document.getElementById('estimatedTime').textContent = `${estimatedMinutes} min`;

        // Atualizar progresso (simulado)
        const totalInQueue = queueData.position + 5; // Estimativa
        const progress = Math.max(0, ((totalInQueue - queueData.position) / totalInQueue) * 100);
        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${Math.round(progress)}%`;

        // Atualizar detalhes da consulta
        document.getElementById('consultationSpecialty').textContent = appointmentData.specialties?.name || 'N/A';
        document.getElementById('consultationDate').textContent = new Date().toLocaleDateString('pt-BR');
        document.getElementById('consultationDuration').textContent = `${appointmentData.specialties?.duration || 30} min`;
        document.getElementById('consultationId').textContent = appointmentData.id.substring(0, 8) + '...';

        // Atualizar status baseado na posição
        this.updateQueueStatus(queueData.position);
    }

    // Atualizar status da fila
    updateQueueStatus(position) {
        const statusDiv = document.getElementById('queueStatus');
        
        if (position === 1) {
            statusDiv.innerHTML = '<div class="text-green-600 font-medium">🟢 Você é o próximo! Mantenha-se pronto</div>';
            statusDiv.className = 'text-center p-4 rounded-lg bg-green-50 border border-green-200';
            this.playNotificationSound();
        } else if (position <= 3) {
            statusDiv.innerHTML = '<div class="text-orange-600 font-medium">🟡 Quase sua vez! Prepare-se</div>';
            statusDiv.className = 'text-center p-4 rounded-lg bg-orange-50 border border-orange-200';
        } else {
            statusDiv.innerHTML = '<div class="text-yellow-600 font-medium">⏳ Aguardando na fila...</div>';
            statusDiv.className = 'text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200';
        }
    }

    // Iniciar atualizações em tempo real
    startRealTimeUpdates() {
        if (!this.currentQueueEntry) return;

        // Subscription para mudanças na fila
        this.queueSubscription = supabase
            .channel('queue-updates')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'consultation_queue',
                filter: `id=eq.${this.currentQueueEntry.id}`
            }, (payload) => {
                console.log('🔄 Atualização da fila:', payload);
                this.handleQueueUpdate(payload.new);
            })
            .subscribe();

        // Subscription para notificações
        this.notificationSubscription = supabase
            .channel('user-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications'
            }, (payload) => {
                this.handleNotification(payload.new);
            })
            .subscribe();

        console.log('🔄 Monitoramento em tempo real iniciado');
    }

    // Lidar com atualizações da fila
    handleQueueUpdate(newQueueData) {
        const oldPosition = this.currentQueueEntry.position;
        const newPosition = newQueueData.position;

        this.currentQueueEntry = newQueueData;

        // Atualizar interface
        this.updateQueueInterface({ specialties: { name: 'Cardiologia', duration: 30 } }, newQueueData);

        // Verificar se é a vez do usuário
        if (newPosition === 0 || newQueueData.status === 'ready') {
            this.showCallModal();
        }

        // Adicionar notificação de mudança
        if (oldPosition !== newPosition) {
            this.addNotification(`Sua posição mudou para ${newPosition}`, 'info');
        }
    }

    // Lidar com notificações
    handleNotification(notification) {
        if (notification.type === 'consultation_ready') {
            this.showCallModal(notification);
        } else {
            this.addNotification(notification.message, notification.type);
        }
    }

    // Mostrar modal de chamada
    showCallModal(notification = null) {
        const callModal = document.getElementById('callModal');
        
        // Preencher dados do médico (simulado ou da notificação)
        if (notification && notification.data) {
            document.getElementById('doctorName').textContent = notification.data.doctorName || 'Dr. João Silva';
            document.getElementById('doctorSpecialty').textContent = notification.data.specialty || 'Cardiologia';
        }

        callModal.classList.remove('hidden');
        this.playCallSound();

        console.log('📞 Modal de chamada exibido');
    }

    // Entrar na videochamada
    async joinVideoCall() {
        try {
            console.log('📹 Iniciando videochamada...');

            // Gerar sala única para a consulta
            const roomName = `consultation-${this.currentQueueEntry.appointment_id}`;
            
            // Configurar Jitsi Meet
            const jitsiOptions = {
                roomName: roomName,
                width: '100%',
                height: '100%',
                parentNode: document.body,
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    enableWelcomePage: false,
                    prejoinPageEnabled: false,
                    disableModeratorIndicator: true,
                    startScreenSharing: false,
                    enableEmailInStats: false
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
                    ],
                    SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    SHOW_BRAND_WATERMARK: false,
                    BRAND_WATERMARK_LINK: '',
                    SHOW_POWERED_BY: false,
                    DEFAULT_BACKGROUND: '#474747',
                    DISABLE_VIDEO_BACKGROUND: false,
                    INITIAL_TOOLBAR_TIMEOUT: 20000,
                    TOOLBAR_TIMEOUT: 4000,
                    TOOLBAR_ALWAYS_VISIBLE: false,
                    DEFAULT_REMOTE_DISPLAY_NAME: 'Médico',
                    DEFAULT_LOCAL_DISPLAY_NAME: 'Paciente'
                },
                userInfo: {
                    displayName: 'Paciente'
                }
            };

            // Fechar modal de chamada
            document.getElementById('callModal').classList.add('hidden');

            // Criar container para Jitsi
            const jitsiContainer = document.createElement('div');
            jitsiContainer.id = 'jitsi-container';
            jitsiContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                background: #000;
            `;
            document.body.appendChild(jitsiContainer);

            // Inicializar Jitsi Meet
            const api = new JitsiMeetExternalAPI('8x8.vc', {
                ...jitsiOptions,
                parentNode: jitsiContainer,
                jwt: await this.generateJitsiJWT(roomName)
            });

            // Event listeners
            api.addEventListener('videoConferenceJoined', () => {
                console.log('✅ Entrou na videochamada');
                this.updateAppointmentStatus('in_progress');
            });

            api.addEventListener('videoConferenceLeft', () => {
                console.log('👋 Saiu da videochamada');
                this.endConsultation();
                jitsiContainer.remove();
            });

            // Salvar referência da API
            this.jitsiAPI = api;

        } catch (error) {
            console.error('❌ Erro ao iniciar videochamada:', error);
            alert('Erro ao iniciar videochamada. Tente novamente.');
        }
    }

    // Gerar JWT para Jitsi (simulado)
    async generateJitsiJWT(roomName) {
        // Em produção, isso seria feito no backend
        // Por enquanto, retornamos null (modo público)
        return null;
    }

    // Atualizar status da consulta
    async updateAppointmentStatus(status) {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: status, updated_at: new Date().toISOString() })
                .eq('id', this.currentQueueEntry.appointment_id);

            if (error) throw error;
            console.log('✅ Status da consulta atualizado:', status);

        } catch (error) {
            console.error('❌ Erro ao atualizar status:', error);
        }
    }

    // Finalizar consulta
    async endConsultation() {
        try {
            // Atualizar status
            await this.updateAppointmentStatus('completed');

            // Remover da fila
            await supabase
                .from('consultation_queue')
                .delete()
                .eq('id', this.currentQueueEntry.id);

            // Mostrar feedback
            this.showFeedbackModal();

            console.log('✅ Consulta finalizada');

        } catch (error) {
            console.error('❌ Erro ao finalizar consulta:', error);
        }
    }

    // Mostrar modal de feedback
    showFeedbackModal() {
        // Implementar modal de avaliação
        alert('Consulta finalizada! Por favor, avalie sua experiência.');
        this.exitQueue();
    }

    // Recusar chamada
    declineCall() {
        document.getElementById('callModal').classList.add('hidden');
        // Reposicionar na fila ou reagendar
        this.addNotification('Chamada recusada. Você foi reposicionado na fila.', 'warning');
    }

    // Testar dispositivos
    testDevices() {
        // Implementar teste de câmera e microfone
        alert('Teste de dispositivos em desenvolvimento...');
    }

    // Sair da fila
    async exitQueue() {
        if (confirm('Tem certeza que deseja sair da fila? Você perderá sua posição.')) {
            try {
                // Remover da fila
                if (this.currentQueueEntry) {
                    await supabase
                        .from('consultation_queue')
                        .delete()
                        .eq('id', this.currentQueueEntry.id);
                }

                // Parar subscriptions
                if (this.queueSubscription) {
                    this.queueSubscription.unsubscribe();
                }
                if (this.notificationSubscription) {
                    this.notificationSubscription.unsubscribe();
                }

                // Esconder interface
                document.getElementById('queueInterface').classList.add('hidden');
                document.body.style.overflow = 'auto';

                console.log('👋 Saiu da fila');

            } catch (error) {
                console.error('❌ Erro ao sair da fila:', error);
            }
        }
    }

    // Adicionar notificação
    addNotification(message, type = 'info') {
        const notificationsContainer = document.getElementById('queueNotifications');
        
        const icons = {
            info: 'ℹ️',
            warning: '⚠️',
            success: '✅',
            error: '❌'
        };

        const colors = {
            info: 'bg-blue-50 border-blue-200 text-blue-800',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            success: 'bg-green-50 border-green-200 text-green-800',
            error: 'bg-red-50 border-red-200 text-red-800'
        };

        const notificationHTML = `
            <div class="p-3 rounded-lg border ${colors[type]} text-sm">
                <div class="flex items-start">
                    <span class="mr-2">${icons[type]}</span>
                    <div>
                        <p>${message}</p>
                        <p class="text-xs opacity-75 mt-1">${new Date().toLocaleTimeString('pt-BR')}</p>
                    </div>
                </div>
            </div>
        `;

        // Remover mensagem vazia se existir
        const emptyMessage = notificationsContainer.querySelector('.text-gray-500');
        if (emptyMessage) {
            emptyMessage.remove();
        }

        notificationsContainer.insertAdjacentHTML('afterbegin', notificationHTML);

        // Limitar a 5 notificações
        const notifications = notificationsContainer.children;
        if (notifications.length > 5) {
            notifications[notifications.length - 1].remove();
        }
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

    // Tocar som de chamada
    playCallSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            audio.loop = true;
            audio.play().catch(() => {});
            
            // Parar após 10 segundos
            setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
            }, 10000);
        } catch (error) {
            console.log('🔇 Som de chamada não disponível');
        }
    }
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.queueSystem = new QueueSystem();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QueueSystem;
}