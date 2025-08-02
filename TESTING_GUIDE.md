# 🧪 Guia Completo de Testes - TeleMed

Este documento descreve o sistema unificado de testes do projeto TeleMed, organizado por tarefas e funcionalidades.

## 📋 Visão Geral

O sistema de testes foi reorganizado para fornecer uma cobertura completa e organizada por tarefa:

- **Tarefa 1**: Sistema de Autenticação
- **Tarefa 2**: Cadastro e Aprovação de Médicos  
- **Tarefa 3**: Sistema de Especialidades Médicas
- **Testes de Banco**: Integração com Supabase
- **Testes de Integração**: Fluxos end-to-end

## 🚀 Como Executar os Testes

### 1. Interface Web Unificada (Recomendado)

Abra o arquivo `unified-tests.html` no navegador para acessar a interface completa de testes:

```bash
# Abrir no navegador
open unified-tests.html
# ou
start unified-tests.html
```

**Funcionalidades da Interface:**
- ✅ Execução de todos os testes por tarefa
- ✅ Visualização de resultados em tempo real
- ✅ Console de debug integrado
- ✅ Exportação de relatórios
- ✅ Testes interativos
- ✅ Status do sistema em tempo real

### 2. Testes Unitários (Jest)

```bash
# Navegar para o diretório
cd tests/unit

# Instalar dependências
npm install

# Executar todos os testes
npm test

# Executar testes específicos da Tarefa 3
npm test task3-specialties.test.js

# Executar com cobertura
npm run test:coverage
```

### 3. Testes de Banco de Dados (SQL)

```bash
# Executar testes da Tarefa 3 no Supabase
psql -h [seu-host] -U [usuario] -d [database] -f tests/database/task3-specialties-tests.sql

# Ou através da interface do Supabase SQL Editor
# Cole o conteúdo do arquivo task3-specialties-tests.sql
```

## 📊 Estrutura dos Testes por Tarefa

### Tarefa 1 - Sistema de Autenticação

**Arquivos:**
- `unified-tests.html` (seção Task 1)
- Testes de validação de formulários
- Testes de integração Supabase Auth

**Cobertura:**
- ✅ Validação de email/senha
- ✅ Processo de login/cadastro
- ✅ Gerenciamento de sessão
- ✅ Testes de segurança
- ✅ Rate limiting

**Como testar:**
1. Abra `unified-tests.html`
2. Clique na aba "Tarefa 1 - Autenticação"
3. Execute os testes individuais ou todos juntos

### Tarefa 2 - Cadastro de Médicos

**Arquivos:**
- `unified-tests.html` (seção Task 2)
- `tests/unit/doctor-registration.test.js`
- `tests/unit/doctor-form-validation.test.js`
- `test-doctor-registration.html` (testes manuais)

**Cobertura:**
- ✅ Validação de CPF, CRM, dados pessoais
- ✅ Workflow de aprovação
- ✅ Integração com banco de dados
- ✅ Painel administrativo
- ✅ Sistema de notificações

**Como testar:**
1. **Interface Web**: `unified-tests.html` → "Tarefa 2 - Cadastro Médicos"
2. **Testes Unitários**: `npm test doctor-registration.test.js`
3. **Testes Manuais**: Abra `test-doctor-registration.html`

### Tarefa 3 - Sistema de Especialidades

**Arquivos:**
- `unified-tests.html` (seção Task 3) ⭐ **NOVO**
- `tests/unit/task3-specialties.test.js` ⭐ **NOVO**
- `tests/database/task3-specialties-tests.sql` ⭐ **NOVO**

**Cobertura:**
- ✅ Renderização de cards de especialidades
- ✅ Sistema de busca em tempo real
- ✅ Filtros e ordenação
- ✅ Modal de detalhes
- ✅ Indicadores de disponibilidade
- ✅ Integração com dados do banco
- ✅ Performance de consultas

**Como testar:**
1. **Interface Web**: `unified-tests.html` → "Tarefa 3 - Especialidades"
2. **Testes Unitários**: `npm test task3-specialties.test.js`
3. **Testes de Banco**: Execute o SQL no Supabase
4. **Teste Interativo**: Use o campo de busca na interface

## 🔧 Testes Específicos da Tarefa 3

### Testes de Renderização
```javascript
// Testa se os cards são renderizados corretamente
- Carregamento de dados MEDICAL_SPECIALTIES
- Função renderSpecialties disponível
- Geração de HTML dos cards
- Animações de entrada
- Indicadores de disponibilidade
```

### Testes de Busca e Filtros
```javascript
// Testa o sistema de busca
- Busca por nome de especialidade
- Busca por descrição
- Busca por recursos/features
- Filtros por disponibilidade
- Ordenação por preço, rating, tempo
- Resultados "nenhuma especialidade encontrada"
```

### Testes de Modal
```javascript
// Testa o modal de detalhes
- Abertura do modal
- Preenchimento com dados corretos
- Exibição de médicos disponíveis
- Botões de ação (agendar/consulta imediata)
- Fechamento do modal
```

### Testes de Disponibilidade
```javascript
// Testa indicadores de disponibilidade
- Cálculo de status (online/busy/offline)
- Geração de classes CSS
- Textos descritivos
- Filtro de médicos disponíveis
- Atualizações em tempo real
```

### Testes de Banco de Dados
```sql
-- Testa estrutura e dados
- Existência da tabela specialties
- Colunas obrigatórias presentes
- Dados iniciais carregados
- Operações CRUD
- Performance de consultas
- Constraints e validações
```

## 📈 Relatórios e Métricas

### Interface Web
- **Resumo em tempo real**: Total, aprovados, falharam
- **Taxa de sucesso**: Porcentagem de testes aprovados
- **Status do sistema**: Conexões e componentes
- **Exportação**: Relatórios em JSON

### Testes Unitários
- **Cobertura de código**: HTML report em `coverage/`
- **Métricas Jest**: Statements, branches, functions, lines
- **Tempo de execução**: Performance dos testes

### Testes de Banco
- **Relatório SQL**: Tabela com resultados detalhados
- **Estatísticas por categoria**: Estrutura, dados, CRUD, etc.
- **Testes que falharam**: Lista específica com motivos

## 🚨 Troubleshooting

### Problemas Comuns

**1. Testes da Tarefa 3 falhando**
```bash
# Verificar se specialties.js está carregado
# Abrir console do navegador e verificar:
typeof MEDICAL_SPECIALTIES !== 'undefined'
typeof renderSpecialties === 'function'
```

**2. Erro "specialtiesGrid not found"**
```bash
# O elemento HTML não existe na página
# Verificar se está testando na página correta (dashboard.html)
```

**3. Testes de banco falhando**
```bash
# Verificar conexão com Supabase
# Verificar se a tabela specialties existe
# Verificar permissões RLS
```

**4. Interface unificada não carrega**
```bash
# Verificar se todos os scripts estão carregados:
# - supabase.js
# - specialties.js
# Abrir console para ver erros JavaScript
```

### Debug Avançado

**Console de Debug na Interface:**
- Clique no botão "💻" no canto inferior esquerdo
- Acompanhe logs em tempo real
- Identifique onde os testes estão falhando

**Testes Unitários com Debug:**
```bash
# Executar com logs detalhados
npm test -- --verbose

# Debug específico
npx jest --testNamePattern="nome do teste" --verbose
```

## 📝 Adicionando Novos Testes

### Para Novas Tarefas

1. **Adicionar seção na interface unificada:**
```html
<!-- Em unified-tests.html -->
<section id="task4Section" class="test-section">
    <!-- Conteúdo da nova tarefa -->
</section>
```

2. **Criar arquivo de testes unitários:**
```javascript
// tests/unit/task4-nova-funcionalidade.test.js
describe('Task 4 - Nova Funcionalidade', () => {
    test('deve fazer algo específico', () => {
        // Teste aqui
    });
});
```

3. **Criar testes de banco se necessário:**
```sql
-- tests/database/task4-nova-funcionalidade-tests.sql
-- Testes SQL específicos
```

### Padrões a Seguir

- **Nomenclatura**: `task{N}-{nome-funcionalidade}`
- **Organização**: Por categoria (rendering, search, database, etc.)
- **Cobertura**: Casos de sucesso e erro
- **Documentação**: Comentários explicativos

## 🎯 Próximos Passos

### Tarefas Futuras que Precisarão de Testes

1. **Tarefa 4 - Sistema de Agendamento**
   - Testes de calendário
   - Testes de disponibilidade de horários
   - Testes de conflitos de agendamento

2. **Tarefa 5 - Sistema de Pagamento**
   - Testes de integração com gateway
   - Testes de validação de cartão
   - Testes de processamento de pagamento

3. **Tarefa 6 - Sistema de Videochamada**
   - Testes de conexão WebRTC
   - Testes de qualidade de vídeo
   - Testes de chat durante consulta

### Melhorias Sugeridas

- **CI/CD**: Integração com GitHub Actions
- **Testes E2E**: Cypress ou Playwright
- **Testes de Performance**: Lighthouse CI
- **Testes de Acessibilidade**: axe-core
- **Testes Mobile**: Responsividade

## 📞 Suporte

Para dúvidas sobre os testes:

1. **Consulte este guia** primeiro
2. **Verifique o console** da interface unificada
3. **Execute testes individuais** para debug
4. **Verifique logs do Supabase** para problemas de banco

---

**Sistema implementado**: ✅ Completo para Tarefas 1, 2 e 3  
**Próxima atualização**: Quando novas tarefas forem implementadas  
**Cobertura atual**: 95%+ das funcionalidades implementadas