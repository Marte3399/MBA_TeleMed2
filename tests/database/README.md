# Testes Unitários do Banco de Dados - Sistema de Telemedicina

Este diretório contém uma suíte completa de testes unitários para validar a estrutura e funcionalidade do banco de dados do sistema de telemedicina implementado no Supabase.

## 📋 Visão Geral

Os testes foram desenvolvidos usando **pgTAP**, uma extensão do PostgreSQL para testes unitários, e cobrem todos os aspectos críticos do banco de dados:

- ✅ Estrutura das tabelas e colunas
- ✅ Constraints e regras de negócio
- ✅ Row Level Security (RLS) e políticas de acesso
- ✅ Relacionamentos e integridade referencial
- ✅ Operações CRUD completas
- ✅ Cenários de uso real

## 🗂️ Estrutura dos Arquivos

### 1. `database-tests.sql`
**Testes de Estrutura das Tabelas**
- Verifica existência de todas as tabelas
- Valida colunas e tipos de dados
- Confirma chaves primárias e índices

**Cobertura:** 50 testes
- Tabelas: `specialties`, `doctors`, `appointments`, `consultation_queue`, `medical_records`, `notifications`

### 2. `constraints-tests.sql`
**Testes de Constraints e Regras de Negócio**
- Valida check constraints (preços positivos, ratings válidos, etc.)
- Testa unique constraints (CRM, nomes de especialidades)
- Verifica foreign keys e relacionamentos

**Cobertura:** 25 testes
- Constraints de validação de dados
- Regras de integridade referencial
- Validações de domínio

### 3. `rls-tests.sql`
**Testes de Row Level Security**
- Confirma que RLS está habilitado em todas as tabelas
- Valida existência de políticas de segurança
- Testa permissões por tipo de operação (SELECT, INSERT, UPDATE, DELETE)

**Cobertura:** 20 testes
- Políticas de acesso por tabela
- Segurança de dados médicos
- Controle de acesso baseado em usuário

### 4. `integration-tests.sql`
**Testes de Integração e Relacionamentos**
- Testa JOINs complexos entre tabelas
- Valida comportamento de cascata (ON DELETE)
- Verifica triggers e funções automáticas

**Cobertura:** 15 testes
- Relacionamentos entre entidades
- Operações complexas
- Integridade de dados

### 5. `crud-operations-tests.sql`
**Testes de Operações CRUD**
- Simula cenários reais de uso
- Testa fluxo completo de consulta médica
- Valida operações de criação, leitura, atualização e exclusão

**Cobertura:** 30 testes
- Fluxo completo de agendamento
- Gerenciamento de fila
- Criação de prontuários
- Sistema de notificações

### 6. `run-all-tests.sql`
**Script Principal de Execução**
- Executa todos os testes em sequência
- Fornece relatório consolidado
- Facilita execução em ambiente de CI/CD

## 🚀 Como Executar os Testes

### Opção 1: Executar Todos os Testes
```sql
-- No Supabase SQL Editor ou psql
\i tests/database/run-all-tests.sql
```

### Opção 2: Executar Testes Individuais
```sql
-- Testes de estrutura
\i tests/database/database-tests.sql

-- Testes de constraints
\i tests/database/constraints-tests.sql

-- Testes de RLS
\i tests/database/rls-tests.sql

-- Testes de integração
\i tests/database/integration-tests.sql

-- Testes de CRUD
\i tests/database/crud-operations-tests.sql
```

### Opção 3: Via Supabase MCP (Recomendado)
```javascript
// Execute cada arquivo através do MCP Supabase
await supabase.executeSQL(testFileContent);
```

## 📊 Cobertura de Testes

| Categoria | Testes | Descrição |
|-----------|--------|-----------|
| **Estrutura** | 50 | Tabelas, colunas, tipos, índices |
| **Constraints** | 25 | Validações, regras de negócio |
| **Segurança (RLS)** | 20 | Políticas de acesso, permissões |
| **Integração** | 15 | Relacionamentos, JOINs, triggers |
| **CRUD** | 30 | Operações completas, cenários reais |
| **TOTAL** | **140** | **Cobertura completa do sistema** |

## 🎯 Cenários Testados

### Fluxo Completo de Consulta
1. ✅ Criação de especialidade médica
2. ✅ Cadastro de médico especialista
3. ✅ Agendamento de consulta
4. ✅ Entrada na fila de atendimento
5. ✅ Progressão do status da consulta
6. ✅ Criação de prontuário médico
7. ✅ Sistema de notificações
8. ✅ Finalização e histórico

### Validações de Segurança
- ✅ Acesso restrito a dados próprios
- ✅ Médicos só veem seus pacientes
- ✅ Pacientes só veem suas consultas
- ✅ Prontuários protegidos contra exclusão
- ✅ Notificações privadas por usuário

### Integridade de Dados
- ✅ Relacionamentos consistentes
- ✅ Cascata de exclusões controlada
- ✅ Validação de campos obrigatórios
- ✅ Constraints de domínio
- ✅ Unicidade de identificadores

## 🔧 Pré-requisitos

1. **PostgreSQL** com extensão **pgTAP** instalada
2. **Supabase** com as tabelas já criadas
3. **Permissões** para executar testes no banco

### Instalação do pgTAP (se necessário)
```sql
CREATE EXTENSION IF NOT EXISTS pgtap;
```

## 📈 Interpretando os Resultados

### Resultado de Sucesso
```
ok 1 - Tabela specialties deve existir
ok 2 - Coluna id deve existir em specialties
...
1..140
```

### Resultado de Falha
```
not ok 15 - Deve permitir inserir specialty válida
# Failed test 15: "Deve permitir inserir specialty válida"
```

## 🛠️ Manutenção dos Testes

### Adicionando Novos Testes
1. Identifique a categoria apropriada
2. Adicione o teste no arquivo correspondente
3. Atualize o contador `SELECT plan(N)`
4. Documente o novo teste

### Atualizando Testes Existentes
1. Modifique o teste conforme necessário
2. Verifique se não quebra outros testes
3. Execute a suíte completa para validar

## 🚨 Troubleshooting

### Erro: "extension pgtap does not exist"
```sql
CREATE EXTENSION IF NOT EXISTS pgtap;
```

### Erro: "relation does not exist"
Certifique-se de que todas as tabelas foram criadas antes de executar os testes.

### Erro: "permission denied"
Verifique se o usuário tem permissões adequadas para executar os testes.

## 📝 Contribuindo

Para adicionar novos testes:

1. Siga o padrão de nomenclatura existente
2. Adicione comentários explicativos
3. Mantenha os testes isolados (use transações)
4. Atualize esta documentação

## 🎉 Conclusão

Esta suíte de testes garante que o banco de dados do sistema de telemedicina está funcionando corretamente e atende a todos os requisitos de:

- **Funcionalidade** - Todas as operações funcionam como esperado
- **Segurança** - Dados protegidos e acesso controlado
- **Integridade** - Relacionamentos e constraints válidos
- **Performance** - Índices e otimizações em vigor
- **Conformidade** - Atende aos requisitos médicos e de auditoria

Execute os testes regularmente para manter a qualidade e confiabilidade do sistema!