// Sistema de Videochamada com Jitsi Meet
// Integração completa para consultas médicas

class VideoCallSystem {
    constructor() {
        this.jitsiConfig = {
            appId: 'vpaas-magic-cookie-d4eb95e56d4140978d223283225476be',
            apiKey: 'vpaas-magic-cookie-d4eb95e56d4140978d223283225476be/feda42'
        };
        this.currentCall = null;
        this.jitsiAPI = null;
        this.consultationData = null;
        this.init();
    }

    init() {
        this.loadJitsiScript();
        console.log('📹 Sistema de Videochamada inicializado');
    }

    // Carregar script do Jitsi Meet
    loadJitsiScript() {
        if (window.JitsiMeetExternalAPI) {
            console.log('✅ Jitsi Meet já carregado');
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://8x8.vc/external_api.js';
        script.onload = () => {
            console.log('✅ Jitsi Meet carregado');
        };
        script.onerror = () => {
            console.error('❌ Erro ao carregar Jitsi Meet');
        };
        document.head.appendChild(script);
    }

    // Iniciar videochamada (para médicos)
    async startVideoCall(appointmentId, doctorData) {
        try {
            console.log('🩺 Médico iniciando videochamada...');

            // Buscar dados da consulta
            const appointmentData = await this.getAppointmentData(appointmentId);
            if (!appointmentData) {
                throw new Error('Consulta não encontrada');
            }

            this.consultationData = appointmentData;

            // Gerar sala única
            const roomName = `consultation-${appointmentId}`;
            
            // Criar link da videochamada
            const videoCallLink = await this.generateVideoCallLink(roomName, doctorData);

            // Notificar paciente
            await this.notifyPatient(appointmentData.patient_id, videoCallLink, doctorData);

            // Abrir videochamada para o médico
            await this.joinVideoCall(roomName, 'doctor', doctorData);

            console.log('✅ Videochamada iniciada pelo médico');

        } catch (error) {
            console.error('❌ Erro ao iniciar videochamada:', error);
            throw error;
        }
    }

    // Entrar na videochamada (para pacientes)
    async joinVideoCall(roomName, userType = 'patient', userData = null) {
        try {
            if (!window.JitsiMeetExternalAPI) {
                throw new Error('Jitsi Meet não está carregado');
            }

            console.log(`📹 ${userType} entrando na videochamada...`);

            // Configurações específicas por tipo de usuário
            const userConfig = this.getUserConfig(userType, userData);

            // Check if recording is enabled
            const enableRecording = userData?.enableRecording || localStorage.getItem('enableRecording') === 'true';

            // Configurações do Jitsi
            const jitsiOptions = {
                roomName: roomName,
                width: '100%',
                height: '100%',
                parentNode: this.createVideoContainer(),
                configOverwrite: {
                    startWithAudioMuted: userType === 'patient',
                    startWithVideoMuted: false,
                    enableWelcomePage: false,
                    prejoinPageEnabled: false, // Disabled since we have our own preparation
                    disableModeratorIndicator: false,
                    startScreenSharing: false,
                    enableEmailInStats: false,
                    disableThirdPartyRequests: true,
                    disableLocalVideoFlip: false,
                    backgroundAlpha: 0.5,
                    enableLayerSuspension: true,
                    // Recording configuration
                    recordingService: {
                        enabled: enableRecording,
                        sharingEnabled: enableRecording
                    },
                    // Enhanced video quality
                    resolution: 720,
                    constraints: {
                        video: {
                            height: { ideal: 720, max: 1080, min: 360 },
                            width: { ideal: 1280, max: 1920, min: 640 },
                            frameRate: { ideal: 30, max: 30, min: 15 }
                        },
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                            sampleRate: 48000
                        }
                    },
                    p2p: {
                        enabled: true,
                        stunServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' }
                        ]
                    },
                    analytics: {
                        disabled: true
                    },
                    remoteVideoMenu: {
                        disableKick: userType === 'patient'
                    }
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: this.getToolbarButtons(userType),
                    SETTINGS_SECTIONS: ['devices', 'language', 'profile'],
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
                    DEFAULT_REMOTE_DISPLAY_NAME: userType === 'patient' ? 'Médico' : 'Paciente',
                    DEFAULT_LOCAL_DISPLAY_NAME: userConfig.displayName,
                    MOBILE_APP_PROMO: false,
                    NATIVE_APP_NAME: 'TeleMed',
                    PROVIDER_NAME: 'TeleMed',
                    LANG_DETECTION: true,
                    CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: true,
                    CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: 5000,
                    CONNECTION_INDICATOR_DISABLED: false,
                    VIDEO_LAYOUT_FIT: 'both',
                    filmStripOnly: false,
                    VERTICAL_FILMSTRIP: true
                },
                userInfo: {
                    displayName: userConfig.displayName,
                    email: userConfig.email || ''
                }
            };

            // Inicializar Jitsi Meet
            this.jitsiAPI = new JitsiMeetExternalAPI('8x8.vc', jitsiOptions);

            // Configurar event listeners
            this.setupJitsiEventListeners(userType);

            // Salvar dados da chamada atual
            this.currentCall = {
                roomName: roomName,
                userType: userType,
                startTime: new Date(),
                appointmentId: this.consultationData?.id
            };

            console.log('✅ Videochamada iniciada');

        } catch (error) {
            console.error('❌ Erro ao entrar na videochamada:', error);
            throw error;
        }
    }

    // Criar container para vídeo
    createVideoContainer() {
        // Remover container existente se houver
        const existingContainer = document.getElementById('jitsi-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = document.createElement('div');
        container.id = 'jitsi-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            background: #000;
        `;

        document.body.appendChild(container);
        return container;
    }

    // Configurações por tipo de usuário
    getUserConfig(userType, userData) {
        if (userType === 'doctor') {
            return {
                displayName: userData?.name || 'Dr. Médico',
                email: userData?.email || '',
                isModerator: true
            };
        } else {
            return {
                displayName: 'Paciente',
                email: '',
                isModerator: false
            };
        }
    }

    // Botões da toolbar por tipo de usuário
    getToolbarButtons(userType) {
        const commonButtons = [
            'microphone', 'camera', 'hangup', 'chat', 
            'settings', 'fullscreen', 'fodeviceselection'
        ];

        if (userType === 'doctor') {
            return [
                ...commonButtons,
                'desktop', 'recording', 'raisehand', 'videoquality',
                'filmstrip', 'stats', 'shortcuts', 'tileview'
            ];
        } else {
            return [
                ...commonButtons,
                'raisehand', 'tileview'
            ];
        }
    }

    // Configurar event listeners do Jitsi
    setupJitsiEventListeners(userType) {
        if (!this.jitsiAPI) return;

        // Usuário entrou na conferência
        this.jitsiAPI.addEventListener('videoConferenceJoined', (data) => {
            console.log('✅ Entrou na videochamada:', data);
            this.onConferenceJoined(userType);
        });

        // Usuário saiu da conferência
        this.jitsiAPI.addEventListener('videoConferenceLeft', (data) => {
            console.log('👋 Saiu da videochamada:', data);
            this.onConferenceLeft(userType);
        });

        // Participante entrou
        this.jitsiAPI.addEventListener('participantJoined', (data) => {
            console.log('👤 Participante entrou:', data);
            this.onParticipantJoined(data);
        });

        // Participante saiu
        this.jitsiAPI.addEventListener('participantLeft', (data) => {
            console.log('👤 Participante saiu:', data);
            this.onParticipantLeft(data);
        });

        // Erro na conferência
        this.jitsiAPI.addEventListener('videoConferenceError', (error) => {
            console.error('❌ Erro na videochamada:', error);
            this.onConferenceError(error);
        });

        // Mudança de status de áudio
        this.jitsiAPI.addEventListener('audioMuteStatusChanged', (data) => {
            console.log('🔊 Status de áudio mudou:', data);
        });

        // Mudança de status de vídeo
        this.jitsiAPI.addEventListener('videoMuteStatusChanged', (data) => {
            console.log('📹 Status de vídeo mudou:', data);
        });

        // Chat message received
        this.jitsiAPI.addEventListener('incomingMessage', (data) => {
            console.log('💬 Mensagem recebida:', data);
            this.onChatMessage(data);
        });

        // Recording status changed
        this.jitsiAPI.addEventListener('recordingStatusChanged', (data) => {
            console.log('🎥 Status de gravação mudou:', data);
            this.onRecordingStatusChanged(data);
        });
    }

    // Quando usuário entra na conferência
    async onConferenceJoined(userType) {
        try {
            // Atualizar status da consulta
            if (this.consultationData) {
                await this.updateAppointmentStatus('in_progress');
            }

            // Registrar início da sessão
            await this.logSessionStart(userType);

            // Mostrar controles customizados se necessário
            this.showCustomControls(userType);

        } catch (error) {
            console.error('❌ Erro ao processar entrada na conferência:', error);
        }
    }

    // Quando usuário sai da conferência
    async onConferenceLeft(userType) {
        try {
            // Calcular duração da chamada
            const duration = this.currentCall ? 
                Math.round((new Date() - this.currentCall.startTime) / 1000 / 60) : 0;

            // Registrar fim da sessão
            await this.logSessionEnd(userType, duration);

            // Limpar container
            const container = document.getElementById('jitsi-container');
            if (container) {
                container.remove();
            }

            // Resetar API
            this.jitsiAPI = null;
            this.currentCall = null;

            // Ações específicas por tipo de usuário
            if (userType === 'doctor') {
                this.onDoctorLeft();
            } else {
                this.onPatientLeft();
            }

        } catch (error) {
            console.error('❌ Erro ao processar saída da conferência:', error);
        }
    }

    // Quando participante entra
    onParticipantJoined(data) {
        // Notificar que alguém entrou
        this.showNotification(`${data.displayName || 'Participante'} entrou na consulta`, 'success');
    }

    // Quando participante sai
    onParticipantLeft(data) {
        // Notificar que alguém saiu
        this.showNotification(`${data.displayName || 'Participante'} saiu da consulta`, 'info');
    }

    // Erro na conferência
    onConferenceError(error) {
        this.showNotification('Erro na videochamada. Tentando reconectar...', 'error');
        
        // Tentar reconectar após 3 segundos
        setTimeout(() => {
            if (this.currentCall) {
                this.rejoinCall();
            }
        }, 3000);
    }

    // Tentar reconectar
    async rejoinCall() {
        try {
            if (this.currentCall) {
                await this.joinVideoCall(
                    this.currentCall.roomName, 
                    this.currentCall.userType
                );
            }
        } catch (error) {
            console.error('❌ Erro ao reconectar:', error);
        }
    }

    // Gerar link da videochamada
    async generateVideoCallLink(roomName, doctorData) {
        // Em produção, isso seria feito no backend com JWT
        const baseUrl = window.location.origin;
        return `${baseUrl}/videocall.html?room=${roomName}&doctor=${doctorData.id}`;
    }

    // Notificar paciente
    async notifyPatient(patientId, videoCallLink, doctorData) {
        try {
            const notification = {
                user_id: patientId,
                type: 'consultation_ready',
                title: 'Sua consulta está pronta!',
                message: `Dr. ${doctorData.name} está aguardando você na sala de consulta.`,
                channels: ['browser', 'whatsapp'],
                data: {
                    videoCallLink: videoCallLink,
                    doctorName: doctorData.name,
                    specialty: doctorData.specialty
                }
            };

            const { error } = await supabase
                .from('notifications')
                .insert([notification]);

            if (error) throw error;

            console.log('✅ Paciente notificado');

        } catch (error) {
            console.error('❌ Erro ao notificar paciente:', error);
        }
    }

    // Buscar dados da consulta
    async getAppointmentData(appointmentId) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    specialties (name),
                    profiles!appointments_patient_id_fkey (full_name, email)
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

    // Atualizar status da consulta
    async updateAppointmentStatus(status) {
        if (!this.consultationData) return;

        try {
            const { error } = await supabase
                .from('appointments')
                .update({ 
                    status: status, 
                    updated_at: new Date().toISOString() 
                })
                .eq('id', this.consultationData.id);

            if (error) throw error;
            console.log('✅ Status da consulta atualizado:', status);

        } catch (error) {
            console.error('❌ Erro ao atualizar status:', error);
        }
    }

    // Registrar início da sessão
    async logSessionStart(userType) {
        try {
            const sessionData = {
                appointment_id: this.consultationData?.id,
                user_type: userType,
                action: 'joined',
                timestamp: new Date().toISOString(),
                metadata: {
                    roomName: this.currentCall?.roomName,
                    userAgent: navigator.userAgent
                }
            };

            // Salvar no banco (implementar tabela session_logs se necessário)
            console.log('📝 Sessão iniciada:', sessionData);

        } catch (error) {
            console.error('❌ Erro ao registrar início da sessão:', error);
        }
    }

    // Registrar fim da sessão
    async logSessionEnd(userType, duration) {
        try {
            const sessionData = {
                appointment_id: this.consultationData?.id,
                user_type: userType,
                action: 'left',
                duration: duration,
                timestamp: new Date().toISOString()
            };

            console.log('📝 Sessão finalizada:', sessionData);

            // Atualizar duração na consulta
            if (this.consultationData && userType === 'doctor') {
                await supabase
                    .from('appointments')
                    .update({ 
                        actual_duration: duration,
                        status: 'completed'
                    })
                    .eq('id', this.consultationData.id);
            }

        } catch (error) {
            console.error('❌ Erro ao registrar fim da sessão:', error);
        }
    }

    // Mostrar controles customizados
    showCustomControls(userType) {
        if (userType === 'doctor') {
            // Adicionar botões específicos para médicos
            this.addDoctorControls();
        }
    }

    // Adicionar controles para médicos
    addDoctorControls() {
        // Implementar controles específicos como:
        // - Botão para criar prontuário
        // - Botão para prescrever medicamentos
        // - Botão para agendar retorno
        console.log('🩺 Controles de médico adicionados');
    }

    // Quando médico sai
    onDoctorLeft() {
        // Finalizar consulta e mostrar opções de prontuário
        console.log('🩺 Médico saiu - finalizando consulta');
        
        // Mostrar modal de finalização da consulta com opção de criar prontuário
        this.showConsultationEndModal();
    }

    // Quando paciente sai
    onPatientLeft() {
        // Mostrar modal de avaliação
        console.log('👤 Paciente saiu - solicitando avaliação');
        this.showFeedbackModal();
    }

    // Handle chat messages
    onChatMessage(data) {
        try {
            // Log chat message for medical records
            const chatData = {
                appointment_id: this.consultationData?.id,
                sender: data.from || 'unknown',
                message: data.message,
                timestamp: new Date().toISOString()
            };

            console.log('💬 Chat message logged:', chatData);

            // Show notification for new messages
            this.showNotification(`Nova mensagem: ${data.message.substring(0, 50)}...`, 'info');

        } catch (error) {
            console.error('❌ Erro ao processar mensagem do chat:', error);
        }
    }

    // Handle recording status changes
    onRecordingStatusChanged(data) {
        try {
            const { status, mode } = data;
            
            if (status === 'on') {
                this.showNotification('🎥 Gravação iniciada', 'success');
                console.log('🎥 Recording started:', { mode, timestamp: new Date().toISOString() });
            } else if (status === 'off') {
                this.showNotification('⏹️ Gravação finalizada', 'info');
                console.log('🎥 Recording stopped:', { timestamp: new Date().toISOString() });
            }

            // Log recording status for medical records
            const recordingData = {
                appointment_id: this.consultationData?.id,
                status: status,
                mode: mode,
                timestamp: new Date().toISOString()
            };

            console.log('📝 Recording status logged:', recordingData);

        } catch (error) {
            console.error('❌ Erro ao processar mudança de gravação:', error);
        }
    }

    // Send chat message programmatically
    sendChatMessage(message) {
        if (this.jitsiAPI && message.trim()) {
            try {
                this.jitsiAPI.executeCommand('sendChatMessage', message);
                console.log('💬 Mensagem enviada:', message);
            } catch (error) {
                console.error('❌ Erro ao enviar mensagem:', error);
            }
        }
    }

    // Toggle recording
    toggleRecording() {
        if (this.jitsiAPI) {
            try {
                this.jitsiAPI.executeCommand('toggleRecording');
                console.log('🎥 Toggle recording command sent');
            } catch (error) {
                console.error('❌ Erro ao alternar gravação:', error);
            }
        }
    }

    // Toggle audio mute
    toggleAudio() {
        if (this.jitsiAPI) {
            try {
                this.jitsiAPI.executeCommand('toggleAudio');
                console.log('🔊 Toggle audio command sent');
            } catch (error) {
                console.error('❌ Erro ao alternar áudio:', error);
            }
        }
    }

    // Toggle video mute
    toggleVideo() {
        if (this.jitsiAPI) {
            try {
                this.jitsiAPI.executeCommand('toggleVideo');
                console.log('📹 Toggle video command sent');
            } catch (error) {
                console.error('❌ Erro ao alternar vídeo:', error);
            }
        }
    }

    // Open chat panel
    openChat() {
        if (this.jitsiAPI) {
            try {
                this.jitsiAPI.executeCommand('toggleChat');
                console.log('💬 Chat panel toggled');
            } catch (error) {
                console.error('❌ Erro ao abrir chat:', error);
            }
        }
    }

    // Get current call statistics
    async getCallStatistics() {
        if (this.jitsiAPI) {
            try {
                // This would need to be implemented with Jitsi's statistics API
                const stats = {
                    duration: this.currentCall ? Math.round((new Date() - this.currentCall.startTime) / 1000) : 0,
                    participants: 2, // Simplified
                    quality: 'good' // Simplified
                };
                
                console.log('📊 Call statistics:', stats);
                return stats;
            } catch (error) {
                console.error('❌ Erro ao obter estatísticas:', error);
                return null;
            }
        }
        return null;
    }

    // Mostrar modal de avaliação
    showFeedbackModal() {
        // Implementar modal de feedback
        if (window.feedbackSystem) {
            window.feedbackSystem.showFeedbackModal(this.consultationData?.id);
        }
    }

    // Mostrar notificação
    showNotification(message, type = 'info') {
        // Criar notificação visual
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-black' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remover após 5 segundos
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Mostrar modal de finalização da consulta
    showConsultationEndModal() {
        const modal = document.createElement('div');
        modal.id = 'consultationEndModal';
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal-content max-w-2xl">
                <div class="modal-header">
                    <h3 class="text-2xl font-bold text-gray-900">🏥 Consulta Finalizada</h3>
                    <button onclick="closeModal('consultationEndModal')" class="modal-close">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="text-center mb-6">
                        <div class="text-6xl mb-4">✅</div>
                        <h4 class="text-xl font-bold text-gray-900 mb-2">Consulta realizada com sucesso!</h4>
                        <p class="text-gray-600">
                            A videoconsulta foi finalizada. Agora você pode criar o prontuário médico do paciente.
                        </p>
                    </div>
                    
                    <!-- Resumo da Consulta -->
                    <div class="bg-blue-50 p-4 rounded-lg mb-6">
                        <h5 class="font-bold text-blue-900 mb-2">Resumo da Consulta</h5>
                        <div class="text-sm space-y-1">
                            <div><strong>Duração:</strong> ${this.getCallDuration()} minutos</div>
                            <div><strong>Paciente:</strong> ${this.consultationData?.patient_name || 'N/A'}</div>
                            <div><strong>Especialidade:</strong> ${this.consultationData?.specialty_name || 'N/A'}</div>
                            <div><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</div>
                        </div>
                    </div>
                    
                    <!-- Ações Disponíveis -->
                    <div class="space-y-4">
                        <button 
                            onclick="this.createMedicalRecord()" 
                            class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center space-x-2">
                            <span>📋</span>
                            <span>Criar Prontuário Médico</span>
                        </button>
                        
                        <button 
                            onclick="this.scheduleFollowUp()" 
                            class="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center space-x-2">
                            <span>📅</span>
                            <span>Agendar Consulta de Retorno</span>
                        </button>
                        
                        <button 
                            onclick="this.sendConsultationSummary()" 
                            class="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center space-x-2">
                            <span>📧</span>
                            <span>Enviar Resumo por Email</span>
                        </button>
                    </div>
                    
                    <!-- Botão para Fechar -->
                    <div class="mt-6 pt-4 border-t">
                        <button 
                            onclick="closeModal('consultationEndModal')" 
                            class="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition">
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.classList.remove('hidden');
        
        // Bind context for button clicks
        const buttons = modal.querySelectorAll('button[onclick*="this."]');
        buttons.forEach(button => {
            const originalOnclick = button.getAttribute('onclick');
            button.removeAttribute('onclick');
            button.addEventListener('click', () => {
                const methodName = originalOnclick.match(/this\.(\w+)\(\)/)[1];
                if (this[methodName]) {
                    this[methodName]();
                }
            });
        });
    }
    
    // Obter duração da chamada
    getCallDuration() {
        if (this.currentCall && this.currentCall.startTime) {
            return Math.round((new Date() - this.currentCall.startTime) / 1000 / 60);
        }
        return 0;
    }
    
    // Criar prontuário médico
    createMedicalRecord() {
        if (this.consultationData && window.showMedicalRecordInterface) {
            // Fechar modal atual
            closeModal('consultationEndModal');
            
            // Abrir interface de prontuário
            window.showMedicalRecordInterface(this.consultationData.id);
        } else {
            this.showNotification('Sistema de prontuários não disponível', 'error');
        }
    }
    
    // Agendar consulta de retorno
    scheduleFollowUp() {
        if (this.consultationData && window.scheduleFollowUp) {
            // Fechar modal atual
            closeModal('consultationEndModal');
            
            // Abrir agendamento de retorno
            window.scheduleFollowUp(this.consultationData.id);
        } else {
            this.showNotification('Sistema de agendamento não disponível', 'error');
        }
    }
    
    // Enviar resumo da consulta
    async sendConsultationSummary() {
        try {
            const summary = {
                appointmentId: this.consultationData?.id,
                duration: this.getCallDuration(),
                date: new Date().toISOString(),
                patientEmail: this.consultationData?.patient_email,
                doctorName: 'Dr. João Silva', // Em produção, pegar do contexto do médico
                specialty: this.consultationData?.specialty_name
            };
            
            // Simular envio de email (em produção, usar serviço de email)
            console.log('📧 Enviando resumo da consulta:', summary);
            
            this.showNotification('Resumo enviado por email com sucesso', 'success');
            
            // Fechar modal
            closeModal('consultationEndModal');
            
        } catch (error) {
            console.error('❌ Erro ao enviar resumo:', error);
            this.showNotification('Erro ao enviar resumo', 'error');
        }
    }

    // Finalizar chamada
    endCall() {
        if (this.jitsiAPI) {
            this.jitsiAPI.dispose();
        }
    }
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.videoCallSystem = new VideoCallSystem();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoCallSystem;
}