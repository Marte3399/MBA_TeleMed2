-- =====================================================
-- TESTES UNITÁRIOS PARA ESTRUTURA DO BANCO DE DADOS
-- Sistema de Telemedicina - Supabase
-- =====================================================

-- Extensão para testes unitários
CREATE EXTENSION IF NOT EXISTS pgtap;

BEGIN;

-- =====================================================
-- TESTES DE ESTRUTURA DAS TABELAS
-- =====================================================

-- Teste 1: Verificar se todas as tabelas foram criadas
SELECT plan(50); -- Número total de testes

-- Verificar existência das tabelas
SELECT has_table('public', 'specialties', 'Tabela specialties deve existir');
SELECT has_table('public', 'doctors', 'Tabela doctors deve existir');
SELECT has_table('public', 'appointments', 'Tabela appointments deve existir');
SELECT has_table('public', 'consultation_queue', 'Tabela consultation_queue deve existir');
SELECT has_table('public', 'medical_records', 'Tabela medical_records deve existir');
SELECT has_table('public', 'notifications', 'Tabela notifications deve existir');

-- =====================================================
-- TESTES DA TABELA SPECIALTIES
-- =====================================================

-- Verificar colunas da tabela specialties
SELECT has_column('public', 'specialties', 'id', 'Coluna id deve existir em specialties');
SELECT has_column('public', 'specialties', 'name', 'Coluna name deve existir em specialties');
SELECT has_column('public', 'specialties', 'description', 'Coluna description deve existir em specialties');
SELECT has_column('public', 'specialties', 'icon', 'Coluna icon deve existir em specialties');
SELECT has_column('public', 'specialties', 'price', 'Coluna price deve existir em specialties');
SELECT has_column('public', 'specialties', 'duration', 'Coluna duration deve existir em specialties');
SELECT has_column('public', 'specialties', 'is_active', 'Coluna is_active deve existir em specialties');
SELECT has_column('public', 'specialties', 'created_at', 'Coluna created_at deve existir em specialties');
SELECT has_column('public', 'specialties', 'updated_at', 'Coluna updated_at deve existir em specialties');

-- Verificar tipos de dados
SELECT col_type_is('public', 'specialties', 'id', 'uuid', 'Coluna id deve ser UUID');
SELECT col_type_is('public', 'specialties', 'name', 'character varying', 'Coluna name deve ser VARCHAR');
SELECT col_type_is('public', 'specialties', 'price', 'numeric', 'Coluna price deve ser NUMERIC');
SELECT col_type_is('public', 'specialties', 'duration', 'integer', 'Coluna duration deve ser INTEGER');
SELECT col_type_is('public', 'specialties', 'is_active', 'boolean', 'Coluna is_active deve ser BOOLEAN');

-- Verificar chave primária
SELECT has_pk('public', 'specialties', 'Tabela specialties deve ter chave primária');

-- =====================================================
-- TESTES DA TABELA DOCTORS
-- =====================================================

-- Verificar colunas da tabela doctors
SELECT has_column('public', 'doctors', 'id', 'Coluna id deve existir em doctors');
SELECT has_column('public', 'doctors', 'user_id', 'Coluna user_id deve existir em doctors');
SELECT has_column('public', 'doctors', 'name', 'Coluna name deve existir em doctors');
SELECT has_column('public', 'doctors', 'crm', 'Coluna crm deve existir em doctors');
SELECT has_column('public', 'doctors', 'specialty_id', 'Coluna specialty_id deve existir em doctors');
SELECT has_column('public', 'doctors', 'experience_years', 'Coluna experience_years deve existir em doctors');
SELECT has_column('public', 'doctors', 'rating', 'Coluna rating deve existir em doctors');
SELECT has_column('public', 'doctors', 'total_consultations', 'Coluna total_consultations deve existir em doctors');
SELECT has_column('public', 'doctors', 'is_online', 'Coluna is_online deve existir em doctors');
SELECT has_column('public', 'doctors', 'availability_status', 'Coluna availability_status deve existir em doctors');

-- Verificar tipos de dados
SELECT col_type_is('public', 'doctors', 'id', 'uuid', 'Coluna id deve ser UUID');
SELECT col_type_is('public', 'doctors', 'user_id', 'uuid', 'Coluna user_id deve ser UUID');
SELECT col_type_is('public', 'doctors', 'crm', 'character varying', 'Coluna crm deve ser VARCHAR');
SELECT col_type_is('public', 'doctors', 'rating', 'numeric', 'Coluna rating deve ser NUMERIC');
SELECT col_type_is('public', 'doctors', 'is_online', 'boolean', 'Coluna is_online deve ser BOOLEAN');

-- =====================================================
-- TESTES DA TABELA APPOINTMENTS
-- =====================================================

-- Verificar colunas da tabela appointments
SELECT has_column('public', 'appointments', 'id', 'Coluna id deve existir em appointments');
SELECT has_column('public', 'appointments', 'patient_id', 'Coluna patient_id deve existir em appointments');
SELECT has_column('public', 'appointments', 'doctor_id', 'Coluna doctor_id deve existir em appointments');
SELECT has_column('public', 'appointments', 'specialty_id', 'Coluna specialty_id deve existir em appointments');
SELECT has_column('public', 'appointments', 'scheduled_date', 'Coluna scheduled_date deve existir em appointments');
SELECT has_column('public', 'appointments', 'scheduled_time', 'Coluna scheduled_time deve existir em appointments');
SELECT has_column('public', 'appointments', 'status', 'Coluna status deve existir em appointments');
SELECT has_column('public', 'appointments', 'type', 'Coluna type deve existir em appointments');
SELECT has_column('public', 'appointments', 'price', 'Coluna price deve existir em appointments');

-- Verificar tipos de dados
SELECT col_type_is('public', 'appointments', 'scheduled_date', 'date', 'Coluna scheduled_date deve ser DATE');
SELECT col_type_is('public', 'appointments', 'scheduled_time', 'time without time zone', 'Coluna scheduled_time deve ser TIME');
SELECT col_type_is('public', 'appointments', 'price', 'numeric', 'Coluna price deve ser NUMERIC');

-- =====================================================
-- TESTES DA TABELA CONSULTATION_QUEUE
-- =====================================================

-- Verificar colunas da tabela consultation_queue
SELECT has_column('public', 'consultation_queue', 'id', 'Coluna id deve existir em consultation_queue');
SELECT has_column('public', 'consultation_queue', 'appointment_id', 'Coluna appointment_id deve existir em consultation_queue');
SELECT has_column('public', 'consultation_queue', 'specialty_id', 'Coluna specialty_id deve existir em consultation_queue');
SELECT has_column('public', 'consultation_queue', 'patient_id', 'Coluna patient_id deve existir em consultation_queue');
SELECT has_column('public', 'consultation_queue', 'position', 'Coluna position deve existir em consultation_queue');
SELECT has_column('public', 'consultation_queue', 'estimated_wait_time', 'Coluna estimated_wait_time deve existir em consultation_queue');
SELECT has_column('public', 'consultation_queue', 'status', 'Coluna status deve existir em consultation_queue');

-- =====================================================
-- TESTES DA TABELA MEDICAL_RECORDS
-- =====================================================

-- Verificar colunas da tabela medical_records
SELECT has_column('public', 'medical_records', 'id', 'Coluna id deve existir em medical_records');
SELECT has_column('public', 'medical_records', 'appointment_id', 'Coluna appointment_id deve existir em medical_records');
SELECT has_column('public', 'medical_records', 'patient_id', 'Coluna patient_id deve existir em medical_records');
SELECT has_column('public', 'medical_records', 'doctor_id', 'Coluna doctor_id deve existir em medical_records');
SELECT has_column('public', 'medical_records', 'diagnosis', 'Coluna diagnosis deve existir em medical_records');
SELECT has_column('public', 'medical_records', 'prescription', 'Coluna prescription deve existir em medical_records');
SELECT has_column('public', 'medical_records', 'is_signed', 'Coluna is_signed deve existir em medical_records');

-- =====================================================
-- TESTES DA TABELA NOTIFICATIONS
-- =====================================================

-- Verificar colunas da tabela notifications
SELECT has_column('public', 'notifications', 'id', 'Coluna id deve existir em notifications');
SELECT has_column('public', 'notifications', 'user_id', 'Coluna user_id deve existir em notifications');
SELECT has_column('public', 'notifications', 'type', 'Coluna type deve existir em notifications');
SELECT has_column('public', 'notifications', 'title', 'Coluna title deve existir em notifications');
SELECT has_column('public', 'notifications', 'message', 'Coluna message deve existir em notifications');
SELECT has_column('public', 'notifications', 'channels', 'Coluna channels deve existir em notifications');
SELECT has_column('public', 'notifications', 'is_read', 'Coluna is_read deve existir em notifications');

-- Verificar tipo JSONB
SELECT col_type_is('public', 'notifications', 'channels', 'jsonb', 'Coluna channels deve ser JSONB');

SELECT * FROM finish();
ROLLBACK;