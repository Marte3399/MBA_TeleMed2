// TeleMed - Sistema de Notificações

/**
 * CONFIGURAÇÃO DAS NOTIFICAÇÕES
 * Define comportamentos e aparência do sistema de notificações
 */
const NOTIFICATION_CONFIG = {
    duration: {                 // Duração de exibição por tipo (em milissegundos)
        success: 5000,          // Notificações de sucesso: 5 segundos
        info: 4000,             // Notificações informativas: 4 segundos
        warning: 6000,          // Notificações de aviso: 6 segundos
        error: 8000             // Notificações de erro: 8 segundos
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
        warning: false,         // Som para avisos: desativado
        info: false             // Som para informações: desativado
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
    soundEnabled: true        // Se os sons estão habilitados
};

/**
 * INICIALIZAR SISTEMA DE NOTIFICAÇÕES
 * Configura e inicializa todos os componentes do sistema de notificações
 */
function initializeNotifications() {
    createNotificationContainer();  // Cria o container DOM para as notificações
    setupNotificationStyles();      // Adiciona estilos CSS necessários
    notificationState.isInitialized = true;
    console.log('🔔 Notifications system initialized');
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

// Demo Notifications (for testing)
function showDemoNotifications() {
    setTimeout(() => showSuccessNotification('Sucesso!', 'Esta é uma notificação de sucesso'), 500);
    setTimeout(() => showInfoNotification('Informação', 'Esta é uma notificação informativa'), 1000);
    setTimeout(() => showWarningNotification('Atenção!', 'Esta é uma notificação de aviso'), 1500);
    setTimeout(() => showErrorNotification('Erro!', 'Esta é uma notificação de erro'), 2000);
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadNotificationPreferences();
    initializeNotifications();
});

console.log('✅ TeleMed Notifications System Loaded');