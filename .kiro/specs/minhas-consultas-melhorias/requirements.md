# Documento de Requisitos - Melhorias na Tela "Minhas Consultas"

## Introdução

Esta especificação define as melhorias necessárias na interface "Minhas Consultas" do sistema de telemedicina para fornecer informações mais detalhadas, melhor organização por status e exibição do tempo de atendimento. O objetivo é criar uma experiência mais informativa e intuitiva para os pacientes acompanharem suas consultas.

## Requisitos

### Requisito 1

**História do Usuário:** Como paciente, eu quero ver informações mais detalhadas sobre minhas consultas na tela "Minhas Consultas", para que eu possa ter uma visão completa do status e detalhes de cada atendimento.

#### Critérios de Aceitação

1. QUANDO o usuário acessa "Minhas Consultas" ENTÃO o sistema DEVE exibir informações completas incluindo data, horário, médico, especialidade, status detalhado e valor
2. QUANDO uma consulta está "Na Fila de Atendimento" ENTÃO o sistema DEVE exibir posição na fila e tempo estimado de espera
3. QUANDO uma consulta está "Em Andamento" ENTÃO o sistema DEVE exibir tempo decorrido da consulta em tempo real
4. QUANDO uma consulta foi "Concluída" ENTÃO o sistema DEVE exibir duração total do atendimento e opções de acesso ao prontuário
5. QUANDO uma consulta foi "Cancelada" ENTÃO o sistema DEVE exibir motivo do cancelamento e status do reembolso

### Requisito 2

**História do Usuário:** Como paciente, eu quero que minhas consultas sejam organizadas por status com a consulta atual em primeiro lugar, para que eu possa rapidamente identificar qual consulta precisa da minha atenção imediata.

#### Critérios de Aceitação

1. QUANDO há uma consulta "Em Andamento" ENTÃO o sistema DEVE exibi-la no topo da lista com destaque visual
2. QUANDO há consultas "Na Fila de Atendimento" ENTÃO o sistema DEVE exibi-las logo após consultas em andamento, ordenadas por posição na fila
3. QUANDO há consultas "Agendadas" ENTÃO o sistema DEVE exibi-las ordenadas por data/horário mais próximo
4. QUANDO há consultas "Concluídas" ENTÃO o sistema DEVE exibi-las ordenadas por data mais recente
5. QUANDO há consultas "Canceladas" ENTÃO o sistema DEVE exibi-las por último, ordenadas por data

### Requisito 3

**História do Usuário:** Como paciente, eu quero ver o tempo de atendimento das minhas consultas, para que eu possa ter controle sobre a duração dos atendimentos e planejar melhor meu tempo.

#### Critérios de Aceitação

1. QUANDO uma consulta está "Em Andamento" ENTÃO o sistema DEVE exibir cronômetro em tempo real mostrando tempo decorrido
2. QUANDO uma consulta foi "Concluída" ENTÃO o sistema DEVE exibir duração total do atendimento (ex: "Duração: 25 min")
3. QUANDO uma consulta está "Agendada" ENTÃO o sistema DEVE exibir duração estimada baseada na especialidade
4. QUANDO uma consulta está "Na Fila" ENTÃO o sistema DEVE exibir tempo de espera atual e posição na fila
5. QUANDO o tempo de atendimento excede o esperado ENTÃO o sistema DEVE destacar visualmente a informação

### Requisito 4

**História do Usuário:** Como paciente, eu quero ter status mais específicos e informativos para minhas consultas, para que eu possa entender exatamente em que etapa cada consulta se encontra.

#### Critérios de Aceitação

1. QUANDO uma consulta é criada ENTÃO o sistema DEVE exibir status "Pagamento Confirmado"
2. QUANDO o paciente entra na fila ENTÃO o sistema DEVE exibir status "Na Fila de Atendimento" com posição
3. QUANDO é a vez do paciente ENTÃO o sistema DEVE exibir status "Chamando Paciente" com alerta visual
4. QUANDO a videochamada inicia ENTÃO o sistema DEVE exibir status "Em Andamento" com cronômetro
5. QUANDO a consulta termina ENTÃO o sistema DEVE exibir status "Concluída" com duração e acesso ao prontuário

### Requisito 5

**História do Usuário:** Como paciente, eu quero ter acesso rápido às ações relevantes para cada consulta baseada no seu status, para que eu possa realizar as ações necessárias de forma eficiente.

#### Critérios de Aceitação

1. QUANDO uma consulta está "Na Fila" ENTÃO o sistema DEVE exibir botões "Ver Posição na Fila" e "Cancelar"
2. QUANDO uma consulta está "Chamando Paciente" ENTÃO o sistema DEVE exibir botão "Entrar na Consulta" em destaque
3. QUANDO uma consulta está "Em Andamento" ENTÃO o sistema DEVE exibir botão "Voltar à Consulta"
4. QUANDO uma consulta foi "Concluída" ENTÃO o sistema DEVE exibir botões "Ver Prontuário", "Baixar PDF" e "Agendar Retorno"
5. QUANDO uma consulta foi "Cancelada" ENTÃO o sistema DEVE exibir botão "Reagendar" se aplicável