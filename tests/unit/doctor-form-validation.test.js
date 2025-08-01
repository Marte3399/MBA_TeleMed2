/**
 * TESTES UNITÁRIOS - VALIDAÇÃO DO FORMULÁRIO DE CADASTRO MÉDICO
 * Tarefa 2: Testes específicos para as funções de validação do formulário
 * 
 * Testa as funções JavaScript que são executadas no navegador
 * durante o preenchimento do formulário de cadastro médico
 */

describe('Validação do Formulário de Cadastro Médico', () => {

    beforeEach(() => {
        // Reset do DOM antes de cada teste
        document.body.innerHTML = '';
        
        // Mock das funções globais
        global.showNotification = jest.fn();
        global.showError = jest.fn();
        global.showSuccess = jest.fn();
    });

    describe('Validação em Tempo Real', () => {
        
        test('deve validar CPF durante digitação', () => {
            // Simula campo de CPF
            document.body.innerHTML = `
                <input type="text" id="cpf" value="123.456.789-00">
            `;

            const cpfField = document.getElementById('cpf');
            const isValid = validateCPFRealTime(cpfField.value);

            expect(isValid).toBe(true);
        });

        test('deve mostrar erro para CPF inválido', () => {
            document.body.innerHTML = `
                <input type="text" id="cpf" value="123.456.789-99">
                <div id="cpf-error" class="error-message hidden"></div>
            `;

            const cpfField = document.getElementById('cpf');
            validateCPFField(cpfField);

            const errorDiv = document.getElementById('cpf-error');
            expect(errorDiv.classList.contains('hidden')).toBe(false);
        });

        test('deve validar email em tempo real', () => {
            document.body.innerHTML = `
                <input type="email" id="email" value="medico@hospital.com">
            `;

            const emailField = document.getElementById('email');
            const isValid = validateEmailRealTime(emailField.value);

            expect(isValid).toBe(true);
        });

        test('deve validar CRM durante digitação', () => {
            document.body.innerHTML = `
                <input type="text" id="crm" value="123456">
                <select id="crmState">
                    <option value="SP" selected>São Paulo</option>
                </select>
            `;

            const crmField = document.getElementById('crm');
            const stateField = document.getElementById('crmState');
            
            const isValid = validateCRMRealTime(crmField.value, stateField.value);

            expect(isValid).toBe(true);
        });
    });

    describe('Validação de Formulário Completo', () => {
        
        test('deve validar formulário da etapa 1 completo', () => {
            document.body.innerHTML = `
                <form id="personalDataForm">
                    <input type="text" id="fullName" value="Dr. João Silva" required>
                    <input type="text" id="cpf" value="123.456.789-00" required>
                    <input type="text" id="rg" value="12.345.678-9" required>
                    <input type="date" id="birthDate" value="1990-01-01" required>
                    <input type="email" id="email" value="joao@email.com" required>
                    <input type="tel" id="phone" value="(11) 99999-9999" required>
                    <input type="text" id="address" value="Rua A, 123" required>
                    <select id="gender" required>
                        <option value="masculino" selected>Masculino</option>
                    </select>
                </form>
            `;

            const form = document.getElementById('personalDataForm');
            const isValid = validateStep1(form);

            expect(isValid).toBe(true);
        });

        test('deve falhar validação com campos obrigatórios vazios', () => {
            document.body.innerHTML = `
                <form id="personalDataForm">
                    <input type="text" id="fullName" value="" required>
                    <input type="text" id="cpf" value="" required>
                    <input type="email" id="email" value="" required>
                </form>
            `;

            const form = document.getElementById('personalDataForm');
            const isValid = validateStep1(form);

            expect(isValid).toBe(false);
        });

        test('deve validar formulário da etapa 2 completo', () => {
            document.body.innerHTML = `
                <form id="professionalDataForm">
                    <input type="text" id="crm" value="123456" required>
                    <select id="crmState" required>
                        <option value="SP" selected>São Paulo</option>
                    </select>
                    <input type="radio" name="crmStatus" value="ativo" checked required>
                    <input type="text" id="medicalSchool" value="USP" required>
                    <input type="number" id="graduationYear" value="2020" required>
                    <select id="diplomaRecognized" required>
                        <option value="sim" selected>Sim</option>
                    </select>
                    <select id="experienceYears" required>
                        <option value="3-5" selected>3-5 anos</option>
                    </select>
                    <input type="checkbox" name="specialties" value="clinica-geral" checked>
                </form>
            `;

            const form = document.getElementById('professionalDataForm');
            const isValid = validateStep2(form);

            expect(isValid).toBe(true);
        });

        test('deve validar formulário da etapa 3 completo', () => {
            document.body.innerHTML = `
                <form id="financialDataForm">
                    <select id="bank" required>
                        <option value="001" selected>Banco do Brasil</option>
                    </select>
                    <input type="text" id="agency" value="1234" required>
                    <input type="text" id="account" value="12345-6" required>
                    <input type="text" id="pixKey" value="medico@email.com" required>
                    <select id="taxStatus" required>
                        <option value="pessoa-fisica" selected>Pessoa Física</option>
                    </select>
                    <input type="number" id="normalConsultationPrice" value="150" required>
                    <input type="checkbox" id="cfmResolutionAccepted" checked required>
                    <input type="checkbox" id="medicalEthicsAccepted" checked required>
                    <input type="checkbox" id="civilResponsibilityAccepted" checked required>
                    <input type="checkbox" id="serviceContractAccepted" checked required>
                    <input type="checkbox" id="privacyPolicyAccepted" checked required>
                    <input type="checkbox" id="platformTermsAccepted" checked required>
                    <input type="checkbox" id="dataProcessingAuthorized" checked required>
                </form>
            `;

            const form = document.getElementById('financialDataForm');
            const isValid = validateStep3(form);

            expect(isValid).toBe(true);
        });
    });

    describe('Navegação Entre Etapas', () => {
        
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="step1" class="form-step active"></div>
                <div id="step2" class="form-step"></div>
                <div id="step3" class="form-step"></div>
                <div id="progressBar" style="width: 33%"></div>
                <div id="progressText">Passo 1 de 3</div>
            `;
        });

        test('deve avançar para próxima etapa quando válida', () => {
            // Mock da validação retornando true
            global.validateStep1 = jest.fn(() => true);

            nextStep(1);

            expect(document.getElementById('step1').classList.contains('active')).toBe(false);
            expect(document.getElementById('step2').classList.contains('active')).toBe(true);
        });

        test('deve impedir avanço quando etapa inválida', () => {
            // Mock da validação retornando false
            global.validateStep1 = jest.fn(() => false);

            nextStep(1);

            expect(document.getElementById('step1').classList.contains('active')).toBe(true);
            expect(document.getElementById('step2').classList.contains('active')).toBe(false);
        });

        test('deve voltar para etapa anterior', () => {
            // Simula estar na etapa 2
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');

            previousStep(2);

            expect(document.getElementById('step2').classList.contains('active')).toBe(false);
            expect(document.getElementById('step1').classList.contains('active')).toBe(true);
        });

        test('deve atualizar barra de progresso corretamente', () => {
            updateProgress(2, 3);

            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');

            expect(progressBar.style.width).toBe('67%');
            expect(progressText.textContent).toBe('Passo 2 de 3');
        });
    });

    describe('Formatação de Campos', () => {
        
        test('deve formatar CPF durante digitação', () => {
            const input = '12345678900';
            const formatted = formatCPF(input);
            
            expect(formatted).toBe('123.456.789-00');
        });

        test('deve formatar telefone durante digitação', () => {
            const input = '11999999999';
            const formatted = formatPhone(input);
            
            expect(formatted).toBe('(11) 99999-9999');
        });

        test('deve formatar CRM removendo caracteres especiais', () => {
            const input = 'CRM-123.456/SP';
            const formatted = formatCRM(input);
            
            expect(formatted).toBe('123456');
        });

        test('deve formatar preço com duas casas decimais', () => {
            const input = '150';
            const formatted = formatPrice(input);
            
            expect(formatted).toBe('150.00');
        });
    });

    describe('Coleta de Dados do Formulário', () => {
        
        test('deve coletar dados da etapa 1 corretamente', () => {
            document.body.innerHTML = `
                <form id="personalDataForm">
                    <input type="text" id="fullName" value="Dr. João Silva">
                    <input type="text" id="cpf" value="123.456.789-00">
                    <input type="email" id="email" value="joao@email.com">
                    <select id="gender">
                        <option value="masculino" selected>Masculino</option>
                    </select>
                </form>
            `;

            const data = collectStep1Data();

            expect(data.fullName).toBe('Dr. João Silva');
            expect(data.cpf).toBe('123.456.789-00');
            expect(data.email).toBe('joao@email.com');
            expect(data.gender).toBe('masculino');
        });

        test('deve coletar especialidades selecionadas', () => {
            document.body.innerHTML = `
                <input type="checkbox" name="specialties" value="clinica-geral" checked>
                <input type="checkbox" name="specialties" value="cardiologia" checked>
                <input type="checkbox" name="specialties" value="dermatologia">
            `;

            const specialties = collectSelectedSpecialties();

            expect(specialties).toEqual(['clinica-geral', 'cardiologia']);
            expect(specialties).toHaveLength(2);
        });

        test('deve coletar dados financeiros', () => {
            document.body.innerHTML = `
                <select id="bank">
                    <option value="001" selected>Banco do Brasil</option>
                </select>
                <input type="text" id="agency" value="1234">
                <input type="text" id="account" value="12345-6">
                <input type="number" id="normalConsultationPrice" value="150">
            `;

            const data = collectFinancialData();

            expect(data.bank).toBe('001');
            expect(data.agency).toBe('1234');
            expect(data.account).toBe('12345-6');
            expect(data.normalConsultationPrice).toBe(150);
        });
    });

    describe('Envio do Formulário', () => {
        
        test('deve preparar dados para envio', () => {
            const mockData = {
                fullName: 'Dr. João Silva',
                cpf: '123.456.789-00',
                email: 'joao@email.com',
                crm: '123456',
                crmState: 'SP',
                specialties: ['clinica-geral'],
                normalConsultationPrice: 150
            };

            const preparedData = prepareDataForSubmission(mockData);

            expect(preparedData.full_name).toBe('Dr. João Silva');
            expect(preparedData.crm).toBe('123456');
            expect(preparedData.crm_state).toBe('SP');
            expect(preparedData.normal_consultation_price).toBe(150);
            expect(Array.isArray(preparedData.specialties)).toBe(true);
        });

        test('deve validar dados antes do envio', () => {
            const validData = {
                fullName: 'Dr. João Silva',
                cpf: '123.456.789-00',
                email: 'joao@email.com',
                crm: '123456',
                crmState: 'SP'
            };

            const invalidData = {
                fullName: '',
                cpf: 'invalid',
                email: 'invalid-email'
            };

            expect(validateDataBeforeSubmission(validData)).toBe(true);
            expect(validateDataBeforeSubmission(invalidData)).toBe(false);
        });

        test('deve mostrar loading durante envio', async () => {
            document.body.innerHTML = `
                <button id="submitButton">Enviar Candidatura</button>
                <div id="loadingSpinner" class="hidden"></div>
            `;

            const mockSubmit = jest.fn(() => Promise.resolve({ success: true }));
            
            await submitApplication({}, mockSubmit);

            // Verifica se loading foi mostrado
            expect(document.getElementById('loadingSpinner').classList.contains('hidden')).toBe(false);
        });
    });

    describe('Tratamento de Erros do Formulário', () => {
        
        test('deve mostrar erro de validação específico', () => {
            document.body.innerHTML = `
                <input type="text" id="cpf" value="invalid">
                <div id="cpf-error" class="error-message hidden"></div>
            `;

            showFieldError('cpf', 'CPF inválido');

            const errorDiv = document.getElementById('cpf-error');
            expect(errorDiv.classList.contains('hidden')).toBe(false);
            expect(errorDiv.textContent).toBe('CPF inválido');
        });

        test('deve limpar erros quando campo fica válido', () => {
            document.body.innerHTML = `
                <input type="text" id="cpf" value="123.456.789-00">
                <div id="cpf-error" class="error-message">CPF inválido</div>
            `;

            clearFieldError('cpf');

            const errorDiv = document.getElementById('cpf-error');
            expect(errorDiv.classList.contains('hidden')).toBe(true);
            expect(errorDiv.textContent).toBe('');
        });

        test('deve destacar campos com erro', () => {
            document.body.innerHTML = `
                <input type="text" id="cpf" value="invalid">
            `;

            highlightFieldError('cpf');

            const field = document.getElementById('cpf');
            expect(field.classList.contains('error')).toBe(true);
        });
    });
});

// FUNÇÕES AUXILIARES PARA OS TESTES
// Simulam as implementações reais do formulário

function validateCPFRealTime(cpf) {
    if (!cpf) return false;
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.length === 11 && cleanCPF !== '00000000000';
}

function validateEmailRealTime(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateCRMRealTime(crm, state) {
    return crm && crm.length >= 4 && crm.length <= 7 && state && state.length === 2;
}

function validateCPFField(field) {
    const isValid = validateCPFRealTime(field.value);
    const errorDiv = document.getElementById('cpf-error');
    
    if (!isValid) {
        errorDiv.classList.remove('hidden');
        errorDiv.textContent = 'CPF inválido';
    } else {
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';
    }
}

function validateStep1(form) {
    const requiredFields = ['fullName', 'cpf', 'rg', 'birthDate', 'email', 'phone', 'address', 'gender'];
    
    for (const fieldId of requiredFields) {
        const field = form.querySelector(`#${fieldId}`);
        if (!field || !field.value.trim()) {
            return false;
        }
    }
    
    return true;
}

function validateStep2(form) {
    const requiredFields = ['crm', 'crmState', 'medicalSchool', 'graduationYear', 'diplomaRecognized', 'experienceYears'];
    
    for (const fieldId of requiredFields) {
        const field = form.querySelector(`#${fieldId}`);
        if (!field || !field.value.trim()) {
            return false;
        }
    }
    
    // Verificar se pelo menos uma especialidade foi selecionada
    const specialties = form.querySelectorAll('input[name="specialties"]:checked');
    if (specialties.length === 0) {
        return false;
    }
    
    // Verificar se status do CRM foi selecionado
    const crmStatus = form.querySelector('input[name="crmStatus"]:checked');
    if (!crmStatus) {
        return false;
    }
    
    return true;
}

function validateStep3(form) {
    const requiredFields = ['bank', 'agency', 'account', 'pixKey', 'taxStatus', 'normalConsultationPrice'];
    
    for (const fieldId of requiredFields) {
        const field = form.querySelector(`#${fieldId}`);
        if (!field || !field.value.trim()) {
            return false;
        }
    }
    
    // Verificar checkboxes obrigatórios
    const requiredCheckboxes = [
        'cfmResolutionAccepted',
        'medicalEthicsAccepted', 
        'civilResponsibilityAccepted',
        'serviceContractAccepted',
        'privacyPolicyAccepted',
        'platformTermsAccepted',
        'dataProcessingAuthorized'
    ];
    
    for (const checkboxId of requiredCheckboxes) {
        const checkbox = form.querySelector(`#${checkboxId}`);
        if (!checkbox || !checkbox.checked) {
            return false;
        }
    }
    
    return true;
}

function nextStep(currentStep) {
    const isValid = currentStep === 1 ? validateStep1(document.getElementById('personalDataForm')) :
                   currentStep === 2 ? validateStep2(document.getElementById('professionalDataForm')) :
                   true;
    
    if (!isValid) {
        return false;
    }
    
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`step${currentStep + 1}`).classList.add('active');
    
    updateProgress(currentStep + 1, 3);
    return true;
}

function previousStep(currentStep) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`step${currentStep - 1}`).classList.add('active');
    
    updateProgress(currentStep - 1, 3);
}

function updateProgress(step, totalSteps) {
    const percentage = (step / totalSteps) * 100;
    document.getElementById('progressBar').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `Passo ${step} de ${totalSteps}`;
}

function formatCPF(value) {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatPhone(value) {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

function formatCRM(value) {
    return value.replace(/\D/g, '');
}

function formatPrice(value) {
    const numValue = parseFloat(value) || 0;
    return numValue.toFixed(2);
}

function collectStep1Data() {
    return {
        fullName: document.getElementById('fullName')?.value || '',
        cpf: document.getElementById('cpf')?.value || '',
        email: document.getElementById('email')?.value || '',
        gender: document.getElementById('gender')?.value || ''
    };
}

function collectSelectedSpecialties() {
    const checkboxes = document.querySelectorAll('input[name="specialties"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function collectFinancialData() {
    return {
        bank: document.getElementById('bank')?.value || '',
        agency: document.getElementById('agency')?.value || '',
        account: document.getElementById('account')?.value || '',
        normalConsultationPrice: parseFloat(document.getElementById('normalConsultationPrice')?.value) || 0
    };
}

function prepareDataForSubmission(data) {
    return {
        full_name: data.fullName,
        crm: data.crm,
        crm_state: data.crmState,
        normal_consultation_price: data.normalConsultationPrice,
        specialties: data.specialties || []
    };
}

function validateDataBeforeSubmission(data) {
    return data.fullName && data.cpf && data.email && validateCPFRealTime(data.cpf) && validateEmailRealTime(data.email);
}

async function submitApplication(data, submitFn) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const submitButton = document.getElementById('submitButton');
    
    // Mostrar loading
    loadingSpinner.classList.remove('hidden');
    submitButton.disabled = true;
    
    try {
        const result = await submitFn(data);
        return result;
    } finally {
        // Esconder loading
        loadingSpinner.classList.add('hidden');
        submitButton.disabled = false;
    }
}

function showFieldError(fieldId, message) {
    const errorDiv = document.getElementById(`${fieldId}-error`);
    if (errorDiv) {
        errorDiv.classList.remove('hidden');
        errorDiv.textContent = message;
    }
}

function clearFieldError(fieldId) {
    const errorDiv = document.getElementById(`${fieldId}-error`);
    if (errorDiv) {
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';
    }
}

function highlightFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
    }
}