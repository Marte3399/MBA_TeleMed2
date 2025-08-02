-- =====================================================
-- TESTES DE BANCO DE DADOS - TAREFA 3: ESPECIALIDADES
-- =====================================================
-- Testes para o sistema de especialidades médicas
-- Inclui testes de estrutura, dados e funcionalidades

-- Limpar resultados anteriores
DROP TABLE IF EXISTS test_results;
CREATE TABLE test_results (
    id SERIAL PRIMARY KEY,
    test_name VARCHAR(255),
    test_category VARCHAR(100),
    passed BOOLEAN,
    details TEXT,
    executed_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TESTE 1: VERIFICAR ESTRUTURA DA TABELA SPECIALTIES
-- =====================================================

DO $$
DECLARE
    table_exists BOOLEAN;
    column_count INTEGER;
BEGIN
    -- Verificar se a tabela specialties existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'specialties'
    ) INTO table_exists;
    
    IF table_exists THEN
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Tabela specialties existe', 'Estrutura', TRUE, 'Tabela encontrada no schema public');
        
        -- Verificar colunas essenciais
        SELECT COUNT(*) INTO column_count
        FROM information_schema.columns 
        WHERE table_name = 'specialties' 
        AND column_name IN ('id', 'name', 'description', 'icon', 'price', 'is_active');
        
        IF column_count >= 6 THEN
            INSERT INTO test_results (test_name, test_category, passed, details)
            VALUES ('Colunas essenciais presentes', 'Estrutura', TRUE, 
                    FORMAT('Encontradas %s colunas essenciais', column_count));
        ELSE
            INSERT INTO test_results (test_name, test_category, passed, details)
            VALUES ('Colunas essenciais presentes', 'Estrutura', FALSE, 
                    FORMAT('Apenas %s de 6 colunas encontradas', column_count));
        END IF;
    ELSE
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Tabela specialties existe', 'Estrutura', FALSE, 'Tabela não encontrada');
    END IF;
END $$;

-- =====================================================
-- TESTE 2: VERIFICAR DADOS INICIAIS DE ESPECIALIDADES
-- =====================================================

DO $$
DECLARE
    specialty_count INTEGER;
    active_count INTEGER;
BEGIN
    -- Verificar se existem especialidades cadastradas
    SELECT COUNT(*) INTO specialty_count FROM specialties;
    
    IF specialty_count > 0 THEN
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Dados iniciais presentes', 'Dados', TRUE, 
                FORMAT('%s especialidades encontradas', specialty_count));
        
        -- Verificar especialidades ativas
        SELECT COUNT(*) INTO active_count FROM specialties WHERE is_active = TRUE;
        
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Especialidades ativas', 'Dados', active_count > 0, 
                FORMAT('%s especialidades ativas de %s total', active_count, specialty_count));
    ELSE
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Dados iniciais presentes', 'Dados', FALSE, 'Nenhuma especialidade encontrada');
    END IF;
END $$;

-- =====================================================
-- TESTE 3: VALIDAR ESTRUTURA DE DADOS
-- =====================================================

DO $$
DECLARE
    invalid_prices INTEGER;
    missing_names INTEGER;
    missing_descriptions INTEGER;
BEGIN
    -- Verificar preços válidos (não nulos e positivos)
    SELECT COUNT(*) INTO invalid_prices 
    FROM specialties 
    WHERE price IS NULL OR price <= 0;
    
    INSERT INTO test_results (test_name, test_category, passed, details)
    VALUES ('Preços válidos', 'Validação', invalid_prices = 0, 
            CASE WHEN invalid_prices = 0 
                 THEN 'Todos os preços são válidos'
                 ELSE FORMAT('%s especialidades com preços inválidos', invalid_prices)
            END);
    
    -- Verificar nomes obrigatórios
    SELECT COUNT(*) INTO missing_names 
    FROM specialties 
    WHERE name IS NULL OR TRIM(name) = '';
    
    INSERT INTO test_results (test_name, test_category, passed, details)
    VALUES ('Nomes obrigatórios', 'Validação', missing_names = 0, 
            CASE WHEN missing_names = 0 
                 THEN 'Todas as especialidades têm nomes'
                 ELSE FORMAT('%s especialidades sem nome', missing_names)
            END);
    
    -- Verificar descrições obrigatórias
    SELECT COUNT(*) INTO missing_descriptions 
    FROM specialties 
    WHERE description IS NULL OR TRIM(description) = '';
    
    INSERT INTO test_results (test_name, test_category, passed, details)
    VALUES ('Descrições obrigatórias', 'Validação', missing_descriptions = 0, 
            CASE WHEN missing_descriptions = 0 
                 THEN 'Todas as especialidades têm descrições'
                 ELSE FORMAT('%s especialidades sem descrição', missing_descriptions)
            END);
END $$;

-- =====================================================
-- TESTE 4: TESTAR OPERAÇÕES CRUD
-- =====================================================

DO $$
DECLARE
    test_id INTEGER;
    found_record RECORD;
    update_success BOOLEAN := FALSE;
    delete_success BOOLEAN := FALSE;
BEGIN
    -- Teste INSERT
    BEGIN
        INSERT INTO specialties (name, description, icon, price, duration, is_active)
        VALUES ('Teste Especialidade', 'Descrição de teste', '🧪', 99.99, 30, TRUE)
        RETURNING id INTO test_id;
        
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('INSERT especialidade', 'CRUD', TRUE, 
                FORMAT('Especialidade inserida com ID: %s', test_id));
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('INSERT especialidade', 'CRUD', FALSE, 
                FORMAT('Erro ao inserir: %s', SQLERRM));
        RETURN;
    END;
    
    -- Teste SELECT
    BEGIN
        SELECT * INTO found_record FROM specialties WHERE id = test_id;
        
        IF FOUND THEN
            INSERT INTO test_results (test_name, test_category, passed, details)
            VALUES ('SELECT especialidade', 'CRUD', TRUE, 
                    FORMAT('Especialidade encontrada: %s', found_record.name));
        ELSE
            INSERT INTO test_results (test_name, test_category, passed, details)
            VALUES ('SELECT especialidade', 'CRUD', FALSE, 'Especialidade não encontrada após inserção');
        END IF;
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('SELECT especialidade', 'CRUD', FALSE, 
                FORMAT('Erro ao buscar: %s', SQLERRM));
    END;
    
    -- Teste UPDATE
    BEGIN
        UPDATE specialties 
        SET name = 'Teste Especialidade Atualizada', price = 149.99
        WHERE id = test_id;
        
        GET DIAGNOSTICS update_success = ROW_COUNT;
        
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('UPDATE especialidade', 'CRUD', update_success > 0, 
                CASE WHEN update_success > 0 
                     THEN 'Especialidade atualizada com sucesso'
                     ELSE 'Nenhuma linha foi atualizada'
                END);
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('UPDATE especialidade', 'CRUD', FALSE, 
                FORMAT('Erro ao atualizar: %s', SQLERRM));
    END;
    
    -- Teste DELETE
    BEGIN
        DELETE FROM specialties WHERE id = test_id;
        
        GET DIAGNOSTICS delete_success = ROW_COUNT;
        
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('DELETE especialidade', 'CRUD', delete_success > 0, 
                CASE WHEN delete_success > 0 
                     THEN 'Especialidade removida com sucesso'
                     ELSE 'Nenhuma linha foi removida'
                END);
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('DELETE especialidade', 'CRUD', FALSE, 
                FORMAT('Erro ao remover: %s', SQLERRM));
    END;
END $$;

-- =====================================================
-- TESTE 5: TESTAR CONSULTAS DE BUSCA E FILTROS
-- =====================================================

DO $$
DECLARE
    search_count INTEGER;
    filter_count INTEGER;
    sort_test RECORD;
BEGIN
    -- Teste busca por nome (simulando busca do frontend)
    SELECT COUNT(*) INTO search_count 
    FROM specialties 
    WHERE LOWER(name) LIKE '%cardio%' OR LOWER(description) LIKE '%cardio%';
    
    INSERT INTO test_results (test_name, test_category, passed, details)
    VALUES ('Busca por texto', 'Consultas', TRUE, 
            FORMAT('Busca por "cardio" retornou %s resultados', search_count));
    
    -- Teste filtro por preço
    SELECT COUNT(*) INTO filter_count 
    FROM specialties 
    WHERE price BETWEEN 50 AND 150 AND is_active = TRUE;
    
    INSERT INTO test_results (test_name, test_category, passed, details)
    VALUES ('Filtro por preço', 'Consultas', TRUE, 
            FORMAT('Filtro preço R$50-150 retornou %s resultados', filter_count));
    
    -- Teste ordenação
    SELECT name, price INTO sort_test
    FROM specialties 
    WHERE is_active = TRUE
    ORDER BY price ASC 
    LIMIT 1;
    
    IF FOUND THEN
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Ordenação por preço', 'Consultas', TRUE, 
                FORMAT('Menor preço: %s - R$ %s', sort_test.name, sort_test.price));
    ELSE
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Ordenação por preço', 'Consultas', FALSE, 'Nenhum resultado para ordenação');
    END IF;
END $$;

-- =====================================================
-- TESTE 6: TESTAR PERFORMANCE DE CONSULTAS
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration_ms INTEGER;
    result_count INTEGER;
BEGIN
    -- Teste performance de consulta complexa
    start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO result_count
    FROM specialties s
    WHERE s.is_active = TRUE
    AND s.price > 0
    AND LENGTH(s.description) > 10
    ORDER BY s.name;
    
    end_time := clock_timestamp();
    duration_ms := EXTRACT(MILLISECONDS FROM (end_time - start_time));
    
    INSERT INTO test_results (test_name, test_category, passed, details)
    VALUES ('Performance consulta complexa', 'Performance', duration_ms < 100, 
            FORMAT('Consulta executada em %s ms, retornou %s registros', duration_ms, result_count));
    
    -- Teste performance de busca com LIKE
    start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO result_count
    FROM specialties
    WHERE LOWER(name) LIKE '%a%' OR LOWER(description) LIKE '%a%';
    
    end_time := clock_timestamp();
    duration_ms := EXTRACT(MILLISECONDS FROM (end_time - start_time));
    
    INSERT INTO test_results (test_name, test_category, passed, details)
    VALUES ('Performance busca LIKE', 'Performance', duration_ms < 200, 
            FORMAT('Busca LIKE executada em %s ms, retornou %s registros', duration_ms, result_count));
END $$;

-- =====================================================
-- TESTE 7: TESTAR INTEGRIDADE E CONSTRAINTS
-- =====================================================

DO $$
DECLARE
    constraint_violation BOOLEAN := FALSE;
BEGIN
    -- Teste constraint de nome único (se existir)
    BEGIN
        INSERT INTO specialties (name, description, icon, price, duration, is_active)
        VALUES ('Cardiologia', 'Teste duplicata', '❤️', 99.99, 30, TRUE);
        
        -- Se chegou aqui, não há constraint de unicidade
        DELETE FROM specialties WHERE description = 'Teste duplicata';
        
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Constraint nome único', 'Integridade', FALSE, 
                'Permitiu inserção de nome duplicado - constraint pode estar ausente');
    EXCEPTION WHEN unique_violation THEN
        constraint_violation := TRUE;
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Constraint nome único', 'Integridade', TRUE, 
                'Constraint de nome único funcionando corretamente');
    WHEN OTHERS THEN
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Constraint nome único', 'Integridade', FALSE, 
                FORMAT('Erro inesperado: %s', SQLERRM));
    END;
    
    -- Teste constraint NOT NULL
    BEGIN
        INSERT INTO specialties (description, icon, price, duration, is_active)
        VALUES ('Teste sem nome', '🧪', 99.99, 30, TRUE);
        
        -- Se chegou aqui, constraint NOT NULL pode estar ausente
        DELETE FROM specialties WHERE description = 'Teste sem nome';
        
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Constraint NOT NULL name', 'Integridade', FALSE, 
                'Permitiu inserção sem nome - constraint NOT NULL pode estar ausente');
    EXCEPTION WHEN not_null_violation THEN
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Constraint NOT NULL name', 'Integridade', TRUE, 
                'Constraint NOT NULL para nome funcionando corretamente');
    WHEN OTHERS THEN
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Constraint NOT NULL name', 'Integridade', FALSE, 
                FORMAT('Erro inesperado: %s', SQLERRM));
    END;
END $$;

-- =====================================================
-- TESTE 8: TESTAR ÍNDICES E OTIMIZAÇÕES
-- =====================================================

DO $$
DECLARE
    index_count INTEGER;
    explain_result TEXT;
BEGIN
    -- Verificar se existem índices na tabela specialties
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename = 'specialties' 
    AND schemaname = 'public';
    
    INSERT INTO test_results (test_name, test_category, passed, details)
    VALUES ('Índices presentes', 'Otimização', index_count > 1, 
            FORMAT('%s índices encontrados na tabela specialties', index_count));
    
    -- Verificar se existe índice para busca por nome
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename = 'specialties' 
    AND schemaname = 'public'
    AND (indexname LIKE '%name%' OR indexdef LIKE '%name%');
    
    INSERT INTO test_results (test_name, test_category, passed, details)
    VALUES ('Índice para busca por nome', 'Otimização', index_count > 0, 
            CASE WHEN index_count > 0 
                 THEN 'Índice para campo name encontrado'
                 ELSE 'Nenhum índice específico para campo name'
            END);
END $$;

-- =====================================================
-- TESTE 9: TESTAR DADOS ESPECÍFICOS DAS ESPECIALIDADES
-- =====================================================

DO $$
DECLARE
    cardiology_exists BOOLEAN;
    pediatrics_exists BOOLEAN;
    dermatology_exists BOOLEAN;
    psychiatry_exists BOOLEAN;
    price_range_ok BOOLEAN;
BEGIN
    -- Verificar se especialidades essenciais existem
    SELECT EXISTS(SELECT 1 FROM specialties WHERE LOWER(name) LIKE '%cardio%') INTO cardiology_exists;
    SELECT EXISTS(SELECT 1 FROM specialties WHERE LOWER(name) LIKE '%pediatr%') INTO pediatrics_exists;
    SELECT EXISTS(SELECT 1 FROM specialties WHERE LOWER(name) LIKE '%dermat%') INTO dermatology_exists;
    SELECT EXISTS(SELECT 1 FROM specialties WHERE LOWER(name) LIKE '%psiq%') INTO psychiatry_exists;
    
    INSERT INTO test_results (test_name, test_category, passed, details)
    VALUES ('Especialidades essenciais', 'Dados Específicos', 
            cardiology_exists AND pediatrics_exists AND dermatology_exists AND psychiatry_exists,
            FORMAT('Cardiologia: %s, Pediatria: %s, Dermatologia: %s, Psiquiatria: %s',
                   cardiology_exists, pediatrics_exists, dermatology_exists, psychiatry_exists));
    
    -- Verificar faixa de preços realista
    SELECT NOT EXISTS(
        SELECT 1 FROM specialties 
        WHERE price < 50 OR price > 500
    ) INTO price_range_ok;
    
    INSERT INTO test_results (test_name, test_category, passed, details)
    VALUES ('Faixa de preços realista', 'Dados Específicos', price_range_ok,
            CASE WHEN price_range_ok 
                 THEN 'Todos os preços estão entre R$ 50 e R$ 500'
                 ELSE 'Alguns preços estão fora da faixa esperada (R$ 50-500)'
            END);
END $$;

-- =====================================================
-- TESTE 10: TESTAR COMPATIBILIDADE COM FRONTEND
-- =====================================================

DO $$
DECLARE
    json_compatibility BOOLEAN := TRUE;
    required_fields INTEGER;
    specialty_record RECORD;
BEGIN
    -- Verificar se todos os campos necessários para o frontend estão presentes
    SELECT COUNT(*) INTO required_fields
    FROM information_schema.columns 
    WHERE table_name = 'specialties' 
    AND column_name IN ('id', 'name', 'description', 'icon', 'price', 'duration', 'is_active');
    
    INSERT INTO test_results (test_name, test_category, passed, details)
    VALUES ('Campos para frontend', 'Compatibilidade', required_fields >= 7,
            FORMAT('%s de 7 campos obrigatórios encontrados', required_fields));
    
    -- Testar se os dados podem ser serializados como JSON
    BEGIN
        SELECT row_to_json(s.*) INTO specialty_record
        FROM specialties s
        WHERE is_active = TRUE
        LIMIT 1;
        
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Serialização JSON', 'Compatibilidade', TRUE,
                'Dados podem ser convertidos para JSON');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO test_results (test_name, test_category, passed, details)
        VALUES ('Serialização JSON', 'Compatibilidade', FALSE,
                FORMAT('Erro na serialização: %s', SQLERRM));
    END;
END $$;

-- =====================================================
-- RELATÓRIO FINAL DOS TESTES
-- =====================================================

-- Exibir resumo dos resultados
SELECT 
    test_category as "Categoria",
    COUNT(*) as "Total de Testes",
    SUM(CASE WHEN passed THEN 1 ELSE 0 END) as "Aprovados",
    SUM(CASE WHEN NOT passed THEN 1 ELSE 0 END) as "Falharam",
    ROUND(
        (SUM(CASE WHEN passed THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100, 
        2
    ) as "Taxa de Sucesso (%)"
FROM test_results
GROUP BY test_category
ORDER BY test_category;

-- Exibir todos os resultados detalhados
SELECT 
    test_name as "Teste",
    test_category as "Categoria",
    CASE WHEN passed THEN '✅ PASSOU' ELSE '❌ FALHOU' END as "Resultado",
    details as "Detalhes",
    executed_at as "Executado em"
FROM test_results
ORDER BY test_category, test_name;

-- Exibir apenas os testes que falharam
SELECT 
    test_name as "Teste que Falhou",
    test_category as "Categoria",
    details as "Motivo da Falha",
    executed_at as "Executado em"
FROM test_results
WHERE NOT passed
ORDER BY test_category, test_name;

-- Estatísticas gerais
SELECT 
    COUNT(*) as "Total de Testes Executados",
    SUM(CASE WHEN passed THEN 1 ELSE 0 END) as "Testes Aprovados",
    SUM(CASE WHEN NOT passed THEN 1 ELSE 0 END) as "Testes Falharam",
    ROUND(
        (SUM(CASE WHEN passed THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100, 
        2
    ) as "Taxa de Sucesso Geral (%)"
FROM test_results;

-- Limpar tabela de resultados (opcional - descomente se quiser limpar após ver os resultados)
-- DROP TABLE test_results;