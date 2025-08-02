# 🔧 Guia de Solução de Problemas - Sistema Administrativo de Especialidades

## 🚨 Problemas Identificados e Soluções

### 1. **Erro 400 - Tabela 'specialties' não encontrada**

**Sintomas:**
- Erro: `Failed to load resource: the server responded with a status of 400`
- Mensagem: "Tabela specialties não encontrada"
- Interface mostra instruções de configuração

**Causa:** A tabela `specialties` não foi criada no banco de dados Supabase.

**Solução:**

#### Passo 1: Acesse o Supabase Dashboard
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto TeleMed

#### Passo 2: Execute o SQL de Criação
1. No painel lateral, clique em **"SQL Editor"**
2. Clique em **"New Query"**
3. Cole o SQL abaixo:

```sql
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

-- Habilitar Row Level Security (RLS)
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Allow read access for all users" ON specialties
    FOR SELECT USING (true);

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

-- Trigger para atualizar updated_at
CREATE TRIGGER update_specialties_updated_at 
    BEFORE UPDATE ON specialties 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais
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
```

4. Clique em **"Run"** para executar o SQL
5. Verifique se apareceu "Success. No rows returned" ou similar

#### Passo 3: Verificar a Criação
1. Vá para **"Table Editor"** no painel lateral
2. Você deve ver a tabela **"specialties"** na lista
3. Clique na tabela para ver os dados inseridos

### 2. **Erro de Sintaxe JavaScript**

**Sintomas:**
- `Uncaught SyntaxError: Invalid or unexpected token`
- Página não carrega corretamente

**Solução:**
1. Abra o **Console do Navegador** (F12)
2. Verifique se há erros de sintaxe
3. Se houver, recarregue a página após corrigir a tabela

### 3. **Função de Editar/Salvar não Funciona**

**Sintomas:**
- Modal de edição abre mas não salva
- Erro: "Error saving specialty"

**Causa:** Problemas com a estrutura de dados ou permissões RLS.

**Solução:**

#### Verificar Permissões RLS
Execute este SQL no Supabase para verificar as políticas:

```sql
-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'specialties';

-- Se não houver políticas, criar novamente:
CREATE POLICY "Allow all operations for authenticated users" ON specialties
    FOR ALL USING (auth.role() = 'authenticated');
```

#### Verificar Estrutura da Tabela
```sql
-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'specialties' 
ORDER BY ordinal_position;
```

### 4. **Teste de Conexão**

Para verificar se tudo está funcionando:

1. **Abra:** `test-supabase-connection.html`
2. **Verifique:** Se a conexão está OK
3. **Confirme:** Se a tabela está acessível

## 🔄 Passos de Verificação Completa

### 1. Verificar Supabase
- [ ] Projeto criado e ativo
- [ ] URL e chave anônima corretas em `js/supabase.js`
- [ ] Tabela `specialties` criada
- [ ] Políticas RLS configuradas
- [ ] Dados iniciais inseridos

### 2. Verificar Arquivos
- [ ] `admin-specialties.html` carrega sem erros
- [ ] `js/admin-specialties.js` carrega sem erros
- [ ] `js/supabase.js` tem configurações corretas

### 3. Testar Funcionalidades
- [ ] Página admin carrega
- [ ] Lista de especialidades aparece
- [ ] Botão "Nova Especialidade" funciona
- [ ] Modal de edição abre
- [ ] Salvar funciona
- [ ] Excluir funciona
- [ ] Ativar/Desativar funciona

## 🆘 Se Ainda Houver Problemas

### Console do Navegador
1. Pressione **F12**
2. Vá para a aba **Console**
3. Procure por erros em vermelho
4. Anote a mensagem de erro completa

### Verificar Rede
1. Na aba **Network** do F12
2. Recarregue a página
3. Procure por requisições com status 400, 401, 403, 500
4. Clique na requisição para ver detalhes

### Logs do Supabase
1. No Supabase Dashboard
2. Vá para **Logs**
3. Selecione **API Logs**
4. Procure por erros recentes

## 📞 Informações de Debug

Se precisar de ajuda, forneça estas informações:

1. **Mensagem de erro completa** do console
2. **Status code** da requisição que falhou
3. **Screenshot** da tela de erro
4. **Confirmação** se executou o SQL de criação da tabela

## ✅ Checklist Final

Após seguir todos os passos:

- [ ] Tabela `specialties` existe no Supabase
- [ ] Dados iniciais foram inseridos
- [ ] Políticas RLS estão ativas
- [ ] `admin-specialties.html` carrega sem erros
- [ ] Console do navegador não mostra erros
- [ ] Funcionalidades CRUD funcionam

**Se todos os itens estiverem marcados, o sistema deve funcionar perfeitamente!** ✨

---

**Última atualização:** Dezembro 2024
**Versão:** 1.0