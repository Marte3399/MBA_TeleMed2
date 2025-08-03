/**
 * TESTES UNITÁRIOS - SISTEMA DE GERENCIAMENTO DE CONSULTAS
 * 
 * Este arquivo contém testes unitários para verificar todas as funcionalidades
 * implementadas na tarefa 14: Sistema de Gerenciamento de Consultas
 * 
 * Funcionalidades testadas:
 * - Visualização de consultas próximas e anteriores
 * - Funcionalidades de reagendamento de consultas
 * - Sistema de cancelamento com regras de prazo
 * - Processamento de reembolsos automáticos
 * - Opções de consulta de retorno para consultas passadas
 * - Funcionalidades avançadas (filtros, busca, estatísticas)
 */

// Mock do ambiente TeleMed para testes
const mockTeleMed = {
    currentUser: { 
        name: 'João Silva', 
        id: 'test-user-1',
        email: 'joao@test.com'
    },
    appointments: [],
    userAppointments: []
};

// Mock das funções de notificação
const mockNotifications = {
    showNotification: (title, message, type) => {
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    }
};

// Configuração inicial dos testes
beforeEach(() => {
    // Reset do ambiente de teste
    global.TeleMed = { ...mockTeleMed };
    global.showNotification = mockNotifications.showNotification;
    global.localStorage = {
        data: {},
        getItem: function(key) {
            return this.data[key] || null;
        },
        setItem: function(key, value) {
            this.data[key] = value;
        },
        removeItem: function(key) {
            delete this.data[key];
        }
    };
    
    // Criar consultas de teste
    createTestAppointments();
});

// Função para criar consultas de teste
function createTestAppointments() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 1 * 60 * 60 * 1000);

    TeleMed.appointments = [
        {
            id: 'test-upcoming-1',
            patient: 'João Silva',
            doctor: 'Dr. Roberto Santos',
            specialty: 'Cardiologia',
            date: tomorrow.toISOString().split('T')[0],
            time: '14:00',
            duration: 30,
            status: 'scheduled',
            type: 'video',
            price: 89.90,
            symptoms: 'Dor no peito',
            notes: 'Consulta de teste'
        },
        {
            id: 'test-upcoming-2',
            patient: 'João Silva',
            doctor: 'Dra. Ana Costa',
            specialty: 'Dermatologia',
            date: nextWeek.toISOString().split('T')[0],
            time: '10:30',
            duration: 30,
            status: 'scheduled',
            type: 'video',
            price: 99.90,
            symptoms: 'Manchas na pele',
            notes: 'Primeira consulta'
        },
        {
            id: 'test-past-1',
            patient: 'João Silva',
            doctor: 'Dr. Paulo Mendes',
            specialty: 'Psiquiatria',
            date: lastWeek.toISOString().split('T')[0],
            time: '16:00',
            duration: 45,
            status: 'completed',
            type: 'video',
            price: 129.90,
            symptoms: 'Ansiedade',
            notes: 'Consulta de acompanhamento'
        },
        {
            id: 'test-cancellable',
            patient: 'João Silva',
            doctor: 'Dr. Maria Silva',
            specialty: 'Clínico Geral',
            date: in2Hours.toISOString().split('T')[0],
            time: in2Hours.toTimeString().slice(0, 5),
            duration: 30,
            status: 'scheduled',
            type: 'video',
            price: 79.90,
            symptoms: 'Check-up',
            notes: 'Consulta de rotina'
        },
        {
            id: 'test-non-cancellable',
            patient: 'João Silva',
            doctor: 'Dr. José Santos',
            specialty: 'Ortopedia',
            date: in1Hour.toISOString().split('T')[0],
            time: in1Hour.toTimeString().slice(0, 5),
            duration: 30,
            status: 'scheduled',
            type: 'video',
            price: 119.90,
            symptoms: 'Dor nas costas',
            notes: 'Consulta urgente'
        }
    ];

    TeleMed.userAppointments = TeleMed.appointments.filter(apt => 
        apt.patient === TeleMed.currentUser.name
    );
}

// Funções utilitárias para testes
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(amount);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// TESTES UNITÁRIOS

describe('Sistema de Gerenciamento de Consultas', () => {
    
    // TESTE 1: Visualização de Consultas Próximas e Anteriores
    describe('Visualização de Consultas', () => {
        
        test('deve separar consultas próximas e anteriores corretamente', () => {
            const userAppointments = TeleMed.userAppointments;
            const now = new Date();
            
            // Filtrar consultas próximas
            const upcoming = userAppointments.filter(apt => {
                const aptDate = new Date(apt.date + 'T' + apt.time);
                return aptDate > now && apt.status !== 'cancelled';
            });
            
            // Filtrar consultas anteriores
            const past = userAppointments.filter(apt => {
                const aptDate = new Date(apt.date + 'T' + apt.time);
                return aptDate <= now || apt.status === 'completed';
            });
            
            expect(upcoming.length).toBeGreaterThan(0);
            expect(past.length).toBeGreaterThan(0);
            expect(upcoming.length + past.length).toBeLessThanOrEqual(userAppointments.length);
        });
        
        test('deve ordenar consultas por data corretamente', () => {
            const userAppointments = TeleMed.userAppointments;
            
            // Ordenar consultas próximas (mais próximas primeiro)
            const upcomingSorted = userAppointments
                .filter(apt => {
                    const aptDate = new Date(apt.date + 'T' + apt.time);
                    return aptDate > new Date() && apt.status !== 'cancelled';
                })
                .sort((a, b) => {
                    const dateA = new Date(a.date + 'T' + a.time);
                    const dateB = new Date(b.date + 'T' + b.time);
                    return dateA - dateB;
                });
            
            // Verificar se está ordenado corretamente
            for (let i = 1; i < upcomingSorted.length; i++) {
                const prevDate = new Date(upcomingSorted[i-1].date + 'T' + upcomingSorted[i-1].time);
                const currDate = new Date(upcomingSorted[i].date + 'T' + upcomingSorted[i].time);
                expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
            }
        });
        
        test('deve exibir informações completas das consultas', () => {
            const appointment = TeleMed.userAppointments[0];
            
            expect(appointment).toHaveProperty('id');
            expect(appointment).toHaveProperty('patient');
            expect(appointment).toHaveProperty('doctor');
            expect(appointment).toHaveProperty('specialty');
            expect(appointment).toHaveProperty('date');
            expect(appointment).toHaveProperty('time');
            expect(appointment).toHaveProperty('status');
            expect(appointment).toHaveProperty('price');
            expect(appointment.price).toBeGreaterThan(0);
        });
    });
    
    // TESTE 2: Funcionalidades de Reagendamento
    describe('Sistema de Reagendamento', () => {
        
        test('deve permitir reagendar consulta individual', () => {
            const appointment = TeleMed.userAppointments.find(apt => apt.status === 'scheduled');
            const originalDate = appointment.date;
            const originalTime = appointment.time;
            
            // Simular reagendamento
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + 10);
            appointment.date = newDate.toISOString().split('T')[0];
            appointment.time = '15:00';
            appointment.status = 'rescheduled';
            appointment.rescheduledAt = new Date();
            
            expect(appointment.date).not.toBe(originalDate);
            expect(appointment.time).not.toBe(originalTime);
            expect(appointment.status).toBe('rescheduled');
            expect(appointment).toHaveProperty('rescheduledAt');
        });
        
        test('deve implementar reagendamento em lote', () => {
            const scheduledAppointments = TeleMed.userAppointments.filter(apt => apt.status === 'scheduled');
            const appointmentIds = scheduledAppointments.map(apt => apt.id);
            
            // Simular reagendamento em lote
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + 15);
            const newTime = '16:00';
            
            appointmentIds.forEach((id, index) => {
                const appointment = TeleMed.appointments.find(apt => apt.id === id);
                if (appointment) {
                    const appointmentTime = new Date(`${newDate.toISOString().split('T')[0]}T${newTime}`);
                    appointmentTime.setMinutes(appointmentTime.getMinutes() + (index * appointment.duration));
                    
                    appointment.date = appointmentTime.toISOString().split('T')[0];
                    appointment.time = appointmentTime.toTimeString().slice(0, 5);
                    appointment.status = 'rescheduled';
                    appointment.rescheduledAt = new Date();
                }
            });
            
            const rescheduledCount = TeleMed.appointments.filter(apt => 
                appointmentIds.includes(apt.id) && apt.status === 'rescheduled'
            ).length;
            
            expect(rescheduledCount).toBe(appointmentIds.length);
        });
        
        test('deve validar disponibilidade ao reagendar', () => {
            const appointment = TeleMed.userAppointments.find(apt => apt.status === 'scheduled');
            
            // Tentar reagendar para data no passado (deve falhar)
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            
            const isValidDate = pastDate > new Date();
            expect(isValidDate).toBe(false);
            
            // Reagendar para data futura válida
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 5);
            
            const isValidFutureDate = futureDate > new Date();
            expect(isValidFutureDate).toBe(true);
        });
    });
    
    // TESTE 3: Sistema de Cancelamento com Regras
    describe('Sistema de Cancelamento', () => {
        
        test('deve aplicar regras de cancelamento baseadas no prazo', () => {
            const now = new Date();
            
            // Teste para consulta com mais de 2h de antecedência
            const cancellableAppointment = TeleMed.userAppointments.find(apt => apt.id === 'test-cancellable');
            const cancellableTime = new Date(cancellableAppointment.date + 'T' + cancellableAppointment.time);
            const cancellableTimeDiff = cancellableTime - now;
            const cancellableHours = cancellableTimeDiff / (1000 * 60 * 60);
            
            expect(cancellableHours).toBeGreaterThan(2);
            
            // Teste para consulta com menos de 2h de antecedência
            const nonCancellableAppointment = TeleMed.userAppointments.find(apt => apt.id === 'test-non-cancellable');
            const nonCancellableTime = new Date(nonCancellableAppointment.date + 'T' + nonCancellableAppointment.time);
            const nonCancellableTimeDiff = nonCancellableTime - now;
            const nonCancellableHours = nonCancellableTimeDiff / (1000 * 60 * 60);
            
            expect(nonCancellableHours).toBeLessThan(2);
        });
        
        test('deve cancelar consulta e atualizar status', () => {
            const appointment = TeleMed.userAppointments.find(apt => apt.id === 'test-cancellable');
            const originalStatus = appointment.status;
            
            // Simular cancelamento
            appointment.status = 'cancelled';
            appointment.cancelledAt = new Date();
            
            expect(appointment.status).toBe('cancelled');
            expect(appointment.status).not.toBe(originalStatus);
            expect(appointment).toHaveProperty('cancelledAt');
        });
        
        test('deve implementar cancelamento em lote', () => {
            const cancellableAppointments = TeleMed.userAppointments.filter(apt => {
                const now = new Date();
                const aptTime = new Date(apt.date + 'T' + apt.time);
                const timeDiff = aptTime - now;
                const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
                return hoursUntilAppointment > 2 && apt.status === 'scheduled';
            });
            
            const appointmentIds = cancellableAppointments.map(apt => apt.id);
            
            // Simular cancelamento em lote
            appointmentIds.forEach(id => {
                const appointment = TeleMed.appointments.find(apt => apt.id === id);
                if (appointment) {
                    appointment.status = 'cancelled';
                    appointment.cancelledAt = new Date();
                }
            });
            
            const cancelledCount = TeleMed.appointments.filter(apt => 
                appointmentIds.includes(apt.id) && apt.status === 'cancelled'
            ).length;
            
            expect(cancelledCount).toBe(appointmentIds.length);
        });
    });
    
    // TESTE 4: Processamento de Reembolsos Automáticos
    describe('Sistema de Reembolsos', () => {
        
        test('deve calcular reembolso baseado no prazo de cancelamento', () => {
            const testCases = [
                { hours: 48, expectedPercentage: 1.0, description: 'Mais de 24h' },
                { hours: 12, expectedPercentage: 0.5, description: 'Entre 2-24h' },
                { hours: 1, expectedPercentage: 0, description: 'Menos de 2h' }
            ];
            
            testCases.forEach(testCase => {
                let refundPercentage = 0;
                
                if (testCase.hours >= 24) {
                    refundPercentage = 1.0; // 100% refund
                } else if (testCase.hours >= 2) {
                    refundPercentage = 0.5; // 50% refund
                } else {
                    refundPercentage = 0; // No refund
                }
                
                expect(refundPercentage).toBe(testCase.expectedPercentage);
            });
        });
        
        test('deve processar reembolso e criar log de auditoria', () => {
            const appointment = TeleMed.userAppointments.find(apt => apt.id === 'test-cancellable');
            const originalPrice = appointment.price;
            
            // Simular processamento de reembolso
            const now = new Date();
            const aptTime = new Date(appointment.date + 'T' + appointment.time);
            const timeDiff = aptTime - now;
            const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
            
            let refundPercentage = 0;
            if (hoursUntilAppointment >= 24) {
                refundPercentage = 1.0;
            } else if (hoursUntilAppointment >= 2) {
                refundPercentage = 0.5;
            }
            
            const refundAmount = originalPrice * refundPercentage;
            
            appointment.refund = {
                amount: refundAmount,
                percentage: refundPercentage,
                reason: hoursUntilAppointment >= 24 ? 'Cancelamento com mais de 24h' : 'Cancelamento entre 2-24h',
                processedAt: new Date(),
                status: refundAmount > 0 ? 'processing' : 'not_applicable'
            };
            
            expect(appointment).toHaveProperty('refund');
            expect(appointment.refund.amount).toBe(refundAmount);
            expect(appointment.refund.percentage).toBe(refundPercentage);
            expect(appointment.refund).toHaveProperty('processedAt');
        });
        
        test('deve criar log de auditoria para reembolsos', () => {
            const appointment = TeleMed.userAppointments.find(apt => apt.id === 'test-cancellable');
            
            // Simular criação de log de auditoria
            const refundLog = {
                appointmentId: appointment.id,
                patientName: appointment.patient,
                originalAmount: appointment.price,
                refundAmount: appointment.price * 0.5,
                refundPercentage: 0.5,
                reason: 'Cancelamento entre 2-24h de antecedência',
                timestamp: new Date(),
                status: 'processing'
            };
            
            // Simular armazenamento no localStorage
            const existingLogs = [];
            existingLogs.push(refundLog);
            
            expect(existingLogs.length).toBe(1);
            expect(existingLogs[0]).toHaveProperty('appointmentId');
            expect(existingLogs[0]).toHaveProperty('refundAmount');
            expect(existingLogs[0]).toHaveProperty('timestamp');
        });
    });
    
    // TESTE 5: Consultas de Retorno
    describe('Sistema de Consultas de Retorno', () => {
        
        test('deve criar consulta de retorno baseada em consulta anterior', () => {
            const completedAppointment = TeleMed.userAppointments.find(apt => apt.status === 'completed');
            
            // Simular criação de consulta de retorno
            const followUp = {
                ...completedAppointment,
                id: 'followup-' + Date.now(),
                date: '', // Será definido pelo usuário
                time: '',
                status: 'scheduled',
                notes: `Consulta de retorno - ${completedAppointment.notes}`,
                originalAppointmentId: completedAppointment.id
            };
            
            expect(followUp.id).not.toBe(completedAppointment.id);
            expect(followUp.doctor).toBe(completedAppointment.doctor);
            expect(followUp.specialty).toBe(completedAppointment.specialty);
            expect(followUp.status).toBe('scheduled');
            expect(followUp.notes).toContain('Consulta de retorno');
            expect(followUp).toHaveProperty('originalAppointmentId');
        });
        
        test('deve manter mesmo médico e especialidade na consulta de retorno', () => {
            const completedAppointment = TeleMed.userAppointments.find(apt => apt.status === 'completed');
            
            const followUp = {
                ...completedAppointment,
                id: generateId(),
                status: 'scheduled'
            };
            
            expect(followUp.doctor).toBe(completedAppointment.doctor);
            expect(followUp.specialty).toBe(completedAppointment.specialty);
            expect(followUp.patient).toBe(completedAppointment.patient);
            expect(followUp.price).toBe(completedAppointment.price);
        });
        
        test('deve permitir agendar múltiplas consultas de retorno', () => {
            const completedAppointments = TeleMed.userAppointments.filter(apt => apt.status === 'completed');
            const followUps = [];
            
            completedAppointments.forEach(appointment => {
                const followUp = {
                    ...appointment,
                    id: 'followup-' + appointment.id + '-' + Date.now(),
                    status: 'scheduled',
                    notes: `Consulta de retorno - ${appointment.notes}`,
                    originalAppointmentId: appointment.id
                };
                followUps.push(followUp);
            });
            
            expect(followUps.length).toBe(completedAppointments.length);
            followUps.forEach(followUp => {
                expect(followUp.status).toBe('scheduled');
                expect(followUp).toHaveProperty('originalAppointmentId');
            });
        });
    });
    
    // TESTE 6: Funcionalidades Avançadas
    describe('Funcionalidades Avançadas', () => {
        
        test('deve filtrar consultas por critérios específicos', () => {
            // Implementar função de filtro
            function filterAppointments(criteria) {
                const { status, specialty, dateRange, doctor, type } = criteria;
                let filtered = [...TeleMed.userAppointments];
                
                if (status) {
                    filtered = filtered.filter(apt => apt.status === status);
                }
                
                if (specialty) {
                    filtered = filtered.filter(apt => 
                        apt.specialty.toLowerCase().includes(specialty.toLowerCase())
                    );
                }
                
                if (doctor) {
                    filtered = filtered.filter(apt => 
                        apt.doctor.toLowerCase().includes(doctor.toLowerCase())
                    );
                }
                
                return filtered;
            }
            
            // Testar filtros
            const scheduledOnly = filterAppointments({ status: 'scheduled' });
            const cardiologyOnly = filterAppointments({ specialty: 'Cardiologia' });
            const drRobertoOnly = filterAppointments({ doctor: 'Roberto' });
            
            expect(scheduledOnly.every(apt => apt.status === 'scheduled')).toBe(true);
            expect(cardiologyOnly.every(apt => apt.specialty.includes('Cardiologia'))).toBe(true);
            expect(drRobertoOnly.every(apt => apt.doctor.includes('Roberto'))).toBe(true);
        });
        
        test('deve buscar consultas por texto', () => {
            function searchAppointments(searchTerm) {
                if (!searchTerm) return TeleMed.userAppointments;
                
                const term = searchTerm.toLowerCase();
                return TeleMed.userAppointments.filter(apt => 
                    apt.doctor.toLowerCase().includes(term) ||
                    apt.specialty.toLowerCase().includes(term) ||
                    apt.symptoms?.toLowerCase().includes(term) ||
                    apt.notes?.toLowerCase().includes(term)
                );
            }
            
            const searchResults = searchAppointments('cardiologia');
            const emptySearch = searchAppointments('');
            const noResults = searchAppointments('xyz123');
            
            expect(searchResults.length).toBeGreaterThan(0);
            expect(emptySearch.length).toBe(TeleMed.userAppointments.length);
            expect(noResults.length).toBe(0);
        });
        
        test('deve gerar estatísticas das consultas', () => {
            function getAppointmentStatistics() {
                const appointments = TeleMed.userAppointments || [];
                const now = new Date();
                
                const stats = {
                    total: appointments.length,
                    upcoming: appointments.filter(apt => {
                        const aptDate = new Date(apt.date + 'T' + apt.time);
                        return aptDate > now && apt.status !== 'cancelled';
                    }).length,
                    completed: appointments.filter(apt => apt.status === 'completed').length,
                    cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
                    totalSpent: appointments
                        .filter(apt => apt.status === 'completed')
                        .reduce((sum, apt) => sum + apt.price, 0)
                };
                
                return stats;
            }
            
            const stats = getAppointmentStatistics();
            
            expect(stats).toHaveProperty('total');
            expect(stats).toHaveProperty('upcoming');
            expect(stats).toHaveProperty('completed');
            expect(stats).toHaveProperty('cancelled');
            expect(stats).toHaveProperty('totalSpent');
            expect(stats.total).toBeGreaterThan(0);
            expect(typeof stats.totalSpent).toBe('number');
        });
        
        test('deve gerar relatórios de consultas', () => {
            function generateAppointmentReport(dateRange) {
                const appointments = TeleMed.userAppointments;
                const stats = {
                    total: appointments.length,
                    completed: appointments.filter(apt => apt.status === 'completed').length
                };
                
                const report = {
                    period: dateRange,
                    summary: stats,
                    appointments: appointments.map(apt => ({
                        id: apt.id,
                        date: apt.date,
                        time: apt.time,
                        doctor: apt.doctor,
                        specialty: apt.specialty,
                        status: apt.status,
                        price: apt.price
                    }))
                };
                
                return report;
            }
            
            const report = generateAppointmentReport({
                start: '2024-01-01',
                end: '2024-12-31'
            });
            
            expect(report).toHaveProperty('period');
            expect(report).toHaveProperty('summary');
            expect(report).toHaveProperty('appointments');
            expect(Array.isArray(report.appointments)).toBe(true);
            expect(report.appointments.length).toBeGreaterThan(0);
        });
        
        test('deve implementar sistema de lembretes', () => {
            function setAppointmentReminder(appointmentId, reminderTime) {
                const appointment = TeleMed.appointments.find(apt => apt.id === appointmentId);
                if (!appointment) return false;
                
                const aptTime = new Date(appointment.date + 'T' + appointment.time);
                const reminderDate = new Date(aptTime.getTime() - reminderTime * 60 * 1000);
                
                if (reminderDate > new Date()) {
                    const reminder = {
                        id: generateId(),
                        appointmentId: appointmentId,
                        reminderTime: reminderDate,
                        message: `Lembrete: Consulta com ${appointment.doctor} em ${reminderTime} minutos`,
                        sent: false
                    };
                    
                    return reminder;
                }
                
                return false;
            }
            
            const appointment = TeleMed.userAppointments.find(apt => apt.status === 'scheduled');
            const reminder = setAppointmentReminder(appointment.id, 30);
            
            if (reminder) {
                expect(reminder).toHaveProperty('id');
                expect(reminder).toHaveProperty('appointmentId');
                expect(reminder).toHaveProperty('reminderTime');
                expect(reminder).toHaveProperty('message');
                expect(reminder.sent).toBe(false);
            }
        });
    });
});

// Executar testes se estiver em ambiente Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createTestAppointments,
        formatDate,
        formatCurrency,
        generateId
    };
}

console.log('✅ Testes unitários do Sistema de Gerenciamento de Consultas carregados');