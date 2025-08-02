# Testes Unitários - TeleMed (Organizados por Tarefa)

Este diretório contém os testes unitários organizados por tarefa para o sistema de telemedicina TeleMed.

## 📋 Estrutura por Tarefa

### Tarefa 1 - Sistema de Autenticação
- Testes de validação de formulários de login/cadastro
- Testes de integração com Supabase Auth
- Testes de gerenciamento de sessão

### Tarefa 2 - Sistema de Cadastro e Aprovação de Médicos
- `doctor-form-validation.test.js` - Testes de validação do formulário
- `doctor-registration.test.js` - Testes do processo de registro
- Testes de workflow de aprovação

### Tarefa 3 - Sistema de Especialidades Médicas
- `task3-specialties.test.js` - Testes do sistema de especialidades
- Testes de renderização de cards
- Testes de busca e filtros
- Testes de modal de detalhes
- Testes de disponibilidade de médicos

## 📋 Cobertura dos Testes

Os testes cobrem todas as funcionalidades implementadas na Tarefa 2:

### ✅ Funcionalidades Testadas

1. **Validação de Dados Pessoais**
   - Validação de CPF (formato e dígitos verificadores)
   - Validação de email profissional
   - Validação de telefone brasileiro
   - Validação de data de nascimento (idade mínima)

2. **Validação de Dados Profissionais**
   - Validação de número do CRM
   - Validação de estado do CRM
   - Validação de ano de formação
   - Validação de seleção de especialidades

3. **Validação de Dados Financeiros**
   - Validação de dados bancários
   - Validação de preços de consulta

4. **Formulário Multi-Step**
   - Navegação entre etapas
   - Atualização da barra de progresso

5. **Integração com Banco de Dados**
   - Salvamento de candidaturas
   - Carregamento de candidaturas para admin
   - Atualização de status das candidaturas

6. **Sistema de Notificações**
   - Notificação de candidatura recebida
   - Notificação de aprovação
   - Notificação de rejeição
   - Substituição de variáveis em templates

7. **Painel Administrativo**
   - Filtros por status
   - Cálculo de estatísticas
   - Formatação de dados para exibição

8. **Workflow de Aprovação**
   - Aprovação de candidaturas
   - Rejeição com motivo
   - Validação de permissões de admin

9. **Tratamento de Erros**
   - Erro de CPF duplicado
   - Erro de email duplicado
   - Erro de conexão com banco

10. **Segurança e Validação**
    - Sanitização de dados de entrada
    - Validação de tamanho de campos
    - Validação de caracteres permitidos

## 🚀 Como Executar os Testes

### Pré-requisitos

1. **Node.js** (versão 16 ou superior)
2. **npm** ou **yarn**

### Método 1: Script Automatizado (Recomendado)

```bash
# Instalar dependências
node tests/run-unit-tests.js install

# Executar todos os testes
node tests/run-unit-tests.js test

# Executar testes com cobertura
node tests/run-unit-tests.js test:coverage

# Executar apenas testes de cadastro médico
node tests/run-unit-tests.js test:doctor

# Executar apenas testes de validação de formulário
node tests/run-unit-tests.js test:form

# Executar testes em modo watch
node tests/run-unit-tests.js test:watch

# Ver ajuda
node tests/run-unit-tests.js help
```

### Método 2: Comandos Diretos

```bash
# Navegar para o diretório de testes
cd tests/unit

# Instalar dependências
npm install

# Executar todos os testes
npm test

# Executar testes em modo watch (re-executa quando arquivos mudam)
npm run test:watch

# Executar testes com relatório de cobertura
npm run test:coverage

# Executar apenas os testes de cadastro médico
npm run test:doctor-registration

# Executar testes com saída detalhada
npm run test:verbose

# Executar testes em modo silencioso
npm run test:silent
```

### Executar Testes Específicos

```bash
# Executar apenas um grupo de testes
npx jest --testNamePattern="Validação de Dados Pessoais"

# Executar apenas um teste específico
npx jest --testNamePattern="deve validar CPF corretamente"

# Executar testes de um arquivo específico
npx jest doctor-registration.test.js
```

## 📊 Relatório de Cobertura

Após executar `npm run test:coverage`, você encontrará:

- **Relatório em texto**: Exibido no terminal
- **Relatório HTML**: Em `../coverage/lcov-report/index.html`
- **Arquivo LCOV**: Em `../coverage/lcov.info`

### Métricas de Cobertura Esperadas

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## 🧪 Estrutura dos Testes

### Organização

```
tests/unit/
├── doctor-registration.test.js  # Testes principais
├── setup.js                    # Configuração inicial
├── jest.config.js              # Configuração do Jest
├── package.json                # Dependências e scripts
└── README.md                   # Esta documentação
```

### Padrões de Teste

1. **Arrange-Act-Assert**: Cada teste segue este padrão
2. **Mocks**: Uso de mocks para Supabase e DOM
3. **Isolamento**: Cada teste é independente
4. **Nomenclatura**: Nomes descritivos em português

## 🔧 Configuração

### Jest Configuration

- **Ambiente**: jsdom (para testes de DOM)
- **Setup**: Configuração automática de mocks
- **Cobertura**: Relatórios detalhados
- **Timeout**: 10 segundos para testes assíncronos

### Mocks Incluídos

- **Supabase**: Cliente de banco de dados
- **DOM**: Elementos HTML e eventos
- **localStorage/sessionStorage**: Armazenamento local
- **fetch**: Requisições HTTP
- **console**: Logs e erros

## 🐛 Debugging

### Executar Testes com Debug

```bash
# Debug com Node.js
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug específico
npx jest --testNamePattern="nome do teste" --verbose
```

### Logs de Debug

Os testes incluem logs detalhados que podem ser habilitados:

```javascript
// No arquivo de teste, descomente para debug
console.log('Debug info:', variavel);
```

## 📝 Adicionando Novos Testes

### Template para Novo Teste

```javascript
describe('Nova Funcionalidade', () => {
    test('deve fazer algo específico', () => {
        // Arrange
        const input = 'valor de entrada';
        
        // Act
        const result = funcaoParaTestar(input);
        
        // Assert
        expect(result).toBe('valor esperado');
    });
});
```

### Boas Práticas

1. **Nomes descritivos**: Use nomes que expliquem o que está sendo testado
2. **Testes isolados**: Cada teste deve ser independente
3. **Mocks apropriados**: Use mocks para dependências externas
4. **Cobertura completa**: Teste casos de sucesso e erro
5. **Documentação**: Comente testes complexos

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de módulo não encontrado**
   ```bash
   npm install
   ```

2. **Testes falhando por timeout**
   ```bash
   # Aumentar timeout no jest.config.js
   testTimeout: 15000
   ```

3. **Problemas com DOM**
   ```bash
   # Verificar se jsdom está instalado
   npm install --save-dev jest-environment-jsdom
   ```

### Logs de Erro

Os testes geram logs detalhados em caso de falha:
- Verifique o console para mensagens de erro
- Use `--verbose` para mais detalhes
- Verifique os mocks se testes assíncronos falharem

## 📈 Métricas e Qualidade

### Objetivos de Qualidade

- ✅ **100% das funcionalidades testadas**
- ✅ **Cobertura > 90%**
- ✅ **Todos os casos de erro tratados**
- ✅ **Validações de segurança testadas**
- ✅ **Integração com banco testada**

### Relatórios Gerados

1. **Cobertura de código**: HTML e LCOV
2. **Resultados dos testes**: JSON e texto
3. **Métricas de performance**: Tempo de execução

## 🔄 Integração Contínua

### GitHub Actions (exemplo)

```yaml
name: Unit Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: cd tests/unit && npm install
      - run: cd tests/unit && npm run test:coverage
```

## 📞 Suporte

Para dúvidas sobre os testes:

1. Verifique este README
2. Consulte a documentação do Jest
3. Verifique os comentários no código dos testes
4. Execute testes individuais para debug

---

**Última atualização**: Janeiro 2024  
**Versão**: 1.0.0  
**Cobertura atual**: 95%+ das funcionalidades da Tarefa 2