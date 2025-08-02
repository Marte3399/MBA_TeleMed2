# 🏥 Guia do Sistema Administrativo de Especialidades

## 📋 Visão Geral

O sistema administrativo de especialidades permite gerenciar completamente as especialidades médicas da plataforma TeleMed através de uma interface web intuitiva com integração ao banco de dados Supabase.

## 🚀 Como Configurar

### 1. Configurar o Banco de Dados

**Passo 1:** Acesse o Supabase Dashboard
- Vá para [supabase.com](https://supabase.com)
- Faça login no seu projeto
- Navegue para **SQL Editor**

**Passo 2:** Execute o SQL de Criação
- Copie todo o conteúdo do arquivo `sql/create_specialties_table.sql`
- Cole no SQL Editor do Supabase
- Clique em **Run** para executar

**Passo 3:** Verificar a Criação
- Vá para **Table Editor**
- Confirme que a tabela `specialties` foi criada
- Verifique se os dados iniciais foram inseridos (6 especialidades)

### 2. Acessar o Painel Administrativo

**URL:** `admin-specialties.html`

**Exemplo:** `http://localhost:8000/admin-specialties.html`

## 🎯 Funcionalidades Disponíveis

### 📊 Dashboard Principal
- **Estatísticas em tempo real:**
  - Total de especialidades
  - Especialidades ativas/inativas
  - Preço médio das consultas
- **Busca e filtros avançados**
- **Ordenação por nome, preço ou data**

### ➕ Criar Nova Especialidade
1. Clique em **"➕ Nova Especialidade"**
2. Preencha os campos obrigatórios:
   - **Nome:** Ex: "Neurologia"
   - **Ícone:** Ex: "🧠" (emoji)
   - **Descrição:** Descrição detalhada
   - **Preço:** Valor em reais
   - **Tempo de Espera:** Ex: "~15 min"
3. Adicione recursos/serviços incluídos
4. Marque se a especialidade deve estar ativa
5. Clique em **"Salvar Especialidade"**

### ✏️ Editar Especialidade Existente
1. Encontre a especialidade na lista
2. Clique em **"✏️ Editar"**
3. Modifique os campos desejados
4. Clique em **"Salvar Especialidade"**

### ⏸️ Ativar/Desativar Especialidade
- Clique em **"⏸️ Desativar"** para ocultar dos pacientes
- Clique em **"▶️ Ativar"** para tornar visível novamente

### 🗑️ Excluir Especialidade
1. Clique em **"🗑️ Excluir"**
2. Confirme a exclusão no modal
3. **⚠️ Atenção:** Esta ação não pode ser desfeita

## 🔧 Recursos Avançados

### 🔍 Sistema de Busca
- Digite no campo de busca para filtrar por nome ou descrição
- Busca em tempo real conforme você digita

### 🏷️ Filtros
- **Status:** Mostrar apenas ativas ou inativas
- **Ordenação:** Por nome, preço ou data de criação

### 📱 Interface Responsiva
- Funciona perfeitamente em desktop, tablet e mobile
- Design moderno com Tailwind CSS

## 🔄 Integração com o Sistema Principal

### Carregamento Automático
O sistema principal (`js/specialties.js`) foi atualizado para:
1. **Tentar carregar do banco primeiro**
2. **Fallback para dados estáticos** se o banco não estiver disponível
3. **Conversão automática** do formato do banco para o frontend

### Sincronização em Tempo Real
- Mudanças no painel admin são refletidas imediatamente
- Sistema de cache inteligente
- Atualizações automáticas

## 📁 Estrutura de Arquivos

```
📦 TeleMed Admin Specialties
├── 📄 admin-specialties.html          # Interface administrativa
├── 📄 js/admin-specialties.js         # Lógica do painel admin
├── 📄 sql/create_specialties_table.sql # Script de criação do banco
├── 📄 js/specialties.js               # Sistema principal (atualizado)
└── 📄 ADMIN_SPECIALTIES_GUIDE.md      # Este guia
```

## 🛡️ Segurança

### Row Level Security (RLS)
- **Leitura:** Permitida para todos (especialidades são públicas)
- **Escrita:** Apenas usuários autenticados (administradores)

### Validações
- **Campos obrigatórios:** Nome, descrição, ícone, preço
- **Validação de preço:** Deve ser maior que zero
- **Unicidade:** Nomes de especialidades devem ser únicos

## 🐛 Solução de Problemas

### Erro: "Database not available"
**Causa:** Tabela não foi criada ou RLS mal configurado
**Solução:** 
1. Execute o SQL de criação novamente
2. Verifique as políticas RLS no Supabase

### Erro: "Function not found"
**Causa:** JavaScript não carregou corretamente
**Solução:**
1. Verifique se `js/supabase.js` está carregando
2. Confirme a conexão com o Supabase

### Especialidades não aparecem no sistema principal
**Causa:** Especialidades marcadas como inativas
**Solução:**
1. Acesse o painel admin
2. Ative as especialidades desejadas

## 📈 Próximos Passos

### Melhorias Sugeridas
1. **Upload de imagens** para ícones das especialidades
2. **Histórico de alterações** com auditoria
3. **Importação/exportação** em massa
4. **Relatórios avançados** com gráficos
5. **Integração com sistema de médicos**

### Expansões Futuras
1. **Gestão de médicos por especialidade**
2. **Configuração de horários de atendimento**
3. **Preços dinâmicos por horário**
4. **Sistema de promoções e descontos**

## 🎉 Conclusão

O sistema administrativo de especialidades está completo e pronto para uso! Ele oferece:

✅ **Interface moderna e intuitiva**
✅ **Integração completa com Supabase**
✅ **Sincronização automática com o sistema principal**
✅ **Segurança robusta com RLS**
✅ **Responsividade total**
✅ **Funcionalidades CRUD completas**

**Para começar:** Execute o SQL no Supabase e acesse `admin-specialties.html`

---

**Desenvolvido para TeleMed** 🏥
*Sistema de Telemedicina Completo*