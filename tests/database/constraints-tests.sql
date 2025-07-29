-- =====================================================
-- TESTES DE CONSTRAINTS E REGRAS DE NEGÓCIO
-- Sistema de Telemedicina - Supabase
-- =====================================================

BEGIN;

SELECT plan(25);

-- =====================================================
-- TESTES DE CONSTRAINTS DA TABELA SPECIALTIES
-- =====================================================

-- Teste 1: Inserir specialty válida
INSERT INTO specialties (name, description, icon, price, duration) 
VALUES ('Teste Specialty', 'Descrição teste', '🩺', 100.00, 30);

SELECT ok(
    (SELECT COUNT(*) FROM specialties WHERE name = 'Teste Specialty') = 1,
    'Deve permitir inserir specialty válida'
);

-- Teste 2: Não deve permitir preço negativo
SELECT throws_ok(
    'INSERT INTO specialties (name, price) VALUES (''Teste Negativo'', -50.00)',
    '23514',
    'new row for relation "specialties" violates check constraint "specialties_price_check"',
    'Não deve permitir preço negativo'
);

-- Teste 3: Não deve permitir duração zero ou negativa
SELECT throws_ok(
    'INSERT INTO specialties (name, price, duration) VALUES (''Teste Duração'', 100.00, 0)',
    '23514',
    'new row for relation "specialties" violates check constraint "specialties_duration_check"',
    'Não deve permitir duração zero'
);

-- Teste 4: Não deve permitir nome duplicado
SELECT throws_ok(
    'INSERT INTO specialties (name, price) VALUES (''Teste Specialty'', 150.00)',
    '23505',
    'duplicate key value violates unique constraint "specialties_name_key"',
    'Não deve permitir nome de specialty duplicado'
);

-- =====================================================
-- TESTES DE CONSTRAINTS DA TABELA DOCTORS
-- =====================================================

-- Primeiro, criar um usuário de teste no auth.users (simulado)
-- Em um ambiente real, isso seria feito através do sistema de autenticação

-- Teste 5: Inserir doctor válido
INSERT INTO doctors (name, crm, experience_years, rating, total_consultations) 
VALUES ('Dr. Teste', 'CRM123456', 5, 4.5, 100);

SELECT ok(
    (SELECT COUNT(*) FROM doctors WHERE crm = 'CRM123456') = 1,
    'Deve permitir inserir doctor válido'
);

-- Teste 6: Não deve permitir CRM duplicado
SELECT throws_ok(
    'INSERT INTO doctors (name, crm) VALUES (''Dr. Outro'', ''CRM123456'')',
    '23505',
    'duplicate key value violates unique constraint "doctors_crm_key"',
    'Não deve permitir CRM duplicado'
);

-- Teste 7: Não deve permitir anos de experiência negativo
SELECT throws_ok(
    'INSERT INTO doctors (name, crm, experience_years) VALUES (''Dr. Negativo'', ''CRM999'', -1)',
    '23514',
    'new row for relation "doctors" violates check constraint "doctors_experience_years_check"',
    'Não deve permitir anos de experiência negativo'
);

-- Teste 8: Não deve permitir rating fora do range 0-5
SELECT throws_ok(
    'INSERT INTO doctors (name, crm, rating) VALUES (''Dr. Rating Alto'', ''CRM888'', 6.0)',
    '23514',
    'new row for relation "doctors" violates check constraint "doctors_rating_check"',
    'Não deve permitir rating maior que 5'
);

-- Teste 9: Não deve permitir total_consultations negativo
SELECT throws_ok(
    'INSERT INTO doctors (name, crm, total_consultations) VALUES (''Dr. Consultas'', ''CRM777'', -5)',
    '23514',
    'new row for relation "doctors" violates check constraint "doctors_total_consultations_check"',
    'Não deve permitir total_consultations negativo'
);

-- Teste 10: Deve aceitar status de disponibilidade válidos
INSERT INTO doctors (name, crm, availability_status) 
VALUES ('Dr. Status', 'CRM666', 'online');

SELECT ok(
    (SELECT availability_status FROM doctors WHERE crm = 'CRM666') = 'online',
    'Deve aceitar status de disponibilidade válido'
);

-- Teste 11: Não deve aceitar status de disponibilidade inválido
SELECT throws_ok(
    'INSERT INTO doctors (name, crm, availability_status) VALUES (''Dr. Status Inválido'', ''CRM555'', ''invalid_status'')',
    '23514',
    'new row for relation "doctors" violates check constraint "doctors_availability_status_check"',
    'Não deve aceitar status de disponibilidade inválido'
);

-- =====================================================
-- TESTES DE CONSTRAINTS DA TABELA APPOINTMENTS
-- =====================================================

-- Teste 12: Inserir appointment válido
INSERT INTO appointments (scheduled_date, scheduled_time, price, duration) 
VALUES ('2024-12-01', '14:00:00', 150.00, 30);

SELECT ok(
    (SELECT COUNT(*) FROM appointments WHERE scheduled_date = '2024-12-01') = 1,
    'Deve permitir inserir appointment válido'
);

-- Teste 13: Não deve permitir preço negativo
SELECT throws_ok(
    'INSERT INTO appointments (price) VALUES (-100.00)',
    '23514',
    'new row for relation "appointments" violates check constraint "appointments_price_check"',
    'Não deve permitir preço negativo em appointments'
);

-- Teste 14: Não deve permitir duração zero ou negativa
SELECT throws_ok(
    'INSERT INTO appointments (price, duration) VALUES (100.00, 0)',
    '23514',
    'new row for relation "appointments" violates check constraint "appointments_duration_check"',
    'Não deve permitir duração zero em appointments'
);

-- Teste 15: Deve aceitar status válidos
INSERT INTO appointments (price, status) VALUES (100.00, 'completed');

SELECT ok(
    (SELECT COUNT(*) FROM appointments WHERE status = 'completed') = 1,
    'Deve aceitar status válido em appointments'
);

-- Teste 16: Não deve aceitar status inválido
SELECT throws_ok(
    'INSERT INTO appointments (price, status) VALUES (100.00, ''invalid_status'')',
    '23514',
    'new row for relation "appointments" violates check constraint "appointments_status_check"',
    'Não deve aceitar status inválido em appointments'
);

-- Teste 17: Deve aceitar tipos válidos
INSERT INTO appointments (price, type) VALUES (100.00, 'audio');

SELECT ok(
    (SELECT COUNT(*) FROM appointments WHERE type = 'audio') = 1,
    'Deve aceitar tipo válido em appointments'
);

-- =====================================================
-- TESTES DE CONSTRAINTS DA TABELA CONSULTATION_QUEUE
-- =====================================================

-- Teste 18: Inserir entrada na fila válida
INSERT INTO consultation_queue (position, estimated_wait_time) 
VALUES (1, 15);

SELECT ok(
    (SELECT COUNT(*) FROM consultation_queue WHERE position = 1) = 1,
    'Deve permitir inserir entrada válida na fila'
);

-- Teste 19: Não deve permitir posição zero ou negativa
SELECT throws_ok(
    'INSERT INTO consultation_queue (position) VALUES (0)',
    '23514',
    'new row for relation "consultation_queue" violates check constraint "consultation_queue_position_check"',
    'Não deve permitir posição zero na fila'
);

-- Teste 20: Não deve permitir tempo de espera negativo
SELECT throws_ok(
    'INSERT INTO consultation_queue (position, estimated_wait_time) VALUES (2, -10)',
    '23514',
    'new row for relation "consultation_queue" violates check constraint "consultation_queue_estimated_wait_time_check"',
    'Não deve permitir tempo de espera negativo'
);

-- Teste 21: Deve aceitar status válidos na fila
INSERT INTO consultation_queue (position, status) VALUES (3, 'ready');

SELECT ok(
    (SELECT COUNT(*) FROM consultation_queue WHERE status = 'ready') = 1,
    'Deve aceitar status válido na fila'
);

-- =====================================================
-- TESTES DE RELACIONAMENTOS (FOREIGN KEYS)
-- =====================================================

-- Teste 22: Verificar relacionamento doctors -> specialties
SELECT ok(
    (SELECT COUNT(*) FROM information_schema.table_constraints 
     WHERE constraint_name = 'doctors_specialty_id_fkey') = 1,
    'Deve existir foreign key entre doctors e specialties'
);

-- Teste 23: Verificar relacionamento appointments -> doctors
SELECT ok(
    (SELECT COUNT(*) FROM information_schema.table_constraints 
     WHERE constraint_name = 'appointments_doctor_id_fkey') = 1,
    'Deve existir foreign key entre appointments e doctors'
);

-- Teste 24: Verificar relacionamento consultation_queue -> appointments
SELECT ok(
    (SELECT COUNT(*) FROM information_schema.table_constraints 
     WHERE constraint_name = 'consultation_queue_appointment_id_fkey') = 1,
    'Deve existir foreign key entre consultation_queue e appointments'
);

-- Teste 25: Verificar relacionamento medical_records -> appointments
SELECT ok(
    (SELECT COUNT(*) FROM information_schema.table_constraints 
     WHERE constraint_name = 'medical_records_appointment_id_fkey') = 1,
    'Deve existir foreign key entre medical_records e appointments'
);

SELECT * FROM finish();
ROLLBACK;