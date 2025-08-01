-- =====================================================
-- TESTES DE CONSTRAINTS E VALIDAÇÕES
-- Tarefa 2: Sistema de cadastro e aprovação de médicos
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🔍 INICIANDO TESTES DE CONSTRAINTS E VALIDAÇÕES';
    RAISE NOTICE '===============================================';
END $$;

-- =====================================================
-- TESTE 1: Constraints NOT NULL
-- =====================================================
DO $$
DECLARE
    constraint_error BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE '❗ TESTANDO CONSTRAINTS NOT NULL';
    
    -- Teste 1.1: Tentar inserir sem nome completo
    BEGIN
        INSERT INTO doctors_applications (
            cpf, rg, birth_date, email, phone, address, gender,
            crm, crm_state, crm_status, medical_school, graduation_year,
            diploma_recognized, specialties, experience_years,
            bank, agency, account, pix_key, tax_status,
            normal_consultation_price, cfm_resolution_accepted,
            medical_ethics_accepted, civil_responsibility_accepted,
            service_contract_accepted, privacy_policy_accepted,
            platform_terms_accepted, data_processing_authorized
        ) VALUES (
            '123.456.789-00', '12.345.678-9', '1980-01-01', 'test@email.com',
            '(11) 99999-9999', 'Rua Test, 123', 'masculino', '123456', 'SP',
            'ativo', 'USP', 2005, 'sim', '["cardiologia"]', '10-15',
            '001', '1234', '12345-6', '123.456.789-00', 'pessoa-fisica',
            89.90, true, true, true, true, true, true, true
        );
        RAISE EXCEPTION '❌ CONSTRAINT 1.1: NOT NULL para full_name NÃO funcionou';
    EXCEPTION
        WHEN not_null_violation THEN
            RAISE NOTICE '✅ CONSTRAINT 1.1: NOT NULL para full_name funcionou';
    END;
    
    -- Teste 1.2: Tentar inserir sem CPF
    BEGIN
        INSERT INTO doctors_applications (
            full_name, rg, birth_date, email, phone, address, gender,
            crm, crm_state, crm_status, medical_school, graduation_year,
            diploma_recognized, specialties, experience_years,
            bank, agency, account, pix_key, tax_status,
            normal_consultation_price, cfm_resolution_accepted,
            medical_ethics_accepted, civil_responsibility_accepted,
            service_contract_accepted, privacy_policy_accepted,
            platform_terms_accepted, data_processing_authorized
        ) VALUES (
            'Dr. Test', '12.345.678-9', '1980-01-01', 'test@email.com',
            '(11) 99999-9999', 'Rua Test, 123', 'masculino', '123456', 'SP',
            'ativo', 'USP', 2005, 'sim', '["cardiologia"]', '10-15',
            '001', '1234', '12345-6', '123.456.789-00', 'pessoa-fisica',
            89.90, true, true, true, true, true, true, true
        );
        RAISE EXCEPTION '❌ CONSTRAINT 1.2: NOT NULL para CPF NÃO funcionou';
    EXCEPTION
        WHEN not_null_violation THEN
            RAISE NOTICE '✅ CONSTRAINT 1.2: NOT NULL para CPF funcionou';
    END;
    
    -- Teste 1.3: Tentar inserir sem CRM
    BEGIN
        INSERT INTO doctors_applications (
            full_name, cpf, rg, birth_date, email, phone, address, gender,
            crm_state, crm_status, medical_school, graduation_year,
            diploma_recognized, specialties, experience_years,
            bank, agency, account, pix_key, tax_status,
            normal_consultation_price, cfm_resolution_accepted,
            medical_ethics_accepted, civil_responsibility_accepted,
            service_contract_accepted, privacy_policy_accepted,
            platform_terms_accepted, data_processing_authorized
        ) VALUES (
            'Dr. Test', '123.456.789-00', '12.345.678-9', '1980-01-01', 'test@email.com',
            '(11) 99999-9999', 'Rua Test, 123', 'masculino', 'SP',
            'ativo', 'USP', 2005, 'sim', '["cardiologia"]', '10-15',
            '001', '1234', '12345-6', '123.456.789-00', 'pessoa-fisica',
            89.90, true, true, true, true, true, true, true
        );
        RAISE EXCEPTION '❌ CONSTRAINT 1.3: NOT NULL para CRM NÃO funcionou';
    EXCEPTION
        WHEN not_null_violation THEN
            RAISE NOTICE '✅ CONSTRAINT 1.3: NOT NULL para CRM funcionou';
    END;
END $$;

-- =====================================================
-- TESTE 2: Constraints UNIQUE
-- =====================================================
DO $$
DECLARE
    test_id UUID;
BEGIN
    RAISE NOTICE '🔑 TESTANDO CONSTRAINTS UNIQUE';
    
    -- Inserir primeira candidatura
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
        'Dr. Unique Test', '999.888.777-66', '99.888.777-6',
        '1980-01-01', 'unique.test@email.com', '(11) 99999-9999',
        'Rua Unique, 123', 'masculino', '999888', 'SP', 'ativo',
        'USP', 2005, 'sim', '["cardiologia"]', '10-15',
        '001', '1234', '12345-6', '999.888.777-66', 'pessoa-fisica',
        89.90, true, true, true, true, true, true, true
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE '✅ CONSTRAINT 2.1: Primeira candidatura inserida';
    
    -- Teste 2.2: Tentar inserir com CPF duplicado
    BEGIN
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
            'Dr. Duplicate CPF', '999.888.777-66', '11.222.333-4',
            '1981-02-02', 'duplicate.cpf@email.com', '(11) 88888-8888',
            'Rua Duplicate, 456', 'feminino', '111222', 'RJ', 'ativo',
            'UFRJ', 2006, 'sim', '["pediatria"]', '5-10',
            '237', '5678', '98765-4', '999.888.777-66', 'pessoa-fisica',
            79.90, true, true, true, true, true, true, true
        );
        RAISE EXCEPTION '❌ CONSTRAINT 2.2: UNIQUE para CPF NÃO funcionou';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE '✅ CONSTRAINT 2.2: UNIQUE para CPF funcionou';
    END;
    
    -- Teste 2.3: Tentar inserir com email duplicado
    BEGIN
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
            'Dr. Duplicate Email', '111.222.333-44', '11.222.333-4',
            '1982-03-03', 'unique.test@email.com', '(11) 77777-7777',
            'Rua Duplicate, 789', 'masculino', '333444', 'MG', 'ativo',
            'UFMG', 2007, 'sim', '["dermatologia"]', '3-5',
            '104', '9012', '54321-0', '111.222.333-44', 'pessoa-fisica',
            99.90, true, true, true, true, true, true, true
        );
        RAISE EXCEPTION '❌ CONSTRAINT 2.3: UNIQUE para email NÃO funcionou';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE '✅ CONSTRAINT 2.3: UNIQUE para email funcionou';
    END;
    
    -- Limpar dados de teste
    DELETE FROM doctors_applications WHERE id = test_id;
    RAISE NOTICE '🧹 CONSTRAINT 2.4: Dados de teste removidos';
END $$;-- ====
=================================================
-- TESTE 3: Validação de tipos de dados
-- =====================================================
DO $$
DECLARE
    test_id UUID;
BEGIN
    RAISE NOTICE '📊 TESTANDO VALIDAÇÃO DE TIPOS DE DADOS';
    
    -- Teste 3.1: Inserir com tipos corretos
    BEGIN
        INSERT INTO doctors_applications (
            full_name, cpf, rg, birth_date, email, phone, address, gender,
            crm, crm_state, crm_status, medical_school, graduation_year,
            diploma_recognized, specialties, experience_years,
            bank, agency, account, pix_key, tax_status,
            normal_consultation_price, urgent_consultation_price,
            cfm_resolution_accepted, medical_ethics_accepted, civil_responsibility_accepted,
            service_contract_accepted, privacy_policy_accepted,
            platform_terms_accepted, data_processing_authorized
        ) VALUES (
            'Dr. Type Test', '123.456.789-11', '12.345.678-1',
            '1980-01-01', 'type.test@email.com', '(11) 99999-9999',
            'Rua Type, 123', 'masculino', '123456', 'SP', 'ativo',
            'USP', 2005, 'sim', '["cardiologia"]', '10-15',
            '001', '1234', '12345-6', '123.456.789-11', 'pessoa-fisica',
            89.90, 129.90, true, true, true, true, true, true, true
        ) RETURNING id INTO test_id;
        
        RAISE NOTICE '✅ TYPE 3.1: Inserção com tipos corretos funcionou';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION '❌ TYPE 3.1: Erro na inserção com tipos corretos: %', SQLERRM;
    END;
    
    -- Teste 3.2: Verificar tipos DECIMAL para preços
    IF EXISTS (SELECT 1 FROM doctors_applications 
               WHERE id = test_id 
               AND normal_consultation_price = 89.90 
               AND urgent_consultation_price = 129.90) THEN
        RAISE NOTICE '✅ TYPE 3.2: Tipos DECIMAL para preços funcionaram';
    ELSE
        RAISE EXCEPTION '❌ TYPE 3.2: Tipos DECIMAL para preços falharam';
    END IF;
    
    -- Teste 3.3: Verificar tipo DATE para birth_date
    IF EXISTS (SELECT 1 FROM doctors_applications 
               WHERE id = test_id 
               AND birth_date = '1980-01-01') THEN
        RAISE NOTICE '✅ TYPE 3.3: Tipo DATE para birth_date funcionou';
    ELSE
        RAISE EXCEPTION '❌ TYPE 3.3: Tipo DATE para birth_date falhou';
    END IF;
    
    -- Teste 3.4: Verificar tipo JSONB para specialties
    IF EXISTS (SELECT 1 FROM doctors_applications 
               WHERE id = test_id 
               AND specialties ? 'cardiologia') THEN
        RAISE NOTICE '✅ TYPE 3.4: Tipo JSONB para specialties funcionou';
    ELSE
        RAISE EXCEPTION '❌ TYPE 3.4: Tipo JSONB para specialties falhou';
    END IF;
    
    -- Teste 3.5: Verificar tipo BOOLEAN para campos de aceitação
    IF EXISTS (SELECT 1 FROM doctors_applications 
               WHERE id = test_id 
               AND cfm_resolution_accepted = true 
               AND medical_ethics_accepted = true) THEN
        RAISE NOTICE '✅ TYPE 3.5: Tipo BOOLEAN para aceitações funcionou';
    ELSE
        RAISE EXCEPTION '❌ TYPE 3.5: Tipo BOOLEAN para aceitações falhou';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM doctors_applications WHERE id = test_id;
    RAISE NOTICE '🧹 TYPE 3.6: Dados de teste removidos';
END $$;

-- =====================================================
-- TESTE 4: Validação de valores padrão
-- =====================================================
DO $$
DECLARE
    test_id UUID;
    default_status VARCHAR(20);
    default_created_at TIMESTAMP WITH TIME ZONE;
    default_updated_at TIMESTAMP WITH TIME ZONE;
BEGIN
    RAISE NOTICE '⚙️ TESTANDO VALORES PADRÃO';
    
    -- Inserir candidatura sem especificar valores padrão
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
        'Dr. Default Test', '555.666.777-88', '55.666.777-8',
        '1980-01-01', 'default.test@email.com', '(11) 99999-9999',
        'Rua Default, 123', 'masculino', '555666', 'SP', 'ativo',
        'USP', 2005, 'sim', '["cardiologia"]', '10-15',
        '001', '1234', '12345-6', '555.666.777-88', 'pessoa-fisica',
        89.90, true, true, true, true, true, true, true
    ) RETURNING id INTO test_id;
    
    -- Verificar valores padrão
    SELECT application_status, created_at, updated_at 
    INTO default_status, default_created_at, default_updated_at
    FROM doctors_applications WHERE id = test_id;
    
    -- Teste 4.1: Status padrão deve ser 'pending'
    IF default_status = 'pending' THEN
        RAISE NOTICE '✅ DEFAULT 4.1: Status padrão "pending" aplicado';
    ELSE
        RAISE EXCEPTION '❌ DEFAULT 4.1: Status padrão incorreto: %', default_status;
    END IF;
    
    -- Teste 4.2: created_at deve ser preenchido automaticamente
    IF default_created_at IS NOT NULL THEN
        RAISE NOTICE '✅ DEFAULT 4.2: created_at preenchido automaticamente';
    ELSE
        RAISE EXCEPTION '❌ DEFAULT 4.2: created_at NÃO foi preenchido';
    END IF;
    
    -- Teste 4.3: updated_at deve ser preenchido automaticamente
    IF default_updated_at IS NOT NULL THEN
        RAISE NOTICE '✅ DEFAULT 4.3: updated_at preenchido automaticamente';
    ELSE
        RAISE EXCEPTION '❌ DEFAULT 4.3: updated_at NÃO foi preenchido';
    END IF;
    
    -- Teste 4.4: created_at e updated_at devem ser próximos na inserção
    IF ABS(EXTRACT(EPOCH FROM (default_updated_at - default_created_at))) < 1 THEN
        RAISE NOTICE '✅ DEFAULT 4.4: Timestamps de criação são consistentes';
    ELSE
        RAISE EXCEPTION '❌ DEFAULT 4.4: Timestamps de criação inconsistentes';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM doctors_applications WHERE id = test_id;
    RAISE NOTICE '🧹 DEFAULT 4.5: Dados de teste removidos';
END $$;

-- =====================================================
-- TESTE 5: Validação de campos JSON
-- =====================================================
DO $$
DECLARE
    test_id UUID;
    json_specialties JSONB;
    json_equipment JSONB;
BEGIN
    RAISE NOTICE '📋 TESTANDO VALIDAÇÃO DE CAMPOS JSON';
    
    -- Teste 5.1: Inserir com JSON válido
    BEGIN
        INSERT INTO doctors_applications (
            full_name, cpf, rg, birth_date, email, phone, address, gender,
            crm, crm_state, crm_status, medical_school, graduation_year,
            diploma_recognized, specialties, experience_years,
            bank, agency, account, pix_key, tax_status,
            normal_consultation_price, weekly_schedule, available_shifts,
            service_modalities, equipment, software, certifications, insurance,
            cfm_resolution_accepted, medical_ethics_accepted, civil_responsibility_accepted,
            service_contract_accepted, privacy_policy_accepted,
            platform_terms_accepted, data_processing_authorized
        ) VALUES (
            'Dr. JSON Test', '777.888.999-00', '77.888.999-0',
            '1980-01-01', 'json.test@email.com', '(11) 99999-9999',
            'Rua JSON, 123', 'masculino', '777888', 'SP', 'ativo',
            'USP', 2005, 'sim', '["cardiologia", "clinica-geral"]', '10-15',
            '001', '1234', '12345-6', '777.888.999-00', 'pessoa-fisica',
            89.90, '["segunda-sexta"]', '["manha", "tarde"]',
            '["videochamada"]', '["computador-webcam", "internet-estavel"]',
            '["navegador-atualizado"]', '["telemedicina-curso"]', '["responsabilidade-civil"]',
            true, true, true, true, true, true, true
        ) RETURNING id INTO test_id;
        
        RAISE NOTICE '✅ JSON 5.1: Inserção com JSON válido funcionou';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION '❌ JSON 5.1: Erro na inserção com JSON: %', SQLERRM;
    END;
    
    -- Verificar se os dados JSON foram salvos corretamente
    SELECT specialties, equipment 
    INTO json_specialties, json_equipment
    FROM doctors_applications WHERE id = test_id;
    
    -- Teste 5.2: Verificar conteúdo do JSON specialties
    IF json_specialties ? 'cardiologia' AND json_specialties ? 'clinica-geral' THEN
        RAISE NOTICE '✅ JSON 5.2: JSON specialties salvo corretamente';
    ELSE
        RAISE EXCEPTION '❌ JSON 5.2: JSON specialties incorreto';
    END IF;
    
    -- Teste 5.3: Verificar conteúdo do JSON equipment
    IF json_equipment ? 'computador-webcam' AND json_equipment ? 'internet-estavel' THEN
        RAISE NOTICE '✅ JSON 5.3: JSON equipment salvo corretamente';
    ELSE
        RAISE EXCEPTION '❌ JSON 5.3: JSON equipment incorreto';
    END IF;
    
    -- Teste 5.4: Verificar operações JSONB
    IF EXISTS (SELECT 1 FROM doctors_applications 
               WHERE id = test_id 
               AND specialties @> '["cardiologia"]') THEN
        RAISE NOTICE '✅ JSON 5.4: Operações JSONB funcionando';
    ELSE
        RAISE EXCEPTION '❌ JSON 5.4: Operações JSONB falharam';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM doctors_applications WHERE id = test_id;
    RAISE NOTICE '🧹 JSON 5.5: Dados de teste removidos';
END $$;

-- =====================================================
-- RESUMO DOS TESTES DE CONSTRAINTS
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 TODOS OS TESTES DE CONSTRAINTS CONCLUÍDOS!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ Constraints NOT NULL';
    RAISE NOTICE '✅ Constraints UNIQUE';
    RAISE NOTICE '✅ Validação de tipos';
    RAISE NOTICE '✅ Valores padrão';
    RAISE NOTICE '✅ Campos JSON';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 INTEGRIDADE: Constraints funcionando';
    RAISE NOTICE '📊 TIPOS: Validação de dados correta';
    RAISE NOTICE '⚙️ PADRÕES: Valores automáticos aplicados';
    RAISE NOTICE '📋 JSON: Estruturas complexas suportadas';
    RAISE NOTICE '';
END $$;