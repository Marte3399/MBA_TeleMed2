// TeleMed - Sistema de Prontuários Digitais

/**
 * SISTEMA DE PRONTUÁRIOS DIGITAIS
 * Gerencia criação, assinatura e geração de PDFs de prontuários médicos
 */

// Estado global do sistema de prontuários
window.MedicalRecords = {
    currentRecord: null,
    digitalSignature: null,
    isSigningMode: false,
    pdfGenerator: null
};

/**
 * INICIALIZAR SISTEMA DE PRONTUÁRIOS
 * Configura o sistema de prontuários digitais
 */
function initializeMedicalRecords() {
    console.log('📋 Inicializando sistema de prontuários digitais...');
    
    // Inicializar gerador de PDF
    initializePDFGenerator();
    
    // Configurar event listeners
    setupMedicalRecordsEventListeners();
    
    console.log('✅ Sistema de prontuários digitais inicializado');
}

/**
 * CONFIGURAR EVENT LISTENERS
 * Configura todos os ouvintes de eventos do sistema de prontuários
 */
function setupMedicalRecordsEventListeners() {
    // Event listener para formulário de prontuário
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'medicalRecordForm') {
            e.preventDefault();
            handleMedicalRecordSubmit(e.target);
        }
    });
    
    // Event listener para assinatura digital
    document.addEventListener('click', function(e) {
        if (e.target.id === 'signRecordBtn') {
            e.preventDefault();
            showDigitalSignatureModal();
        }
        
        if (e.target.id === 'generatePdfBtn') {
            e.preventDefault();
            generateMedicalRecordPDF();
        }
        
        if (e.target.id === 'generatePrescriptionPdfBtn') {
            e.preventDefault();
            generatePrescriptionPDF();
        }
    });
}

/**
 * MOSTRAR INTERFACE DE PRONTUÁRIO
 * Exibe a interface para criação de prontuário médico
 * @param {string} appointmentId - ID da consulta
 */
function showMedicalRecordInterface(appointmentId) {
    console.log('📋 Abrindo interface de prontuário para consulta:', appointmentId);
    
    // Buscar dados da consulta
    loadAppointmentData(appointmentId).then(appointment => {
        if (!appointment) {
            showNotification('Erro', 'Consulta não encontrada', 'error');
            return;
        }
        
        // Criar modal de prontuário
        const modal = createMedicalRecordModal(appointment);
        document.body.appendChild(modal);
        modal.classList.remove('hidden');
        
        // Focar no primeiro campo
        setTimeout(() => {
            const firstInput = modal.querySelector('textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    });
}

/**
 * CRIAR MODAL DE PRONTUÁRIO
 * Cria a interface modal para criação do prontuário médico
 * @param {Object} appointment - Dados da consulta
 * @returns {HTMLElement} Elemento do modal
 */
function createMedicalRecordModal(appointment) {
    const modal = document.createElement('div');
    modal.id = 'medicalRecordModal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">📋 Prontuário Médico</h3>
                <button onclick="closeModal('medicalRecordModal')" class="modal-close">&times;</button>
            </div>
            
            <div class="modal-body">
                <!-- Informações da Consulta -->
                <div class="bg-blue-50 p-4 rounded-lg mb-6">
                    <h4 class="font-bold text-blue-900 mb-2">Informações da Consulta</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <strong>Paciente:</strong> ${appointment.patient_name || 'N/A'}
                        </div>
                        <div>
                            <strong>Especialidade:</strong> ${appointment.specialty_name || 'N/A'}
                        </div>
                        <div>
                            <strong>Data:</strong> ${formatDate(appointment.created_at)}
                        </div>
                    </div>
                </div>
                
                <!-- Formulário do Prontuário -->
                <form id="medicalRecordForm" data-appointment-id="${appointment.id}">
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
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                rows="6"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Liste medicamentos, dosagens e instruções de uso..."
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
                                rows="4"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Orientações gerais, cuidados, retorno, exames complementares..."
                            ></textarea>
                        </div>
                        
                        <!-- Observações Adicionais -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Observações Adicionais
                            </label>
                            <textarea 
                                id="additional_notes" 
                                name="additional_notes" 
                                rows="3"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Observações complementares, histórico relevante..."
                            ></textarea>
                        </div>
                    </div>
                    
                    <!-- Botões de Ação -->
                    <div class="flex flex-col sm:flex-row gap-3 mt-8">
                        <button 
                            type="submit" 
                            class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-semibold">
                            💾 Salvar Prontuário
                        </button>
                        
                        <button 
                            type="button" 
                            id="signRecordBtn"
                            class="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-semibold">
                            ✍️ Assinar Digitalmente
                        </button>
                        
                        <button 
                            type="button" 
                            id="generatePdfBtn"
                            class="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition font-semibold">
                            📄 Gerar PDF
                        </button>
                    </div>
                    
                    <!-- Botão para PDF de Prescrição -->
                    <div class="mt-4">
                        <button 
                            type="button" 
                            id="generatePrescriptionPdfBtn"
                            class="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition font-semibold">
                            💊 Gerar PDF da Prescrição
                        </button>
                    </div>
                </form>
                
                <!-- Status da Assinatura -->
                <div id="signatureStatus" class="mt-6 p-4 bg-gray-50 rounded-lg hidden">
                    <div class="flex items-center space-x-2">
                        <span class="text-green-600">✅</span>
                        <span class="font-medium">Prontuário assinado digitalmente</span>
                    </div>
                    <div class="text-sm text-gray-600 mt-1">
                        Assinado em: <span id="signatureDate"></span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

/**
 * MANIPULAR ENVIO DO PRONTUÁRIO
 * Processa o envio do formulário de prontuário médico
 * @param {HTMLFormElement} form - Formulário do prontuário
 */
async function handleMedicalRecordSubmit(form) {
    try {
        const formData = new FormData(form);
        const appointmentId = form.dataset.appointmentId;
        
        // Extrair dados do formulário
        const recordData = {
            appointment_id: appointmentId,
            diagnosis: formData.get('diagnosis'),
            prescription: formData.get('prescription'),
            recommendations: formData.get('recommendations'),
            additional_notes: formData.get('additional_notes'),
            is_signed: false
        };
        
        // Validar campos obrigatórios
        if (!recordData.diagnosis.trim()) {
            showNotification('Erro', 'O diagnóstico é obrigatório', 'error');
            return;
        }
        
        // Salvar no banco de dados
        const savedRecord = await saveMedicalRecord(recordData);
        
        if (savedRecord) {
            MedicalRecords.currentRecord = savedRecord;
            showNotification('Sucesso', 'Prontuário salvo com sucesso', 'success');
            
            // Habilitar botões de assinatura e PDF
            enableRecordActions();
        }
        
    } catch (error) {
        console.error('Erro ao salvar prontuário:', error);
        showNotification('Erro', 'Erro ao salvar prontuário', 'error');
    }
}

/**
 * SALVAR PRONTUÁRIO MÉDICO
 * Salva o prontuário no banco de dados
 * @param {Object} recordData - Dados do prontuário
 * @returns {Object|null} Prontuário salvo ou null em caso de erro
 */
async function saveMedicalRecord(recordData) {
    try {
        // Buscar dados da consulta para obter patient_id e doctor_id
        const { data: appointment, error: appointmentError } = await supabase
            .from('appointments')
            .select('patient_id, doctor_id')
            .eq('id', recordData.appointment_id)
            .single();
            
        if (appointmentError) {
            console.error('Erro ao buscar consulta:', appointmentError);
            return null;
        }
        
        // Adicionar IDs do paciente e médico
        recordData.patient_id = appointment.patient_id;
        recordData.doctor_id = appointment.doctor_id;
        
        // Inserir prontuário no banco
        const { data, error } = await supabase
            .from('medical_records')
            .insert([recordData])
            .select()
            .single();
            
        if (error) {
            console.error('Erro ao salvar prontuário:', error);
            return null;
        }
        
        console.log('✅ Prontuário salvo:', data);
        return data;
        
    } catch (error) {
        console.error('Erro na operação de salvamento:', error);
        return null;
    }
}

/**
 * HABILITAR AÇÕES DO PRONTUÁRIO
 * Habilita botões de assinatura e geração de PDF após salvar
 */
function enableRecordActions() {
    const signBtn = document.getElementById('signRecordBtn');
    const pdfBtn = document.getElementById('generatePdfBtn');
    const prescriptionBtn = document.getElementById('generatePrescriptionPdfBtn');
    
    if (signBtn) {
        signBtn.disabled = false;
        signBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    
    if (pdfBtn) {
        pdfBtn.disabled = false;
        pdfBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    
    if (prescriptionBtn) {
        prescriptionBtn.disabled = false;
        prescriptionBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

/**
 * MOSTRAR MODAL DE ASSINATURA DIGITAL
 * Exibe interface para assinatura digital do prontuário
 */
function showDigitalSignatureModal() {
    if (!MedicalRecords.currentRecord) {
        showNotification('Erro', 'Salve o prontuário antes de assinar', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'digitalSignatureModal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content max-w-2xl">
            <div class="modal-header">
                <h3 class="text-2xl font-bold text-gray-900">✍️ Assinatura Digital</h3>
                <button onclick="closeModal('digitalSignatureModal')" class="modal-close">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-4">🔐</div>
                    <h4 class="text-xl font-bold text-gray-900 mb-2">Confirmar Assinatura Digital</h4>
                    <p class="text-gray-600">
                        Ao assinar digitalmente, você confirma a veracidade das informações 
                        contidas no prontuário médico.
                    </p>
                </div>
                
                <!-- Área de Assinatura -->
                <div class="bg-gray-50 p-6 rounded-lg mb-6">
                    <h5 class="font-bold text-gray-900 mb-3">Dados da Assinatura</h5>
                    <div class="space-y-2 text-sm">
                        <div><strong>Médico:</strong> Dr. João Silva (CRM: 12345-SP)</div>
                        <div><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</div>
                        <div><strong>Documento:</strong> Prontuário Médico</div>
                        <div><strong>Hash:</strong> <span class="font-mono text-xs">${generateDocumentHash()}</span></div>
                    </div>
                </div>
                
                <!-- Confirmação -->
                <div class="space-y-4">
                    <label class="flex items-start space-x-3">
                        <input type="checkbox" id="confirmSignature" class="mt-1">
                        <span class="text-sm text-gray-700">
                            Confirmo que revisei todas as informações do prontuário e 
                            autorizo a assinatura digital deste documento médico.
                        </span>
                    </label>
                    
                    <label class="flex items-start space-x-3">
                        <input type="checkbox" id="confirmResponsibility" class="mt-1">
                        <span class="text-sm text-gray-700">
                            Assumo total responsabilidade pelo conteúdo médico 
                            descrito neste prontuário.
                        </span>
                    </label>
                </div>
                
                <!-- Botões -->
                <div class="flex space-x-4 mt-8">
                    <button 
                        onclick="processDigitalSignature()" 
                        class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold">
                        ✍️ Confirmar Assinatura
                    </button>
                    <button 
                        onclick="closeModal('digitalSignatureModal')" 
                        class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
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
 * PROCESSAR ASSINATURA DIGITAL
 * Processa e salva a assinatura digital do prontuário
 */
async function processDigitalSignature() {
    const confirmSignature = document.getElementById('confirmSignature');
    const confirmResponsibility = document.getElementById('confirmResponsibility');
    
    // Validar confirmações
    if (!confirmSignature.checked || !confirmResponsibility.checked) {
        showNotification('Erro', 'Confirme todas as opções para prosseguir', 'error');
        return;
    }
    
    try {
        // Gerar assinatura digital
        const digitalSignature = generateDigitalSignature();
        
        // Atualizar prontuário no banco
        const { data, error } = await supabase
            .from('medical_records')
            .update({
                digital_signature: digitalSignature,
                is_signed: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', MedicalRecords.currentRecord.id)
            .select()
            .single();
            
        if (error) {
            console.error('Erro ao salvar assinatura:', error);
            showNotification('Erro', 'Erro ao salvar assinatura digital', 'error');
            return;
        }
        
        // Atualizar estado local
        MedicalRecords.currentRecord = data;
        MedicalRecords.digitalSignature = digitalSignature;
        
        // Mostrar status de assinatura
        showSignatureStatus();
        
        // Fechar modal
        closeModal('digitalSignatureModal');
        
        showNotification('Sucesso', 'Prontuário assinado digitalmente', 'success');
        
    } catch (error) {
        console.error('Erro ao processar assinatura:', error);
        showNotification('Erro', 'Erro ao processar assinatura digital', 'error');
    }
}

/**
 * GERAR ASSINATURA DIGITAL
 * Cria uma assinatura digital para o prontuário
 * @returns {string} Assinatura digital
 */
function generateDigitalSignature() {
    const timestamp = new Date().toISOString();
    const doctorInfo = "Dr. João Silva - CRM: 12345-SP";
    const documentHash = generateDocumentHash();
    
    // Simular assinatura digital (em produção, usar certificado digital real)
    const signatureData = {
        doctor: doctorInfo,
        timestamp: timestamp,
        documentHash: documentHash,
        signatureHash: btoa(doctorInfo + timestamp + documentHash)
    };
    
    return JSON.stringify(signatureData);
}

/**
 * GERAR HASH DO DOCUMENTO
 * Cria um hash único para o documento
 * @returns {string} Hash do documento
 */
function generateDocumentHash() {
    const content = MedicalRecords.currentRecord ? 
        JSON.stringify(MedicalRecords.currentRecord) : 
        Date.now().toString();
    
    // Simular hash SHA-256 (em produção, usar biblioteca de criptografia real)
    return btoa(content).substring(0, 32);
}

/**
 * MOSTRAR STATUS DA ASSINATURA
 * Exibe o status de assinatura no modal
 */
function showSignatureStatus() {
    const statusDiv = document.getElementById('signatureStatus');
    const dateSpan = document.getElementById('signatureDate');
    
    if (statusDiv && dateSpan) {
        statusDiv.classList.remove('hidden');
        dateSpan.textContent = new Date().toLocaleString('pt-BR');
    }
}

/**
 * BUSCAR DADOS DA CONSULTA
 * Busca informações da consulta no banco de dados
 * @param {string} appointmentId - ID da consulta
 * @returns {Object|null} Dados da consulta
 */
async function loadAppointmentData(appointmentId) {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                id,
                patient_id,
                doctor_id,
                specialty_id,
                created_at,
                symptoms,
                notes
            `)
            .eq('id', appointmentId)
            .single();
            
        if (error) {
            console.error('Erro ao buscar consulta:', error);
            return null;
        }
        
        return data;
        
    } catch (error) {
        console.error('Erro na busca da consulta:', error);
        return null;
    }
}

// Exportar funções globais
window.showMedicalRecordInterface = showMedicalRecordInterface;
window.processDigitalSignature = processDigitalSignature;
window.initializeMedicalRecords = initializeMedicalRecords;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    initializeMedicalRecords();
});

console.log('✅ Sistema de Prontuários Digitais carregado');
/**
 * 
INICIALIZAR GERADOR DE PDF
 * Configura o sistema de geração de PDFs
 */
function initializePDFGenerator() {
    // Verificar se jsPDF está disponível
    if (typeof window.jsPDF === 'undefined') {
        console.warn('⚠️ jsPDF não encontrado. Carregando biblioteca...');
        loadJsPDFLibrary();
    } else {
        console.log('✅ jsPDF disponível');
        MedicalRecords.pdfGenerator = window.jsPDF;
    }
}

/**
 * CARREGAR BIBLIOTECA JSPDF
 * Carrega dinamicamente a biblioteca jsPDF
 */
function loadJsPDFLibrary() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = function() {
        console.log('✅ jsPDF carregado dinamicamente');
        MedicalRecords.pdfGenerator = window.jsPDF;
    };
    script.onerror = function() {
        console.error('❌ Erro ao carregar jsPDF');
    };
    document.head.appendChild(script);
}

/**
 * GERAR PDF DO PRONTUÁRIO
 * Gera PDF completo do atendimento médico
 */
async function generateMedicalRecordPDF() {
    if (!MedicalRecords.currentRecord) {
        showNotification('Erro', 'Nenhum prontuário para gerar PDF', 'error');
        return;
    }
    
    try {
        // Verificar se jsPDF está disponível
        if (!window.jsPDF) {
            showNotification('Erro', 'Biblioteca PDF não carregada', 'error');
            return;
        }
        
        // Buscar dados completos da consulta
        const appointmentData = await getCompleteAppointmentData(MedicalRecords.currentRecord.appointment_id);
        
        if (!appointmentData) {
            showNotification('Erro', 'Erro ao buscar dados da consulta', 'error');
            return;
        }
        
        // Criar documento PDF
        const { jsPDF } = window;
        const doc = new jsPDF();
        
        // Configurar fonte
        doc.setFont('helvetica');
        
        // Cabeçalho
        generatePDFHeader(doc, 'PRONTUÁRIO MÉDICO');
        
        // Informações da consulta
        let yPosition = 60;
        yPosition = addConsultationInfo(doc, appointmentData, yPosition);
        
        // Conteúdo do prontuário
        yPosition = addMedicalRecordContent(doc, MedicalRecords.currentRecord, yPosition);
        
        // Assinatura digital (se houver)
        if (MedicalRecords.currentRecord.is_signed) {
            yPosition = addDigitalSignature(doc, yPosition);
        }
        
        // Rodapé
        addPDFFooter(doc);
        
        // Salvar PDF
        const fileName = `prontuario_${appointmentData.patient_name}_${formatDateForFile(new Date())}.pdf`;
        doc.save(fileName);
        
        // Salvar URL do PDF no banco (simulado)
        await updateRecordPDFUrl(MedicalRecords.currentRecord.id, fileName);
        
        showNotification('Sucesso', 'PDF do prontuário gerado com sucesso', 'success');
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showNotification('Erro', 'Erro ao gerar PDF do prontuário', 'error');
    }
}

/**
 * GERAR PDF DA PRESCRIÇÃO
 * Gera PDF separado apenas com as prescrições médicas
 */
async function generatePrescriptionPDF() {
    if (!MedicalRecords.currentRecord || !MedicalRecords.currentRecord.prescription) {
        showNotification('Erro', 'Nenhuma prescrição para gerar PDF', 'error');
        return;
    }
    
    try {
        // Verificar se jsPDF está disponível
        if (!window.jsPDF) {
            showNotification('Erro', 'Biblioteca PDF não carregada', 'error');
            return;
        }
        
        // Buscar dados completos da consulta
        const appointmentData = await getCompleteAppointmentData(MedicalRecords.currentRecord.appointment_id);
        
        if (!appointmentData) {
            showNotification('Erro', 'Erro ao buscar dados da consulta', 'error');
            return;
        }
        
        // Criar documento PDF
        const { jsPDF } = window;
        const doc = new jsPDF();
        
        // Configurar fonte
        doc.setFont('helvetica');
        
        // Cabeçalho específico para prescrição
        generatePDFHeader(doc, 'PRESCRIÇÃO MÉDICA');
        
        // Informações da consulta
        let yPosition = 60;
        yPosition = addConsultationInfo(doc, appointmentData, yPosition);
        
        // Conteúdo da prescrição
        yPosition = addPrescriptionContent(doc, MedicalRecords.currentRecord, yPosition);
        
        // Assinatura digital obrigatória para prescrições
        if (MedicalRecords.currentRecord.is_signed) {
            yPosition = addDigitalSignature(doc, yPosition);
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
        const fileName = `prescricao_${appointmentData.patient_name}_${formatDateForFile(new Date())}.pdf`;
        doc.save(fileName);
        
        showNotification('Sucesso', 'PDF da prescrição gerado com sucesso', 'success');
        
    } catch (error) {
        console.error('Erro ao gerar PDF da prescrição:', error);
        showNotification('Erro', 'Erro ao gerar PDF da prescrição', 'error');
    }
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
 * ADICIONAR INFORMAÇÕES DA CONSULTA
 * Adiciona dados básicos da consulta ao PDF
 * @param {Object} doc - Documento jsPDF
 * @param {Object} appointmentData - Dados da consulta
 * @param {number} yPosition - Posição Y atual
 * @returns {number} Nova posição Y
 */
function addConsultationInfo(doc, appointmentData, yPosition) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Informações do paciente
    doc.text('DADOS DO PACIENTE:', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.text(`Nome: ${appointmentData.patient_name}`, 25, yPosition);
    yPosition += 6;
    doc.text(`Email: ${appointmentData.patient_email}`, 25, yPosition);
    yPosition += 6;
    doc.text(`Data da Consulta: ${formatDate(appointmentData.created_at)}`, 25, yPosition);
    yPosition += 6;
    doc.text(`Especialidade: ${appointmentData.specialty_name}`, 25, yPosition);
    yPosition += 15;
    
    return yPosition;
}

/**
 * ADICIONAR CONTEÚDO DO PRONTUÁRIO
 * Adiciona o conteúdo médico completo ao PDF
 * @param {Object} doc - Documento jsPDF
 * @param {Object} record - Dados do prontuário
 * @param {number} yPosition - Posição Y atual
 * @returns {number} Nova posição Y
 */
function addMedicalRecordContent(doc, record, yPosition) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Diagnóstico
    if (record.diagnosis) {
        doc.text('DIAGNÓSTICO:', 20, yPosition);
        yPosition += 8;
        yPosition = addWrappedText(doc, record.diagnosis, 25, yPosition, 160);
        yPosition += 10;
    }
    
    // Prescrições
    if (record.prescription) {
        doc.text('PRESCRIÇÕES MÉDICAS:', 20, yPosition);
        yPosition += 8;
        yPosition = addWrappedText(doc, record.prescription, 25, yPosition, 160);
        yPosition += 10;
    }
    
    // Recomendações
    if (record.recommendations) {
        doc.text('RECOMENDAÇÕES:', 20, yPosition);
        yPosition += 8;
        yPosition = addWrappedText(doc, record.recommendations, 25, yPosition, 160);
        yPosition += 10;
    }
    
    return yPosition;
}

/**
 * ADICIONAR CONTEÚDO DA PRESCRIÇÃO
 * Adiciona apenas o conteúdo da prescrição ao PDF
 * @param {Object} doc - Documento jsPDF
 * @param {Object} record - Dados do prontuário
 * @param {number} yPosition - Posição Y atual
 * @returns {number} Nova posição Y
 */
function addPrescriptionContent(doc, record, yPosition) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Título da prescrição
    doc.text('MEDICAMENTOS PRESCRITOS:', 20, yPosition);
    yPosition += 10;
    
    // Conteúdo da prescrição
    if (record.prescription) {
        yPosition = addWrappedText(doc, record.prescription, 25, yPosition, 160);
        yPosition += 15;
    }
    
    // Instruções gerais
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('INSTRUÇÕES IMPORTANTES:', 20, yPosition);
    yPosition += 8;
    
    const instructions = [
        '• Siga rigorosamente as dosagens prescritas',
        '• Não interrompa o tratamento sem orientação médica',
        '• Em caso de efeitos adversos, procure atendimento médico',
        '• Mantenha os medicamentos em local adequado',
        '• Esta prescrição tem validade de 30 dias'
    ];
    
    instructions.forEach(instruction => {
        doc.text(instruction, 25, yPosition);
        yPosition += 5;
    });
    
    return yPosition + 10;
}

/**
 * ADICIONAR ASSINATURA DIGITAL
 * Adiciona informações da assinatura digital ao PDF
 * @param {Object} doc - Documento jsPDF
 * @param {number} yPosition - Posição Y atual
 * @returns {number} Nova posição Y
 */
function addDigitalSignature(doc, yPosition) {
    // Verificar se há espaço suficiente
    if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
    }
    
    doc.setFontSize(10);
    doc.setTextColor(0, 100, 0);
    
    // Título da assinatura
    doc.text('ASSINATURA DIGITAL:', 20, yPosition);
    yPosition += 8;
    
    // Informações da assinatura
    if (MedicalRecords.digitalSignature) {
        try {
            const signatureData = JSON.parse(MedicalRecords.digitalSignature);
            doc.text(`Médico: ${signatureData.doctor}`, 25, yPosition);
            yPosition += 5;
            doc.text(`Data/Hora: ${new Date(signatureData.timestamp).toLocaleString('pt-BR')}`, 25, yPosition);
            yPosition += 5;
            doc.text(`Hash do Documento: ${signatureData.documentHash}`, 25, yPosition);
            yPosition += 5;
            doc.text(`Hash da Assinatura: ${signatureData.signatureHash.substring(0, 32)}...`, 25, yPosition);
            yPosition += 10;
        } catch (e) {
            doc.text('Documento assinado digitalmente', 25, yPosition);
            yPosition += 10;
        }
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
    
    // Linha separadora
    doc.setLineWidth(0.3);
    doc.line(20, pageHeight - 25, 190, pageHeight - 25);
    
    // Informações da clínica
    doc.text('TeleMed - Telemedicina | www.telemed.com.br | (11) 9999-9999', 20, pageHeight - 15);
    doc.text(`Documento gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, pageHeight - 10);
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
    
    // Linha separadora
    doc.setLineWidth(0.3);
    doc.line(20, pageHeight - 35, 190, pageHeight - 35);
    
    // Aviso legal
    doc.setTextColor(255, 0, 0);
    doc.text('PRESCRIÇÃO MÉDICA - DOCUMENTO COM VALIDADE LEGAL', 20, pageHeight - 25);
    
    doc.setTextColor(100, 100, 100);
    doc.text('TeleMed - Telemedicina | www.telemed.com.br | (11) 9999-9999', 20, pageHeight - 15);
    doc.text(`Prescrição gerada em: ${new Date().toLocaleString('pt-BR')}`, 20, pageHeight - 10);
}

/**
 * ADICIONAR TEXTO COM QUEBRA DE LINHA
 * Adiciona texto com quebra automática de linha
 * @param {Object} doc - Documento jsPDF
 * @param {string} text - Texto a ser adicionado
 * @param {number} x - Posição X
 * @param {number} y - Posição Y inicial
 * @param {number} maxWidth - Largura máxima
 * @returns {number} Nova posição Y
 */
function addWrappedText(doc, text, x, y, maxWidth) {
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach(line => {
        doc.text(line, x, y);
        y += 5;
    });
    
    return y;
}

/**
 * BUSCAR DADOS COMPLETOS DA CONSULTA
 * Busca todos os dados necessários para o PDF
 * @param {string} appointmentId - ID da consulta
 * @returns {Object|null} Dados completos da consulta
 */
async function getCompleteAppointmentData(appointmentId) {
    try {
        // Buscar dados da consulta
        const { data: appointment, error: appointmentError } = await supabase
            .from('appointments')
            .select(`
                id,
                created_at,
                symptoms,
                notes,
                specialties(name),
                users!appointments_patient_id_fkey(name, email)
            `)
            .eq('id', appointmentId)
            .single();
            
        if (appointmentError) {
            console.error('Erro ao buscar consulta:', appointmentError);
            return null;
        }
        
        // Estruturar dados para o PDF
        return {
            id: appointment.id,
            created_at: appointment.created_at,
            symptoms: appointment.symptoms,
            notes: appointment.notes,
            specialty_name: appointment.specialties?.name || 'N/A',
            patient_name: appointment.users?.name || 'N/A',
            patient_email: appointment.users?.email || 'N/A'
        };
        
    } catch (error) {
        console.error('Erro ao buscar dados completos:', error);
        return null;
    }
}

/**
 * ATUALIZAR URL DO PDF NO BANCO
 * Salva a URL do PDF gerado no banco de dados
 * @param {string} recordId - ID do prontuário
 * @param {string} fileName - Nome do arquivo PDF
 */
async function updateRecordPDFUrl(recordId, fileName) {
    try {
        const { error } = await supabase
            .from('medical_records')
            .update({ pdf_url: fileName })
            .eq('id', recordId);
            
        if (error) {
            console.error('Erro ao atualizar URL do PDF:', error);
        }
        
    } catch (error) {
        console.error('Erro na atualização da URL:', error);
    }
}

/**
 * FORMATAR DATA PARA NOME DE ARQUIVO
 * Formata data para uso em nomes de arquivo
 * @param {Date} date - Data a ser formatada
 * @returns {string} Data formatada
 */
function formatDateForFile(date) {
    return date.toISOString().split('T')[0].replace(/-/g, '');
}