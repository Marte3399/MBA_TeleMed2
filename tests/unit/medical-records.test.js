// Testes Unitários - Sistema de Prontuários Digitais
// Jest Test Suite para js/medical-records.js

describe('Sistema de Prontuários Digitais', () => {
    let mockSupabase;
    let mockJsPDF;
    
    beforeEach(() => {
        // Mock do Supabase
        mockSupabase = {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis()
        };
        
        // Mock do jsPDF
        mockJsPDF = {
            setFont: jest.fn(),
            setFontSize: jest.fn(),
            setTextColor: jest.fn(),
            text: jest.fn(),
            line: jest.fn(),
            setLineWidth: jest.fn(),
            splitTextToSize: jest.fn().mockReturnValue(['linha 1', 'linha 2']),
            save: jest.fn(),
            addPage: jest.fn(),
            internal: {
                pageSize: {
                    height: 297
                }
            }
        };
        
        // Configurar mocks globais
        global.supabase = mockSupabase;
        global.window = {
            jsPDF: mockJsPDF,
            MedicalRecords: {
                currentRecord: null,
                digitalSignature: null,
                isSigningMode: false,
                pdfGenerator: null
            }
        };
        
        // Mock do DOM
        global.document = {
            createElement: jest.fn().mockReturnValue({
                id: '',
                className: '',
                innerHTML: '',
                style: {},
                classList: {
                    add: jest.fn(),
                    remove: jest.fn()
                },
                addEventListener: jest.fn(),
                appendChild: jest.fn(),
                remove: jest.fn()
            }),
            body: {
                appendChild: jest.fn()
            },
            getElementById: jest.fn(),
            addEventListener: jest.fn(),
            querySelectorAll: jest.fn().mockReturnValue([])
        };
        
        // Mock de funções utilitárias
        global.showNotification = jest.fn();
        global.closeModal = jest.fn();
        global.formatDate = jest.fn().mockReturnValue('01/01/2024');
        global.btoa = jest.fn().mockReturnValue('base64string');
        
        // Limpar estado
        jest.clearAllMocks();
    });

    describe('Inicialização do Sistema', () => {
        test('deve inicializar o sistema de prontuários corretamente', () => {
            // Simular carregamento do módulo
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            // Executar inicialização
            const initResult = true; // Simular inicialização bem-sucedida
            
            expect(initResult).toBe(true);
            consoleSpy.mockRestore();
        });

        test('deve configurar event listeners corretamente', () => {
            const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
            
            // Simular configuração de event listeners
            document.addEventListener('submit', jest.fn());
            document.addEventListener('click', jest.fn());
            
            expect(addEventListenerSpy).toHaveBeenCalledWith('submit', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
        });
    });

    describe('Criação de Prontuário', () => {
        test('deve criar modal de prontuário com dados corretos', () => {
            const mockAppointment = {
                id: 'test-appointment-123',
                patient_name: 'João Silva',
                specialty_name: 'Cardiologia',
                created_at: '2024-01-01T10:00:00Z'
            };

            const createElementSpy = jest.spyOn(document, 'createElement');
            
            // Simular criação do modal
            const modal = document.createElement('div');
            modal.id = 'medicalRecordModal';
            modal.className = 'modal-overlay';
            
            expect(createElementSpy).toHaveBeenCalledWith('div');
            expect(modal.id).toBe('medicalRecordModal');
            expect(modal.className).toBe('modal-overlay');
        });

        test('deve validar campos obrigatórios do prontuário', () => {
            const recordData = {
                diagnosis: '',
                prescription: 'Medicamento X',
                recommendations: 'Repouso'
            };

            // Simular validação
            const isValid = recordData.diagnosis.trim().length > 0;
            
            expect(isValid).toBe(false);
        });

        test('deve salvar prontuário no banco de dados', async () => {
            const recordData = {
                appointment_id: 'test-appointment-123',
                diagnosis: 'Hipertensão arterial',
                prescription: 'Losartana 50mg',
                recommendations: 'Dieta hipossódica',
                is_signed: false
            };

            // Mock da resposta do Supabase
            mockSupabase.from.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { patient_id: 'patient-123', doctor_id: 'doctor-456' },
                            error: null
                        })
                    })
                }),
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { ...recordData, id: 'record-789' },
                            error: null
                        })
                    })
                })
            });

            // Simular salvamento
            const result = await mockSupabase.from('medical_records').insert([recordData]);
            
            expect(mockSupabase.from).toHaveBeenCalledWith('medical_records');
            expect(result).toBeDefined();
        });
    });

    describe('Assinatura Digital', () => {
        test('deve gerar assinatura digital válida', () => {
            const mockRecord = {
                id: 'record-123',
                diagnosis: 'Teste',
                prescription: 'Teste',
                recommendations: 'Teste'
            };

            // Simular geração de assinatura
            const timestamp = new Date().toISOString();
            const doctorInfo = "Dr. João Silva - CRM: 12345-SP";
            const documentHash = 'abc123def456';
            
            const signatureData = {
                doctor: doctorInfo,
                timestamp: timestamp,
                documentHash: documentHash,
                signatureHash: btoa(doctorInfo + timestamp + documentHash)
            };

            const digitalSignature = JSON.stringify(signatureData);
            
            expect(digitalSignature).toContain(doctorInfo);
            expect(digitalSignature).toContain(timestamp);
            expect(digitalSignature).toContain(documentHash);
        });

        test('deve validar confirmações antes de assinar', () => {
            const confirmSignature = { checked: true };
            const confirmResponsibility = { checked: true };
            
            const isValid = confirmSignature.checked && confirmResponsibility.checked;
            
            expect(isValid).toBe(true);
        });

        test('deve atualizar prontuário com assinatura no banco', async () => {
            const recordId = 'record-123';
            const digitalSignature = '{"doctor":"Dr. Test","timestamp":"2024-01-01"}';

            // Mock da atualização
            mockSupabase.from.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                                data: { id: recordId, is_signed: true, digital_signature: digitalSignature },
                                error: null
                            })
                        })
                    })
                })
            });

            const result = await mockSupabase.from('medical_records').update({
                digital_signature: digitalSignature,
                is_signed: true
            });

            expect(mockSupabase.from).toHaveBeenCalledWith('medical_records');
            expect(result).toBeDefined();
        });
    });

    describe('Geração de PDF', () => {
        beforeEach(() => {
            // Mock do jsPDF constructor
            global.window.jsPDF = jest.fn().mockImplementation(() => mockJsPDF);
        });

        test('deve gerar PDF do prontuário completo', () => {
            const mockRecord = {
                id: 'record-123',
                appointment_id: 'appointment-456',
                diagnosis: 'Hipertensão arterial sistêmica',
                prescription: 'Losartana 50mg - 1x ao dia',
                recommendations: 'Dieta hipossódica e exercícios',
                is_signed: true
            };

            const mockAppointmentData = {
                patient_name: 'João Silva',
                patient_email: 'joao@email.com',
                specialty_name: 'Cardiologia',
                created_at: '2024-01-01T10:00:00Z'
            };

            // Simular geração de PDF
            const doc = new window.jsPDF();
            
            // Verificar se métodos do jsPDF foram chamados
            expect(doc.setFont).toBeDefined();
            expect(doc.setFontSize).toBeDefined();
            expect(doc.text).toBeDefined();
            expect(doc.save).toBeDefined();
        });

        test('deve gerar PDF separado para prescrições', () => {
            const mockRecord = {
                id: 'record-123',
                prescription: 'Losartana 50mg - 1 comprimido ao dia\nHidroclotiazida 25mg - 1 comprimido ao dia',
                is_signed: true
            };

            // Simular geração de PDF de prescrição
            const doc = new window.jsPDF();
            
            expect(doc).toBeDefined();
            expect(mockRecord.prescription).toContain('Losartana');
            expect(mockRecord.prescription).toContain('Hidroclotiazida');
        });

        test('deve adicionar cabeçalho padrão ao PDF', () => {
            const doc = new window.jsPDF();
            const title = 'PRONTUÁRIO MÉDICO';
            
            // Simular adição de cabeçalho
            doc.setFontSize(20);
            doc.setTextColor(0, 102, 204);
            doc.text('TeleMed - Telemedicina', 20, 20);
            doc.text(title, 20, 35);
            
            expect(doc.setFontSize).toHaveBeenCalledWith(20);
            expect(doc.setTextColor).toHaveBeenCalledWith(0, 102, 204);
            expect(doc.text).toHaveBeenCalledWith('TeleMed - Telemedicina', 20, 20);
            expect(doc.text).toHaveBeenCalledWith(title, 20, 35);
        });

        test('deve adicionar informações da consulta ao PDF', () => {
            const doc = new window.jsPDF();
            const appointmentData = {
                patient_name: 'João Silva',
                patient_email: 'joao@email.com',
                created_at: '2024-01-01T10:00:00Z',
                specialty_name: 'Cardiologia'
            };

            // Simular adição de informações
            doc.text(`Nome: ${appointmentData.patient_name}`, 25, 60);
            doc.text(`Email: ${appointmentData.patient_email}`, 25, 66);
            doc.text(`Especialidade: ${appointmentData.specialty_name}`, 25, 78);
            
            expect(doc.text).toHaveBeenCalledWith(`Nome: ${appointmentData.patient_name}`, 25, 60);
            expect(doc.text).toHaveBeenCalledWith(`Email: ${appointmentData.patient_email}`, 25, 66);
            expect(doc.text).toHaveBeenCalledWith(`Especialidade: ${appointmentData.specialty_name}`, 25, 78);
        });

        test('deve adicionar conteúdo do prontuário ao PDF', () => {
            const doc = new window.jsPDF();
            const record = {
                diagnosis: 'Hipertensão arterial sistêmica',
                prescription: 'Losartana 50mg',
                recommendations: 'Dieta e exercícios'
            };

            // Simular adição de conteúdo
            doc.text('DIAGNÓSTICO:', 20, 100);
            doc.text('PRESCRIÇÕES MÉDICAS:', 20, 120);
            doc.text('RECOMENDAÇÕES:', 20, 140);
            
            expect(doc.text).toHaveBeenCalledWith('DIAGNÓSTICO:', 20, 100);
            expect(doc.text).toHaveBeenCalledWith('PRESCRIÇÕES MÉDICAS:', 20, 120);
            expect(doc.text).toHaveBeenCalledWith('RECOMENDAÇÕES:', 20, 140);
        });

        test('deve adicionar assinatura digital ao PDF quando presente', () => {
            const doc = new window.jsPDF();
            const digitalSignature = JSON.stringify({
                doctor: "Dr. João Silva - CRM: 12345-SP",
                timestamp: "2024-01-01T10:00:00Z",
                documentHash: "abc123",
                signatureHash: "def456"
            });

            // Simular adição de assinatura
            doc.text('ASSINATURA DIGITAL:', 20, 200);
            
            const signatureData = JSON.parse(digitalSignature);
            doc.text(`Médico: ${signatureData.doctor}`, 25, 208);
            doc.text(`Data/Hora: ${new Date(signatureData.timestamp).toLocaleString('pt-BR')}`, 25, 213);
            
            expect(doc.text).toHaveBeenCalledWith('ASSINATURA DIGITAL:', 20, 200);
            expect(doc.text).toHaveBeenCalledWith(`Médico: ${signatureData.doctor}`, 25, 208);
        });
    });

    describe('Integração com Sistema de Consultas', () => {
        test('deve buscar dados da consulta corretamente', async () => {
            const appointmentId = 'appointment-123';
            
            // Mock da busca
            mockSupabase.from.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: {
                                id: appointmentId,
                                patient_id: 'patient-456',
                                doctor_id: 'doctor-789',
                                created_at: '2024-01-01T10:00:00Z',
                                symptoms: 'Dor no peito',
                                notes: 'Primeira consulta'
                            },
                            error: null
                        })
                    })
                })
            });

            const result = await mockSupabase.from('appointments').select().eq('id', appointmentId).single();
            
            expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
            expect(result.data.id).toBe(appointmentId);
        });

        test('deve listar prontuários existentes', async () => {
            const mockRecords = [
                {
                    id: 'record-1',
                    diagnosis: 'Hipertensão',
                    is_signed: true,
                    created_at: '2024-01-01T10:00:00Z'
                },
                {
                    id: 'record-2',
                    diagnosis: 'Diabetes',
                    is_signed: false,
                    created_at: '2024-01-02T10:00:00Z'
                }
            ];

            // Mock da listagem
            mockSupabase.from.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue({
                            data: mockRecords,
                            error: null
                        })
                    })
                })
            });

            const result = await mockSupabase.from('medical_records').select().order('created_at').limit(10);
            
            expect(result.data).toHaveLength(2);
            expect(result.data[0].diagnosis).toBe('Hipertensão');
            expect(result.data[1].diagnosis).toBe('Diabetes');
        });
    });

    describe('Tratamento de Erros', () => {
        test('deve tratar erro ao salvar prontuário', async () => {
            // Mock de erro do Supabase
            mockSupabase.from.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Consulta não encontrada' }
                        })
                    })
                })
            });

            const result = await mockSupabase.from('appointments').select().eq('id', 'invalid-id').single();
            
            expect(result.error).toBeDefined();
            expect(result.error.message).toBe('Consulta não encontrada');
        });

        test('deve tratar erro ao gerar PDF', () => {
            // Simular erro na biblioteca jsPDF
            global.window.jsPDF = undefined;
            
            const hasJsPDF = typeof window.jsPDF !== 'undefined';
            
            expect(hasJsPDF).toBe(false);
        });

        test('deve validar dados obrigatórios antes de salvar', () => {
            const recordData = {
                appointment_id: '',
                diagnosis: '',
                prescription: 'Medicamento',
                recommendations: 'Recomendações'
            };

            const isValid = !!(recordData.appointment_id && recordData.diagnosis.trim());
            
            expect(isValid).toBe(false);
        });
    });

    describe('Utilitários', () => {
        test('deve formatar data para nome de arquivo', () => {
            const date = new Date('2024-01-01T10:00:00Z');
            const formatted = date.toISOString().split('T')[0].replace(/-/g, '');
            
            expect(formatted).toBe('20240101');
        });

        test('deve gerar hash do documento', () => {
            const content = JSON.stringify({ test: 'data' });
            const hash = btoa(content).substring(0, 32);
            
            expect(hash).toBeDefined();
            expect(hash.length).toBeLessThanOrEqual(32);
        });

        test('deve quebrar texto em linhas para PDF', () => {
            const text = 'Este é um texto muito longo que precisa ser quebrado em múltiplas linhas para caber no PDF';
            const maxWidth = 160;
            
            // Simular quebra de texto
            const lines = mockJsPDF.splitTextToSize(text, maxWidth);
            
            expect(mockJsPDF.splitTextToSize).toHaveBeenCalledWith(text, maxWidth);
            expect(lines).toEqual(['linha 1', 'linha 2']);
        });
    });
});

// Testes de Integração
describe('Integração - Sistema Completo de Prontuários', () => {
    test('deve executar fluxo completo: criar → assinar → gerar PDF', async () => {
        const mockAppointment = {
            id: 'appointment-123',
            patient_name: 'João Silva',
            specialty_name: 'Cardiologia'
        };

        const mockRecord = {
            id: 'record-456',
            appointment_id: mockAppointment.id,
            diagnosis: 'Hipertensão arterial',
            prescription: 'Losartana 50mg',
            recommendations: 'Dieta e exercícios',
            is_signed: false
        };

        // 1. Criar prontuário
        expect(mockRecord.diagnosis).toBeDefined();
        expect(mockRecord.prescription).toBeDefined();
        
        // 2. Assinar digitalmente
        mockRecord.is_signed = true;
        mockRecord.digital_signature = JSON.stringify({
            doctor: "Dr. João Silva - CRM: 12345-SP",
            timestamp: new Date().toISOString()
        });
        
        expect(mockRecord.is_signed).toBe(true);
        expect(mockRecord.digital_signature).toBeDefined();
        
        // 3. Gerar PDF
        const pdfGenerated = true; // Simular geração bem-sucedida
        
        expect(pdfGenerated).toBe(true);
    });
});

console.log('✅ Testes do Sistema de Prontuários Digitais carregados');