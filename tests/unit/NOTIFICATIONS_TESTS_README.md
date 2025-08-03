# 🧪 Testes Unitários - Sistema de Notificações Multi-Canal

## 📋 Visão Geral

Este conjunto de testes unitários foi desenvolvido para validar todas as implementações da **Tarefa 7: Desenvolver sistema de notificações multi-canal** do projeto TeleMed.

## 🎯 Funcionalidades Testadas

### 1. 📱 Notificações Push do Navegador
- ✅ Inicialização do sistema de push notifications
- ✅ Verificação de suporte do navegador
- ✅ Solicitação e gerenciamento de permissões
- ✅ Envio de notificações push nativas
- ✅ Configuração de opções (persistente, silenciosa, etc.)
- ✅ Tratamento de erros e fallbacks

### 2. 📱 Integração WhatsApp
- ✅ Inicialização da integração WhatsApp Business API
- ✅ Configuração de parâmetros (URL, número do negócio)
- ✅ Envio de mensagens via WhatsApp (simulado)
- ✅ Formatação de URLs para WhatsApp Web
- ✅ Tratamento de estados habilitado/desabilitado
- ✅ Gerenciamento de erros de API

### 3. 📧 Sistema de Email
- ✅ Inicialização do serviço de email
- ✅ Configuração de templates HTML responsivos
- ✅ Envio de emails com branding TeleMed
- ✅ Inclusão de botões de ação em emails
- ✅ Personalização de conteúdo dinâmico
- ✅ Tratamento de falhas de envio

### 4. 🎯 Notificações de Proximidade
- ✅ Detecção de posição na fila de espera
- ✅ Notificações quando próximo (3 posições)
- ✅ Notificações urgentes (próximo na fila)
- ✅ Gerenciamento de flags de notificação
- ✅ Reset automático quando posição muda
- ✅ Configuração de thresholds personalizados

### 5. 🔊 Alertas Sonoros
- ✅ Sons de proximidade (3 beeps)
- ✅ Sons de chamada (tom alternado)
- ✅ Controle de habilitação/desabilitação
- ✅ Gerenciamento de contexto de áudio
- ✅ Parada de sons em execução
- ✅ Fallbacks para navegadores sem suporte

### 6. 🏥 Notificações Específicas do Sistema
- ✅ Confirmação de pagamento
- ✅ Atualização de posição na fila
- ✅ Consulta pronta para início
- ✅ Lembretes de consulta
- ✅ Notificações de conexão
- ✅ Mensagens do sistema

### 7. 🔄 Integração e Fluxos Completos
- ✅ Fluxo completo de confirmação de pagamento
- ✅ Fluxo de proximidade na fila (5→3→1)
- ✅ Gerenciamento de estado entre notificações
- ✅ Coordenação entre múltiplos canais
- ✅ Configurações personalizadas por canal

### 8. ⚙️ Configurações e Personalização
- ✅ Habilitação/desabilitação de canais
- ✅ Configuração de sons por tipo
- ✅ Thresholds de proximidade customizáveis
- ✅ Posicionamento de notificações
- ✅ Durações personalizadas

## 🚀 Como Executar os Testes

### Método 1: Script Automatizado (Recomendado)
```bash
# Executar script que instala dependências e roda testes
node tests/run-notifications-tests.js
```

### Método 2: NPM Script
```bash
# Adicionar ao package.json:
# "test:notifications": "node tests/run-notifications-tests.js"
npm run test:notifications
```

### Método 3: Jest Direto
```bash
# Instalar dependências primeiro
npm install --save-dev jest jest-environment-jsdom babel-jest @babel/core @babel/preset-env jest-html-reporters

# Executar testes
npx jest --config=tests/unit/jest.notifications.config.js --verbose
```

## 📊 Relatórios Gerados

### Cobertura de Código
- **Localização**: `tests/coverage/notifications/`
- **Formato**: HTML, LCOV, Text
- **Threshold**: 85% para funções, linhas e statements

### Relatório de Testes
- **Localização**: `tests/reports/notifications/`
- **Arquivo**: `notifications-test-report.html`
- **Conteúdo**: Resultados detalhados, tempo de execução, falhas

## 🧪 Estrutura dos Testes

```
tests/unit/
├── multi-channel-notifications.test.js    # Testes principais
├── jest.notifications.config.js           # Configuração Jest
├── setup-notifications.js                 # Setup e mocks
└── NOTIFICATIONS_TESTS_README.md          # Esta documentação

tests/
├── coverage/notifications/                # Relatórios de cobertura
├── reports/notifications/                 # Relatórios HTML
└── run-notifications-tests.js            # Script de execução
```

## 🔧 Configuração de Ambiente

### Dependências Necessárias
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "babel-jest": "^29.0.0",
    "@babel/core": "^7.0.0",
    "@babel/preset-env": "^7.0.0",
    "jest-html-reporters": "^3.0.0"
  }
}
```

### Configuração Babel (babel.config.js)
```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      }
    }]
  ]
};
```

## 🎭 Mocks e Simulações

### APIs do Navegador
- ✅ `window.Notification` - API de notificações push
- ✅ `window.AudioContext` - API de áudio para sons
- ✅ `document` - Manipulação do DOM
- ✅ `localStorage` - Armazenamento local
- ✅ `fetch` - Requisições HTTP

### Utilitários de Teste
- ✅ `createMockAppointmentData()` - Dados de consulta
- ✅ `createMockDoctorData()` - Dados de médico
- ✅ `mockNotificationPermission()` - Permissões
- ✅ `expectNotificationSent()` - Verificações
- ✅ `expectSoundPlayed()` - Verificação de áudio

### Matchers Customizados
- ✅ `toHaveBeenCalledWithNotification()` - Verificar notificações
- ✅ `toHaveValidEmailStructure()` - Validar estrutura de email
- ✅ `toHaveValidWhatsAppMessage()` - Validar mensagem WhatsApp

## 📈 Métricas de Qualidade

### Cobertura de Código
- **Branches**: ≥ 80%
- **Functions**: ≥ 85%
- **Lines**: ≥ 85%
- **Statements**: ≥ 85%

### Casos de Teste
- **Total**: 50+ casos de teste
- **Suítes**: 8 suítes principais
- **Cenários**: Positivos, negativos, edge cases
- **Integração**: Fluxos completos multi-canal

## 🐛 Cenários de Erro Testados

### Navegador
- ✅ Navegador sem suporte a notificações
- ✅ Permissão negada pelo usuário
- ✅ Falha na criação de notificação

### WhatsApp
- ✅ API desabilitada
- ✅ Configuração inválida
- ✅ Erro de rede

### Email
- ✅ Serviço desabilitado
- ✅ Email inválido
- ✅ Falha no envio

### Áudio
- ✅ AudioContext não suportado
- ✅ Som desabilitado
- ✅ Falha na criação de oscilador

## 🔍 Debugging e Troubleshooting

### Logs Detalhados
Todos os testes incluem logs detalhados para facilitar o debugging:
```javascript
console.log('📱 Browser push notification sent:', title);
console.log('📱 WhatsApp notification sent:', data);
console.log('📧 Email notification sent:', emailData);
```

### Verificação de Estado
Os testes verificam o estado interno do sistema:
```javascript
expect(notificationState.proximityNotified).toBe(true);
expect(notificationState.currentQueuePosition).toBe(3);
expect(notificationState.callAudio).toEqual({ playing: true });
```

### Timeout Configurável
Timeout de 10 segundos para testes assíncronos:
```javascript
jest.setTimeout(10000);
```

## 📝 Exemplos de Uso

### Teste de Notificação Push
```javascript
test('deve enviar notificação push do navegador', () => {
  const result = notificationSystem.sendBrowserPushNotification(
    'Teste Push',
    'Mensagem de teste',
    { tag: 'test-notification' }
  );
  
  expect(result).toBeDefined();
  expect(global.window.Notification).toHaveBeenCalledWith(
    'Teste Push',
    expect.objectContaining({
      body: 'Mensagem de teste',
      tag: 'test-notification'
    })
  );
});
```

### Teste de Fluxo Completo
```javascript
test('deve executar fluxo completo de confirmação de pagamento', async () => {
  // Configurar canais
  notificationSystem.NOTIFICATION_CONFIG.channels.browser = true;
  notificationSystem.NOTIFICATION_CONFIG.channels.whatsapp = true;
  notificationSystem.NOTIFICATION_CONFIG.channels.email = true;
  
  // Executar fluxo
  const paymentResult = notificationSystem.sendPaymentConfirmationNotification(appointmentData);
  const whatsappResult = await notificationSystem.sendWhatsAppNotification(phone, message);
  const emailResult = await notificationSystem.sendEmailNotification(email, subject, message);
  
  // Verificar resultados
  expect(paymentResult.title).toBe('✅ Pagamento Confirmado');
  expect(whatsappResult.success).toBe(true);
  expect(emailResult.success).toBe(true);
});
```

## 🎯 Próximos Passos

### Melhorias Futuras
- [ ] Testes de integração com APIs reais
- [ ] Testes de performance para múltiplas notificações
- [ ] Testes de acessibilidade
- [ ] Testes em diferentes navegadores

### Monitoramento
- [ ] Métricas de entrega de notificações
- [ ] Analytics de engajamento
- [ ] Logs de erro em produção

---

## 📞 Suporte

Para dúvidas sobre os testes ou problemas na execução:

1. Verificar logs detalhados no console
2. Consultar relatórios HTML gerados
3. Verificar configuração de dependências
4. Executar testes individuais para debugging

**Desenvolvido para o projeto TeleMed - Sistema de Telemedicina** 🏥