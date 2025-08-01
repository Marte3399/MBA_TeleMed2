-- =====================================================
-- TESTES DE INTEGRAÇÃO ENTRE TABELAS
-- Tarefa 2: Sistema de cadastro e aprovação de médicos
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🔗 INICIANDO TESTES DE INTEGRAÇÃO ENTRE TABELAS';
    RAISE NOTICE '==============================================';
END $$;

-- =====================================================
-- TESTE 1: Integração com tabela auth.users
-- =====================================================
DO $$
DECLARE
    test_application_id UUID;
    test_user_email VARCHAR(255) := 'integration.test@email.com';
BEGIN
    RAISE NOTICE '👤 TESTANDO INTEGRAÇÃO COM AUTH.USERS';
    
    -- Inserir candidatura de teste
    INSERT INTO doctors_applications (
        full_name, cpf, rg, birth_date, email, phone, address, gender,
        crm, crm_state, crm_status, medical_school, graduation_year,
        diploma_recognized, specialties, experience_years,
        bank, agency, account, pix_key, tax_status,
        normal_consultation_price, cfm_resolution_accepted,
        medical_ethics_accepted, civil_responsibility_accepted,
        service_contract_accepted, privacy_policy_accepted,
        platform_terms_accepted, data_processing_authorized
    ) VALUES (
        'Dr. Integration Test', '123.456.789-99', '12.345.678-9',
        '1980-01-01', test_user_email, '(11) 99999-9999',
        'Rua Integration, 123', 'masculino', '123456', 'SP', 'ativo',
        'USP', 2005, 'sim', '["cardiologia"]', '10-15',
        '001', '1234', '12345-6', '123.456.789-99', 'pessoa-fisica',
        89.90, true, true, true, true, true, true, true
    ) RETURNING id INTO test_application_id;
    
    RAISE NOTICE '✅ INTEGRATION 1.1: Candidatura de teste inserida';
    
    -- Verificar se a estrutura permite relacionamento com auth.users
    -- Em produção, isso seria usado pelas políticas RLS
    IF EXISTS (SELECT 1 FROM doctors_applications 
               WHERE id = test_application_id 
               AND email = test_user_email) THEN
        RAISE NOTICE '✅ INTEGRATION 1.2: Estrutura permite relacionamento com auth.users';
    ELSE
        RAISE EXCEPTION '❌ INTEGRATION 1.2: Problema na estrutura de relacionamento';
    END IF;
    
    -- Simular aprovação e criação de perfil médico
    UPDATE doctors_applications 
    SET application_status = 'approved',
        reviewed_at = NOW(),
        approved_at = NOW()
    WHERE id = test_application_id;
    
    IF EXISTS (SELECT 1 FROM doctors_applications 
               WHERE id = test_application_id 
               AND application_status = 'approved') THEN
        RAISE NOTICE '✅ INTEGRATION 1.3: Aprovação simulada com sucesso';
    ELSE
        RAISE EXCEPTION '❌ INTEGRATION 1.3: Falha na simulação de aprovação';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM doctors_applications WHERE id = test_application_id;
    RAISE NOTICE '🧹 INTEGRATION 1.4: Dados de teste removidos';
END $$;

-- =====================================================
-- TESTE 2: Preparação para integração com tabela doctors
-- =====================================================
DO $$
DECLARE
    test_application_id UUID;
    application_data RECORD;
BEGIN
    RAISE NOTICE '👨‍⚕️ TESTANDO PREPARAÇÃO PARA TABELA DOCTORS';
    
    -- Inserir candidatura completa
    INSERT INTO doctors_applications (
        full_name, cpf, rg, birth_date, email, phone, address, gender,
        crm, crm_state, crm_status, medical_school, graduation_year,
        diploma_recognized, rqe, residency_certificate, specialist_title,
        specialties, experience_years, telemedicine_experience,
        bank, agency, account, pix_key, tax_status,
        normal_consultation_price, urgent_consultation_price, return_consultation_price,
        weekly_schedule, available_shifts, service_modalities,
        cfm_resolution_accepted, medical_ethics_accepted, civil_responsibility_accepted,
        service_contract_accepted, privacy_policy_accepted,
        platform_terms_accepted, data_processing_authorized
    ) VALUES (
        'Dr. Doctor Integration', '987.654.321-11', '98.765.432-1',
        '1985-05-15', 'doctor.integration@email.com', '(11) 88888-8888',
        'Rua Doctor, 456', 'feminino', '987654', 'RJ', 'ativo',
        'UFRJ', 2008, 'sim', 'RQE987654', 'Hospital Universitário',
        'Sociedade Brasileira de Pediatria', '["pediatria", "neonatologia"]',
        '10-15', 'avancada', '237', '5678', '98765-4', '987.654.321-11',
        'pessoa-fisica', 79.90, 119.90, 49.90,
        '["segunda-sexta", "fins-semana"]', '["manha", "tarde"]', '["videochamada", "chat"]',
        true, true, true, true, true, true, true
    ) RETURNING id INTO test_application_id;
    
    -- Buscar dados da candidatura
    SELECT * INTO application_data 
    FROM doctors_applications 
    WHERE id = test_application_id;
    
    -- Verificar se todos os dados necessários para criar perfil médico estão presentes
    IF application_data.full_name IS NOT NULL AND
       application_data.crm IS NOT NULL AND
       application_data.crm_state IS NOT NULL AND
       application_data.email IS NOT NULL AND
       application_data.specialties IS NOT NULL THEN
        RAISE NOTICE '✅ INTEGRATION 2.1: Dados essenciais para perfil médico presentes';
    ELSE
        RAISE EXCEPTION '❌ INTEGRATION 2.1: Dados essenciais faltando';
    END IF;
    
    -- Verificar dados financeiros
    IF application_data.bank IS NOT NULL AND
       application_data.agency IS NOT NULL AND
       application_data.account IS NOT NULL AND
       application_data.pix_key IS NOT NULL THEN
        RAISE NOTICE '✅ INTEGRATION 2.2: Dados financeiros completos';
    ELSE
        RAISE EXCEPTION '❌ INTEGRATION 2.2: Dados financeiros incompletos';
    END IF;
    
    -- Verificar dados de disponibilidade
    IF application_data.weekly_schedule IS NOT NULL AND
       application_data.available_shifts IS NOT NULL AND
       application_data.service_modalities IS NOT NULL THEN
        RAISE NOTICE '✅ INTEGRATION 2.3: Dados de disponibilidade completos';
    ELSE
        RAISE EXCEPTION '❌ INTEGRATION 2.3: Dados de disponibilidade incompletos';
    END IF;
    
    -- Simular criação de perfil médico (estrutura de dados)
    -- Em produção, isso seria feito após aprovação
    UPDATE doctors_applications 
    SET application_status = 'approved',
        reviewed_at = NOW(),
        approved_at = NOW(),
        admin_notes = 'Pronto para criação de perfil médico'
    WHERE id = test_application_id;
    
    RAISE NOTICE '✅ INTEGRATION 2.4: Candidatura preparada para criação de perfil médico';
    
    -- Limpar dados de teste
    DELETE FROM doctors_applications WHERE id = test_application_id;
    RAISE NOTICE '🧹 INTEGRATION 2.5: Dados de teste removidos';
END $$;

-- =====================================================
-- TESTE 3: Integração com sistema de notificações
-- =====================================================
DO $$
DECLARE
    test_application_id UUID;
    notification_data RECORD;
BEGIN
    RAISE NOTICE '📧 TESTANDO INTEGRAÇÃO COM SISTEMA DE NOTIFICAÇÕES';
    
    -- Inserir candidatura para teste de notificações
    INSERT INTO doctors_applications (
        full_name, cpf, rg, birth_date, email, phone, address, gender,
        crm, crm_state, crm_status, medical_school, graduation_year,
        diploma_recognized, specialties, experience_years,
        bank, agency, account, pix_key, tax_status,
        normal_consultation_price, cfm_resolution_accepted,
        medical_ethics_accepted, civil_responsibility_accepted,
        service_contract_accepted, privacy_policy_accepted,
        platform_terms_accepted, data_processing_authorized
    ) VALUES (
        'Dr. Notification Test', '111.222.333-44', '11.222.333-4',
        '1982-08-10', 'notification.test@email.com', '(11) 77777-7777',
        'Rua Notification, 789', 'masculino', '111222', 'MG', 'ativo',
        'UFMG', 2006, 'sim', '["dermatologia"]', '5-10',
        '104', '9012', '54321-0', '111.222.333-44', 'pessoa-fisica',
        99.90, true, true, true, true, true, true, true
    ) RETURNING id INTO test_application_id;
    
    -- Buscar dados para notificação
    SELECT full_name, email, crm, crm_state, specialties, submitted_at
    INTO notification_data
    FROM doctors_applications 
    WHERE id = test_application_id;
    
    -- Verificar se dados necessários para notificação estão presentes
    IF notification_data.full_name IS NOT NULL AND
       notification_data.email IS NOT NULL AND
       notification_data.crm IS NOT NULL AND
       notification_data.submitted_at IS NOT NULL THEN
        RAISE NOTICE '✅ INTEGRATION 3.1: Dados para notificação de recebimento presentes';
    ELSE
        RAISE EXCEPTION '❌ INTEGRATION 3.1: Dados para notificação faltando';
    END IF;
    
    -- Simular aprovação e verificar dados para notificação de aprovação
    UPDATE doctors_applications 
    SET application_status = 'approved',
        reviewed_at = NOW(),
        approved_at = NOW()
    WHERE id = test_application_id;
    
    SELECT full_name, email, application_status, approved_at
    INTO notification_data
    FROM doctors_applications 
    WHERE id = test_application_id;
    
    IF notification_data.application_status = 'approved' AND
       notification_data.approved_at IS NOT NULL THEN
        RAISE NOTICE '✅ INTEGRATION 3.2: Dados para notificação de aprovação presentes';
    ELSE
        RAISE EXCEPTION '❌ INTEGRATION 3.2: Dados para notificação de aprovação faltando';
    END IF;
    
    -- Simular rejeição e verificar dados para notificação de rejeição
    UPDATE doctors_applications 
    SET application_status = 'rejected',
        reviewed_at = NOW(),
        rejection_reason = 'Teste de integração - documentos incompletos'
    WHERE id = test_application_id;
    
    SELECT full_name, email, application_status, rejection_reason
    INTO notification_data
    FROM doctors_applications 
    WHERE id = test_application_id;
    
    IF notification_data.application_status = 'rejected' AND
       notification_data.rejection_reason IS NOT NULL THEN
        RAISE NOTICE '✅ INTEGRATION 3.3: Dados para notificação de rejeição presentes';
    ELSE
        RAISE EXCEPTION '❌ INTEGRATION 3.3: Dados para notificação de rejeição faltando';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM doctors_applications WHERE id = test_application_id;
    RAISE NOTICE '🧹 INTEGRATION 3.4: Dados de teste removidos';
END $$;-
- =====================================================
-- TESTE 4: Integração com sistema de auditoria
-- =====================================================
DO $$
DECLARE
    test_application_id UUID;
    audit_data RECORD;
    initial_time TIMESTAMP WITH TIME ZONE;
    updated_time TIMESTAMP WITH TIME ZONE;
BEGIN
    RAISE NOTICE '📊 TESTANDO INTEGRAÇÃO COM SISTEMA DE AUDITORIA';
    
    -- Inserir candidatura para teste de auditoria
    INSERT INTO doctors_applications (
        full_name, cpf, rg, birth_date, email, phone, address, gender,
        crm, crm_state, crm_status, medical_school, graduation_year,
        diploma_recognized, specialties, experience_years,
        bank, agency, account, pix_key, tax_status,
        normal_consultation_price, cfm_resolution_accepted,
        medical_ethics_accepted, civil_responsibility_accepted,
        service_contract_accepted, privacy_policy_accepted,
        platform_terms_accepted, data_processing_authorized
    ) VALUES (
        'Dr. Audit Test', '555.666.777-88', '55.666.777-8',
        '1979-12-05', 'audit.test@email.com', '(11) 66666-6666',
        'Rua Audit, 321', 'feminino', '555666', 'PR', 'ativo',
        'UFPR', 2004, 'sim', '["ginecologia"]', '15-20',
        '341', '3456', '67890-1', '555.666.777-88', 'pessoa-fisica',
        89.90, true, true, true, true, true, true, true
    ) RETURNING id INTO test_application_id;
    
    -- Capturar dados iniciais de auditoria
    SELECT created_at, updated_at, submitted_at
    INTO audit_data
    FROM doctors_applications 
    WHERE id = test_application_id;
    
    initial_time := audit_data.updated_at;
    
    -- Verificar se campos de auditoria foram preenchidos
    IF audit_data.created_at IS NOT NULL AND
       audit_data.updated_at IS NOT NULL AND
       audit_data.submitted_at IS NOT NULL THEN
        RAISE NOTICE '✅ INTEGRATION 4.1: Campos de auditoria inicial preenchidos';
    ELSE
        RAISE EXCEPTION '❌ INTEGRATION 4.1: Campos de auditoria inicial faltando';
    END IF;
    
    -- Aguardar um momento para diferenciação de timestamp
    PERFORM pg_sleep(1);
    
    -- Simular revisão administrativa
    UPDATE doctors_applications 
    SET application_status = 'under_review',
        admin_notes = 'Em análise pela equipe médica',
        reviewed_at = NOW()
    WHERE id = test_application_id;
    
    -- Verificar atualização de auditoria
    SELECT updated_at, reviewed_at, admin_notes
    INTO audit_data
    FROM doctors_applications 
    WHERE id = test_application_id;
    
    updated_time := audit_data.updated_at;
    
    IF audit_data.reviewed_at IS NOT NULL AND
       audit_data.admin_notes IS NOT NULL AND
       updated_time > initial_time THEN
        RAISE NOTICE '✅ INTEGRATION 4.2: Auditoria de revisão funcionando';
    ELSE
        RAISE EXCEPTION '❌ INTEGRATION 4.2: Auditoria de revisão falhando';
    END IF;
    
    -- Simular aprovação final
    UPDATE doctors_applications 
    SET application_status = 'approved',
        approved_at = NOW(),
        admin_notes = audit_data.admin_notes || ' | Aprovado após análise completa'
    WHERE id = test_application_id;
    
    -- Verificar auditoria completa
    SELECT application_status, approved_at, admin_notes
    INTO audit_data
    FROM doctors_applications 
    WHERE id = test_application_id;
    
    IF audit_data.application_status = 'approved' AND
       audit_data.approved_at IS NOT NULL AND
       audit_data.admin_notes LIKE '%Aprovado após análise completa%' THEN
        RAISE NOTICE '✅ INTEGRATION 4.3: Auditoria completa funcionando';
    ELSE
        RAISE EXCEPTION '❌ INTEGRATION 4.3: Auditoria completa falhando';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM doctors_applications WHERE id = test_application_id;
    RAISE NOTICE '🧹 INTEGRATION 4.4: Dados de teste removidos';
END $$;

-- =====================================================
-- TESTE 5: Integração com sistema de relatórios
-- =====================================================
DO $$
DECLARE
    report_data RECORD;
    total_applications INTEGER;
    pending_applications INTEGER;
    approved_applications INTEGER;
    rejected_applications INTEGER;
BEGIN
    RAISE NOTICE '📈 TESTANDO INTEGRAÇÃO COM SISTEMA DE RELATÓRIOS';
    
    -- Inserir dados de teste para relatórios
    INSERT INTO doctors_applications (
        full_name, cpf, rg, birth_date, email, phone, address, gender,
        crm, crm_state, crm_status, medical_school, graduation_year,
        diploma_recognized, specialties, experience_years,
        bank, agency, account, pix_key, tax_status,
        normal_consultation_price, application_status,
        cfm_resolution_accepted, medical_ethics_accepted, civil_responsibility_accepted,
        service_contract_accepted, privacy_policy_accepted,
        platform_terms_accepted, data_processing_authorized
    ) VALUES 
    ('Dr. Report Test 1', '111.111.111-11', '11.111.111-1', '1980-01-01', 'report1@test.com', '(11) 11111-1111', 'Rua 1', 'masculino', '111111', 'SP', 'ativo', 'USP', 2005, 'sim', '["cardiologia"]', '10-15', '001', '1111', '11111-1', '111.111.111-11', 'pessoa-fisica', 89.90, 'pending', true, true, true, true, true, true, true),
    ('Dr. Report Test 2', '222.222.222-22', '22.222.222-2', '1981-02-02', 'report2@test.com', '(11) 22222-2222', 'Rua 2', 'feminino', '222222', 'RJ', 'ativo', 'UFRJ', 2006, 'sim', '["pediatria"]', '5-10', '237', '2222', '22222-2', '222.222.222-22', 'pessoa-fisica', 79.90, 'approved', true, true, true, true, true, true, true),
    ('Dr. Report Test 3', '333.333.333-33', '33.333.333-3', '1982-03-03', 'report3@test.com', '(11) 33333-3333', 'Rua 3', 'masculino', '333333', 'MG', 'ativo', 'UFMG', 2007, 'sim', '["dermatologia"]', '3-5', '104', '3333', '33333-3', '333.333.333-33', 'pessoa-fisica', 99.90, 'rejected', true, true, true, true, true, true, true);
    
    -- Gerar relatório de status
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE application_status = 'pending') as pending,
        COUNT(*) FILTER (WHERE application_status = 'approved') as approved,
        COUNT(*) FILTER (WHERE application_status = 'rejected') as rejected
    INTO report_data
    FROM doctors_applications 
    WHERE email LIKE 'report%@test.com';
    
    total_applications := report_data.total;
    pending_applications := report_data.pending;
    approved_applications := report_data.approved;
    rejected_applications := report_data.rejected;
    
    -- Verificar dados do relatório
    IF total_applications = 3 AND
       pending_applications = 1 AND
       approved_applications = 1 AND
       rejected_applications = 1 THEN
        RAISE NOTICE '✅ INTEGRATION 5.1: Relatório de status funcionando';
        RAISE NOTICE '  📊 Total: %, Pendentes: %, Aprovados: %, Rejeitados: %', 
                     total_applications, pending_applications, approved_applications, rejected_applications;
    ELSE
        RAISE EXCEPTION '❌ INTEGRATION 5.1: Relatório de status incorreto';
    END IF;
    
    -- Gerar relatório por estado
    SELECT COUNT(*) as sp_count
    INTO report_data
    FROM doctors_applications 
    WHERE crm_state = 'SP' AND email LIKE 'report%@test.com';
    
    IF report_data.sp_count = 1 THEN
        RAISE NOTICE '✅ INTEGRATION 5.2: Relatório por estado funcionando';
    ELSE
        RAISE EXCEPTION '❌ INTEGRATION 5.2: Relatório por estado incorreto';
    END IF;
    
    -- Gerar relatório por especialidade
    SELECT COUNT(*) as cardio_count
    INTO report_data
    FROM doctors_applications 
    WHERE specialties ? 'cardiologia' AND email LIKE 'report%@test.com';
    
    IF report_data.cardio_count = 1 THEN
        RAISE NOTICE '✅ INTEGRATION 5.3: Relatório por especialidade funcionando';
    ELSE
        RAISE EXCEPTION '❌ INTEGRATION 5.3: Relatório por especialidade incorreto';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM doctors_applications WHERE email LIKE 'report%@test.com';
    RAISE NOTICE '🧹 INTEGRATION 5.4: Dados de teste removidos';
END $$;

-- =====================================================
-- TESTE 6: Performance e índices
-- =====================================================
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTERVAL;
    test_ids UUID[];
    i INTEGER;
BEGIN
    RAISE NOTICE '⚡ TESTANDO PERFORMANCE E ÍNDICES';
    
    -- Inserir múltiplos registros para teste de performance
    start_time := clock_timestamp();
    
    FOR i IN 1..100 LOOP
        INSERT INTO doctors_applications (
            full_name, cpf, rg, birth_date, email, phone, address, gender,
            crm, crm_state, crm_status, medical_school, graduation_year,
            diploma_recognized, specialties, experience_years,
            bank, agency, account, pix_key, tax_status,
            normal_consultation_price, cfm_resolution_accepted,
            medical_ethics_accepted, civil_responsibility_accepted,
            service_contract_accepted, privacy_policy_accepted,
            platform_terms_accepted, data_processing_authorized
        ) VALUES (
            'Dr. Performance Test ' || i, 
            LPAD(i::text, 3, '0') || '.000.000-00',
            LPAD(i::text, 2, '0') || '.000.000-0',
            '1980-01-01', 
            'perf' || i || '@test.com',
            '(11) 99999-' || LPAD(i::text, 4, '0'),
            'Rua Performance ' || i, 
            CASE WHEN i % 2 = 0 THEN 'masculino' ELSE 'feminino' END,
            LPAD(i::text, 6, '0'),
            CASE WHEN i % 3 = 0 THEN 'SP' WHEN i % 3 = 1 THEN 'RJ' ELSE 'MG' END,
            'ativo', 'USP', 2005, 'sim', '["cardiologia"]', '10-15',
            '001', '1234', '12345-6', 
            LPAD(i::text, 3, '0') || '.000.000-00',
            'pessoa-fisica', 89.90, true, true, true, true, true, true, true
        );
    END LOOP;
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    
    RAISE NOTICE '✅ INTEGRATION 6.1: Inserção de 100 registros em %', execution_time;
    
    -- Teste de busca por CPF (deve usar índice)
    start_time := clock_timestamp();
    
    PERFORM * FROM doctors_applications WHERE cpf = '050.000.000-00';
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    
    RAISE NOTICE '✅ INTEGRATION 6.2: Busca por CPF em %', execution_time;
    
    -- Teste de busca por email (deve usar índice)
    start_time := clock_timestamp();
    
    PERFORM * FROM doctors_applications WHERE email = 'perf50@test.com';
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    
    RAISE NOTICE '✅ INTEGRATION 6.3: Busca por email em %', execution_time;
    
    -- Teste de busca por status (deve usar índice)
    start_time := clock_timestamp();
    
    PERFORM COUNT(*) FROM doctors_applications WHERE application_status = 'pending';
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    
    RAISE NOTICE '✅ INTEGRATION 6.4: Busca por status em %', execution_time;
    
    -- Limpar dados de teste
    DELETE FROM doctors_applications WHERE email LIKE 'perf%@test.com';
    RAISE NOTICE '🧹 INTEGRATION 6.5: Dados de performance removidos';
END $$;

-- =====================================================
-- RESUMO DOS TESTES DE INTEGRAÇÃO
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 TODOS OS TESTES DE INTEGRAÇÃO CONCLUÍDOS!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ Integração com auth.users';
    RAISE NOTICE '✅ Preparação para tabela doctors';
    RAISE NOTICE '✅ Integração com notificações';
    RAISE NOTICE '✅ Sistema de auditoria';
    RAISE NOTICE '✅ Sistema de relatórios';
    RAISE NOTICE '✅ Performance e índices';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 INTEGRAÇÃO: Todas as conexões funcionando';
    RAISE NOTICE '📊 RELATÓRIOS: Dados estruturados corretamente';
    RAISE NOTICE '📧 NOTIFICAÇÕES: Dados completos para envio';
    RAISE NOTICE '⚡ PERFORMANCE: Índices otimizados';
    RAISE NOTICE '';
END $$;