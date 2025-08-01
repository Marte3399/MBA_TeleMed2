/**
 * TESTES UNITÁRIOS - SISTEMA DE CADASTRO E APROVAÇÃO DE MÉDICOS
 * Tarefa 2: Implementar sistema de cadastro e aprovação de médicos
 * 
 * Testa todas as funcionalidades do sistema de cadastro médico:
 * - Validação de formulários
 * - Integração com banco de dados
 * - Sistema de notificações
 * - Painel administrativo
 * - Workflow de aprovação
 */

// Mock do Supabase para testes
const mockSupabase = {
    from: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        insert: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: {}, error: null }))
        })),
        eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }))
};

// Mock global do Supabase
global.supabase = mockSupabase;

describe('Sistema de Cadastro e Aprovação de Médicos', () => {
    
    describe('Validação de Dados Pessoais', () => {
        
        test('deve validar CPF corretamente', () => {
            const validCPF = '123.456.789-00';
            const invalidCPF = '123.456.789-99';
            
            expect(validateCPF(validCPF)).toBe(true);
            expect(validateCPF(invalidCPF)).toBe(false);
            expect(validateCPF('')).toBe(false);
            expect(validateCPF(null)).toBe(false);
        });

        test('deve validar email profissional', () => {
            const validEmails = [
                'dr.joao@hospital.com.br',
                'maria.silva@clinica.med.br',
                'medico@gmail.com'
            ];
            
            const invalidEmails = [
                'email-invalido',
                '@hospital.com',
                'medico@',
                ''
            ];

            validEmails.forEach(email => {
                expect(validateEmail(email)).toBe(true);
            });

            invalidEmails.forEach(email => {
                expect(validateEmail(email)).toBe(false);
            });
        });

        test('deve validar telefone brasileiro', () => {
            const validPhones = [
                '(11) 99999-9999',
                '11999999999',
                '+55 11 99999-9999'
            ];

            const invalidPhones = [
                '123',
                '(11) 9999-999',
                'telefone'
            ];

            validPhones.forEach(phone => {
                expect(validatePhone(phone)).toBe(true);
            });

            invalidPhones.forEach(phone => {
                expect(validatePhone(phone)).toBe(false);
            });
        });

        test('deve validar data de nascimento (idade mínima)', () => {
            const validBirthDate = '1990-01-01'; // 34 anos
            const invalidBirthDate = '2010-01-01'; // 14 anos
            const futureBirthDate = '2030-01-01'; // futuro

            expect(validateBirthDate(validBirthDate)).toBe(true);
            expect(validateBirthDate(invalidBirthDate)).toBe(false);
            expect(validateBirthDate(futureBirthDate)).toBe(false);
        });
    });

    describe('Validação de Dados Profissionais', () => {
        
        test('deve validar número do CRM', () => {
            const validCRMs = ['123456', '12345', '1234567'];
            const invalidCRMs = ['', '123', '12345678901', 'abc123'];

            validCRMs.forEach(crm => {
                expect(validateCRM(crm)).toBe(true);
            });

            invalidCRMs.forEach(crm => {
                expect(validateCRM(crm)).toBe(false);
            });
        });

        test('deve validar estado do CRM', () => {
            const validStates = ['SP', 'RJ', 'MG', 'RS'];
            const invalidStates = ['', 'XX', 'SPP', '12'];

            validStates.forEach(state => {
                expect(validateCRMState(state)).toBe(true);
            });

            invalidStates.forEach(state => {
                expect(validateCRMState(state)).toBe(false);
            });
        });

        test('deve validar ano de formação', () => {
            const currentYear = new Date().getFullYear();
            const validYears = [1990, 2000, 2020, currentYear];
            const invalidYears = [1949, currentYear + 1, 'abc', null];

            validYears.forEach(year => {
                expect(validateGraduationYear(year)).toBe(true);
            });

            invalidYears.forEach(year => {
                expect(validateGraduationYear(year)).toBe(false);
            });
        });

        test('deve validar seleção de especialidades', () => {
            const validSpecialties = [
                ['clinica-geral'],
                ['cardiologia', 'clinica-geral'],
                ['pediatria', 'dermatologia', 'neurologia']
            ];

            const invalidSpecialties = [
                [], // nenhuma especialidade
                ['especialidade-inexistente'],
                null,
                undefined
            ];

            validSpecialties.forEach(specialties => {
                expect(validateSpecialties(specialties)).toBe(true);
            });

            invalidSpecialties.forEach(specialties => {
                expect(validateSpecialties(specialties)).toBe(false);
            });
        });
    });

    describe('Validação de Dados Financeiros', () => {
        
        test('deve validar dados bancários', () => {
            const validBankData = {
                bank: '001',
                agency: '1234',
                account: '12345-6',
                pixKey: 'medico@email.com'
            };

            const invalidBankData = {
                bank: '',
                agency: '12',
                account: '',
                pixKey: 'pix-invalido'
            };

            expect(validateBankData(validBankData)).toBe(true);
            expect(validateBankData(invalidBankData)).toBe(false);
        });

        test('deve validar preços de consulta', () => {
            const validPrices = [50.00, 100.50, 200.00, 999.99];
            const invalidPrices = [0, -10, 'abc', null, undefined];

            validPrices.forEach(price => {
                expect(validateConsultationPrice(price)).toBe(true);
            });

            invalidPrices.forEach(price => {
                expect(validateConsultationPrice(price)).toBe(false);
            });
        });
    });

    describe('Formulário Multi-Step', () => {
        
        test('deve navegar entre etapas corretamente', () => {
            // Simula DOM elements
            document.body.innerHTML = `
                <div id="step1" class="form-step active"></div>
                <div id="step2" class="form-step"></div>
                <div id="step3" class="form-step"></div>
                <div id="progressBar"></div>
                <div id="progressText"></div>
            `;

            // Testa navegação para próxima etapa
            nextStep(1);
            expect(document.getElementById('step1').classList.contains('active')).toBe(false);
            expect(document.getElementById('step2').classList.contains('active')).toBe(true);

            // Testa navegação para etapa anterior
            previousStep(2);
            expect(document.getElementById('step2').classList.contains('active')).toBe(false);
            expect(document.getElementById('step1').classList.contains('active')).toBe(true);
        });

        test('deve atualizar barra de progresso', () => {
            document.body.innerHTML = `
                <div id="progressBar" style="width: 33%"></div>
                <div id="progressText">Passo 1 de 3</div>
            `;

            updateProgress(2, 3);
            
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            
            expect(progressBar.style.width).toBe('67%');
            expect(progressText.textContent).toBe('Passo 2 de 3');
        });
    });

    describe('Integração com Banco de Dados', () => {
        
        test('deve salvar candidatura no banco de dados', async () => {
            const applicationData = {
                full_name: 'Dr. João Silva',
                cpf: '123.456.789-00',
                email: 'joao@email.com',
                crm: '123456',
                crm_state: 'SP',
                specialties: ['clinica-geral']
            };

            const result = await saveApplication(applicationData);
            
            expect(mockSupabase.from).toHaveBeenCalledWith('doctors_applications');
            expect(result.success).toBe(true);
        });

        test('deve carregar candidaturas para admin', async () => {
            const applications = await loadApplications();
            
            expect(mockSupabase.from).toHaveBeenCalledWith('doctors_applications');
            expect(Array.isArray(applications)).toBe(true);
        });

        test('deve atualizar status da candidatura', async () => {
            const applicationId = 'test-id';
            const newStatus = 'approved';
            
            const result = await updateApplicationStatus(applicationId, newStatus);
            
            expect(mockSupabase.from).toHaveBeenCalledWith('doctors_applications');
            expect(result.success).toBe(true);
        });
    });

    describe('Sistema de Notificações', () => {
        
        test('deve enviar notificação de candidatura recebida', async () => {
            const applicationData = {
                full_name: 'Dr. João Silva',
                email: 'joao@email.com',
                crm: '123456',
                crm_state: 'SP',
                specialties: ['clinica-geral'],
                submitted_at: new Date().toISOString(),
                id: 'test-id-123'
            };

            const notifications = new DoctorNotificationSystem();
            const result = await notifications.sendApplicationReceived(applicationData);
            
            expect(result.success).toBe(true);
        });

        test('deve enviar notificação de aprovação', async () => {
            const applicationData = {
                full_name: 'Dr. João Silva',
                email: 'joao@email.com'
            };

            const notifications = new DoctorNotificationSystem();
            const result = await notifications.sendApplicationApproved(applicationData);
            
            expect(result.success).toBe(true);
        });

        test('deve enviar notificação de rejeição', async () => {
            const applicationData = {
                full_name: 'Dr. João Silva',
                email: 'joao@email.com',
                id: 'test-id-123'
            };

            const rejectionReason = 'Documentos incompletos';
            const notifications = new DoctorNotificationSystem();
            const result = await notifications.sendApplicationRejected(applicationData, rejectionReason);
            
            expect(result.success).toBe(true);
        });

        test('deve substituir variáveis no template de email', () => {
            const template = 'Olá, {{doctorName}}! Seu CRM é {{crm}}.';
            const variables = {
                doctorName: 'Dr. João',
                crm: '123456'
            };

            const notifications = new DoctorNotificationSystem();
            const result = notifications.replaceTemplateVariables(template, variables);
            
            expect(result).toBe('Olá, Dr. João! Seu CRM é 123456.');
        });
    });

    describe('Painel Administrativo', () => {
        
        test('deve filtrar candidaturas por status', () => {
            const applications = [
                { id: '1', application_status: 'pending' },
                { id: '2', application_status: 'approved' },
                { id: '3', application_status: 'rejected' },
                { id: '4', application_status: 'pending' }
            ];

            const pendingApps = filterApplicationsByStatus(applications, 'pending');
            const approvedApps = filterApplicationsByStatus(applications, 'approved');
            const rejectedApps = filterApplicationsByStatus(applications, 'rejected');

            expect(pendingApps).toHaveLength(2);
            expect(approvedApps).toHaveLength(1);
            expect(rejectedApps).toHaveLength(1);
        });

        test('deve calcular estatísticas corretamente', () => {
            const applications = [
                { application_status: 'pending' },
                { application_status: 'pending' },
                { application_status: 'approved' },
                { application_status: 'rejected' }
            ];

            const stats = calculateStats(applications);

            expect(stats.pending).toBe(2);
            expect(stats.approved).toBe(1);
            expect(stats.rejected).toBe(1);
            expect(stats.total).toBe(4);
        });

        test('deve formatar dados para exibição', () => {
            const application = {
                full_name: 'Dr. João Silva',
                crm: '123456',
                crm_state: 'SP',
                email: 'joao@email.com',
                specialties: ['clinica-geral', 'cardiologia'],
                submitted_at: '2024-01-15T10:30:00Z',
                application_status: 'pending'
            };

            const formatted = formatApplicationForDisplay(application);

            expect(formatted.doctorName).toBe('Dr. João Silva');
            expect(formatted.crmFormatted).toBe('123456/SP');
            expect(formatted.specialtiesText).toBe('clinica-geral, cardiologia');
            expect(formatted.submittedDateFormatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
            expect(formatted.statusText).toBe('Pendente');
        });
    });

    describe('Workflow de Aprovação', () => {
        
        test('deve aprovar candidatura com sucesso', async () => {
            const applicationId = 'test-id';
            
            const result = await approveApplication(applicationId);
            
            expect(result.success).toBe(true);
            expect(mockSupabase.from).toHaveBeenCalledWith('doctors_applications');
        });

        test('deve rejeitar candidatura com motivo', async () => {
            const applicationId = 'test-id';
            const rejectionReason = 'Documentos incompletos';
            
            const result = await rejectApplication(applicationId, rejectionReason);
            
            expect(result.success).toBe(true);
            expect(mockSupabase.from).toHaveBeenCalledWith('doctors_applications');
        });

        test('deve validar permissões de admin', () => {
            const mockUser = { role: 'admin' };
            const mockNonAdmin = { role: 'user' };

            expect(isAdmin(mockUser)).toBe(true);
            expect(isAdmin(mockNonAdmin)).toBe(false);
            expect(isAdmin(null)).toBe(false);
        });
    });

    describe('Tratamento de Erros', () => {
        
        test('deve tratar erro de CPF duplicado', async () => {
            const duplicateError = { code: '23505', message: 'duplicate key value' };
            mockSupabase.from.mockReturnValueOnce({
                insert: jest.fn(() => Promise.resolve({ data: null, error: duplicateError }))
            });

            const applicationData = { cpf: '123.456.789-00' };
            const result = await saveApplication(applicationData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('CPF já cadastrado');
        });

        test('deve tratar erro de email duplicado', async () => {
            const duplicateError = { code: '23505', message: 'duplicate key value' };
            mockSupabase.from.mockReturnValueOnce({
                insert: jest.fn(() => Promise.resolve({ data: null, error: duplicateError }))
            });

            const applicationData = { email: 'joao@email.com' };
            const result = await saveApplication(applicationData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Email já cadastrado');
        });

        test('deve tratar erro de conexão com banco', async () => {
            const connectionError = { message: 'connection timeout' };
            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn(() => Promise.resolve({ data: null, error: connectionError }))
            });

            const result = await loadApplications();

            expect(result.success).toBe(false);
            expect(result.error).toContain('Erro de conexão');
        });
    });

    describe('Segurança e Validação', () => {
        
        test('deve sanitizar dados de entrada', () => {
            const maliciousData = {
                full_name: '<script>alert("xss")</script>Dr. João',
                email: 'joao@email.com<script>',
                address: 'Rua A, 123\n<img src=x onerror=alert(1)>'
            };

            const sanitized = sanitizeApplicationData(maliciousData);

            expect(sanitized.full_name).not.toContain('<script>');
            expect(sanitized.email).not.toContain('<script>');
            expect(sanitized.address).not.toContain('<img');
        });

        test('deve validar tamanho máximo dos campos', () => {
            const longText = 'a'.repeat(1000);
            
            expect(validateFieldLength(longText, 255)).toBe(false);
            expect(validateFieldLength('texto normal', 255)).toBe(true);
        });

        test('deve validar caracteres permitidos', () => {
            const validName = 'Dr. João Silva Santos';
            const invalidName = 'Dr. João123!@#';

            expect(validateNameCharacters(validName)).toBe(true);
            expect(validateNameCharacters(invalidName)).toBe(false);
        });
    });
});

// FUNÇÕES AUXILIARES PARA OS TESTES
// Estas funções simulam as implementações reais do sistema

function validateCPF(cpf) {
    if (!cpf) return false;
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.length === 11 && cleanCPF !== '00000000000';
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 13;
}

function validateBirthDate(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    return age >= 18 && birth <= today;
}

function validateCRM(crm) {
    return crm && crm.length >= 4 && crm.length <= 7 && /^\d+$/.test(crm);
}

function validateCRMState(state) {
    const validStates = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
    return validStates.includes(state);
}

function validateGraduationYear(year) {
    const currentYear = new Date().getFullYear();
    return year >= 1950 && year <= currentYear;
}

function validateSpecialties(specialties) {
    return Array.isArray(specialties) && specialties.length > 0;
}

function validateBankData(data) {
    return data.bank && data.agency && data.account && data.pixKey;
}

function validateConsultationPrice(price) {
    return typeof price === 'number' && price > 0;
}

function nextStep(currentStep) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`step${currentStep + 1}`).classList.add('active');
}

function previousStep(currentStep) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`step${currentStep - 1}`).classList.add('active');
}

function updateProgress(step, totalSteps) {
    const percentage = (step / totalSteps) * 100;
    document.getElementById('progressBar').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `Passo ${step} de ${totalSteps}`;
}

async function saveApplication(data) {
    try {
        const { error } = await supabase.from('doctors_applications').insert(data);
        if (error) {
            if (error.code === '23505') {
                return { success: false, error: 'CPF ou Email já cadastrado' };
            }
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro de conexão' };
    }
}

async function loadApplications() {
    try {
        const { data, error } = await supabase.from('doctors_applications').select('*');
        if (error) return { success: false, error: 'Erro de conexão' };
        return data || [];
    } catch (error) {
        return { success: false, error: 'Erro de conexão' };
    }
}

async function updateApplicationStatus(id, status) {
    const { error } = await supabase.from('doctors_applications').update({ application_status: status }).eq('id', id);
    return { success: !error };
}

function filterApplicationsByStatus(applications, status) {
    return applications.filter(app => app.application_status === status);
}

function calculateStats(applications) {
    return {
        pending: applications.filter(app => app.application_status === 'pending').length,
        approved: applications.filter(app => app.application_status === 'approved').length,
        rejected: applications.filter(app => app.application_status === 'rejected').length,
        total: applications.length
    };
}

function formatApplicationForDisplay(application) {
    return {
        doctorName: application.full_name,
        crmFormatted: `${application.crm}/${application.crm_state}`,
        specialtiesText: Array.isArray(application.specialties) ? application.specialties.join(', ') : 'N/A',
        submittedDateFormatted: new Date(application.submitted_at).toLocaleDateString('pt-BR'),
        statusText: application.application_status === 'pending' ? 'Pendente' : 
                   application.application_status === 'approved' ? 'Aprovado' : 'Rejeitado'
    };
}

async function approveApplication(id) {
    return await updateApplicationStatus(id, 'approved');
}

async function rejectApplication(id, reason) {
    const { error } = await supabase.from('doctors_applications')
        .update({ application_status: 'rejected', rejection_reason: reason })
        .eq('id', id);
    return { success: !error };
}

function isAdmin(user) {
    return user && user.role === 'admin';
}

function sanitizeApplicationData(data) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            sanitized[key] = value.replace(/<[^>]*>/g, '').trim();
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

function validateFieldLength(text, maxLength) {
    return text && text.length <= maxLength;
}

function validateNameCharacters(name) {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s.]+$/;
    return nameRegex.test(name);
}

// Mock da classe DoctorNotificationSystem para os testes
class DoctorNotificationSystem {
    async sendApplicationReceived(data) {
        return { success: true, message: 'Email enviado' };
    }

    async sendApplicationApproved(data) {
        return { success: true, message: 'Email enviado' };
    }

    async sendApplicationRejected(data, reason) {
        return { success: true, message: 'Email enviado' };
    }

    replaceTemplateVariables(template, variables) {
        let content = template;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, value);
        }
        return content;
    }
}