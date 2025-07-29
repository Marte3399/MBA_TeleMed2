// TeleMed - Sistema de Videochamadas

/**
 * CONFIGURAÇÃO DE VIDEOCHAMADAS
 * Define parâmetros para integração com Jitsi Meet e comportamento das videochamadas
 */
const VIDEO_CALL_CONFIG = {
    jitsiDomain: 'meet.jit.si',     // Domínio do servidor Jitsi Meet
    roomPrefix: 'telemed-',         // Prefixo para nomes das salas de videochamada
    defaultOptions: {               // Opções padrão para inicialização do Jitsi
        width: '100%',              // Largura do player de vídeo
        height: '400px',            // Altura do player de vídeo
        parentNode: null,           // Elemento DOM pai (será definido dinamicamente)
        configOverwrite: {          // Configurações de comportamento
            startWithAudioMuted: false,         // Iniciar com áudio ligado
            startWithVideoMuted: false,         // Iniciar com vídeo ligado
            enableWelcomePage: false,           // Desabilitar página de boas-vindas
            enableClosePage: false,             // Desabilitar página de encerramento
            disableDeepLinking: true,           // Desabilitar deep linking
            toolbarButtons: [                   // Botões disponíveis na barra de ferramentas
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'recording',
                'settings', 'videoquality', 'filmstrip', 'invite',
                'feedback', 'stats', 'shortcuts', 'tileview', 'chat'
            ],
        },
        interfaceConfigOverwrite: {     // Configurações de interface personalizada
            SHOW_JITSI_WATERMARK: false,               // Ocultar marca d'água do Jitsi
            SHOW_WATERMARK_FOR_GUESTS: false,          // Ocultar marca d'água para convidados
            SHOW_BRAND_WATERMARK: false,               // Ocultar marca d'água da marca
            BRAND_WATERMARK_LINK: '',                  // Link da marca d'água (vazio)
            SHOW_POWERED_BY: false,                    // Ocultar "Powered by Jitsi"
            TOOLBAR_ALWAYS_VISIBLE: false,             // Barra de ferramentas auto-ocultar
            DEFAULT_WELCOME_PAGE_LOGO_URL: '',         // Logo personalizado (vazio)
            JITSI_WATERMARK_LINK: '',                  // Link da marca d'água Jitsi (vazio)
            DISPLAY_WELCOME_PAGE_CONTENT: false,       // Não exibir conteúdo da página inicial
            DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false, // Sem conteúdo adicional
            HIDE_INVITE_MORE_HEADER: true,             // Ocultar cabeçalho de convites
            MOBILE_APP_PROMO: false,                   // Desabilitar promoção do app mobile
            RECENT_LIST_ENABLED: false,                // Desabilitar lista de recentes
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'], // Seções de configuração
            TOOLBAR_BUTTONS: [                         // Botões da barra de ferramentas
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'recording',
                'settings', 'videoquality', 'filmstrip', 'invite',
                'feedback', 'stats', 'shortcuts', 'tileview', 'chat'
            ],
            VIDEO_LAYOUT_FIT: 'nocrop',                // Layout do vídeo sem corte
            filmStripOnly: false,                      // Não apenas filmstrip
            VERTICAL_FILMSTRIP: true,                  // Filmstrip vertical
        }
    }
};

/**
 * ESTADO DAS VIDEOCHAMADAS
 * Armazena todas as informações do estado atual da videochamada
 */
let videoCallState = {
    isActive: false,            // Se há uma videochamada ativa no momento
    isVideoEnabled: true,       // Se o vídeo do usuário está ligado
    isAudioEnabled: true,       // Se o áudio do usuário está ligado
    isRecording: false,         // Se a chamada está sendo gravada
    isScreenSharing: false,     // Se o compartilhamento de tela está ativo
    startTime: null,            // Horário de início da chamada
    duration: 0,                // Duração atual da chamada em segundos
    jitsiApi: null,             // Referência para a API do Jitsi Meet
    roomName: null,             // Nome da sala de videochamada
    participants: [],           // Lista de participantes na chamada
    durationInterval: null      // Timer para atualizar duração da chamada
};

/**
 * INICIALIZAR SISTEMA DE VIDEOCHAMADAS
 * Configura e inicializa todos os componentes do sistema de videochamadas
 */
function initializeVideoCall() {
    console.log('🎥 Video call system initialized');
}

/**
 * ABRIR VIDEOCHAMADA
 * Inicia uma nova videochamada, criando sala e interface necessária
 * @param {number} appointmentId - ID da consulta (opcional, para vincular à consulta específica)
 */
function openVideoCall(appointmentId = null) {
    // Verifica se o usuário está logado antes de permitir videochamada
    if (!checkSession()) return;
    
    // Gera nome único para a sala de videochamada
    const roomName = generateRoomName(appointmentId);
    videoCallState.roomName = roomName;
    
    // Atualiza o conteúdo do modal com informações da consulta
    updateVideoCallModal(appointmentId);
    
    // Exibe o modal de videochamada na tela
    document.getElementById('videoCallModal').classList.remove('hidden');
    
    // Inicializa o Jitsi Meet após pequeno delay para garantir que o modal foi renderizado
    setTimeout(() => {
        initializeJitsiMeet(roomName);
    }, 500);
}

/**
 * GERAR NOME DA SALA
 * Cria um nome único para a sala de videochamada baseado no ID da consulta
 * @param {number} appointmentId - ID da consulta (opcional)
 * @returns {string} Nome único da sala com prefixo da plataforma
 */
function generateRoomName(appointmentId) {
    const baseId = appointmentId || Date.now(); // Usa ID da consulta ou timestamp atual
    return `${VIDEO_CALL_CONFIG.roomPrefix}${baseId}`;
}

/**
 * ATUALIZAR MODAL DE VIDEOCHAMADA
 * Atualiza o conteúdo do modal com informações da consulta e controles de vídeo
 * @param {number} appointmentId - ID da consulta para buscar informações específicas
 */
function updateVideoCallModal(appointmentId) {
    const modal = document.getElementById('videoCallModal');
    const modalContent = modal.querySelector('.modal-body');
    
    // Busca detalhes da consulta se ID foi fornecido
    let appointmentInfo = '';
    if (appointmentId && TeleMed.appointments) {
        const appointment = TeleMed.appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            // Cria seção com informações da consulta
            appointmentInfo = `
                <div class="mb-4 p-4 bg-blue-50 rounded-lg">
                    <div class="text-sm font-medium text-blue-900">
                        Consulta: ${appointment.specialty} - ${appointment.doctor}
                    </div>
                    <div class="text-xs text-blue-700">
                        ${formatDate(appointment.date)} às ${appointment.time}
                    </div>
                </div>
            `;
        }
    }
    
    modalContent.innerHTML = `
        ${appointmentInfo}
        <div class="bg-gray-900 rounded-lg mb-4 relative" style="height: 400px;">
            <div id="jitsiContainer" class="w-full h-full rounded-lg"></div>
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <button onclick="toggleVideo()" id="videoBtn" 
                        class="video-btn bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition">
                    🎥
                </button>
                <button onclick="toggleAudio()" id="audioBtn" 
                        class="video-btn bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition">
                    🎤
                </button>
                <button onclick="toggleScreenShare()" id="screenBtn" 
                        class="video-btn bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition">
                    🖥️
                </button>
                <button onclick="toggleRecording()" id="recordBtn" 
                        class="video-btn bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition">
                    📹
                </button>
                <button onclick="endCall()" id="endCallBtn" 
                        class="video-btn bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition">
                    📞
                </button>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-bold text-gray-900 mb-2">📊 Informações da Chamada</h4>
                <div class="text-sm text-gray-600 space-y-1">
                    <div>• Duração: <span id="callDuration">00:00</span></div>
                    <div>• Qualidade: <span id="callQuality">HD</span></div>
                    <div>• Participantes: <span id="participantCount">1</span></div>
                    <div>• Gravação: <span id="recordingStatus">Inativa</span></div>
                </div>
            </div>
            
            <div class="bg-blue-50 rounded-lg p-4">
                <h4 class="font-bold text-blue-900 mb-2">🔧 Controles</h4>
                <div class="space-y-2">
                    <button onclick="openChatInCall()" 
                            class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm">
                        💬 Abrir Chat
                    </button>
                    <button onclick="shareScreen()" 
                            class="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 text-sm">
                        📱 Compartilhar Tela
                    </button>
                    <button onclick="openPrescriptionInCall()" 
                            class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm">
                        💊 Prescrever
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Initialize Jitsi Meet
function initializeJitsiMeet(roomName) {
    const container = document.getElementById('jitsiContainer');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Check if Jitsi Meet API is available
    if (typeof JitsiMeetExternalAPI === 'undefined') {
        showJitsiMeetFallback();
        return;
    }
    
    try {
        // Create Jitsi Meet instance
        const options = {
            ...VIDEO_CALL_CONFIG.defaultOptions,
            roomName: roomName,
            parentNode: container,
            userInfo: {
                displayName: TeleMed.currentUser.name,
                email: TeleMed.currentUser.email
            }
        };
        
        videoCallState.jitsiApi = new JitsiMeetExternalAPI(VIDEO_CALL_CONFIG.jitsiDomain, options);
        
        // Set up event listeners
        setupJitsiEventListeners();
        
        // Start call tracking
        startCallTracking();
        
        console.log('🎥 Jitsi Meet initialized for room:', roomName);
        
    } catch (error) {
        console.error('Error initializing Jitsi Meet:', error);
        showJitsiMeetFallback();
    }
}

// Setup Jitsi Event Listeners
function setupJitsiEventListeners() {
    const api = videoCallState.jitsiApi;
    if (!api) return;
    
    // Video conference joined
    api.addEventListener('videoConferenceJoined', (event) => {
        console.log('📹 Video conference joined:', event);
        videoCallState.isActive = true;
        showNotification('Conectado!', 'Videochamada iniciada com sucesso', 'success');
        updateCallStatus('connected');
    });
    
    // Video conference left
    api.addEventListener('videoConferenceLeft', (event) => {
        console.log('📹 Video conference left:', event);
        endCall();
    });
    
    // Participant joined
    api.addEventListener('participantJoined', (event) => {
        console.log('👥 Participant joined:', event);
        videoCallState.participants.push(event);
        updateParticipantCount();
        showNotification('Participante conectado', `${event.displayName} entrou na chamada`, 'info');
    });
    
    // Participant left
    api.addEventListener('participantLeft', (event) => {
        console.log('👥 Participant left:', event);
        videoCallState.participants = videoCallState.participants.filter(p => p.id !== event.id);
        updateParticipantCount();
        showNotification('Participante saiu', `${event.displayName} saiu da chamada`, 'info');
    });
    
    // Audio availability changed
    api.addEventListener('audioAvailabilityChanged', (event) => {
        console.log('🎤 Audio availability changed:', event);
        videoCallState.isAudioEnabled = event.available;
        updateAudioButton();
    });
    
    // Video availability changed
    api.addEventListener('videoAvailabilityChanged', (event) => {
        console.log('🎥 Video availability changed:', event);
        videoCallState.isVideoEnabled = event.available;
        updateVideoButton();
    });
    
    // Recording status changed
    api.addEventListener('recordingStatusChanged', (event) => {
        console.log('📹 Recording status changed:', event);
        videoCallState.isRecording = event.on;
        updateRecordingStatus();
    });
    
    // Screen sharing status changed
    api.addEventListener('screenSharingStatusChanged', (event) => {
        console.log('🖥️ Screen sharing status changed:', event);
        videoCallState.isScreenSharing = event.on;
        updateScreenShareButton();
    });
    
    // Error occurred
    api.addEventListener('errorOccurred', (event) => {
        console.error('❌ Jitsi Meet error:', event);
        showNotification('Erro na videochamada', 'Ocorreu um erro na conexão', 'error');
    });
}

// Show Jitsi Meet Fallback
function showJitsiMeetFallback() {
    const container = document.getElementById('jitsiContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="flex items-center justify-center h-full bg-gray-900 text-white">
            <div class="text-center">
                <div class="text-6xl mb-4">🎥</div>
                <div class="text-2xl font-bold mb-2">Videochamada Simulada</div>
                <div class="text-gray-300 mb-4">Dr. Roberto Santos - Cardiologia</div>
                <div class="text-gray-400 text-sm">
                    Demo: Sistema de videochamada integrado com Jitsi Meet
                </div>
                <div class="mt-6 space-y-2">
                    <div class="text-sm text-gray-300">🔴 Gravação ativa</div>
                    <div class="text-sm text-gray-300">🎤 Áudio ativo</div>
                    <div class="text-sm text-gray-300">📹 Vídeo ativo</div>
                </div>
            </div>
        </div>
    `;
    
    // Start simulated call tracking
    startCallTracking();
}

// Start Call Tracking
function startCallTracking() {
    videoCallState.startTime = new Date();
    videoCallState.duration = 0;
    
    // Update duration every second
    videoCallState.durationInterval = setInterval(() => {
        videoCallState.duration++;
        updateCallDuration();
    }, 1000);
    
    // Update call status
    updateCallStatus('active');
}

// Update Call Duration
function updateCallDuration() {
    const durationEl = document.getElementById('callDuration');
    if (durationEl) {
        const minutes = Math.floor(videoCallState.duration / 60);
        const seconds = videoCallState.duration % 60;
        durationEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Update Call Status
function updateCallStatus(status) {
    const qualityEl = document.getElementById('callQuality');
    if (qualityEl) {
        const qualities = {
            'connecting': 'Conectando...',
            'connected': 'HD',
            'active': 'HD 720p',
            'poor': 'Baixa qualidade',
            'disconnected': 'Desconectado'
        };
        qualityEl.textContent = qualities[status] || 'Desconhecido';
    }
}

// Update Participant Count
function updateParticipantCount() {
    const countEl = document.getElementById('participantCount');
    if (countEl) {
        countEl.textContent = videoCallState.participants.length + 1; // +1 for current user
    }
}

// Video Control Functions
function toggleVideo() {
    if (videoCallState.jitsiApi) {
        if (videoCallState.isVideoEnabled) {
            videoCallState.jitsiApi.executeCommand('video', 'off');
        } else {
            videoCallState.jitsiApi.executeCommand('video', 'on');
        }
    } else {
        // Fallback for demo
        videoCallState.isVideoEnabled = !videoCallState.isVideoEnabled;
        updateVideoButton();
        showNotification('Vídeo ' + (videoCallState.isVideoEnabled ? 'ativado' : 'desativado'), '', 'info');
    }
}

function toggleAudio() {
    if (videoCallState.jitsiApi) {
        if (videoCallState.isAudioEnabled) {
            videoCallState.jitsiApi.executeCommand('audio', 'off');
        } else {
            videoCallState.jitsiApi.executeCommand('audio', 'on');
        }
    } else {
        // Fallback for demo
        videoCallState.isAudioEnabled = !videoCallState.isAudioEnabled;
        updateAudioButton();
        showNotification('Áudio ' + (videoCallState.isAudioEnabled ? 'ativado' : 'desativado'), '', 'info');
    }
}

function toggleScreenShare() {
    if (videoCallState.jitsiApi) {
        videoCallState.jitsiApi.executeCommand('toggleShareScreen');
    } else {
        // Fallback for demo
        videoCallState.isScreenSharing = !videoCallState.isScreenSharing;
        updateScreenShareButton();
        showNotification('Compartilhamento ' + (videoCallState.isScreenSharing ? 'iniciado' : 'parado'), '', 'info');
    }
}

function toggleRecording() {
    if (videoCallState.jitsiApi) {
        if (videoCallState.isRecording) {
            videoCallState.jitsiApi.executeCommand('stopRecording');
        } else {
            videoCallState.jitsiApi.executeCommand('startRecording');
        }
    } else {
        // Fallback for demo
        videoCallState.isRecording = !videoCallState.isRecording;
        updateRecordingStatus();
        showNotification('Gravação ' + (videoCallState.isRecording ? 'iniciada' : 'parada'), '', 'info');
    }
}

function shareScreen() {
    if (videoCallState.jitsiApi) {
        videoCallState.jitsiApi.executeCommand('toggleShareScreen');
    } else {
        showNotification('Compartilhamento de tela', 'Funcionalidade ativada (demo)', 'info');
    }
}

function endCall() {
    // Stop call tracking
    if (videoCallState.durationInterval) {
        clearInterval(videoCallState.durationInterval);
        videoCallState.durationInterval = null;
    }
    
    // Dispose Jitsi API
    if (videoCallState.jitsiApi) {
        videoCallState.jitsiApi.dispose();
        videoCallState.jitsiApi = null;
    }
    
    // Reset state
    const callDuration = videoCallState.duration;
    videoCallState = {
        isActive: false,
        isVideoEnabled: true,
        isAudioEnabled: true,
        isRecording: false,
        isScreenSharing: false,
        startTime: null,
        duration: 0,
        jitsiApi: null,
        roomName: null,
        participants: [],
        durationInterval: null
    };
    
    // Close modal
    closeModal('videoCallModal');
    
    // Show call summary
    showCallSummary(callDuration);
    
    console.log('📞 Call ended');
}

// Update Button States
function updateVideoButton() {
    const btn = document.getElementById('videoBtn');
    if (btn) {
        btn.className = videoCallState.isVideoEnabled 
            ? 'video-btn bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition'
            : 'video-btn bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition';
    }
}

function updateAudioButton() {
    const btn = document.getElementById('audioBtn');
    if (btn) {
        btn.className = videoCallState.isAudioEnabled 
            ? 'video-btn bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition'
            : 'video-btn bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition';
    }
}

function updateScreenShareButton() {
    const btn = document.getElementById('screenBtn');
    if (btn) {
        btn.className = videoCallState.isScreenSharing 
            ? 'video-btn bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition'
            : 'video-btn bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition';
    }
}

function updateRecordingStatus() {
    const statusEl = document.getElementById('recordingStatus');
    if (statusEl) {
        statusEl.textContent = videoCallState.isRecording ? 'Ativa' : 'Inativa';
    }
    
    const btn = document.getElementById('recordBtn');
    if (btn) {
        btn.className = videoCallState.isRecording 
            ? 'video-btn bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition'
            : 'video-btn bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition';
    }
}

// Additional Functions
function openChatInCall() {
    openChat();
}

function openPrescriptionInCall() {
    showNotification('Prescrição', 'Abrindo sistema de prescrição médica', 'info');
    // This would open a prescription interface
}

function showCallSummary(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    setTimeout(() => {
        showNotification('Chamada encerrada', 
            `Duração: ${durationText} • Qualidade: HD • Gravação: ${videoCallState.isRecording ? 'Sim' : 'Não'}`, 
            'info'
        );
    }, 1000);
}

// Export functions
window.openVideoCall = openVideoCall;
window.toggleVideo = toggleVideo;
window.toggleAudio = toggleAudio;
window.toggleScreenShare = toggleScreenShare;
window.toggleRecording = toggleRecording;
window.shareScreen = shareScreen;
window.endCall = endCall;
window.openChatInCall = openChatInCall;
window.openPrescriptionInCall = openPrescriptionInCall;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeVideoCall();
});

console.log('✅ TeleMed Video Call System Loaded');