// Sistema de Gerenciamento de Consultas
class ConsultationsManager {
    constructor() {
        this.consultations = [];
        this.realtimeSubscription = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Verificar se o usuário está logado
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.log('Usuário não logado');
                return;
            }

            this.currentUser = session.user;
            console.log('✅ ConsultationsManager inicializado para:', this.currentUser.email);

            // Carregar consultas existentes
            await this.loadConsultations();

            // Configurar escuta em tempo real
            this.setupRealtimeSubscription();

            // Renderizar interface
            this.renderConsultations();

        } catch (error) {
            console.error('❌ Erro ao inicializar ConsultationsManager:', error);
        }
    }

    // Carregar consultas do banco de dados
    async loadConsultations() {
        try {
            const { data, error } = await supabase
                .from('consultations')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.consultations = data || [];
            console.log('📋 Consultas carregadas:', this.consultations.length);

        } catch (error) {
            console.error('❌ Erro ao carregar consultas:', error);
        }
    }

    // Configurar escuta em tempo real para atualizações
    setupRealtimeSubscription() {
        // Subscription para mudanças nas consultas
        this.appointmentsSubscription = supabase
            .channel('consultations_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'consultations',
                filter: `user_id=eq.${this.currentUser.id}`
            }, this.handleConsultationUpdate.bind(this))
            .subscribe();

        // Subscription para mudanças na fila
        this.queueSubscription = supabase
            .channel('queue_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'consultation_queue',
                filter: `user_id=eq.${this.currentUser.id}`
            }, this.handleQueueUpdate.bind(this))
            .subscribe();

        console.log('👂 Escuta em tempo real configurada');
    }

    // Lidar com atualizações de consulta
    async handleConsultationUpdate(payload) {
        if (payload.eventType === 'UPDATE') {
            const updatedConsultation = payload.new;
            
            // Se a consulta foi marcada como waiting (pagamento aprovado), recarregar dados
            if (updatedConsultation.status === 'waiting') {
                console.log('💳 Pagamento confirmado para consulta:', updatedConsultation.id);
                await this.loadConsultations();
                this.renderConsultations();
                
                // Mostrar notificação de pagamento aprovado
                this.showPaymentApprovedNotification(updatedConsultation);
            }
        }
    }

    // Lidar com atualizações da fila
    async handleQueueUpdate(payload) {
        if (payload.eventType === 'UPDATE') {
            const queueUpdate = payload.new;
            
            // Se o status mudou para READY, mostrar notificação de consulta pronta
            if (queueUpdate.status === 'READY') {
                console.log('🎉 Consulta pronta:', queueUpdate.consultation_id);
                await this.loadConsultations();
                this.renderConsultations();
                this.showConsultationReadyNotification(queueUpdate);
            }
        }

        // Atualizar posição na fila em tempo real
        await this.loadConsultations();
        this.renderConsultations();
    }

    // Mostrar notificação de pagamento aprovado
    showPaymentApprovedNotification(consultation) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-6 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-start">
                <div class="text-2xl mr-3">✅</div>
                <div>
                    <div class="font-bold">Pagamento Aprovado!</div>
                    <div class="text-sm opacity-90 mt-1">
                        Sua consulta de ${consultation.specialty_name} foi confirmada. 
                        Você foi adicionado à fila de espera.
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Remover após 5 segundos
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 5000);
    }

    // Mostrar notificação de consulta pronta
    showConsultationReadyNotification(queueItem) {
        // Usar a modal existente do dashboard
        const consultation = this.consultations.find(c => c.id === queueItem.consultation_id);
        if (consultation) {
            // Preencher dados da modal
            document.getElementById('doctorName').textContent = 'Dr. João Silva'; // Simulado
            document.getElementById('doctorSpecialty').textContent = consultation.specialty_name;
            document.getElementById('doctorCrm').textContent = '12345-SP'; // Simulado

            // Mostrar modal
            document.getElementById('consultationNotification').classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            // Tocar som de notificação
            this.playNotificationSound();
        }
    }

    // Tocar som de notificação
    playNotificationSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            audio.play().catch(() => {}); // Ignorar erros de autoplay
        } catch (error) {
            console.log('Som de notificação não disponível');
        }
    }

    // Renderizar lista de consultas
    renderConsultations() {
        console.log('🎨 Renderizando consultas:', this.consultations.length);
        const container = document.getElementById('appointmentsContent');
        if (!container) {
            console.error('❌ Container appointmentsContent não encontrado!');
            return;
        }

        console.log('📊 Consultas para renderizar:', this.consultations);

        if (this.consultations.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">📋</div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">Nenhuma consulta encontrada</h3>
                    <p class="text-gray-600 mb-6">Você ainda não possui consultas agendadas.</p>
                    <button onclick="showSection('specialties')" 
                            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                        Agendar Primeira Consulta
                    </button>
                </div>
            `;
            return;
        }


        // Filtrar consultas por status
        const pending = this.consultations.filter(c => c.status === 'PENDING');
        const paid = this.consultations.filter(c => c.status === 'PAID');
        const completed = this.consultations.filter(c => c.status === 'COMPLETED');
        
        console.log('📊 Status das consultas:');
        console.log('- PENDING:', pending.length, pending.map(c => ({id: c.id, status: c.status})));
        console.log('- PAID:', paid.length, paid.map(c => ({id: c.id, status: c.status})));
        console.log('- COMPLETED:', completed.length, completed.map(c => ({id: c.id, status: c.status})));
        console.log('- Todos os status:', this.consultations.map(c => c.status));

        let html = '';

        // Consultas pendentes (aguardando pagamento)
        if (pending.length > 0) {
            html += `
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-gray-900 mb-4">⏳ Aguardando Pagamento</h3>
                    <div class="space-y-4">
                        ${pending.map(consultation => this.renderConsultationCard(consultation)).join('')}
                    </div>
                </div>
            `;
        }

        // Consultas pagas (na fila)
        if (paid.length > 0) {
            html += `
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-gray-900 mb-4">🎯 Na Fila de Atendimento</h3>
                    <div class="space-y-4">
                        ${paid.map(consultation => this.renderConsultationCard(consultation)).join('')}
                    </div>
                </div>
            `;
        }

        // Consultas concluídas
        if (completed.length > 0) {
            html += `
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-gray-900 mb-4">✅ Concluídas</h3>
                    <div class="space-y-4">
                        ${completed.map(consultation => this.renderConsultationCard(consultation)).join('')}
                    </div>
                </div>
            `;
        }

        console.log('🎨 HTML final gerado:', html.length > 0 ? 'COM CONTEÚDO' : 'VAZIO');
        console.log('🎨 HTML preview:', html.substring(0, 200));
        container.innerHTML = html;
    }

    // Renderizar card individual de consulta
    renderConsultationCard(consultation) {
        const statusConfig = {
            'PENDING': {
                color: 'yellow',
                icon: '⏳',
                text: 'Aguardando Pagamento',
                description: 'Complete o pagamento para entrar na fila'
            },
            'PAID': {
                color: 'blue',
                icon: '🎯',
                text: 'Na Fila',
                description: 'Aguardando atendimento médico'
            },
            'COMPLETED': {
                color: 'green',
                icon: '✅',
                text: 'Concluída',
                description: 'Consulta realizada com sucesso'
            }
        };

        const config = statusConfig[consultation.status] || statusConfig['PENDING'];
        const queueInfo = consultation.consultation_queue?.[0];

        return `
            <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center mb-2">
                            <span class="text-2xl mr-3">${config.icon}</span>
                            <div>
                                <h4 class="text-lg font-bold text-gray-900">${consultation.specialty_name}</h4>
                                <p class="text-sm text-gray-600">${new Date(consultation.created_at).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800">
                                ${config.text}
                            </span>
                        </div>
                        
                        <p class="text-gray-600 text-sm mb-3">${config.description}</p>
                        
                        ${queueInfo ? `
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="text-lg font-bold text-blue-600">Posição ${queueInfo.position}</div>
                                        <div class="text-sm text-blue-800">
                                            Tempo estimado: ${queueInfo.position * 5} minutos
                                        </div>
                                    </div>
                                    <div class="text-2xl">⏰</div>
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="text-sm text-gray-500">
                            <strong>Valor:</strong> R$ ${parseFloat(consultation.price).toFixed(2).replace('.', ',')}
                        </div>
                    </div>
                    
                    <div class="ml-4">
                        ${consultation.status === 'waiting' && queueInfo?.status === 'ready' ? `
                            <button onclick="startVideoCall('${consultation.id}')" 
                                    class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium">
                                🎥 Entrar na Consulta
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Limpar recursos ao destruir
    destroy() {
        if (this.realtimeSubscription) {
            supabase.removeChannel(this.realtimeSubscription);
        }
    }
}

// Inicializar quando a página carregar
let consultationsManager;

document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que o Supabase foi inicializado
    setTimeout(() => {
        consultationsManager = new ConsultationsManager();
    }, 1000);
});

// Limpar ao sair da página
window.addEventListener('beforeunload', () => {
    if (consultationsManager) {
        consultationsManager.destroy();
    }
});

// Exportar para uso global
window.consultationsManager = consultationsManager;
