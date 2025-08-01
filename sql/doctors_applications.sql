-- Tabela para armazenar candidaturas de médicos
-- Conforme requisitos legais do CFM para telemedicina

CREATE TABLE doctors_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Dados Pessoais Obrigatórios
  full_name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  rg VARCHAR(20) NOT NULL,
  birth_date DATE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  gender VARCHAR(20) NOT NULL,
  
  -- Registro Profissional
  crm VARCHAR(10) NOT NULL,
  crm_state VARCHAR(2) NOT NULL,
  crm_status VARCHAR(20) NOT NULL DEFAULT 'ativo',
  
  -- Formação Acadêmica
  medical_school VARCHAR(255) NOT NULL,
  graduation_year INTEGER NOT NULL,
  diploma_recognized VARCHAR(20) NOT NULL,
  completion_certificate VARCHAR(20),
  
  -- Especialização
  rqe VARCHAR(50),
  residency_certificate VARCHAR(255),
  specialist_title VARCHAR(255),
  specialization_certificates TEXT,
  
  -- Especialidades (JSON array)
  specialties JSONB NOT NULL DEFAULT '[]',
  
  -- Experiência
  experience_years VARCHAR(10) NOT NULL,
  telemedicine_experience VARCHAR(20),
  publications TEXT,
  positive_evaluations TEXT,
  
  -- Dados Financeiros
  bank VARCHAR(10) NOT NULL,
  agency VARCHAR(10) NOT NULL,
  account VARCHAR(20) NOT NULL,
  pix_key VARCHAR(255) NOT NULL,
  tax_status VARCHAR(20) NOT NULL,
  cnpj VARCHAR(18),
  
  -- Precificação
  normal_consultation_price DECIMAL(10,2) NOT NULL,
  urgent_consultation_price DECIMAL(10,2),
  return_consultation_price DECIMAL(10,2),
  
  -- Disponibilidade (JSON arrays)
  weekly_schedule JSONB DEFAULT '[]',
  available_shifts JSONB DEFAULT '[]',
  service_modalities JSONB DEFAULT '[]',
  
  -- Requisitos Técnicos (JSON arrays)
  equipment JSONB DEFAULT '[]',
  software JSONB DEFAULT '[]',
  
  -- Certificações e Seguros (JSON arrays)
  certifications JSONB DEFAULT '[]',
  insurance JSONB DEFAULT '[]',
  
  -- Aspectos Legais
  cfm_resolution_accepted BOOLEAN NOT NULL DEFAULT false,
  medical_ethics_accepted BOOLEAN NOT NULL DEFAULT false,
  civil_responsibility_accepted BOOLEAN NOT NULL DEFAULT false,
  service_contract_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_policy_accepted BOOLEAN NOT NULL DEFAULT false,
  platform_terms_accepted BOOLEAN NOT NULL DEFAULT false,
  data_processing_authorized BOOLEAN NOT NULL DEFAULT false,
  marketing_emails_accepted BOOLEAN DEFAULT false,
  
  -- Status da Candidatura
  application_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- pending, under_review, approved, rejected, documents_required
  
  -- Dados de Auditoria
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Documentos (URLs dos arquivos enviados)
  documents JSONB DEFAULT '{}',
  -- Estrutura: {"cpf": "url", "rg": "url", "crm": "url", "diploma": "url", ...}
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_doctors_applications_cpf ON doctors_applications(cpf);
CREATE INDEX idx_doctors_applications_crm ON doctors_applications(crm, crm_state);
CREATE INDEX idx_doctors_applications_email ON doctors_applications(email);
CREATE INDEX idx_doctors_applications_status ON doctors_applications(application_status);
CREATE INDEX idx_doctors_applications_submitted ON doctors_applications(submitted_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_doctors_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_doctors_applications_updated_at
  BEFORE UPDATE ON doctors_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_doctors_applications_updated_at();

-- RLS (Row Level Security)
ALTER TABLE doctors_applications ENABLE ROW LEVEL SECURITY;

-- Política: Médicos podem ver apenas suas próprias candidaturas
CREATE POLICY "Doctors can view own applications" ON doctors_applications
  FOR SELECT USING (auth.email() = email);

-- Política: Médicos podem inserir suas próprias candidaturas
CREATE POLICY "Doctors can insert own applications" ON doctors_applications
  FOR INSERT WITH CHECK (auth.email() = email);

-- Política: Médicos podem atualizar suas próprias candidaturas (apenas se pending)
CREATE POLICY "Doctors can update own pending applications" ON doctors_applications
  FOR UPDATE USING (
    auth.email() = email AND 
    application_status = 'pending'
  );

-- Política: Admins podem ver todas as candidaturas
CREATE POLICY "Admins can view all applications" ON doctors_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Comentários para documentação
COMMENT ON TABLE doctors_applications IS 'Candidaturas de médicos para aprovação na plataforma de telemedicina';
COMMENT ON COLUMN doctors_applications.application_status IS 'Status: pending, under_review, approved, rejected, documents_required';
COMMENT ON COLUMN doctors_applications.specialties IS 'Array JSON com especialidades médicas selecionadas';
COMMENT ON COLUMN doctors_applications.documents IS 'JSON com URLs dos documentos enviados pelo médico';