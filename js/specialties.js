// TeleMed - Gerenciamento de Especialidades Médicas

/**
 * DADOS DAS ESPECIALIDADES MÉDICAS
 * Array com todas as especialidades disponíveis na plataforma, incluindo:
 * - Informações básicas (nome, descrição, ícone)
 * - Dados comerciais (preço, tempo de espera)
 * - Avaliações e estatísticas
 * - Lista de médicos disponíveis
 * - Recursos incluídos na consulta
 */
const MEDICAL_SPECIALTIES = [
    {
        id: 1,
        name: 'Cardiologia',
        description: 'Cuidados com o coração e sistema cardiovascular',
        icon: '❤️',
        price: 89.90,
        priceFormatted: 'R$ 89,90',
        waitTime: '~8 min',
        doctorsOnline: 6,
        rating: 4.9,
        reviews: 1200,
        reviewsFormatted: '1.2k avaliações',
        className: 'specialty-cardiologia',
        features: [
            'Consulta por videochamada HD',
            'Eletrocardiograma remoto',
            'Monitoramento cardíaco',
            'Prescrição digital',
            'Acompanhamento contínuo'
        ],
        doctors: [
            {
                id: 1,
                name: 'Dr. Roberto Santos',
                crm: '12345-SP',
                experience: '15 anos',
                rating: 4.9,
                consultations: 1250,
                availability: 'online'
            },
            {
                id: 2,
                name: 'Dr. Ana Cardoso',
                crm: '23456-SP',
                experience: '12 anos',
                rating: 4.8,
                consultations: 980,
                availability: 'busy'
            }
        ]
    },
    {
        id: 2,
        name: 'Pediatria',
        description: 'Cuidados médicos para crianças e adolescentes',
        icon: '👶',
        price: 79.90,
        priceFormatted: 'R$ 79,90',
        waitTime: '~5 min',
        doctorsOnline: 4,
        rating: 4.8,
        reviews: 890,
        reviewsFormatted: '890 avaliações',
        className: 'specialty-pediatria',
        features: [
            'Consulta especializada infantil',
            'Acompanhamento do crescimento',
            'Orientação para pais',
            'Vacinação e prevenção',
            'Emergências pediátricas'
        ],
        doctors: [
            {
                id: 3,
                name: 'Dra. Maria Fernanda',
                crm: '34567-RJ',
                experience: '10 anos',
                rating: 4.9,
                consultations: 1120,
                availability: 'online'
            }
        ]
    },
    {
        id: 3,
        name: 'Dermatologia',
        description: 'Cuidados com a pele, cabelos e unhas',
        icon: '🧴',
        price: 99.90,
        priceFormatted: 'R$ 99,90',
        waitTime: '~15 min',
        doctorsOnline: 3,
        rating: 4.7,
        reviews: 654,
        reviewsFormatted: '654 avaliações',
        className: 'specialty-dermatologia',
        features: [
            'Análise dermatológica',
            'Diagnóstico por imagem',
            'Tratamento de acne',
            'Prevenção de câncer de pele',
            'Cuidados estéticos'
        ],
        doctors: [
            {
                id: 4,
                name: 'Dr. Carlos Oliveira',
                crm: '45678-MG',
                experience: '18 anos',
                rating: 4.7,
                consultations: 1450,
                availability: 'online'
            }
        ]
    },
    {
        id: 4,
        name: 'Psiquiatria',
        description: 'Saúde mental e transtornos psiquiátricos',
        icon: '🧠',
        price: 129.90,
        priceFormatted: 'R$ 129,90',
        waitTime: '~20 min',
        doctorsOnline: 5,
        rating: 4.9,
        reviews: 2100,
        reviewsFormatted: '2.1k avaliações',
        className: 'specialty-psiquiatria',
        features: [
            'Consulta psiquiátrica',
            'Avaliação de ansiedade',
            'Tratamento de depressão',
            'Terapia medicamentosa',
            'Acompanhamento psicológico'
        ],
        doctors: [
            {
                id: 5,
                name: 'Dr. Paulo Mendes',
                crm: '56789-RS',
                experience: '20 anos',
                rating: 4.9,
                consultations: 2300,
                availability: 'online'
            }
        ]
    },
    {
        id: 5,
        name: 'Ginecologia',
        description: 'Saúde da mulher e sistema reprodutivo',
        icon: '👩‍⚕️',
        price: 89.90,
        priceFormatted: 'R$ 89,90',
        waitTime: '~12 min',
        doctorsOnline: 7,
        rating: 4.8,
        reviews: 1500,
        reviewsFormatted: '1.5k avaliações',
        className: 'specialty-ginecologia',
        features: [
            'Consulta ginecológica',
            'Prevenção de doenças',
            'Saúde reprodutiva',
            'Acompanhamento pré-natal',
            'Orientação contraceptiva'
        ],
        doctors: [
            {
                id: 6,
                name: 'Dra. Lucia Santos',
                crm: '67890-PR',
                experience: '16 anos',
                rating: 4.8,
                consultations: 1800,
                availability: 'online'
            }
        ]
    },
    {
        id: 6,
        name: 'Neurologia',
        description: 'Sistema nervoso e transtornos neurológicos',
        icon: '🧬',
        price: 139.90,
        priceFormatted: 'R$ 139,90',
        waitTime: '~25 min',
        doctorsOnline: 2,
        rating: 4.6,
        reviews: 432,
        reviewsFormatted: '432 avaliações',
        className: 'specialty-neurologia',
        features: [
            'Consulta neurológica',
            'Avaliação de dores de cabeça',
            'Diagnóstico de epilepsia',
            'Tratamento de enxaqueca',
            'Acompanhamento neurológico'
        ],
        doctors: [
            {
                id: 7,
                name: 'Dr. André Costa',
                crm: '78901-BA',
                experience: '22 anos',
                rating: 4.6,
                consultations: 1650,
                availability: 'busy'
            }
        ]
    },
    {
        id: 7,
        name: 'Ortopedia',
        description: 'Ossos, articulações e sistema músculo-esquelético',
        icon: '🦴',
        price: 109.90,
        priceFormatted: 'R$ 109,90',
        waitTime: '~10 min',
        doctorsOnline: 4,
        rating: 4.5,
        reviews: 789,
        reviewsFormatted: '789 avaliações',
        className: 'specialty-ortopedia',
        features: [
            'Consulta ortopédica',
            'Avaliação de fraturas',
            'Tratamento de lesões',
            'Reabilitação física',
            'Prevenção de lesões'
        ],
        doctors: [
            {
                id: 8,
                name: 'Dr. Ricardo Lima',
                crm: '89012-SC',
                experience: '14 anos',
                rating: 4.5,
                consultations: 1100,
                availability: 'online'
            }
        ]
    },
    {
        id: 8,
        name: 'Endocrinologia',
        description: 'Hormônios, metabolismo e glândulas endócrinas',
        icon: '⚗️',
        price: 119.90,
        priceFormatted: 'R$ 119,90',
        waitTime: '~18 min',
        doctorsOnline: 3,
        rating: 4.7,
        reviews: 567,
        reviewsFormatted: '567 avaliações',
        className: 'specialty-endocrinologia',
        features: [
            'Consulta endocrinológica',
            'Tratamento de diabetes',
            'Controle hormonal',
            'Tratamento de tireoide',
            'Acompanhamento metabólico'
        ],
        doctors: [
            {
                id: 9,
                name: 'Dra. Fernanda Reis',
                crm: '90123-GO',
                experience: '11 anos',
                rating: 4.7,
                consultations: 890,
                availability: 'online'
            }
        ]
    }
];

/**
 * FUNÇÕES DE GERENCIAMENTO DE ESPECIALIDADES
 * Conjunto de funções para carregar, exibir e gerenciar especialidades médicas
 */

/**
 * CARREGAR DADOS DAS ESPECIALIDADES
 * Carrega o array de especialidades médicas no estado global da aplicação
 */
function loadSpecialtiesData() {
    TeleMed.specialties = MEDICAL_SPECIALTIES;
    console.log('📋 Specialties data loaded:', MEDICAL_SPECIALTIES.length, 'specialties');
}

/**
 * RENDERIZAR ESPECIALIDADES
 * Cria e exibe os cards das especialidades médicas na interface
 * @param {Array} specialtiesToRender - Array de especialidades para renderizar (opcional)
 */
function renderSpecialties(specialtiesToRender = null) {
    const grid = document.getElementById('specialtiesGrid');
    if (!grid) return;

    grid.innerHTML = specialties.map(specialty => `
        <div class="specialty-card-pro specialty-enhanced zoom glow scroll-element stagger-item"
             onclick="openSpecialtyModal('${specialty.id}')">
            <div class="specialty-icon float">${specialty.icon}</div>
            <h3 class="text-xl font-bold mb-2 sliding-underline">${specialty.name}</h3>
            <!-- resto do conteúdo -->
        </div>
    `).join('');
    
    // Ativar animações stagger
    const cards = document.querySelectorAll('.stagger-item');
    window.staggerAnimation(cards, 100);
    
    // Usa especialidades fornecidas ou carrega do estado global/dados padrão
    const specialties = specialtiesToRender || TeleMed.specialties || MEDICAL_SPECIALTIES;
    
    grid.innerHTML = specialties.map(specialty => {
        return `
            <div class="specialty-card ${specialty.className} rounded-xl p-6 text-white cursor-pointer shadow-lg"
                 onclick="openSpecialtyModal('${specialty.id}')"
                 data-name="${specialty.name}"
                 data-description="${specialty.description}">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="text-xl font-bold mb-2">${specialty.name}</h3>
                        <p class="text-sm opacity-90">${specialty.description}</p>
                    </div>
                    <div class="text-5xl opacity-80 ml-4">${specialty.icon}</div>
                </div>
                
                <div class="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-bold mb-3 inline-block">
                    ⏰ ${specialty.waitTime} de espera
                </div>
                
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-2 h-2 bg-green-400 rounded-full pulse-dot"></div>
                    <span class="text-sm">${specialty.doctorsOnline} médicos online</span>
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-sm">
                        <span class="text-yellow-300">${'★'.repeat(Math.floor(specialty.rating))}</span>
                        <span>${specialty.rating} (${specialty.reviewsFormatted})</span>
                    </div>
                    <div class="text-lg font-bold">${specialty.priceFormatted}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add animation to cards
    animateSpecialtyCards();
}

// Animate Specialty Cards
function animateSpecialtyCards() {
    const cards = document.querySelectorAll('.specialty-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Search Specialties
function searchSpecialties(query) {
    if (!query.trim()) {
        renderSpecialties();
        return;
    }
    
    const filteredSpecialties = MEDICAL_SPECIALTIES.filter(specialty => 
        specialty.name.toLowerCase().includes(query.toLowerCase()) ||
        specialty.description.toLowerCase().includes(query.toLowerCase())
    );
    
    renderSpecialties(filteredSpecialties);
    
    // Show no results message if needed
    if (filteredSpecialties.length === 0) {
        showNoResultsMessage(query);
    }
}

// Show No Results Message
function showNoResultsMessage(query) {
    const grid = document.getElementById('specialtiesGrid');
    if (!grid) return;
    
    grid.innerHTML = `
        <div class="col-span-full text-center py-12">
            <div class="text-6xl mb-4">🔍</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Nenhuma especialidade encontrada</h3>
            <p class="text-gray-600 mb-4">Não encontramos resultados para "${query}"</p>
            <button onclick="clearSearch()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Limpar busca
            </button>
        </div>
    `;
}

// Clear Search
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    renderSpecialties();
}

// Open Specialty Modal
function openSpecialtyModal(specialtyId) {
    const specialty = MEDICAL_SPECIALTIES.find(s => s.id == specialtyId);
    if (!specialty) return;
    
    // Store selected specialty
    TeleMed.selectedSpecialty = specialty;
    
    // Update modal content
    updateSpecialtyModal(specialty);
    
    // Show modal
    document.getElementById('specialtyModal').classList.remove('hidden');
}

// Update Specialty Modal
function updateSpecialtyModal(specialty) {
    // Update basic info
    document.getElementById('modalTitle').textContent = specialty.name;
    document.getElementById('modalIcon').textContent = specialty.icon;
    document.getElementById('modalPrice').textContent = specialty.priceFormatted;
    document.getElementById('modalDescription').textContent = specialty.description;
    
    // Update features list
    const modalBody = document.querySelector('#specialtyModal .modal-body');
    const featuresHtml = `
        <div class="text-center mb-6">
            <div class="text-6xl mb-4">${specialty.icon}</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">${specialty.name}</h3>
            <div class="text-3xl font-bold text-green-600 mb-2">${specialty.priceFormatted}</div>
            <div class="text-gray-600">${specialty.description}</div>
        </div>
        
        <div class="mb-6">
            <h4 class="font-bold text-gray-900 mb-3">✅ Serviços incluídos:</h4>
            <div class="space-y-2">
                ${specialty.features.map(feature => `
                    <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span class="text-sm text-gray-600">${feature}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="mb-6">
            <h4 class="font-bold text-gray-900 mb-3">👨‍⚕️ Médicos disponíveis:</h4>
            <div class="space-y-2">
                ${specialty.doctors.map(doctor => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <div class="font-semibold text-gray-900">${doctor.name}</div>
                            <div class="text-sm text-gray-600">${doctor.crm} • ${doctor.experience}</div>
                        </div>
                        <div class="text-right">
                            <div class="flex items-center space-x-1">
                                <span class="text-yellow-500">★</span>
                                <span class="text-sm font-semibold">${doctor.rating}</span>
                            </div>
                            <div class="text-xs text-gray-500">${doctor.consultations} consultas</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="space-y-3">
            <button onclick="scheduleAppointment()" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                📅 Agendar Consulta
            </button>
            <button onclick="startImmediateConsultation()" class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold">
                🔴 Consulta Imediata
            </button>
        </div>
    `;
    
    modalBody.innerHTML = featuresHtml;
}

// Schedule Appointment
function scheduleAppointment() {
    if (!TeleMed.selectedSpecialty) return;
    
    // Close specialty modal
    closeModal('specialtyModal');
    
    // Open appointment scheduling
    openAppointmentScheduling();
}

// Start Immediate Consultation
function startImmediateConsultation() {
    if (!TeleMed.selectedSpecialty) return;
    
    // Close specialty modal
    closeModal('specialtyModal');
    
    // Open payment modal
    openPaymentModal();
}

// Open Appointment Scheduling
function openAppointmentScheduling() {
    // This would open a calendar/scheduling interface
    showNotification('Agendamento', 'Abrindo calendário para agendamento...', 'info');
    
    // Simulate appointment scheduling
    setTimeout(() => {
        const appointment = {
            id: generateId(),
            specialty: TeleMed.selectedSpecialty.name,
            doctor: TeleMed.selectedSpecialty.doctors[0].name,
            date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            time: '14:00',
            price: TeleMed.selectedSpecialty.price,
            status: 'scheduled'
        };
        
        // Add to user appointments
        if (!TeleMed.userAppointments) {
            TeleMed.userAppointments = [];
        }
        TeleMed.userAppointments.push(appointment);
        
        showNotification('Agendamento confirmado!', 
            `Consulta de ${appointment.specialty} agendada para ${formatDate(appointment.date)} às ${appointment.time}`, 
            'success'
        );
    }, 2000);
}

// Open Payment Modal
function openPaymentModal() {
    if (!TeleMed.selectedSpecialty) return;
    
    // Update payment amount
    document.getElementById('paymentAmount').textContent = TeleMed.selectedSpecialty.priceFormatted;
    
    // Show payment modal
    document.getElementById('paymentModal').classList.remove('hidden');
}

// Get Specialty by ID
function getSpecialtyById(id) {
    return MEDICAL_SPECIALTIES.find(s => s.id == id);
}

// Get Specialties by Category
function getSpecialtiesByCategory(category) {
    // This could be expanded to include categories
    return MEDICAL_SPECIALTIES;
}

// Get Available Doctors
function getAvailableDoctors(specialtyId) {
    const specialty = getSpecialtyById(specialtyId);
    if (!specialty) return [];
    
    return specialty.doctors.filter(doctor => doctor.availability === 'online');
}

// Update Specialty Availability
function updateSpecialtyAvailability() {
    MEDICAL_SPECIALTIES.forEach(specialty => {
        // Simulate real-time updates
        specialty.doctorsOnline = Math.max(1, specialty.doctorsOnline + Math.floor(Math.random() * 3) - 1);
        specialty.waitTime = `~${Math.floor(Math.random() * 20) + 5} min`;
        
        // Update doctors availability
        specialty.doctors.forEach(doctor => {
            if (Math.random() < 0.1) { // 10% chance of status change
                doctor.availability = doctor.availability === 'online' ? 'busy' : 'online';
            }
        });
    });
    
    // Re-render if on specialties section
    if (TeleMed.currentSection === 'specialties') {
        renderSpecialties();
    }
}

// Start real-time updates
setInterval(updateSpecialtyAvailability, 30000); // Update every 30 seconds

// Export functions
window.renderSpecialties = renderSpecialties;
window.searchSpecialties = searchSpecialties;
window.openSpecialtyModal = openSpecialtyModal;
window.scheduleAppointment = scheduleAppointment;
window.startImmediateConsultation = startImmediateConsultation;
window.clearSearch = clearSearch;
window.getSpecialtyById = getSpecialtyById;
window.getAvailableDoctors = getAvailableDoctors;

console.log('✅ TeleMed Specialties System Loaded');