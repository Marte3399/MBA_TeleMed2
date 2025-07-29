// TeleMed - Aplicação Principal JavaScript

/**
 * ESTADO GLOBAL DA APLICAÇÃO
 * Armazena todas as informações centrais da plataforma TeleMed
 */
window.TeleMed = {
    currentUser: null,           // Usuário atualmente logado (dados do perfil)
    currentSection: 'home',      // Seção atual da aplicação (home, specialties, appointments, etc.)
    isLoggedIn: false,          // Status de login do usuário
    config: {                   // Configurações gerais da aplicação
        apiUrl: 'http://localhost:3000/api',  // URL da API backend
        jitsiDomain: 'meet.jit.si',           // Domínio para videochamadas
        version: '1.0.0'                      // Versão da aplicação
    },
    cache: new Map(),           // Cache para armazenar dados temporários
    eventListeners: new Map()   // Mapa de event listeners registrados
};

/**
 * INICIALIZAÇÃO DA APLICAÇÃO
 * Executado quando o DOM está completamente carregado
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('🏥 TeleMed JavaScript Application Starting...');

    // Oculta a tela de carregamento após 1.5 segundos e mostra a tela de login
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('loginScreen').classList.remove('hidden');
    }, 1500);

    // Inicializa todos os componentes da aplicação
    initializeApp();

    // Verifica se existe uma sessão de usuário salva no localStorage
    checkStoredSession();

    console.log('✅ TeleMed Application Initialized');
});

/**
 * INICIALIZAR APLICAÇÃO
 * Função principal que coordena a inicialização de todos os módulos da aplicação
 */
function initializeApp() {
    // Inicializa todos os event listeners (cliques, teclado, etc.)
    initializeEventListeners();

    // Inicializa componentes da interface (navegação, modais, formulários)
    initializeComponents();

    // Carrega dados iniciais (especialidades, preferências do usuário)
    initializeData();

    // Inicia atualizações em tempo real (estatísticas, mensagens)
    startRealTimeUpdates();
}

/**
 * INICIALIZAR EVENT LISTENERS
 * Configura todos os ouvintes de eventos globais da aplicação
 */
function initializeEventListeners() {
    // Fecha modal quando clica fora dele (no overlay)
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal(e.target.id);
        }
    });

    // Atalhos de teclado globais
    document.addEventListener('keydown', function (e) {
        // Tecla ESC fecha todos os modais abertos
        if (e.key === 'Escape') {
            closeAllModals();
        }

        // Ctrl+Enter envia mensagem no chat (se o input estiver focado)
        if (e.ctrlKey && e.key === 'Enter') {
            if (document.getElementById('chatInput') === document.activeElement) {
                sendMessage();
            }
        }
    });

    // Manipula redimensionamento da janela (responsividade)
    window.addEventListener('resize', function () {
        handleWindowResize();
    });

    // Detecta quando a conexão com internet é restaurada
    window.addEventListener('online', function () {
        showNotification('Conexão restaurada', 'Você está online novamente', 'success');
    });

    // Detecta quando a conexão com internet é perdida
    window.addEventListener('offline', function () {
        showNotification('Sem conexão', 'Você está offline', 'warning');
    });
}

/**
 * INICIALIZAR COMPONENTES
 * Configura todos os componentes da interface do usuário
 */
function initializeComponents() {
    // Inicializa sistema de navegação entre seções
    initializeNavigation();

    // Configura comportamento dos modais (janelas popup)
    initializeModals();

    // Configura manipulação de formulários
    initializeForms();

    // Inicializa gráficos (se a biblioteca Chart.js estiver disponível)
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    }
}

/**
 * INICIALIZAR DADOS
 * Carrega todos os dados iniciais necessários para a aplicação
 */
function initializeData() {
    // Carrega dados das especialidades médicas disponíveis
    loadSpecialtiesData();

    // Carrega preferências salvas do usuário (tema, idioma, etc.)
    loadUserPreferences();

    // Atualiza estatísticas em tempo real (médicos online, consultas, etc.)
    updateRealTimeStats();
}

/**
 * INICIALIZAR NAVEGAÇÃO
 * Configura o sistema de navegação entre as diferentes seções da aplicação
 */
function initializeNavigation() {
    // Seleciona todos os links de navegação
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault(); // Previne comportamento padrão do link
            // Extrai o nome da seção do atributo href (remove o #)
            const section = this.getAttribute('href').substring(1);
            showSection(section); // Mostra a seção correspondente
        });
    });
}

/**
 * MOSTRAR SEÇÃO
 * Alterna entre as diferentes seções da aplicação (home, especialidades, consultas, dashboard)
 * @param {string} sectionName - Nome da seção a ser exibida
 */
function showSection(sectionName) {
    // Oculta todas as seções existentes adicionando a classe 'hidden'
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });

    // Mostra apenas a seção solicitada removendo a classe 'hidden'
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
        TeleMed.currentSection = sectionName; // Atualiza seção atual no estado global

        // Atualiza a navegação para destacar o link ativo
        updateNavigation(sectionName);

        // Inicializa funcionalidades específicas da seção
        initializeSection(sectionName);
    }
}

/**
 * ATUALIZAR NAVEGAÇÃO
 * Atualiza o estado visual da navegação para destacar a seção ativa
 * @param {string} activeSection - Nome da seção que deve ser destacada
 */
function updateNavigation(activeSection) {
    // Seleciona todos os links de navegação
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        // Remove classe 'active' de todos os links
        link.classList.remove('active');
        // Adiciona classe 'active' apenas ao link da seção atual
        if (link.getAttribute('href') === '#' + activeSection) {
            link.classList.add('active');
        }
    });
}

/**
 * INICIALIZAR SEÇÃO
 * Executa inicialização específica para cada seção da aplicação
 * @param {string} sectionName - Nome da seção a ser inicializada
 */
function initializeSection(sectionName) {
    switch (sectionName) {
        case 'home':
            initializeHomeSection();     // Inicializa seção inicial/home
            break;
        case 'specialties':
            initializeSpecialtiesSection(); // Inicializa seção de especialidades
            break;
        case 'appointments':
            initializeAppointmentsSection(); // Inicializa seção de consultas
            break;
        case 'dashboard':
            initializeDashboardSection();   // Inicializa dashboard/painel
            break;
    }
}

/**
 * INICIALIZAR SEÇÃO HOME
 * Configura a seção inicial com estatísticas e animações
 */
function initializeHomeSection() {
    updateRealTimeStats();  // Atualiza estatísticas em tempo real
    animateStatsCards();    // Anima os cards de estatísticas
}

/**
 * INICIALIZAR SEÇÃO DE ESPECIALIDADES
 * Configura a seção de especialidades médicas com busca
 */
function initializeSpecialtiesSection() {
    renderSpecialties();    // Renderiza cards das especialidades
    initializeSearch();     // Inicializa sistema de busca
}

/**
 * INICIALIZAR SEÇÃO DE CONSULTAS
 * Configura a seção de agendamentos e consultas
 */
function initializeAppointmentsSection() {
    showAppointmentTab('upcoming'); // Mostra aba de consultas próximas
    loadAppointments();             // Carrega dados das consultas
}

/**
 * INICIALIZAR SEÇÃO DO DASHBOARD
 * Configura o painel de controle com dados e gráficos
 */
function initializeDashboardSection() {
    updateDashboardData();    // Atualiza dados do dashboard
    renderDashboardCharts();  // Renderiza gráficos e estatísticas
}

/**
 * INICIALIZAR MODAIS
 * Configura comportamento dos modais (janelas popup) da aplicação
 */
function initializeModals() {
    // Seleciona todos os overlays de modal na página
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        // Adiciona evento de clique para fechar modal quando clica no overlay (fundo)
        modal.addEventListener('click', function (e) {
            // Só fecha se o clique foi diretamente no overlay, não nos elementos filhos
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

/**
 * FECHAR MODAL
 * Fecha um modal específico pelo seu ID
 * @param {string} modalId - ID do modal a ser fechado
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden'); // Adiciona classe 'hidden' para ocultar o modal
    }
}

/**
 * FECHAR TODOS OS MODAIS
 * Fecha todos os modais abertos na aplicação
 */
function closeAllModals() {
    // Seleciona todos os overlays de modal
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.classList.add('hidden'); // Oculta cada modal encontrado
    });
}

/**
 * INICIALIZAR FORMULÁRIOS
 * Configura manipulação de todos os formulários da aplicação
 */
function initializeForms() {
    // Seleciona todos os formulários da página
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Adiciona event listener para interceptar envio do formulário
        form.addEventListener('submit', function (e) {
            e.preventDefault(); // Previne envio padrão do formulário
            handleFormSubmit(this); // Chama função personalizada de tratamento
        });
    });
}

/**
 * MANIPULAR ENVIO DE FORMULÁRIO
 * Processa dados do formulário e direciona para função específica
 * @param {HTMLFormElement} form - Elemento do formulário enviado
 */
function handleFormSubmit(form) {
    // Extrai dados do formulário usando FormData API
    const formData = new FormData(form);
    const data = Object.fromEntries(formData); // Converte para objeto JavaScript

    console.log('Form submitted:', data);

    // Direciona para função específica baseada no ID do formulário
    switch (form.id) {
        case 'loginForm':
            handleLogin(data);              // Processa login do usuário
            break;
        case 'appointmentForm':
            handleAppointmentBooking(data); // Processa agendamento de consulta
            break;
        default:
            console.warn('Unhandled form:', form.id); // Avisa sobre formulário não tratado
    }
}

/**
 * INICIAR ATUALIZAÇÕES EM TEMPO REAL
 * Configura timers para atualizar dados automaticamente em intervalos regulares
 */
function startRealTimeUpdates() {
    // Atualiza estatísticas a cada 30 segundos
    setInterval(updateRealTimeStats, 30000);

    // Atualiza consultas a cada 5 minutos
    setInterval(updateAppointments, 300000);

    // Verifica novas mensagens a cada 10 segundos
    setInterval(checkNewMessages, 10000);
}

/**
 * ATUALIZAR ESTATÍSTICAS EM TEMPO REAL
 * Gera e exibe estatísticas simuladas da plataforma (médicos online, consultas, etc.)
 */
function updateRealTimeStats() {
    // Gera estatísticas simuladas com valores aleatórios dentro de faixas realistas
    const stats = {
        doctorsOnline: Math.floor(Math.random() * 20) + 40,        // 40-60 médicos online
        consultationsToday: Math.floor(Math.random() * 50) + 200,  // 200-250 consultas hoje
        patientsServed: Math.floor(Math.random() * 1000) + 12000   // 12.000-13.000 pacientes atendidos
    };

    // Busca elementos HTML onde as estatísticas serão exibidas
    const doctorsEl = document.getElementById('doctorsOnline');
    const consultationsEl = document.getElementById('consultationsToday');
    const patientsEl = document.getElementById('patientsServed');

    // Atualiza cada estatística com animação de contador
    if (doctorsEl) {
        animateCounter(doctorsEl, stats.doctorsOnline);
    }

    if (consultationsEl) {
        animateCounter(consultationsEl, stats.consultationsToday);
    }

    if (patientsEl) {
        animateCounter(patientsEl, stats.patientsServed, 'k'); // 'k' para formato 12.5k
    }
}

/**
 * ANIMAR CONTADOR
 * Cria animação suave de incremento numérico para estatísticas
 * @param {HTMLElement} element - Elemento HTML que exibirá o contador
 * @param {number} target - Valor final que o contador deve atingir
 * @param {string} suffix - Sufixo opcional (ex: 'k' para milhares)
 */
function animateCounter(element, target, suffix = '') {
    const start = parseInt(element.textContent) || 0; // Valor inicial (atual do elemento)
    const increment = (target - start) / 30; // Incremento por frame (30 frames total)
    let current = start; // Valor atual durante a animação

    // Timer que executa a animação a cada 50ms
    const timer = setInterval(() => {
        current += increment; // Incrementa o valor atual

        // Para a animação quando atinge o valor alvo
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }

        let displayValue = Math.floor(current); // Arredonda para baixo

        // Formata valores grandes com sufixo 'k' (ex: 12.5k)
        if (suffix === 'k' && displayValue >= 1000) {
            displayValue = (displayValue / 1000).toFixed(1) + 'k';
        }

        element.textContent = displayValue; // Atualiza o texto do elemento
    }, 50); // Executa a cada 50 milissegundos
}

/**
 * ANIMAR CARDS DE ESTATÍSTICAS
 * Aplica animação de entrada escalonada aos cards de estatísticas
 */
function animateStatsCards() {
    // Seleciona todos os cards com gradiente (cards de estatísticas)
    const cards = document.querySelectorAll('.bg-gradient-to-r');
    cards.forEach((card, index) => {
        // Aplica delay baseado no índice para criar efeito escalonado
        setTimeout(() => {
            // Define estado inicial da animação (invisível e deslocado)
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s ease-out';

            // Após pequeno delay, anima para estado final (visível e posição normal)
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100); // Delay de 100ms entre cada card
    });
}

/**
 * INICIALIZAR BUSCA
 * Configura o sistema de busca para especialidades médicas
 */
function initializeSearch() {
    // Busca o campo de input de pesquisa na página
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Adiciona listener para detectar digitação em tempo real
        searchInput.addEventListener('input', function (e) {
            const query = e.target.value.toLowerCase(); // Converte para minúsculas
            filterSpecialties(query); // Filtra especialidades baseado na busca
        });
    }
}

/**
 * FILTRAR ESPECIALIDADES
 * Filtra cards de especialidades baseado no termo de busca
 * @param {string} query - Termo de busca digitado pelo usuário
 */
function filterSpecialties(query) {
    // Seleciona todos os cards de especialidades na página
    const specialtyCards = document.querySelectorAll('.specialty-card');

    specialtyCards.forEach(card => {
        // Extrai nome e descrição dos atributos data do card
        const name = card.dataset.name?.toLowerCase() || '';
        const description = card.dataset.description?.toLowerCase() || '';

        // Verifica se o termo de busca está presente no nome ou descrição
        if (name.includes(query) || description.includes(query)) {
            card.style.display = 'block'; // Mostra o card
            card.classList.add('animate-fade-in'); // Adiciona animação de entrada
        } else {
            card.style.display = 'none'; // Oculta o card
        }
    });
}

/**
 * CARREGAR PREFERÊNCIAS DO USUÁRIO
 * Recupera preferências salvas do usuário no localStorage (tema, idioma, etc.)
 */
function loadUserPreferences() {
    // Tenta recuperar preferências salvas do localStorage
    const preferences = localStorage.getItem('telemed-preferences');
    if (preferences) {
        try {
            // Converte JSON de volta para objeto JavaScript
            const prefs = JSON.parse(preferences);
            TeleMed.preferences = prefs; // Armazena no estado global
            applyUserPreferences(prefs); // Aplica as preferências carregadas
        } catch (e) {
            // Se houver erro na conversão, registra no console
            console.error('Error loading preferences:', e);
        }
    }
}

/**
 * APLICAR PREFERÊNCIAS DO USUÁRIO
 * Aplica as preferências carregadas à interface da aplicação
 * @param {Object} preferences - Objeto com as preferências do usuário
 */
function applyUserPreferences(preferences) {
    // Aplica tema personalizado se definido
    if (preferences.theme) {
        document.body.classList.add(preferences.theme);
    }

    // Aplica configurações de idioma se definidas
    if (preferences.language) {
        // Futura implementação de mudança de idioma
        console.log('Language preference:', preferences.language);
    }
}

/**
 * SALVAR PREFERÊNCIAS DO USUÁRIO
 * Salva preferências do usuário no localStorage para persistência
 * @param {Object} preferences - Novas preferências a serem salvas
 */
function saveUserPreferences(preferences) {
    // Mescla preferências existentes com as novas
    TeleMed.preferences = { ...TeleMed.preferences, ...preferences };
    // Salva no localStorage como JSON
    localStorage.setItem('telemed-preferences', JSON.stringify(TeleMed.preferences));
}

/**
 * VERIFICAR SESSÃO ARMAZENADA
 * Verifica se existe uma sessão de usuário salva no localStorage e faz login automático
 */
function checkStoredSession() {
    // Busca dados do usuário salvos no localStorage
    const storedUser = localStorage.getItem('telemed-user');
    if (storedUser) {
        try {
            // Converte JSON de volta para objeto JavaScript
            const user = JSON.parse(storedUser);
            if (user && user.name) {
                // Faz login automático com a sessão salva após 2 segundos
                setTimeout(() => {
                    loginUser(user.name, user.email, user.role);
                }, 2000);
            }
        } catch (e) {
            // Se houver erro na conversão, remove dados corrompidos
            console.error('Error loading stored session:', e);
            localStorage.removeItem('telemed-user');
        }
    }
}

/**
 * INICIALIZAR GRÁFICOS
 * Prepara sistema de gráficos (configurações serão tratadas pelo dashboard.js)
 */
function initializeCharts() {
    // As configurações dos gráficos serão tratadas pelo dashboard.js
    console.log('Charts initialized');
}

/**
 * MANIPULAR REDIMENSIONAMENTO DA JANELA
 * Ajusta a interface para diferentes tamanhos de tela (responsividade)
 */
function handleWindowResize() {
    // Obtém largura atual da janela para ajustes responsivos
    const width = window.innerWidth;

    if (width < 768) {
        // Ajustes para dispositivos móveis (largura menor que 768px)
        document.body.classList.add('mobile-view');
    } else {
        // Remove ajustes móveis para telas maiores
        document.body.classList.remove('mobile-view');
    }

    // Redimensiona gráficos se existirem (para manter proporções corretas)
    if (window.dashboardCharts) {
        Object.values(window.dashboardCharts).forEach(chart => {
            if (chart.resize) {
                chart.resize(); // Chama função de redimensionamento do Chart.js
            }
        });
    }
}

/**
 * ATUALIZAR CONSULTAS
 * Recarrega dados das consultas se o usuário estiver na seção de appointments
 */
function updateAppointments() {
    // Só atualiza se o usuário estiver visualizando a seção de consultas
    if (TeleMed.currentSection === 'appointments') {
        loadAppointments(); // Recarrega dados das consultas
    }
}

/**
 * VERIFICAR NOVAS MENSAGENS
 * Simula verificação de novas mensagens e exibe notificações aleatórias
 */
function checkNewMessages() {
    // Simula verificação de novas mensagens (10% de chance a cada verificação)
    if (Math.random() < 0.1) { // 10% de chance de nova mensagem
        // Array com mensagens simuladas que podem aparecer
        const messages = [
            'Dr. Santos está online',
            'Sua consulta foi confirmada',
            'Novo resultado de exame disponível',
            'Lembrete: consulta em 30 minutos'
        ];

        // Seleciona uma mensagem aleatória do array
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        // Exibe notificação com a mensagem selecionada
        showNotification('Nova mensagem', randomMessage, 'info');
    }
}

/**
 * FUNÇÕES UTILITÁRIAS
 * Conjunto de funções auxiliares para formatação e manipulação de dados
 */

/**
 * FORMATAR DATA
 * Converte uma data para o formato brasileiro (DD/MM/AAAA)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada no padrão brasileiro
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',    // Dia com 2 dígitos (01, 02, etc.)
        month: '2-digit',  // Mês com 2 dígitos (01, 02, etc.)
        year: 'numeric'    // Ano com 4 dígitos (2024)
    });
}

/**
 * FORMATAR HORA
 * Converte uma data para o formato de hora brasileiro (HH:MM)
 * @param {Date|string} date - Data/hora a ser formatada
 * @returns {string} Hora formatada no padrão brasileiro
 */
function formatTime(date) {
    return new Date(date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',   // Hora com 2 dígitos (01, 02, etc.)
        minute: '2-digit'  // Minuto com 2 dígitos (01, 02, etc.)
    });
}

/**
 * FORMATAR MOEDA
 * Converte um valor numérico para formato de moeda brasileira (R$ 0,00)
 * @param {number} amount - Valor a ser formatado
 * @returns {string} Valor formatado como moeda brasileira
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency', // Formato de moeda
        currency: 'BRL'    // Real brasileiro
    }).format(amount);
}

/**
 * GERAR ID ÚNICO
 * Cria um identificador único combinando timestamp e string aleatória
 * @returns {string} ID único gerado
 */
function generateId() {
    // Combina timestamp atual (base 36) com string aleatória para garantir unicidade
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * FUNÇÃO DEBOUNCE
 * Limita a execução de uma função para evitar chamadas excessivas
 * @param {Function} func - Função a ser executada com debounce
 * @param {number} wait - Tempo de espera em milissegundos
 * @returns {Function} Função com debounce aplicado
 */
function debounce(func, wait) {
    let timeout; // Timer para controlar o delay
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout); // Limpa timer anterior
            func(...args);         // Executa função com argumentos originais
        };
        clearTimeout(timeout);     // Cancela execução anterior se houver
        timeout = setTimeout(later, wait); // Agenda nova execução
    };
}

/**
 * FUNÇÃO THROTTLE
 * Limita a frequência de execução de uma função a um intervalo específico
 * @param {Function} func - Função a ser executada com throttle
 * @param {number} limit - Intervalo mínimo entre execuções em milissegundos
 * @returns {Function} Função com throttle aplicado
 */
function throttle(func, limit) {
    let inThrottle; // Flag para controlar se está no período de throttle
    return function () {
        const args = arguments;    // Argumentos da função
        const context = this;      // Contexto de execução
        if (!inThrottle) {
            func.apply(context, args);  // Executa função imediatamente
            inThrottle = true;          // Ativa período de throttle
            setTimeout(() => inThrottle = false, limit); // Desativa após o limite
        }
    };
}

/**
 * TRATAMENTO DE ERROS GLOBAIS
 * Captura erros JavaScript não tratados e exibe notificação ao usuário
 */
window.addEventListener('error', function (e) {
    console.error('JavaScript Error:', e.error);
    showNotification('Erro', 'Ocorreu um erro na aplicação', 'error');
});

/**
 * TRATAMENTO DE PROMISES REJEITADAS
 * Captura promises rejeitadas não tratadas e exibe notificação de erro de conexão
 */
window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    showNotification('Erro', 'Erro de conexão', 'error');
});

/**
 * EXPORTAÇÃO DE FUNÇÕES GLOBAIS
 * Disponibiliza funções principais no objeto global TeleMed para uso em outros módulos
 */
window.TeleMed.showSection = showSection;           // Função para alternar seções
window.TeleMed.closeModal = closeModal;             // Função para fechar modal específico
window.TeleMed.closeAllModals = closeAllModals;     // Função para fechar todos os modais
window.TeleMed.formatDate = formatDate;             // Função de formatação de data
window.TeleMed.formatTime = formatTime;             // Função de formatação de hora
window.TeleMed.formatCurrency = formatCurrency;     // Função de formatação de moeda
window.TeleMed.generateId = generateId;             // Função para gerar IDs únicos
window.TeleMed.debounce = debounce;                 // Função utilitária debounce
window.TeleMed.throttle = throttle;                 // Função utilitária throttle

console.log('✅ TeleMed Core Application Loaded');

// Carregar as animações avançadas
document.addEventListener('DOMContentLoaded', function() {
    // Suas inicializações existentes...
    
    // Nova linha para carregar animações
    if (typeof AdvancedAnimations !== 'undefined') {
        window.advancedAnimations = new AdvancedAnimations();
    }
});