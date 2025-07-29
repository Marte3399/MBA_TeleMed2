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
function joinAppointment(appointmentId) {
    const appointment = TeleMed.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    // Update appointment status
    appointment.status = APPOINTMENT_STATUSES.IN_PROGRESS;
    saveAppointments();
    
    // Show video call
    openVideoCall();
    
    showNotification('Consulta iniciada', 
        `Entrando na consulta com ${appointment.doctor}`, 
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

// Refund Process
function processRefund(appointment) {
    const refundAmount = appointment.price * 0.9; // 10% cancellation fee
    
    setTimeout(() => {
        showNotification('Reembolso processado', 
            `Reembolso de ${formatCurrency(refundAmount)} será processado em 3-5 dias úteis`, 
            'info'
        );
    }, 2000);
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

// Initialize appointments when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeAppointments();
});

console.log('✅ TeleMed Appointments System Loaded');