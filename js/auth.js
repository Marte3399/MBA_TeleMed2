// Elementos do DOM
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Alternar entre abas de login e cadastro
loginTab.addEventListener('click', () => {
    switchTab('login');
});

registerTab.addEventListener('click', () => {
    switchTab('register');
});

function switchTab(tab) {
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }
    hideMessages();
}

// Funções para exibir mensagens com animações
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.classList.add('show');
    successMessage.style.display = 'none';
    successMessage.classList.remove('show');
    
    // Adicionar shake animation ao formulário
    const activeForm = document.querySelector('.auth-form.active');
    activeForm.classList.add('shake');
    setTimeout(() => activeForm.classList.remove('shake'), 500);
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    successMessage.classList.add('show');
    errorMessage.style.display = 'none';
    errorMessage.classList.remove('show');
}

function hideMessages() {
    errorMessage.style.display = 'none';
    errorMessage.classList.remove('show');
    successMessage.style.display = 'none';
    successMessage.classList.remove('show');
}

// Função para mostrar loading no botão
function setButtonLoading(button, loading, originalText) {
    if (loading) {
        button.innerHTML = `<span class="spinner"></span>${originalText.replace('ar', 'ando...')}`;
        button.disabled = true;
        button.classList.add('loading');
    } else {
        button.innerHTML = originalText;
        button.disabled = false;
        button.classList.remove('loading');
    }
}

// Função para verificar força da senha
function getPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
}

// Verificar se usuário já está logado ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Auth page loaded');
    
    // TEMPORARIAMENTE DESABILITADO - Para permitir teste de cadastro/login
    // Permitindo que usuários já logados acessem a tela de auth para facilitar testes
    // O redirecionamento só acontece após login/cadastro bem-sucedido
    
    console.log('Auth page ready for login/register');
});

// Event listeners dos formulários
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);

// Event listener para indicador de força da senha
const registerPasswordInput = document.getElementById('registerPassword');
const passwordStrengthBar = document.getElementById('passwordStrengthBar');
const passwordHint = document.getElementById('passwordHint');

registerPasswordInput.addEventListener('input', (e) => {
    const password = e.target.value;
    const strength = getPasswordStrength(password);
    
    // Atualizar barra visual
    passwordStrengthBar.className = `password-strength-bar strength-${strength}`;
    
    // Atualizar dica
    if (password.length === 0) {
        passwordHint.textContent = 'Mínimo 6 caracteres com letras e números';
        passwordHint.className = 'text-gray-500 text-sm mt-1';
    } else if (strength === 'weak') {
        passwordHint.textContent = 'Senha fraca - adicione mais caracteres e números';
        passwordHint.className = 'text-red-500 text-sm mt-1';
    } else if (strength === 'medium') {
        passwordHint.textContent = 'Senha média - adicione caracteres especiais';
        passwordHint.className = 'text-yellow-500 text-sm mt-1';
    } else {
        passwordHint.textContent = 'Senha forte!';
        passwordHint.className = 'text-green-500 text-sm mt-1';
    }
});

// Adicionar validação em tempo real para outros campos
document.getElementById('registerEmail').addEventListener('input', (e) => {
    const email = e.target.value;
    if (email && !isValidEmail(email)) {
        e.target.style.borderColor = '#ef4444';
    } else if (email) {
        e.target.style.borderColor = '#10b981';
    } else {
        e.target.style.borderColor = '#e5e7eb';
    }
});

document.getElementById('registerName').addEventListener('input', (e) => {
    const name = e.target.value;
    if (name && !isValidName(name)) {
        e.target.style.borderColor = '#ef4444';
    } else if (name) {
        e.target.style.borderColor = '#10b981';
    } else {
        e.target.style.borderColor = '#e5e7eb';
    }
});

// Função para validar email
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
}

// Função para validar força da senha
function isValidPassword(password) {
    if (password.length < 6) return false;
    if (password.length > 128) return false;
    
    // Verificar se tem pelo menos uma letra e um número
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return hasLetter && hasNumber;
}

// Função para validar nome
function isValidName(name) {
    if (!name || name.length < 2) return false;
    if (name.length > 100) return false;
    
    // Permitir apenas letras, espaços, acentos e hífens
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    return nameRegex.test(name);
}

// Função para sanitizar input
function sanitizeInput(input) {
    if (!input) return '';
    
    return input
        .trim()
        .replace(/[<>'"&]/g, '') // Remove caracteres perigosos
        .replace(/\s+/g, ' '); // Normaliza espaços
}

// Função para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Rate limiting simples (client-side)
const rateLimiter = {
    attempts: {},
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    
    isBlocked(key) {
        const now = Date.now();
        const attempts = this.attempts[key] || [];
        
        // Limpar tentativas antigas
        const recentAttempts = attempts.filter(time => now - time < this.windowMs);
        this.attempts[key] = recentAttempts;
        
        return recentAttempts.length >= this.maxAttempts;
    },
    
    recordAttempt(key) {
        if (!this.attempts[key]) {
            this.attempts[key] = [];
        }
        this.attempts[key].push(Date.now());
    }
};

// Implementação do cadastro
async function handleRegister(e) {
    e.preventDefault();
    
    const name = sanitizeInput(document.getElementById('registerName').value);
    const email = sanitizeInput(document.getElementById('registerEmail').value);
    const password = document.getElementById('registerPassword').value;
    
    // Verificar rate limiting
    if (rateLimiter.isBlocked('register')) {
        showError('Muitas tentativas de cadastro. Tente novamente em 15 minutos.');
        return;
    }
    
    // Validações client-side
    if (!name || !email || !password) {
        showError('Todos os campos são obrigatórios');
        return;
    }
    
    if (!isValidName(name)) {
        showError('Nome deve ter entre 2 e 100 caracteres e conter apenas letras');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Por favor, insira um email válido');
        return;
    }
    
    if (!isValidPassword(password)) {
        showError('A senha deve ter pelo menos 6 caracteres, incluindo letras e números');
        return;
    }
    
    // Mostrar loading
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    setButtonLoading(submitButton, true, originalText);
    
    try {
        // Cadastrar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
        
        if (authError) {
            rateLimiter.recordAttempt('register');
            
            // Tratar diferentes tipos de erro
            if (authError.message.includes('already registered')) {
                showError('Este email já está cadastrado. Tente fazer login.');
            } else if (authError.message.includes('429') || authError.message.includes('Too Many Requests')) {
                showError('Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.');
            } else if (authError.message.includes('rate limit')) {
                showError('Limite de tentativas atingido. Aguarde 15 minutos e tente novamente.');
            } else {
                showError('Erro ao cadastrar: ' + authError.message);
            }
            return;
        }
        
        if (authData.user) {
            // Inserir dados adicionais na tabela users usando função
            const { data: profileData, error: profileError } = await supabase
                .rpc('create_user_profile', {
                    user_id: authData.user.id,
                    user_email: email,
                    user_name: name
                });
            
            if (profileError) {
                console.error('Erro ao criar perfil:', profileError);
                showError('Usuário criado, mas houve erro ao salvar o perfil. Tente fazer login.');
            } else {
                showSuccess('Cadastro realizado com sucesso! Redirecionando...');
                
                // Redirecionar após 2 segundos
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            }
        }
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
        showError('Erro interno. Tente novamente.');
    } finally {
        // Restaurar botão
        setButtonLoading(submitButton, false, originalText);
    }
}

// Implementação do login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = sanitizeInput(document.getElementById('loginEmail').value);
    const password = document.getElementById('loginPassword').value;
    
    // Verificar rate limiting
    if (rateLimiter.isBlocked('login')) {
        showError('Muitas tentativas de login. Tente novamente em 15 minutos.');
        return;
    }
    
    // Validações client-side
    if (!email || !password) {
        showError('Email e senha são obrigatórios');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Por favor, insira um email válido');
        return;
    }
    
    // Mostrar loading
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    setButtonLoading(submitButton, true, originalText);
    
    try {
        // Fazer login no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (authError) {
            rateLimiter.recordAttempt('login');
            
            // Tratar diferentes tipos de erro
            if (authError.message.includes('Invalid login credentials')) {
                showError('Email ou senha incorretos');
            } else if (authError.message.includes('429') || authError.message.includes('Too Many Requests')) {
                showError('Muitas tentativas de login. Aguarde alguns minutos e tente novamente.');
            } else if (authError.message.includes('rate limit')) {
                showError('Limite de tentativas atingido. Aguarde 15 minutos e tente novamente.');
            } else {
                showError('Erro ao fazer login: ' + authError.message);
            }
            return;
        }
        
        if (authData.user && authData.session) {
            showSuccess('Login realizado com sucesso! Redirecionando...');
            
            // Redirecionar após 1 segundo
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
        
    } catch (error) {
        console.error('Erro no login:', error);
        showError('Erro interno. Tente novamente.');
    } finally {
        // Restaurar botão
        setButtonLoading(submitButton, false, originalText);
    }
}


