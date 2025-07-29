-- =====================================================
-- TESTES DE ROW LEVEL SECURITY (RLS)
-- Sistema de Telemedicina - Supabase
-- =====================================================

BEGIN;

SELECT plan(20);

-- =====================================================
-- TESTES DE RLS - VERIFICAR SE ESTÁ HABILITADO
-- =====================================================

-- Teste 1: Verificar se RLS está habilitado na tabela specialties
SELECT ok(
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'specialties' AND schemaname = 'public') = true,
    'RLS deve estar habilitado na tabela specialties'
);

-- Teste 2: Verificar se RLS está habilitado na tabela doctors
SELECT ok(
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'doctors' AND schemaname = 'public') = true,
    'RLS deve estar habilitado na tabela doctors'
);

-- Teste 3: Verificar se RLS está habilitado na tabela appointments
SELECT ok(
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'appointments' AND schemaname = 'public') = true,
    'RLS deve estar habilitado na tabela appointments'
);

-- Teste 4: Verificar se RLS está habilitado na tabela consultation_queue
SELECT ok(
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'consultation_queue' AND schemaname = 'public') = true,
    'RLS deve estar habilitado na tabela consultation_queue'
);

-- Teste 5: Verificar se RLS está habilitado na tabela medical_records
SELECT ok(
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'medical_records' AND schemaname = 'public') = true,
    'RLS deve estar habilitado na tabela medical_records'
);

-- Teste 6: Verificar se RLS está habilitado na tabela notifications
SELECT ok(
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'notifications' AND schemaname = 'public') = true,
    'RLS deve estar habilitado na tabela notifications'
);

-- =====================================================
-- TESTES DE POLÍTICAS RLS - SPECIALTIES
-- =====================================================

-- Teste 7: Verificar política de SELECT para specialties
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = 'specialties' 
     AND policyname = 'Specialties are viewable by everyone' 
     AND cmd = 'r') = 1,
    'Deve existir política de SELECT para specialties'
);

-- Teste 8: Verificar política de INSERT para specialties
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = 'specialties' 
     AND policyname = 'Only authenticated users can insert specialties' 
     AND cmd = 'a') = 1,
    'Deve existir política de INSERT para specialties'
);

-- Teste 9: Verificar política de UPDATE para specialties
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = 'specialties' 
     AND policyname = 'Only authenticated users can update specialties' 
     AND cmd = 'w') = 1,
    'Deve existir política de UPDATE para specialties'
);

-- =====================================================
-- TESTES DE POLÍTICAS RLS - DOCTORS
-- =====================================================

-- Teste 10: Verificar política de SELECT para doctors
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = 'doctors' 
     AND policyname = 'Doctors are viewable by everyone' 
     AND cmd = 'r') = 1,
    'Deve existir política de SELECT para doctors'
);

-- Teste 11: Verificar política de INSERT para doctors
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = 'doctors' 
     AND policyname = 'Doctors can insert their own profile' 
     AND cmd = 'a') = 1,
    'Deve existir política de INSERT para doctors'
);

-- Teste 12: Verificar política de UPDATE para doctors
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = 'doctors' 
     AND policyname = 'Doctors can update their own profile' 
     AND cmd = 'w') = 1,
    'Deve existir política de UPDATE para doctors'
);

-- Teste 13: Verificar política de DELETE para doctors
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = 'doctors' 
     AND policyname = 'Doctors can delete their own profile' 
     AND cmd = 'd') = 1,
    'Deve existir política de DELETE para doctors'
);

-- =====================================================
-- TESTES DE POLÍTICAS RLS - APPOINTMENTS
-- =====================================================

-- Teste 14: Verificar política de SELECT para appointments
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = 'appointments' 
     AND policyname = 'Users can view their own appointments' 
     AND cmd = 'r') = 1,
    'Deve existir política de SELECT para appointments'
);

-- Teste 15: Verificar política de INSERT para appointments
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = 'appointments' 
     AND policyname = 'Patients can insert their own appointments' 
     AND cmd = 'a') = 1,
    'Deve existir política de INSERT para appointments'
);

-- =====================================================
-- TESTES DE POLÍTICAS RLS - MEDICAL_RECORDS
-- =====================================================

-- Teste 16: Verificar política de SELECT para medical_records
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = 'medical_records' 
     AND policyname = 'Users can view their own medical records' 
     AND cmd = 'r') = 1,
    'Deve existir política de SELECT para medical_records'
);

-- Teste 17: Verificar política de INSERT para medical_records
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = 'medical_records' 
     AND policyname = 'Doctors can insert medical records for their patients' 
     AND cmd = 'a') = 1,
    'Deve existir política de INSERT para medical_records'
);

-- Teste 18: Verificar política restritiva de DELETE para medical_records
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = 'medical_records' 
     AND policyname = 'Medical records cannot be deleted' 
     AND cmd = 'd') = 1,
    'Deve existir política restritiva de DELETE para medical_records'
);

-- =====================================================
-- TESTES DE POLÍTICAS RLS - NOTIFICATIONS
-- =====================================================

-- Teste 19: Verificar política de SELECT para notifications
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = 'notifications' 
     AND policyname = 'Users can view their own notifications' 
     AND cmd = 'r') = 1,
    'Deve existir política de SELECT para notifications'
);

-- Teste 20: Verificar política de INSERT para notifications
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = 'notifications' 
     AND policyname = 'System can insert notifications' 
     AND cmd = 'a') = 1,
    'Deve existir política de INSERT para notifications'
);

SELECT * FROM finish();
ROLLBACK;