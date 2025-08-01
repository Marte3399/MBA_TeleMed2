# Testes do Sistema de Telemedicina

Este diretório contém todos os testes automatizados para o sistema de telemedicina TeleMed.

## Estrutura dos Testes

### Testes de Banco de Dados
- `database-tests.sql` - Testes gerais do banco de dados
- `crud-operations-tests.sql` - Testes de operações CRUD
- `rls-tests.sql` - Testes de Row Level Security
- `constraints-tests.sql` - Testes de constraints e validações
- `integration-tests.sql` - Testes de integração entre tabelas

### Testes JavaScript
- `unit-tests/` - Testes unitários de funções JavaScript
- `integration-tests/` - Testes de integração frontend-backend
- `e2e-tests/` - Testes end-to-end do fluxo completo

## Como Executar

### Testes de Banco de Dados
1. Conecte-se ao Supabase
2. Execute os arquivos SQL na ordem indicada
3. Verifique os resultados dos testes

### Testes JavaScript
```bash
# Instalar dependências de teste
npm install --save-dev jest jsdom

# Executar testes
npm test
```

## Cobertura de Testes

- ✅ Cadastro de médicos
- ✅ Sistema de aprovação
- ✅ Notificações
- ✅ Validações de dados
- ✅ Segurança (RLS)
- ✅ Integridade referencial