# 📋 Guia do Sistema de Gerenciamento de Consultas

## Visão Geral

O Sistema de Gerenciamento de Consultas é uma implementação completa da **Tarefa 14** do projeto TeleMed, fornecendo funcionalidades avançadas para gerenciar consultas médicas online. Este sistema permite visualizar, reagendar, cancelar e acompanhar consultas com regras de negócio robustas e auditoria completa.

## 🎯 Funcionalidades Implementadas

### 1. Visualização de Consultas Próximas e Anteriores
- **Separação automática** de consultas por data e status
- **Ordenação inteligente** (próximas por data crescente, anteriores por data decrescente)
- **Interface responsiva** com cards informativos
- **Filtros visuais** por status (agendada, em andamento, concluída, cancelada)

### 2. Funcionalidades de Reagendamento
- **Reagendamento individual** com validação de disponibilidade
- **Reagendamento em lote** para múltiplas consultas
- **Interface de calendário** para seleção de nova data/hora
- **Validação de conflitos** e disponibilidade médica
- **Histórico de alterações** com auditoria completa

### 3. Sistema de Cancelamento com Regras
- **Regras de prazo** baseadas no tempo até a consulta:
  - **Mais de 24h**: Cancelamento permitido com 100% de reembolso
  - **Entre 2-24h**: Cancelamento permitido com 50% de reembolso
  - **Menos de 2h**: Cancelamento não permitido
- **Cancelamento em lote** para múltiplas consultas
- **Confirmação de segurança** antes do cancelamento

### 4. Processamento de Reembolsos Automáticos
- **Cálculo automático** baseado nas regras de prazo
- **Processamento imediato** com notificação ao usuário
- **Log de auditoria** para todos os reembolsos
- **Status de acompanhamento** (processando, concluído, não aplicável)
- **Estimativa de prazo** para recebimento (3-5 dias úteis)

### 5. Opções de Consulta de Retorno
- **Agendamento de retorno** baseado em consultas anteriores
- **Manutenção do mesmo médico** e especialidade
- **Preenchimento automático** de dados da consulta original
- **Processo de pagamento** integrado para consultas de retorno

### 6. Funcionalidades Avançadas
- **Sistema de filtros** por status, especialidade, médico, tipo
- **Busca textual** em todos os campos da consulta
- **Estatísticas detalhadas** do histórico de consultas
- **Relatórios personalizados** por período
- **Sistema de lembretes** configuráveis
- **Auditoria completa** de todas as alterações

## 🔧 Arquitetura Técnica

### Estrutura de Dados

```javascript
// Estrutura de uma consulta
const appointment = {
    id: 'unique-id',
    patient: 'Nome do Paciente',
    doctor: 'Nome do Médico',
    specialty: 'Especialidade',
    date: '2024-01-15',
    time: '14:00',
    duration: 30,
    status: 'scheduled', // scheduled, in_progress, completed, cancelled, rescheduled
    type: 'video', // video, phone, chat
    price: 89.90,
    symptoms: 'Descrição dos sintomas',
    notes: 'Observações médicas',
    
    // Campos de auditoria
    createdAt: new Date(),
    updatedAt: new Date(),
    cancelledAt: new Date(), // se cancelada
    rescheduledAt: new Date(), // se reagendada
    
    // Informações de reembolso
    refund: {
        amount: 44.95,
        percentage: 0.5,
        reason: 'Cancelamento entre 2-24h de antecedência',
        processedAt: new Date(),
        status: 'processing'
    }
};
```

### Principais Funções

#### Visualização
```javascript
// Renderizar consultas por tipo (próximas/anteriores)
renderAppointments(tabType = 'upcoming')

// Alternar entre abas
showAppointmentTab(tabName)

// Renderizar card individual
renderAppointmentCard(appointment, tabType)
```

#### Reagendamento
```javascript
// Reagendar consulta individual
rescheduleAppointment(appointmentId)

// Reagendar múltiplas consultas
rescheduleMultipleAppointments(appointmentIds, newDate, newTime)

// Confirmar novo agendamento
confirmSchedule(appointmentId)
```

#### Cancelamento
```javascript
// Cancelar consulta individual
cancelAppointment(appointmentId)

// Cancelar múltiplas consultas
cancelMultipleAppointments(appointmentIds)

// Verificar se pode cancelar
canCancelAppointment(appointment)
```

#### Reembolsos
```javascript
// Processar reembolso com regras
processRefund(appointment)

// Registrar transação de reembolso
logRefundTransaction(appointment)
```

#### Consultas de Retorno
```javascript
// Agendar consulta de retorno
scheduleFollowUp(appointmentId)

// Criar modal de agendamento
showScheduleModal(appointment)
```

#### Funcionalidades Avançadas
```javascript
// Filtrar consultas
filterAppointments(criteria)

// Buscar consultas
searchAppointments(searchTerm)

// Obter estatísticas
getAppointmentStatistics()

// Gerar relatório
generateAppointmentReport(dateRange)

// Configurar lembrete
setAppointmentReminder(appointmentId, reminderTime)
```

## 📊 Sistema de Auditoria

### Logs de Reembolso
```javascript
const refundLog = {
    appointmentId: 'apt-123',
    patientName: 'João Silva',
    originalAmount: 89.90,
    refundAmount: 44.95,
    refundPercentage: 0.5,
    reason: 'Cancelamento entre 2-24h de antecedência',
    timestamp: new Date(),
    status: 'processing'
};
```

### Logs de Alterações
```javascript
const changeLog = {
    id: 'log-456',
    appointmentId: 'apt-123',
    changeType: 'status', // 'status', 'date', 'time', 'doctor'
    oldValue: 'scheduled',
    newValue: 'cancelled',
    reason: 'Cancelamento pelo paciente',
    timestamp: new Date(),
    userId: 'user-789'
};
```

## 🧪 Testes Implementados

### Testes Unitários
- **Visualização**: Separação e ordenação de consultas
- **Reagendamento**: Individual e em lote
- **Cancelamento**: Regras de prazo e validações
- **Reembolsos**: Cálculos e processamento
- **Consultas de Retorno**: Criação e agendamento
- **Funcionalidades Avançadas**: Filtros, busca, estatísticas

### Testes de Interface
- **Interface HTML** completa para testes manuais
- **Simulação de cenários** reais de uso
- **Validação visual** de todas as funcionalidades
- **Testes de responsividade** em diferentes dispositivos

## 🚀 Como Usar

### 1. Visualizar Consultas
```javascript
// Mostrar consultas próximas
showAppointmentTab('upcoming');

// Mostrar consultas anteriores
showAppointmentTab('past');
```

### 2. Reagendar Consulta
```javascript
// Reagendar consulta específica
rescheduleAppointment(appointmentId);

// Reagendar múltiplas consultas
const appointmentIds = ['apt-1', 'apt-2', 'apt-3'];
rescheduleMultipleAppointments(appointmentIds, '2024-02-15', '14:00');
```

### 3. Cancelar Consulta
```javascript
// Cancelar consulta específica
cancelAppointment(appointmentId);

// Cancelar múltiplas consultas
const appointmentIds = ['apt-1', 'apt-2'];
cancelMultipleAppointments(appointmentIds);
```

### 4. Agendar Consulta de Retorno
```javascript
// Agendar retorno baseado em consulta anterior
scheduleFollowUp(completedAppointmentId);
```

### 5. Filtrar e Buscar
```javascript
// Filtrar por critérios
const filtered = filterAppointments({
    status: 'scheduled',
    specialty: 'Cardiologia',
    dateRange: { start: '2024-01-01', end: '2024-01-31' }
});

// Buscar por texto
const results = searchAppointments('Dr. Roberto');
```

### 6. Obter Estatísticas
```javascript
// Estatísticas gerais
const stats = getAppointmentStatistics();
console.log(`Total: ${stats.total}, Próximas: ${stats.upcoming}`);

// Relatório detalhado
const report = generateAppointmentReport({
    start: '2024-01-01',
    end: '2024-01-31'
});
```

## 📱 Interface do Usuário

### Cards de Consulta
- **Informações completas**: Médico, especialidade, data, hora, preço
- **Status visual**: Cores e ícones indicativos
- **Ações contextuais**: Botões baseados no status e prazo
- **Responsividade**: Adaptação automática para mobile

### Modais Interativos
- **Reagendamento**: Calendário e seleção de horários
- **Detalhes**: Visualização completa da consulta
- **Confirmações**: Diálogos de segurança para ações críticas

### Notificações
- **Feedback imediato**: Confirmações de ações
- **Alertas de erro**: Mensagens claras de problemas
- **Informações de processo**: Status de reembolsos e alterações

## 🔒 Segurança e Validações

### Validações de Negócio
- **Prazos de cancelamento**: Verificação automática
- **Disponibilidade médica**: Validação antes do reagendamento
- **Dados obrigatórios**: Verificação de campos essenciais
- **Conflitos de horário**: Prevenção de sobreposições

### Auditoria e Logs
- **Rastreamento completo**: Todas as alterações são registradas
- **Identificação de usuário**: Logs incluem ID do usuário
- **Timestamps precisos**: Data e hora de todas as ações
- **Integridade de dados**: Validação de consistência

## 📈 Métricas e Analytics

### Estatísticas Disponíveis
- **Total de consultas**: Contador geral
- **Consultas por status**: Distribuição por estado
- **Valor total gasto**: Soma de consultas pagas
- **Especialidade mais usada**: Análise de preferências
- **Médico preferido**: Identificação de favoritos

### Relatórios
- **Período customizável**: Filtros por data
- **Insights comportamentais**: Dias e horários preferidos
- **Distribuição de especialidades**: Análise de demanda
- **Métricas de cancelamento**: Taxa e motivos

## 🛠️ Manutenção e Extensibilidade

### Estrutura Modular
- **Funções independentes**: Fácil manutenção
- **Separação de responsabilidades**: Código organizado
- **Reutilização**: Componentes aproveitáveis
- **Extensibilidade**: Fácil adição de novas funcionalidades

### Configurações
- **Regras de reembolso**: Facilmente ajustáveis
- **Prazos de cancelamento**: Configuráveis
- **Tipos de notificação**: Personalizáveis
- **Formatos de data/hora**: Localizáveis

## 📋 Checklist de Implementação

### ✅ Funcionalidades Principais
- [x] Visualização de consultas próximas e anteriores
- [x] Reagendamento individual e em lote
- [x] Sistema de cancelamento com regras
- [x] Processamento automático de reembolsos
- [x] Consultas de retorno

### ✅ Funcionalidades Avançadas
- [x] Sistema de filtros
- [x] Busca textual
- [x] Estatísticas e relatórios
- [x] Sistema de lembretes
- [x] Auditoria completa

### ✅ Interface e UX
- [x] Cards responsivos
- [x] Modais interativos
- [x] Notificações em tempo real
- [x] Validações de formulário

### ✅ Testes e Qualidade
- [x] Testes unitários
- [x] Testes de interface
- [x] Validação de regras de negócio
- [x] Documentação completa

## 🎉 Conclusão

O Sistema de Gerenciamento de Consultas foi implementado com sucesso, atendendo a todos os requisitos da **Tarefa 14**. O sistema oferece:

- **Funcionalidade completa** para gerenciar consultas
- **Interface intuitiva** e responsiva
- **Regras de negócio robustas** para cancelamentos e reembolsos
- **Auditoria completa** de todas as operações
- **Extensibilidade** para futuras melhorias
- **Testes abrangentes** garantindo qualidade

O sistema está pronto para uso em produção e pode ser facilmente integrado com outros módulos da plataforma TeleMed.

---

**Desenvolvido para o projeto TeleMed - Sistema de Telemedicina**  
**Tarefa 14: Sistema de Gerenciamento de Consultas**  
**Status: ✅ Concluído com Sucesso**