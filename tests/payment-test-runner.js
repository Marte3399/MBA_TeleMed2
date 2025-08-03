/**
 * Script de Teste Real - Sistema de Pagamento Simulado
 * Executa testes contra o banco de dados real do Supabase
 */

// Configuração do Supabase (mesma do frontend)
const SUPABASE_URL = 'https://xfgpoixiqppajhgkcwse.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZ3BvaXhpcXBwYWpoZ2tjd3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDYyNTEsImV4cCI6MjA2Njc4MjI1MX0.5zEXy_CnqnJYxEcdi_L3Qd_VrgyM2jiB40VLSr6brXY';

// Simulação do cliente Supabase para Node.js
class SupabaseTestClient {
    constructor() {
        this.baseUrl = SUPABASE_URL;
        this.apiKey = SUPABASE_ANON_KEY;
    }

    async makeRequest(method, endpoint, data = null) {
        const url = `${this.baseUrl}/rest/v1/${endpoint}`;
        const headers = {
            'apikey': this.apiKey,
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };

        const options = {
            method,
            headers
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                return { data: null, error: result };
            }
            
            return { data: result, error: null };
        } catch (error) {
            return { data: null, error: { message: error.message } };
        }
    }

    from(table) {
        return new SupabaseQueryBuilder(this, table);
    }
}

class SupabaseQueryBuilder {
    constructor(client, table) {
        this.client = client;
        this.table = table;
        this.query = {
            select: '*',
            filters: [],
            orderBy: null,
            limit: null
        };
    }

    select(columns = '*') {
        this.query.select = columns;
        return this;
    }

    eq(column, value) {
        this.query.filters.push(`${column}=eq.${value}`);
        return this;
    }

    order(column, options = {}) {
        const direction = options.ascending === false ? 'desc' : 'asc';
        this.query.orderBy = `${column}.${direction}`;
        return this;
    }

    limit(count) {
        this.query.limit = count;
        return this;
    }

    single() {
        this.query.single = true;
        return this;
    }

    async insert(data) {
        const result = await this.client.makeRequest('POST', this.table, data);
        return result;
    }

    async update(data) {
        let endpoint = this.table;
        if (this.query.filters.length > 0) {
            endpoint += '?' + this.query.filters.join('&');
        }
        
        const result = await this.client.makeRequest('PATCH', endpoint, data);
        return result;
    }

    async execute() {
        let endpoint = this.table;
        const params = [];

        if (this.query.select !== '*') {
            params.push(`select=${this.query.select}`);
        }

        if (this.query.filters.length > 0) {
            params.push(...this.query.filters);
        }

        if (this.query.orderBy) {
            params.push(`order=${this.query.orderBy}`);
        }

        if (this.query.limit) {
            params.push(`limit=${this.query.limit}`);
        }

        if (params.length > 0) {
            endpoint += '?' + params.join('&');
        }

        const result = await this.client.makeRequest('GET', endpoint);
        
        if (this.query.single && result.data && Array.isArray(result.data)) {
            result.data = result.data[0] || null;
        }

        return result;
    }

    // Métodos que retornam Promise para compatibilidade
    then(onResolve, onReject) {
        return this.execute().then(onResolve, onReject);
    }

    catch(onReject) {
        return this.execute().catch(onReject);
    }
}

// Classe de teste real
class RealPaymentTester {
    constructor() {
        this.supabase = new SupabaseTestClient();
        this.testResults = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, type };
        this.testResults.push(logEntry);
        
        const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${emoji} [${timestamp}] ${message}`);
    }

    async testCreateConsultation() {
        this.log('Iniciando teste de criação de consulta...', 'info');
        
        const testConsultation = {
            user_id: 'f19c3e2c-5019-4a30-9583-a0a57e330527',
            specialty_id: 'test-payment',
            specialty_name: 'Teste Pagamento',
            price: 99.99,
            payment_id: 'TEST_PAYMENT_' + Date.now(),
            status: 'PENDING',
            patient_name: 'Teste Unitário',
            patient_email: 'teste@unittest.com',
            symptoms: 'Teste automatizado do sistema de pagamento'
        };

        try {
            const result = await this.supabase
                .from('consultations')
                .insert([testConsultation]);

            if (result.error) {
                this.log(`Erro ao criar consulta: ${result.error.message}`, 'error');
                return null;
            }

            const consultationId = result.data[0].id;
            this.log(`Consulta criada com sucesso: ${consultationId}`, 'success');
            return { ...testConsultation, id: consultationId };

        } catch (error) {
            this.log(`Exceção ao criar consulta: ${error.message}`, 'error');
            return null;
        }
    }

    async testPaymentApproval(consultation) {
        this.log(`Testando aprovação de pagamento para consulta ${consultation.id}...`, 'info');

        try {
            const result = await this.supabase
                .from('consultations')
                .update({
                    status: 'PAID',
                    paid_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', consultation.id);

            if (result.error) {
                this.log(`Erro ao aprovar pagamento: ${result.error.message}`, 'error');
                return false;
            }

            this.log('Pagamento aprovado com sucesso', 'success');
            return true;

        } catch (error) {
            this.log(`Exceção ao aprovar pagamento: ${error.message}`, 'error');
            return false;
        }
    }

    async testQueueInsertion(consultation) {
        this.log(`Testando inserção na fila para consulta ${consultation.id}...`, 'info');

        try {
            // Obter próxima posição na fila
            const queueResult = await this.supabase
                .from('consultation_queue')
                .select('position')
                .order('position', { ascending: false })
                .limit(1);

            const nextPosition = queueResult.data && queueResult.data.length > 0 
                ? queueResult.data[0].position + 1 
                : 1;

            this.log(`Próxima posição na fila: ${nextPosition}`, 'info');

            // Inserir na fila
            const insertResult = await this.supabase
                .from('consultation_queue')
                .insert([{
                    consultation_id: consultation.id,
                    user_id: consultation.user_id,
                    specialty_id: consultation.specialty_id,
                    position: nextPosition,
                    status: 'WAITING',
                    estimated_wait_minutes: nextPosition * 5,
                    created_at: new Date().toISOString()
                }]);

            if (insertResult.error) {
                this.log(`Erro ao inserir na fila: ${insertResult.error.message}`, 'error');
                return false;
            }

            const queueId = insertResult.data[0].id;
            this.log(`Inserido na fila com sucesso: ${queueId}, posição: ${nextPosition}`, 'success');
            return { id: queueId, position: nextPosition };

        } catch (error) {
            this.log(`Exceção ao inserir na fila: ${error.message}`, 'error');
            return false;
        }
    }

    async testCompleteFlow() {
        this.log('🚀 Iniciando teste completo do fluxo de pagamento...', 'info');
        
        const startTime = Date.now();
        let success = true;

        // Teste 1: Criar consulta
        const consultation = await this.testCreateConsultation();
        if (!consultation) {
            success = false;
        }

        // Teste 2: Aprovar pagamento
        if (consultation) {
            const paymentApproved = await this.testPaymentApproval(consultation);
            if (!paymentApproved) {
                success = false;
            }

            // Teste 3: Adicionar à fila
            if (paymentApproved) {
                const queueResult = await this.testQueueInsertion(consultation);
                if (!queueResult) {
                    success = false;
                }
            }
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        if (success) {
            this.log(`🎉 Teste completo PASSOU! Duração: ${duration}ms`, 'success');
        } else {
            this.log(`💥 Teste completo FALHOU! Duração: ${duration}ms`, 'error');
        }

        return {
            success,
            duration,
            consultation,
            results: this.testResults
        };
    }

    async cleanup(consultationId) {
        this.log(`🧹 Limpando dados de teste...`, 'info');
        
        try {
            // Remover da fila
            await this.supabase
                .from('consultation_queue')
                .delete()
                .eq('consultation_id', consultationId);

            // Remover consulta
            await this.supabase
                .from('consultations')
                .delete()
                .eq('id', consultationId);

            this.log('Limpeza concluída', 'success');
        } catch (error) {
            this.log(`Erro na limpeza: ${error.message}`, 'warning');
        }
    }
}

// Função principal para executar os testes
async function runPaymentTests() {
    console.log('🧪 TESTE UNITÁRIO - SISTEMA DE PAGAMENTO SIMULADO');
    console.log('================================================');
    
    const tester = new RealPaymentTester();
    
    try {
        const result = await tester.testCompleteFlow();
        
        console.log('\n📊 RESUMO DOS RESULTADOS:');
        console.log('========================');
        console.log(`Status: ${result.success ? '✅ PASSOU' : '❌ FALHOU'}`);
        console.log(`Duração: ${result.duration}ms`);
        console.log(`Consulta ID: ${result.consultation?.id || 'N/A'}`);
        console.log(`Total de logs: ${result.results.length}`);
        
        // Opcional: limpar dados de teste
        if (result.consultation?.id) {
            await tester.cleanup(result.consultation.id);
        }
        
        return result;
        
    } catch (error) {
        console.error('💥 Erro fatal no teste:', error.message);
        return { success: false, error: error.message };
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    runPaymentTests()
        .then(result => {
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Erro:', error);
            process.exit(1);
        });
}

module.exports = {
    RealPaymentTester,
    runPaymentTests
};
