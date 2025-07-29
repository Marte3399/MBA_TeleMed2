-- =====================================================
-- TESTES SIMPLES SEM PGTAP - VALIDAÇÃO BÁSICA
-- Sistema de Telemedicina - Supabase
-- =====================================================

-- Função auxiliar para reportar resultados
CREATE OR REPLACE FUNCTION test_result(test_name TEXT, condition BOOLEAN, expected_result TEXT DEFAULT 'true')
RETURNS TEXT AS $$
BEGIN
    IF condition THEN
        RETURN '✅ PASSOU: ' || test_name;
    ELSE
        RETURN '❌ FALHOU: ' || test_name || ' (esperado: ' || expected_result || ')';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXECUTAR TESTES
-- =====================================================

DO $$
DECLARE
    test_count INTEGER := 0;
    passed_count INTEGER := 0;
    result TEXT;
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'EXECUTANDO TESTES DO BANCO DE DADOS';
    RAISE NOTICE 'Sistema de Telemedicina - Supabase';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';

    -- TESTE 1: Verificar existência das tabelas
    test_count := test_count + 1;
    SELECT test_result('Tabela specialties existe', 
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'specialties' AND table_schema = 'public')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('Tabela doctors existe', 
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'doctors' AND table_schema = 'public')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('Tabela appointments existe', 
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments' AND table_schema = 'public')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('Tabela consultation_queue existe', 
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_queue' AND table_schema = 'public')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('Tabela medical_records existe', 
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'medical_records' AND table_schema = 'public')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('Tabela notifications existe', 
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    RAISE NOTICE '';
    RAISE NOTICE '--- TESTES DE COLUNAS ---';

    -- TESTE 7: Verificar colunas críticas
    test_count := test_count + 1;
    SELECT test_result('Coluna specialties.price existe', 
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'specialties' AND column_name = 'price' AND table_schema = 'public')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('Coluna doctors.crm existe', 
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'crm' AND table_schema = 'public')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('Coluna appointments.status existe', 
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'status' AND table_schema = 'public')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('Coluna medical_records.is_signed existe', 
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'is_signed' AND table_schema = 'public')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    RAISE NOTICE '';
    RAISE NOTICE '--- TESTES DE RLS ---';

    -- TESTE 11: Verificar RLS habilitado
    test_count := test_count + 1;
    SELECT test_result('RLS habilitado em specialties', 
        (SELECT rowsecurity FROM pg_tables WHERE tablename = 'specialties' AND schemaname = 'public') = true
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('RLS habilitado em doctors', 
        (SELECT rowsecurity FROM pg_tables WHERE tablename = 'doctors' AND schemaname = 'public') = true
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('RLS habilitado em appointments', 
        (SELECT rowsecurity FROM pg_tables WHERE tablename = 'appointments' AND schemaname = 'public') = true
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    RAISE NOTICE '';
    RAISE NOTICE '--- TESTES DE RELACIONAMENTOS ---';

    -- TESTE 14: Verificar foreign keys
    test_count := test_count + 1;
    SELECT test_result('FK doctors -> specialties existe', 
        EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'doctors_specialty_id_fkey')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('FK appointments -> doctors existe', 
        EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'appointments_doctor_id_fkey')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('FK medical_records -> appointments existe', 
        EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'medical_records_appointment_id_fkey')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    RAISE NOTICE '';
    RAISE NOTICE '--- TESTES DE ÍNDICES ---';

    -- TESTE 17: Verificar índices importantes
    test_count := test_count + 1;
    SELECT test_result('Índice doctors.specialty_id existe', 
        EXISTS(SELECT 1 FROM pg_indexes WHERE tablename = 'doctors' AND indexname = 'idx_doctors_specialty_id')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('Índice appointments.patient_id existe', 
        EXISTS(SELECT 1 FROM pg_indexes WHERE tablename = 'appointments' AND indexname = 'idx_appointments_patient_id')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('Índice consultation_queue.position existe', 
        EXISTS(SELECT 1 FROM pg_indexes WHERE tablename = 'consultation_queue' AND indexname = 'idx_consultation_queue_position')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    RAISE NOTICE '';
    RAISE NOTICE '--- TESTES DE POLÍTICAS RLS ---';

    -- TESTE 20: Verificar políticas RLS
    test_count := test_count + 1;
    SELECT test_result('Política SELECT specialties existe', 
        EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'specialties' AND policyname = 'Specialties are viewable by everyone')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('Política INSERT doctors existe', 
        EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'doctors' AND policyname = 'Doctors can insert their own profile')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    test_count := test_count + 1;
    SELECT test_result('Política DELETE medical_records restritiva existe', 
        EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'medical_records' AND policyname = 'Medical records cannot be deleted')
    ) INTO result;
    RAISE NOTICE '%', result;
    IF result LIKE '✅%' THEN passed_count := passed_count + 1; END IF;

    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'RESUMO DOS TESTES';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Total de testes: %', test_count;
    RAISE NOTICE 'Testes aprovados: %', passed_count;
    RAISE NOTICE 'Testes falharam: %', (test_count - passed_count);
    RAISE NOTICE 'Taxa de sucesso: %% %', ROUND((passed_count::DECIMAL / test_count::DECIMAL) * 100, 1);
    
    IF passed_count = test_count THEN
        RAISE NOTICE '🎉 TODOS OS TESTES PASSARAM!';
    ELSE
        RAISE NOTICE '⚠️  ALGUNS TESTES FALHARAM - VERIFIQUE A ESTRUTURA DO BANCO';
    END IF;
    
    RAISE NOTICE '================================================';
END $$;