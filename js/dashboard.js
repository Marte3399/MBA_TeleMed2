// TeleMed - Sistema de Dashboard

/**
 * CONFIGURAÇÃO DO DASHBOARD
 * Define parâmetros visuais e comportamentais do painel de controle
 */
const DASHBOARD_CONFIG = {
    refreshInterval: 30000,     // Intervalo de atualização automática (30 segundos)
    chartColors: {              // Paleta de cores para gráficos e elementos visuais
        primary: '#3b82f6',     // Azul principal
        secondary: '#10b981',   // Verde secundário
        tertiary: '#f59e0b',    // Amarelo terciário
        quaternary: '#ef4444',  // Vermelho quaternário
        gradient: ['#667eea', '#764ba2']  // Gradiente para fundos
    },
    animations: {               // Configurações de animação
        duration: 1000,         // Duração das animações (ms)
        easing: 'easeInOutQuart' // Tipo de easing para suavidade
    }
};

/**
 * ESTADO DO DASHBOARD
 * Armazena todas as informações do estado atual do painel de controle
 */
let dashboardState = {
    charts: {},                 // Referências para os gráficos Chart.js criados
    data: {                     // Dados para exibição no dashboard
        consultations: [],      // Dados de consultas por mês
        revenue: [],            // Dados de receita por mês
        specialties: [],        // Dados de especialidades mais procuradas
        patients: [],           // Dados de pacientes
        appointments: []        // Dados de agendamentos
    },
    refreshTimer: null          // Timer para atualização automática dos dados
};

// Sample Dashboard Data
const SAMPLE_DASHBOARD_DATA = {
    consultations: [
        { month: 'Jan', count: 120 },
        { month: 'Fev', count: 145 },
        { month: 'Mar', count: 167 },
        { month: 'Abr', count: 189 },
        { month: 'Mai', count: 145 },
        { month: 'Jun', count: 167 },
        { month: 'Jul', count: 189 }
    ],
    specialties: [
        { name: 'Cardiologia', count: 234 },
        { name: 'Pediatria', count: 189 },
        { name: 'Dermatologia', count: 167 },
        { name: 'Psiquiatria', count: 145 },
        { name: 'Ginecologia', count: 123 },
        { name: 'Neurologia', count: 101 },
        { name: 'Ortopedia', count: 89 },
        { name: 'Endocrinologia', count: 67 }
    ],
    revenue: [
        { month: 'Jan', amount: 45000 },
        { month: 'Fev', amount: 52000 },
        { month: 'Mar', amount: 48000 },
        { month: 'Abr', amount: 61000 },
        { month: 'Mai', amount: 55000 },
        { month: 'Jun', amount: 67000 },
        { month: 'Jul', amount: 72000 }
    ],
    satisfaction: [4.8, 4.7, 4.9, 4.8, 4.9, 4.8, 4.9, 4.8]
};

// Initialize Dashboard
function initializeDashboard() {
    loadDashboardData();
    setupDashboardRefresh();
    console.log('📊 Dashboard system initialized');
}

// Load Dashboard Data
function loadDashboardData() {
    // Load data from localStorage or use sample data
    const stored = localStorage.getItem('telemed-dashboard-data');
    if (stored) {
        try {
            dashboardState.data = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading dashboard data:', e);
            dashboardState.data = { ...SAMPLE_DASHBOARD_DATA };
        }
    } else {
        dashboardState.data = { ...SAMPLE_DASHBOARD_DATA };
    }
}

// Save Dashboard Data
function saveDashboardData() {
    localStorage.setItem('telemed-dashboard-data', JSON.stringify(dashboardState.data));
}

// Update Dashboard Data
function updateDashboardData() {
    if (TeleMed.currentSection !== 'dashboard') return;
    
    // Update cards
    updateDashboardCards();
    
    // Update charts if they exist
    updateDashboardCharts();
}

// Update Dashboard Cards
function updateDashboardCards() {
    const cards = {
        consultationsRealized: calculateConsultationsRealized(),
        upcomingAppointments: calculateUpcomingAppointments(),
        activePrescriptions: calculateActivePrescriptions(),
        totalRevenue: calculateTotalRevenue()
    };
    
    // Update card values with animation
    animateCardValue('consultationsRealized', cards.consultationsRealized);
    animateCardValue('upcomingAppointments', cards.upcomingAppointments);
    animateCardValue('activePrescriptions', cards.activePrescriptions);
    animateCardValue('totalRevenue', cards.totalRevenue, 'currency');
}

// Calculate Dashboard Metrics
function calculateConsultationsRealized() {
    if (!TeleMed.appointments) return 24;
    
    return TeleMed.appointments.filter(apt => 
        apt.status === 'completed' && 
        apt.patient === TeleMed.currentUser?.name
    ).length || 24;
}

function calculateUpcomingAppointments() {
    if (!TeleMed.appointments) return 3;
    
    const now = new Date();
    return TeleMed.appointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T' + apt.time);
        return aptDate > now && 
               apt.status === 'scheduled' && 
               apt.patient === TeleMed.currentUser?.name;
    }).length || 3;
}

function calculateActivePrescriptions() {
    // This would be calculated from actual prescription data
    return 5;
}

function calculateTotalRevenue() {
    if (!TeleMed.paymentHistory) return 1250.50;
    
    return TeleMed.paymentHistory
        .filter(payment => payment.user?.name === TeleMed.currentUser?.name)
        .reduce((total, payment) => total + payment.finalAmount, 0) || 1250.50;
}

// Animate Card Value
function animateCardValue(elementId, targetValue, type = 'number') {
    const element = document.querySelector(`[data-card="${elementId}"]`);
    if (!element) return;
    
    const startValue = parseInt(element.textContent) || 0;
    const increment = (targetValue - startValue) / 30;
    let currentValue = startValue;
    
    const timer = setInterval(() => {
        currentValue += increment;
        
        if (Math.abs(currentValue - targetValue) < Math.abs(increment)) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        
        let displayValue = Math.floor(currentValue);
        
        if (type === 'currency') {
            displayValue = formatCurrency(displayValue);
        }
        
        element.textContent = displayValue;
    }, 50);
}

// Render Dashboard Charts
function renderDashboardCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded, using fallback charts');
        renderFallbackCharts();
        return;
    }
    
    renderConsultationsChart();
    renderSpecialtiesChart();
    
    // Store charts reference
    window.dashboardCharts = dashboardState.charts;
}

// Render Consultations Chart
function renderConsultationsChart() {
    const ctx = document.getElementById('consultationsChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (dashboardState.charts.consultations) {
        dashboardState.charts.consultations.destroy();
    }
    
    dashboardState.charts.consultations = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dashboardState.data.consultations.map(item => item.month),
            datasets: [{
                label: 'Consultas',
                data: dashboardState.data.consultations.map(item => item.count),
                borderColor: DASHBOARD_CONFIG.chartColors.primary,
                backgroundColor: DASHBOARD_CONFIG.chartColors.primary + '20',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: DASHBOARD_CONFIG.chartColors.primary,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: DASHBOARD_CONFIG.chartColors.primary,
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                }
            },
            animation: {
                duration: DASHBOARD_CONFIG.animations.duration,
                easing: DASHBOARD_CONFIG.animations.easing
            }
        }
    });
}

// Render Specialties Chart
function renderSpecialtiesChart() {
    const ctx = document.getElementById('specialtiesChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (dashboardState.charts.specialties) {
        dashboardState.charts.specialties.destroy();
    }
    
    const colors = [
        '#dc2626', '#16a34a', '#ea580c', '#9333ea',
        '#2563eb', '#78716c', '#475569', '#dc2626'
    ];
    
    dashboardState.charts.specialties = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: dashboardState.data.specialties.map(item => item.name),
            datasets: [{
                data: dashboardState.data.specialties.map(item => item.count),
                backgroundColor: colors,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        color: '#6b7280'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                duration: DASHBOARD_CONFIG.animations.duration,
                easing: DASHBOARD_CONFIG.animations.easing
            }
        }
    });
}

// Render Fallback Charts
function renderFallbackCharts() {
    const consultationsChart = document.getElementById('consultationsChart');
    const specialtiesChart = document.getElementById('specialtiesChart');
    
    if (consultationsChart) {
        consultationsChart.innerHTML = `
            <div class="flex items-center justify-center h-full text-gray-500">
                <div class="text-center">
                    <div class="text-4xl mb-2">📊</div>
                    <div class="text-sm">Gráfico de Consultas</div>
                    <div class="text-xs">Chart.js não carregado</div>
                </div>
            </div>
        `;
    }
    
    if (specialtiesChart) {
        specialtiesChart.innerHTML = `
            <div class="flex items-center justify-center h-full text-gray-500">
                <div class="text-center">
                    <div class="text-4xl mb-2">🍩</div>
                    <div class="text-sm">Especialidades</div>
                    <div class="text-xs">Chart.js não carregado</div>
                </div>
            </div>
        `;
    }
}

// Update Dashboard Charts
function updateDashboardCharts() {
    if (dashboardState.charts.consultations) {
        dashboardState.charts.consultations.data.datasets[0].data = 
            dashboardState.data.consultations.map(item => item.count);
        dashboardState.charts.consultations.update('none');
    }
    
    if (dashboardState.charts.specialties) {
        dashboardState.charts.specialties.data.datasets[0].data = 
            dashboardState.data.specialties.map(item => item.count);
        dashboardState.charts.specialties.update('none');
    }
}

// Setup Dashboard Refresh
function setupDashboardRefresh() {
    dashboardState.refreshTimer = setInterval(() => {
        if (TeleMed.currentSection === 'dashboard') {
            updateDashboardData();
            simulateDataChanges();
        }
    }, DASHBOARD_CONFIG.refreshInterval);
}

// Simulate Data Changes
function simulateDataChanges() {
    // Simulate small changes in data for demo purposes
    dashboardState.data.consultations.forEach(item => {
        const change = Math.floor(Math.random() * 6) - 3; // -3 to +3
        item.count = Math.max(0, item.count + change);
    });
    
    dashboardState.data.specialties.forEach(item => {
        const change = Math.floor(Math.random() * 4) - 2; // -2 to +2
        item.count = Math.max(0, item.count + change);
    });
    
    saveDashboardData();
}

// Export Dashboard Data
function exportDashboardData() {
    const exportData = {
        user: TeleMed.currentUser.name,
        exportDate: new Date(),
        dashboardData: dashboardState.data,
        statistics: getDashboardStatistics()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `telemed-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    showNotification('Dashboard exportado', 'Dados salvos em Downloads', 'success');
}

// Get Dashboard Statistics
function getDashboardStatistics() {
    const totalConsultations = dashboardState.data.consultations.reduce((sum, item) => sum + item.count, 0);
    const totalRevenue = dashboardState.data.revenue.reduce((sum, item) => sum + item.amount, 0);
    const averageConsultationsPerMonth = totalConsultations / dashboardState.data.consultations.length;
    const averageRevenuePerMonth = totalRevenue / dashboardState.data.revenue.length;
    
    return {
        totalConsultations,
        totalRevenue,
        averageConsultationsPerMonth: Math.round(averageConsultationsPerMonth),
        averageRevenuePerMonth: Math.round(averageRevenuePerMonth),
        mostPopularSpecialty: dashboardState.data.specialties.reduce((max, item) => 
            item.count > max.count ? item : max, dashboardState.data.specialties[0]
        )
    };
}

// Print Dashboard
function printDashboard() {
    window.print();
}

// Reset Dashboard Data
function resetDashboardData() {
    if (confirm('Tem certeza que deseja resetar todos os dados do dashboard?')) {
        dashboardState.data = { ...SAMPLE_DASHBOARD_DATA };
        saveDashboardData();
        updateDashboardData();
        renderDashboardCharts();
        showNotification('Dashboard resetado', 'Dados restaurados para valores padrão', 'success');
    }
}

// Toggle Chart Type
function toggleChartType(chartName) {
    const chart = dashboardState.charts[chartName];
    if (!chart) return;
    
    const currentType = chart.config.type;
    let newType;
    
    switch (currentType) {
        case 'line':
            newType = 'bar';
            break;
        case 'bar':
            newType = 'line';
            break;
        case 'doughnut':
            newType = 'pie';
            break;
        case 'pie':
            newType = 'doughnut';
            break;
        default:
            return;
    }
    
    chart.config.type = newType;
    chart.update();
    
    showNotification('Tipo de gráfico alterado', `Gráfico alterado para ${newType}`, 'info');
}

// Dashboard Role-specific Content
function updateDashboardByRole(role) {
    switch (role) {
        case 'patient':
            updatePatientDashboard();
            break;
        case 'doctor':
            updateDoctorDashboard();
            break;
        case 'admin':
            updateAdminDashboard();
            break;
    }
}

// Update Patient Dashboard
function updatePatientDashboard() {
    // Patient-specific dashboard content
    const patientData = {
        appointmentsCompleted: calculateConsultationsRealized(),
        upcomingAppointments: calculateUpcomingAppointments(),
        activePrescriptions: calculateActivePrescriptions(),
        totalSpent: calculateTotalRevenue()
    };
    
    updateDashboardCards();
}

// Update Doctor Dashboard
function updateDoctorDashboard() {
    // Doctor-specific dashboard content
    const doctorData = {
        patientsToday: Math.floor(Math.random() * 15) + 5,
        consultationsCompleted: Math.floor(Math.random() * 50) + 20,
        averageRating: 4.8,
        earnings: Math.floor(Math.random() * 5000) + 2000
    };
    
    // Update specific cards for doctor view
    console.log('👨‍⚕️ Doctor dashboard updated:', doctorData);
}

// Update Admin Dashboard
function updateAdminDashboard() {
    // Admin-specific dashboard content
    const adminData = {
        totalUsers: Math.floor(Math.random() * 1000) + 5000,
        activeConsultations: Math.floor(Math.random() * 50) + 100,
        totalRevenue: Math.floor(Math.random() * 50000) + 100000,
        systemHealth: 'Excellent'
    };
    
    // Update specific cards for admin view
    console.log('👨‍💼 Admin dashboard updated:', adminData);
}

// Cleanup Dashboard
function cleanupDashboard() {
    // Clear refresh timer
    if (dashboardState.refreshTimer) {
        clearInterval(dashboardState.refreshTimer);
        dashboardState.refreshTimer = null;
    }
    
    // Destroy charts
    Object.values(dashboardState.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    
    dashboardState.charts = {};
}

// Export functions
window.renderDashboardCharts = renderDashboardCharts;
window.updateDashboardData = updateDashboardData;
window.exportDashboardData = exportDashboardData;
window.printDashboard = printDashboard;
window.resetDashboardData = resetDashboardData;
window.toggleChartType = toggleChartType;
window.getDashboardStatistics = getDashboardStatistics;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    cleanupDashboard();
});

console.log('✅ TeleMed Dashboard System Loaded');