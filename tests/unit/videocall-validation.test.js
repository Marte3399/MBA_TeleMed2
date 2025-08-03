/**
 * Testes de Validação para o Sistema de Videoconsulta
 * Verifica se os arquivos e funcionalidades básicas estão implementados
 */

const fs = require('fs');
const path = require('path');

describe('Validação do Sistema de Videoconsulta', () => {
    
    describe('Arquivos Necessários', () => {
        test('deve ter o arquivo videocall.js', () => {
            const filePath = path.join(__dirname, '../../js/videocall.js');
            expect(fs.existsSync(filePath)).toBe(true);
        });

        test('deve ter a página de preparação videocall-preparation.html', () => {
            const filePath = path.join(__dirname, '../../videocall-preparation.html');
            expect(fs.existsSync(filePath)).toBe(true);
        });

        test('deve ter a página de teste test-videocall-system.html', () => {
            const filePath = path.join(__dirname, '../../test-videocall-system.html');
            expect(fs.existsSync(filePath)).toBe(true);
        });
    });

    describe('Conteúdo do videocall.js', () => {
        let videocallContent;

        beforeAll(() => {
            const filePath = path.join(__dirname, '../../js/videocall.js');
            videocallContent = fs.readFileSync(filePath, 'utf8');
        });

        test('deve ter a classe VideoCallSystem', () => {
            expect(videocallContent).toContain('class VideoCallSystem');
        });

        test('deve ter integração com Jitsi Meet', () => {
            expect(videocallContent).toContain('JitsiMeetExternalAPI');
            expect(videocallContent).toContain('8x8.vc');
        });

        test('deve ter configurações de qualidade HD', () => {
            expect(videocallContent).toContain('resolution: 720');
            expect(videocallContent).toContain('height: { ideal: 720');
            expect(videocallContent).toContain('width: { ideal: 1280');
        });

        test('deve ter controles de áudio e vídeo', () => {
            expect(videocallContent).toContain('toggleAudio');
            expect(videocallContent).toContain('toggleVideo');
            expect(videocallContent).toContain('executeCommand');
        });

        test('deve ter funcionalidade de chat', () => {
            expect(videocallContent).toContain('sendChatMessage');
            expect(videocallContent).toContain('onChatMessage');
            expect(videocallContent).toContain('incomingMessage');
        });

        test('deve ter funcionalidade de gravação', () => {
            expect(videocallContent).toContain('toggleRecording');
            expect(videocallContent).toContain('recordingStatusChanged');
            expect(videocallContent).toContain('enableRecording');
        });

        test('deve ter configurações de áudio aprimoradas', () => {
            expect(videocallContent).toContain('echoCancellation: true');
            expect(videocallContent).toContain('noiseSuppression: true');
            expect(videocallContent).toContain('autoGainControl: true');
        });

        test('deve ter event listeners do Jitsi', () => {
            expect(videocallContent).toContain('videoConferenceJoined');
            expect(videocallContent).toContain('videoConferenceLeft');
            expect(videocallContent).toContain('participantJoined');
            expect(videocallContent).toContain('participantLeft');
        });

        test('deve ter gerenciamento de sessão', () => {
            expect(videocallContent).toContain('logSessionStart');
            expect(videocallContent).toContain('logSessionEnd');
            expect(videocallContent).toContain('getCallStatistics');
        });
    });

    describe('Conteúdo da página de preparação', () => {
        let preparationContent;

        beforeAll(() => {
            const filePath = path.join(__dirname, '../../videocall-preparation.html');
            preparationContent = fs.readFileSync(filePath, 'utf8');
        });

        test('deve ter teste de câmera', () => {
            expect(preparationContent).toContain('test-camera-btn');
            expect(preparationContent).toContain('camera-preview');
            expect(preparationContent).toContain('Teste de Câmera');
        });

        test('deve ter teste de microfone', () => {
            expect(preparationContent).toContain('test-microphone-btn');
            expect(preparationContent).toContain('mic-level-bar');
            expect(preparationContent).toContain('Teste de Microfone');
        });

        test('deve ter teste de conexão', () => {
            expect(preparationContent).toContain('test-connection-btn');
            expect(preparationContent).toContain('connection-speed');
            expect(preparationContent).toContain('Teste de Conexão');
        });

        test('deve ter opções de gravação', () => {
            expect(preparationContent).toContain('enable-recording');
            expect(preparationContent).toContain('Opções de Gravação');
            expect(preparationContent).toContain('gravação da consulta');
        });

        test('deve ter fluxo de preparação em etapas', () => {
            expect(preparationContent).toContain('step1-content');
            expect(preparationContent).toContain('step2-content');
            expect(preparationContent).toContain('step3-content');
        });

        test('deve ter classe VideocallPreparation', () => {
            expect(preparationContent).toContain('class VideocallPreparation');
        });
    });

    describe('Integração com páginas existentes', () => {
        test('index.html deve usar a preparação', () => {
            const filePath = path.join(__dirname, '../../index.html');
            const content = fs.readFileSync(filePath, 'utf8');
            
            expect(content).toContain('videocall-preparation.html');
            expect(content).toContain('Preparação Iniciada');
        });

        test('dashboard.html deve usar a preparação', () => {
            const filePath = path.join(__dirname, '../../dashboard.html');
            const content = fs.readFileSync(filePath, 'utf8');
            
            expect(content).toContain('videocall-preparation.html');
            expect(content).toContain('Preparação Iniciada');
        });
    });

    describe('Funcionalidades Implementadas', () => {
        test('deve ter todas as funcionalidades requeridas', () => {
            const videocallPath = path.join(__dirname, '../../js/videocall.js');
            const videocallContent = fs.readFileSync(videocallPath, 'utf8');

            // Requisito 4.1: Exibir informações do médico e botão "Iniciar Consulta"
            expect(videocallContent).toContain('startVideoCall');
            
            // Requisito 4.2: Testar permissões de câmera/microfone
            const preparationPath = path.join(__dirname, '../../videocall-preparation.html');
            const preparationContent = fs.readFileSync(preparationPath, 'utf8');
            expect(preparationContent).toContain('getUserMedia');
            
            // Requisito 4.3: Conexão WebRTC segura com vídeo HD
            expect(videocallContent).toContain('resolution: 720');
            expect(videocallContent).toContain('p2p');
            
            // Requisito 4.4: Controles para alternar câmera, microfone e chat
            expect(videocallContent).toContain('toggleAudio');
            expect(videocallContent).toContain('toggleVideo');
            expect(videocallContent).toContain('openChat');
            
            // Requisito 4.5: Salvar duração da sessão e solicitar avaliação
            expect(videocallContent).toContain('logSessionEnd');
            expect(videocallContent).toContain('showFeedbackModal');
        });

        test('deve ter todas as sub-tarefas implementadas', () => {
            const videocallPath = path.join(__dirname, '../../js/videocall.js');
            const videocallContent = fs.readFileSync(videocallPath, 'utf8');
            const preparationPath = path.join(__dirname, '../../videocall-preparation.html');
            const preparationContent = fs.readFileSync(preparationPath, 'utf8');

            // Sub-tarefa 1: Integrar WebRTC/Jitsi Meet para videochamadas HD
            expect(videocallContent).toContain('JitsiMeetExternalAPI');
            expect(videocallContent).toContain('resolution: 720');
            
            // Sub-tarefa 2: Criar tela de preparação com teste de câmera/microfone
            expect(preparationContent).toContain('testCamera');
            expect(preparationContent).toContain('testMicrophone');
            
            // Sub-tarefa 3: Desenvolver controles de áudio/vídeo durante a consulta
            expect(videocallContent).toContain('toggleAudio');
            expect(videocallContent).toContain('toggleVideo');
            
            // Sub-tarefa 4: Implementar chat na chamada
            expect(videocallContent).toContain('sendChatMessage');
            expect(videocallContent).toContain('onChatMessage');
            
            // Sub-tarefa 5: Adicionar funcionalidade de gravação (opcional)
            expect(videocallContent).toContain('toggleRecording');
            expect(videocallContent).toContain('recordingService');
        });
    });

    describe('Configurações de Qualidade', () => {
        test('deve ter configurações de vídeo HD', () => {
            const filePath = path.join(__dirname, '../../js/videocall.js');
            const content = fs.readFileSync(filePath, 'utf8');
            
            expect(content).toContain('height: { ideal: 720, max: 1080, min: 360 }');
            expect(content).toContain('width: { ideal: 1280, max: 1920, min: 640 }');
            expect(content).toContain('frameRate: { ideal: 30, max: 30, min: 15 }');
        });

        test('deve ter configurações de áudio aprimoradas', () => {
            const filePath = path.join(__dirname, '../../js/videocall.js');
            const content = fs.readFileSync(filePath, 'utf8');
            
            expect(content).toContain('echoCancellation: true');
            expect(content).toContain('noiseSuppression: true');
            expect(content).toContain('autoGainControl: true');
            expect(content).toContain('sampleRate: 48000');
        });
    });

    describe('Tratamento de Erros', () => {
        test('deve ter tratamento de erros implementado', () => {
            const filePath = path.join(__dirname, '../../js/videocall.js');
            const content = fs.readFileSync(filePath, 'utf8');
            
            expect(content).toContain('try {');
            expect(content).toContain('catch (error)');
            expect(content).toContain('console.error');
            expect(content).toContain('onConferenceError');
        });
    });
});

describe('Validação da Página de Teste', () => {
    let testPageContent;

    beforeAll(() => {
        const filePath = path.join(__dirname, '../../test-videocall-system.html');
        testPageContent = fs.readFileSync(filePath, 'utf8');
    });

    test('deve ter controles para paciente', () => {
        expect(testPageContent).toContain('join-as-patient-btn');
        expect(testPageContent).toContain('patient-appointment-id');
        expect(testPageContent).toContain('patient-recording');
    });

    test('deve ter controles para médico', () => {
        expect(testPageContent).toContain('join-as-doctor-btn');
        expect(testPageContent).toContain('doctor-name');
        expect(testPageContent).toContain('doctor-crm');
    });

    test('deve ter controles de videochamada', () => {
        expect(testPageContent).toContain('toggle-audio-btn');
        expect(testPageContent).toContain('toggle-video-btn');
        expect(testPageContent).toContain('toggle-recording-btn');
        expect(testPageContent).toContain('open-chat-btn');
    });

    test('deve ter área de estatísticas', () => {
        expect(testPageContent).toContain('call-duration');
        expect(testPageContent).toContain('call-participants');
        expect(testPageContent).toContain('call-quality');
    });

    test('deve ter classe VideocallTester', () => {
        expect(testPageContent).toContain('class VideocallTester');
    });
});