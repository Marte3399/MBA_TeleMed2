// TeleMed - Sistema de Notificações Multi-Canal

/**
 * CONFIGURAÇÃO DAS NOTIFICAÇÕES
 * Define comportamentos e aparência do sistema de notificações
 */
const NOTIFICATION_CONFIG = {
    duration: {                 // Duração de exibição por tipo (em milissegundos)
        success: 5000,          // Notificações de sucesso: 5 segundos
        info: 4000,             // Notificações informativas: 4 segundos
        warning: 6000,          // Notificações de aviso: 6 segundos
        error: 8000,            // Notificações de erro: 8 segundos
        urgent: 10000           // Notificações urgentes: 10 segundos
    },
    maxNotifications: 5,        // Máximo de notificações simultâneas na tela
    position: 'top-right',      // Posição das notificações (top-right, top-left, bottom-right, bottom-left)
    animation: {                // Configurações de animação
        enter: 'slideInRight',  // Animação de entrada
        exit: 'slideOutRight'   // Animação de saída
    },
    sound: {                    // Configuração de sons por tipo
        success: true,          // Som para sucessos: ativado
        error: true,            // Som para erros: ativado
        warning: true,          // Som para avisos: ativado
        info: false,            // Som para informações: desativado
        urgent: true,           // Som para urgentes: ativado
        call: true              // Som para chamadas: ativado
    },
    channels: {                 // Configuração de canais de notificação
        browser: true,          // Notificações push do navegador
        whatsapp: false,        // WhatsApp (requer configuração)
        email: false,           // Email (requer configuração)
        sms: false              // SMS (requer configuração)
    },
    proximity: {                // Configuração de notificações de proximidade
        enabled: true,          // Ativar notificações de proximidade
        threshold: 3,           // Notificar quando estiver a 3 posições de distância
        urgentThreshold: 1      // Notificar urgentemente quando for o próximo
    }
};

/**
 * TIPOS DE NOTIFICAÇÃO
 * Define os tipos possíveis de notificações no sistema
 */
const NOTIFICATION_TYPES = {
    SUCCESS: 'success',  // Notificações de sucesso (verde)
    ERROR: 'error',      // Notificações de erro (vermelho)
    WARNING: 'warning',  // Notificações de aviso (amarelo)
    INFO: 'info'         // Notificações informativas (azul)
};

/**
 * ESTADO DAS NOTIFICAÇÕES
 * Armazena o estado atual do sistema de notificações
 */
let notificationState = {
    activeNotifications: [],  // Array com notificações atualmente visíveis
    notificationId: 0,        // Contador para IDs únicos das notificações
    isInitialized: false,     // Se o sistema foi inicializado
    container: null,          // Referência para o container DOM das notificações
    soundEnabled: true,       // Se os sons estão habilitados
    pushPermission: null,     // Status da permissão de push notifications
    whatsappConfig: null,     // Configuração do WhatsApp API
    emailConfig: null,        // Configuração do serviço de email
    currentQueuePosition: null, // Posição atual na fila
    callAudio: null,          // Referência para áudio de chamada
    proximityNotified: false  // Se já foi notificado sobre proximidade
};

/**
 * INICIALIZAR SISTEMA DE NOTIFICAÇÕES
 * Configura e inicializa todos os componentes do sistema de notificações
 */
async function initializeNotifications() {
    createNotificationContainer();  // Cria o container DOM para as notificações
    setupNotificationStyles();      // Adiciona estilos CSS necessários
    await initializePushNotifications(); // Inicializa notificações push do navegador
    initializeWhatsAppIntegration(); // Inicializa integração WhatsApp
    initializeEmailIntegration();   // Inicializa integração de email
    setupProximityNotifications();  // Configura notificações de proximidade
    notificationState.isInitialized = true;
    console.log('🔔 Multi-channel notifications system initialized');
}

/**
 * CRIAR CONTAINER DE NOTIFICAÇÕES
 * Cria o elemento DOM que irá conter todas as notificações na tela
 */
function createNotificationContainer() {
    // Remove container existente se já houver um (evita duplicação)
    const existingContainer = document.getElementById('notificationContainer');
    if (existingContainer) {
        existingContainer.remove();
    }

    // Cria novo container com ID único e classes CSS apropriadas
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = `notification-container notification-${NOTIFICATION_CONFIG.position}`;
    
    // Adiciona o container ao body da página
    document.body.appendChild(container);
    notificationState.container = container;
}

// Setup Notification Styles
function setupNotificationStyles() {
    const styleId = 'notificationStyles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .notification-container {
            position: fixed;
            z-index: 9999;
            pointer-events: none;
            max-width: 400px;
        }
        
        .notification-top-right {
            top: 20px;
            right: 20px;
        }
        
        .notification-top-left {
            top: 20px;
            left: 20px;
        }
        
        .notification-bottom-right {
            bottom: 20px;
            right: 20px;
        }
        
        .notification-bottom-left {
            bottom: 20px;
            left: 20px;
        }
        
        .notification {
            pointer-events: auto;
            margin-bottom: 10px;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            space-x: 12px;
            max-width: 100%;
            word-wrap: break-word;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .notification-success {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }
        
        .notification-error {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
        }
        
        .notification-warning {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
        }
        
        .notification-info {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
        }
        
        .notification-icon {
            font-size: 24px;
            flex-shrink: 0;
        }
        
        .notification-content {
            flex: 1;
            min-width: 0;
        }
        
        .notification-title {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 2px;
        }
        
        .notification-message {
            font-size: 13px;
            opacity: 0.9;
            line-height: 1.4;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: inherit;
            font-size: 18px;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            opacity: 0.7;
            transition: opacity 0.2s;
            flex-shrink: 0;
        }
        
        .notification-close:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.1);
        }
        
        .notification-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: rgba(255, 255, 255, 0.3);
            transition: width linear;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes slideInLeft {
            from {
                transform: translateX(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutLeft {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(-100%);
                opacity: 0;
            }
        }
        
        .notification-enter {
            animation: slideInRight 0.3s ease-out;
        }
        
        .notification-exit {
            animation: slideOutRight 0.3s ease-in;
        }
        
        .notification-enter-left {
            animation: slideInLeft 0.3s ease-out;
        }
        
        .notification-exit-left {
            animation: slideOutLeft 0.3s ease-in;
        }
    `;
    
    document.head.appendChild(style);
}

// Show Notification (Main Function)
function showNotification(title, message = '', type = 'info', options = {}) {
    if (!notificationState.isInitialized) {
        initializeNotifications();
    }

    // Create notification object
    const notification = {
        id: ++notificationState.notificationId,
        title: title,
        message: message,
        type: type,
        timestamp: new Date(),
        duration: options.duration || NOTIFICATION_CONFIG.duration[type] || 4000,
        persistent: options.persistent || false,
        onClick: options.onClick || null,
        actions: options.actions || []
    };

    // Remove oldest notification if we exceed max
    if (notificationState.activeNotifications.length >= NOTIFICATION_CONFIG.maxNotifications) {
        const oldest = notificationState.activeNotifications[0];
        removeNotification(oldest.id);
    }

    // Add to active notifications
    notificationState.activeNotifications.push(notification);

    // Create and show notification element
    const notificationElement = createNotificationElement(notification);
    notificationState.container.appendChild(notificationElement);

    // Play sound if enabled
    if (notificationState.soundEnabled && NOTIFICATION_CONFIG.sound[type]) {
        playNotificationSound(type);
    }

    // Auto-remove notification (unless persistent)
    if (!notification.persistent) {
        setTimeout(() => {
            removeNotification(notification.id);
        }, notification.duration);
    }

    return notification.id;
}

// Create Notification Element
function createNotificationElement(notification) {
    const element = document.createElement('div');
    element.id = `notification-${notification.id}`;
    element.className = `notification notification-${notification.type} notification-enter`;
    
    const icon = getNotificationIcon(notification.type);
    
    element.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-title">${notification.title}</div>
            ${notification.message ? `<div class="notification-message">${notification.message}</div>` : ''}
        </div>
        <button class="notification-close" onclick="removeNotification(${notification.id})">&times;</button>
        ${!notification.persistent ? '<div class="notification-progress"></div>' : ''}
    `;

    // Add click handler if provided
    if (notification.onClick) {
        element.style.cursor = 'pointer';
        element.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-close')) {
                notification.onClick();
                removeNotification(notification.id);
            }
        });
    }

    // Start progress bar animation
    if (!notification.persistent) {
        setTimeout(() => {
            const progressBar = element.querySelector('.notification-progress');
            if (progressBar) {
                progressBar.style.transition = `width ${notification.duration}ms linear`;
                progressBar.style.width = '100%';
            }
        }, 100);
    }

    return element;
}

// Get Notification Icon
function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

// Remove Notification
function removeNotification(id) {
    const element = document.getElementById(`notification-${id}`);
    if (!element) return;

    // Add exit animation
    element.classList.add('notification-exit');
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        
        // Remove from active notifications
        notificationState.activeNotifications = notificationState.activeNotifications.filter(
            n => n.id !== id
        );
    }, 300);
}

// Clear All Notifications
function clearAllNotifications() {
    notificationState.activeNotifications.forEach(notification => {
        removeNotification(notification.id);
    });
}

// Play Notification Sound
function playNotificationSound(type) {
    if (!notificationState.soundEnabled) return;

    // Create audio context for notification sounds
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Different frequencies for different types
        const frequencies = {
            success: 800,
            error: 400,
            warning: 600,
            info: 500
        };

        oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        // Fallback: no sound if audio context fails
        console.log('Audio notification not supported');
    }
}

// Notification Shortcuts
function showSuccessNotification(title, message, options) {
    return showNotification(title, message, NOTIFICATION_TYPES.SUCCESS, options);
}

function showErrorNotification(title, message, options) {
    return showNotification(title, message, NOTIFICATION_TYPES.ERROR, options);
}

function showWarningNotification(title, message, options) {
    return showNotification(title, message, NOTIFICATION_TYPES.WARNING, options);
}

function showInfoNotification(title, message, options) {
    return showNotification(title, message, NOTIFICATION_TYPES.INFO, options);
}

// Toggle Sound
function toggleNotificationSound() {
    notificationState.soundEnabled = !notificationState.soundEnabled;
    
    showNotification(
        notificationState.soundEnabled ? 'Som ativado' : 'Som desativado',
        `Notificações de som foram ${notificationState.soundEnabled ? 'ativadas' : 'desativadas'}`,
        'info'
    );
    
    // Save preference
    localStorage.setItem('telemed-notification-sound', notificationState.soundEnabled);
}

// Load Sound Preference
function loadNotificationPreferences() {
    const soundPreference = localStorage.getItem('telemed-notification-sound');
    if (soundPreference !== null) {
        notificationState.soundEnabled = soundPreference === 'true';
    }
}

// Advanced Notification with Actions
function showActionNotification(title, message, actions, type = 'info') {
    const notificationId = showNotification(title, message, type, {
        persistent: true,
        actions: actions
    });
    
    // Add action buttons
    setTimeout(() => {
        const element = document.getElementById(`notification-${notificationId}`);
        if (element && actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'mt-3 flex space-x-2';
            
            actions.forEach(action => {
                const button = document.createElement('button');
                button.textContent = action.label;
                button.className = 'px-3 py-1 text-xs bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition';
                button.onclick = () => {
                    action.handler();
                    removeNotification(notificationId);
                };
                actionsContainer.appendChild(button);
            });
            
            const content = element.querySelector('.notification-content');
            content.appendChild(actionsContainer);
        }
    }, 100);
    
    return notificationId;
}

// System Notifications
function showAppointmentReminder(appointment) {
    showActionNotification(
        '📅 Lembrete de Consulta',
        `Sua consulta com ${appointment.doctor} está em 15 minutos`,
        [
            {
                label: 'Entrar na Consulta',
                handler: () => openVideoCall()
            },
            {
                label: 'Reagendar',
                handler: () => rescheduleAppointment(appointment.id)
            }
        ],
        'warning'
    );
}

function showPaymentNotification(amount, method) {
    showSuccessNotification(
        'Pagamento Confirmado',
        `Pagamento de ${formatCurrency(amount)} via ${method} foi processado com sucesso`
    );
}

function showConnectionNotification(isConnected) {
    if (isConnected) {
        showSuccessNotification('Conectado', 'Conexão com servidor restabelecida');
    } else {
        showErrorNotification('Conexão Perdida', 'Tentando reconectar...', { persistent: true });
    }
}

function showNewMessageNotification(sender, preview) {
    showActionNotification(
        `💬 Nova mensagem de ${sender}`,
        preview,
        [
            {
                label: 'Responder',
                handler: () => openChat()
            },
            {
                label: 'Marcar como lida',
                handler: () => console.log('Message marked as read')
            }
        ],
        'info'
    );
}

// Notification History
function getNotificationHistory() {
    return notificationState.activeNotifications;
}

// Export Notification Settings
function exportNotificationSettings() {
    const settings = {
        soundEnabled: notificationState.soundEnabled,
        position: NOTIFICATION_CONFIG.position,
        maxNotifications: NOTIFICATION_CONFIG.maxNotifications
    };
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `telemed-notification-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    showSuccessNotification('Configurações exportadas', 'Arquivo salvo na pasta Downloads');
}

/**
 * SISTEMA DE NOTIFICAÇÕES PUSH DO NAVEGADOR
 * Implementa notificações push nativas do navegador
 */
async function initializePushNotifications() {
    try {
        // Verificar se o navegador suporta notificações
        if (!('Notification' in window)) {
            console.warn('🚫 Browser does not support notifications');
            NOTIFICATION_CONFIG.channels.browser = false;
            return;
        }

        // Verificar permissão atual
        notificationState.pushPermission = Notification.permission;

        if (notificationState.pushPermission === 'default') {
            // Solicitar permissão
            const permission = await Notification.requestPermission();
            notificationState.pushPermission = permission;
        }

        if (notificationState.pushPermission === 'granted') {
            NOTIFICATION_CONFIG.channels.browser = true;
            console.log('✅ Browser push notifications enabled');
        } else {
            console.warn('🚫 Browser push notifications denied');
            NOTIFICATION_CONFIG.channels.browser = false;
        }

    } catch (error) {
        console.error('❌ Error initializing push notifications:', error);
        NOTIFICATION_CONFIG.channels.browser = false;
    }
}

/**
 * ENVIAR NOTIFICAÇÃO PUSH DO NAVEGADOR
 * Envia notificação push nativa do navegador
 */
function sendBrowserPushNotification(title, message, options = {}) {
    if (!NOTIFICATION_CONFIG.channels.browser || notificationState.pushPermission !== 'granted') {
        return;
    }

    try {
        const notification = new Notification(title, {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: options.tag || 'telemed-notification',
            requireInteraction: options.requireInteraction || false,
            silent: options.silent || false,
            ...options
        });

        // Adicionar event listeners
        notification.onclick = () => {
            window.focus();
            if (options.onClick) {
                options.onClick();
            }
            notification.close();
        };

        // Auto-fechar após 10 segundos se não for persistente
        if (!options.requireInteraction) {
            setTimeout(() => {
                notification.close();
            }, 10000);
        }

        console.log('📱 Browser push notification sent:', title);

    } catch (error) {
        console.error('❌ Error sending browser push notification:', error);
    }
}

/**
 * SISTEMA DE INTEGRAÇÃO WHATSAPP
 * Configura integração com WhatsApp API para envio de mensagens
 */
function initializeWhatsAppIntegration() {
    // Configuração do WhatsApp Business API (simulada)
    notificationState.whatsappConfig = {
        apiUrl: 'https://api.whatsapp.com/send',
        businessNumber: '+5511999999999', // Número do negócio
        enabled: false // Desabilitado por padrão (requer configuração real)
    };

    // Em produção, aqui seria feita a autenticação com a API do WhatsApp
    console.log('📱 WhatsApp integration initialized (demo mode)');
}

/**
 * ENVIAR MENSAGEM WHATSAPP
 * Envia mensagem via WhatsApp (simulado)
 */
async function sendWhatsAppNotification(phoneNumber, message, options = {}) {
    if (!NOTIFICATION_CONFIG.channels.whatsapp || !notificationState.whatsappConfig.enabled) {
        console.log('📱 WhatsApp notifications disabled');
        return;
    }

    try {
        // Em produção, aqui seria feita a chamada real para a API do WhatsApp
        const whatsappUrl = `${notificationState.whatsappConfig.apiUrl}?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        
        // Simulação de envio
        console.log('📱 WhatsApp notification sent:', {
            phone: phoneNumber,
            message: message,
            url: whatsappUrl
        });

        // Em um ambiente real, você faria:
        // const response = await fetch(whatsappApiEndpoint, { ... });
        
        return { success: true, messageId: 'wa_' + Date.now() };

    } catch (error) {
        console.error('❌ Error sending WhatsApp notification:', error);
        return { success: false, error: error.message };
    }
}

/**
 * SISTEMA DE INTEGRAÇÃO EMAIL
 * Configura integração com serviço de email
 */
function initializeEmailIntegration() {
    // Configuração do serviço de email (simulada)
    notificationState.emailConfig = {
        apiUrl: 'https://api.emailservice.com/send',
        apiKey: 'demo-api-key',
        fromEmail: 'noreply@telemed.com',
        fromName: 'TeleMed',
        enabled: false // Desabilitado por padrão (requer configuração real)
    };

    console.log('📧 Email integration initialized (demo mode)');
}

/**
 * ENVIAR NOTIFICAÇÃO EMAIL
 * Envia notificação por email (simulado)
 */
async function sendEmailNotification(toEmail, subject, message, options = {}) {
    if (!NOTIFICATION_CONFIG.channels.email || !notificationState.emailConfig.enabled) {
        console.log('📧 Email notifications disabled');
        return;
    }

    try {
        // Em produção, aqui seria feita a chamada real para a API de email
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

        // Simulação de envio
        console.log('📧 Email notification sent:', emailData);

        // Em um ambiente real, você faria:
        // const response = await fetch(emailApiEndpoint, { method: 'POST', body: JSON.stringify(emailData) });
        
        return { success: true, messageId: 'email_' + Date.now() };

    } catch (error) {
        console.error('❌ Error sending email notification:', error);
        return { success: false, error: error.message };
    }
}

/**
 * SISTEMA DE NOTIFICAÇÕES DE PROXIMIDADE
 * Configura notificações baseadas na posição na fila
 */
function setupProximityNotifications() {
    if (!NOTIFICATION_CONFIG.proximity.enabled) {
        console.log('🎯 Proximity notifications disabled');
        return;
    }

    console.log('🎯 Proximity notifications enabled');
}

/**
 * VERIFICAR E ENVIAR NOTIFICAÇÕES DE PROXIMIDADE
 * Verifica posição na fila e envia notificações apropriadas
 */
function checkProximityNotifications(currentPosition, totalInQueue = 10) {
    if (!NOTIFICATION_CONFIG.proximity.enabled) return;

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
    }
    // Notificação de proximidade - está próximo
    else if (currentPosition <= threshold && !notificationState.proximityNotified) {
        sendProximityNotification(currentPosition);
        notificationState.proximityNotified = true;
    }
}

/**
 * ENVIAR NOTIFICAÇÃO DE PROXIMIDADE
 * Envia notificação quando o usuário está próximo de ser chamado
 */
function sendProximityNotification(position) {
    const title = '🟡 Quase sua vez!';
    const message = `Você está na posição ${position}. Prepare-se para sua consulta!`;

    // Notificação na tela
    showWarningNotification(title, message, {
        persistent: true,
        onClick: () => {
            // Focar na aba da fila se estiver aberta
            if (window.queueSystem) {
                window.focus();
            }
        }
    });

    // Notificação push do navegador
    sendBrowserPushNotification(title, message, {
        tag: 'proximity-notification',
        requireInteraction: true,
        onClick: () => window.focus()
    });

    // Som de notificação
    playProximitySound();

    console.log('🎯 Proximity notification sent for position:', position);
}

/**
 * ENVIAR NOTIFICAÇÃO URGENTE DE PROXIMIDADE
 * Envia notificação urgente quando é a vez do usuário
 */
function sendUrgentProximityNotification(position) {
    const title = position === 1 ? '🟢 Você é o próximo!' : '🔴 Sua consulta está pronta!';
    const message = position === 1 ? 
        'Mantenha-se pronto! Você será chamado em breve.' : 
        'Sua consulta está pronta. Clique para entrar!';

    // Notificação na tela (persistente)
    showNotification(title, message, 'urgent', {
        persistent: true,
        onClick: () => {
            if (window.queueSystem && typeof window.queueSystem.showCallModal === 'function') {
                window.queueSystem.showCallModal();
            }
        }
    });

    // Notificação push do navegador
    sendBrowserPushNotification(title, message, {
        tag: 'urgent-call-notification',
        requireInteraction: true,
        onClick: () => {
            window.focus();
            if (window.queueSystem && typeof window.queueSystem.showCallModal === 'function') {
                window.queueSystem.showCallModal();
            }
        }
    });

    // Som de chamada (mais longo e insistente)
    playCallSound();

    console.log('🚨 Urgent proximity notification sent for position:', position);
}

/**
 * SISTEMA DE ÁUDIO APRIMORADO
 * Sons específicos para diferentes tipos de notificação
 */
function playProximitySound() {
    if (!notificationState.soundEnabled || !NOTIFICATION_CONFIG.sound.warning) return;

    try {
        // Som de proximidade - sequência de 3 beeps
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, i * 500);
        }

    } catch (error) {
        console.log('🔇 Proximity sound not available');
    }
}

/**
 * TOCAR SOM DE CHAMADA
 * Som específico para quando é a vez do usuário
 */
function playCallSound() {
    if (!notificationState.soundEnabled || !NOTIFICATION_CONFIG.sound.call) return;

    try {
        // Parar som anterior se estiver tocando
        if (notificationState.callAudio) {
            notificationState.callAudio.pause();
            notificationState.callAudio.currentTime = 0;
        }

        // Som de chamada - tom contínuo alternado
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        let isPlaying = true;

        const playTone = (frequency, duration) => {
            if (!isPlaying) return;

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };

        // Sequência de tons alternados por 10 segundos
        let count = 0;
        const interval = setInterval(() => {
            if (count >= 20 || !isPlaying) { // 20 tons = ~10 segundos
                clearInterval(interval);
                return;
            }

            const frequency = count % 2 === 0 ? 1000 : 800;
            playTone(frequency, 0.4);
            count++;
        }, 500);

        // Parar após 10 segundos
        setTimeout(() => {
            isPlaying = false;
            clearInterval(interval);
        }, 10000);

        // Salvar referência para poder parar se necessário
        notificationState.callAudio = { 
            pause: () => { isPlaying = false; },
            currentTime: 0
        };

    } catch (error) {
        console.log('🔇 Call sound not available');
    }
}

/**
 * PARAR SOM DE CHAMADA
 * Para o som de chamada se estiver tocando
 */
function stopCallSound() {
    if (notificationState.callAudio) {
        notificationState.callAudio.pause();
        notificationState.callAudio.currentTime = 0;
        notificationState.callAudio = null;
    }
}

/**
 * NOTIFICAÇÕES ESPECÍFICAS DO SISTEMA DE CONSULTAS
 * Funções especializadas para diferentes eventos do sistema
 */

// Notificação de confirmação de pagamento
function sendPaymentConfirmationNotification(appointmentData) {
    const title = '✅ Pagamento Confirmado';
    const message = `Pagamento de ${formatCurrency(appointmentData.price)} confirmado. Você foi adicionado à fila!`;

    // Notificação na tela
    showSuccessNotification(title, message);

    // Push notification
    sendBrowserPushNotification(title, message, {
        tag: 'payment-confirmation'
    });

    // WhatsApp (se configurado)
    if (appointmentData.patientPhone) {
        sendWhatsAppNotification(
            appointmentData.patientPhone,
            `${title}\n\n${message}\n\nID da Consulta: ${appointmentData.id}\nPosição na fila: ${appointmentData.queuePosition}\n\nAcesse: ${window.location.origin}`
        );
    }

    // Email (se configurado)
    if (appointmentData.patientEmail) {
        sendEmailNotification(
            appointmentData.patientEmail,
            title,
            `
                <p>Seu pagamento foi confirmado com sucesso!</p>
                <p><strong>Detalhes da consulta:</strong></p>
                <ul>
                    <li>Especialidade: ${appointmentData.specialty}</li>
                    <li>Valor: ${formatCurrency(appointmentData.price)}</li>
                    <li>ID da Consulta: ${appointmentData.id}</li>
                    <li>Posição na fila: ${appointmentData.queuePosition}</li>
                </ul>
                <p>Você receberá notificações quando estiver próximo de ser atendido.</p>
            `,
            {
                actionUrl: window.location.origin,
                actionText: 'Acessar Fila'
            }
        );
    }
}

// Notificação de mudança de posição na fila
function sendQueuePositionUpdateNotification(newPosition, estimatedWaitTime) {
    if (newPosition <= NOTIFICATION_CONFIG.proximity.urgentThreshold) {
        sendUrgentProximityNotification(newPosition);
    } else if (newPosition <= NOTIFICATION_CONFIG.proximity.threshold) {
        sendProximityNotification(newPosition);
    } else {
        // Notificação simples de atualização
        showInfoNotification(
            'Posição Atualizada',
            `Você está na posição ${newPosition}. Tempo estimado: ${estimatedWaitTime} min`
        );
    }
}

// Notificação de consulta pronta
function sendConsultationReadyNotification(doctorData) {
    const title = '🎥 Sua Consulta Está Pronta!';
    const message = `${doctorData.name} está aguardando você na sala de consulta.`;

    // Notificação na tela (persistente)
    showNotification(title, message, 'urgent', {
        persistent: true,
        onClick: () => {
            if (window.queueSystem && typeof window.queueSystem.joinVideoCall === 'function') {
                window.queueSystem.joinVideoCall();
            }
        }
    });

    // Push notification
    sendBrowserPushNotification(title, message, {
        tag: 'consultation-ready',
        requireInteraction: true,
        onClick: () => {
            window.focus();
            if (window.queueSystem && typeof window.queueSystem.joinVideoCall === 'function') {
                window.queueSystem.joinVideoCall();
            }
        }
    });

    // Som de chamada
    playCallSound();

    console.log('🎥 Consultation ready notification sent');
}

// Demo Notifications (for testing)
function showDemoNotifications() {
    setTimeout(() => showSuccessNotification('Sucesso!', 'Esta é uma notificação de sucesso'), 500);
    setTimeout(() => showInfoNotification('Informação', 'Esta é uma notificação informativa'), 1000);
    setTimeout(() => showWarningNotification('Atenção!', 'Esta é uma notificação de aviso'), 1500);
    setTimeout(() => showErrorNotification('Erro!', 'Esta é uma notificação de erro'), 2000);
    setTimeout(() => {
        // Demonstrar notificação de proximidade
        checkProximityNotifications(3);
    }, 3000);
    setTimeout(() => {
        // Demonstrar notificação urgente
        checkProximityNotifications(1);
    }, 5000);
}

// Export functions
window.showNotification = showNotification;
window.showSuccessNotification = showSuccessNotification;
window.showErrorNotification = showErrorNotification;
window.showWarningNotification = showWarningNotification;
window.showInfoNotification = showInfoNotification;
window.removeNotification = removeNotification;
window.clearAllNotifications = clearAllNotifications;
window.toggleNotificationSound = toggleNotificationSound;
window.showActionNotification = showActionNotification;
window.showAppointmentReminder = showAppointmentReminder;
window.showPaymentNotification = showPaymentNotification;
window.showConnectionNotification = showConnectionNotification;
window.showNewMessageNotification = showNewMessageNotification;
window.exportNotificationSettings = exportNotificationSettings;
window.showDemoNotifications = showDemoNotifications;

// Export multi-channel functions
window.sendBrowserPushNotification = sendBrowserPushNotification;
window.sendWhatsAppNotification = sendWhatsAppNotification;
window.sendEmailNotification = sendEmailNotification;
window.checkProximityNotifications = checkProximityNotifications;
window.sendProximityNotification = sendProximityNotification;
window.sendUrgentProximityNotification = sendUrgentProximityNotification;
window.playCallSound = playCallSound;
window.stopCallSound = stopCallSound;
window.sendPaymentConfirmationNotification = sendPaymentConfirmationNotification;
window.sendQueuePositionUpdateNotification = sendQueuePositionUpdateNotification;
window.sendConsultationReadyNotification = sendConsultationReadyNotification;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadNotificationPreferences();
    initializeNotifications();
});

console.log('✅ TeleMed Multi-Channel Notifications System Loaded');

    // Notificação na tela (persistente)
    showNotification(title, message, 'urgent', {
        persistent: true,
        onClick: () => {
            if (window.queueSystem && typeof window.queueSystem.showCallModal === 'function') {
                window.queueSystem.showCallModal();
            }
        }
    });

    // Notificação push do navegador
    sendBrowserPushNotification(title, message, {
        tag: 'urgent-call-notification',
        requireInteraction: true,
        onClick: () => {
            window.focus();
            if (window.queueSystem && typeof window.queueSystem.showCallModal === 'function') {
                window.queueSystem.showCallModal();
            }
        }
    });

    // Som de chamada (mais longo e insistente)
    playCallSound();

    console.log('🚨 Urgent proximity notification sent for position:', position);
}

/**
 * SISTEMA DE ÁUDIO APRIMORADO
 * Sons específicos para diferentes tipos de notificação
 */
function playProximitySound() {
    if (!notificationState.soundEnabled || !NOTIFICATION_CONFIG.sound.warning) return;

    try {
        // Som de proximidade - sequência de 3 beeps
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, i * 500);
        }

    } catch (error) {
        console.log('🔇 Proximity sound not available');
    }
}

/**
 * TOCAR SOM DE CHAMADA
 * Som específico para quando é a vez do usuário
 */
function playCallSound() {
    if (!notificationState.soundEnabled || !NOTIFICATION_CONFIG.sound.call) return;

    try {
        // Parar som anterior se estiver tocando
        if (notificationState.callAudio) {
            notificationState.callAudio.pause();
            notificationState.callAudio.currentTime = 0;
        }

        // Som de chamada - tom contínuo alternado
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        let isPlaying = true;

        const playTone = (frequency, duration) => {
            if (!isPlaying) return;

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };

        // Sequência de tons alternados por 10 segundos
        let count = 0;
        const interval = setInterval(() => {
            if (count >= 20 || !isPlaying) { // 20 tons = ~10 segundos
                clearInterval(interval);
                return;
            }

            const frequency = count % 2 === 0 ? 1000 : 800;
            playTone(frequency, 0.4);
            count++;
        }, 500);

        // Parar após 10 segundos
        setTimeout(() => {
            isPlaying = false;
            clearInterval(interval);
        }, 10000);

        // Salvar referência para poder parar se necessário
        notificationState.callAudio = { 
            pause: () => { isPlaying = false; },
            currentTime: 0
        };

    } catch (error) {
        console.log('🔇 Call sound not available');
    }
}

/**
 * PARAR SOM DE CHAMADA
 * Para o som de chamada se estiver tocando
 */
function stopCallSound() {
    if (notificationState.callAudio) {
        notificationState.callAudio.pause();
        notificationState.callAudio.currentTime = 0;
        notificationState.callAudio = null;
    }
}

/**
 * NOTIFICAÇÕES ESPECÍFICAS DO SISTEMA DE CONSULTAS
 * Funções especializadas para diferentes eventos do sistema
 */

// Notificação de confirmação de pagamento
function sendPaymentConfirmationNotification(appointmentData) {
    const title = '✅ Pagamento Confirmado';
    const message = `Pagamento de ${formatCurrency(appointmentData.price)} confirmado. Você foi adicionado à fila!`;

    // Notificação na tela
    showSuccessNotification(title, message);

    // Push notification
    sendBrowserPushNotification(title, message, {
        tag: 'payment-confirmation'
    });

    // WhatsApp (se configurado)
    if (appointmentData.patientPhone) {
        sendWhatsAppNotification(
            appointmentData.patientPhone,
            `${title}\n\n${message}\n\nID da Consulta: ${appointmentData.id}\nPosição na fila: ${appointmentData.queuePosition}\n\nAcesse: ${window.location.origin}`
        );
    }

    // Email (se configurado)
    if (appointmentData.patientEmail) {
        sendEmailNotification(
            appointmentData.patientEmail,
            title,
            `
                <p>Seu pagamento foi confirmado com sucesso!</p>
                <p><strong>Detalhes da consulta:</strong></p>
                <ul>
                    <li>Especialidade: ${appointmentData.specialty}</li>
                    <li>Valor: ${formatCurrency(appointmentData.price)}</li>
                    <li>ID da Consulta: ${appointmentData.id}</li>
                    <li>Posição na fila: ${appointmentData.queuePosition}</li>
                </ul>
                <p>Você receberá notificações quando estiver próximo de ser atendido.</p>
            `,
            {
                actionUrl: window.location.origin,
                actionText: 'Acessar Fila'
            }
        );
    }
}

// Notificação de mudança de posição na fila
function sendQueuePositionUpdateNotification(newPosition, estimatedWaitTime) {
    if (newPosition <= NOTIFICATION_CONFIG.proximity.urgentThreshold) {
        sendUrgentProximityNotification(newPosition);
    } else if (newPosition <= NOTIFICATION_CONFIG.proximity.threshold) {
        sendProximityNotification(newPosition);
    } else {
        // Notificação simples de atualização
        showInfoNotification(
            'Posição Atualizada',
            `Você está na posição ${newPosition}. Tempo estimado: ${estimatedWaitTime} min`
        );
    }
}

// Notificação de consulta pronta
function sendConsultationReadyNotification(doctorData) {
    const title = '🎥 Sua Consulta Está Pronta!';
    const message = `${doctorData.name} está aguardando você na sala de consulta.`;

    // Notificação na tela (persistente)
    showNotification(title, message, 'urgent', {
        persistent: true,
        onClick: () => {
            if (window.queueSystem && typeof window.queueSystem.joinVideoCall === 'function') {
                window.queueSystem.joinVideoCall();
            }
        }
    });

    // Push notification
    sendBrowserPushNotification(title, message, {
        tag: 'consultation-ready',
        requireInteraction: true,
        onClick: () => {
            window.focus();
            if (window.queueSystem && typeof window.queueSystem.joinVideoCall === 'function') {
                window.queueSystem.joinVideoCall();
            }
        }
    });

    // Som de chamada
    playCallSound();

    console.log('🎥 Consultation ready notification sent');
}

// Demo Notifications (for testing)
function showDemoNotifications() {
    setTimeout(() => showSuccessNotification('Sucesso!', 'Esta é uma notificação de sucesso'), 500);
    setTimeout(() => showInfoNotification('Informação', 'Esta é uma notificação informativa'), 1000);
    setTimeout(() => showWarningNotification('Atenção!', 'Esta é uma notificação de aviso'), 1500);
    setTimeout(() => showErrorNotification('Erro!', 'Esta é uma notificação de erro'), 2000);
    setTimeout(() => {
        // Demonstrar notificação de proximidade
        checkProximityNotifications(3);
    }, 3000);
    setTimeout(() => {
        // Demonstrar notificação urgente
        checkProximityNotifications(1);
    }, 5000);
}

// Export functions
window.showNotification = showNotification;
window.showSuccessNotification = showSuccessNotification;
window.showErrorNotification = showErrorNotification;
window.showWarningNotification = showWarningNotification;
window.showInfoNotification = showInfoNotification;
window.removeNotification = removeNotification;
window.clearAllNotifications = clearAllNotifications;
window.toggleNotificationSound = toggleNotificationSound;
window.showActionNotification = showActionNotification;
window.showAppointmentReminder = showAppointmentReminder;
window.showPaymentNotification = showPaymentNotification;
window.showConnectionNotification = showConnectionNotification;
window.showNewMessageNotification = showNewMessageNotification;
window.exportNotificationSettings = exportNotificationSettings;
window.showDemoNotifications = showDemoNotifications;

// Export multi-channel functions
window.sendBrowserPushNotification = sendBrowserPushNotification;
window.sendWhatsAppNotification = sendWhatsAppNotification;
window.sendEmailNotification = sendEmailNotification;
window.checkProximityNotifications = checkProximityNotifications;
window.sendProximityNotification = sendProximityNotification;
window.sendUrgentProximityNotification = sendUrgentProximityNotification;
window.playCallSound = playCallSound;
window.stopCallSound = stopCallSound;
window.sendPaymentConfirmationNotification = sendPaymentConfirmationNotification;
window.sendQueuePositionUpdateNotification = sendQueuePositionUpdateNotification;
window.sendConsultationReadyNotification = sendConsultationReadyNotification;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadNotificationPreferences();
    initializeNotifications();
});

console.log('✅ TeleMed Notifications System Loaded');