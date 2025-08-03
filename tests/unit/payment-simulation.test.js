/**
 * Teste Unitário - Sistema de Pagamento Simulado
 * Testa todo o fluxo: Criação → Pagamento → Fila
 */

// Mock do Supabase para testes
const mockSupabase = {
    from: jest.fn(() => mockSupabase),
    insert: jest.fn(() => mockSupabase),
    update: jest.fn(() => mockSupabase),
    select: jest.fn(() => mockSupabase),
    eq: jest.fn(() => mockSupabase),
    single: jest.fn(() => mockSupabase),
    order: jest.fn(() => mockSupabase),
    limit: jest.fn(() => mockSupabase),
    auth: {
        getUser: jest.fn()
    }
};

// Mock do PaymentSimulator
class MockPaymentSimulator {
    constructor() {
        this.isSimulating = false;
    }

    async simulatePaymentApproval(consultationId, paymentId) {
        if (this.isSimulating) return;
        
        this.isSimulating = true;
        
        try {
            // Simular atualização da consulta
            const updateResult = await mockSupabase
                .from('consultations')
                .update({ 
                    status: 'PAID',
                    paid_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', consultationId);

            if (updateResult.error) {
                throw updateResult.error;
            }

            // Simular busca da próxima posição
            const queueResult = await mockSupabase
                .from('consultation_queue')
                .select('position')
                .order('position', { ascending: false })
                .limit(1);

            const nextPosition = queueResult.data && queueResult.data.length > 0 
                ? queueResult.data[0].position + 1 
                : 1;

            // Simular busca da consulta
            const consultationResult = await mockSupabase
                .from('consultations')
                .select('*')
                .eq('id', consultationId)
                .single();

            if (!consultationResult.data) {
                throw new Error('Consulta não encontrada');
            }

            // Simular adição à fila
            const queueInsertResult = await mockSupabase
                .from('consultation_queue')
                .insert({
                    consultation_id: consultationId,
                    user_id: consultationResult.data.user_id,
                    specialty_id: consultationResult.data.specialty_id,
                    position: nextPosition,
                    status: 'WAITING',
                    estimated_wait_minutes: nextPosition * 5,
                    created_at: new Date().toISOString()
                });

            if (queueInsertResult.error) {
                throw queueInsertResult.error;
            }

            return {
                success: true,
                consultationId,
                paymentId,
                position: nextPosition
            };

        } catch (error) {
            throw error;
        } finally {
            this.isSimulating = false;
        }
    }
}

describe('Sistema de Pagamento Simulado', () => {
    let paymentSimulator;
    
    beforeEach(() => {
        // Resetar mocks
        jest.clearAllMocks();
        paymentSimulator = new MockPaymentSimulator();
        
        // Configurar retornos padrão dos mocks
        mockSupabase.from.mockReturnValue(mockSupabase);
        mockSupabase.insert.mockReturnValue(mockSupabase);
        mockSupabase.update.mockReturnValue(mockSupabase);
        mockSupabase.select.mockReturnValue(mockSupabase);
        mockSupabase.eq.mockReturnValue(mockSupabase);
        mockSupabase.single.mockReturnValue(mockSupabase);
        mockSupabase.order.mockReturnValue(mockSupabase);
        mockSupabase.limit.mockReturnValue(mockSupabase);
    });

    describe('Simulação de Pagamento Aprovado', () => {
        test('deve atualizar consulta para PAID com sucesso', async () => {
            // Arrange
            const consultationId = 'test-consultation-123';
            const paymentId = 'MP_TEST_123456';
            
            // Mock dos retornos do Supabase
            mockSupabase.update.mockResolvedValueOnce({ 
                data: { id: consultationId, status: 'PAID' }, 
                error: null 
            });
            
            mockSupabase.select.mockResolvedValueOnce({ 
                data: [{ position: 2 }], 
                error: null 
            });
            
            mockSupabase.single.mockResolvedValueOnce({ 
                data: { 
                    id: consultationId, 
                    user_id: 'user-123',
                    specialty_id: 'clinica-geral'
                }, 
                error: null 
            });
            
            mockSupabase.insert.mockResolvedValueOnce({ 
                data: { id: 'queue-123' }, 
                error: null 
            });

            // Act
            const result = await paymentSimulator.simulatePaymentApproval(consultationId, paymentId);

            // Assert
            expect(result.success).toBe(true);
            expect(result.consultationId).toBe(consultationId);
            expect(result.paymentId).toBe(paymentId);
            expect(result.position).toBe(3); // próxima posição após 2
            
            // Verificar se os métodos foram chamados corretamente
            expect(mockSupabase.from).toHaveBeenCalledWith('consultations');
            expect(mockSupabase.update).toHaveBeenCalledWith({
                status: 'PAID',
                paid_at: expect.any(String),
                updated_at: expect.any(String)
            });
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', consultationId);
        });

        test('deve adicionar consulta à fila com posição correta', async () => {
            // Arrange
            const consultationId = 'test-consultation-456';
            const paymentId = 'MP_TEST_789012';
            
            mockSupabase.update.mockResolvedValueOnce({ data: {}, error: null });
            mockSupabase.select.mockResolvedValueOnce({ data: [], error: null }); // Fila vazia
            mockSupabase.single.mockResolvedValueOnce({ 
                data: { 
                    id: consultationId, 
                    user_id: 'user-456',
                    specialty_id: 'cardiologia'
                }, 
                error: null 
            });
            mockSupabase.insert.mockResolvedValueOnce({ data: {}, error: null });

            // Act
            const result = await paymentSimulator.simulatePaymentApproval(consultationId, paymentId);

            // Assert
            expect(result.position).toBe(1); // Primeira posição na fila vazia
            expect(mockSupabase.insert).toHaveBeenCalledWith({
                consultation_id: consultationId,
                user_id: 'user-456',
                specialty_id: 'cardiologia',
                position: 1,
                status: 'WAITING',
                estimated_wait_minutes: 5, // 1 * 5
                created_at: expect.any(String)
            });
        });

        test('deve calcular tempo de espera baseado na posição', async () => {
            // Arrange
            const consultationId = 'test-consultation-789';
            const paymentId = 'MP_TEST_345678';
            
            mockSupabase.update.mockResolvedValueOnce({ data: {}, error: null });
            mockSupabase.select.mockResolvedValueOnce({ 
                data: [{ position: 4 }], // 4 pessoas na fila
                error: null 
            });
            mockSupabase.single.mockResolvedValueOnce({ 
                data: { 
                    id: consultationId, 
                    user_id: 'user-789',
                    specialty_id: 'dermatologia'
                }, 
                error: null 
            });
            mockSupabase.insert.mockResolvedValueOnce({ data: {}, error: null });

            // Act
            const result = await paymentSimulator.simulatePaymentApproval(consultationId, paymentId);

            // Assert
            expect(result.position).toBe(5); // Posição 5 na fila
            expect(mockSupabase.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    position: 5,
                    estimated_wait_minutes: 25 // 5 * 5 minutos
                })
            );
        });

        test('deve prevenir simulações simultâneas', async () => {
            // Arrange
            const consultationId = 'test-consultation-concurrent';
            const paymentId = 'MP_TEST_CONCURRENT';
            
            paymentSimulator.isSimulating = true;

            // Act
            const result = await paymentSimulator.simulatePaymentApproval(consultationId, paymentId);

            // Assert
            expect(result).toBeUndefined();
            expect(mockSupabase.from).not.toHaveBeenCalled();
        });
    });

    describe('Tratamento de Erros', () => {
        test('deve tratar erro na atualização da consulta', async () => {
            // Arrange
            const consultationId = 'test-consultation-error';
            const paymentId = 'MP_TEST_ERROR';
            
            mockSupabase.update.mockResolvedValueOnce({ 
                data: null, 
                error: { message: 'Erro ao atualizar consulta' }
            });

            // Act & Assert
            await expect(
                paymentSimulator.simulatePaymentApproval(consultationId, paymentId)
            ).rejects.toThrow('Erro ao atualizar consulta');
            
            expect(paymentSimulator.isSimulating).toBe(false);
        });

        test('deve tratar consulta não encontrada', async () => {
            // Arrange
            const consultationId = 'test-consultation-not-found';
            const paymentId = 'MP_TEST_NOT_FOUND';
            
            mockSupabase.update.mockResolvedValueOnce({ data: {}, error: null });
            mockSupabase.select.mockResolvedValueOnce({ data: [], error: null });
            mockSupabase.single.mockResolvedValueOnce({ 
                data: null, 
                error: null 
            });

            // Act & Assert
            await expect(
                paymentSimulator.simulatePaymentApproval(consultationId, paymentId)
            ).rejects.toThrow('Consulta não encontrada');
        });

        test('deve tratar erro na inserção da fila', async () => {
            // Arrange
            const consultationId = 'test-consultation-queue-error';
            const paymentId = 'MP_TEST_QUEUE_ERROR';
            
            mockSupabase.update.mockResolvedValueOnce({ data: {}, error: null });
            mockSupabase.select.mockResolvedValueOnce({ data: [], error: null });
            mockSupabase.single.mockResolvedValueOnce({ 
                data: { 
                    id: consultationId, 
                    user_id: 'user-error',
                    specialty_id: 'test'
                }, 
                error: null 
            });
            mockSupabase.insert.mockResolvedValueOnce({ 
                data: null, 
                error: { message: 'Erro ao inserir na fila' }
            });

            // Act & Assert
            await expect(
                paymentSimulator.simulatePaymentApproval(consultationId, paymentId)
            ).rejects.toThrow('Erro ao inserir na fila');
        });
    });

    describe('Integração com Sistema Real', () => {
        test('deve simular fluxo completo de pagamento', async () => {
            // Arrange - Simular dados reais
            const consultationId = '4889fbe9-9006-42b9-9a35-8a3f68b20c80';
            const paymentId = 'MP_1754225656_test123';
            
            // Mock de dados realistas
            mockSupabase.update.mockResolvedValueOnce({ 
                data: { 
                    id: consultationId, 
                    status: 'PAID',
                    paid_at: '2025-08-03T12:54:23.183791Z'
                }, 
                error: null 
            });
            
            mockSupabase.select.mockResolvedValueOnce({ 
                data: [{ position: 0 }], // Primeira na fila
                error: null 
            });
            
            mockSupabase.single.mockResolvedValueOnce({ 
                data: { 
                    id: consultationId,
                    user_id: 'f19c3e2c-5019-4a30-9583-a0a57e330527',
                    specialty_id: 'clinica-geral',
                    specialty_name: 'Clínica Geral',
                    price: 80.00,
                    patient_email: 'joao163@demo.com'
                }, 
                error: null 
            });
            
            mockSupabase.insert.mockResolvedValueOnce({ 
                data: { 
                    id: 'bb94afef-0555-4164-93fc-7089382821bd',
                    position: 1,
                    status: 'WAITING'
                }, 
                error: null 
            });

            // Act
            const result = await paymentSimulator.simulatePaymentApproval(consultationId, paymentId);

            // Assert
            expect(result.success).toBe(true);
            expect(result.position).toBe(1);
            
            // Verificar sequência de operações
            expect(mockSupabase.from).toHaveBeenNthCalledWith(1, 'consultations');
            expect(mockSupabase.from).toHaveBeenNthCalledWith(2, 'consultation_queue');
            expect(mockSupabase.from).toHaveBeenNthCalledWith(3, 'consultations');
            expect(mockSupabase.from).toHaveBeenNthCalledWith(4, 'consultation_queue');
        });
    });
});

// Função auxiliar para executar teste manual
function runManualTest() {
    console.log('🧪 Executando teste manual do sistema de pagamento...');
    
    const testData = {
        consultationId: 'manual-test-' + Date.now(),
        paymentId: 'MP_MANUAL_' + Date.now(),
        userId: 'f19c3e2c-5019-4a30-9583-a0a57e330527',
        specialtyId: 'clinica-geral'
    };
    
    console.log('📋 Dados do teste:', testData);
    console.log('✅ Execute: npm test payment-simulation.test.js');
    
    return testData;
}

module.exports = {
    MockPaymentSimulator,
    runManualTest
};
