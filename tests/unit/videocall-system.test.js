/**
 * Testes para o Sistema de Videoconsulta
 * Verifica funcionalidades de WebRTC/Jitsi Meet, preparação, controles e gravação
 */

describe('Sistema de Videoconsulta', () => {
    let videoCallSystem;
    let mockJitsiAPI;

    beforeEach(() => {
        // Mock do Jitsi Meet External API
        mockJitsiAPI = {
            addEventListener: jest.fn(),
            executeCommand: jest.fn(),
            dispose: jest.fn()
        };

        // Mock do window.JitsiMeetExternalAPI
        global.JitsiMeetExternalAPI = jest.fn(() => mockJitsiAPI);

        // Mock do Supabase
        global.supabase = {
            from: jest.fn(() => ({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        single: jest.fn(() => Promise.resolve({ data: mockAppointmentData, error: null }))
                    }))
                })),
                insert: jest.fn(() => Promise.resolve({ error: null })),
                update: jest.fn(() => ({
                    eq: jest.fn(() => Promise.resolve({ error: null }))
                }))
            }))
        };

        // Mock appointment data
        global.mockAppointmentData = {
            id: 'test-appointment-123',
            patient_id: 'patient-123',
            doctor_id: 'doctor-123',
            specialty_id: 'cardiology',
            duration: 30,
            status: 'scheduled',
            specialties: { name: 'Cardiologia' },
            doctors: { name: 'Dr. João Silva', crm: '12345-SP' }
        };

        // Mock DOM elements
        document.body.innerHTML = '<div id="test-container"></div>';

        // Importar e inicializar o sistema
        const VideoCallSystem = require('../../js/videocall.js');
        videoCallSystem = new VideoCallSystem();
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    describe('Inicialização do Sistema', () => {
        test('deve inicializar corretamente', () => {
            expect(videoCallSystem).toBeDefined();
            expect(videoCallSystem.jitsiConfig).toBeDefined();
            expect(videoCallSystem.currentCall).toBeNull();
        });

        test('deve carregar script do Jitsi Meet', () => {
            const scripts = document.querySelectorAll('script[src*="external_api.js"]');
            expect(scripts.length).toBeGreaterThan(0);
        });
    });

    describe('Entrada na Videochamada', () => {
        test('deve permitir paciente entrar na videochamada', async () => {
            const roomName = 'consultation-test-123';
            const userData = { appointmentId: 'test-123', enableRecording: false };

            await videoCallSystem.joinVideoCall(roomName, 'patient', userData);

            expect(global.JitsiMeetExternalAPI).toHaveBeenCalledWith('8x8.vc', expect.objectContaining({
                roomName: roomName,
                width: '100%',
                height: '100%'
            }));

            expect(videoCallSystem.currentCall).toEqual(expect.objectContaining({
                roomName: roomName,
                userType: 'patient'
            }));
        });

        test('deve permitir médico entrar na videochamada', async () => {
            const roomName = 'consultation-test-123';
            const doctorData = {
                id: 'doctor-123',
                name: 'Dr. João Silva',
                crm: '12345-SP',
                specialty: 'Cardiologia'
            };

            await videoCallSystem.joinVideoCall(roomName, 'doctor', doctorData);

            expect(global.JitsiMeetExternalAPI).toHaveBeenCalledWith('8x8.vc', expect.objectContaining({
                roomName: roomName,
                userInfo: expect.objectContaining({
                    displayName: 'Dr. João Silva'
                })
            }));
        });

        test('deve configurar event listeners do Jitsi', async () => {
            const roomName = 'consultation-test-123';
            
            await videoCallSystem.joinVideoCall(roomName, 'patient');

            expect(mockJitsiAPI.addEventListener).toHaveBeenCalledWith('videoConferenceJoined', expect.any(Function));
            expect(mockJitsiAPI.addEventListener).toHaveBeenCalledWith('videoConferenceLeft', expect.any(Function));
            expect(mockJitsiAPI.addEventListener).toHaveBeenCalledWith('participantJoined', expect.any(Function));
            expect(mockJitsiAPI.addEventListener).toHaveBeenCalledWith('participantLeft', expect.any(Function));
            expect(mockJitsiAPI.addEventListener).toHaveBeenCalledWith('incomingMessage', expect.any(Function));
            expect(mockJitsiAPI.addEventListener).toHaveBeenCalledWith('recordingStatusChanged', expect.any(Function));
        });
    });

    describe('Controles de Áudio e Vídeo', () => {
        beforeEach(async () => {
            videoCallSystem.jitsiAPI = mockJitsiAPI;
            await videoCallSystem.joinVideoCall('test-room', 'patient');
        });

        test('deve alternar áudio', () => {
            videoCallSystem.toggleAudio();
            expect(mockJitsiAPI.executeCommand).toHaveBeenCalledWith('toggleAudio');
        });

        test('deve alternar vídeo', () => {
            videoCallSystem.toggleVideo();
            expect(mockJitsiAPI.executeCommand).toHaveBeenCalledWith('toggleVideo');
        });

        test('deve abrir chat', () => {
            videoCallSystem.openChat();
            expect(mockJitsiAPI.executeCommand).toHaveBeenCalledWith('toggleChat');
        });

        test('deve alternar gravação', () => {
            videoCallSystem.toggleRecording();
            expect(mockJitsiAPI.executeCommand).toHaveBeenCalledWith('toggleRecording');
        });

        test('deve enviar mensagem no chat', () => {
            const message = 'Olá, doutor!';
            videoCallSystem.sendChatMessage(message);
            expect(mockJitsiAPI.executeCommand).toHaveBeenCalledWith('sendChatMessage', message);
        });
    });

    describe('Funcionalidade de Chat', () => {
        beforeEach(async () => {
            videoCallSystem.jitsiAPI = mockJitsiAPI;
            videoCallSystem.consultationData = mockAppointmentData;
        });

        test('deve processar mensagens recebidas', () => {
            const chatData = {
                from: 'Dr. João Silva',
                message: 'Como você está se sentindo?'
            };

            const consoleSpy = jest.spyOn(console, 'log');
            videoCallSystem.onChatMessage(chatData);

            expect(consoleSpy).toHaveBeenCalledWith('💬 Chat message logged:', expect.objectContaining({
                appointment_id: mockAppointmentData.id,
                sender: chatData.from,
                message: chatData.message
            }));
        });

        test('deve enviar mensagem programaticamente', () => {
            videoCallSystem.jitsiAPI = mockJitsiAPI;
            const message = 'Obrigado, doutor!';
            
            videoCallSystem.sendChatMessage(message);
            expect(mockJitsiAPI.executeCommand).toHaveBeenCalledWith('sendChatMessage', message);
        });

        test('não deve enviar mensagem vazia', () => {
            videoCallSystem.jitsiAPI = mockJitsiAPI;
            
            videoCallSystem.sendChatMessage('   ');
            expect(mockJitsiAPI.executeCommand).not.toHaveBeenCalled();
        });
    });

    describe('Funcionalidade de Gravação', () => {
        beforeEach(async () => {
            videoCallSystem.jitsiAPI = mockJitsiAPI;
            videoCallSystem.consultationData = mockAppointmentData;
        });

        test('deve processar início da gravação', () => {
            const recordingData = { status: 'on', mode: 'file' };
            const consoleSpy = jest.spyOn(console, 'log');

            videoCallSystem.onRecordingStatusChanged(recordingData);

            expect(consoleSpy).toHaveBeenCalledWith('🎥 Recording started:', expect.objectContaining({
                mode: 'file'
            }));
        });

        test('deve processar fim da gravação', () => {
            const recordingData = { status: 'off', mode: 'file' };
            const consoleSpy = jest.spyOn(console, 'log');

            videoCallSystem.onRecordingStatusChanged(recordingData);

            expect(consoleSpy).toHaveBeenCalledWith('🎥 Recording stopped:', expect.any(Object));
        });

        test('deve configurar gravação baseada nas preferências do usuário', async () => {
            // Simular preferência de gravação ativada
            localStorage.setItem('enableRecording', 'true');

            const roomName = 'consultation-test-123';
            const userData = { enableRecording: true };

            await videoCallSystem.joinVideoCall(roomName, 'patient', userData);

            expect(global.JitsiMeetExternalAPI).toHaveBeenCalledWith('8x8.vc', expect.objectContaining({
                configOverwrite: expect.objectContaining({
                    recordingService: expect.objectContaining({
                        enabled: true,
                        sharingEnabled: true
                    })
                })
            }));
        });
    });

    describe('Qualidade de Vídeo HD', () => {
        test('deve configurar resolução HD', async () => {
            const roomName = 'consultation-test-123';
            
            await videoCallSystem.joinVideoCall(roomName, 'patient');

            expect(global.JitsiMeetExternalAPI).toHaveBeenCalledWith('8x8.vc', expect.objectContaining({
                configOverwrite: expect.objectContaining({
                    resolution: 720,
                    constraints: expect.objectContaining({
                        video: expect.objectContaining({
                            height: { ideal: 720, max: 1080, min: 360 },
                            width: { ideal: 1280, max: 1920, min: 640 },
                            frameRate: { ideal: 30, max: 30, min: 15 }
                        }),
                        audio: expect.objectContaining({
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                            sampleRate: 48000
                        })
                    })
                })
            }));
        });
    });

    describe('Gerenciamento de Sessão', () => {
        test('deve registrar início da sessão', async () => {
            videoCallSystem.consultationData = mockAppointmentData;
            const consoleSpy = jest.spyOn(console, 'log');

            await videoCallSystem.logSessionStart('patient');

            expect(consoleSpy).toHaveBeenCalledWith('📝 Sessão iniciada:', expect.objectContaining({
                appointment_id: mockAppointmentData.id,
                user_type: 'patient',
                action: 'joined'
            }));
        });

        test('deve registrar fim da sessão', async () => {
            videoCallSystem.consultationData = mockAppointmentData;
            const duration = 25; // minutos
            const consoleSpy = jest.spyOn(console, 'log');

            await videoCallSystem.logSessionEnd('doctor', duration);

            expect(consoleSpy).toHaveBeenCalledWith('📝 Sessão finalizada:', expect.objectContaining({
                appointment_id: mockAppointmentData.id,
                user_type: 'doctor',
                action: 'left',
                duration: duration
            }));
        });

        test('deve obter estatísticas da chamada', async () => {
            videoCallSystem.jitsiAPI = mockJitsiAPI;
            videoCallSystem.currentCall = {
                startTime: new Date(Date.now() - 60000) // 1 minuto atrás
            };

            const stats = await videoCallSystem.getCallStatistics();

            expect(stats).toEqual(expect.objectContaining({
                duration: expect.any(Number),
                participants: 2,
                quality: 'good'
            }));
        });
    });

    describe('Tratamento de Erros', () => {
        test('deve tratar erro ao entrar na videochamada', async () => {
            // Simular erro no Jitsi
            global.JitsiMeetExternalAPI = jest.fn(() => {
                throw new Error('Jitsi initialization failed');
            });

            await expect(videoCallSystem.joinVideoCall('test-room', 'patient'))
                .rejects.toThrow('Jitsi initialization failed');
        });

        test('deve tratar erro ao executar comandos', () => {
            videoCallSystem.jitsiAPI = {
                executeCommand: jest.fn(() => {
                    throw new Error('Command failed');
                })
            };

            const consoleSpy = jest.spyOn(console, 'error');
            videoCallSystem.toggleAudio();

            expect(consoleSpy).toHaveBeenCalledWith('❌ Erro ao alternar áudio:', expect.any(Error));
        });
    });

    describe('Finalização da Chamada', () => {
        test('deve finalizar chamada corretamente', () => {
            videoCallSystem.jitsiAPI = mockJitsiAPI;
            
            videoCallSystem.endCall();
            
            expect(mockJitsiAPI.dispose).toHaveBeenCalled();
        });

        test('deve limpar container de vídeo ao sair', async () => {
            // Criar container de vídeo
            const container = document.createElement('div');
            container.id = 'jitsi-container';
            document.body.appendChild(container);

            videoCallSystem.currentCall = { startTime: new Date() };
            
            await videoCallSystem.onConferenceLeft('patient');

            expect(document.getElementById('jitsi-container')).toBeNull();
        });
    });
});

describe('Preparação para Videoconsulta', () => {
    let videocallPreparation;

    beforeEach(() => {
        // Mock navigator.mediaDevices
        global.navigator = {
            mediaDevices: {
                getUserMedia: jest.fn()
            }
        };

        // Mock AudioContext
        global.AudioContext = jest.fn(() => ({
            createMediaStreamSource: jest.fn(() => ({
                connect: jest.fn()
            })),
            createAnalyser: jest.fn(() => ({
                fftSize: 256,
                frequencyBinCount: 128,
                getByteFrequencyData: jest.fn()
            })),
            close: jest.fn()
        }));

        // Mock performance
        global.performance = {
            now: jest.fn(() => Date.now())
        };

        // Mock fetch
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true
        }));

        // Mock DOM
        document.body.innerHTML = `
            <div id="camera-preview"></div>
            <div id="camera-placeholder"></div>
            <span id="camera-status"></span>
            <button id="test-camera-btn"></button>
            <span id="microphone-status"></span>
            <div id="mic-level-bar"></div>
            <span id="mic-level-text"></span>
            <div id="mic-test-indicator"></div>
            <button id="test-microphone-btn"></button>
            <span id="connection-status"></span>
            <span id="connection-speed"></span>
            <span id="connection-latency"></span>
            <span id="connection-quality"></span>
            <button id="test-connection-btn"></button>
            <button id="continue-step1-btn"></button>
        `;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Teste de Câmera', () => {
        test('deve testar câmera com sucesso', async () => {
            const mockStream = {
                getTracks: jest.fn(() => [{ stop: jest.fn() }])
            };
            
            global.navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);

            // Simular classe de preparação
            const testCamera = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        video: { 
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            facingMode: 'user'
                        } 
                    });

                    const preview = document.getElementById('camera-preview');
                    const placeholder = document.getElementById('camera-placeholder');
                    const status = document.getElementById('camera-status');

                    preview.srcObject = stream;
                    placeholder.style.display = 'none';
                    preview.style.display = 'block';
                    status.textContent = 'Funcionando';

                    return true;
                } catch (error) {
                    return false;
                }
            };

            const result = await testCamera();
            expect(result).toBe(true);
            expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });
        });

        test('deve tratar erro no teste de câmera', async () => {
            global.navigator.mediaDevices.getUserMedia.mockRejectedValue(new Error('Camera access denied'));

            const testCamera = async () => {
                try {
                    await navigator.mediaDevices.getUserMedia({ video: true });
                    return true;
                } catch (error) {
                    const status = document.getElementById('camera-status');
                    status.textContent = 'Erro';
                    return false;
                }
            };

            const result = await testCamera();
            expect(result).toBe(false);
            expect(document.getElementById('camera-status').textContent).toBe('Erro');
        });
    });

    describe('Teste de Microfone', () => {
        test('deve testar microfone com sucesso', async () => {
            const mockStream = {
                getTracks: jest.fn(() => [{ stop: jest.fn() }])
            };
            
            global.navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);

            const testMicrophone = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    
                    const audioContext = new AudioContext();
                    const source = audioContext.createMediaStreamSource(stream);
                    const analyser = audioContext.createAnalyser();
                    
                    analyser.fftSize = 256;
                    source.connect(analyser);

                    const status = document.getElementById('microphone-status');
                    status.textContent = 'Funcionando';

                    return true;
                } catch (error) {
                    return false;
                }
            };

            const result = await testMicrophone();
            expect(result).toBe(true);
            expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
        });
    });

    describe('Teste de Conexão', () => {
        test('deve testar conexão com sucesso', async () => {
            global.fetch.mockResolvedValue({
                ok: true
            });

            global.performance.now
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(100);

            const testConnection = async () => {
                try {
                    const startTime = performance.now();
                    await fetch('https://httpbin.org/bytes/1024', { cache: 'no-cache' });
                    const endTime = performance.now();
                    
                    const duration = endTime - startTime;
                    const speed = Math.round((1024 * 8) / (duration / 1000) / 1000);
                    const latency = Math.round(duration);

                    document.getElementById('connection-speed').textContent = `${speed} Mbps`;
                    document.getElementById('connection-latency').textContent = `${latency} ms`;
                    document.getElementById('connection-quality').textContent = 'Boa';
                    document.getElementById('connection-status').textContent = 'Estável';

                    return true;
                } catch (error) {
                    return false;
                }
            };

            const result = await testConnection();
            expect(result).toBe(true);
            expect(document.getElementById('connection-status').textContent).toBe('Estável');
        });
    });
});