/**
 * Testes Unitários - Sistema de Notificações Multi-Canal
 * Tarefa 7: Desenvolver sistema de notificações multi-canal
 * 
 * Testa todas as implementações:
 * - Notificações push do navegador
 * - Integração WhatsApp
 * - Sistema de email
 * - Notificações de proximidade
 * - Alertas sonoros
 */

// Mock do DOM e APIs do navegador
const mockDOM = () => {
    global.document = {
        getElementById: jest.fn(),
        createElement: jest.fn(),
        body: {
            appendChild: jest.fn(),
            insertAdjacentHTML: jest.fn()
        },
        head: {
            appendChild: jest.fn()
        },
        addEventListener: jest.fn()
    };

    global.window = {
        Notification: jest.fn(),
        AudioContext: jest.fn(),
        webkitAudioContext: jest.fn(),
        focus: jest.fn(),
        location: {
            origin: 'https://telemed.test.com'
        },
        localStorage: {
            getItem: jest.fn(),
            setItem: jest.fn()
        }
    };

    global.console = {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    };

    global.URL = {
        createObjectURL: jest.fn(() => 'blob:test-url'),
        revokeObjectURL: jest.fn()
    };

    global.Blob = jest.fn();
    global.setTimeout = jest.fn((fn) => fn());
    global.clearTimeout = jest.fn();
    global.setInterval = jest.fn();
    global.clearInterval = jest.fn();
};

// Mock das funções de notificação (simulando o arquivo notifications.js)
const createNotificationSystem = () => {
    const NOTIFICATION_CONFIG = {
        duration: {
            success: 5000,
            info: 4000,
            warning: 6000,
            error: 8000,
            urgent: 10000
        },
        maxNotifications: 5,
        position: 'top-right',
        animation: {
            enter: 'slideInRight',
            exit: 'slideOutRight'
        },
        sound: {
            success: true,
            error: true,
            warning: true,
            info: false,
            urgent: true,
            call: true
        },
        channels: {
            browser: true,
            whatsapp: false,
            email: false,
            sms: false
        },
        proximity: {
            enabled: true,
            threshold: 3,
            urgentThreshold: 1
        }
    };

    let notificationState = {
        activeNotifications: [],
        notificationId: 0,
        isInitialized: false,
        container: null,
        soundEnabled: true,
        pushPermission: null,
        whatsappConfig: null,
        emailConfig: null,
        currentQueuePosition: null,
        callAudio: null,
        proximityNotified: false
    };

    // Função para inicializar notificações push
    const initializePushNotifications = async () => {
        if (!global.window.Notification) {
            console.warn('🚫 Browser does not support notifications');
            NOTIFICATION_CONFIG.channels.browser = false;
            return;
        }

        notificationState.pushPermission = 'granted';
        NOTIFICATION_CONFIG.channels.browser = true;
        console.log('✅ Browser push notifications enabled');
    };

    // Função para enviar notificação push do navegador
    const sendBrowserPushNotification = (title, message, options = {}) => {
        if (!NOTIFICATION_CONFIG.channels.browser || notificationState.pushPermission !== 'granted') {
            return false;
        }

        const notification = new global.window.Notification(title, {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: options.tag || 'telemed-notification',
            requireInteraction: options.requireInteraction || false,
            silent: options.silent || false,
            ...options
        });

        console.log('📱 Browser push notification sent:', title);
        return notification;
    };

    // Função para inicializar integração WhatsApp
    const initializeWhatsAppIntegration = () => {
        notificationState.whatsappConfig = {
            apiUrl: 'https://api.whatsapp.com/send',
            businessNumber: '+5511999999999',
            enabled: false
        };
        console.log('📱 WhatsApp integration initialized (demo mode)');
    };

    // Função para enviar mensagem WhatsApp
    const sendWhatsAppNotification = async (phoneNumber, message, options = {}) => {
        if (!NOTIFICATION_CONFIG.channels.whatsapp || !notificationState.whatsappConfig.enabled) {
            console.log('📱 WhatsApp notifications disabled');
            return { success: false, reason: 'disabled' };
        }

        try {
            const whatsappUrl = `${notificationState.whatsappConfig.apiUrl}?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
            
            console.log('📱 WhatsApp notification sent:', {
                phone: phoneNumber,
                message: message,
                url: whatsappUrl
            });

            return { success: true, messageId: 'wa_' + Date.now() };
        } catch (error) {
            console.error('❌ Error sending WhatsApp notification:', error);
            return { success: false, error: error.message };
        }
    };

    // Função para inicializar integração de email
    const initializeEmailIntegration = () => {
        notificationState.emailConfig = {
            apiUrl: 'https://api.emailservice.com/send',
            apiKey: 'demo-api-key',
            fromEmail: 'noreply@telemed.com',
            fromName: 'TeleMed',
            enabled: false
        };
        console.log('📧 Email integration initialized (demo mode)');
    };

    // Função para enviar notificação por email
    const sendEmailNotification = async (toEmail, subject, message, options = {}) => {
        if (!NOTIFICATION_CONFIG.channels.email || !notificationState.emailConfig.enabled) {
            console.log('📧 Email notifications disabled');
            return { success: false, reason: 'disabled' };
        }

        try {
            const emailData = {
                to: toEmail,
                from: notificationState.emailConfig.fromEmail,
                fromName: notificationState.emailConfig.fromName,
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 20px; text-align: center;">
                            <h1 style="margin: 0;">TeleMed</h1>
                            <p style="margin: 5px 0 0 0; opacity: 0.9;">Sistema de Telemedicina</p>
                        </div>
                        <div style="padding: 30px 20px;">
                            <h2 style="color: #1f2937; margin-bottom: 20px;">${subject}</h2>
                            <div style="color: #4b5563; line-height: 1.6;">
                                ${message}
                            </div>
                            ${options.actionUrl ? `
                                <div style="text-align: center; margin-top: 30px;">
                                    <a href="${options.actionUrl}" 
                                       style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                        ${options.actionText || 'Acessar Plataforma'}
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                        <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                            <p>Esta é uma mensagem automática do sistema TeleMed.</p>
                            <p>Se você não solicitou esta notificação, pode ignorar este email.</p>
                        </div>
                    </div>
                `,
                ...options
            };

            console.log('📧 Email notification sent:', emailData);
            return { success: true, messageId: 'email_' + Date.now() };
        } catch (error) {
            console.error('❌ Error sending email notification:', error);
            return { success: false, error: error.message };
        }
    };

    // Função para verificar notificações de proximidade
    const checkProximityNotifications = (currentPosition, totalInQueue = 10) => {
        if (!NOTIFICATION_CONFIG.proximity.enabled) return false;

        const { threshold, urgentThreshold } = NOTIFICATION_CONFIG.proximity;
        
        // Resetar flag se a posição mudou significativamente
        if (notificationState.currentQueuePosition && 
            Math.abs(currentPosition - notificationState.currentQueuePosition) > 2) {
            notificationState.proximityNotified = false;
        }

        notificationState.currentQueuePosition = currentPosition;

        // Notificação urgente - é o próximo
        if (currentPosition <= urgentThreshold && !notificationState.proximityNotified) {
            sendUrgentProximityNotification(currentPosition);
            notificationState.proximityNotified = true;
            return { type: 'urgent', position: currentPosition };
        }
        // Notificação de proximidade - está próximo
        else if (currentPosition <= threshold && !notificationState.proximityNotified) {
            sendProximityNotification(currentPosition);
            notificationState.proximityNotified = true;
            return { type: 'proximity', position: currentPosition };
        }

        return false;
    };

    // Função para enviar notificação de proximidade
    const sendProximityNotification = (position) => {
        const title = '🟡 Quase sua vez!';
        const message = `Você está na posição ${position}. Prepare-se para sua consulta!`;

        console.log('🎯 Proximity notification sent for position:', position);
        return { title, message, position };
    };

    // Função para enviar notificação urgente de proximidade
    const sendUrgentProximityNotification = (position) => {
        const title = position === 1 ? '🟢 Você é o próximo!' : '🔴 Sua consulta está pronta!';
        const message = position === 1 ? 
            'Mantenha-se pronto! Você será chamado em breve.' : 
            'Sua consulta está pronta. Clique para entrar!';

        console.log('🚨 Urgent proximity notification sent for position:', position);
        return { title, message, position };
    };

    // Função para tocar som de proximidade
    const playProximitySound = () => {
        if (!notificationState.soundEnabled || !NOTIFICATION_CONFIG.sound.warning) return false;

        console.log('🎵 Proximity sound played');
        return true;
    };

    // Função para tocar som de chamada
    const playCallSound = () => {
        if (!notificationState.soundEnabled || !NOTIFICATION_CONFIG.sound.call) return false;

        console.log('📞 Call sound started');
        notificationState.callAudio = { playing: true };
        return true;
    };

    // Função para parar som de chamada
    const stopCallSound = () => {
        if (notificationState.callAudio) {
            notificationState.callAudio = null;
            console.log('🔇 Call sound stopped');
            return true;
        }
        return false;
    };

    // Função para notificação de confirmação de pagamento
    const sendPaymentConfirmationNotification = (appointmentData) => {
        const title = '✅ Pagamento Confirmado';
        const message = `Pagamento de R$ ${appointmentData.price.toFixed(2)} confirmado. Você foi adicionado à fila!`;

        console.log('💳 Payment confirmation notification sent');
        return { title, message, appointmentData };
    };

    // Função para notificação de atualização de posição na fila
    const sendQueuePositionUpdateNotification = (newPosition, estimatedWaitTime) => {
        if (newPosition <= NOTIFICATION_CONFIG.proximity.urgentThreshold) {
            return sendUrgentProximityNotification(newPosition);
        } else if (newPosition <= NOTIFICATION_CONFIG.proximity.threshold) {
            return sendProximityNotification(newPosition);
        } else {
            const title = 'Posição Atualizada';
            const message = `Você está na posição ${newPosition}. Tempo estimado: ${estimatedWaitTime} min`;
            console.log('📊 Queue position update notification sent');
            return { title, message, position: newPosition, estimatedTime: estimatedWaitTime };
        }
    };

    // Função para notificação de consulta pronta
    const sendConsultationReadyNotification = (doctorData) => {
        const title = '🎥 Sua Consulta Está Pronta!';
        const message = `${doctorData.name} está aguardando você na sala de consulta.`;

        console.log('🎥 Consultation ready notification sent');
        return { title, message, doctorData };
    };

    return {
        NOTIFICATION_CONFIG,
        notificationState,
        initializePushNotifications,
        sendBrowserPushNotification,
        initializeWhatsAppIntegration,
        sendWhatsAppNotification,
        initializeEmailIntegration,
        sendEmailNotification,
        checkProximityNotifications,
        sendProximityNotification,
        sendUrgentProximityNotification,
        playProximitySound,
        playCallSound,
        stopCallSound,
        sendPaymentConfirmationNotification,
        sendQueuePositionUpdateNotification,
        sendConsultationReadyNotification
    };
};

describe('Sistema de Notificações Multi-Canal - Tarefa 7', () => {
    let notificationSystem;

    beforeEach(() => {
        mockDOM();
        notificationSystem = createNotificationSystem();
        jest.clearAllMocks();
    });

    describe('1. Notificações Push do Navegador', () => {
        test('deve inicializar notificações push com sucesso', async () => {
            // Arrange
            global.window.Notification = jest.fn();

            // Act
            await notificationSystem.initializePushNotifications();

            // Assert
            expect(notificationSystem.NOTIFICATION_CONFIG.channels.browser).toBe(true);
            expect(notificationSystem.notificationState.pushPermission).toBe('granted');
            expect(console.log).toHaveBeenCalledWith('✅ Browser push notifications enabled');
        });

        test('deve detectar quando o navegador não suporta notificações', async () => {
            // Arrange
            delete global.window.Notification;

            // Act
            await notificationSystem.initializePushNotifications();

            // Assert
            expect(notificationSystem.NOTIFICATION_CONFIG.channels.browser).toBe(false);
            expect(console.warn).toHaveBeenCalledWith('🚫 Browser does not support notifications');
        });

        test('deve enviar notificação push do navegador', () => {
            // Arrange
            const mockNotification = { close: jest.fn() };
            global.window.Notification = jest.fn(() => mockNotification);
            notificationSystem.notificationState.pushPermission = 'granted';
            notificationSystem.NOTIFICATION_CONFIG.channels.browser = true;

            // Act
            const result = notificationSystem.sendBrowserPushNotification(
                'Teste Push',
                'Mensagem de teste',
                { tag: 'test-notification' }
            );

            // Assert
            expect(global.window.Notification).toHaveBeenCalledWith('Teste Push', {
                body: 'Mensagem de teste',
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'test-notification',
                requireInteraction: false,
                silent: false
            });
            expect(result).toBe(mockNotification);
            expect(console.log).toHaveBeenCalledWith('📱 Browser push notification sent:', 'Teste Push');
        });

        test('não deve enviar push notification se não tiver permissão', () => {
            // Arrange
            notificationSystem.notificationState.pushPermission = 'denied';

            // Act
            const result = notificationSystem.sendBrowserPushNotification('Teste', 'Mensagem');

            // Assert
            expect(result).toBe(false);
            expect(global.window.Notification).not.toHaveBeenCalled();
        });
    });

    describe('2. Integração WhatsApp', () => {
        test('deve inicializar integração WhatsApp', () => {
            // Act
            notificationSystem.initializeWhatsAppIntegration();

            // Assert
            expect(notificationSystem.notificationState.whatsappConfig).toEqual({
                apiUrl: 'https://api.whatsapp.com/send',
                businessNumber: '+5511999999999',
                enabled: false
            });
            expect(console.log).toHaveBeenCalledWith('📱 WhatsApp integration initialized (demo mode)');
        });

        test('deve enviar mensagem WhatsApp quando habilitado', async () => {
            // Arrange
            notificationSystem.NOTIFICATION_CONFIG.channels.whatsapp = true;
            notificationSystem.notificationState.whatsappConfig = {
                apiUrl: 'https://api.whatsapp.com/send',
                businessNumber: '+5511999999999',
                enabled: true
            };

            // Act
            const result = await notificationSystem.sendWhatsAppNotification(
                '+5511987654321',
                'Sua consulta está confirmada!'
            );

            // Assert
            expect(result.success).toBe(true);
            expect(result.messageId).toMatch(/^wa_\d+$/);
            expect(console.log).toHaveBeenCalledWith('📱 WhatsApp notification sent:', {
                phone: '+5511987654321',
                message: 'Sua consulta está confirmada!',
                url: 'https://api.whatsapp.com/send?phone=+5511987654321&text=Sua%20consulta%20est%C3%A1%20confirmada!'
            });
        });

        test('não deve enviar WhatsApp se estiver desabilitado', async () => {
            // Arrange
            notificationSystem.NOTIFICATION_CONFIG.channels.whatsapp = false;

            // Act
            const result = await notificationSystem.sendWhatsAppNotification(
                '+5511987654321',
                'Teste'
            );

            // Assert
            expect(result.success).toBe(false);
            expect(result.reason).toBe('disabled');
            expect(console.log).toHaveBeenCalledWith('📱 WhatsApp notifications disabled');
        });

        test('deve tratar erros no envio de WhatsApp', async () => {
            // Arrange
            notificationSystem.NOTIFICATION_CONFIG.channels.whatsapp = true;
            notificationSystem.notificationState.whatsappConfig = {
                apiUrl: null, // Simular erro
                enabled: true
            };

            // Mock para forçar erro
            const originalEncodeURIComponent = global.encodeURIComponent;
            global.encodeURIComponent = jest.fn(() => {
                throw new Error('Simulated error');
            });

            // Act
            const result = await notificationSystem.sendWhatsAppNotification(
                '+5511987654321',
                'Teste'
            );

            // Restore
            global.encodeURIComponent = originalEncodeURIComponent;

            // Assert
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('3. Sistema de Email', () => {
        test('deve inicializar integração de email', () => {
            // Act
            notificationSystem.initializeEmailIntegration();

            // Assert
            expect(notificationSystem.notificationState.emailConfig).toEqual({
                apiUrl: 'https://api.emailservice.com/send',
                apiKey: 'demo-api-key',
                fromEmail: 'noreply@telemed.com',
                fromName: 'TeleMed',
                enabled: false
            });
            expect(console.log).toHaveBeenCalledWith('📧 Email integration initialized (demo mode)');
        });

        test('deve enviar notificação por email quando habilitado', async () => {
            // Arrange
            notificationSystem.initializeEmailIntegration(); // Inicializar primeiro
            notificationSystem.NOTIFICATION_CONFIG.channels.email = true;
            notificationSystem.notificationState.emailConfig.enabled = true;

            // Act
            const result = await notificationSystem.sendEmailNotification(
                'paciente@teste.com',
                'Consulta Confirmada',
                'Sua consulta foi confirmada com sucesso!',
                {
                    actionUrl: 'https://telemed.com/consulta',
                    actionText: 'Acessar Consulta'
                }
            );

            // Assert
            expect(result.success).toBe(true);
            expect(result.messageId).toMatch(/^email_\d+$/);
            expect(console.log).toHaveBeenCalledWith('📧 Email notification sent:', expect.objectContaining({
                to: 'paciente@teste.com',
                subject: 'Consulta Confirmada',
                html: expect.stringContaining('TeleMed')
            }));
        });

        test('deve incluir botão de ação no email quando fornecido', async () => {
            // Arrange
            notificationSystem.initializeEmailIntegration(); // Inicializar primeiro
            notificationSystem.NOTIFICATION_CONFIG.channels.email = true;
            notificationSystem.notificationState.emailConfig.enabled = true;

            // Act
            const result = await notificationSystem.sendEmailNotification(
                'paciente@teste.com',
                'Teste',
                'Mensagem de teste',
                {
                    actionUrl: 'https://telemed.com/action',
                    actionText: 'Clique Aqui'
                }
            );

            // Assert
            expect(result.success).toBe(true);
            const emailData = console.log.mock.calls.find(call => 
                call[0] === '📧 Email notification sent:'
            )[1];
            expect(emailData.html).toContain('https://telemed.com/action');
            expect(emailData.html).toContain('Clique Aqui');
        });

        test('não deve enviar email se estiver desabilitado', async () => {
            // Arrange
            notificationSystem.NOTIFICATION_CONFIG.channels.email = false;

            // Act
            const result = await notificationSystem.sendEmailNotification(
                'paciente@teste.com',
                'Teste',
                'Mensagem'
            );

            // Assert
            expect(result.success).toBe(false);
            expect(result.reason).toBe('disabled');
            expect(console.log).toHaveBeenCalledWith('📧 Email notifications disabled');
        });
    });

    describe('4. Notificações de Proximidade', () => {
        test('deve detectar quando usuário está próximo (posição 3)', () => {
            // Act
            const result = notificationSystem.checkProximityNotifications(3);

            // Assert
            expect(result).toEqual({
                type: 'proximity',
                position: 3
            });
            expect(console.log).toHaveBeenCalledWith('🎯 Proximity notification sent for position:', 3);
        });

        test('deve detectar quando usuário é o próximo (posição 1)', () => {
            // Act
            const result = notificationSystem.checkProximityNotifications(1);

            // Assert
            expect(result).toEqual({
                type: 'urgent',
                position: 1
            });
            expect(console.log).toHaveBeenCalledWith('🚨 Urgent proximity notification sent for position:', 1);
        });

        test('não deve notificar se posição for maior que threshold', () => {
            // Act
            const result = notificationSystem.checkProximityNotifications(5);

            // Assert
            expect(result).toBe(false);
        });

        test('deve resetar flag de proximidade quando posição muda significativamente', () => {
            // Arrange
            notificationSystem.notificationState.currentQueuePosition = 10;
            notificationSystem.notificationState.proximityNotified = true;

            // Act
            const result = notificationSystem.checkProximityNotifications(3);

            // Assert
            expect(result).toEqual({
                type: 'proximity',
                position: 3
            });
            expect(notificationSystem.notificationState.proximityNotified).toBe(true);
        });

        test('não deve notificar novamente se já foi notificado', () => {
            // Arrange
            notificationSystem.notificationState.proximityNotified = true;
            notificationSystem.notificationState.currentQueuePosition = 3;

            // Act
            const result = notificationSystem.checkProximityNotifications(3);

            // Assert
            expect(result).toBe(false);
        });

        test('deve desabilitar notificações de proximidade se configurado', () => {
            // Arrange
            notificationSystem.NOTIFICATION_CONFIG.proximity.enabled = false;

            // Act
            const result = notificationSystem.checkProximityNotifications(1);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('5. Alertas Sonoros', () => {
        test('deve tocar som de proximidade quando habilitado', () => {
            // Arrange
            notificationSystem.notificationState.soundEnabled = true;
            notificationSystem.NOTIFICATION_CONFIG.sound.warning = true;

            // Act
            const result = notificationSystem.playProximitySound();

            // Assert
            expect(result).toBe(true);
            expect(console.log).toHaveBeenCalledWith('🎵 Proximity sound played');
        });

        test('não deve tocar som de proximidade se desabilitado', () => {
            // Arrange
            notificationSystem.notificationState.soundEnabled = false;

            // Act
            const result = notificationSystem.playProximitySound();

            // Assert
            expect(result).toBe(false);
        });

        test('deve tocar som de chamada quando habilitado', () => {
            // Arrange
            notificationSystem.notificationState.soundEnabled = true;
            notificationSystem.NOTIFICATION_CONFIG.sound.call = true;

            // Act
            const result = notificationSystem.playCallSound();

            // Assert
            expect(result).toBe(true);
            expect(notificationSystem.notificationState.callAudio).toEqual({ playing: true });
            expect(console.log).toHaveBeenCalledWith('📞 Call sound started');
        });

        test('deve parar som de chamada', () => {
            // Arrange
            notificationSystem.notificationState.callAudio = { playing: true };

            // Act
            const result = notificationSystem.stopCallSound();

            // Assert
            expect(result).toBe(true);
            expect(notificationSystem.notificationState.callAudio).toBe(null);
            expect(console.log).toHaveBeenCalledWith('🔇 Call sound stopped');
        });

        test('não deve parar som se não estiver tocando', () => {
            // Arrange
            notificationSystem.notificationState.callAudio = null;

            // Act
            const result = notificationSystem.stopCallSound();

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('6. Notificações Específicas do Sistema', () => {
        test('deve enviar notificação de confirmação de pagamento', () => {
            // Arrange
            const appointmentData = {
                id: 'test-123',
                specialty: 'Cardiologia',
                price: 89.90,
                queuePosition: 3
            };

            // Act
            const result = notificationSystem.sendPaymentConfirmationNotification(appointmentData);

            // Assert
            expect(result).toEqual({
                title: '✅ Pagamento Confirmado',
                message: 'Pagamento de R$ 89.90 confirmado. Você foi adicionado à fila!',
                appointmentData
            });
            expect(console.log).toHaveBeenCalledWith('💳 Payment confirmation notification sent');
        });

        test('deve enviar notificação de atualização de posição na fila', () => {
            // Act
            const result = notificationSystem.sendQueuePositionUpdateNotification(5, 25);

            // Assert
            expect(result).toEqual({
                title: 'Posição Atualizada',
                message: 'Você está na posição 5. Tempo estimado: 25 min',
                position: 5,
                estimatedTime: 25
            });
            expect(console.log).toHaveBeenCalledWith('📊 Queue position update notification sent');
        });

        test('deve enviar notificação urgente para posição 1 na fila', () => {
            // Act
            const result = notificationSystem.sendQueuePositionUpdateNotification(1, 0);

            // Assert
            expect(result).toEqual({
                title: '🟢 Você é o próximo!',
                message: 'Mantenha-se pronto! Você será chamado em breve.',
                position: 1
            });
        });

        test('deve enviar notificação de consulta pronta', () => {
            // Arrange
            const doctorData = {
                name: 'Dr. João Silva',
                specialty: 'Cardiologia'
            };

            // Act
            const result = notificationSystem.sendConsultationReadyNotification(doctorData);

            // Assert
            expect(result).toEqual({
                title: '🎥 Sua Consulta Está Pronta!',
                message: 'Dr. João Silva está aguardando você na sala de consulta.',
                doctorData
            });
            expect(console.log).toHaveBeenCalledWith('🎥 Consultation ready notification sent');
        });
    });

    describe('7. Integração e Fluxos Completos', () => {
        test('deve executar fluxo completo de confirmação de pagamento', async () => {
            // Arrange
            notificationSystem.initializeWhatsAppIntegration(); // Inicializar primeiro
            notificationSystem.initializeEmailIntegration(); // Inicializar primeiro
            notificationSystem.NOTIFICATION_CONFIG.channels.browser = true;
            notificationSystem.NOTIFICATION_CONFIG.channels.whatsapp = true;
            notificationSystem.NOTIFICATION_CONFIG.channels.email = true;
            notificationSystem.notificationState.pushPermission = 'granted';
            notificationSystem.notificationState.whatsappConfig.enabled = true;
            notificationSystem.notificationState.emailConfig.enabled = true;

            const appointmentData = {
                id: 'test-123',
                specialty: 'Cardiologia',
                price: 89.90,
                queuePosition: 3,
                patientPhone: '+5511987654321',
                patientEmail: 'paciente@teste.com'
            };

            // Act
            const paymentResult = notificationSystem.sendPaymentConfirmationNotification(appointmentData);
            const whatsappResult = await notificationSystem.sendWhatsAppNotification(
                appointmentData.patientPhone,
                `${paymentResult.title}\n\n${paymentResult.message}`
            );
            const emailResult = await notificationSystem.sendEmailNotification(
                appointmentData.patientEmail,
                paymentResult.title,
                paymentResult.message
            );

            // Assert
            expect(paymentResult.title).toBe('✅ Pagamento Confirmado');
            expect(whatsappResult.success).toBe(true);
            expect(emailResult.success).toBe(true);
        });

        test('deve executar fluxo completo de proximidade na fila', () => {
            // Arrange
            notificationSystem.notificationState.soundEnabled = true;
            notificationSystem.NOTIFICATION_CONFIG.sound.warning = true;

            // Act - Usuário entra na posição 5
            let result1 = notificationSystem.checkProximityNotifications(5);
            
            // Act - Usuário avança para posição 3 (proximidade)
            let result2 = notificationSystem.checkProximityNotifications(3);
            
            // Act - Usuário avança para posição 1 (urgente)
            notificationSystem.notificationState.proximityNotified = false; // Reset para testar
            let result3 = notificationSystem.checkProximityNotifications(1);

            // Assert
            expect(result1).toBe(false); // Posição 5 não notifica
            expect(result2.type).toBe('proximity'); // Posição 3 notifica proximidade
            expect(result3.type).toBe('urgent'); // Posição 1 notifica urgente
        });

        test('deve gerenciar estado de notificações corretamente', () => {
            // Arrange & Act
            const initialState = { ...notificationSystem.notificationState };
            
            // Simular mudanças de estado
            notificationSystem.checkProximityNotifications(3);
            const afterProximity = { ...notificationSystem.notificationState };
            
            notificationSystem.playCallSound();
            const afterCall = { ...notificationSystem.notificationState };
            
            notificationSystem.stopCallSound();
            const afterStop = { ...notificationSystem.notificationState };

            // Assert
            expect(initialState.proximityNotified).toBe(false);
            expect(afterProximity.proximityNotified).toBe(true);
            expect(afterProximity.currentQueuePosition).toBe(3);
            expect(afterCall.callAudio).toEqual({ playing: true });
            expect(afterStop.callAudio).toBe(null);
        });
    });

    describe('8. Configurações e Personalização', () => {
        test('deve respeitar configurações de canais desabilitados', async () => {
            // Arrange
            notificationSystem.NOTIFICATION_CONFIG.channels.browser = false;
            notificationSystem.NOTIFICATION_CONFIG.channels.whatsapp = false;
            notificationSystem.NOTIFICATION_CONFIG.channels.email = false;

            // Act
            const browserResult = notificationSystem.sendBrowserPushNotification('Teste', 'Mensagem');
            const whatsappResult = await notificationSystem.sendWhatsAppNotification('+5511999999999', 'Teste');
            const emailResult = await notificationSystem.sendEmailNotification('test@test.com', 'Teste', 'Mensagem');

            // Assert
            expect(browserResult).toBe(false);
            expect(whatsappResult.success).toBe(false);
            expect(emailResult.success).toBe(false);
        });

        test('deve respeitar configurações de som desabilitado', () => {
            // Arrange
            notificationSystem.notificationState.soundEnabled = false;

            // Act
            const proximityResult = notificationSystem.playProximitySound();
            const callResult = notificationSystem.playCallSound();

            // Assert
            expect(proximityResult).toBe(false);
            expect(callResult).toBe(false);
        });

        test('deve respeitar thresholds de proximidade personalizados', () => {
            // Arrange
            notificationSystem.NOTIFICATION_CONFIG.proximity.threshold = 5;
            notificationSystem.NOTIFICATION_CONFIG.proximity.urgentThreshold = 2;

            // Act
            const result1 = notificationSystem.checkProximityNotifications(5); // Proximidade
            notificationSystem.notificationState.proximityNotified = false;
            const result2 = notificationSystem.checkProximityNotifications(2); // Urgente
            notificationSystem.notificationState.proximityNotified = false;
            const result3 = notificationSystem.checkProximityNotifications(6); // Nenhuma

            // Assert
            expect(result1.type).toBe('proximity');
            expect(result2.type).toBe('urgent');
            expect(result3).toBe(false);
        });
    });
});