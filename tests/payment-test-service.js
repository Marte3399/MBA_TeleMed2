/**
 * Teste de Pagamento com Service Role
 * Usa service role para contornar RLS durante testes
 */

// Configuração do Supabase com Service Role
const SUPABASE_URL = 'https://xfgpoixiqppajhgkcwse.supabase.co';
// Nota: Em produção, esta chave deveria vir de variável de ambiente
// Nota: Para testes, use a service key do projeto correto xfgpoixiqppajhgkcwse
// Esta chave deve ser obtida do Supabase Dashboard > Settings > API
const SUPABASE_SERVICE_KEY = 'SERVICE_KEY_PLACEHOLDER_FOR_CORRECT_PROJECT';

class ServiceRoleTestClient {
    constructor() {
        this.baseUrl = SUPABASE_URL;
        this.serviceKey = SUPABASE_SERVICE_KEY;
    }

    async makeRequest(method, endpoint, data = null) {
        const url = `${this.baseUrl}/rest/v1/${endpoint}`;
        const headers = {
            'apikey': this.serviceKey,
            'Authorization': `Bearer ${this.serviceKey}`,
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
        return new ServiceQueryBuilder(this, table);
    }
}

class ServiceQueryBuilder {
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

    async delete() {
        let endpoint = this.table;
        if (this.query.filters.length > 0) {
            endpoint += '?' + this.query.filters.join('&');
        }
        
        const result = await this.client.makeRequest('DELETE', endpoint);
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

    then(onResolve, onReject) {
        return this.execute().then(onResolve, onReject);
    }

    catch(onReject) {
        return this.execute().catch(onReject);
    }
}

class PaymentServiceTester {
    constructor() {
        this.supabase = new ServiceRoleTestClient();
        this.testResults = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, type };
        this.testResults.push(logEntry);
        
        const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${emoji} [${timestamp}] ${message}`);
    }

    async testFullPaymentFlow() {
        this.log('🚀 Iniciando teste completo com Service Role...', 'info');
        
        const testId = Date.now();
        const testConsultation = {
            user_id: 'f19c3e2c-5019-4a30-9583-a0a57e330527',
            specialty_id: `test-${testId}`,
            specialty_name: 'Teste Service Role',
            price: 150.00,
            payment_id: `TEST_SERVICE_${testId}`,
            status: 'PENDING',
            patient_name: 'Teste Service Role',
            patient_email: 'service@test.com',
            symptoms: 'Teste automatizado com service role'
        };

        let consultationId = null;
        let success = true;

        try {
            // 1. Criar consulta
            this.log('1️⃣ Criando consulta...', 'info');
            const createResult = await this.supabase
                .from('consultations')
                .insert([testConsultation]);

            if (createResult.error) {
                this.log(`❌ Erro ao criar consulta: ${createResult.error.message}`, 'error');
                return { success: false, error: createResult.error };
            }

            consultationId = createResult.data[0].id;
            this.log(`✅ Consulta criada: ${consultationId}`, 'success');

            // 2. Simular aprovação de pagamento
            this.log('2️⃣ Simulando aprovação de pagamento...', 'info');
            const updateResult = await this.supabase
                .from('consultations')
                .update({
                    status: 'PAID',
                    paid_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', consultationId);

            if (updateResult.error) {
                this.log(`❌ Erro ao atualizar pagamento: ${updateResult.error.message}`, 'error');
                success = false;
            } else {
                this.log('✅ Pagamento aprovado', 'success');
            }

            // 3. Obter próxima posição na fila
            this.log('3️⃣ Calculando posição na fila...', 'info');
            const queueResult = await this.supabase
                .from('consultation_queue')
                .select('position')
                .order('position', { ascending: false })
                .limit(1);

            const nextPosition = queueResult.data && queueResult.data.length > 0 
                ? queueResult.data[0].position + 1 
                : 1;

            this.log(`📊 Próxima posição: ${nextPosition}`, 'info');

            // 4. Adicionar à fila
            this.log('4️⃣ Adicionando à fila de espera...', 'info');
            const queueInsertResult = await this.supabase
                .from('consultation_queue')
                .insert([{
                    consultation_id: consultationId,
                    user_id: testConsultation.user_id,
                    specialty_id: testConsultation.specialty_id,
                    position: nextPosition,
                    status: 'WAITING',
                    estimated_wait_minutes: nextPosition * 5,
                    created_at: new Date().toISOString()
                }]);

            if (queueInsertResult.error) {
                this.log(`❌ Erro ao adicionar à fila: ${queueInsertResult.error.message}`, 'error');
                success = false;
            } else {
                const queueId = queueInsertResult.data[0].id;
                this.log(`✅ Adicionado à fila: ${queueId}, posição: ${nextPosition}`, 'success');
            }

            // 5. Verificar dados finais
            this.log('5️⃣ Verificando dados finais...', 'info');
            const finalConsultation = await this.supabase
                .from('consultations')
                .select('*')
                .eq('id', consultationId)
                .single();

            if (finalConsultation.data) {
                this.log(`📋 Status final da consulta: ${finalConsultation.data.status}`, 'info');
                this.log(`💰 Valor: R$ ${finalConsultation.data.price}`, 'info');
                this.log(`⏰ Pago em: ${finalConsultation.data.paid_at}`, 'info');
            }

            const finalQueue = await this.supabase
                .from('consultation_queue')
                .select('*')
                .eq('consultation_id', consultationId)
                .single();

            if (finalQueue.data) {
                this.log(`🏃 Status na fila: ${finalQueue.data.status}`, 'info');
                this.log(`📍 Posição: ${finalQueue.data.position}`, 'info');
                this.log(`⏱️ Tempo estimado: ${finalQueue.data.estimated_wait_minutes} min`, 'info');
            }

            if (success) {
                this.log('🎉 TESTE COMPLETO PASSOU!', 'success');
            } else {
                this.log('💥 TESTE TEVE FALHAS!', 'error');
            }

            return {
                success,
                consultationId,
                consultation: finalConsultation.data,
                queue: finalQueue.data,
                results: this.testResults
            };

        } catch (error) {
            this.log(`💥 Exceção durante teste: ${error.message}`, 'error');
            return {
                success: false,
                error: error.message,
                consultationId,
                results: this.testResults
            };
        }
    }

    async cleanup(consultationId) {
        if (!consultationId) return;

        this.log('🧹 Limpando dados de teste...', 'info');
        
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

            this.log('✅ Limpeza concluída', 'success');
        } catch (error) {
            this.log(`⚠️ Erro na limpeza: ${error.message}`, 'warning');
        }
    }
}

async function runServiceTest() {
    console.log('🧪 TESTE DE PAGAMENTO COM SERVICE ROLE');
    console.log('=====================================\n');
    
    const tester = new PaymentServiceTester();
    const startTime = Date.now();
    
    try {
        const result = await tester.testFullPaymentFlow();
        const duration = Date.now() - startTime;
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 RESULTADO FINAL');
        console.log('='.repeat(50));
        
        if (result.success) {
            console.log('🎉 TESTE PASSOU COM SUCESSO!');
            console.log(`⏱️  Duração: ${duration}ms`);
            console.log(`📋 Consulta: ${result.consultationId}`);
            console.log(`💰 Valor: R$ ${result.consultation?.price}`);
            console.log(`📍 Posição na fila: ${result.queue?.position}`);
            console.log(`⏱️ Tempo estimado: ${result.queue?.estimated_wait_minutes} min`);
        } else {
            console.log('❌ TESTE FALHOU!');
            console.log(`⏱️  Duração: ${duration}ms`);
            if (result.error) {
                console.log(`💥 Erro: ${result.error}`);
            }
        }
        
        // Cleanup
        if (result.consultationId) {
            await tester.cleanup(result.consultationId);
        }
        
        return result;
        
    } catch (error) {
        console.error('💥 ERRO FATAL:', error.message);
        return { success: false, error: error.message };
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    runServiceTest()
        .then(result => {
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Erro:', error);
            process.exit(1);
        });
}

module.exports = {
    PaymentServiceTester,
    runServiceTest
};
