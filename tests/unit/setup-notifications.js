/**
 * Setup para Testes de Notificações Multi-Canal
 * Configurações globais e mocks para os testes da Tarefa 7
 */

// Mock do DOM completo
const mockDOM = () => {
    // Mock do document
    global.document = {
        getElementById: jest.fn(() => ({
            textContent: '',
            innerHTML: '',
            classList: {
                add: jest.fn(),
                remove: jest.fn(),
                contains: jest.fn()
            },
            style: {},
            appendChild: jest.fn(),
            removeChild: jest.fn(),
            querySelector: jest.fn(),
            querySelectorAll: jest.fn(() => []),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        })),
        createElement: jest.fn(() => ({
            id: '',
            className: '',
            innerHTML: '',
            textContent: '',
            style: {},
            appendChild: jest.fn(),
            addEventListener: jest.fn(),
            click: jest.fn()
        })),
        body: {
            appendChild: jest.fn(),
            removeChild: jest.fn(),
            insertAdjacentHTML: jest.fn(),
            style: {}
        },
        head: {
            appendChild: jest.fn()
        },
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    };

    // Mock do window
    global.window = {
        // Notification API
        Notification: jest.fn(() => ({
            close: jest.fn(),
            onclick: null,
            onshow: null,
            onclose: null,
            onerror: null
        })),
        
        // Audio Context API
        AudioContext: jest.fn(() => ({
            createOscillator: jest.fn(() => ({
                connect: jest.fn(),
                frequency: {
                    setValueAtTime: jest.fn()
                },
                type: 'sine',
                start: jest.fn(),
                stop: jest.fn()
            })),
            createGain: jest.fn(() => ({
                connect: jest.fn(),
                gain: {
                    setValueAtTime: jest.fn(),
                    exponentialRampToValueAtTime: jest.fn()
                }
            })),
            destination: {},
            currentTime: 0
        })),
        
        webkitAudioContext: jest.fn(),
        
        // Window methods
        focus: jest.fn(),
        alert: jest.fn(),
        confirm: jest.fn(() => true),
        
        // Location
        location: {
            origin: 'https://telemed.test.com',
            href: 'https://telemed.test.com/dashboard'
        },
        
        // Storage
        localStorage: {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        },
        
        sessionStorage: {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        }
    };

    // Mock do navigator
    global.navigator = {
        userAgent: 'Mozilla/5.0 (Test Browser)',
        language: 'pt-BR',
        languages: ['pt-BR', 'en-US'],
        onLine: true,
        permissions: {
            query: jest.fn(() => Promise.resolve({ state: 'granted' }))
        }
    };

    // Mock de APIs globais
    global.URL = {
        createObjectURL: jest.fn(() => 'blob:test-url-123'),
        revokeObjectURL: jest.fn()
    };

    global.Blob = jest.fn((content, options) => ({
        size: content ? content.length : 0,
        type: options?.type || 'text/plain'
    }));

    global.fetch = jest.fn(() => 
        Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ success: true }),
            text: () => Promise.resolve('OK')
        })
    );
};

// Mock de timers
const mockTimers = () => {
    global.setTimeout = jest.fn((fn, delay) => {
        if (typeof fn === 'function') {
            // Para testes síncronos, executar imediatamente
            fn();
        }
        return 123; // Mock timer ID
    });

    global.clearTimeout = jest.fn();
    
    global.setInterval = jest.fn((fn, delay) => {
        if (typeof fn === 'function') {
            // Para testes, não executar automaticamente
        }
        return 456; // Mock timer ID
    });

    global.clearInterval = jest.fn();
};

// Mock do console para capturar logs
const mockConsole = () => {
    global.console = {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        debug: jest.fn()
    };
};

// Utilitários de teste
global.testUtils = {
    // Criar dados de teste para consulta
    createMockAppointmentData: (overrides = {}) => ({
        id: 'test-appointment-123',
        specialty: 'Cardiologia',
        price: 89.90,
        queuePosition: 3,
        patientPhone: '+5511987654321',
        patientEmail: 'paciente@teste.com',
        patientName: 'João Silva',
        doctorName: 'Dr. Roberto Santos',
        estimatedWaitTime: 15,
        ...overrides
    }),

    // Criar dados de teste para médico
    createMockDoctorData: (overrides = {}) => ({
        name: 'Dr. João Silva',
        specialty: 'Cardiologia',
        crm: '12345-SP',
        ...overrides
    }),

    // Simular permissão de notificação
    mockNotificationPermission: (permission = 'granted') => {
        if (global.window.Notification) {
            Object.defineProperty(global.window.Notification, 'permission', {
                value: permission,
                writable: true,
                configurable: true
            });
            
            global.window.Notification.requestPermission = jest.fn(() => 
                Promise.resolve(permission)
            );
        }
    },

    // Simular erro de rede
    mockNetworkError: () => {
        global.fetch.mockRejectedValueOnce(new Error('Network Error'));
    },

    // Simular resposta de API
    mockApiResponse: (data, status = 200) => {
        global.fetch.mockResolvedValueOnce({
            ok: status >= 200 && status < 300,
            status,
            json: () => Promise.resolve(data),
            text: () => Promise.resolve(JSON.stringify(data))
        });
    },

    // Verificar se notificação foi enviada
    expectNotificationSent: (title, message) => {
        expect(global.window.Notification).toHaveBeenCalledWith(
            title,
            expect.objectContaining({
                body: message
            })
        );
    },

    // Verificar se som foi tocado
    expectSoundPlayed: () => {
        expect(global.window.AudioContext).toHaveBeenCalled();
    },

    // Verificar se log foi registrado
    expectLogMessage: (level, message) => {
        expect(global.console[level]).toHaveBeenCalledWith(
            expect.stringContaining(message)
        );
    }
};

// Configuração de matchers customizados
expect.extend({
    toHaveBeenCalledWithNotification(received, title, message) {
        const pass = received.mock.calls.some(call => 
            call[0] === title && 
            call[1] && 
            call[1].body === message
        );

        return {
            message: () => 
                pass 
                    ? `Expected not to have been called with notification "${title}": "${message}"`
                    : `Expected to have been called with notification "${title}": "${message}"`,
            pass
        };
    },

    toHaveValidEmailStructure(received) {
        const hasRequiredFields = received.to && received.subject && received.html;
        const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(received.to);
        const hasHtmlContent = received.html.includes('<div') && received.html.includes('TeleMed');

        const pass = hasRequiredFields && hasValidEmail && hasHtmlContent;

        return {
            message: () => 
                pass 
                    ? `Expected email structure to be invalid`
                    : `Expected email structure to be valid with to, subject, and html fields`,
            pass
        };
    },

    toHaveValidWhatsAppMessage(received) {
        const hasPhone = received.phone && received.phone.startsWith('+');
        const hasMessage = received.message && received.message.length > 0;
        const hasUrl = received.url && received.url.includes('whatsapp.com');

        const pass = hasPhone && hasMessage && hasUrl;

        return {
            message: () => 
                pass 
                    ? `Expected WhatsApp message to be invalid`
                    : `Expected WhatsApp message to have valid phone, message, and url`,
            pass
        };
    }
});

// Setup inicial
beforeEach(() => {
    mockDOM();
    mockTimers();
    mockConsole();
    
    // Reset de mocks
    jest.clearAllMocks();
    
    // Configuração padrão de permissões
    global.testUtils.mockNotificationPermission('granted');
});

// Cleanup após cada teste
afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
});

// Configuração global de timeout para testes assíncronos
jest.setTimeout(10000);

console.log('🧪 Setup de testes para notificações multi-canal carregado');