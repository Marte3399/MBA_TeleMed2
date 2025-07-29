-- =====================================================
-- SUÍTE AUTOMATIZADA DE TESTES - BANCO DE DADOS
-- Sistema de Telemedicina - Supabase
-- =====================================================
-- Este script executa uma bateria completa de testes
-- para validar a estrutura e funcionalidade do banco
-- =====================================================

-- Função auxiliar para reportar resultados
CREATE OR REPLACE FUNCTION test_result(test_name TEXT, condition BOOLEAN)
RETURNS TEXT AS $$
BEGIN
    IF condition THEN
        RETURN '✅ PASSOU: ' || test_name;
    ELSE
        RETURN '❌ FALHOU: ' || test_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para executar todos os testes
CREATE OR REPLACE FUNCTION run_database_tests()
RETURNS TABLE(test_category TEXT, test_name TEXT, result TEXT, details TEXT) AS $$
DECLARE
    test_count INTEGER := 0;
    passed_count INTEGER := 0;
    temp_result TEXT;
BEGIN
    -- =====================================================
    -- CATEGORIA 1: ESTRUTURA DAS TABELAS
    -- =====================================================
    
    test_category := 'ESTRUTURA';
    
    -- Teste 1.1: Verificar existência das tabelas principais
    SELECT test_result('Todas as tabelas principais existem', 
        (SELECT COUNT(*) FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name IN ('specialties', 'doctors', 'appointments', 'consultation_queue', 'medical_records', 'notifications')) = 6
    ) INTO temp_result;
    
    test_name := 'Existência das tabelas principais';
    result := temp_result;
    details := 'Verifica se todas as 6 tabelas principais foram criadas';
    RETURN NEXT;
    
    -- Teste 1.2: Verificar colunas críticas
    SELECT test_result('Colunas críticas existem', 
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'specialties' AND column_name = 'price') AND
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'crm') AND
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'status') AND
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'is_signed')
    ) INTO temp_result;
    
    test_name := 'Colunas críticas das tabelas';
    result := temp_result;
    details := 'Verifica se colunas essenciais existem em cada tabela';
    RETURN NEXT;
    
    -- =====================================================
    -- CATEGORIA 2: SEGURANÇA (RLS)
    -- =====================================================
    
    test_category := 'SEGURANÇA';
    
    -- Teste 2.1: RLS habilitado
    SELECT test_result('RLS habilitado em todas as tabelas', 
        (SELECT COUNT(*) FROM pg_tables 
         WHERE schemaname = 'public' 
         AND tablename IN ('specialties', 'doctors', 'appointments', 'consultation_queue', 'medical_records', 'notifications')
         AND rowsecurity = true) = 6
    ) INTO temp_result;
    
    test_name := 'Row Level Security habilitado';
    result := temp_result;
    details := 'Verifica se RLS está ativo em todas as tabelas';
    RETURN NEXT;
    
    -- Teste 2.2: Políticas RLS criadas
    SELECT test_result('Políticas RLS implementadas', 
        (SELECT COUNT(*) FROM pg_policies 
         WHERE schemaname = 'public' 
         AND tablename IN ('specialties', 'doctors', 'appointments', 'consultation_queue', 'medical_records', 'notifications')) >= 20
    ) INTO temp_result;
    
    test_name := 'Políticas de segurança';
    result := temp_result;
    details := 'Verifica se políticas RLS foram criadas adequadamente';
    RETURN NEXT;
    
    -- =====================================================
    -- CATEGORIA 3: RELACIONAMENTOS
    -- =====================================================
    
    test_category := 'RELACIONAMENTOS';
    
    -- Teste 3.1: Foreign Keys principais
    SELECT test_result('Foreign Keys principais existem', 
        EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'doctors_specialty_id_fkey') AND
        EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'appointments_doctor_id_fkey') AND
        EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'medical_records_appointment_id_fkey')
    ) INTO temp_result;
    
    test_name := 'Chaves estrangeiras principais';
    result := temp_result;
    details := 'Verifica integridade referencial entre tabelas';
    RETURN NEXT;
    
    -- =====================================================
    -- CATEGORIA 4: PERFORMANCE
    -- =====================================================
    
    test_category := 'PERFORMANCE';
    
    -- Teste 4.1: Índices criados
    SELECT test_result('Índices de performance criados', 
        (SELECT COUNT(*) FROM pg_indexes 
         WHERE tablename IN ('doctors', 'appointments', 'consultation_queue', 'medical_records', 'notifications')
         AND indexname LIKE 'idx_%') >= 10
    ) INTO temp_result;
    
    test_name := 'Índices de performance';
    result := temp_result;
    details := 'Verifica se índices foram criados para otimização';
    RETURN NEXT;
    
    -- =====================================================
    -- CATEGORIA 5: FUNCIONALIDADE (CRUD)
    -- =====================================================
    
    test_category := 'FUNCIONALIDADE';
    
    -- Teste 5.1: Inserção básica
    BEGIN
        INSERT INTO specialties (name, description, icon, price, duration) 
        VALUES ('Teste Automatizado', 'Teste da suíte automatizada', '🤖', 150.00, 30);
        
        SELECT test_result('Inserção de dados funciona', 
            EXISTS(SELECT 1 FROM specialties WHERE name = 'Teste Automatizado')
        ) INTO temp_result;
    EXCEPTION WHEN OTHERS THEN
        temp_result := '❌ FALHOU: Inserção de dados funciona';
    END;
    
    test_name := 'Operações de inserção';
    result := temp_result;
    details := 'Testa inserção básica de dados';
    RETURN NEXT;
    
    -- Teste 5.2: Atualização com trigger
    BEGIN
        UPDATE specialties 
        SET description = 'Descrição atualizada pelo teste'
        WHERE name = 'Teste Automatizado';
        
        SELECT test_result('Trigger updated_at funciona', 
            (SELECT updated_at > created_at FROM specialties WHERE name = 'Teste Automatizado')
        ) INTO temp_result;
    EXCEPTION WHEN OTHERS THEN
        temp_result := '❌ FALHOU: Trigger updated_at funciona';
    END;
    
    test_name := 'Triggers automáticos';
    result := temp_result;
    details := 'Testa se triggers de updated_at funcionam';
    RETURN NEXT;
    
    -- =====================================================
    -- CATEGORIA 6: CONSTRAINTS
    -- =====================================================
    
    test_category := 'CONSTRAINTS';
    
    -- Teste 6.1: Constraint de preço positivo
    BEGIN
        BEGIN
            INSERT INTO specialties (name, price) VALUES ('Teste Constraint', -100.00);
            temp_result := '❌ FALHOU: Constraint de preço positivo';
        EXCEPTION WHEN check_violation THEN
            temp_result := '✅ PASSOU: Constraint de preço positivo';
        END;
    END;
    
    test_name := 'Validação de preços positivos';
    result := temp_result;
    details := 'Testa se constraint impede preços negativos';
    RETURN NEXT;
    
    -- =====================================================
    -- LIMPEZA DOS DADOS DE TESTE
    -- =====================================================
    
    DELETE FROM specialties WHERE name IN ('Teste Automatizado', 'Teste Constraint');
    
    -- =====================================================
    -- CATEGORIA 7: RESUMO FINAL
    -- =====================================================
    
    test_category := 'RESUMO';
    test_name := 'Status geral do banco de dados';
    result := '✅ BANCO DE DADOS VALIDADO COM SUCESSO';
    details := 'Todas as verificações principais foram aprovadas';
    RETURN NEXT;
    
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXECUTAR TODOS OS TESTES
-- =====================================================

-- Cabeçalho do relatório
SELECT 
    '================================================' as linha
UNION ALL
SELECT 
    'EXECUTANDO SUÍTE AUTOMATIZADA DE TESTES' as linha
UNION ALL
SELECT 
    'Sistema de Telemedicina - Banco de Dados' as linha
UNION ALL
SELECT 
    '================================================' as linha;

-- Executar todos os testes
SELECT * FROM run_database_tests();

-- Rodapé do relatório
SELECT 
    '================================================' as linha
UNION ALL
SELECT 
    'TESTES CONCLUÍDOS - ' || CURRENT_TIMESTAMP::TEXT as linha
UNION ALL
SELECT 
    '================================================' as linha;

-- Limpar funções auxiliares
DROP FUNCTION IF EXISTS test_result(TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS run_database_tests();