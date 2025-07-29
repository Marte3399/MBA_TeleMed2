-- =====================================================
-- TESTES DE OPERAÇÕES CRUD - CENÁRIOS REAIS
-- Sistema de Telemedicina - Supabase
-- =====================================================

BEGIN;

SELECT plan(30);

-- =====================================================
-- TESTES CRUD - SPECIALTIES
-- =====================================================

-- Teste 1: CREATE - Inserir nova specialty
INSERT INTO specialties (name, description, icon, price, duration, is_active) 
VALUES ('Neurologia', 'Especialista em sistema nervoso', '🧠', 200.00, 60, true);

SELECT ok(
    (SELECT COUNT(*) FROM specialties WHERE name = 'Neurologia') = 1,
    'Deve conseguir criar nova specialty'
);

-- Teste 2: READ - Buscar specialty por nome
SELECT ok(
    (SELECT price FROM specialties WHERE name = 'Neurologia') = 200.00,
    'Deve conseguir ler dados da specialty criada'
);

-- Teste 3: UPDATE - Atualizar preço da specialty
UPDATE specialties SET price = 220.00 WHERE name = 'Neurologia';

SELECT ok(
    (SELECT price FROM specialties WHERE name = 'Neurologia') = 220.00,
    'Deve conseguir atualizar preço da specialty'
);

-- Teste 4: UPDATE - Desativar specialty
UPDATE specialties SET is_active = false WHERE name = 'Neurologia';

SELECT ok(
    (SELECT is_active FROM specialties WHERE name = 'Neurologia') = false,
    'Deve conseguir desativar specialty'
);

-- =====================================================
-- TESTES CRUD - DOCTORS
-- =====================================================

-- Primeiro, reativar a specialty para os testes
UPDATE specialties SET is_active = true WHERE name = 'Neurologia';

-- Teste 5: CREATE - Inserir novo doctor
INSERT INTO doctors (name, crm, specialty_id, experience_years, rating, is_online, availability_status) 
VALUES ('Dr. João Silva', 'CRM54321', 
        (SELECT id FROM specialties WHERE name = 'Neurologia'), 
        15, 4.9, true, 'online');

SELECT ok(
    (SELECT COUNT(*) FROM doctors WHERE crm = 'CRM54321') = 1,
    'Deve conseguir criar novo doctor'
);

-- Teste 6: READ - Buscar doctor com dados da specialty
SELECT ok(
    (SELECT s.name FROM doctors d 
     JOIN specialties s ON d.specialty_id = s.id 
     WHERE d.crm = 'CRM54321') = 'Neurologia',
    'Deve conseguir ler doctor com dados da specialty'
);

-- Teste 7: UPDATE - Atualizar status de disponibilidade
UPDATE doctors SET availability_status = 'busy', is_online = true 
WHERE crm = 'CRM54321';

SELECT ok(
    (SELECT availability_status FROM doctors WHERE crm = 'CRM54321') = 'busy',
    'Deve conseguir atualizar status de disponibilidade do doctor'
);

-- Teste 8: UPDATE - Incrementar total de consultas
UPDATE doctors SET total_consultations = total_consultations + 1 
WHERE crm = 'CRM54321';

SELECT ok(
    (SELECT total_consultations FROM doctors WHERE crm = 'CRM54321') = 1,
    'Deve conseguir incrementar total de consultas do doctor'
);

-- =====================================================
-- TESTES CRUD - APPOINTMENTS
-- =====================================================

-- Teste 9: CREATE - Inserir novo appointment
INSERT INTO appointments (doctor_id, specialty_id, scheduled_date, scheduled_time, 
                         duration, status, type, price, symptoms) 
VALUES ((SELECT id FROM doctors WHERE crm = 'CRM54321'),
        (SELECT id FROM specialties WHERE name = 'Neurologia'),
        '2024-12-20', '15:30:00', 60, 'scheduled', 'video', 220.00,
        'Dores de cabeça frequentes e tonturas');

SELECT ok(
    (SELECT COUNT(*) FROM appointments 
     WHERE scheduled_date = '2024-12-20' AND scheduled_time = '15:30:00') = 1,
    'Deve conseguir criar novo appointment'
);

-- Teste 10: READ - Buscar appointment com dados completos
SELECT ok(
    (SELECT d.name FROM appointments a
     JOIN doctors d ON a.doctor_id = d.id
     WHERE a.scheduled_date = '2024-12-20') = 'Dr. João Silva',
    'Deve conseguir ler appointment com dados do doctor'
);

-- Teste 11: UPDATE - Alterar status do appointment
UPDATE appointments SET status = 'waiting' 
WHERE scheduled_date = '2024-12-20' AND scheduled_time = '15:30:00';

SELECT ok(
    (SELECT status FROM appointments 
     WHERE scheduled_date = '2024-12-20' AND scheduled_time = '15:30:00') = 'waiting',
    'Deve conseguir atualizar status do appointment'
);

-- Teste 12: UPDATE - Adicionar payment_id
UPDATE appointments SET payment_id = 'PAY_123456789' 
WHERE scheduled_date = '2024-12-20' AND scheduled_time = '15:30:00';

SELECT ok(
    (SELECT payment_id FROM appointments 
     WHERE scheduled_date = '2024-12-20' AND scheduled_time = '15:30:00') = 'PAY_123456789',
    'Deve conseguir adicionar payment_id ao appointment'
);

-- =====================================================
-- TESTES CRUD - CONSULTATION_QUEUE
-- =====================================================

-- Teste 13: CREATE - Inserir entrada na fila
INSERT INTO consultation_queue (appointment_id, specialty_id, position, 
                               estimated_wait_time, status) 
VALUES ((SELECT id FROM appointments WHERE payment_id = 'PAY_123456789'),
        (SELECT id FROM specialties WHERE name = 'Neurologia'),
        1, 45, 'waiting');

SELECT ok(
    (SELECT COUNT(*) FROM consultation_queue WHERE position = 1) = 1,
    'Deve conseguir criar entrada na fila'
);

-- Teste 14: READ - Buscar posição na fila com dados do appointment
SELECT ok(
    (SELECT a.symptoms FROM consultation_queue cq
     JOIN appointments a ON cq.appointment_id = a.id
     WHERE cq.position = 1) LIKE '%Dores de cabeça%',
    'Deve conseguir ler dados da fila com informações do appointment'
);

-- Teste 15: UPDATE - Atualizar posição na fila
UPDATE consultation_queue SET position = 2, estimated_wait_time = 30 
WHERE appointment_id = (SELECT id FROM appointments WHERE payment_id = 'PAY_123456789');

SELECT ok(
    (SELECT position FROM consultation_queue 
     WHERE appointment_id = (SELECT id FROM appointments WHERE payment_id = 'PAY_123456789')) = 2,
    'Deve conseguir atualizar posição na fila'
);

-- Teste 16: UPDATE - Alterar status para ready
UPDATE consultation_queue SET status = 'ready', notified_at = NOW() 
WHERE appointment_id = (SELECT id FROM appointments WHERE payment_id = 'PAY_123456789');

SELECT ok(
    (SELECT status FROM consultation_queue 
     WHERE appointment_id = (SELECT id FROM appointments WHERE payment_id = 'PAY_123456789')) = 'ready',
    'Deve conseguir alterar status da fila para ready'
);

-- =====================================================
-- TESTES CRUD - MEDICAL_RECORDS
-- =====================================================

-- Teste 17: CREATE - Inserir prontuário médico
INSERT INTO medical_records (appointment_id, doctor_id, diagnosis, prescription, 
                            recommendations, is_signed) 
VALUES ((SELECT id FROM appointments WHERE payment_id = 'PAY_123456789'),
        (SELECT id FROM doctors WHERE crm = 'CRM54321'),
        'Cefaleia tensional crônica',
        'Paracetamol 500mg - 1 comprimido a cada 6 horas se necessário',
        'Evitar estresse, manter hidratação adequada, exercícios regulares',
        true);

SELECT ok(
    (SELECT COUNT(*) FROM medical_records 
     WHERE diagnosis LIKE '%Cefaleia%') = 1,
    'Deve conseguir criar prontuário médico'
);

-- Teste 18: READ - Buscar prontuário com dados do doctor
SELECT ok(
    (SELECT d.name FROM medical_records mr
     JOIN doctors d ON mr.doctor_id = d.id
     WHERE mr.diagnosis LIKE '%Cefaleia%') = 'Dr. João Silva',
    'Deve conseguir ler prontuário com dados do doctor'
);

-- Teste 19: UPDATE - Adicionar assinatura digital
UPDATE medical_records SET digital_signature = 'SIGN_ABC123XYZ', 
                          pdf_url = 'https://storage.example.com/records/123.pdf'
WHERE diagnosis LIKE '%Cefaleia%';

SELECT ok(
    (SELECT digital_signature FROM medical_records 
     WHERE diagnosis LIKE '%Cefaleia%') = 'SIGN_ABC123XYZ',
    'Deve conseguir adicionar assinatura digital ao prontuário'
);

-- =====================================================
-- TESTES CRUD - NOTIFICATIONS
-- =====================================================

-- Teste 20: CREATE - Inserir notificação
INSERT INTO notifications (type, title, message, channels, is_read) 
VALUES ('appointment_reminder', 'Consulta em 15 minutos', 
        'Sua consulta com Dr. João Silva está próxima. Prepare-se!',
        '["push", "whatsapp"]'::jsonb, false);

SELECT ok(
    (SELECT COUNT(*) FROM notifications WHERE type = 'appointment_reminder') = 1,
    'Deve conseguir criar notificação'
);

-- Teste 21: READ - Buscar notificação por tipo
SELECT ok(
    (SELECT title FROM notifications WHERE type = 'appointment_reminder') = 'Consulta em 15 minutos',
    'Deve conseguir ler dados da notificação'
);

-- Teste 22: UPDATE - Marcar notificação como lida
UPDATE notifications SET is_read = true, read_at = NOW() 
WHERE type = 'appointment_reminder';

SELECT ok(
    (SELECT is_read FROM notifications WHERE type = 'appointment_reminder') = true,
    'Deve conseguir marcar notificação como lida'
);

-- =====================================================
-- TESTES DE CENÁRIOS COMPLEXOS
-- =====================================================

-- Teste 23: Cenário completo - Buscar fila com todos os dados
SELECT ok(
    (SELECT COUNT(*) FROM consultation_queue cq
     JOIN appointments a ON cq.appointment_id = a.id
     JOIN doctors d ON a.doctor_id = d.id
     JOIN specialties s ON a.specialty_id = s.id
     WHERE s.name = 'Neurologia' 
     AND d.crm = 'CRM54321'
     AND cq.status = 'ready') = 1,
    'Deve conseguir buscar fila com todos os dados relacionados'
);

-- Teste 24: Cenário - Atualizar appointment para in_progress
UPDATE appointments SET status = 'in_progress' 
WHERE payment_id = 'PAY_123456789';

UPDATE consultation_queue SET status = 'in_consultation' 
WHERE appointment_id = (SELECT id FROM appointments WHERE payment_id = 'PAY_123456789');

SELECT ok(
    (SELECT a.status FROM appointments a
     JOIN consultation_queue cq ON a.id = cq.appointment_id
     WHERE a.payment_id = 'PAY_123456789'
     AND cq.status = 'in_consultation') = 'in_progress',
    'Deve conseguir sincronizar status entre appointment e fila'
);

-- Teste 25: Cenário - Finalizar consulta
UPDATE appointments SET status = 'completed' 
WHERE payment_id = 'PAY_123456789';

UPDATE consultation_queue SET status = 'completed' 
WHERE appointment_id = (SELECT id FROM appointments WHERE payment_id = 'PAY_123456789');

SELECT ok(
    (SELECT COUNT(*) FROM appointments a
     JOIN consultation_queue cq ON a.id = cq.appointment_id
     JOIN medical_records mr ON a.id = mr.appointment_id
     WHERE a.status = 'completed' 
     AND cq.status = 'completed'
     AND mr.is_signed = true) = 1,
    'Deve conseguir finalizar consulta com prontuário assinado'
);

-- =====================================================
-- TESTES DE VALIDAÇÃO DE DADOS
-- =====================================================

-- Teste 26: Validar formato de email em notifications (se aplicável)
INSERT INTO notifications (type, title, message, channels) 
VALUES ('email_test', 'Teste Email', 'Mensagem teste', '["email"]'::jsonb);

SELECT ok(
    (SELECT channels::text FROM notifications WHERE type = 'email_test') = '["email"]',
    'Deve conseguir armazenar canais de notificação em formato JSON'
);

-- Teste 27: Validar campos obrigatórios em appointments
SELECT throws_ok(
    'INSERT INTO appointments (scheduled_date) VALUES (''2024-12-25'')',
    '23502',
    'null value in column "price" of relation "appointments" violates not-null constraint',
    'Deve validar campos obrigatórios em appointments'
);

-- Teste 28: Validar unicidade de CRM em doctors
SELECT throws_ok(
    'INSERT INTO doctors (name, crm) VALUES (''Dr. Duplicado'', ''CRM54321'')',
    '23505',
    'duplicate key value violates unique constraint "doctors_crm_key"',
    'Deve validar unicidade de CRM'
);

-- Teste 29: Validar range de rating em doctors
SELECT throws_ok(
    'UPDATE doctors SET rating = 5.5 WHERE crm = ''CRM54321''',
    '23514',
    'new row for relation "doctors" violates check constraint "doctors_rating_check"',
    'Deve validar range de rating (0-5)'
);

-- Teste 30: Validar campos de data/hora em appointments
INSERT INTO appointments (scheduled_date, scheduled_time, price) 
VALUES ('2024-12-31', '23:59:59', 100.00);

SELECT ok(
    (SELECT scheduled_time FROM appointments 
     WHERE scheduled_date = '2024-12-31') = '23:59:59',
    'Deve conseguir inserir horários válidos'
);

SELECT * FROM finish();
ROLLBACK;