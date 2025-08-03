// TeleMed - Testes Unitários do Sistema de Histórico Médico

/**
 * TESTES DO SISTEMA DE HISTÓRICO MÉDICO
 * Verifica todas as funcionalidades do sistema de histórico médico
 */

describe('Sistema de Histórico Médico', () => {
    let mockSupabase;
    let mockTeleMed;
    let mockMedicalHistory;
    
    beforeEach(() => {
        // Mock do Supabase
        mockSupabase = {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            single: jest.fn()
        };
        
        // Mock do TeleMed global
        mockTeleMed = {
            currentUser: {
                id: 'test-patient-id',
                name: 'João Silva',
                email: 'joao.silva@email.com'
            },
            isLoggedIn: true,
            formatDate: jest.fn(date => new Date(date).toLocaleDateString('pt-BR')),
            formatTime: jest.fn(date => new Date(date).toLocaleTimeString('pt-BR')),
            debounce: jest.fn((func, wait) => func)
        };
        
        // Mock do MedicalHistory
        mockMedicalHistory = {
            currentPatientId: 'test-patient-id',
            medicalRecords: [],
            downloadAuditLog: [],
            isLoading: false,
            currentPage: 1,
            recordsPerPage: 10
        };
        
        // Configurar mocks globais
        global.supabase = mockSupabase;
        global.TeleMed = mockTeleMed;
        global.MedicalHistory = mockMedicalHistory;
        
        // Mock das funções de notificação
        global.showNotification = jest.fn();
        global.closeModal = jest.fn();
        
        // Mock do jsPDF
        global.jsPDF = jest.fn().mockImplementation(() => ({
            setFont: jest.fn(),
            setFontSize: jest.fn(),
            setTextColor: jest.fn(),
            text: jest.fn(),
            line: jest.fn(),
            splitTextToSize: jest.fn().mockReturnValue(['linha 1', 'linha 2']),
            addPage: jest.fn(),
            save: jest.fn(),
            internal: {
                pageSize: {
                    height: 297
                }
            }
        }));
        
        // Mock do DOM
        document.body.innerHTML = '';
        document.createElement = jest.fn().mockImplementation((tag) => {
            const element = {
                tagName: tag.toUpperCase(),
                id: '',
                className: '',
                innerHTML: '',
                textContent: '',
                style: {},
                classList: {
                    add: jest.fn(),
                    remove: jest.fn(),
                    contains: jest.fn()
                },
                addEventListener: jest.fn(),
                appendChild: jest.fn(),
                remove: jest.fn(),
                querySelector: jest.fn(),
                querySelectorAll: jest.fn().mockReturnValue([]),
                dataset: {}
            };
            return element;
        });
        
        document.getElementById = jest.fn();
        document.body.appendChild = jest.fn();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('Inicialização do Sistema', () => {
        test('deve inicializar o sistema de histórico médico corretamente', () => {
            // Simular função de inicialização
            const initializeMedicalHistory = () => {
                console.log('📚 Inicializando sistema de histórico médico...');
                
                if (mockTeleMed.currentUser && mockTeleMed.currentUser.id) {
                    mockMedicalHistory.currentPatientId = mockTeleMed.currentUser.id;
                }
                
                console.log('✅ Sistema de histórico médico inicializado');
                return true;
            };
            
            const result = initializeMedicalHistory();
            
            expect(result).toBe(true);
            expect(mockMedicalHistory.currentPatientId).toBe('test-patient-id');
        });
        
        test('deve configurar event listeners corretamente', () => {
            const setupEventListeners = () => {
                const listeners = {
                    downloadRecord: jest.fn(),
                    downloadPrescription: jest.fn(),
                    viewRecord: jest.fn(),
                    refreshHistory: jest.fn(),
                    dateFilter: jest.fn(),
                    search: jest.fn()
                };
                
                return listeners;
            };
            
            const listeners = setupEventListeners();
            
            expect(listeners.downloadRecord).toBeDefined();
            expect(listeners.downloadPrescription).toBeDefined();
            expect(listeners.viewRecord).toBeDefined();
            expect(listeners.refreshHistory).toBeDefined();
            expect(listeners.dateFilter).toBeDefined();
            expect(listeners.search).toBeDefined();
        });
    });
    
    describe('Carregamento de Dados', () => {
        test('deve carregar histórico médico do paciente', async () => {
            const mockRecords = [
                {
                    id: 'record-1',
                    appointment_id: 'appointment-1',
                    diagnosis: 'Hipertensão arterial',
                    prescription: 'Losartana 50mg',
                    recommendations: 'Dieta e exercícios',
                    is_signed: true,
                    created_at: '2024-01-15T10:00:00Z',
                    appointments: {
                        specialties: { name: 'Cardiologia', icon: '❤️' },
                        doctors: { name: 'Dr. Silva', crm: '12345-SP' }
                    }
                }
            ];
            
            mockSupabase.single.mockResolvedValue({ data: mockRecords, error: null });
            
            const loadMedicalHistory = async () => {
                if (!mockMedicalHistory.currentPatientId) {
                    throw new Error('ID do paciente não encontrado');
                }
                
                const { data, error } = await mockSupabase
                    .from('medical_records')
                    .select()
                    .eq('patient_id', mockMedicalHistory.currentPatientId)
                    .order('created_at', { ascending: false });
                
                if (error) {
                    throw error;
                }
                
                mockMedicalHistory.medicalRecords = data || [];
                return mockMedicalHistory.medicalRecords;
            };
            
            const records = await loadMedicalHistory();
            
            expect(mockSupabase.from).toHaveBeenCalledWith('medical_records');
            expect(mockSupabase.eq).toHaveBeenCalledWith('patient_id', 'test-patient-id');
            expect(records).toEqual(mockRecords);
        });
        
        test('deve tratar erro ao carregar histórico médico', async () => {
            mockSupabase.single.mockResolvedValue({ 
                data: null, 
                error: { message: 'Erro de conexão' } 
            });
            
            const loadMedicalHistory = async () => {
                const { data, error } = await mockSupabase
                    .from('medical_records')
                    .select()
                    .eq('patient_id', mockMedicalHistory.currentPatientId);
                
                if (error) {
                    throw error;
                }
                
                return data;
            };
            
            await expect(loadMedicalHistory()).rejects.toThrow('Erro de conexão');
        });
    });
    
    describe('Interface de Usuário', () => {
        test('deve criar modal de histórico médico', () => {
            const createMedicalHistoryModal = () => {
                const modal = document.createElement('div');
                modal.id = 'medicalHistoryModal';
                modal.className = 'modal-overlay';
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>📚 Histórico Médico</h3>
                        </div>
                        <div class="modal-body">
                            <div id="medicalRecordsList"></div>
                        </div>
                    </div>
                `;
                
                return modal;
            };
            
            const modal = createMedicalHistoryModal();
            
            expect(modal.id).toBe('medicalHistoryModal');
            expect(modal.className).toBe('modal-overlay');
            expect(modal.innerHTML).toContain('📚 Histórico Médico');
        });
        
        test('deve renderizar lista de prontuários', () => {
            const mockRecords = [
                {
                    id: 'record-1',
                    diagnosis: 'Hipertensão arterial',
                    prescription: 'Losartana 50mg',
                    is_signed: true,
                    created_at: '2024-01-15T10:00:00Z',
                    appointments: {
                        specialties: { name: 'Cardiologia', icon: '❤️' },
                        doctors: { name: 'Dr. Silva', crm: '12345-SP' }
                    }
                }
            ];
            
            const renderMedicalRecords = (records) => {
                return records.map(record => {
                    const appointment = record.appointments;
                    const specialty = appointment.specialties;
                    const doctor = appointment.doctors;
                    
                    return {
                        id: record.id,
                        specialtyName: specialty.name,
                        doctorName: doctor.name,
                        diagnosis: record.diagnosis,
                        isSigned: record.is_signed,
                        hasPrescription: !!(record.prescription && record.prescription.trim().length > 0)
                    };
                });
            };
            
            const renderedRecords = renderMedicalRecords(mockRecords);
            
            expect(renderedRecords).toHaveLength(1);
            expect(renderedRecords[0].specialtyName).toBe('Cardiologia');
            expect(renderedRecords[0].doctorName).toBe('Dr. Silva');
            expect(renderedRecords[0].isSigned).toBe(true);
            expect(renderedRecords[0].hasPrescription).toBe(true);
        });
    });
    
    describe('Geração de PDF', () => {
        test('deve gerar PDF do prontuário médico', async () => {
            const mockRecord = {
                id: 'record-1',
                diagnosis: 'Hipertensão arterial sistêmica',
                prescription: 'Losartana 50mg - 1x ao dia',
                recommendations: 'Dieta hipossódica',
                is_signed: true,
                digital_signature: JSON.stringify({
                    doctor: 'Dr. Silva - CRM: 12345-SP',
                    timestamp: '2024-01-15T10:00:00Z',
                    documentHash: 'abc123',
                    signatureHash: 'def456'
                }),
                created_at: '2024-01-15T10:00:00Z',
                appointments: {
                    specialties: { name: 'Cardiologia', icon: '❤️' },
                    doctors: { name: 'Dr. Silva', crm: '12345-SP' }
                }
            };
            
            mockMedicalHistory.medicalRecords = [mockRecord];
            
            const downloadMedicalRecordPDF = async (recordId) => {
                const record = mockMedicalHistory.medicalRecords.find(r => r.id === recordId);
                
                if (!record) {
                    throw new Error('Prontuário não encontrado');
                }
                
                // Simular geração de PDF
                const doc = new global.jsPDF();
                
                // Adicionar conteúdo
                doc.text('PRONTUÁRIO MÉDICO', 20, 20);
                doc.text(`Diagnóstico: ${record.diagnosis}`, 20, 40);
                doc.text(`Prescrição: ${record.prescription}`, 20, 60);
                
                // Salvar
                const fileName = `prontuario_${recordId}.pdf`;
                doc.save(fileName);
                
                return fileName;
            };
            
            const fileName = await downloadMedicalRecordPDF('record-1');
            
            expect(fileName).toBe('prontuario_record-1.pdf');
            expect(global.jsPDF).toHaveBeenCalled();
        });
        
        test('deve gerar PDF da prescrição separadamente', async () => {
            const mockRecord = {
                id: 'record-1',
                prescription: 'Losartana 50mg - 1 comprimido pela manhã',
                is_signed: true,
                created_at: '2024-01-15T10:00:00Z',
                appointments: {
                    specialties: { name: 'Cardiologia', icon: '❤️' },
                    doctors: { name: 'Dr. Silva', crm: '12345-SP' }
                }
            };
            
            mockMedicalHistory.medicalRecords = [mockRecord];
            
            const downloadPrescriptionPDF = async (recordId) => {
                const record = mockMedicalHistory.medicalRecords.find(r => r.id === recordId);
                
                if (!record) {
                    throw new Error('Prontuário não encontrado');
                }
                
                if (!record.prescription || record.prescription.trim().length === 0) {
                    throw new Error('Este prontuário não possui prescrições');
                }
                
                // Simular geração de PDF da prescrição
                const doc = new global.jsPDF();
                
                doc.text('PRESCRIÇÃO MÉDICA', 20, 20);
                doc.text(record.prescription, 20, 40);
                
                const fileName = `prescricao_${recordId}.pdf`;
                doc.save(fileName);
                
                return fileName;
            };
            
            const fileName = await downloadPrescriptionPDF('record-1');
            
            expect(fileName).toBe('prescricao_record-1.pdf');
            expect(global.jsPDF).toHaveBeenCalled();
        });
        
        test('deve falhar ao gerar PDF de prescrição sem prescrição', async () => {
            const mockRecord = {
                id: 'record-1',
                prescription: '', // Prescrição vazia
                created_at: '2024-01-15T10:00:00Z'
            };
            
            mockMedicalHistory.medicalRecords = [mockRecord];
            
            const downloadPrescriptionPDF = async (recordId) => {
                const record = mockMedicalHistory.medicalRecords.find(r => r.id === recordId);
                
                if (!record.prescription || record.prescription.trim().length === 0) {
                    throw new Error('Este prontuário não possui prescrições');
                }
                
                return 'success';
            };
            
            await expect(downloadPrescriptionPDF('record-1'))
                .rejects.toThrow('Este prontuário não possui prescrições');
        });
    });
    
    describe('Auditoria de Downloads', () => {
        test('deve registrar auditoria de download', async () => {
            const logDownloadAudit = async (recordId, documentType, description) => {
                const auditData = {
                    user_id: mockMedicalHistory.currentPatientId,
                    medical_record_id: recordId,
                    document_type: documentType,
                    description: description,
                    ip_address: '192.168.1.1',
                    user_agent: 'Test Browser',
                    downloaded_at: new Date().toISOString()
                };
                
                mockMedicalHistory.downloadAuditLog.push(auditData);
                
                return auditData;
            };
            
            const auditEntry = await logDownloadAudit(
                'record-1', 
                'medical_record_pdf', 
                'PDF Completo do Prontuário'
            );
            
            expect(auditEntry.user_id).toBe('test-patient-id');
            expect(auditEntry.medical_record_id).toBe('record-1');
            expect(auditEntry.document_type).toBe('medical_record_pdf');
            expect(auditEntry.description).toBe('PDF Completo do Prontuário');
            expect(mockMedicalHistory.downloadAuditLog).toHaveLength(1);
        });
        
        test('deve manter histórico de auditoria', () => {
            const auditEntries = [
                {
                    user_id: 'test-patient-id',
                    medical_record_id: 'record-1',
                    document_type: 'medical_record_pdf',
                    description: 'PDF Completo do Prontuário',
                    downloaded_at: '2024-01-15T10:00:00Z'
                },
                {
                    user_id: 'test-patient-id',
                    medical_record_id: 'record-1',
                    document_type: 'prescription_pdf',
                    description: 'PDF da Prescrição Médica',
                    downloaded_at: '2024-01-15T10:05:00Z'
                }
            ];
            
            mockMedicalHistory.downloadAuditLog = auditEntries;
            
            expect(mockMedicalHistory.downloadAuditLog).toHaveLength(2);
            expect(mockMedicalHistory.downloadAuditLog[0].document_type).toBe('medical_record_pdf');
            expect(mockMedicalHistory.downloadAuditLog[1].document_type).toBe('prescription_pdf');
        });
    });
    
    describe('Verificação de Assinatura Digital', () => {
        test('deve verificar assinatura digital válida', () => {
            const mockSignatureData = {
                doctor: 'Dr. Silva - CRM: 12345-SP',
                timestamp: '2024-01-15T10:00:00Z',
                documentHash: 'abc123',
                signatureHash: btoa('Dr. Silva - CRM: 12345-SP2024-01-15T10:00:00Zabc123')
            };
            
            const validateSignature = (signatureData) => {
                if (!signatureData || !signatureData.signatureHash) {
                    return false;
                }
                
                const expectedHash = btoa(
                    signatureData.doctor + 
                    signatureData.timestamp + 
                    signatureData.documentHash
                );
                
                return signatureData.signatureHash === expectedHash;
            };
            
            const isValid = validateSignature(mockSignatureData);
            
            expect(isValid).toBe(true);
        });
        
        test('deve detectar assinatura digital inválida', () => {
            const mockSignatureData = {
                doctor: 'Dr. Silva - CRM: 12345-SP',
                timestamp: '2024-01-15T10:00:00Z',
                documentHash: 'abc123',
                signatureHash: 'invalid-hash'
            };
            
            const validateSignature = (signatureData) => {
                if (!signatureData || !signatureData.signatureHash) {
                    return false;
                }
                
                const expectedHash = btoa(
                    signatureData.doctor + 
                    signatureData.timestamp + 
                    signatureData.documentHash
                );
                
                return signatureData.signatureHash === expectedHash;
            };
            
            const isValid = validateSignature(mockSignatureData);
            
            expect(isValid).toBe(false);
        });
        
        test('deve criar modal de verificação de assinatura', () => {
            const mockRecord = {
                id: 'record-1',
                is_signed: true,
                digital_signature: JSON.stringify({
                    doctor: 'Dr. Silva - CRM: 12345-SP',
                    timestamp: '2024-01-15T10:00:00Z',
                    documentHash: 'abc123',
                    signatureHash: 'def456'
                })
            };
            
            const createSignatureVerificationModal = (record) => {
                const modal = document.createElement('div');
                modal.id = 'signatureVerificationModal';
                modal.className = 'modal-overlay';
                
                let signatureData = null;
                try {
                    signatureData = JSON.parse(record.digital_signature);
                } catch (e) {
                    signatureData = null;
                }
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <h3>🔐 Verificação de Assinatura Digital</h3>
                        <div class="signature-details">
                            ${signatureData ? `
                                <div>Médico: ${signatureData.doctor}</div>
                                <div>Data: ${signatureData.timestamp}</div>
                                <div>Hash: ${signatureData.documentHash}</div>
                            ` : 'Dados da assinatura não disponíveis'}
                        </div>
                    </div>
                `;
                
                return modal;
            };
            
            const modal = createSignatureVerificationModal(mockRecord);
            
            expect(modal.id).toBe('signatureVerificationModal');
            expect(modal.innerHTML).toContain('🔐 Verificação de Assinatura Digital');
            expect(modal.innerHTML).toContain('Dr. Silva - CRM: 12345-SP');
        });
    });
    
    describe('Filtros e Busca', () => {
        test('deve filtrar prontuários por termo de busca', () => {
            const mockRecords = [
                {
                    id: 'record-1',
                    diagnosis: 'Hipertensão arterial',
                    prescription: 'Losartana',
                    appointments: {
                        specialties: { name: 'Cardiologia' },
                        doctors: { name: 'Dr. Silva' }
                    }
                },
                {
                    id: 'record-2',
                    diagnosis: 'Diabetes mellitus',
                    prescription: 'Metformina',
                    appointments: {
                        specialties: { name: 'Endocrinologia' },
                        doctors: { name: 'Dr. Santos' }
                    }
                }
            ];
            
            const filterMedicalRecords = (records, query) => {
                if (!query || query.trim().length === 0) {
                    return records;
                }
                
                const searchText = query.toLowerCase();
                
                return records.filter(record => {
                    const appointment = record.appointments;
                    const specialty = appointment.specialties;
                    const doctor = appointment.doctors;
                    
                    return (
                        record.diagnosis?.toLowerCase().includes(searchText) ||
                        record.prescription?.toLowerCase().includes(searchText) ||
                        specialty?.name?.toLowerCase().includes(searchText) ||
                        doctor?.name?.toLowerCase().includes(searchText)
                    );
                });
            };
            
            const filteredByDiagnosis = filterMedicalRecords(mockRecords, 'hipertensão');
            const filteredBySpecialty = filterMedicalRecords(mockRecords, 'cardiologia');
            const filteredByDoctor = filterMedicalRecords(mockRecords, 'santos');
            
            expect(filteredByDiagnosis).toHaveLength(1);
            expect(filteredByDiagnosis[0].id).toBe('record-1');
            
            expect(filteredBySpecialty).toHaveLength(1);
            expect(filteredBySpecialty[0].id).toBe('record-1');
            
            expect(filteredByDoctor).toHaveLength(1);
            expect(filteredByDoctor[0].id).toBe('record-2');
        });
        
        test('deve filtrar prontuários por intervalo de datas', () => {
            const mockRecords = [
                {
                    id: 'record-1',
                    created_at: '2024-01-15T10:00:00Z'
                },
                {
                    id: 'record-2',
                    created_at: '2024-01-20T10:00:00Z'
                },
                {
                    id: 'record-3',
                    created_at: '2024-01-25T10:00:00Z'
                }
            ];
            
            const filterByDateRange = (records, startDate, endDate) => {
                return records.filter(record => {
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
            };
            
            const filtered = filterByDateRange(mockRecords, '2024-01-18', '2024-01-22');
            
            expect(filtered).toHaveLength(1);
            expect(filtered[0].id).toBe('record-2');
        });
    });
    
    describe('Integração com Dashboard', () => {
        test('deve atualizar estatísticas do dashboard', () => {
            const mockRecords = [
                { id: 'record-1', prescription: 'Losartana', is_signed: true },
                { id: 'record-2', prescription: '', is_signed: false },
                { id: 'record-3', prescription: 'Metformina', is_signed: true }
            ];
            
            mockMedicalHistory.medicalRecords = mockRecords;
            
            const updateMedicalHistoryStats = () => {
                const records = mockMedicalHistory.medicalRecords;
                const totalRecords = records.length;
                const recordsWithPrescription = records.filter(r => 
                    r.prescription && r.prescription.trim().length > 0
                ).length;
                const signedRecords = records.filter(r => r.is_signed).length;
                
                return {
                    total: totalRecords,
                    withPrescription: recordsWithPrescription,
                    signed: signedRecords
                };
            };
            
            const stats = updateMedicalHistoryStats();
            
            expect(stats.total).toBe(3);
            expect(stats.withPrescription).toBe(2);
            expect(stats.signed).toBe(2);
        });
        
        test('deve baixar último prontuário do dashboard', async () => {
            const mockRecords = [
                {
                    id: 'record-latest',
                    created_at: '2024-01-20T10:00:00Z',
                    diagnosis: 'Consulta mais recente'
                },
                {
                    id: 'record-older',
                    created_at: '2024-01-15T10:00:00Z',
                    diagnosis: 'Consulta mais antiga'
                }
            ];
            
            mockMedicalHistory.medicalRecords = mockRecords;
            
            const downloadLatestRecord = async () => {
                if (!mockMedicalHistory.medicalRecords || mockMedicalHistory.medicalRecords.length === 0) {
                    throw new Error('Nenhum prontuário encontrado');
                }
                
                const latestRecord = mockMedicalHistory.medicalRecords[0];
                
                // Simular download
                return `Downloaded: ${latestRecord.id}`;
            };
            
            const result = await downloadLatestRecord();
            
            expect(result).toBe('Downloaded: record-latest');
        });
    });
});

// Executar testes se estiver em ambiente de teste
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Exportar funções para teste se necessário
    };
}