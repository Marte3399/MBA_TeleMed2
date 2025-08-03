// TeleMed - Sistema de Histórico Médico

/**
 * SISTEMA DE HISTÓRICO MÉDICO
 * Gerencia visualização, download e auditoria de prontuários médicos
 */

// Estado global do sistema de histórico médico
window.MedicalHistory = {
    currentPatientId: null,
    medicalRecords: [],
    downloadAuditLog: [],
    isLoading: false,
    currentPage: 1,
    recordsPerPage: 10
};

/**
 * INICIALIZAR SISTEMA DE HISTÓRICO MÉDICO
 * Configura o sistema de histórico médico
 */
function initializeMedicalHistory() {
    console.log('📚 Inicializando sistema de histórico médico...');
    
    // Configurar event listeners
    setupMedicalHistoryEventListeners();
    
    // Verificar se há usuário logado
    if (TeleMed.currentUser && TeleMed.currentUser.id) {
        MedicalHistory.currentPatientId = TeleMed.currentUser.id;
        loadMedicalHistory();
    }
    
    console.log('✅ Sistema de histórico médico inicializado');
}

/**
 * CONFIGURAR EVENT LISTENERS
 * Configura todos os ouvintes de eventos do sistema de histórico
 */
function setupMedicalHistoryEventListeners() {
    // Event listener para botões de download
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('download-record-btn')) {
            e.preventDefault();
            const recordId = e.target.dataset.recordId;
            downloadMedicalRecordPDF(recordId);
        }
        
        if (e.target.classList.contains('download-prescription-btn')) {
            e.preventDefault();
            const recordId = e.target.dataset.recordId;
            downloadPrescriptionPDF(recordId);
        }
        
        if (e.target.classList.contains('view-record-btn')) {
            e.preventDefault();
            const recordId = e.target.dataset.recordId;
            viewMedicalRecordDetails(recordId);
        }
        
        if (e.target.id === 'refreshHistoryBtn') {
            e.preventDefault();
            loadMedicalHistory();
        }
    });
    
    // Event listener para filtros de data
    document.addEventListener('change', function(e) {
        if (e.target.id === 'dateFilterStart' || e.target.id === 'dateFilterEnd') {
            filterMedicalRecordsByDate();
        }
    });
    
    // Event listener para busca
    document.addEventListener('input', function(e) {
        if (e.target.id === 'searchMedicalRecords') {
            debounceSearch(e.target.value);
        }
    });
}

/**
 * MOSTRAR INTERFACE DE HISTÓRICO MÉDICO
 * Exibe a interface principal do histórico médico
 */
function showMedicalHistoryInterface() {
    console.log('📚 Abrindo interface de histórico médico...');
    
    // Criar modal de histórico médico
    const modal = createMedicalHistoryModal();
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
    
    // Carregar dados do histórico
    loadMedicalHistory();
}

/**
 * CRIAR MODAL DE HISTÓRICO MÉDICO
 * Cria a interface modal para visualização do histórico
 * @returns {HTMLElement} Elemento do modal
 */
function createMedicalHistoryModal() {
    const modal = document.createElement('div');
    modal.id = 'medicalHistoryModal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content max-w-6xl max-h-[90vh] overflow-y-auto">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">📚 Histórico Médico</h3>
                <button onclick="closeModal('medicalHistoryModal')" class="modal-close">&times;</button>
            </div>
            
            <div class="modal-body">
                <!-- Filtros e Busca -->
                <div class="bg-gray-50 p-4 rounded-lg mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <!-- Busca -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Buscar prontuários
                            </label>
                            <input 
                                type="text" 
                                id="searchMedicalRecords"
                                placeholder="Buscar por diagnóstico, médico ou especialidade..."
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <!-- Filtro Data Início -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Data Início
                            </label>
                            <input 
                                type="date" 
                                id="dateFilterStart"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <!-- Filtro Data Fim -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Data Fim
                            </label>
                            <input 
                                type="date" 
                                id="dateFilterEnd"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    
                    <!-- Botão Atualizar -->
                    <div class="mt-4 text-right">
                        <button 
                            id="refreshHistoryBtn"
                            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                            🔄 Atualizar
                        </button>
                    </div>
                </div>
                
                <!-- Loading State -->
                <div id="historyLoading" class="text-center py-12 hidden">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p class="mt-4 text-gray-600">Carregando histórico médico...</p>
                </div>
                
                <!-- Lista de Prontuários -->
                <div id="medicalRecordsList" class="space-y-4">
                    <!-- Records will be loaded here -->
                </div>
                
                <!-- Empty State -->
                <div id="emptyHistory" class="text-center py-12 hidden">
                    <div class="text-6xl mb-4">📋</div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Nenhum prontuário encontrado</h3>
                    <p class="text-gray-600">Você ainda não possui consultas com prontuários médicos.</p>
                </div>
                
                <!-- Paginação -->
                <div id="historyPagination" class="mt-6 flex justify-center">
                    <!-- Pagination will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

/**
 * CARREGAR HISTÓRICO MÉDICO
 * Busca e exibe os prontuários médicos do paciente
 */
async function loadMedicalHistory() {
    if (!MedicalHistory.currentPatientId) {
        console.error('❌ ID do paciente não encontrado');
        showEmptyHistory();
        return;
    }
    
    try {
        showHistoryLoading(true);
        
        console.log('📚 Carregando histórico médico do paciente:', MedicalHistory.currentPatientId);
        
        // Buscar prontuários médicos do paciente
        const { data, error } = await supabase
            .from('medical_records')
            .select(`
                id,
                appointment_id,
                diagnosis,
                prescription,
                recommendations,
                additional_notes,
                digital_signature,
                is_signed,
                created_at,
                appointments!inner(
                    id,
                    scheduled_date,
                    scheduled_time,
                    specialty_id,
                    doctor_id,
                    specialties(name, icon),
                    doctors(name, crm)
                )
            `)
            .eq('patient_id', MedicalHistory.currentPatientId)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('❌ Erro ao carregar histórico médico:', error);
            showEmptyHistory();
            return;
        }
        
        MedicalHistory.medicalRecords = data || [];
        console.log(`✅ Carregados ${MedicalHistory.medicalRecords.length} prontuários`);
        
        if (MedicalHistory.medicalRecords.length === 0) {
            showEmptyHistory();
        } else {
            renderMedicalRecords(MedicalHistory.medicalRecords);
        }
        
    } catch (error) {
        console.error('❌ Erro na conexão:', error);
        showEmptyHistory();
    } finally {
        showHistoryLoading(false);
    }
}

/**
 * RENDERIZAR PRONTUÁRIOS MÉDICOS
 * Exibe a lista de prontuários na interface
 * @param {Array} records - Lista de prontuários
 */
function renderMedicalRecords(records) {
    const listContainer = document.getElementById('medicalRecordsList');
    const emptyState = document.getElementById('emptyHistory');
    
    if (!listContainer) return;
    
    // Esconder estado vazio
    if (emptyState) emptyState.classList.add('hidden');
    
    // Renderizar cada prontuário
    listContainer.innerHTML = records.map(record => {
        const appointment = record.appointments;
        const specialty = appointment.specialties;
        const doctor = appointment.doctors;
        
        const consultationDate = formatDate(record.created_at);
        const consultationTime = formatTime(record.created_at);
        
        // Status da assinatura
        const signatureStatus = record.is_signed ? 
            '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✅ Assinado</span>' :
            '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⏳ Não assinado</span>';
        
        // Verificar se há prescrição
        const hasPrescription = record.prescription && record.prescription.trim().length > 0;
        
        return `
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="text-2xl">${specialty?.icon || '🏥'}</div>
                        <div>
                            <h4 class="text-lg font-semibold text-gray-900">${specialty?.name || 'Consulta Médica'}</h4>
                            <p class="text-sm text-gray-600">Dr. ${doctor?.name || 'N/A'} - CRM: ${doctor?.crm || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-600">${consultationDate}</div>
                        <div class="text-sm text-gray-600">${consultationTime}</div>
                        ${signatureStatus}
                    </div>
                </div>
                
                <!-- Diagnóstico (preview) -->
                <div class="mb-4">
                    <h5 class="font-medium text-gray-900 mb-1">Diagnóstico:</h5>
                    <p class="text-sm text-gray-700 line-clamp-2">${record.diagnosis || 'Não informado'}</p>
                </div>
                
                <!-- Prescrição (preview) -->
                ${hasPrescription ? `
                    <div class="mb-4">
                        <h5 class="font-medium text-gray-900 mb-1">Prescrição:</h5>
                        <p class="text-sm text-gray-700 line-clamp-2">${record.prescription}</p>
                    </div>
                ` : ''}
                
                <!-- Botões de Ação -->
                <div class="flex flex-wrap gap-2 mt-4">
                    <button 
                        class="view-record-btn bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        data-record-id="${record.id}">
                        👁️ Ver Detalhes
                    </button>
                    
                    <button 
                        class="download-record-btn bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                        data-record-id="${record.id}">
                        📄 Download PDF
                    </button>
                    
                    ${hasPrescription ? `
                        <button 
                            class="download-prescription-btn bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                            data-record-id="${record.id}">
                            💊 Download Prescrição
                        </button>
                    ` : ''}
                    
                    ${record.is_signed ? `
                        <button 
                            class="verify-signature-btn bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                            data-record-id="${record.id}"
                            onclick="verifyDigitalSignature('${record.id}')">
                            🔐 Verificar Assinatura
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * MOSTRAR LOADING DO HISTÓRICO
 * Controla o estado de carregamento
 * @param {boolean} show - Se deve mostrar o loading
 */
function showHistoryLoading(show) {
    const loading = document.getElementById('historyLoading');
    const list = document.getElementById('medicalRecordsList');
    
    if (loading) {
        if (show) {
            loading.classList.remove('hidden');
            if (list) list.innerHTML = '';
        } else {
            loading.classList.add('hidden');
        }
    }
    
    MedicalHistory.isLoading = show;
}

/**
 * MOSTRAR ESTADO VAZIO
 * Exibe mensagem quando não há prontuários
 */
function showEmptyHistory() {
    const emptyState = document.getElementById('emptyHistory');
    const list = document.getElementById('medicalRecordsList');
    
    if (emptyState) emptyState.classList.remove('hidden');
    if (list) list.innerHTML = '';
    
    showHistoryLoading(false);
}

/**
 * VISUALIZAR DETALHES DO PRONTUÁRIO
 * Exibe modal com detalhes completos do prontuário
 * @param {string} recordId - ID do prontuário
 */
async function viewMedicalRecordDetails(recordId) {
    try {
        // Buscar dados completos do prontuário
        const record = MedicalHistory.medicalRecords.find(r => r.id === recordId);
        
        if (!record) {
            showNotification('Erro', 'Prontuário não encontrado', 'error');
            return;
        }
        
        // Criar modal de detalhes
        const modal = createRecordDetailsModal(record);
        document.body.appendChild(modal);
        modal.classList.remove('hidden');
        
    } catch (error) {
        console.error('❌ Erro ao visualizar prontuário:', error);
        showNotification('Erro', 'Erro ao carregar detalhes do prontuário', 'error');
    }
}

/**
 * CRIAR MODAL DE DETALHES DO PRONTUÁRIO
 * Cria modal com informações completas do prontuário
 * @param {Object} record - Dados do prontuário
 * @returns {HTMLElement} Elemento do modal
 */
function createRecordDetailsModal(record) {
    const modal = document.createElement('div');
    modal.id = 'recordDetailsModal';
    modal.className = 'modal-overlay';
    
    const appointment = record.appointments;
    const specialty = appointment.specialties;
    const doctor = appointment.doctors;
    
    modal.innerHTML = `
        <div class="modal-content max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">📋 Detalhes do Prontuário</h3>
                <button onclick="closeModal('recordDetailsModal')" class="modal-close">&times;</button>
            </div>
            
            <div class="modal-body">
                <!-- Informações da Consulta -->
                <div class="bg-blue-50 p-4 rounded-lg mb-6">
                    <h4 class="font-bold text-blue-900 mb-3">Informações da Consulta</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <strong>Especialidade:</strong> ${specialty?.name || 'N/A'}
                        </div>
                        <div>
                            <strong>Médico:</strong> Dr. ${doctor?.name || 'N/A'}
                        </div>
                        <div>
                            <strong>CRM:</strong> ${doctor?.crm || 'N/A'}
                        </div>
                        <div>
                            <strong>Data:</strong> ${formatDate(record.created_at)}
                        </div>
                    </div>
                </div>
                
                <!-- Diagnóstico -->
                <div class="mb-6">
                    <h4 class="font-bold text-gray-900 mb-2">Diagnóstico</h4>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-gray-700 whitespace-pre-wrap">${record.diagnosis || 'Não informado'}</p>
                    </div>
                </div>
                
                <!-- Prescrições -->
                ${record.prescription ? `
                    <div class="mb-6">
                        <h4 class="font-bold text-gray-900 mb-2">Prescrições Médicas</h4>
                        <div class="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                            <p class="text-gray-700 whitespace-pre-wrap">${record.prescription}</p>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Recomendações -->
                ${record.recommendations ? `
                    <div class="mb-6">
                        <h4 class="font-bold text-gray-900 mb-2">Recomendações</h4>
                        <div class="bg-green-50 p-4 rounded-lg">
                            <p class="text-gray-700 whitespace-pre-wrap">${record.recommendations}</p>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Observações Adicionais -->
                ${record.additional_notes ? `
                    <div class="mb-6">
                        <h4 class="font-bold text-gray-900 mb-2">Observações Adicionais</h4>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-gray-700 whitespace-pre-wrap">${record.additional_notes}</p>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Status da Assinatura -->
                <div class="mb-6">
                    <h4 class="font-bold text-gray-900 mb-2">Status da Assinatura Digital</h4>
                    <div class="bg-${record.is_signed ? 'green' : 'yellow'}-50 p-4 rounded-lg border-l-4 border-${record.is_signed ? 'green' : 'yellow'}-400">
                        ${record.is_signed ? `
                            <div class="flex items-center space-x-2 text-green-800">
                                <span>✅</span>
                                <span class="font-medium">Prontuário assinado digitalmente</span>
                            </div>
                            <div class="text-sm text-green-700 mt-1">
                                Assinado em: ${formatDate(record.created_at)}
                            </div>
                        ` : `
                            <div class="flex items-center space-x-2 text-yellow-800">
                                <span>⏳</span>
                                <span class="font-medium">Prontuário não foi assinado digitalmente</span>
                            </div>
                        `}
                    </div>
                </div>
                
                <!-- Botões de Ação -->
                <div class="flex flex-wrap gap-3 mt-6">
                    <button 
                        class="download-record-btn bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                        data-record-id="${record.id}">
                        📄 Download PDF Completo
                    </button>
                    
                    ${record.prescription ? `
                        <button 
                            class="download-prescription-btn bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-medium"
                            data-record-id="${record.id}">
                            💊 Download Prescrição
                        </button>
                    ` : ''}
                    
                    ${record.is_signed ? `
                        <button 
                            class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium"
                            onclick="verifyDigitalSignature('${record.id}')">
                            🔐 Verificar Assinatura
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Debounce para busca
const debounceSearch = debounce(function(query) {
    filterMedicalRecords(query);
}, 300);

/**
 * FILTRAR PRONTUÁRIOS MÉDICOS
 * Filtra prontuários baseado no termo de busca
 * @param {string} query - Termo de busca
 */
function filterMedicalRecords(query) {
    if (!query || query.trim().length === 0) {
        renderMedicalRecords(MedicalHistory.medicalRecords);
        return;
    }
    
    const filteredRecords = MedicalHistory.medicalRecords.filter(record => {
        const searchText = query.toLowerCase();
        const appointment = record.appointments;
        const specialty = appointment.specialties;
        const doctor = appointment.doctors;
        
        return (
            record.diagnosis?.toLowerCase().includes(searchText) ||
            record.prescription?.toLowerCase().includes(searchText) ||
            record.recommendations?.toLowerCase().includes(searchText) ||
            specialty?.name?.toLowerCase().includes(searchText) ||
            doctor?.name?.toLowerCase().includes(searchText)
        );
    });
    
    renderMedicalRecords(filteredRecords);
}

/**
 * FILTRAR PRONTUÁRIOS POR DATA
 * Filtra prontuários baseado no intervalo de datas
 */
function filterMedicalRecordsByDate() {
    const startDate = document.getElementById('dateFilterStart')?.value;
    const endDate = document.getElementById('dateFilterEnd')?.value;
    
    if (!startDate && !endDate) {
        renderMedicalRecords(MedicalHistory.medicalRecords);
        return;
    }
    
    const filteredRecords = MedicalHistory.medicalRecords.filter(record => {
        const recordDate = new Date(record.created_at).toISOString().split('T')[0];
        
        if (startDate && endDate) {
            return recordDate >= startDate && recordDate <= endDate;
        } else if (startDate) {
            return recordDate >= startDate;
        } else if (endDate) {
            return recordDate <= endDate;
        }
        
        return true;
    });
    
    renderMedicalRecords(filteredRecords);
}

// Exportar funções globais
window.showMedicalHistoryInterface = showMedicalHistoryInterface;
window.initializeMedicalHistory = initializeMedicalHistory;
window.viewMedicalRecordDetails = viewMedicalRecordDetails;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    initializeMedicalHistory();
});

console.log('✅ Sistema de Histórico Médico carregado');
/**

 * DOWNLOAD PDF DO PRONTUÁRIO
 * Gera e baixa PDF completo do prontuário médico
 * @param {string} recordId - ID do prontuário
 */
async function downloadMedicalRecordPDF(recordId) {
    try {
        // Buscar dados do prontuário
        const record = MedicalHistory.medicalRecords.find(r => r.id === recordId);
        
        if (!record) {
            showNotification('Erro', 'Prontuário não encontrado', 'error');
            return;
        }
        
        // Verificar se jsPDF está disponível
        if (!window.jsPDF) {
            await loadJsPDFLibrary();
        }
        
        if (!window.jsPDF) {
            showNotification('Erro', 'Biblioteca PDF não disponível', 'error');
            return;
        }
        
        // Registrar auditoria antes do download
        await logDownloadAudit(recordId, 'medical_record_pdf', 'PDF Completo do Prontuário');
        
        // Gerar PDF
        const { jsPDF } = window;
        const doc = new jsPDF();
        
        // Configurar fonte
        doc.setFont('helvetica');
        
        // Cabeçalho
        generatePDFHeader(doc, 'PRONTUÁRIO MÉDICO');
        
        // Informações da consulta
        let yPosition = 60;
        yPosition = addConsultationInfoToPDF(doc, record, yPosition);
        
        // Conteúdo do prontuário
        yPosition = addMedicalRecordContentToPDF(doc, record, yPosition);
        
        // Assinatura digital (se houver)
        if (record.is_signed && record.digital_signature) {
            yPosition = addDigitalSignatureToPDF(doc, record, yPosition);
        }
        
        // Rodapé
        addPDFFooter(doc);
        
        // Salvar PDF
        const appointment = record.appointments;
        const patientName = TeleMed.currentUser?.name || 'Paciente';
        const fileName = `prontuario_${sanitizeFileName(patientName)}_${formatDateForFile(new Date(record.created_at))}.pdf`;
        
        doc.save(fileName);
        
        showNotification('Sucesso', 'PDF do prontuário baixado com sucesso', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao baixar PDF do prontuário:', error);
        showNotification('Erro', 'Erro ao gerar PDF do prontuário', 'error');
    }
}

/**
 * DOWNLOAD PDF DA PRESCRIÇÃO
 * Gera e baixa PDF apenas com as prescrições médicas
 * @param {string} recordId - ID do prontuário
 */
async function downloadPrescriptionPDF(recordId) {
    try {
        // Buscar dados do prontuário
        const record = MedicalHistory.medicalRecords.find(r => r.id === recordId);
        
        if (!record) {
            showNotification('Erro', 'Prontuário não encontrado', 'error');
            return;
        }
        
        if (!record.prescription || record.prescription.trim().length === 0) {
            showNotification('Erro', 'Este prontuário não possui prescrições', 'error');
            return;
        }
        
        // Verificar se jsPDF está disponível
        if (!window.jsPDF) {
            await loadJsPDFLibrary();
        }
        
        if (!window.jsPDF) {
            showNotification('Erro', 'Biblioteca PDF não disponível', 'error');
            return;
        }
        
        // Registrar auditoria antes do download
        await logDownloadAudit(recordId, 'prescription_pdf', 'PDF da Prescrição Médica');
        
        // Gerar PDF
        const { jsPDF } = window;
        const doc = new jsPDF();
        
        // Configurar fonte
        doc.setFont('helvetica');
        
        // Cabeçalho específico para prescrição
        generatePDFHeader(doc, 'PRESCRIÇÃO MÉDICA');
        
        // Informações da consulta
        let yPosition = 60;
        yPosition = addConsultationInfoToPDF(doc, record, yPosition);
        
        // Conteúdo da prescrição
        yPosition = addPrescriptionContentToPDF(doc, record, yPosition);
        
        // Assinatura digital obrigatória para prescrições
        if (record.is_signed && record.digital_signature) {
            yPosition = addDigitalSignatureToPDF(doc, record, yPosition);
        } else {
            // Adicionar aviso de prescrição não assinada
            doc.setFontSize(10);
            doc.setTextColor(255, 0, 0);
            doc.text('ATENÇÃO: Esta prescrição não foi assinada digitalmente', 20, yPosition);
            yPosition += 10;
        }
        
        // Rodapé específico para prescrição
        addPrescriptionFooter(doc);
        
        // Salvar PDF
        const patientName = TeleMed.currentUser?.name || 'Paciente';
        const fileName = `prescricao_${sanitizeFileName(patientName)}_${formatDateForFile(new Date(record.created_at))}.pdf`;
        
        doc.save(fileName);
        
        showNotification('Sucesso', 'PDF da prescrição baixado com sucesso', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao baixar PDF da prescrição:', error);
        showNotification('Erro', 'Erro ao gerar PDF da prescrição', 'error');
    }
}

/**
 * CARREGAR BIBLIOTECA JSPDF
 * Carrega dinamicamente a biblioteca jsPDF se não estiver disponível
 */
function loadJsPDFLibrary() {
    return new Promise((resolve, reject) => {
        if (window.jsPDF) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = function() {
            console.log('✅ jsPDF carregado dinamicamente');
            resolve();
        };
        script.onerror = function() {
            console.error('❌ Erro ao carregar jsPDF');
            reject(new Error('Falha ao carregar biblioteca PDF'));
        };
        document.head.appendChild(script);
    });
}

/**
 * GERAR CABEÇALHO DO PDF
 * Adiciona cabeçalho padrão ao PDF
 * @param {Object} doc - Documento jsPDF
 * @param {string} title - Título do documento
 */
function generatePDFHeader(doc, title) {
    // Logo/Nome da clínica
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text('TeleMed - Telemedicina', 20, 20);
    
    // Título do documento
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 20, 35);
    
    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);
}

/**
 * ADICIONAR INFORMAÇÕES DA CONSULTA AO PDF
 * Adiciona dados básicos da consulta ao PDF
 * @param {Object} doc - Documento jsPDF
 * @param {Object} record - Dados do prontuário
 * @param {number} yPosition - Posição Y atual
 * @returns {number} Nova posição Y
 */
function addConsultationInfoToPDF(doc, record, yPosition) {
    const appointment = record.appointments;
    const specialty = appointment.specialties;
    const doctor = appointment.doctors;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Informações do paciente
    doc.text('DADOS DO PACIENTE:', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.text(`Nome: ${TeleMed.currentUser?.name || 'N/A'}`, 25, yPosition);
    yPosition += 6;
    doc.text(`Email: ${TeleMed.currentUser?.email || 'N/A'}`, 25, yPosition);
    yPosition += 6;
    doc.text(`Data da Consulta: ${formatDate(record.created_at)}`, 25, yPosition);
    yPosition += 6;
    doc.text(`Especialidade: ${specialty?.name || 'N/A'}`, 25, yPosition);
    yPosition += 6;
    doc.text(`Médico: Dr. ${doctor?.name || 'N/A'} - CRM: ${doctor?.crm || 'N/A'}`, 25, yPosition);
    yPosition += 15;
    
    return yPosition;
}

/**
 * ADICIONAR CONTEÚDO DO PRONTUÁRIO AO PDF
 * Adiciona o conteúdo médico completo ao PDF
 * @param {Object} doc - Documento jsPDF
 * @param {Object} record - Dados do prontuário
 * @param {number} yPosition - Posição Y atual
 * @returns {number} Nova posição Y
 */
function addMedicalRecordContentToPDF(doc, record, yPosition) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Diagnóstico
    if (record.diagnosis) {
        doc.text('DIAGNÓSTICO:', 20, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        const diagnosisLines = doc.splitTextToSize(record.diagnosis, 170);
        doc.text(diagnosisLines, 25, yPosition);
        yPosition += diagnosisLines.length * 5 + 10;
    }
    
    // Prescrições
    if (record.prescription) {
        doc.setFontSize(12);
        doc.text('PRESCRIÇÕES MÉDICAS:', 20, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        const prescriptionLines = doc.splitTextToSize(record.prescription, 170);
        doc.text(prescriptionLines, 25, yPosition);
        yPosition += prescriptionLines.length * 5 + 10;
    }
    
    // Recomendações
    if (record.recommendations) {
        doc.setFontSize(12);
        doc.text('RECOMENDAÇÕES:', 20, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        const recommendationsLines = doc.splitTextToSize(record.recommendations, 170);
        doc.text(recommendationsLines, 25, yPosition);
        yPosition += recommendationsLines.length * 5 + 10;
    }
    
    // Observações adicionais
    if (record.additional_notes) {
        doc.setFontSize(12);
        doc.text('OBSERVAÇÕES ADICIONAIS:', 20, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        const notesLines = doc.splitTextToSize(record.additional_notes, 170);
        doc.text(notesLines, 25, yPosition);
        yPosition += notesLines.length * 5 + 10;
    }
    
    return yPosition;
}

/**
 * ADICIONAR CONTEÚDO DA PRESCRIÇÃO AO PDF
 * Adiciona apenas o conteúdo da prescrição ao PDF
 * @param {Object} doc - Documento jsPDF
 * @param {Object} record - Dados do prontuário
 * @param {number} yPosition - Posição Y atual
 * @returns {number} Nova posição Y
 */
function addPrescriptionContentToPDF(doc, record, yPosition) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Prescrições
    if (record.prescription) {
        doc.text('PRESCRIÇÕES MÉDICAS:', 20, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        const prescriptionLines = doc.splitTextToSize(record.prescription, 170);
        doc.text(prescriptionLines, 25, yPosition);
        yPosition += prescriptionLines.length * 5 + 15;
    }
    
    // Adicionar aviso sobre validade da prescrição
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Esta prescrição é válida por 30 dias a partir da data de emissão.', 20, yPosition);
    yPosition += 10;
    
    return yPosition;
}

/**
 * ADICIONAR ASSINATURA DIGITAL AO PDF
 * Adiciona informações da assinatura digital ao PDF
 * @param {Object} doc - Documento jsPDF
 * @param {Object} record - Dados do prontuário
 * @param {number} yPosition - Posição Y atual
 * @returns {number} Nova posição Y
 */
function addDigitalSignatureToPDF(doc, record, yPosition) {
    try {
        // Verificar se há espaço suficiente na página
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('ASSINATURA DIGITAL:', 20, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.text('✅ Este documento foi assinado digitalmente', 25, yPosition);
        yPosition += 6;
        
        // Tentar parsear a assinatura digital
        let signatureData = null;
        try {
            signatureData = JSON.parse(record.digital_signature);
        } catch (e) {
            console.warn('Erro ao parsear assinatura digital:', e);
        }
        
        if (signatureData) {
            doc.text(`Médico: ${signatureData.doctor || 'N/A'}`, 25, yPosition);
            yPosition += 6;
            doc.text(`Data/Hora: ${signatureData.timestamp ? new Date(signatureData.timestamp).toLocaleString('pt-BR') : 'N/A'}`, 25, yPosition);
            yPosition += 6;
            doc.text(`Hash do Documento: ${signatureData.documentHash || 'N/A'}`, 25, yPosition);
            yPosition += 6;
        } else {
            doc.text(`Data da Assinatura: ${formatDate(record.created_at)}`, 25, yPosition);
            yPosition += 6;
        }
        
        yPosition += 10;
        
    } catch (error) {
        console.error('Erro ao adicionar assinatura digital ao PDF:', error);
    }
    
    return yPosition;
}

/**
 * ADICIONAR RODAPÉ DO PDF
 * Adiciona rodapé padrão ao PDF
 * @param {Object} doc - Documento jsPDF
 */
function addPDFFooter(doc) {
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('TeleMed - Telemedicina | www.telemed.com | Documento gerado em ' + new Date().toLocaleString('pt-BR'), 20, pageHeight - 10);
}

/**
 * ADICIONAR RODAPÉ DA PRESCRIÇÃO
 * Adiciona rodapé específico para prescrições
 * @param {Object} doc - Documento jsPDF
 */
function addPrescriptionFooter(doc) {
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('TeleMed - Prescrição Médica Digital | Válida por 30 dias | Gerado em ' + new Date().toLocaleString('pt-BR'), 20, pageHeight - 10);
}

/**
 * REGISTRAR AUDITORIA DE DOWNLOAD
 * Registra o download de documentos para auditoria
 * @param {string} recordId - ID do prontuário
 * @param {string} documentType - Tipo do documento baixado
 * @param {string} description - Descrição do download
 */
async function logDownloadAudit(recordId, documentType, description) {
    try {
        const auditData = {
            user_id: MedicalHistory.currentPatientId,
            medical_record_id: recordId,
            document_type: documentType,
            description: description,
            ip_address: await getUserIP(),
            user_agent: navigator.userAgent,
            downloaded_at: new Date().toISOString()
        };
        
        // Salvar no banco de dados (simulado - em produção usar tabela de auditoria)
        console.log('📊 Registro de auditoria:', auditData);
        
        // Adicionar ao log local
        MedicalHistory.downloadAuditLog.push(auditData);
        
        // Em produção, salvar no Supabase:
        // const { data, error } = await supabase
        //     .from('download_audit_log')
        //     .insert([auditData]);
        
    } catch (error) {
        console.error('❌ Erro ao registrar auditoria:', error);
    }
}

/**
 * OBTER IP DO USUÁRIO
 * Obtém o IP do usuário para auditoria (simulado)
 * @returns {string} IP do usuário
 */
async function getUserIP() {
    try {
        // Em produção, usar serviço real de IP
        return '192.168.1.1'; // IP simulado
    } catch (error) {
        return 'N/A';
    }
}

/**
 * VERIFICAR ASSINATURA DIGITAL
 * Verifica a validade da assinatura digital do prontuário
 * @param {string} recordId - ID do prontuário
 */
async function verifyDigitalSignature(recordId) {
    try {
        const record = MedicalHistory.medicalRecords.find(r => r.id === recordId);
        
        if (!record) {
            showNotification('Erro', 'Prontuário não encontrado', 'error');
            return;
        }
        
        if (!record.is_signed || !record.digital_signature) {
            showNotification('Erro', 'Este prontuário não possui assinatura digital', 'error');
            return;
        }
        
        // Criar modal de verificação
        const modal = createSignatureVerificationModal(record);
        document.body.appendChild(modal);
        modal.classList.remove('hidden');
        
    } catch (error) {
        console.error('❌ Erro ao verificar assinatura:', error);
        showNotification('Erro', 'Erro ao verificar assinatura digital', 'error');
    }
}

/**
 * CRIAR MODAL DE VERIFICAÇÃO DE ASSINATURA
 * Cria modal para exibir detalhes da verificação de assinatura
 * @param {Object} record - Dados do prontuário
 * @returns {HTMLElement} Elemento do modal
 */
function createSignatureVerificationModal(record) {
    const modal = document.createElement('div');
    modal.id = 'signatureVerificationModal';
    modal.className = 'modal-overlay';
    
    let signatureData = null;
    let isValidSignature = false;
    
    try {
        signatureData = JSON.parse(record.digital_signature);
        isValidSignature = validateSignature(signatureData, record);
    } catch (e) {
        console.warn('Erro ao parsear assinatura digital:', e);
    }
    
    modal.innerHTML = `
        <div class="modal-content max-w-2xl">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">🔐 Verificação de Assinatura Digital</h3>
                <button onclick="closeModal('signatureVerificationModal')" class="modal-close">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-4">${isValidSignature ? '✅' : '❌'}</div>
                    <h4 class="text-xl font-bold ${isValidSignature ? 'text-green-600' : 'text-red-600'} mb-2">
                        ${isValidSignature ? 'Assinatura Válida' : 'Assinatura Inválida'}
                    </h4>
                    <p class="text-gray-600">
                        ${isValidSignature ? 
                            'A assinatura digital foi verificada e é válida.' : 
                            'Não foi possível verificar a validade da assinatura digital.'
                        }
                    </p>
                </div>
                
                <!-- Detalhes da Assinatura -->
                <div class="bg-gray-50 p-6 rounded-lg mb-6">
                    <h5 class="font-bold text-gray-900 mb-3">Detalhes da Assinatura</h5>
                    <div class="space-y-2 text-sm">
                        ${signatureData ? `
                            <div><strong>Médico:</strong> ${signatureData.doctor || 'N/A'}</div>
                            <div><strong>Data/Hora:</strong> ${signatureData.timestamp ? new Date(signatureData.timestamp).toLocaleString('pt-BR') : 'N/A'}</div>
                            <div><strong>Hash do Documento:</strong> <span class="font-mono text-xs">${signatureData.documentHash || 'N/A'}</span></div>
                            <div><strong>Hash da Assinatura:</strong> <span class="font-mono text-xs">${signatureData.signatureHash || 'N/A'}</span></div>
                        ` : `
                            <div class="text-red-600">Dados da assinatura não puderam ser decodificados</div>
                        `}
                    </div>
                </div>
                
                <!-- Status de Verificação -->
                <div class="bg-${isValidSignature ? 'green' : 'red'}-50 p-4 rounded-lg border-l-4 border-${isValidSignature ? 'green' : 'red'}-400">
                    <div class="flex items-center space-x-2 text-${isValidSignature ? 'green' : 'red'}-800">
                        <span>${isValidSignature ? '✅' : '❌'}</span>
                        <span class="font-medium">
                            ${isValidSignature ? 
                                'Documento íntegro e assinatura autêntica' : 
                                'Não foi possível validar a integridade do documento'
                            }
                        </span>
                    </div>
                    <div class="text-sm text-${isValidSignature ? 'green' : 'red'}-700 mt-1">
                        Verificado em: ${new Date().toLocaleString('pt-BR')}
                    </div>
                </div>
                
                <!-- Botão Fechar -->
                <div class="text-center mt-6">
                    <button 
                        onclick="closeModal('signatureVerificationModal')" 
                        class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

/**
 * VALIDAR ASSINATURA
 * Valida a assinatura digital do documento
 * @param {Object} signatureData - Dados da assinatura
 * @param {Object} record - Dados do prontuário
 * @returns {boolean} Se a assinatura é válida
 */
function validateSignature(signatureData, record) {
    try {
        if (!signatureData || !signatureData.signatureHash) {
            return false;
        }
        
        // Em produção, implementar validação criptográfica real
        // Por enquanto, simular validação básica
        const expectedHash = btoa(signatureData.doctor + signatureData.timestamp + signatureData.documentHash);
        
        return signatureData.signatureHash === expectedHash;
        
    } catch (error) {
        console.error('Erro na validação da assinatura:', error);
        return false;
    }
}

/**
 * SANITIZAR NOME DE ARQUIVO
 * Remove caracteres inválidos do nome do arquivo
 * @param {string} fileName - Nome original do arquivo
 * @returns {string} Nome sanitizado
 */
function sanitizeFileName(fileName) {
    return fileName
        .replace(/[^a-zA-Z0-9\-_]/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
}

/**
 * FORMATAR DATA PARA ARQUIVO
 * Formata data para uso em nomes de arquivo
 * @param {Date} date - Data a ser formatada
 * @returns {string} Data formatada (YYYYMMDD)
 */
function formatDateForFile(date) {
    return date.toISOString().split('T')[0].replace(/-/g, '');
}

// Exportar funções adicionais
window.downloadMedicalRecordPDF = downloadMedicalRecordPDF;
window.downloadPrescriptionPDF = downloadPrescriptionPDF;
window.verifyDigitalSignature = verifyDigitalSignature;