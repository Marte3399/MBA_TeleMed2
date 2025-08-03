// TeleMed - Sistema de Gerenciamento de Consultas

/**
 * ESTRUTURA DE DADOS DAS CONSULTAS
 * Define os possíveis status e tipos de consultas na plataforma
 */

// Status possíveis para uma consulta
const APPOINTMENT_STATUSES = {
    SCHEDULED: 'scheduled',     // Consulta agendada (aguardando)
    IN_PROGRESS: 'in_progress', // Consulta em andamento (acontecendo agora)
    COMPLETED: 'completed',     // Consulta finalizada com sucesso
    CANCELLED: 'cancelled',     // Consulta cancelada pelo paciente ou médico
    RESCHEDULED: 'rescheduled'  // Consulta reagendada para nova data/hora
};

// Tipos de consulta disponíveis na plataforma
const APPOINTMENT_TYPES = {
    VIDEO: 'video',  // Consulta por videochamada (padrão)
    PHONE: 'phone',  // Consulta por telefone
    CHAT: 'chat'     // Consulta apenas por chat/texto
};

/**
 * DADOS DE EXEMPLO DAS CONSULTAS
 * Array com consultas fictícias para demonstração e testes da plataforma
 * Cada consulta contém informações completas: paciente, médico, especialidade, 
 * data/hora, status, preço, sintomas e observações
 */
const SAMPLE_APPOINTMENTS = [
    {
        id: 1,                                          // ID único da consulta
        patient: 'João Silva',                          // Nome do paciente
        doctor: 'Dr. Roberto Santos',                   // Nome do médico responsável
        specialty: 'Cardiologia',                       // Especialidade médica
        date: '2024-07-20',                            // Data da consulta (YYYY-MM-DD)
        time: '14:00',                                 // Horário da consulta (HH:MM)
        duration: 30,                                  // Duração em minutos
        status: APPOINTMENT_STATUSES.SCHEDULED,        // Status atual da consulta
        type: APPOINTMENT_TYPES.VIDEO,                 // Tipo de consulta (vídeo, telefone, chat)
        price: 89.90,                                  // Valor da consulta em reais
        symptoms: 'Dor no peito e falta de ar',       // Sintomas relatados pelo paciente
        notes: 'Paciente com histórico de hipertensão' // Observações médicas adicionais
    },
    {
        id: 2,
        patient: 'Maria Santos',
        doctor: 'Dra. Ana Costa',
        specialty: 'Dermatologia',
        date: '2024-07-25',
        time: '10:30',
        duration: 30,
        status: APPOINTMENT_STATUSES.SCHEDULED,
        type: APPOINTMENT_TYPES.VIDEO,
        price: 99.90,
        symptoms: 'Manchas na pele',
        notes: 'Primeira consulta'
    },
    {
        id: 3,
        patient: 'João Silva',
        doctor: 'Dr. Paulo Mendes',
        specialty: 'Psiquiatria',
        date: '2024-07-15',
        time: '16:00',
        duration: 45,
        status: APPOINTMENT_STATUSES.COMPLETED,        // Consulta já finalizada
        type: APPOINTMENT_TYPES.VIDEO,
        price: 129.90,
        symptoms: 'Ansiedade',
        notes: 'Consulta de acompanhamento'
    }
];

/**
 * GERENCIAMENTO DE CONSULTAS
 * Inicializa o sistema de consultas da plataforma
 */
function initializeAppointments() {
    loadAppointments(); // Carrega consultas salvas ou dados de exemplo
    console.log('📅 Appointments system initialized');
}

/**
 * CARREGAR CONSULTAS
 * Carrega consultas do localStorage ou usa dados de exemplo se não houver dados salvos
 */
function loadAppointments() {
    // Tenta carregar consultas salvas do localStorage
    const stored = localStorage.getItem('telemed-appointments');
    if (stored) {
        try {
            // Converte JSON salvo de volta para objeto JavaScript
            TeleMed.appointments = JSON.parse(stored);
        } catch (e) {
            // Se houver erro na conversão, usa dados de exemplo
            console.error('Error loading appointments:', e);
            TeleMed.appointments = [...SAMPLE_APPOINTMENTS];
        }
    } else {
        // Se não há dados salvos, usa dados de exemplo
        TeleMed.appointments = [...SAMPLE_APPOINTMENTS];
    }
    
    // Filtra consultas para mostrar apenas as do usuário atual
    if (TeleMed.currentUser) {
        TeleMed.userAppointments = TeleMed.appointments.filter(apt => 
            apt.patient === TeleMed.currentUser.name || 
            apt.doctor === TeleMed.currentUser.name
        );
    }
}

/**
 * SALVAR CONSULTAS
 * Salva todas as consultas no localStorage para persistência dos dados
 */
function saveAppointments() {
    localStorage.setItem('telemed-appointments', JSON.stringify(TeleMed.appointments));
}

/**
 * MOSTRAR ABA DE CONSULTAS
 * Alterna entre as abas "Próximas" e "Anteriores" na interface de consultas
 * @param {string} tabName - Nome da aba ('upcoming' ou 'past')
 */
function showAppointmentTab(tabName) {
    // Remove estilo ativo de todos os botões de aba
    const tabButtons = document.querySelectorAll('.appointment-tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-blue-600', 'text-white');
        btn.classList.add('text-gray-600');
    });
    
    // Adiciona estilo ativo ao botão da aba selecionada
    const activeBtn = document.getElementById(tabName + 'TabBtn');
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-blue-600', 'text-white');
        activeBtn.classList.remove('text-gray-600');
    }
    
    // Renderiza as consultas apropriadas para a aba selecionada
    renderAppointments(tabName);
}

// Render Appointments
function renderAppointments(tabType = 'upcoming') {
    const container = document.getElementById('appointmentsContent');
    if (!container) return;
    
    const userAppointments = TeleMed.userAppointments || [];
    const now = new Date();
    
    let filteredAppointments;
    
    if (tabType === 'upcoming') {
        filteredAppointments = userAppointments.filter(apt => {
            const aptDate = new Date(apt.date + 'T' + apt.time);
            return aptDate > now && apt.status !== APPOINTMENT_STATUSES.CANCELLED;
        });
    } else {
        filteredAppointments = userAppointments.filter(apt => {
            const aptDate = new Date(apt.date + 'T' + apt.time);
            return aptDate <= now || apt.status === APPOINTMENT_STATUSES.COMPLETED;
        });
    }
    
    if (filteredAppointments.length === 0) {
        container.innerHTML = renderEmptyState(tabType);
        return;
    }
    
    // Sort appointments by date
    filteredAppointments.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return tabType === 'upcoming' ? dateA - dateB : dateB - dateA;
    });
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${filteredAppointments.map(apt => renderAppointmentCard(apt, tabType)).join('')}
        </div>
    `;
}

// Render Empty State
function renderEmptyState(tabType) {
    const message = tabType === 'upcoming' 
        ? 'Você não tem consultas agendadas'
        : 'Você não tem consultas anteriores';
    
    const action = tabType === 'upcoming'
        ? `<button onclick="showSection('specialties')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
               Agendar Consulta
           </button>`
        : '';
    
    return `
        <div class="text-center py-16">
            <div class="text-6xl mb-4">📅</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">${message}</h3>
            <p class="text-gray-600 mb-6">
                ${tabType === 'upcoming' 
                    ? 'Quando você agendar consultas, elas aparecerão aqui' 
                    : 'Suas consultas realizadas aparecerão aqui'}
            </p>
            ${action}
        </div>
    `;
}

// Render Appointment Card
function renderAppointmentCard(appointment, tabType) {
    const statusColor = getStatusColor(appointment.status);
    const typeIcon = getTypeIcon(appointment.type);
    const canJoin = canJoinAppointment(appointment);
    const canCancel = canCancelAppointment(appointment);
    
    const actions = tabType === 'upcoming' 
        ? renderUpcomingActions(appointment, canJoin, canCancel)
        : renderPastActions(appointment);
    
    return `
        <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-2">
                    <div class="text-2xl">${typeIcon}</div>
                    <div class="text-sm font-medium text-gray-600">${appointment.specialty}</div>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full ${statusColor}"></div>
                    <span class="text-sm font-medium text-gray-600">${getStatusLabel(appointment.status)}</span>
                </div>
            </div>
            
            <div class="mb-4">
                <h3 class="text-lg font-bold text-gray-900 mb-1">${appointment.doctor}</h3>
                <div class="text-sm text-gray-600 space-y-1">
                    <div class="flex items-center space-x-2">
                        <span>📅</span>
                        <span>${formatDate(appointment.date)}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span>⏰</span>
                        <span>${appointment.time} (${appointment.duration} min)</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span>💰</span>
                        <span>${formatCurrency(appointment.price)}</span>
                    </div>
                </div>
            </div>
            
            ${appointment.symptoms ? `
                <div class="mb-4">
                    <div class="text-sm font-medium text-gray-700 mb-1">Sintomas:</div>
                    <div class="text-sm text-gray-600">${appointment.symptoms}</div>
                </div>
            ` : ''}
            
            ${actions}
        </div>
    `;
}

// Render Upcoming Actions
function renderUpcomingActions(appointment, canJoin, canCancel) {
    const joinButton = canJoin 
        ? `<button onclick="joinAppointment(${appointment.id})" 
                   class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex-1">
               🎥 Entrar
           </button>`
        : `<button class="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed flex-1" disabled>
               ⏰ Aguardar
           </button>`;
    
    const cancelButton = canCancel
        ? `<button onclick="cancelAppointment(${appointment.id})" 
                   class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
               Cancelar
           </button>`
        : '';
    
    return `
        <div class="flex space-x-2">
            ${joinButton}
            <button onclick="rescheduleAppointment(${appointment.id})" 
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                📅 Reagendar
            </button>
            ${cancelButton}
        </div>
    `;
}

// Render Past Actions
function renderPastActions(appointment) {
    return `
        <div class="flex space-x-2">
            <button onclick="viewAppointmentDetails(${appointment.id})" 
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex-1">
                📋 Detalhes
            </button>
            <button onclick="viewMedicalRecord(${appointment.id})" 
                    class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                📄 Prontuário
            </button>
            <button onclick="scheduleFollowUp(${appointment.id})" 
                    class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                🔄 Retorno
            </button>
        </div>
    `;
}

// Utility Functions
function getStatusColor(status) {
    const colors = {
        [APPOINTMENT_STATUSES.SCHEDULED]: 'bg-blue-500',
        [APPOINTMENT_STATUSES.IN_PROGRESS]: 'bg-yellow-500',
        [APPOINTMENT_STATUSES.COMPLETED]: 'bg-green-500',
        [APPOINTMENT_STATUSES.CANCELLED]: 'bg-red-500',
        [APPOINTMENT_STATUSES.RESCHEDULED]: 'bg-purple-500'
    };
    return colors[status] || 'bg-gray-500';
}

function getStatusLabel(status) {
    const labels = {
        [APPOINTMENT_STATUSES.SCHEDULED]: 'Agendada',
        [APPOINTMENT_STATUSES.IN_PROGRESS]: 'Em Andamento',
        [APPOINTMENT_STATUSES.COMPLETED]: 'Concluída',
        [APPOINTMENT_STATUSES.CANCELLED]: 'Cancelada',
        [APPOINTMENT_STATUSES.RESCHEDULED]: 'Reagendada'
    };
    return labels[status] || 'Desconhecido';
}

function getTypeIcon(type) {
    const icons = {
        [APPOINTMENT_TYPES.VIDEO]: '🎥',
        [APPOINTMENT_TYPES.PHONE]: '📞',
        [APPOINTMENT_TYPES.CHAT]: '💬'
    };
    return icons[type] || '📱';
}

function canJoinAppointment(appointment) {
    const now = new Date();
    const aptTime = new Date(appointment.date + 'T' + appointment.time);
    const timeDiff = aptTime - now;
    
    // Can join 10 minutes before appointment
    return timeDiff <= 10 * 60 * 1000 && timeDiff > -30 * 60 * 1000 && 
           appointment.status === APPOINTMENT_STATUSES.SCHEDULED;
}

function canCancelAppointment(appointment) {
    const now = new Date();
    const aptTime = new Date(appointment.date + 'T' + appointment.time);
    const timeDiff = aptTime - now;
    
    // Can cancel up to 2 hours before appointment
    return timeDiff > 2 * 60 * 60 * 1000 && 
           appointment.status === APPOINTMENT_STATUSES.SCHEDULED;
}

// Appointment Actions
async function joinAppointment(appointmentId) {
    const appointment = TeleMed.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
        showNotification('Erro', 'Consulta não encontrada', 'error');
        return;
    }
    
    // Verificar se pode entrar na consulta
    if (!canJoinAppointment(appointment)) {
        showNotification('Aviso', 'Ainda não é possível entrar na consulta', 'warning');
        return;
    }

    try {
        // Gerar nome único da sala baseado no ID da consulta
        const roomName = `consultation-${appointmentId}`;
        const videoCallLink = `https://8x8.vc/${roomName}`;
        
        // Salvar link da videochamada no banco de dados
        await saveVideoCallLink(appointmentId, videoCallLink, roomName);
        
        // Atualizar status da consulta
        appointment.status = APPOINTMENT_STATUSES.IN_PROGRESS;
        appointment.joinedAt = new Date();
        appointment.videoCallLink = videoCallLink;
        appointment.videoCallRoomName = roomName;
        saveAppointments();
        
        // Enviar notificação para o médico
        await notifyDoctorVideoCallReady(appointment, videoCallLink);
        
        // Iniciar videochamada
        startVideoConsultation(appointment);
        
        showNotification('Consulta iniciada', 
            `Entrando na consulta com ${appointment.doctor}. Link enviado para o médico.`, 
            'success'
        );
        
    } catch (error) {
        console.error('Erro ao iniciar consulta:', error);
        showNotification('Erro', 'Erro ao iniciar consulta. Tente novamente.', 'error');
    }
}

/**
 * SALVAR LINK DA VIDEOCHAMADA NO BANCO
 * Salva o link da videochamada na tabela appointments
 * @param {string} appointmentId - ID da consulta
 * @param {string} videoCallLink - Link da videochamada
 * @param {string} roomName - Nome da sala
 */
async function saveVideoCallLink(appointmentId, videoCallLink, roomName) {
    try {
        if (typeof supabase !== 'undefined') {
            const { data, error } = await supabase
                .from('appointments')
                .update({
                    video_call_link: videoCallLink,
                    video_call_room_name: roomName,
                    updated_at: new Date().toISOString()
                })
                .eq('id', appointmentId);

            if (error) {
                console.error('Erro ao salvar link da videochamada:', error);
                throw error;
            }

            console.log('✅ Link da videochamada salvo no banco:', { appointmentId, videoCallLink });
        } else {
            console.log('⚠️ Supabase não disponível - salvando localmente');
            // Fallback: salvar no localStorage
            const appointments = JSON.parse(localStorage.getItem('telemed-appointments') || '[]');
            const appointmentIndex = appointments.findIndex(apt => apt.id == appointmentId);
            if (appointmentIndex !== -1) {
                appointments[appointmentIndex].videoCallLink = videoCallLink;
                appointments[appointmentIndex].videoCallRoomName = roomName;
                localStorage.setItem('telemed-appointments', JSON.stringify(appointments));
            }
        }
    } catch (error) {
        console.error('Erro ao salvar link da videochamada:', error);
        throw error;
    }
}

/**
 * NOTIFICAR MÉDICO SOBRE VIDEOCHAMADA
 * Envia notificação para o médico com o link da videochamada
 * @param {Object} appointment - Dados da consulta
 * @param {string} videoCallLink - Link da videochamada
 */
async function notifyDoctorVideoCallReady(appointment, videoCallLink) {
    try {
        const notificationData = {
            title: '🎥 Paciente entrou na consulta',
            message: `${appointment.patient} entrou na videochamada. Clique para participar.`,
            type: 'video_call_ready',
            appointment_id: appointment.id,
            video_call_link: videoCallLink,
            patient_name: appointment.patient,
            specialty: appointment.specialty,
            scheduled_time: `${appointment.date} ${appointment.time}`
        };

        // Tentar enviar via Supabase (notificação em tempo real)
        if (typeof supabase !== 'undefined') {
            // Buscar ID do médico
            const { data: doctorData, error: doctorError } = await supabase
                .from('doctors')
                .select('user_id')
                .eq('name', appointment.doctor)
                .single();

            if (!doctorError && doctorData) {
                // Inserir notificação na tabela
                const { error: notificationError } = await supabase
                    .from('notifications')
                    .insert({
                        user_id: doctorData.user_id,
                        type: 'video_call_ready',
                        title: notificationData.title,
                        message: notificationData.message,
                        data: {
                            appointment_id: appointment.id,
                            video_call_link: videoCallLink,
                            patient_name: appointment.patient,
                            specialty: appointment.specialty,
                            scheduled_time: notificationData.scheduled_time
                        },
                        channels: ['browser', 'email'],
                        is_read: false
                    });

                if (notificationError) {
                    console.error('Erro ao inserir notificação:', notificationError);
                } else {
                    console.log('✅ Notificação enviada para o médico via Supabase');
                }
            }
        }

        // Fallback: notificação via sistema local
        if (typeof window.notificationSystem !== 'undefined') {
            window.notificationSystem.sendDoctorNotification(appointment.doctor, notificationData);
        }

        // Simular notificação visual para demonstração
        showDoctorNotificationDemo(appointment, videoCallLink);

        console.log('✅ Médico notificado sobre videochamada:', { 
            doctor: appointment.doctor, 
            link: videoCallLink 
        });

    } catch (error) {
        console.error('Erro ao notificar médico:', error);
        // Não falhar a consulta por erro de notificação
    }
}

/**
 * DEMONSTRAÇÃO DE NOTIFICAÇÃO DO MÉDICO
 * Simula como o médico receberia a notificação
 * @param {Object} appointment - Dados da consulta
 * @param {string} videoCallLink - Link da videochamada
 */
function showDoctorNotificationDemo(appointment, videoCallLink) {
    // Criar elemento de notificação flutuante
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.style.animation = 'slideInRight 0.3s ease-out';
    
    notification.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="text-2xl">👨‍⚕️</div>
            <div class="flex-1">
                <div class="font-bold text-sm mb-1">Notificação para ${appointment.doctor}</div>
                <div class="text-sm opacity-90 mb-2">
                    ${appointment.patient} entrou na videochamada
                </div>
                <div class="flex space-x-2">
                    <button 
                        onclick="openDoctorVideoCall('${videoCallLink}')" 
                        class="bg-white text-green-600 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-100">
                        Entrar na Consulta
                    </button>
                    <button 
                        onclick="this.closest('.fixed').remove()" 
                        class="bg-green-700 text-white px-3 py-1 rounded text-xs hover:bg-green-800">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover após 30 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 30000);
    
    // Adicionar som de notificação (se disponível)
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuR2O/Eeyw');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignorar erro se não conseguir tocar
    } catch (e) {}
}

/**
 * ABRIR VIDEOCHAMADA PARA O MÉDICO
 * Abre o link da videochamada para o médico
 * @param {string} videoCallLink - Link da videochamada
 */
function openDoctorVideoCall(videoCallLink) {
    // Abrir em nova janela/aba
    const windowFeatures = 'width=1200,height=800,scrollbars=yes,resizable=yes,status=yes,menubar=no,toolbar=no';
    const videoWindow = window.open(videoCallLink, 'doctor-videocall', windowFeatures);
    
    if (videoWindow) {
        videoWindow.focus();
        
        // Remover notificação
        const notification = document.querySelector('.fixed.top-4.right-4');
        if (notification) {
            notification.remove();
        }
        
        showNotification('Médico conectado', 
            'O médico foi direcionado para a videochamada', 
            'success'
        );
    } else {
        alert('Não foi possível abrir a videochamada. Verifique se o bloqueador de pop-ups está desabilitado.');
    }
}

/**
 * INICIAR VIDEOCONSULTA
 * Inicia a videochamada para a consulta
 * @param {Object} appointment - Dados da consulta
 */
function startVideoConsultation(appointment) {
    try {
        // Gerar nome único da sala baseado no ID da consulta
        const roomName = `consultation-${appointment.id}`;
        
        // Dados do usuário para a videochamada
        const userData = {
            name: TeleMed.currentUser?.name || 'Paciente',
            email: TeleMed.currentUser?.email || '',
            role: TeleMed.currentUser?.role || 'patient',
            appointmentId: appointment.id
        };
        
        // Verificar se o sistema de videochamada está disponível
        if (typeof VideoCallSystem !== 'undefined') {
            // Usar sistema completo de videochamada
            const videoSystem = new VideoCallSystem();
            videoSystem.consultationData = appointment;
            videoSystem.joinVideoCall(roomName, 'patient', userData);
        } else if (typeof window.videoCallSystem !== 'undefined') {
            // Usar instância global existente
            window.videoCallSystem.consultationData = appointment;
            window.videoCallSystem.joinVideoCall(roomName, 'patient', userData);
        } else {
            // Fallback: abrir Jitsi Meet diretamente
            openJitsiMeetDirectly(roomName, userData, appointment);
        }
        
        // Log da entrada na consulta
        logAppointmentChange(appointment.id, 'status', 'scheduled', 'in_progress', 'Paciente entrou na videoconsulta');
        
        // Atualizar interface
        renderAppointments('upcoming');
        
    } catch (error) {
        console.error('Erro ao iniciar videoconsulta:', error);
        showNotification('Erro', 'Erro ao iniciar videoconsulta. Tente novamente.', 'error');
        
        // Reverter status se houver erro
        appointment.status = APPOINTMENT_STATUSES.SCHEDULED;
        saveAppointments();
    }
}

/**
 * ABRIR JITSI MEET DIRETAMENTE
 * Fallback para abrir Jitsi Meet quando o sistema completo não está disponível
 * @param {string} roomName - Nome da sala
 * @param {Object} userData - Dados do usuário
 * @param {Object} appointment - Dados da consulta
 */
function openJitsiMeetDirectly(roomName, userData, appointment) {
    // Criar URL do Jitsi Meet
    const jitsiUrl = `https://8x8.vc/${roomName}`;
    
    // Configurações da janela
    const windowFeatures = 'width=1200,height=800,scrollbars=yes,resizable=yes,status=yes,menubar=no,toolbar=no';
    
    // Abrir em nova janela
    const videoWindow = window.open(jitsiUrl, `videocall-${appointment.id}`, windowFeatures);
    
    if (videoWindow) {
        // Focar na janela da videochamada
        videoWindow.focus();
        
        // Monitorar se a janela foi fechada
        const checkClosed = setInterval(() => {
            if (videoWindow.closed) {
                clearInterval(checkClosed);
                onVideoCallEnded(appointment);
            }
        }, 1000);
        
        // Salvar referência da janela
        appointment.videoWindow = videoWindow;
        
        console.log('✅ Jitsi Meet aberto diretamente:', jitsiUrl);
    } else {
        throw new Error('Não foi possível abrir a janela de videochamada. Verifique se o bloqueador de pop-ups está desabilitado.');
    }
}

/**
 * QUANDO VIDEOCHAMADA TERMINA
 * Processa o fim da videochamada
 * @param {Object} appointment - Dados da consulta
 */
function onVideoCallEnded(appointment) {
    try {
        // Calcular duração da consulta
        const duration = appointment.joinedAt ? 
            Math.round((new Date() - new Date(appointment.joinedAt)) / 1000 / 60) : 0;
        
        // Atualizar status da consulta
        appointment.status = APPOINTMENT_STATUSES.COMPLETED;
        appointment.completedAt = new Date();
        appointment.actualDuration = duration;
        
        // Salvar alterações
        saveAppointments();
        
        // Log do fim da consulta
        logAppointmentChange(appointment.id, 'status', 'in_progress', 'completed', `Consulta finalizada após ${duration} minutos`);
        
        // Mostrar notificação
        showNotification('Consulta finalizada', 
            `Consulta com ${appointment.doctor} finalizada (${duration} min)`, 
            'success'
        );
        
        // Atualizar interface
        renderAppointments('upcoming');
        
        // Mostrar opções pós-consulta
        showPostConsultationOptions(appointment);
        
        console.log('✅ Videochamada finalizada:', { appointmentId: appointment.id, duration });
        
    } catch (error) {
        console.error('Erro ao processar fim da videochamada:', error);
    }
}

/**
 * MOSTRAR OPÇÕES PÓS-CONSULTA
 * Exibe opções disponíveis após o fim da consulta
 * @param {Object} appointment - Dados da consulta
 */
function showPostConsultationOptions(appointment) {
    const modal = document.createElement('div');
    modal.id = 'postConsultationModal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content max-w-2xl">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">✅ Consulta Finalizada</h3>
                <button onclick="closeModal('postConsultationModal')" class="modal-close">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-4">🎉</div>
                    <h4 class="text-xl font-bold text-gray-900 mb-2">Consulta realizada com sucesso!</h4>
                    <p class="text-gray-600">
                        Sua consulta com ${appointment.doctor} foi finalizada.
                    </p>
                </div>
                
                <!-- Resumo da Consulta -->
                <div class="bg-blue-50 p-4 rounded-lg mb-6">
                    <h5 class="font-bold text-blue-900 mb-2">Resumo da Consulta</h5>
                    <div class="text-sm space-y-1">
                        <div><strong>Médico:</strong> ${appointment.doctor}</div>
                        <div><strong>Especialidade:</strong> ${appointment.specialty}</div>
                        <div><strong>Duração:</strong> ${appointment.actualDuration || 0} minutos</div>
                        <div><strong>Data:</strong> ${formatDate(appointment.date)} ${appointment.time}</div>
                    </div>
                </div>
                
                <!-- Ações Disponíveis -->
                <div class="space-y-3">
                    <button 
                        onclick="waitForMedicalRecord('${appointment.id}')" 
                        class="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center space-x-2">
                        <span>📋</span>
                        <span>Aguardar Prontuário Médico</span>
                    </button>
                    
                    <button 
                        onclick="scheduleFollowUp('${appointment.id}')" 
                        class="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center space-x-2">
                        <span>📅</span>
                        <span>Agendar Consulta de Retorno</span>
                    </button>
                    
                    <button 
                        onclick="provideFeedback('${appointment.id}')" 
                        class="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition font-semibold flex items-center justify-center space-x-2">
                        <span>⭐</span>
                        <span>Avaliar Consulta</span>
                    </button>
                    
                    <button 
                        onclick="downloadConsultationSummary('${appointment.id}')" 
                        class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center space-x-2">
                        <span>📄</span>
                        <span>Baixar Resumo da Consulta</span>
                    </button>
                </div>
                
                <!-- Botão para Fechar -->
                <div class="mt-6 pt-4 border-t">
                    <button 
                        onclick="closeModal('postConsultationModal')" 
                        class="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
    
    // Auto-fechar após 30 segundos se não houver interação
    setTimeout(() => {
        const modalElement = document.getElementById('postConsultationModal');
        if (modalElement) {
            modalElement.remove();
        }
    }, 30000);
}

/**
 * AGUARDAR PRONTUÁRIO MÉDICO
 * Configura notificação para quando o prontuário estiver disponível
 * @param {string} appointmentId - ID da consulta
 */
function waitForMedicalRecord(appointmentId) {
    closeModal('postConsultationModal');
    
    // Configurar verificação periódica do prontuário
    const checkInterval = setInterval(() => {
        const medicalRecord = findMedicalRecordByAppointment(appointmentId);
        if (medicalRecord) {
            clearInterval(checkInterval);
            showNotification('Prontuário disponível', 
                'Seu prontuário médico está pronto para visualização', 
                'success'
            );
            
            // Mostrar opção para visualizar
            setTimeout(() => {
                if (confirm('Seu prontuário médico está pronto. Deseja visualizá-lo agora?')) {
                    viewMedicalRecord(appointmentId);
                }
            }, 1000);
        }
    }, 30000); // Verificar a cada 30 segundos
    
    // Parar verificação após 1 hora
    setTimeout(() => {
        clearInterval(checkInterval);
    }, 3600000);
    
    showNotification('Aguardando prontuário', 
        'Você será notificado quando o prontuário estiver disponível', 
        'info'
    );
}

/**
 * FORNECER FEEDBACK DA CONSULTA
 * Abre interface para avaliar a consulta
 * @param {string} appointmentId - ID da consulta
 */
function provideFeedback(appointmentId) {
    closeModal('postConsultationModal');
    
    // Verificar se sistema de feedback existe
    if (typeof showFeedbackModal === 'function') {
        showFeedbackModal(appointmentId);
    } else {
        // Fallback: feedback simples
        showSimpleFeedbackModal(appointmentId);
    }
}

/**
 * MOSTRAR MODAL DE FEEDBACK SIMPLES
 * Modal básico para avaliação da consulta
 * @param {string} appointmentId - ID da consulta
 */
function showSimpleFeedbackModal(appointmentId) {
    const modal = document.createElement('div');
    modal.id = 'simpleFeedbackModal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content max-w-lg">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">⭐ Avaliar Consulta</h3>
                <button onclick="closeModal('simpleFeedbackModal')" class="modal-close">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="text-center mb-6">
                    <h4 class="text-lg font-bold text-gray-900 mb-2">Como foi sua experiência?</h4>
                    <p class="text-gray-600">Sua avaliação nos ajuda a melhorar nossos serviços</p>
                </div>
                
                <!-- Avaliação por Estrelas -->
                <div class="mb-6">
                    <div class="text-center mb-3">
                        <div class="flex justify-center space-x-1" id="starRating">
                            ${[1,2,3,4,5].map(star => `
                                <button onclick="setRating(${star})" 
                                        class="star-btn text-3xl text-gray-300 hover:text-yellow-400 transition"
                                        data-star="${star}">⭐</button>
                            `).join('')}
                        </div>
                        <div id="ratingText" class="text-sm text-gray-600 mt-2">Clique nas estrelas para avaliar</div>
                    </div>
                </div>
                
                <!-- Comentário -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Comentário (opcional)
                    </label>
                    <textarea 
                        id="feedbackComment" 
                        rows="4"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Conte-nos sobre sua experiência..."></textarea>
                </div>
                
                <!-- Botões -->
                <div class="flex space-x-3">
                    <button 
                        onclick="submitFeedback('${appointmentId}')" 
                        class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                        Enviar Avaliação
                    </button>
                    <button 
                        onclick="closeModal('simpleFeedbackModal')" 
                        class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
                        Pular
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
}

/**
 * DEFINIR AVALIAÇÃO
 * Define a avaliação por estrelas
 * @param {number} rating - Número de estrelas (1-5)
 */
function setRating(rating) {
    const stars = document.querySelectorAll('.star-btn');
    const ratingText = document.getElementById('ratingText');
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('text-gray-300');
            star.classList.add('text-yellow-400');
        } else {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-gray-300');
        }
    });
    
    const ratingLabels = {
        1: 'Muito insatisfeito',
        2: 'Insatisfeito', 
        3: 'Neutro',
        4: 'Satisfeito',
        5: 'Muito satisfeito'
    };
    
    ratingText.textContent = ratingLabels[rating];
    
    // Salvar rating globalmente
    window.currentRating = rating;
}

/**
 * ENVIAR FEEDBACK
 * Envia a avaliação da consulta
 * @param {string} appointmentId - ID da consulta
 */
function submitFeedback(appointmentId) {
    const rating = window.currentRating || 0;
    const comment = document.getElementById('feedbackComment')?.value || '';
    
    if (rating === 0) {
        showNotification('Aviso', 'Por favor, selecione uma avaliação', 'warning');
        return;
    }
    
    // Salvar feedback
    const feedback = {
        appointmentId: appointmentId,
        rating: rating,
        comment: comment,
        submittedAt: new Date(),
        userId: TeleMed.currentUser?.id
    };
    
    // Salvar no localStorage (em produção seria no banco)
    const existingFeedbacks = JSON.parse(localStorage.getItem('telemed-feedbacks') || '[]');
    existingFeedbacks.push(feedback);
    localStorage.setItem('telemed-feedbacks', JSON.stringify(existingFeedbacks));
    
    // Fechar modal
    closeModal('simpleFeedbackModal');
    
    // Mostrar agradecimento
    showNotification('Obrigado!', 
        'Sua avaliação foi enviada com sucesso', 
        'success'
    );
    
    console.log('✅ Feedback enviado:', feedback);
}

/**
 * BAIXAR RESUMO DA CONSULTA
 * Gera e baixa um resumo da consulta
 * @param {string} appointmentId - ID da consulta
 */
function downloadConsultationSummary(appointmentId) {
    const appointment = TeleMed.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    closeModal('postConsultationModal');
    
    // Gerar resumo
    const summary = {
        consultationId: appointment.id,
        patient: appointment.patient,
        doctor: appointment.doctor,
        specialty: appointment.specialty,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.actualDuration || 0,
        status: appointment.status,
        symptoms: appointment.symptoms,
        notes: appointment.notes,
        price: appointment.price,
        generatedAt: new Date().toISOString()
    };
    
    // Criar e baixar arquivo JSON
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumo_consulta_${appointment.id}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Download iniciado', 
        'Resumo da consulta baixado com sucesso', 
        'success'
    );
}

function cancelAppointment(appointmentId) {
    const appointment = TeleMed.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    // Confirm cancellation
    if (confirm('Tem certeza que deseja cancelar esta consulta?')) {
        appointment.status = APPOINTMENT_STATUSES.CANCELLED;
        appointment.cancelledAt = new Date();
        
        saveAppointments();
        renderAppointments('upcoming');
        
        showNotification('Consulta cancelada', 
            'Sua consulta foi cancelada com sucesso', 
            'success'
        );
        
        // Process refund (if applicable)
        processRefund(appointment);
    }
}

function rescheduleAppointment(appointmentId) {
    const appointment = TeleMed.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    // Show rescheduling interface
    showRescheduleModal(appointment);
}

function scheduleFollowUp(appointmentId) {
    const appointment = TeleMed.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    // Create follow-up appointment
    const followUp = {
        ...appointment,
        id: generateId(),
        date: '', // Will be set by user
        time: '',
        status: APPOINTMENT_STATUSES.SCHEDULED,
        notes: `Consulta de retorno - ${appointment.notes}`
    };
    
    // Show scheduling interface
    showScheduleModal(followUp);
}

function viewAppointmentDetails(appointmentId) {
    const appointment = TeleMed.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    showAppointmentDetailsModal(appointment);
}

/**
 * VISUALIZAR PRONTUÁRIO MÉDICO
 * Abre o prontuário médico associado à consulta
 * @param {string} appointmentId - ID da consulta
 */
function viewMedicalRecord(appointmentId) {
    const appointment = TeleMed.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
        showNotification('Erro', 'Consulta não encontrada', 'error');
        return;
    }
    
    // Verificar se a consulta foi concluída
    if (appointment.status !== APPOINTMENT_STATUSES.COMPLETED) {
        showNotification('Aviso', 'O prontuário só está disponível após a conclusão da consulta', 'warning');
        return;
    }
    
    // Buscar prontuário médico associado à consulta
    const medicalRecord = findMedicalRecordByAppointment(appointmentId);
    
    if (medicalRecord) {
        // Se prontuário existe, mostrar detalhes
        showMedicalRecordModal(medicalRecord, appointment);
    } else {
        // Se não existe, mostrar opção para criar (apenas para médicos)
        if (TeleMed.currentUser && TeleMed.currentUser.role === 'doctor') {
            showCreateMedicalRecordOption(appointment);
        } else {
            showNotification('Info', 'Prontuário ainda não foi criado pelo médico', 'info');
        }
    }
}

/**
 * BUSCAR HISTÓRICO MÉDICO COMPLETO DO PACIENTE
 * Abre a interface completa de histórico médico
 */
function viewPatientMedicalHistory() {
    if (!TeleMed.currentUser) {
        showNotification('Erro', 'Usuário não autenticado', 'error');
        return;
    }
    
    // Verificar se a função do sistema de histórico médico existe
    if (typeof showMedicalHistoryInterface === 'function') {
        showMedicalHistoryInterface();
    } else {
        // Fallback: mostrar histórico básico
        showBasicMedicalHistory();
    }
}

/**
 * MOSTRAR HISTÓRICO MÉDICO BÁSICO
 * Exibe histórico médico básico se o sistema completo não estiver disponível
 */
function showBasicMedicalHistory() {
    const modal = document.createElement('div');
    modal.id = 'basicMedicalHistoryModal';
    modal.className = 'modal-overlay';
    
    // Buscar todas as consultas concluídas do paciente
    const completedAppointments = TeleMed.userAppointments.filter(apt => 
        apt.status === APPOINTMENT_STATUSES.COMPLETED
    );
    
    // Buscar prontuários associados
    const medicalRecords = [];
    completedAppointments.forEach(appointment => {
        const record = findMedicalRecordByAppointment(appointment.id);
        if (record) {
            medicalRecords.push({
                ...record,
                appointment: appointment
            });
        }
    });
    
    modal.innerHTML = `
        <div class="modal-content max-w-6xl max-h-[90vh] overflow-y-auto">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">📚 Histórico Médico Completo</h3>
                <button onclick="closeModal('basicMedicalHistoryModal')" class="modal-close">&times;</button>
            </div>
            
            <div class="modal-body">
                <!-- Resumo do Paciente -->
                <div class="bg-blue-50 p-6 rounded-lg mb-6">
                    <h4 class="font-bold text-blue-900 mb-3">Informações do Paciente</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <strong>Nome:</strong> ${TeleMed.currentUser.name}
                        </div>
                        <div>
                            <strong>Email:</strong> ${TeleMed.currentUser.email || 'N/A'}
                        </div>
                        <div>
                            <strong>Total de Consultas:</strong> ${completedAppointments.length}
                        </div>
                        <div>
                            <strong>Prontuários:</strong> ${medicalRecords.length}
                        </div>
                        <div>
                            <strong>Última Consulta:</strong> ${completedAppointments.length > 0 ? 
                                formatDate(completedAppointments[completedAppointments.length - 1].date) : 'N/A'}
                        </div>
                        <div>
                            <strong>Especialidades:</strong> ${[...new Set(completedAppointments.map(apt => apt.specialty))].length}
                        </div>
                    </div>
                </div>
                
                <!-- Filtros e Busca -->
                <div class="bg-white border rounded-lg p-4 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                            <input type="text" id="historySearch" placeholder="Buscar por diagnóstico, médico..."
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   oninput="filterMedicalHistoryRecords(this.value)">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                            <select id="historySpecialtyFilter" onchange="filterMedicalHistoryRecords()"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todas as especialidades</option>
                                ${[...new Set(completedAppointments.map(apt => apt.specialty))].map(specialty => 
                                    `<option value="${specialty}">${specialty}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Período</label>
                            <select id="historyPeriodFilter" onchange="filterMedicalHistoryRecords()"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todo o período</option>
                                <option value="30">Últimos 30 dias</option>
                                <option value="90">Últimos 3 meses</option>
                                <option value="365">Último ano</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Lista de Prontuários -->
                <div id="medicalHistoryList" class="space-y-4">
                    ${medicalRecords.length > 0 ? 
                        medicalRecords.map(record => renderMedicalHistoryCard(record)).join('') :
                        `<div class="text-center py-12">
                            <div class="text-6xl mb-4">📋</div>
                            <h4 class="text-xl font-bold text-gray-900 mb-2">Nenhum prontuário encontrado</h4>
                            <p class="text-gray-600">Seus prontuários médicos aparecerão aqui após as consultas serem concluídas.</p>
                        </div>`
                    }
                </div>
                
                <!-- Estatísticas do Histórico -->
                ${medicalRecords.length > 0 ? `
                    <div class="mt-8 bg-gray-50 p-6 rounded-lg">
                        <h4 class="font-bold text-gray-900 mb-4">📊 Estatísticas do Histórico</h4>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                            <div class="bg-white p-4 rounded-lg">
                                <div class="text-2xl font-bold text-blue-600">${medicalRecords.length}</div>
                                <div class="text-sm text-gray-600">Prontuários</div>
                            </div>
                            <div class="bg-white p-4 rounded-lg">
                                <div class="text-2xl font-bold text-green-600">${medicalRecords.filter(r => r.is_signed).length}</div>
                                <div class="text-sm text-gray-600">Assinados</div>
                            </div>
                            <div class="bg-white p-4 rounded-lg">
                                <div class="text-2xl font-bold text-purple-600">${medicalRecords.filter(r => r.prescription).length}</div>
                                <div class="text-sm text-gray-600">Com Prescrição</div>
                            </div>
                            <div class="bg-white p-4 rounded-lg">
                                <div class="text-2xl font-bold text-orange-600">${[...new Set(medicalRecords.map(r => r.appointment.specialty))].length}</div>
                                <div class="text-sm text-gray-600">Especialidades</div>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Ações do Histórico -->
                <div class="mt-6 flex flex-wrap gap-3">
                    <button onclick="downloadCompleteHistory()" 
                            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                        📄 Download Histórico Completo
                    </button>
                    <button onclick="generateHistoryReport()" 
                            class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold">
                        📊 Gerar Relatório
                    </button>
                    <button onclick="exportHistoryData()" 
                            class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold">
                        💾 Exportar Dados
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
}

/**
 * RENDERIZAR CARD DE HISTÓRICO MÉDICO
 * Cria um card para cada prontuário no histórico
 * @param {Object} record - Dados do prontuário com consulta
 * @returns {string} HTML do card
 */
function renderMedicalHistoryCard(record) {
    const appointment = record.appointment;
    const signatureStatus = record.is_signed ? 
        '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✅ Assinado</span>' :
        '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⏳ Não Assinado</span>';
    
    return `
        <div class="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow medical-history-card" 
             data-specialty="${appointment.specialty}" 
             data-date="${appointment.date}"
             data-search="${record.diagnosis} ${appointment.doctor} ${appointment.specialty}">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                        <h5 class="text-lg font-bold text-gray-900">${appointment.doctor}</h5>
                        <span class="text-sm text-gray-500">•</span>
                        <span class="text-sm font-medium text-blue-600">${appointment.specialty}</span>
                    </div>
                    <div class="text-sm text-gray-600 mb-2">
                        📅 ${formatDate(appointment.date)} • ⏰ ${appointment.time}
                    </div>
                    <div class="flex items-center space-x-2">
                        ${signatureStatus}
                        ${record.prescription ? 
                            '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">💊 Com Prescrição</span>' : 
                            ''
                        }
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm text-gray-500">Prontuário #${record.id.substring(0, 8)}</div>
                </div>
            </div>
            
            <!-- Diagnóstico -->
            <div class="mb-4">
                <div class="text-sm font-medium text-gray-700 mb-1">Diagnóstico:</div>
                <div class="text-sm text-gray-600 bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                    ${record.diagnosis || 'Não informado'}
                </div>
            </div>
            
            <!-- Sintomas da Consulta -->
            ${appointment.symptoms ? `
                <div class="mb-4">
                    <div class="text-sm font-medium text-gray-700 mb-1">Sintomas Relatados:</div>
                    <div class="text-sm text-gray-600">${appointment.symptoms}</div>
                </div>
            ` : ''}
            
            <!-- Ações -->
            <div class="flex flex-wrap gap-2 mt-4">
                <button onclick="viewMedicalRecord('${appointment.id}')" 
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    📋 Ver Detalhes
                </button>
                ${record.is_signed ? `
                    <button onclick="downloadMedicalRecordPDF('${record.id}')" 
                            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium">
                        📄 Download PDF
                    </button>
                ` : ''}
                ${record.prescription ? `
                    <button onclick="downloadPrescriptionPDF('${record.id}')" 
                            class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition text-sm font-medium">
                        💊 Prescrição PDF
                    </button>
                ` : ''}
                <button onclick="scheduleFollowUp('${appointment.id}')" 
                        class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                    🔄 Agendar Retorno
                </button>
            </div>
        </div>
    `;
}

/**
 * FILTRAR REGISTROS DO HISTÓRICO MÉDICO
 * Filtra os prontuários baseado nos critérios selecionados
 * @param {string} searchTerm - Termo de busca (opcional)
 */
function filterMedicalHistoryRecords(searchTerm = '') {
    const searchInput = document.getElementById('historySearch');
    const specialtyFilter = document.getElementById('historySpecialtyFilter');
    const periodFilter = document.getElementById('historyPeriodFilter');
    
    if (!searchInput || !specialtyFilter || !periodFilter) return;
    
    const search = searchTerm || searchInput.value.toLowerCase();
    const specialty = specialtyFilter.value;
    const period = periodFilter.value;
    
    const cards = document.querySelectorAll('.medical-history-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        let show = true;
        
        // Filtro de busca
        if (search && !card.dataset.search.toLowerCase().includes(search)) {
            show = false;
        }
        
        // Filtro de especialidade
        if (specialty && card.dataset.specialty !== specialty) {
            show = false;
        }
        
        // Filtro de período
        if (period) {
            const cardDate = new Date(card.dataset.date);
            const now = new Date();
            const daysAgo = parseInt(period);
            const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
            
            if (cardDate < cutoffDate) {
                show = false;
            }
        }
        
        if (show) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Mostrar mensagem se nenhum resultado
    const listContainer = document.getElementById('medicalHistoryList');
    const existingMessage = listContainer.querySelector('.no-results-message');
    
    if (visibleCount === 0 && !existingMessage) {
        const noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'no-results-message text-center py-12';
        noResultsMessage.innerHTML = `
            <div class="text-6xl mb-4">🔍</div>
            <h4 class="text-xl font-bold text-gray-900 mb-2">Nenhum resultado encontrado</h4>
            <p class="text-gray-600">Tente ajustar os filtros ou termo de busca.</p>
        `;
        listContainer.appendChild(noResultsMessage);
    } else if (visibleCount > 0 && existingMessage) {
        existingMessage.remove();
    }
}

/**
 * DOWNLOAD DO HISTÓRICO COMPLETO
 * Gera PDF com todo o histórico médico do paciente
 */
function downloadCompleteHistory() {
    // Buscar todas as consultas concluídas
    const completedAppointments = TeleMed.userAppointments.filter(apt => 
        apt.status === APPOINTMENT_STATUSES.COMPLETED
    );
    
    // Buscar prontuários associados
    const medicalRecords = [];
    completedAppointments.forEach(appointment => {
        const record = findMedicalRecordByAppointment(appointment.id);
        if (record) {
            medicalRecords.push({
                ...record,
                appointment: appointment
            });
        }
    });
    
    if (medicalRecords.length === 0) {
        showNotification('Aviso', 'Nenhum prontuário encontrado para download', 'warning');
        return;
    }
    
    // Verificar se a função de download do sistema de histórico médico existe
    if (typeof downloadMedicalRecordPDF === 'function') {
        // Usar sistema existente para cada prontuário
        medicalRecords.forEach((record, index) => {
            setTimeout(() => {
                downloadMedicalRecordPDF(record.id);
            }, index * 1000); // Delay entre downloads
        });
        
        showNotification('Sucesso', `Iniciando download de ${medicalRecords.length} prontuários`, 'success');
    } else {
        // Fallback: gerar relatório simples
        generateSimpleHistoryReport(medicalRecords);
    }
}

/**
 * GERAR RELATÓRIO SIMPLES DO HISTÓRICO
 * Cria um relatório básico quando o sistema completo não está disponível
 * @param {Array} medicalRecords - Lista de prontuários
 */
function generateSimpleHistoryReport(medicalRecords) {
    const reportData = {
        patient: TeleMed.currentUser.name,
        generatedAt: new Date().toISOString(),
        totalRecords: medicalRecords.length,
        records: medicalRecords.map(record => ({
            date: record.appointment.date,
            time: record.appointment.time,
            doctor: record.appointment.doctor,
            specialty: record.appointment.specialty,
            diagnosis: record.diagnosis,
            prescription: record.prescription ? 'Sim' : 'Não',
            signed: record.is_signed ? 'Sim' : 'Não'
        }))
    };
    
    // Criar e baixar arquivo JSON
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_medico_${TeleMed.currentUser.name}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Sucesso', 'Relatório do histórico médico baixado', 'success');
}

/**
 * GERAR RELATÓRIO DO HISTÓRICO
 * Cria relatório estatístico do histórico médico
 */
function generateHistoryReport() {
    const completedAppointments = TeleMed.userAppointments.filter(apt => 
        apt.status === APPOINTMENT_STATUSES.COMPLETED
    );
    
    const medicalRecords = [];
    completedAppointments.forEach(appointment => {
        const record = findMedicalRecordByAppointment(appointment.id);
        if (record) {
            medicalRecords.push({
                ...record,
                appointment: appointment
            });
        }
    });
    
    // Gerar estatísticas
    const specialties = [...new Set(completedAppointments.map(apt => apt.specialty))];
    const doctors = [...new Set(completedAppointments.map(apt => apt.doctor))];
    const signedRecords = medicalRecords.filter(r => r.is_signed).length;
    const prescriptionRecords = medicalRecords.filter(r => r.prescription).length;
    
    const report = {
        patient: TeleMed.currentUser.name,
        reportDate: new Date().toISOString(),
        summary: {
            totalConsultations: completedAppointments.length,
            totalRecords: medicalRecords.length,
            signedRecords: signedRecords,
            prescriptionRecords: prescriptionRecords,
            specialtiesCount: specialties.length,
            doctorsCount: doctors.length
        },
        specialties: specialties,
        doctors: doctors,
        consultationsByMonth: getConsultationsByMonth(completedAppointments),
        recentActivity: completedAppointments.slice(-5).map(apt => ({
            date: apt.date,
            doctor: apt.doctor,
            specialty: apt.specialty
        }))
    };
    
    // Baixar relatório
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_historico_${TeleMed.currentUser.name}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Sucesso', 'Relatório estatístico gerado', 'success');
}

/**
 * OBTER CONSULTAS POR MÊS
 * Agrupa consultas por mês para estatísticas
 * @param {Array} appointments - Lista de consultas
 * @returns {Object} Consultas agrupadas por mês
 */
function getConsultationsByMonth(appointments) {
    const byMonth = {};
    
    appointments.forEach(apt => {
        const date = new Date(apt.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!byMonth[monthKey]) {
            byMonth[monthKey] = 0;
        }
        byMonth[monthKey]++;
    });
    
    return byMonth;
}

/**
 * EXPORTAR DADOS DO HISTÓRICO
 * Exporta dados do histórico em formato CSV
 */
function exportHistoryData() {
    const completedAppointments = TeleMed.userAppointments.filter(apt => 
        apt.status === APPOINTMENT_STATUSES.COMPLETED
    );
    
    const medicalRecords = [];
    completedAppointments.forEach(appointment => {
        const record = findMedicalRecordByAppointment(appointment.id);
        if (record) {
            medicalRecords.push({
                ...record,
                appointment: appointment
            });
        }
    });
    
    if (medicalRecords.length === 0) {
        showNotification('Aviso', 'Nenhum dado para exportar', 'warning');
        return;
    }
    
    // Criar CSV
    const headers = ['Data', 'Hora', 'Médico', 'Especialidade', 'Diagnóstico', 'Prescrição', 'Assinado'];
    const csvContent = [
        headers.join(','),
        ...medicalRecords.map(record => [
            record.appointment.date,
            record.appointment.time,
            `"${record.appointment.doctor}"`,
            `"${record.appointment.specialty}"`,
            `"${record.diagnosis || ''}"`,
            record.prescription ? 'Sim' : 'Não',
            record.is_signed ? 'Sim' : 'Não'
        ].join(','))
    ].join('\n');
    
    // Baixar CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_medico_${TeleMed.currentUser.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Sucesso', 'Dados do histórico exportados em CSV', 'success');
}

/**
 * BUSCAR PRONTUÁRIO POR CONSULTA
 * Busca prontuário médico associado a uma consulta
 * @param {string} appointmentId - ID da consulta
 * @returns {Object|null} Prontuário encontrado ou null
 */
function findMedicalRecordByAppointment(appointmentId) {
    // Simular busca no localStorage (em produção seria no Supabase)
    const medicalRecords = JSON.parse(localStorage.getItem('telemed-medical-records') || '[]');
    return medicalRecords.find(record => record.appointment_id === appointmentId);
}

/**
 * MOSTRAR MODAL DO PRONTUÁRIO MÉDICO
 * Exibe modal com detalhes completos do prontuário
 * @param {Object} medicalRecord - Dados do prontuário
 * @param {Object} appointment - Dados da consulta
 */
function showMedicalRecordModal(medicalRecord, appointment) {
    const modal = document.createElement('div');
    modal.id = 'medicalRecordViewModal';
    modal.className = 'modal-overlay';
    
    // Status da assinatura
    const signatureStatus = medicalRecord.is_signed ? 
        '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✅ Assinado Digitalmente</span>' :
        '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⏳ Não Assinado</span>';
    
    modal.innerHTML = `
        <div class="modal-content max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">📋 Prontuário Médico</h3>
                <button onclick="closeModal('medicalRecordViewModal')" class="modal-close">&times;</button>
            </div>
            
            <div class="modal-body">
                <!-- Informações da Consulta -->
                <div class="bg-blue-50 p-4 rounded-lg mb-6">
                    <h4 class="font-bold text-blue-900 mb-3">Informações da Consulta</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <strong>Paciente:</strong> ${appointment.patient}
                        </div>
                        <div>
                            <strong>Médico:</strong> ${appointment.doctor}
                        </div>
                        <div>
                            <strong>Especialidade:</strong> ${appointment.specialty}
                        </div>
                        <div>
                            <strong>Data:</strong> ${formatDate(appointment.date)}
                        </div>
                        <div>
                            <strong>Horário:</strong> ${appointment.time}
                        </div>
                        <div>
                            <strong>Status:</strong> ${signatureStatus}
                        </div>
                    </div>
                </div>
                
                <!-- Diagnóstico -->
                <div class="mb-6">
                    <h4 class="font-bold text-gray-900 mb-2">📋 Diagnóstico</h4>
                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                        <p class="text-gray-700 whitespace-pre-wrap">${medicalRecord.diagnosis || 'Não informado'}</p>
                    </div>
                </div>
                
                <!-- Prescrições -->
                ${medicalRecord.prescription ? `
                    <div class="mb-6">
                        <h4 class="font-bold text-gray-900 mb-2">💊 Prescrições Médicas</h4>
                        <div class="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                            <p class="text-gray-700 whitespace-pre-wrap">${medicalRecord.prescription}</p>
                            <div class="mt-3 text-xs text-orange-600">
                                <strong>Validade:</strong> 30 dias a partir da data da consulta
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Recomendações -->
                ${medicalRecord.recommendations ? `
                    <div class="mb-6">
                        <h4 class="font-bold text-gray-900 mb-2">📝 Recomendações e Orientações</h4>
                        <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                            <p class="text-gray-700 whitespace-pre-wrap">${medicalRecord.recommendations}</p>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Observações Adicionais -->
                ${medicalRecord.additional_notes ? `
                    <div class="mb-6">
                        <h4 class="font-bold text-gray-900 mb-2">📄 Observações Adicionais</h4>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-gray-700 whitespace-pre-wrap">${medicalRecord.additional_notes}</p>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Assinatura Digital -->
                ${medicalRecord.is_signed ? `
                    <div class="mb-6">
                        <h4 class="font-bold text-gray-900 mb-2">🔐 Assinatura Digital</h4>
                        <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                            <div class="flex items-center space-x-2 text-green-800 mb-2">
                                <span>✅</span>
                                <span class="font-medium">Documento assinado digitalmente</span>
                            </div>
                            <div class="text-sm text-green-700">
                                <div><strong>Médico:</strong> ${appointment.doctor}</div>
                                <div><strong>Data da assinatura:</strong> ${formatDate(medicalRecord.created_at || appointment.date)}</div>
                                <div><strong>Hash do documento:</strong> <span class="font-mono text-xs">${generateDocumentHash(medicalRecord)}</span></div>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div class="mb-6">
                        <h4 class="font-bold text-gray-900 mb-2">⚠️ Status da Assinatura</h4>
                        <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                            <div class="flex items-center space-x-2 text-yellow-800">
                                <span>⏳</span>
                                <span class="font-medium">Este prontuário ainda não foi assinado digitalmente</span>
                            </div>
                            <div class="text-sm text-yellow-700 mt-1">
                                A assinatura digital garante a autenticidade e integridade do documento médico.
                            </div>
                        </div>
                    </div>
                `}
                
                <!-- Botões de Ação -->
                <div class="flex flex-wrap gap-3 mt-6">
                    <button 
                        onclick="downloadMedicalRecordPDF('${medicalRecord.id}')"
                        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium">
                        📄 Download PDF Completo
                    </button>
                    
                    ${medicalRecord.prescription ? `
                        <button 
                            onclick="downloadPrescriptionPDF('${medicalRecord.id}')"
                            class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-medium">
                            💊 Download Prescrição
                        </button>
                    ` : ''}
                    
                    ${medicalRecord.is_signed ? `
                        <button 
                            onclick="verifyDigitalSignature('${medicalRecord.id}')"
                            class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium">
                            🔐 Verificar Assinatura
                        </button>
                    ` : ''}
                    
                    <button 
                        onclick="scheduleFollowUp('${appointment.id}')"
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                        🔄 Agendar Retorno
                    </button>
                </div>
                
                <!-- Informações Legais -->
                <div class="mt-6 p-4 bg-gray-100 rounded-lg">
                    <h5 class="font-medium text-gray-900 mb-2">ℹ️ Informações Importantes</h5>
                    <div class="text-xs text-gray-600 space-y-1">
                        <div>• Este prontuário médico tem validade legal conforme resolução CFM nº 2.314/2022</div>
                        <div>• As prescrições têm validade de 30 dias a partir da data da consulta</div>
                        <div>• Mantenha este documento em local seguro para futuras consultas</div>
                        <div>• Em caso de dúvidas, entre em contato com o médico responsável</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
}

/**
 * MOSTRAR OPÇÃO DE CRIAR PRONTUÁRIO
 * Exibe opção para médico criar prontuário (apenas para médicos)
 * @param {Object} appointment - Dados da consulta
 */
function showCreateMedicalRecordOption(appointment) {
    const modal = document.createElement('div');
    modal.id = 'createMedicalRecordOptionModal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content max-w-md">
            <div class="modal-header">
                <h3 class="text-xl font-bold text-gray-900">📋 Prontuário Médico</h3>
                <button onclick="closeModal('createMedicalRecordOptionModal')" class="modal-close">&times;</button>
            </div>
            
            <div class="modal-body text-center">
                <div class="text-6xl mb-4">📋</div>
                <h4 class="text-lg font-bold text-gray-900 mb-2">Prontuário não encontrado</h4>
                <p class="text-gray-600 mb-6">
                    Esta consulta ainda não possui um prontuário médico. 
                    Como médico responsável, você pode criar o prontuário agora.
                </p>
                
                <div class="space-y-3">
                    <button 
                        onclick="createMedicalRecordForAppointment('${appointment.id}')"
                        class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold">
                        📝 Criar Prontuário Médico
                    </button>
                    
                    <button 
                        onclick="closeModal('createMedicalRecordOptionModal')"
                        class="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
}

/**
 * CRIAR PRONTUÁRIO PARA CONSULTA
 * Abre interface de criação de prontuário médico
 * @param {string} appointmentId - ID da consulta
 */
function createMedicalRecordForAppointment(appointmentId) {
    // Fechar modal atual
    closeModal('createMedicalRecordOptionModal');
    
    // Verificar se a função do sistema de prontuários existe
    if (typeof showMedicalRecordInterface === 'function') {
        // Usar sistema de prontuários existente
        showMedicalRecordInterface(appointmentId);
    } else {
        // Fallback: mostrar formulário simples
        showSimpleMedicalRecordForm(appointmentId);
    }
}

/**
 * MOSTRAR FORMULÁRIO SIMPLES DE PRONTUÁRIO
 * Formulário básico caso o sistema completo não esteja disponível
 * @param {string} appointmentId - ID da consulta
 */
function showSimpleMedicalRecordForm(appointmentId) {
    const appointment = TeleMed.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    const modal = document.createElement('div');
    modal.id = 'simpleMedicalRecordModal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content max-w-3xl max-h-[90vh] overflow-y-auto">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">📋 Criar Prontuário Médico</h3>
                <button onclick="closeModal('simpleMedicalRecordModal')" class="modal-close">&times;</button>
            </div>
            
            <div class="modal-body">
                <!-- Informações da Consulta -->
                <div class="bg-blue-50 p-4 rounded-lg mb-6">
                    <h4 class="font-bold text-blue-900 mb-2">Informações da Consulta</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div><strong>Paciente:</strong> ${appointment.patient}</div>
                        <div><strong>Especialidade:</strong> ${appointment.specialty}</div>
                        <div><strong>Data:</strong> ${formatDate(appointment.date)} ${appointment.time}</div>
                    </div>
                </div>
                
                <!-- Formulário -->
                <form id="simpleMedicalRecordForm" data-appointment-id="${appointmentId}">
                    <div class="space-y-6">
                        <!-- Diagnóstico -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Diagnóstico *
                            </label>
                            <textarea 
                                id="diagnosis" 
                                name="diagnosis" 
                                required
                                rows="4"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Descreva o diagnóstico médico detalhado..."
                            ></textarea>
                        </div>
                        
                        <!-- Prescrições -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Prescrições Médicas
                            </label>
                            <textarea 
                                id="prescription" 
                                name="prescription" 
                                rows="4"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Liste medicamentos, dosagens e instruções..."
                            ></textarea>
                        </div>
                        
                        <!-- Recomendações -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Recomendações e Orientações
                            </label>
                            <textarea 
                                id="recommendations" 
                                name="recommendations" 
                                rows="3"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Orientações gerais, cuidados, retorno..."
                            ></textarea>
                        </div>
                        
                        <!-- Observações -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Observações Adicionais
                            </label>
                            <textarea 
                                id="additional_notes" 
                                name="additional_notes" 
                                rows="2"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Observações complementares..."
                            ></textarea>
                        </div>
                    </div>
                    
                    <!-- Botões -->
                    <div class="flex space-x-4 mt-8">
                        <button 
                            type="submit" 
                            class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-semibold">
                            💾 Salvar Prontuário
                        </button>
                        
                        <button 
                            type="button" 
                            onclick="closeModal('simpleMedicalRecordModal')"
                            class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
    
    // Adicionar event listener para o formulário
    document.getElementById('simpleMedicalRecordForm').addEventListener('submit', handleSimpleMedicalRecordSubmit);
}

/**
 * MANIPULAR ENVIO DO FORMULÁRIO SIMPLES
 * Processa o envio do formulário de prontuário simples
 * @param {Event} e - Evento de submit
 */
function handleSimpleMedicalRecordSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const appointmentId = form.dataset.appointmentId;
    
    // Validar diagnóstico obrigatório
    if (!formData.get('diagnosis').trim()) {
        showNotification('Erro', 'O diagnóstico é obrigatório', 'error');
        return;
    }
    
    // Criar objeto do prontuário
    const medicalRecord = {
        id: generateId(),
        appointment_id: appointmentId,
        diagnosis: formData.get('diagnosis'),
        prescription: formData.get('prescription'),
        recommendations: formData.get('recommendations'),
        additional_notes: formData.get('additional_notes'),
        is_signed: false,
        created_at: new Date().toISOString()
    };
    
    // Salvar no localStorage (em produção seria no Supabase)
    const existingRecords = JSON.parse(localStorage.getItem('telemed-medical-records') || '[]');
    existingRecords.push(medicalRecord);
    localStorage.setItem('telemed-medical-records', JSON.stringify(existingRecords));
    
    // Fechar modal
    closeModal('simpleMedicalRecordModal');
    
    // Mostrar notificação de sucesso
    showNotification('Sucesso', 'Prontuário médico criado com sucesso', 'success');
    
    // Abrir o prontuário criado
    setTimeout(() => {
        const appointment = TeleMed.appointments.find(apt => apt.id === appointmentId);
        showMedicalRecordModal(medicalRecord, appointment);
    }, 500);
}

/**
 * GERAR HASH DO DOCUMENTO
 * Cria hash simples para verificação de integridade
 * @param {Object} record - Dados do prontuário
 * @returns {string} Hash do documento
 */
function generateDocumentHash(record) {
    const content = JSON.stringify({
        diagnosis: record.diagnosis,
        prescription: record.prescription,
        recommendations: record.recommendations,
        created_at: record.created_at
    });
    
    // Hash simples (em produção usar SHA-256)
    return btoa(content).substring(0, 16).toUpperCase();
}

// Scheduling Functions
function showScheduleModal(appointment) {
    const modal = createScheduleModal(appointment);
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
}

function createScheduleModal(appointment) {
    const modal = document.createElement('div');
    modal.id = 'scheduleModal';
    modal.className = 'modal-overlay hidden';
    
    const today = new Date();
    const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    modal.innerHTML = `
        <div class="modal-content max-w-2xl">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">📅 Agendar Consulta</h3>
                <button onclick="closeModal('scheduleModal')" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-bold text-gray-900 mb-3">Informações da Consulta</h4>
                        <div class="space-y-2 text-sm">
                            <div><strong>Especialidade:</strong> ${appointment.specialty}</div>
                            <div><strong>Médico:</strong> ${appointment.doctor}</div>
                            <div><strong>Duração:</strong> ${appointment.duration} minutos</div>
                            <div><strong>Valor:</strong> ${formatCurrency(appointment.price)}</div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="font-bold text-gray-900 mb-3">Selecionar Data e Hora</h4>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                <input type="date" id="scheduleDate" 
                                       min="${minDate.toISOString().split('T')[0]}"
                                       max="${maxDate.toISOString().split('T')[0]}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                                <div class="grid grid-cols-3 gap-2" id="timeSlots">
                                    ${generateTimeSlots()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Sintomas ou motivo da consulta</label>
                    <textarea id="appointmentSymptoms" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="3"
                              placeholder="Descreva brevemente seus sintomas ou o motivo da consulta..."></textarea>
                </div>
                
                <div class="mt-6 flex space-x-4">
                    <button onclick="confirmSchedule(${appointment.id || 'null'})" 
                            class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                        Confirmar Agendamento
                    </button>
                    <button onclick="closeModal('scheduleModal')" 
                            class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

function generateTimeSlots() {
    const slots = [];
    const hours = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                   '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
    
    hours.forEach(time => {
        slots.push(`
            <button onclick="selectTimeSlot('${time}')" 
                    class="time-slot px-3 py-2 border border-gray-300 rounded text-sm hover:bg-blue-50 hover:border-blue-300 transition">
                ${time}
            </button>
        `);
    });
    
    return slots.join('');
}

function selectTimeSlot(time) {
    // Remove active class from all slots
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('bg-blue-600', 'text-white');
        slot.classList.add('border-gray-300');
    });
    
    // Add active class to selected slot
    event.target.classList.add('bg-blue-600', 'text-white');
    event.target.classList.remove('border-gray-300');
    
    // Store selected time
    TeleMed.selectedTime = time;
}

function confirmSchedule(appointmentId) {
    const date = document.getElementById('scheduleDate').value;
    const symptoms = document.getElementById('appointmentSymptoms').value;
    
    if (!date || !TeleMed.selectedTime) {
        showNotification('Erro', 'Por favor, selecione data e horário', 'error');
        return;
    }
    
    let appointment;
    
    if (appointmentId) {
        // Rescheduling existing appointment
        appointment = TeleMed.appointments.find(apt => apt.id === appointmentId);
        appointment.date = date;
        appointment.time = TeleMed.selectedTime;
        appointment.symptoms = symptoms;
        appointment.status = APPOINTMENT_STATUSES.SCHEDULED;
        
        showNotification('Consulta reagendada', 
            `Sua consulta foi reagendada para ${formatDate(date)} às ${TeleMed.selectedTime}`, 
            'success'
        );
    } else {
        // Creating new appointment
        appointment = {
            id: generateId(),
            patient: TeleMed.currentUser.name,
            doctor: TeleMed.selectedSpecialty.doctors[0].name,
            specialty: TeleMed.selectedSpecialty.name,
            date: date,
            time: TeleMed.selectedTime,
            duration: 30,
            status: APPOINTMENT_STATUSES.SCHEDULED,
            type: APPOINTMENT_TYPES.VIDEO,
            price: TeleMed.selectedSpecialty.price,
            symptoms: symptoms,
            notes: 'Consulta agendada via plataforma'
        };
        
        TeleMed.appointments.push(appointment);
        
        showNotification('Consulta agendada', 
            `Sua consulta foi agendada para ${formatDate(date)} às ${TeleMed.selectedTime}`, 
            'success'
        );
    }
    
    saveAppointments();
    loadAppointments();
    renderAppointments('upcoming');
    closeModal('scheduleModal');
}

// Reschedule Modal
function showRescheduleModal(appointment) {
    showScheduleModal(appointment);
}

// Appointment Details Modal
function showAppointmentDetailsModal(appointment) {
    const modal = document.createElement('div');
    modal.id = 'appointmentDetailsModal';
    modal.className = 'modal-overlay hidden';
    
    modal.innerHTML = `
        <div class="modal-content max-w-2xl">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">📋 Detalhes da Consulta</h3>
                <button onclick="closeModal('appointmentDetailsModal')" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <h4 class="font-bold text-gray-900 mb-2">Informações Básicas</h4>
                            <div class="space-y-2 text-sm">
                                <div><strong>Paciente:</strong> ${appointment.patient}</div>
                                <div><strong>Médico:</strong> ${appointment.doctor}</div>
                                <div><strong>Especialidade:</strong> ${appointment.specialty}</div>
                                <div><strong>Data:</strong> ${formatDate(appointment.date)}</div>
                                <div><strong>Horário:</strong> ${appointment.time}</div>
                                <div><strong>Duração:</strong> ${appointment.duration} minutos</div>
                                <div><strong>Tipo:</strong> ${getTypeIcon(appointment.type)} ${appointment.type}</div>
                                <div><strong>Status:</strong> <span class="font-semibold">${getStatusLabel(appointment.status)}</span></div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="font-bold text-gray-900 mb-2">Valor</h4>
                            <div class="text-2xl font-bold text-green-600">${formatCurrency(appointment.price)}</div>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <h4 class="font-bold text-gray-900 mb-2">Sintomas/Motivo</h4>
                            <div class="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                ${appointment.symptoms || 'Não informado'}
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="font-bold text-gray-900 mb-2">Observações</h4>
                            <div class="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                ${appointment.notes || 'Nenhuma observação'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
}

// Enhanced Refund Process with Rules
function processRefund(appointment) {
    const now = new Date();
    const aptTime = new Date(appointment.date + 'T' + appointment.time);
    const timeDiff = aptTime - now;
    const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
    
    let refundPercentage = 0;
    let refundReason = '';
    
    // Refund rules based on cancellation timing
    if (hoursUntilAppointment >= 24) {
        refundPercentage = 1.0; // 100% refund
        refundReason = 'Cancelamento com mais de 24h de antecedência';
    } else if (hoursUntilAppointment >= 2) {
        refundPercentage = 0.5; // 50% refund
        refundReason = 'Cancelamento entre 2-24h de antecedência';
    } else {
        refundPercentage = 0; // No refund
        refundReason = 'Cancelamento com menos de 2h de antecedência';
    }
    
    const refundAmount = appointment.price * refundPercentage;
    
    // Store refund information
    appointment.refund = {
        amount: refundAmount,
        percentage: refundPercentage,
        reason: refundReason,
        processedAt: new Date(),
        status: refundAmount > 0 ? 'processing' : 'not_applicable'
    };
    
    // Show refund notification
    if (refundAmount > 0) {
        setTimeout(() => {
            showNotification('Reembolso processado', 
                `${refundReason}. Reembolso de ${formatCurrency(refundAmount)} será processado em 3-5 dias úteis`, 
                'success'
            );
        }, 1500);
    } else {
        setTimeout(() => {
            showNotification('Sem reembolso', 
                `${refundReason}. Não há reembolso disponível para este cancelamento`, 
                'warning'
            );
        }, 1500);
    }
    
    // Log refund for audit trail
    logRefundTransaction(appointment);
}

// Log refund transaction for audit
function logRefundTransaction(appointment) {
    const refundLog = {
        appointmentId: appointment.id,
        patientName: appointment.patient,
        originalAmount: appointment.price,
        refundAmount: appointment.refund.amount,
        refundPercentage: appointment.refund.percentage,
        reason: appointment.refund.reason,
        timestamp: new Date(),
        status: appointment.refund.status
    };
    
    // Store in localStorage for audit trail
    const existingLogs = JSON.parse(localStorage.getItem('telemed-refund-logs') || '[]');
    existingLogs.push(refundLog);
    localStorage.setItem('telemed-refund-logs', JSON.stringify(existingLogs));
    
    console.log('Refund logged:', refundLog);
}

// Advanced Consultation Management Functions

/**
 * BULK APPOINTMENT OPERATIONS
 * Functions for managing multiple appointments at once
 */

// Cancel multiple appointments
function cancelMultipleAppointments(appointmentIds) {
    const appointments = appointmentIds.map(id => 
        TeleMed.appointments.find(apt => apt.id === id)
    ).filter(apt => apt && canCancelAppointment(apt));
    
    if (appointments.length === 0) {
        showNotification('Erro', 'Nenhuma consulta pode ser cancelada', 'error');
        return;
    }
    
    const confirmMessage = `Tem certeza que deseja cancelar ${appointments.length} consulta(s)?`;
    if (confirm(confirmMessage)) {
        appointments.forEach(appointment => {
            appointment.status = APPOINTMENT_STATUSES.CANCELLED;
            appointment.cancelledAt = new Date();
            processRefund(appointment);
        });
        
        saveAppointments();
        renderAppointments('upcoming');
        
        showNotification('Consultas canceladas', 
            `${appointments.length} consulta(s) foram canceladas com sucesso`, 
            'success'
        );
    }
}

// Reschedule multiple appointments
function rescheduleMultipleAppointments(appointmentIds, newDate, newTime) {
    const appointments = appointmentIds.map(id => 
        TeleMed.appointments.find(apt => apt.id === id)
    ).filter(apt => apt && apt.status === APPOINTMENT_STATUSES.SCHEDULED);
    
    if (appointments.length === 0) {
        showNotification('Erro', 'Nenhuma consulta pode ser reagendada', 'error');
        return;
    }
    
    appointments.forEach((appointment, index) => {
        const appointmentTime = new Date(`${newDate}T${newTime}`);
        appointmentTime.setMinutes(appointmentTime.getMinutes() + (index * appointment.duration));
        
        appointment.date = appointmentTime.toISOString().split('T')[0];
        appointment.time = appointmentTime.toTimeString().slice(0, 5);
        appointment.status = APPOINTMENT_STATUSES.RESCHEDULED;
        appointment.rescheduledAt = new Date();
    });
    
    saveAppointments();
    renderAppointments('upcoming');
    
    showNotification('Consultas reagendadas', 
        `${appointments.length} consulta(s) foram reagendadas com sucesso`, 
        'success'
    );
}

/**
 * APPOINTMENT FILTERING AND SEARCH
 * Advanced filtering capabilities for appointments
 */

// Filter appointments by criteria
function filterAppointments(criteria) {
    const { status, specialty, dateRange, doctor, type } = criteria;
    let filtered = [...TeleMed.userAppointments];
    
    if (status) {
        filtered = filtered.filter(apt => apt.status === status);
    }
    
    if (specialty) {
        filtered = filtered.filter(apt => 
            apt.specialty.toLowerCase().includes(specialty.toLowerCase())
        );
    }
    
    if (doctor) {
        filtered = filtered.filter(apt => 
            apt.doctor.toLowerCase().includes(doctor.toLowerCase())
        );
    }
    
    if (type) {
        filtered = filtered.filter(apt => apt.type === type);
    }
    
    if (dateRange && dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        filtered = filtered.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= startDate && aptDate <= endDate;
        });
    }
    
    return filtered;
}

// Search appointments by text
function searchAppointments(searchTerm) {
    if (!searchTerm) return TeleMed.userAppointments;
    
    const term = searchTerm.toLowerCase();
    return TeleMed.userAppointments.filter(apt => 
        apt.doctor.toLowerCase().includes(term) ||
        apt.specialty.toLowerCase().includes(term) ||
        apt.symptoms?.toLowerCase().includes(term) ||
        apt.notes?.toLowerCase().includes(term)
    );
}

/**
 * APPOINTMENT STATISTICS AND ANALYTICS
 * Functions to generate insights about appointments
 */

// Get appointment statistics
function getAppointmentStatistics() {
    const appointments = TeleMed.userAppointments || [];
    const now = new Date();
    
    const stats = {
        total: appointments.length,
        upcoming: appointments.filter(apt => {
            const aptDate = new Date(apt.date + 'T' + apt.time);
            return aptDate > now && apt.status !== APPOINTMENT_STATUSES.CANCELLED;
        }).length,
        completed: appointments.filter(apt => apt.status === APPOINTMENT_STATUSES.COMPLETED).length,
        cancelled: appointments.filter(apt => apt.status === APPOINTMENT_STATUSES.CANCELLED).length,
        totalSpent: appointments
            .filter(apt => apt.status === APPOINTMENT_STATUSES.COMPLETED)
            .reduce((sum, apt) => sum + apt.price, 0),
        averagePrice: 0,
        mostUsedSpecialty: '',
        preferredDoctor: ''
    };
    
    // Calculate average price
    const completedAppointments = appointments.filter(apt => apt.status === APPOINTMENT_STATUSES.COMPLETED);
    if (completedAppointments.length > 0) {
        stats.averagePrice = stats.totalSpent / completedAppointments.length;
    }
    
    // Find most used specialty
    const specialtyCount = {};
    appointments.forEach(apt => {
        specialtyCount[apt.specialty] = (specialtyCount[apt.specialty] || 0) + 1;
    });
    stats.mostUsedSpecialty = Object.keys(specialtyCount).reduce((a, b) => 
        specialtyCount[a] > specialtyCount[b] ? a : b, ''
    );
    
    // Find preferred doctor
    const doctorCount = {};
    appointments.forEach(apt => {
        doctorCount[apt.doctor] = (doctorCount[apt.doctor] || 0) + 1;
    });
    stats.preferredDoctor = Object.keys(doctorCount).reduce((a, b) => 
        doctorCount[a] > doctorCount[b] ? a : b, ''
    );
    
    return stats;
}

// Generate appointment report
function generateAppointmentReport(dateRange) {
    const appointments = filterAppointments({ dateRange });
    const stats = getAppointmentStatistics();
    
    const report = {
        period: dateRange,
        summary: stats,
        appointments: appointments.map(apt => ({
            id: apt.id,
            date: apt.date,
            time: apt.time,
            doctor: apt.doctor,
            specialty: apt.specialty,
            status: apt.status,
            price: apt.price,
            duration: apt.duration
        })),
        insights: {
            busyDays: getBusyDays(appointments),
            preferredTimes: getPreferredTimes(appointments),
            specialtyDistribution: getSpecialtyDistribution(appointments)
        }
    };
    
    return report;
}

// Helper functions for analytics
function getBusyDays(appointments) {
    const dayCount = {};
    appointments.forEach(apt => {
        const day = new Date(apt.date).toLocaleDateString('pt-BR', { weekday: 'long' });
        dayCount[day] = (dayCount[day] || 0) + 1;
    });
    
    return Object.entries(dayCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([day, count]) => ({ day, count }));
}

function getPreferredTimes(appointments) {
    const timeSlots = {
        morning: 0,    // 06:00 - 12:00
        afternoon: 0,  // 12:00 - 18:00
        evening: 0     // 18:00 - 24:00
    };
    
    appointments.forEach(apt => {
        const hour = parseInt(apt.time.split(':')[0]);
        if (hour >= 6 && hour < 12) timeSlots.morning++;
        else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
        else timeSlots.evening++;
    });
    
    return timeSlots;
}

function getSpecialtyDistribution(appointments) {
    const distribution = {};
    appointments.forEach(apt => {
        distribution[apt.specialty] = (distribution[apt.specialty] || 0) + 1;
    });
    
    return Object.entries(distribution)
        .map(([specialty, count]) => ({ specialty, count }))
        .sort((a, b) => b.count - a.count);
}

/**
 * APPOINTMENT REMINDERS AND NOTIFICATIONS
 * System for managing appointment reminders
 */

// Set appointment reminder
function setAppointmentReminder(appointmentId, reminderTime) {
    const appointment = TeleMed.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    const aptTime = new Date(appointment.date + 'T' + appointment.time);
    const reminderDate = new Date(aptTime.getTime() - reminderTime * 60 * 1000);
    
    if (reminderDate > new Date()) {
        const reminder = {
            id: generateId(),
            appointmentId: appointmentId,
            reminderTime: reminderDate,
            message: `Lembrete: Consulta com ${appointment.doctor} em ${reminderTime} minutos`,
            sent: false
        };
        
        // Store reminder
        const reminders = JSON.parse(localStorage.getItem('telemed-reminders') || '[]');
        reminders.push(reminder);
        localStorage.setItem('telemed-reminders', JSON.stringify(reminders));
        
        // Schedule notification
        const timeUntilReminder = reminderDate.getTime() - new Date().getTime();
        setTimeout(() => {
            showNotification('Lembrete de Consulta', reminder.message, 'info');
            markReminderAsSent(reminder.id);
        }, timeUntilReminder);
    }
}

// Mark reminder as sent
function markReminderAsSent(reminderId) {
    const reminders = JSON.parse(localStorage.getItem('telemed-reminders') || '[]');
    const reminder = reminders.find(r => r.id === reminderId);
    if (reminder) {
        reminder.sent = true;
        localStorage.setItem('telemed-reminders', JSON.stringify(reminders));
    }
}

// Check and send pending reminders
function checkPendingReminders() {
    const reminders = JSON.parse(localStorage.getItem('telemed-reminders') || '[]');
    const now = new Date();
    
    reminders
        .filter(reminder => !reminder.sent && new Date(reminder.reminderTime) <= now)
        .forEach(reminder => {
            showNotification('Lembrete de Consulta', reminder.message, 'info');
            markReminderAsSent(reminder.id);
        });
}

/**
 * APPOINTMENT HISTORY AND TRACKING
 * Functions for tracking appointment changes and history
 */

// Log appointment change
function logAppointmentChange(appointmentId, changeType, oldValue, newValue, reason) {
    const changeLog = {
        id: generateId(),
        appointmentId: appointmentId,
        changeType: changeType, // 'status', 'date', 'time', 'doctor', etc.
        oldValue: oldValue,
        newValue: newValue,
        reason: reason,
        timestamp: new Date(),
        userId: TeleMed.currentUser?.id || 'unknown'
    };
    
    // Store change log
    const logs = JSON.parse(localStorage.getItem('telemed-appointment-logs') || '[]');
    logs.push(changeLog);
    localStorage.setItem('telemed-appointment-logs', JSON.stringify(logs));
    
    console.log('Appointment change logged:', changeLog);
}

// Get appointment history
function getAppointmentHistory(appointmentId) {
    const logs = JSON.parse(localStorage.getItem('telemed-appointment-logs') || '[]');
    return logs
        .filter(log => log.appointmentId === appointmentId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Export functions
window.showAppointmentTab = showAppointmentTab;
window.joinAppointment = joinAppointment;
window.cancelAppointment = cancelAppointment;
window.rescheduleAppointment = rescheduleAppointment;
window.scheduleFollowUp = scheduleFollowUp;
window.viewAppointmentDetails = viewAppointmentDetails;
window.selectTimeSlot = selectTimeSlot;
window.confirmSchedule = confirmSchedule;
window.loadAppointments = loadAppointments;

// Export new advanced functions
window.cancelMultipleAppointments = cancelMultipleAppointments;
window.rescheduleMultipleAppointments = rescheduleMultipleAppointments;
window.filterAppointments = filterAppointments;
window.searchAppointments = searchAppointments;
window.getAppointmentStatistics = getAppointmentStatistics;
window.generateAppointmentReport = generateAppointmentReport;
window.setAppointmentReminder = setAppointmentReminder;
window.checkPendingReminders = checkPendingReminders;
window.getAppointmentHistory = getAppointmentHistory;

// Export medical history integration functions
window.viewPatientMedicalHistory = viewPatientMedicalHistory;
window.showBasicMedicalHistory = showBasicMedicalHistory;
window.renderMedicalHistoryCard = renderMedicalHistoryCard;
window.filterMedicalHistoryRecords = filterMedicalHistoryRecords;
window.downloadCompleteHistory = downloadCompleteHistory;
window.generateHistoryReport = generateHistoryReport;
window.exportHistoryData = exportHistoryData;

// Initialize appointments when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeAppointments();
});

console.log('✅ TeleMed Appointments System Loaded');