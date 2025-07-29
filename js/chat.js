// TeleMed - Sistema de Chat

/**
 * CONFIGURAÇÃO DO CHAT
 * Define parâmetros e comportamentos do sistema de chat da plataforma
 */
const CHAT_CONFIG = {
    maxMessageLength: 500,        // Limite máximo de caracteres por mensagem
    typingTimeout: 3000,          // Tempo limite para indicador de digitação (ms)
    messageRetryAttempts: 3,      // Número de tentativas para reenviar mensagem
    autoResponses: {              // Configuração de respostas automáticas (simulação)
        enabled: true,            // Se respostas automáticas estão ativadas
        delay: 2000,              // Delay antes de enviar resposta automática (ms)
        responses: [              // Lista de respostas automáticas possíveis
            'Entendo. Pode me dar mais detalhes sobre os sintomas?',
            'Vou anotar isso no seu prontuário.',
            'Baseado no que você descreveu, vou fazer algumas perguntas.',
            'Recomendo que você faça alguns exames complementares.',
            'Vou prescrever um medicamento para você.',
            'Isso é normal, não se preocupe.',
            'Vou agendar um retorno para acompanhar sua evolução.',
            'Tem alguma dúvida sobre o tratamento?'
        ]
    }
};

/**
 * ESTADO DO CHAT
 * Armazena todas as informações do estado atual do sistema de chat
 */
let chatState = {
    isOpen: false,              // Se a janela de chat está aberta
    isTyping: false,            // Se o usuário está digitando
    currentConversation: null,  // Conversa atual ativa
    messages: [],               // Array com todas as mensagens
    typingTimer: null,          // Timer para indicador de digitação
    lastMessageTime: null,      // Timestamp da última mensagem
    unreadCount: 0,             // Número de mensagens não lidas
    isConnected: true           // Status da conexão com o servidor
};

// Sample Chat Messages
const SAMPLE_MESSAGES = [
    {
        id: 1,
        sender: 'Dr. Roberto Santos',
        senderType: 'doctor',
        message: 'Olá! Como posso ajudá-lo hoje?',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        read: true
    },
    {
        id: 2,
        sender: 'João Silva',
        senderType: 'patient',
        message: 'Olá doutor! Estou com dores no peito.',
        timestamp: new Date(Date.now() - 240000), // 4 minutes ago
        read: true
    },
    {
        id: 3,
        sender: 'Dr. Roberto Santos',
        senderType: 'doctor',
        message: 'Entendo. Pode me descrever melhor essas dores? Quando começaram?',
        timestamp: new Date(Date.now() - 180000), // 3 minutes ago
        read: true
    }
];

/**
 * INICIALIZAR SISTEMA DE CHAT
 * Configura e inicializa todos os componentes do sistema de chat
 */
function initializeChat() {
    loadChatHistory();           // Carrega histórico de mensagens salvas
    setupChatEventListeners();   // Configura eventos de teclado e input
    console.log('💬 Chat system initialized');
}

/**
 * CARREGAR HISTÓRICO DO CHAT
 * Carrega mensagens salvas do localStorage ou usa mensagens de exemplo
 */
function loadChatHistory() {
    const stored = localStorage.getItem('telemed-chat-messages');
    if (stored) {
        try {
            // Converte JSON salvo de volta para array de mensagens
            chatState.messages = JSON.parse(stored);
        } catch (e) {
            // Se houver erro na conversão, usa mensagens de exemplo
            console.error('Error loading chat history:', e);
            chatState.messages = [...SAMPLE_MESSAGES];
        }
    } else {
        // Se não há histórico salvo, usa mensagens de exemplo
        chatState.messages = [...SAMPLE_MESSAGES];
    }
}

// Save Chat History
function saveChatHistory() {
    localStorage.setItem('telemed-chat-messages', JSON.stringify(chatState.messages));
}

// Setup Chat Event Listeners
function setupChatEventListeners() {
    // Enter key to send message
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.id === 'chatInput') {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Input event for typing indicator
    document.addEventListener('input', function(e) {
        if (e.target.id === 'chatInput') {
            handleTyping();
        }
    });
}

// Open Chat
function openChat() {
    if (!checkSession()) return;
    
    chatState.isOpen = true;
    
    // Update modal content
    updateChatModal();
    
    // Show chat modal
    document.getElementById('chatModal').classList.remove('hidden');
    
    // Focus on input
    setTimeout(() => {
        const input = document.getElementById('chatInput');
        if (input) {
            input.focus();
        }
    }, 500);
    
    // Mark messages as read
    markMessagesAsRead();
    
    // Update unread count
    updateUnreadCount();
}

// Close Chat
function closeChat() {
    chatState.isOpen = false;
    closeModal('chatModal');
    
    // Clear typing timer
    if (chatState.typingTimer) {
        clearTimeout(chatState.typingTimer);
        chatState.typingTimer = null;
    }
}

// Update Chat Modal
function updateChatModal() {
    const modal = document.getElementById('chatModal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Get current conversation partner
    const partner = getCurrentConversationPartner();
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    ${partner.avatar}
                </div>
                <div>
                    <h3 class="text-lg font-bold text-gray-900">${partner.name}</h3>
                    <div class="text-sm text-gray-500">
                        <span class="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>
                        Online
                    </div>
                </div>
            </div>
            <button onclick="closeChat()" class="modal-close">&times;</button>
        </div>
        <div class="modal-body p-0">
            <div id="chatMessages" class="h-64 overflow-y-auto p-4 bg-gray-50 border-y">
                ${renderChatMessages()}
            </div>
            <div class="p-4">
                <div id="typingIndicator" class="text-sm text-gray-500 mb-2 hidden">
                    ${partner.name} está digitando...
                </div>
                <div class="flex space-x-2">
                    <input type="text" id="chatInput" placeholder="Digite sua mensagem..." 
                           maxlength="${CHAT_CONFIG.maxMessageLength}"
                           class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <button onclick="sendMessage()" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        📤
                    </button>
                    <button onclick="openFileUpload()" 
                            class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                        📎
                    </button>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                    <span id="charCount">0</span>/${CHAT_CONFIG.maxMessageLength} caracteres
                </div>
            </div>
        </div>
    `;
    
    // Setup character counter
    setupCharacterCounter();
}

// Get Current Conversation Partner
function getCurrentConversationPartner() {
    if (!TeleMed.currentUser) return { name: 'Médico', avatar: '👨‍⚕️' };
    
    const role = TeleMed.currentUser.role;
    
    if (role === 'patient') {
        return { name: 'Dr. Roberto Santos', avatar: '👨‍⚕️' };
    } else if (role === 'doctor') {
        return { name: 'João Silva', avatar: '👨‍🦱' };
    } else {
        return { name: 'Suporte', avatar: '👨‍💼' };
    }
}

// Render Chat Messages
function renderChatMessages() {
    if (chatState.messages.length === 0) {
        return `
            <div class="text-center py-8">
                <div class="text-4xl mb-2">💬</div>
                <p class="text-gray-500">Nenhuma mensagem ainda</p>
                <p class="text-sm text-gray-400">Comece a conversar!</p>
            </div>
        `;
    }
    
    return chatState.messages.map(msg => {
        const isCurrentUser = msg.senderType === TeleMed.currentUser.role;
        const messageClass = isCurrentUser ? 'sent' : 'received';
        const bubbleClass = isCurrentUser ? 'chat-bubble sent' : 'chat-bubble received';
        
        return `
            <div class="chat-message ${messageClass}">
                <div class="text-xs text-gray-500 mb-1">
                    ${msg.sender} - ${formatTime(msg.timestamp)}
                </div>
                <div class="${bubbleClass}">
                    ${msg.message}
                </div>
            </div>
        `;
    }).join('');
}

// Send Message
function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Clear input
    input.value = '';
    updateCharacterCounter();
    
    // Create message object
    const messageObj = {
        id: generateId(),
        sender: TeleMed.currentUser.name,
        senderType: TeleMed.currentUser.role,
        message: message,
        timestamp: new Date(),
        read: false
    };
    
    // Add to messages
    chatState.messages.push(messageObj);
    
    // Save to localStorage
    saveChatHistory();
    
    // Update chat display
    updateChatDisplay();
    
    // Simulate response (if auto-responses are enabled)
    if (CHAT_CONFIG.autoResponses.enabled) {
        setTimeout(() => {
            simulateResponse();
        }, CHAT_CONFIG.autoResponses.delay);
    }
    
    // Update last message time
    chatState.lastMessageTime = new Date();
}

// Simulate Response
function simulateResponse() {
    const responses = CHAT_CONFIG.autoResponses.responses;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const partner = getCurrentConversationPartner();
    
    const responseObj = {
        id: generateId(),
        sender: partner.name,
        senderType: TeleMed.currentUser.role === 'patient' ? 'doctor' : 'patient',
        message: randomResponse,
        timestamp: new Date(),
        read: false
    };
    
    // Show typing indicator
    showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator();
        
        // Add response to messages
        chatState.messages.push(responseObj);
        
        // Save to localStorage
        saveChatHistory();
        
        // Update chat display
        updateChatDisplay();
        
        // Update unread count if chat is closed
        if (!chatState.isOpen) {
            chatState.unreadCount++;
            updateUnreadCount();
        }
    }, 1500);
}

// Update Chat Display
function updateChatDisplay() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    container.innerHTML = renderChatMessages();
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Handle Typing
function handleTyping() {
    if (!chatState.isConnected) return;
    
    // Clear existing timer
    if (chatState.typingTimer) {
        clearTimeout(chatState.typingTimer);
    }
    
    // Show typing indicator for other user (simulation)
    if (Math.random() < 0.3) { // 30% chance
        showTypingIndicator();
        
        chatState.typingTimer = setTimeout(() => {
            hideTypingIndicator();
        }, CHAT_CONFIG.typingTimeout);
    }
}

// Show Typing Indicator
function showTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.classList.remove('hidden');
    }
}

// Hide Typing Indicator
function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.classList.add('hidden');
    }
}

// Setup Character Counter
function setupCharacterCounter() {
    const input = document.getElementById('chatInput');
    const counter = document.getElementById('charCount');
    
    if (input && counter) {
        input.addEventListener('input', updateCharacterCounter);
        updateCharacterCounter();
    }
}

// Update Character Counter
function updateCharacterCounter() {
    const input = document.getElementById('chatInput');
    const counter = document.getElementById('charCount');
    
    if (input && counter) {
        counter.textContent = input.value.length;
        
        // Change color based on length
        if (input.value.length > CHAT_CONFIG.maxMessageLength * 0.8) {
            counter.className = 'text-red-500';
        } else if (input.value.length > CHAT_CONFIG.maxMessageLength * 0.6) {
            counter.className = 'text-yellow-500';
        } else {
            counter.className = 'text-gray-500';
        }
    }
}

// Open File Upload
function openFileUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx,.txt';
    input.multiple = true;
    
    input.onchange = function(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            sendFileMessage(file);
        });
    };
    
    input.click();
}

// Send File Message
function sendFileMessage(file) {
    const fileMessage = {
        id: generateId(),
        sender: TeleMed.currentUser.name,
        senderType: TeleMed.currentUser.role,
        message: `📎 Arquivo enviado: ${file.name}`,
        timestamp: new Date(),
        read: false,
        file: {
            name: file.name,
            size: file.size,
            type: file.type
        }
    };
    
    chatState.messages.push(fileMessage);
    saveChatHistory();
    updateChatDisplay();
    
    // Show notification
    showNotification('Arquivo enviado', `${file.name} foi enviado`, 'success');
    
    // Simulate response
    setTimeout(() => {
        const responseObj = {
            id: generateId(),
            sender: getCurrentConversationPartner().name,
            senderType: TeleMed.currentUser.role === 'patient' ? 'doctor' : 'patient',
            message: 'Arquivo recebido! Vou analisar e te dar um retorno.',
            timestamp: new Date(),
            read: false
        };
        
        chatState.messages.push(responseObj);
        saveChatHistory();
        updateChatDisplay();
    }, 2000);
}

// Mark Messages as Read
function markMessagesAsRead() {
    chatState.messages.forEach(msg => {
        if (msg.senderType !== TeleMed.currentUser.role) {
            msg.read = true;
        }
    });
    
    saveChatHistory();
    chatState.unreadCount = 0;
}

// Update Unread Count
function updateUnreadCount() {
    // This would update a badge or indicator in the UI
    // For now, we'll just log it
    console.log('💬 Unread messages:', chatState.unreadCount);
}

// Clear Chat History
function clearChatHistory() {
    if (confirm('Tem certeza que deseja apagar todo o histórico de chat?')) {
        chatState.messages = [];
        saveChatHistory();
        updateChatDisplay();
        showNotification('Chat limpo', 'Histórico de mensagens apagado', 'success');
    }
}

// Export Chat History
function exportChatHistory() {
    const chatData = {
        participant: getCurrentConversationPartner().name,
        messages: chatState.messages,
        exportedAt: new Date(),
        exportedBy: TeleMed.currentUser.name
    };
    
    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    showNotification('Histórico exportado', 'Arquivo salvo em Downloads', 'success');
}

// Search Messages
function searchMessages(query) {
    if (!query.trim()) return chatState.messages;
    
    return chatState.messages.filter(msg => 
        msg.message.toLowerCase().includes(query.toLowerCase()) ||
        msg.sender.toLowerCase().includes(query.toLowerCase())
    );
}

// Get Chat Statistics
function getChatStatistics() {
    const stats = {
        totalMessages: chatState.messages.length,
        messagesByCurrentUser: chatState.messages.filter(msg => msg.senderType === TeleMed.currentUser.role).length,
        messagesByOther: chatState.messages.filter(msg => msg.senderType !== TeleMed.currentUser.role).length,
        averageMessageLength: chatState.messages.reduce((sum, msg) => sum + msg.message.length, 0) / chatState.messages.length || 0,
        firstMessage: chatState.messages[0]?.timestamp,
        lastMessage: chatState.messages[chatState.messages.length - 1]?.timestamp
    };
    
    return stats;
}

// Connection Status
function updateConnectionStatus(isConnected) {
    chatState.isConnected = isConnected;
    
    if (!isConnected) {
        showNotification('Conexão perdida', 'Tentando reconectar...', 'warning');
    } else {
        showNotification('Conectado', 'Chat online', 'success');
    }
}

// Simulate connection issues
setInterval(() => {
    if (Math.random() < 0.01) { // 1% chance every 10 seconds
        updateConnectionStatus(false);
        
        setTimeout(() => {
            updateConnectionStatus(true);
        }, 3000);
    }
}, 10000);

// Export functions
window.openChat = openChat;
window.closeChat = closeChat;
window.sendMessage = sendMessage;
window.openFileUpload = openFileUpload;
window.clearChatHistory = clearChatHistory;
window.exportChatHistory = exportChatHistory;
window.searchMessages = searchMessages;
window.getChatStatistics = getChatStatistics;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
});

console.log('✅ TeleMed Chat System Loaded');