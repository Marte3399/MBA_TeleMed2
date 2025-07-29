-- =====================================================
-- TESTES DE INTEGRAÇÃO - RELACIONAMENTOS E OPERAÇÕES
-- Sistema de Telemedicina - Supabase
-- =====================================================

BEGIN;

SELECT plan(15);

-- =====================================================
-- SETUP: DADOS DE TESTE
-- =====================================================

-- Inserir specialty de teste
INSERT INTO specialties (id, name, description, icon, price, duration) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Cardiologia Teste', 'Especialidade para testes', '❤️', 150.00, 45);

-- Inserir doctor de teste
INSERT INTO doctors (id, name, crm, specialty_id, experience_years, rating, total_consultations) 
VALUES ('550e8400-e29b-41d4-a716-446655440001', 'Dr. Teste Cardio', 'CRM12345TEST', '550e8400-e29b-41d4-a716-446655440000', 10, 4.8, 500);

-- =====================================================
-- TESTES DE RELACIONAMENTOS
-- =====================================================

-- Teste 1: Verificar relacionamento doctor -> specialty
SELECT ok(
    (SELECT s.name FROM doctors d 
     JOIN specialties s ON d.specialty_id = s.id 
     WHERE d.crm = 'CRM12345TEST') = 'Cardiologia Teste',
    'Doctor deve estar relacionado corretamente com specialty'
);

-- Teste 2: Inserir appointment relacionado ao doctor e specialty
INSERT INTO appointments (id, doctor_id, specialty_id, scheduled_date, scheduled_time, price, status) 
VALUES ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '2024-12-15', '14:00:00', 150.00, 'scheduled');

SELECT ok(
    (SELECT COUNT(*) FROM appointments 
     WHERE doctor_id = '550e8400-e29b-41d4-a716-446655440001' 
     AND specialty_id = '550e8400-e29b-41d4-a716-446655440000') = 1,
    'Appointment deve estar relacionado corretamente com doctor e specialty'
);

-- Teste 3: Inserir entrada na fila relacionada ao appointment
INSERT INTO consultation_queue (appointment_id, specialty_id, position, estimated_wait_time, status) 
VALUES ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 1, 30, 'waiting');

SELECT ok(
    (SELECT COUNT(*) FROM consultation_queue cq
     JOIN appointments a ON cq.appointment_id = a.id
     WHERE a.doctor_id = '550e8400-e29b-41d4-a716-446655440001') = 1,
    'Consultation queue deve estar relacionada corretamente com appointment'
);

-- Teste 4: Inserir medical record relacionado ao appointment
INSERT INTO medical_records (appointment_id, doctor_id, diagnosis, prescription, is_signed) 
VALUES ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Hipertensão arterial', 'Losartana 50mg 1x ao dia', true);

SELECT ok(
    (SELECT COUNT(*) FROM medical_records 
     WHERE appointment_id = '550e8400-e29b-41d4-a716-446655440002') = 1,
    'Medical record deve estar relacionado corretamente com appointment'
);

-- =====================================================
-- TESTES DE INTEGRIDADE REFERENCIAL
-- =====================================================

-- Teste 5: Não deve permitir inserir doctor com specialty_id inexistente
SELECT throws_ok(
    'INSERT INTO doctors (name, crm, specialty_id) VALUES (''Dr. Erro'', ''CRM999'', ''00000000-0000-0000-0000-000000000000'')',
    '23503',
    'insert or update on table "doctors" violates foreign key constraint "doctors_specialty_id_fkey"',
    'Não deve permitir doctor com specialty_id inexistente'
);

-- Teste 6: Não deve permitir inserir appointment com doctor_id inexistente
SELECT throws_ok(
    'INSERT INTO appointments (doctor_id, price) VALUES (''00000000-0000-0000-0000-000000000000'', 100.00)',
    '23503',
    'insert or update on table "appointments" violates foreign key constraint "appointments_doctor_id_fkey"',
    'Não deve permitir appointment com doctor_id inexistente'
);

-- Teste 7: Não deve permitir inserir consultation_queue com appointment_id inexistente
SELECT throws_ok(
    'INSERT INTO consultation_queue (appointment_id, position) VALUES (''00000000-0000-0000-0000-000000000000'', 1)',
    '23503',
    'insert or update on table "consultation_queue" violates foreign key constraint "consultation_queue_appointment_id_fkey"',
    'Não deve permitir consultation_queue com appointment_id inexistente'
);

-- =====================================================
-- TESTES DE OPERAÇÕES COMPLEXAS
-- =====================================================

-- Teste 8: Consulta complexa - buscar appointments com dados do doctor e specialty
SELECT ok(
    (SELECT COUNT(*) FROM appointments a
     JOIN doctors d ON a.doctor_id = d.id
     JOIN specialties s ON a.specialty_id = s.id
     WHERE s.name = 'Cardiologia Teste' 
     AND d.crm = 'CRM12345TEST') = 1,
    'Deve conseguir fazer JOIN entre appointments, doctors e specialties'
);

-- Teste 9: Consulta de fila com dados completos
SELECT ok(
    (SELECT COUNT(*) FROM consultation_queue cq
     JOIN appointments a ON cq.appointment_id = a.id
     JOIN doctors d ON a.doctor_id = d.id
     JOIN specialties s ON a.specialty_id = s.id
     WHERE cq.position = 1) = 1,
    'Deve conseguir fazer JOIN completo da fila com todos os dados'
);

-- Teste 10: Verificar trigger de updated_at
UPDATE specialties SET description = 'Descrição atualizada' 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

SELECT ok(
    (SELECT updated_at > created_at FROM specialties 
     WHERE id = '550e8400-e29b-41d4-a716-446655440000'),
    'Trigger de updated_at deve funcionar corretamente'
);

-- =====================================================
-- TESTES DE ÍNDICES E PERFORMANCE
-- =====================================================

-- Teste 11: Verificar existência de índice em doctors.specialty_id
SELECT ok(
    (SELECT COUNT(*) FROM pg_indexes 
     WHERE tablename = 'doctors' 
     AND indexname = 'idx_doctors_specialty_id') = 1,
    'Deve existir índice em doctors.specialty_id'
);

-- Teste 12: Verificar existência de índice em appointments.patient_id
SELECT ok(
    (SELECT COUNT(*) FROM pg_indexes 
     WHERE tablename = 'appointments' 
     AND indexname = 'idx_appointments_patient_id') = 1,
    'Deve existir índice em appointments.patient_id'
);

-- Teste 13: Verificar existência de índice em consultation_queue.position
SELECT ok(
    (SELECT COUNT(*) FROM pg_indexes 
     WHERE tablename = 'consultation_queue' 
     AND indexname = 'idx_consultation_queue_position') = 1,
    'Deve existir índice em consultation_queue.position'
);

-- =====================================================
-- TESTES DE CASCATA E DELEÇÃO
-- =====================================================

-- Teste 14: Verificar comportamento ON DELETE SET NULL
DELETE FROM specialties WHERE id = '550e8400-e29b-41d4-a716-446655440000';

SELECT ok(
    (SELECT specialty_id FROM doctors 
     WHERE id = '550e8400-e29b-41d4-a716-446655440001') IS NULL,
    'DELETE de specialty deve definir specialty_id como NULL no doctor (ON DELETE SET NULL)'
);

-- Teste 15: Verificar se appointment ainda existe após deleção da specialty
SELECT ok(
    (SELECT COUNT(*) FROM appointments 
     WHERE id = '550e8400-e29b-41d4-a716-446655440002') = 1,
    'Appointment deve continuar existindo após deleção da specialty'
);

SELECT * FROM finish();
ROLLBACK;