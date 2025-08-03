// Simulador de Pagamento para Testes
// Este arquivo simula o processo de aprovação de pagamento do Mercado Pago

class PaymentSimulator {
    constructor() {
        this.isSimulating = false;
    }

    // Simular aprovação de pagamento após alguns segundos
    async simulatePaymentApproval(consultationId, paymentId) {
        if (this.isSimulating) return;
        
        this.isSimulating = true;
        console.log('🔄 Simulando aprovação de pagamento...');
        console.log('Consultation ID:', consultationId);
        console.log('Payment ID:', paymentId);

        // Aguardar 5 segundos para simular processamento
        setTimeout(async () => {
            try {
                // Atualizar status da consulta para PAID (pagamento aprovado)
                const { error } = await supabase
                    .from('consultations')
                    .update({ 
                        status: 'PAID',
                        paid_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', consultationId);

                if (error) {
                    console.error('❌ Erro ao atualizar consulta:', error);
                    return;
                }

                // Obter próxima posição na fila
                const { data: queueData } = await supabase
                    .from('consultation_queue')
                    .select('position')
                    .order('position', { ascending: false })
                    .limit(1);

                const nextPosition = queueData && queueData.length > 0 ? queueData[0].position + 1 : 1;

                // Obter dados da consulta
                const { data: consultation } = await supabase
                    .from('consultations')
                    .select('*')
                    .eq('id', consultationId)
                    .single();

                if (!consultation) {
                    console.error('❌ Consulta não encontrada');
                    return;
                }

                // Adicionar à fila de espera
                const { error: queueError } = await supabase
                    .from('consultation_queue')
                    .insert({
                        consultation_id: consultationId,
                        user_id: consultation.user_id,
                        specialty_id: consultation.specialty_id,
                        position: nextPosition,
                        status: 'WAITING',
                        estimated_wait_minutes: nextPosition * 5,
                        created_at: new Date().toISOString()
                    });

                if (queueError) {
                    console.error('❌ Erro ao adicionar à fila:', queueError);
                    return;
                }

                console.log('✅ Pagamento aprovado e consulta adicionada à fila!');
                console.log('Posição na fila:', nextPosition);

                // Simular que após mais alguns segundos a consulta fica pronta
                this.simulateConsultationReady(consultationId, 10000); // 10 segundos

            } catch (error) {
                console.error('❌ Erro na simulação de pagamento:', error);
            } finally {
                this.isSimulating = false;
            }
        }, 5000); // 5 segundos para simular processamento do pagamento
    }

    // Simular que a consulta está pronta para atendimento
    async simulateConsultationReady(consultationId, delay = 5000) {
        console.log('⏰ Simulando consulta pronta em', delay / 1000, 'segundos...');

        setTimeout(async () => {
            try {
                // Atualizar status da fila para READY
                const { error } = await supabase
                    .from('consultation_queue')
                    .update({ 
                        status: 'READY',
                        called_at: new Date().toISOString()
                    })
                    .eq('consultation_id', consultationId);

                if (error) {
                    console.error('❌ Erro ao marcar consulta como pronta:', error);
                    return;
                }

                console.log('🎉 Consulta pronta para atendimento!');

            } catch (error) {
                console.error('❌ Erro ao simular consulta pronta:', error);
            }
        }, delay);
    }

    // Função para testar manualmente
    async testPaymentFlow() {
        console.log('🧪 Iniciando teste do fluxo de pagamento...');
        
        // Buscar a última consulta PENDING do usuário atual
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.error('❌ Usuário não logado');
            return;
        }

        const { data: consultation } = await supabase
            .from('consultations')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!consultation) {
            console.log('ℹ️ Nenhuma consulta pendente encontrada. Faça um pagamento primeiro.');
            return;
        }

        console.log('📋 Consulta encontrada:', consultation.id);
        await this.simulatePaymentApproval(consultation.id, consultation.payment_id);
    }
}

// Criar instância global
window.paymentSimulator = new PaymentSimulator();

// Adicionar função global para testes
window.testPaymentFlow = () => {
    window.paymentSimulator.testPaymentFlow();
};

// Adicionar botão de teste no console (apenas para desenvolvimento)
console.log('🧪 Para testar o fluxo de pagamento, digite: testPaymentFlow()');
