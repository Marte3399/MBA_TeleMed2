// TeleMed - Gerenciamento de Especialidades Médicas

/**
 * DADOS DAS ESPECIALIDADES MÉDICAS
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
    }
];

/**
 * FUNÇÕES DE GERENCIAMENTO DE ESPECIALIDADES
 */

async function loadSpecialtiesData() {
    // Initialize TeleMed object if it doesn't exist
    if (typeof window.TeleMed === 'undefined') {
        window.TeleMed = {};
    }

    try {
        // Try to load from database first
        const { data, error } = await supabase
            .from('specialties')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) {
            console.warn('⚠️ Database not available, using static data:', error.message);
            // Fallback to static data
            window.TeleMed.specialties = MEDICAL_SPECIALTIES;
        } else if (data && data.length > 0) {
            // Convert database format to frontend format
            const dbSpecialties = data.map(spec => ({
                id: spec.id,
                name: spec.name,
                description: spec.description,
                icon: spec.icon,
                price: parseFloat(spec.price),
                priceFormatted: `R$ ${parseFloat(spec.price).toFixed(2).replace('.', ',')}`,
                waitTime: spec.wait_time,
                doctorsOnline: Math.floor(Math.random() * 8) + 1, // Simulated
                rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Random between 3.5-5.0
                reviews: Math.floor(Math.random() * 2000) + 100,
                reviewsFormatted: `${Math.floor(Math.random() * 2000) + 100} avaliações`,
                className: `specialty-${spec.name.toLowerCase().replace(/\s+/g, '-')}`,
                features: spec.features || [],
                doctors: generateMockDoctors(spec.id) // Generate mock doctors
            }));

            window.TeleMed.specialties = dbSpecialties;
            console.log('✅ Specialties loaded from database:', dbSpecialties.length, 'specialties');
        } else {
            // No data in database, use static data
            window.TeleMed.specialties = MEDICAL_SPECIALTIES;
            console.log('📋 Using static specialties data');
        }
    } catch (error) {
        console.warn('⚠️ Error loading from database, using static data:', error);
        window.TeleMed.specialties = MEDICAL_SPECIALTIES;
    }

    console.log('📋 Specialties data loaded:', window.TeleMed.specialties.length, 'specialties');
}

// Generate mock doctors for a specialty
function generateMockDoctors(specialtyId) {
    const doctorNames = [
        'Dr. Roberto Santos', 'Dra. Ana Cardoso', 'Dr. Carlos Oliveira',
        'Dra. Maria Fernanda', 'Dr. Paulo Mendes', 'Dra. Juliana Silva',
        'Dr. Fernando Costa', 'Dra. Patricia Lima', 'Dr. Ricardo Alves'
    ];
    
    const numDoctors = Math.floor(Math.random() * 3) + 1; // 1-3 doctors
    const doctors = [];
    
    for (let i = 0; i < numDoctors; i++) {
        const randomName = doctorNames[Math.floor(Math.random() * doctorNames.length)];
        const states = ['SP', 'RJ', 'MG', 'RS', 'PR'];
        const randomState = states[Math.floor(Math.random() * states.length)];
        
        doctors.push({
            id: specialtyId * 100 + i,
            name: randomName,
            crm: `${Math.floor(Math.random() * 90000) + 10000}-${randomState}`,
            experience: `${Math.floor(Math.random() * 20) + 5} anos`,
            rating: (Math.random() * 1.5 + 3.5).toFixed(1),
            consultations: Math.floor(Math.random() * 2000) + 100,
            availability: Math.random() > 0.3 ? 'online' : (Math.random() > 0.5 ? 'busy' : 'offline')
        });
    }
    
    return doctors;
}

// Get Availability Status
function getAvailabilityStatus(specialty) {
    const onlineDoctors = specialty.doctors.filter(d => d.availability === 'online').length;
    const busyDoctors = specialty.doctors.filter(d => d.availability === 'busy').length;
    
    if (onlineDoctors > 0) return 'online';
    if (busyDoctors > 0) return 'busy';
    return 'offline';
}

// Get Availability Class
function getAvailabilityClass(status) {
    switch (status) {
        case 'online': return 'bg-green-50 text-green-700';
        case 'busy': return 'bg-yellow-50 text-yellow-700';
        case 'offline': return 'bg-red-50 text-red-700';
        default: return 'bg-gray-50 text-gray-700';
    }
}

// Get Availability Text
function getAvailabilityText(status) {
    switch (status) {
        case 'online': return 'Disponível agora';
        case 'busy': return 'Ocupado';
        case 'offline': return 'Indisponível';
        default: return 'Status desconhecido';
    }
}

/**
 * RENDERIZAR ESPECIALIDADES
 */
function renderSpecialties(specialtiesToRender = null) {
    const grid = document.getElementById('specialtiesGrid');
    if (!grid) return;

    const specialties = specialtiesToRender || TeleMed.specialties || MEDICAL_SPECIALTIES;
    
    grid.innerHTML = specialties.map(specialty => {
        const availabilityStatus = getAvailabilityStatus(specialty);
        const availabilityClass = getAvailabilityClass(availabilityStatus);
        const availabilityText = getAvailabilityText(availabilityStatus);
        
        return `
            <div class="specialty-card bg-white rounded-xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300"
                 onclick="openSpecialtyModal('${specialty.id}')"
                 data-name="${specialty.name}"
                 data-description="${specialty.description}"
                 data-specialty-id="${specialty.id}">
                
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="text-xl font-bold mb-2 text-gray-900">${specialty.name}</h3>
                        <p class="text-sm text-gray-600">${specialty.description}</p>
                    </div>
                    <div class="text-4xl ml-4">${specialty.icon}</div>
                </div>
                
                <div class="flex flex-wrap gap-2 mb-4">
                    <div class="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold">
                        ⏰ ${specialty.waitTime} de espera
                    </div>
                    <div class="${availabilityClass} rounded-full px-3 py-1 text-xs font-semibold">
                        <div class="flex items-center gap-1">
                            <div class="w-2 h-2 ${availabilityStatus === 'online' ? 'bg-green-400 animate-pulse' : availabilityStatus === 'busy' ? 'bg-yellow-400' : 'bg-red-400'} rounded-full"></div>
                            ${availabilityText}
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <span>👨‍⚕️ ${specialty.doctorsOnline} médicos online</span>
                    </div>
                    <div class="flex items-center gap-1 text-sm">
                        <span class="text-yellow-400">${'★'.repeat(Math.floor(specialty.rating))}</span>
                        <span class="text-gray-600">${specialty.rating}</span>
                        <span class="text-gray-400">(${specialty.reviewsFormatted})</span>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div class="text-2xl font-bold text-green-600">${specialty.priceFormatted}</div>
                    <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                            onclick="(function(e){e.stopPropagation(); quickConsultation('${specialty.id}');})(event)">
                        Consultar Agora
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    animateSpecialtyCards();
}

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

/**
 * SISTEMA DE BUSCA E FILTROS
 */
function searchSpecialties(query, filters = {}) {
    let filteredSpecialties = [...MEDICAL_SPECIALTIES];
    
    if (query && query.trim()) {
        const searchTerm = query.toLowerCase();
        filteredSpecialties = filteredSpecialties.filter(specialty => 
            specialty.name.toLowerCase().includes(searchTerm) ||
            specialty.description.toLowerCase().includes(searchTerm) ||
            specialty.features.some(feature => feature.toLowerCase().includes(searchTerm))
        );
    }
    
    if (filters.availability) {
        filteredSpecialties = filteredSpecialties.filter(specialty => {
            const status = getAvailabilityStatus(specialty);
            return filters.availability.includes(status);
        });
    }
    
    if (filters.sortBy) {
        filteredSpecialties = sortSpecialties(filteredSpecialties, filters.sortBy);
    }
    
    renderSpecialties(filteredSpecialties);
    
    if (filteredSpecialties.length === 0) {
        showNoResultsMessage(query);
    }
    
    updateResultsCount(filteredSpecialties.length, MEDICAL_SPECIALTIES.length);
}

function sortSpecialties(specialties, sortBy) {
    const sortedSpecialties = [...specialties];
    
    switch (sortBy) {
        case 'price-asc':
            return sortedSpecialties.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sortedSpecialties.sort((a, b) => b.price - a.price);
        case 'rating':
            return sortedSpecialties.sort((a, b) => b.rating - a.rating);
        case 'wait-time':
            return sortedSpecialties.sort((a, b) => {
                const aWait = parseInt(a.waitTime.match(/\d+/)[0]);
                const bWait = parseInt(b.waitTime.match(/\d+/)[0]);
                return aWait - bWait;
            });
        case 'name':
            return sortedSpecialties.sort((a, b) => a.name.localeCompare(b.name));
        case 'availability':
            return sortedSpecialties.sort((a, b) => {
                const statusOrder = { 'online': 0, 'busy': 1, 'offline': 2 };
                const aStatus = getAvailabilityStatus(a);
                const bStatus = getAvailabilityStatus(b);
                return statusOrder[aStatus] - statusOrder[bStatus];
            });
        default:
            return sortedSpecialties;
    }
}

function updateResultsCount(filtered, total) {
    const countElement = document.getElementById('resultsCount');
    if (countElement) {
        if (filtered === total) {
            countElement.textContent = `${total} especialidades disponíveis`;
        } else {
            countElement.textContent = `${filtered} de ${total} especialidades encontradas`;
        }
    }
}

function quickSearchSpecialties(query) {
    searchSpecialties(query);
}

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

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    renderSpecialties();
}

/**
 * SISTEMA DE MODAL
 */
function openSpecialtyModal(specialtyId) {
    const specialty = MEDICAL_SPECIALTIES.find(s => s.id == specialtyId);
    if (!specialty) return;
    
    TeleMed.selectedSpecialty = specialty;
    updateSpecialtyModal(specialty);
    document.getElementById('specialtyModal').classList.remove('hidden');
}

function closeSpecialtyModal() {
    document.getElementById('specialtyModal').classList.add('hidden');
    TeleMed.selectedSpecialty = null;
}

function updateSpecialtyModal(specialty) {
    document.getElementById('modalTitle').textContent = specialty.name;
    document.getElementById('modalIcon').textContent = specialty.icon;
    document.getElementById('modalPrice').textContent = specialty.priceFormatted;
    
    const availabilityStatus = getAvailabilityStatus(specialty);
    const availabilityText = getAvailabilityText(availabilityStatus);
    const availabilityClass = getAvailabilityClass(availabilityStatus);
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="mb-6">
            <div class="text-center mb-4">
                <p class="text-gray-600 mb-4">${specialty.description}</p>
                <div class="flex justify-center items-center gap-4 mb-4">
                    <div class="${availabilityClass} rounded-full px-4 py-2 text-sm font-semibold">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 ${availabilityStatus === 'online' ? 'bg-green-400 animate-pulse' : availabilityStatus === 'busy' ? 'bg-yellow-400' : 'bg-red-400'} rounded-full"></div>
                            ${availabilityText}
                        </div>
                    </div>
                    <div class="bg-blue-50 text-blue-700 rounded-full px-4 py-2 text-sm font-semibold">
                        ⏰ ${specialty.waitTime} de espera
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mb-6">
            <h4 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span class="text-green-600">✅</span>
                Serviços incluídos
            </h4>
            <div class="grid grid-cols-1 gap-2">
                ${specialty.features.map(feature => `
                    <div class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div class="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span class="text-sm text-gray-700">${feature}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="mb-6">
            <h4 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span class="text-blue-600">👨‍⚕️</span>
                Médicos disponíveis (${specialty.doctors.length})
            </h4>
            <div class="space-y-3">
                ${specialty.doctors.map(doctor => {
                    const doctorStatusClass = doctor.availability === 'online' ? 'bg-green-100 border-green-200' : 
                                            doctor.availability === 'busy' ? 'bg-yellow-100 border-yellow-200' : 
                                            'bg-red-100 border-red-200';
                    const doctorStatusText = doctor.availability === 'online' ? 'Disponível' : 
                                           doctor.availability === 'busy' ? 'Ocupado' : 'Offline';
                    const doctorStatusIcon = doctor.availability === 'online' ? '🟢' : 
                                           doctor.availability === 'busy' ? '🟡' : '🔴';
                    
                    return `
                        <div class="flex items-center justify-between p-4 ${doctorStatusClass} border rounded-lg">
                            <div class="flex-1">
                                <div class="font-semibold text-gray-900">${doctor.name}</div>
                                <div class="text-sm text-gray-600">${doctor.crm} • ${doctor.experience} de experiência</div>
                                <div class="text-xs text-gray-500 mt-1">${doctor.consultations} consultas realizadas</div>
                            </div>
                            <div class="text-right">
                                <div class="flex items-center gap-1 mb-1">
                                    <span class="text-yellow-500">★</span>
                                    <span class="text-sm font-semibold">${doctor.rating}</span>
                                </div>
                                <div class="text-xs flex items-center gap-1">
                                    <span>${doctorStatusIcon}</span>
                                    <span>${doctorStatusText}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        
        <div class="border-t border-gray-200 pt-6">
            <div class="flex items-center justify-between mb-4">
                <div class="text-sm text-gray-600">
                    <div class="flex items-center gap-2 mb-1">
                        <span>⭐</span>
                        <span>${specialty.rating} (${specialty.reviewsFormatted})</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span>👥</span>
                        <span>${specialty.doctorsOnline} médicos online</span>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-green-600">${specialty.priceFormatted}</div>
                    <div class="text-xs text-gray-500">por consulta</div>
                </div>
            </div>
            
            <div class="space-y-3">
                <button onclick="scheduleAppointment()" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2">
                    <span>📅</span>
                    Agendar Consulta
                </button>
                <button onclick="startImmediateConsultation()" class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2">
                    <span>🔴</span>
                    Consulta Imediata
                </button>
            </div>
        </div>`;
}

/**
 * FUNÇÕES DE FILTROS E AÇÕES
 */
function applySorting(sortBy) {
    const currentQuery = document.getElementById('searchInput')?.value || '';
    searchSpecialties(currentQuery, { sortBy });
}

function filterByAvailability(status, buttonElement) {
    const currentQuery = document.getElementById('searchInput')?.value || '';
    
    const filterButtons = document.querySelectorAll('.availability-filter');
    filterButtons.forEach(btn => {
        btn.classList.remove('bg-green-100', 'bg-yellow-100', 'border-green-500', 'border-yellow-500');
    });
    
    if (buttonElement) {
        if (status === 'online') {
            buttonElement.classList.add('bg-green-100', 'border-green-500');
        } else if (status === 'busy') {
            buttonElement.classList.add('bg-yellow-100', 'border-yellow-500');
        }
    }
    
    searchSpecialties(currentQuery, { availability: [status] });
}

function clearAllFilters() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.value = '';
    }
    
    const filterButtons = document.querySelectorAll('.availability-filter');
    filterButtons.forEach(btn => {
        btn.classList.remove('bg-green-100', 'bg-yellow-100', 'border-green-500', 'border-yellow-500');
    });
    
    renderSpecialties();
    updateResultsCount(MEDICAL_SPECIALTIES.length, MEDICAL_SPECIALTIES.length);
}

function quickConsultation(specialtyId) {
    const specialty = MEDICAL_SPECIALTIES.find(s => s.id == specialtyId);
    if (!specialty) return;
    
    TeleMed.selectedSpecialty = specialty;
    
    const availabilityStatus = getAvailabilityStatus(specialty);
    
    if (availabilityStatus === 'offline') {
        showNotification('Indisponível', 'Não há médicos disponíveis no momento para esta especialidade', 'warning');
        return;
    }
    
    if (availabilityStatus === 'busy') {
        showNotification('Médicos ocupados', 'Todos os médicos estão ocupados. Você será adicionado à fila de espera.', 'info');
    }
    
    showNotification('Iniciando consulta', `Preparando consulta de ${specialty.name}...`, 'info');
    
    setTimeout(() => {
        showNotification('Consulta iniciada', `Você está na fila para ${specialty.name}. Tempo estimado: ${specialty.waitTime}`, 'success');
    }, 2000);
}

function scheduleAppointment() {
    if (!TeleMed.selectedSpecialty) return;
    closeSpecialtyModal();
    showNotification('Agendamento', 'Abrindo calendário para agendamento...', 'info');
}

function startImmediateConsultation() {
    if (!TeleMed.selectedSpecialty) return;
    closeSpecialtyModal();
    showNotification('Consulta Imediata', 'Redirecionando para pagamento...', 'info');
}

function getSpecialtyById(id) {
    return MEDICAL_SPECIALTIES.find(s => s.id == id);
}

function getAvailableDoctors(specialtyId) {
    const specialty = getSpecialtyById(specialtyId);
    if (!specialty) return [];
    return specialty.doctors.filter(doctor => doctor.availability === 'online');
}

function updateSpecialtyAvailability() {
    MEDICAL_SPECIALTIES.forEach(specialty => {
        specialty.doctorsOnline = Math.max(1, specialty.doctorsOnline + Math.floor(Math.random() * 3) - 1);
        specialty.waitTime = `~${Math.floor(Math.random() * 20) + 5} min`;
        
        specialty.doctors.forEach(doctor => {
            if (Math.random() < 0.1) {
                doctor.availability = doctor.availability === 'online' ? 'busy' : 'online';
            }
        });
    });
    
    if (TeleMed.currentSection === 'specialties') {
        renderSpecialties();
    }
}

function showNotification(title, message, type = 'info') {
    if (window.showNotification) {
        window.showNotification(title, message, type);
        return;
    }
    alert(`${title}: ${message}`);
}

function initializeSpecialtiesSystem() {
    loadSpecialtiesData();
    updateResultsCount(MEDICAL_SPECIALTIES.length, MEDICAL_SPECIALTIES.length);
    setInterval(updateSpecialtyAvailability, 30000);
    console.log('🏥 Specialties system initialized');
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSpecialtiesSystem);
} else {
    initializeSpecialtiesSystem();
}

// Export functions and data to global window object
window.MEDICAL_SPECIALTIES = MEDICAL_SPECIALTIES;
window.renderSpecialties = renderSpecialties;
window.searchSpecialties = searchSpecialties;
window.sortSpecialties = sortSpecialties;
window.quickSearchSpecialties = quickSearchSpecialties;
window.openSpecialtyModal = openSpecialtyModal;
window.closeSpecialtyModal = closeSpecialtyModal;
window.scheduleAppointment = scheduleAppointment;
window.startImmediateConsultation = startImmediateConsultation;
window.clearSearch = clearSearch;
window.clearAllFilters = clearAllFilters;
window.applySorting = applySorting;
window.filterByAvailability = filterByAvailability;
window.quickConsultation = quickConsultation;
window.getSpecialtyById = getSpecialtyById;
window.getAvailableDoctors = getAvailableDoctors;
window.getAvailabilityStatus = getAvailabilityStatus;
window.getAvailabilityClass = getAvailabilityClass;
window.getAvailabilityText = getAvailabilityText;
window.updateSpecialtyModal = updateSpecialtyModal;
window.animateSpecialtyCards = animateSpecialtyCards;
window.showNoResultsMessage = showNoResultsMessage;
window.updateResultsCount = updateResultsCount;
window.updateSpecialtyAvailability = updateSpecialtyAvailability;
window.loadSpecialtiesData = loadSpecialtiesData;

console.log('✅ TeleMed Specialties System Loaded');