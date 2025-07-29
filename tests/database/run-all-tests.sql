-- =====================================================
-- SCRIPT PRINCIPAL PARA EXECUTAR TODOS OS TESTES
-- Sistema de Telemedicina - Supabase
-- =====================================================

-- Instalar extensão pgtap se não estiver instalada
CREATE EXTENSION IF NOT EXISTS pgtap;

\echo '=================================================='
\echo 'EXECUTANDO TESTES DO BANCO DE DADOS'
\echo 'Sistema de Telemedicina - Supabase'
\echo '=================================================='

\echo ''
\echo '1. EXECUTANDO TESTES DE ESTRUTURA DAS TABELAS...'
\i tests/database/database-tests.sql

\echo ''
\echo '2. EXECUTANDO TESTES DE CONSTRAINTS E REGRAS...'
\i tests/database/constraints-tests.sql

\echo ''
\echo '3. EXECUTANDO TESTES DE ROW LEVEL SECURITY...'
\i tests/database/rls-tests.sql

\echo ''
\echo '4. EXECUTANDO TESTES DE INTEGRAÇÃO...'
\i tests/database/integration-tests.sql

\echo ''
\echo '5. EXECUTANDO TESTES DE OPERAÇÕES CRUD...'
\i tests/database/crud-operations-tests.sql

\echo ''
\echo '=================================================='
\echo 'TODOS OS TESTES FORAM EXECUTADOS!'
\echo 'Verifique os resultados acima para identificar'
\echo 'possíveis falhas ou problemas.'
\echo '=================================================='