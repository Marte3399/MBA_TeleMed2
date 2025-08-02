-- TeleMed - Criação da Tabela de Especialidades
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Criar tabela de especialidades
CREATE TABLE IF NOT EXISTS specialties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon VARCHAR(10) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    wait_time VARCHAR(20) NOT NULL DEFAULT '~10 min',
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_specialties_name ON specialties(name);
CREATE INDEX IF NOT EXISTS idx_specialties_active ON specialties(is_active);
CREATE INDEX IF NOT EXISTS idx_specialties_price ON specialties(price);
CREATE INDEX IF NOT EXISTS idx_specialties_created_at ON specialties(created_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Allow read access for all users" ON specialties;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON specialties;

-- Criar políticas de segurança
-- Permitir leitura para todos (especialidades são públicas)
CREATE POLICY "Allow read access for all users" ON specialties
    FOR SELECT USING (true);

-- Permitir todas as operações para usuários autenticados (administradores)
CREATE POLICY "Allow all operations for authenticated users" ON specialties
    FOR ALL USING (auth.role() = 'authenticated');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover trigger se existir
DROP TRIGGER IF EXISTS update_specialties_updated_at ON specialties;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_specialties_updated_at 
    BEFORE UPDATE ON specialties 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais (especialidades padrão)
INSERT INTO specialties (name, description, icon, price, wait_time, features, is_active) VALUES
(
    'Cardiologia',
    'Cuidados com o coração e sistema cardiovascular',
    '❤️',
    89.90,
    '~8 min',
    '["Consulta por videochamada HD", "Eletrocardiograma remoto", "Monitoramento cardíaco", "Prescrição digital", "Acompanhamento contínuo"]',
    true
),
(
    'Pediatria',
    'Cuidados médicos para crianças e adolescentes',
    '👶',
    79.90,
    '~5 min',
    '["Consulta especializada infantil", "Acompanhamento do crescimento", "Orientação para pais", "Vacinação e prevenção", "Emergências pediátricas"]',
    true
),
(
    'Dermatologia',
    'Cuidados com a pele, cabelos e unhas',
    '🧴',
    99.90,
    '~15 min',
    '["Análise dermatológica", "Diagnóstico por imagem", "Tratamento de acne", "Prevenção de câncer de pele", "Cuidados estéticos"]',
    true
),
(
    'Psiquiatria',
    'Saúde mental e transtornos psiquiátricos',
    '🧠',
    129.90,
    '~20 min',
    '["Consulta psiquiátrica", "Avaliação de ansiedade", "Tratamento de depressão", "Terapia medicamentosa", "Acompanhamento psicológico"]',
    true
),
(
    'Clínica Geral',
    'Atendimento médico geral e preventivo',
    '🩺',
    69.90,
    '~12 min',
    '["Consulta médica geral", "Avaliação de sintomas", "Orientações preventivas", "Prescrição de medicamentos", "Encaminhamentos especializados"]',
    true
),
(
    'Ginecologia',
    'Saúde da mulher e sistema reprodutivo feminino',
    '🌸',
    95.90,
    '~18 min',
    '["Consulta ginecológica", "Orientação contraceptiva", "Saúde reprodutiva", "Prevenção de doenças", "Acompanhamento pré-natal"]',
    true
)
ON CONFLICT (name) DO NOTHING;

-- Verificar se a tabela foi criada corretamente
SELECT 
    'Tabela criada com sucesso!' as status,
    COUNT(*) as total_especialidades
FROM specialties;

-- Mostrar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'specialties' 
ORDER BY ordinal_position;

-- Mostrar dados inseridos
SELECT id, name, price, is_active FROM specialties ORDER BY name;