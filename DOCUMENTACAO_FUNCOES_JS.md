# 📋 Documentação Completa das Funções JavaScript - TeleMed

## 🎯 Visão Geral

Esta documentação explica detalhadamente todas as funções dos arquivos JavaScript da plataforma TeleMed, agora com comentários em português para facilitar o entendimento e manutenção do código.

---

## 📁 **app.js** - Aplicação Principal

### 🔧 **Funções de Inicialização**

#### `initializeApp()`
- **Propósito**: Coordena a inicialização de todos os módulos da aplicação
- **O que faz**: Chama funções para configurar event listeners, componentes, dados e atualizações em tempo real
- **Quando é chamada**: Automaticamente quando o DOM é carregado

#### `initializeEventListeners()`
- **Propósito**: Configura todos os ouvintes de eventos globais
- **O que faz**: 
  - Fecha modais quando clica fora
  - Configura atalhos de teclado (ESC, Ctrl+Enter)
  - Detecta redimensionamento da janela
  - Monitora status de conexão online/offline

#### `initializeComponents()`
- **Propósito**: Configura componentes da interface
- **O que faz**: Inicializa navegação, modais, formulários e gráficos (se disponível)

#### `initializeData()`
- **Propósito**: Carrega dados iniciais necessários
- **O que faz**: Carrega especialidades, preferências do usuário e atualiza estatísticas

### 🧭 **Funções de Navegação**

#### `initializeNavigation()`
- **Propósito**: Configura sistema de navegação entre seções
- **O que faz**: Adiciona event listeners aos links de navegação para alternar seções

#### `showSection(sectionName)`
- **Propósito**: Exibe uma seção específica da aplicação
- **O que faz**: Oculta todas as seções, mostra a seção alvo e inicializa funcionalidades específicas

#### `updateNavigation(activeSection)`
- **Propósito**: Atualiza visual da navegação
- **O que faz**: Remove classe 'active' de todos os links e adiciona ao link da seção atual

### 📊 **Funções de Estatísticas**

#### `updateRealTimeStats()`
- **Propósito**: Atualiza estatísticas em tempo real
- **O que faz**: Gera números aleatórios para simular médicos online, consultas do dia, etc.

#### `animateCounter(element, target, suffix)`
- **Propósito**: Anima contadores numericamente
- **O que faz**: Cria animação suave de números incrementando até o valor alvo

### 🔧 **Funções Utilitárias**

#### `formatDate(date)`, `formatTime(date)`, `formatCurrency(amount)`
- **Propósito**: Formatação de dados para exibição
- **O que fazem**: Convertem datas, horários e valores monetários para formato brasileiro

#### `generateId()`
- **Propósito**: Gera IDs únicos
- **O que faz**: Combina timestamp com string aleatória para criar identificador único

#### `debounce(func, wait)` e `throttle(func, limit)`
- **Propósito**: Controle de performance
- **O que fazem**: Limitam frequência de execução de funções para otimizar performance

---

## 📅 **appointments.js** - Gerenciamento de Consultas

### 📋 **Funções de Dados**

#### `initializeAppointments()`
- **Propósito**: Inicializa sistema de consultas
- **O que faz**: Carrega consultas salvas ou dados de exemplo

#### `loadAppointments()`
- **Propósito**: Carrega consultas do localStorage
- **O que faz**: Tenta carregar dados salvos, usa exemplos se não houver, filtra por usuário atual

#### `saveAppointments()`
- **Propósito**: Persiste consultas no localStorage
- **O que faz**: Salva array de consultas como JSON no navegador

### 🎨 **Funções de Interface**

#### `showAppointmentTab(tabName)`
- **Propósito**: Alterna entre abas "Próximas" e "Anteriores"
- **O que faz**: Atualiza estilos dos botões e renderiza consultas apropriadas

#### `renderAppointments(tabType)`
- **Propósito**: Renderiza lista de consultas na interface
- **O que faz**: Filtra consultas por data, ordena e cria cards HTML para cada consulta

#### `renderAppointmentCard(appointment, tabType)`
- **Propósito**: Cria HTML de um card de consulta
- **O que faz**: Gera estrutura visual com informações, status e botões de ação

### ⚡ **Funções de Ações**

#### `joinAppointment(appointmentId)`
- **Propósito**: Inicia uma consulta
- **O que faz**: Muda status para "em andamento" e abre videochamada

#### `cancelAppointment(appointmentId)`
- **Propósito**: Cancela uma consulta
- **O que faz**: Confirma com usuário, muda status, processa reembolso

#### `rescheduleAppointment(appointmentId)`
- **Propósito**: Reagenda uma consulta
- **O que faz**: Abre modal de reagendamento com calendário

#### `scheduleFollowUp(appointmentId)`
- **Propósito**: Agenda consulta de retorno
- **O que faz**: Cria nova consulta baseada na anterior

### 🗓️ **Funções de Agendamento**

#### `showScheduleModal(appointment)`
- **Propósito**: Exibe interface de agendamento
- **O que faz**: Cria modal com calendário, horários disponíveis e formulário

#### `generateTimeSlots()`
- **Propósito**: Gera horários disponíveis
- **O que faz**: Cria botões para horários de 8h às 17h30

#### `selectTimeSlot(time)`
- **Propósito**: Seleciona horário específico
- **O que faz**: Atualiza visual do horário selecionado

#### `confirmSchedule(appointmentId)`
- **Propósito**: Confirma agendamento
- **O que faz**: Valida dados, cria/atualiza consulta, salva no localStorage

---

## 💬 **chat.js** - Sistema de Chat

### 🔧 **Funções de Inicialização**

#### `initializeChat()`
- **Propósito**: Inicializa sistema de chat
- **O que faz**: Carrega histórico e configura event listeners

#### `loadChatHistory()`
- **Propósito**: Carrega mensagens salvas
- **O que faz**: Recupera mensagens do localStorage ou usa exemplos

#### `setupChatEventListeners()`
- **Propósito**: Configura eventos de teclado
- **O que faz**: Enter para enviar, detecta digitação

### 🎨 **Funções de Interface**

#### `openChat()`
- **Propósito**: Abre janela de chat
- **O que faz**: Atualiza modal, exibe interface, foca no input, marca mensagens como lidas

#### `updateChatModal()`
- **Propósito**: Atualiza conteúdo do modal
- **O que faz**: Cria interface completa com mensagens, input e controles

#### `renderChatMessages()`
- **Propósito**: Renderiza mensagens na interface
- **O que faz**: Cria HTML para cada mensagem com timestamp e remetente

### 📤 **Funções de Mensagens**

#### `sendMessage()`
- **Propósito**: Envia nova mensagem
- **O que faz**: Valida input, cria objeto mensagem, salva, atualiza interface, simula resposta

#### `simulateResponse()`
- **Propósito**: Simula resposta automática
- **O que faz**: Seleciona resposta aleatória, mostra indicador de digitação, adiciona mensagem

#### `sendFileMessage(file)`
- **Propósito**: Envia arquivo no chat
- **O que faz**: Cria mensagem com informações do arquivo, simula resposta

### 🔧 **Funções de Controle**

#### `handleTyping()`
- **Propósito**: Gerencia indicador de digitação
- **O que faz**: Mostra/oculta indicador baseado na atividade

#### `markMessagesAsRead()`
- **Propósito**: Marca mensagens como lidas
- **O que faz**: Atualiza status de leitura, zera contador não lidas

#### `updateCharacterCounter()`
- **Propósito**: Atualiza contador de caracteres
- **O que faz**: Mostra caracteres digitados, muda cor baseado no limite

---

## 📊 **dashboard.js** - Sistema de Dashboard

### 🔧 **Funções de Inicialização**

#### `initializeDashboard()`
- **Propósito**: Inicializa sistema de dashboard
- **O que faz**: Carrega dados e configura atualização automática

#### `loadDashboardData()`
- **Propósito**: Carrega dados do dashboard
- **O que faz**: Recupera dados salvos ou usa dados de exemplo

### 📊 **Funções de Dados**

#### `updateDashboardData()`
- **Propósito**: Atualiza dados do dashboard
- **O que faz**: Atualiza cards e gráficos se estiver na seção dashboard

#### `updateDashboardCards()`
- **Propósito**: Atualiza valores dos cards
- **O que faz**: Calcula métricas e anima valores nos cards

#### `calculateConsultationsRealized()`, `calculateUpcomingAppointments()`, etc.
- **Propósito**: Calculam métricas específicas
- **O que fazem**: Processam dados do usuário para gerar estatísticas

### 📈 **Funções de Gráficos**

#### `renderDashboardCharts()`
- **Propósito**: Renderiza todos os gráficos
- **O que faz**: Cria gráficos Chart.js ou fallback se não disponível

#### `renderConsultationsChart()`
- **Propósito**: Cria gráfico de consultas
- **O que faz**: Gráfico de linha mostrando consultas por mês

#### `renderSpecialtiesChart()`
- **Propósito**: Cria gráfico de especialidades
- **O que faz**: Gráfico de rosca mostrando distribuição por especialidade

### 🔄 **Funções de Atualização**

#### `setupDashboardRefresh()`
- **Propósito**: Configura atualização automática
- **O que faz**: Timer que atualiza dados a cada 30 segundos

#### `simulateDataChanges()`
- **Propósito**: Simula mudanças nos dados
- **O que faz**: Adiciona variações aleatórias para demonstração

---

## 🔔 **notifications.js** - Sistema de Notificações

### 🔧 **Funções de Inicialização**

#### `initializeNotifications()`
- **Propósito**: Inicializa sistema de notificações
- **O que faz**: Cria container DOM e adiciona estilos CSS

#### `createNotificationContainer()`
- **Propósito**: Cria container para notificações
- **O que faz**: Remove container existente, cria novo com posicionamento correto

#### `setupNotificationStyles()`
- **Propósito**: Adiciona estilos CSS
- **O que faz**: Injeta CSS para animações e aparência das notificações

### 📢 **Funções de Exibição**

#### `showNotification(title, message, type, options)`
- **Propósito**: Função principal para mostrar notificações
- **O que faz**: Cria objeto notificação, limita quantidade máxima, exibe na tela, toca som

#### `createNotificationElement(notification)`
- **Propósito**: Cria elemento DOM da notificação
- **O que faz**: Gera HTML com ícone, conteúdo, botão fechar e barra de progresso

#### `removeNotification(id)`
- **Propósito**: Remove notificação específica
- **O que faz**: Adiciona animação de saída, remove do DOM e do array

### 🔊 **Funções de Som**

#### `playNotificationSound(type)`
- **Propósito**: Toca som da notificação
- **O que faz**: Usa Web Audio API para gerar tons diferentes por tipo

#### `toggleNotificationSound()`
- **Propósito**: Liga/desliga sons
- **O que faz**: Alterna configuração e salva preferência

### 🎯 **Funções Especializadas**

#### `showAppointmentReminder(appointment)`
- **Propósito**: Notificação de lembrete de consulta
- **O que faz**: Mostra notificação com botões de ação (entrar/reagendar)

#### `showPaymentNotification(amount, method)`
- **Propósito**: Notificação de pagamento
- **O que faz**: Confirma pagamento processado com valor e método

#### `showNewMessageNotification(sender, preview)`
- **Propósito**: Notificação de nova mensagem
- **O que faz**: Mostra prévia da mensagem com botões de resposta

---

## 💳 **payments.js** - Sistema de Pagamentos

### 💰 **Funções Principais**

#### `processPayment(method)`
- **Propósito**: Coordena processamento de pagamentos
- **O que faz**: Valida especialidade, calcula valores, cria dados de pagamento, direciona para método específico

#### `processPixPayment(paymentData)`
- **Propósito**: Processa pagamento PIX
- **O que faz**: Exibe QR Code, simula processamento instantâneo

#### `processCreditCardPayment(paymentData)`
- **Propósito**: Processa cartão de crédito
- **O que faz**: Exibe formulário de cartão, valida dados

#### `processBoletoPayment(paymentData)`
- **Propósito**: Processa boleto bancário
- **O que faz**: Gera boleto, envia por email, define prazo de pagamento

### 🎨 **Funções de Interface**

#### `showPixQRCode(paymentData)`
- **Propósito**: Exibe modal com QR Code PIX
- **O que faz**: Cria interface com código, instruções e valor com desconto

#### `showCreditCardForm(paymentData)`
- **Propósito**: Exibe formulário de cartão
- **O que faz**: Cria modal com campos de cartão, validação e formatação

#### `generateBoleto(paymentData)`
- **Propósito**: Exibe informações do boleto
- **O que faz**: Mostra dados do boleto, botões de download e reenvio

### ✅ **Funções de Finalização**

#### `completePayment(paymentData)`
- **Propósito**: Finaliza pagamento aprovado
- **O que faz**: Atualiza status, salva histórico, cria consulta, adiciona à fila

#### `addPaymentToHistory(paymentData)`
- **Propósito**: Adiciona ao histórico
- **O que faz**: Salva pagamento no localStorage para referência futura

#### `createConsultation(paymentData)`
- **Propósito**: Cria consulta após pagamento
- **O que faz**: Gera objeto consulta vinculado ao pagamento

### 🔧 **Funções Utilitárias**

#### `formatCardNumber(input)`, `formatExpiry(input)`, `formatCPF(input)`
- **Propósito**: Formatação de campos
- **O que fazem**: Aplicam máscaras de formatação em tempo real

---

## 🏥 **specialties.js** - Gerenciamento de Especialidades

### 📋 **Funções de Dados**

#### `loadSpecialtiesData()`
- **Propósito**: Carrega dados das especialidades
- **O que faz**: Atribui array de especialidades ao estado global

#### `renderSpecialties(specialtiesToRender)`
- **Propósito**: Renderiza cards das especialidades
- **O que faz**: Cria HTML para cada especialidade com informações, preços e avaliações

#### `animateSpecialtyCards()`
- **Propósito**: Anima entrada dos cards
- **O que faz**: Aplica animação de fade-in escalonada

### 🔍 **Funções de Busca**

#### `searchSpecialties(query)`
- **Propósito**: Busca especialidades por termo
- **O que faz**: Filtra especialidades por nome/descrição, mostra resultados ou mensagem de "não encontrado"

#### `clearSearch()`
- **Propósito**: Limpa busca atual
- **O que faz**: Limpa input de busca e mostra todas as especialidades

### 🎨 **Funções de Interface**

#### `openSpecialtyModal(specialtyId)`
- **Propósito**: Abre modal de especialidade
- **O que faz**: Busca dados da especialidade, atualiza modal, exibe na tela

#### `updateSpecialtyModal(specialty)`
- **Propósito**: Atualiza conteúdo do modal
- **O que faz**: Cria HTML com informações detalhadas, recursos incluídos, médicos disponíveis

### ⚡ **Funções de Ação**

#### `scheduleAppointment()`
- **Propósito**: Agenda consulta futura
- **O que faz**: Fecha modal, abre interface de agendamento com calendário

#### `startImmediateConsultation()`
- **Propósito**: Inicia consulta imediata
- **O que faz**: Fecha modal, abre modal de pagamento para fila de espera

### 🔄 **Funções de Atualização**

#### `updateSpecialtyAvailability()`
- **Propósito**: Atualiza disponibilidade em tempo real
- **O que faz**: Simula mudanças no número de médicos online e tempos de espera

#### `getSpecialtyById(id)`, `getAvailableDoctors(specialtyId)`
- **Propósito**: Funções de consulta
- **O que fazem**: Buscam dados específicos por ID ou filtram médicos disponíveis

---

## 🎥 **videocall.js** - Sistema de Videochamadas

### 🔧 **Funções de Inicialização**

#### `initializeVideoCall()`
- **Propósito**: Inicializa sistema de videochamadas
- **O que faz**: Prepara sistema para uso (atualmente apenas log)

#### `openVideoCall(appointmentId)`
- **Propósito**: Inicia nova videochamada
- **O que faz**: Verifica sessão, gera nome da sala, atualiza modal, inicializa Jitsi Meet

#### `generateRoomName(appointmentId)`
- **Propósito**: Cria nome único para sala
- **O que faz**: Combina prefixo da plataforma com ID da consulta ou timestamp

### 🎨 **Funções de Interface**

#### `updateVideoCallModal(appointmentId)`
- **Propósito**: Atualiza conteúdo do modal
- **O que faz**: Cria interface com informações da consulta, controles de vídeo e estatísticas

#### `showJitsiMeetFallback()`
- **Propósito**: Exibe interface de demonstração
- **O que faz**: Mostra videochamada simulada quando Jitsi não está disponível

### 🔗 **Funções de Integração Jitsi**

#### `initializeJitsiMeet(roomName)`
- **Propósito**: Inicializa integração com Jitsi Meet
- **O que faz**: Cria instância da API, configura opções, inicia rastreamento

#### `setupJitsiEventListeners()`
- **Propósito**: Configura eventos do Jitsi
- **O que faz**: Monitora entrada/saída de participantes, mudanças de áudio/vídeo, erros

### 🎛️ **Funções de Controle**

#### `toggleVideo()`, `toggleAudio()`, `toggleScreenShare()`, `toggleRecording()`
- **Propósito**: Controlam recursos da videochamada
- **O que fazem**: Ligam/desligam vídeo, áudio, compartilhamento de tela e gravação

#### `endCall()`
- **Propósito**: Encerra videochamada
- **O que faz**: Para rastreamento, limpa API Jitsi, reseta estado, fecha modal, mostra resumo

### 📊 **Funções de Monitoramento**

#### `startCallTracking()`
- **Propósito**: Inicia rastreamento da chamada
- **O que faz**: Define horário de início, inicia timer de duração

#### `updateCallDuration()`, `updateCallStatus()`, `updateParticipantCount()`
- **Propósito**: Atualizam informações em tempo real
- **O que fazem**: Atualizam duração, qualidade e número de participantes na interface

#### `showCallSummary(duration)`
- **Propósito**: Exibe resumo da chamada
- **O que faz**: Mostra notificação com duração, qualidade e status de gravação

### 🔄 **Funções de Estado**

#### `updateVideoButton()`, `updateAudioButton()`, `updateScreenShareButton()`, `updateRecordingStatus()`
- **Propósito**: Atualizam estado visual dos botões
- **O que fazem**: Mudam cores e estilos dos botões baseado no estado atual

---

## 🎯 **Resumo das Integrações**

### **Fluxo Principal da Aplicação:**

1. **app.js** → Inicializa toda a aplicação e coordena módulos
2. **specialties.js** → Usuário escolhe especialidade médica
3. **payments.js** → Processa pagamento da consulta
4. **appointments.js** → Gerencia agendamento e fila de espera
5. **notifications.js** → Notifica sobre status e mudanças
6. **videocall.js** → Realiza a consulta por videochamada
7. **chat.js** → Permite comunicação durante e após consulta
8. **dashboard.js** → Exibe estatísticas e histórico

### **Dependências Entre Módulos:**

- Todos os módulos dependem de **app.js** para inicialização e funções utilitárias
- **payments.js** integra com **appointments.js** para criar consultas
- **appointments.js** usa **notifications.js** para alertas
- **videocall.js** pode usar **chat.js** durante consultas
- **dashboard.js** consome dados de todos os outros módulos

### **Padrões de Código Utilizados:**

- **Modularização**: Cada arquivo tem responsabilidade específica
- **Estado Global**: Uso do objeto `window.TeleMed` para compartilhar dados
- **LocalStorage**: Persistência de dados no navegador
- **Event Listeners**: Interatividade através de eventos DOM
- **Async/Await**: Para operações assíncronas (simuladas)
- **Error Handling**: Tratamento de erros com try/catch
- **Responsive Design**: Adaptação para diferentes tamanhos de tela

---

*Esta documentação serve como guia completo para entender, manter e expandir o sistema TeleMed. Todos os comentários estão em português para facilitar o desenvolvimento por equipes brasileiras.*