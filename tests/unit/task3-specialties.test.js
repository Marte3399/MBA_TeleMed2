/**
 * TESTES UNITÁRIOS - TAREFA 3: SISTEMA DE ESPECIALIDADES
 * Testes para o sistema de especialidades médicas
 */

// Mock data for testing
const mockSpecialties = [
    {
        id: 1,
        name: 'Cardiologia',
        description: 'Cuidados com o coração',
        icon: '❤️',
        price: 89.90,
        priceFormatted: 'R$ 89,90',
        waitTime: '~8 min',
        doctorsOnline: 6,
        rating: 4.9,
        reviews: 1200,
        reviewsFormatted: '1.2k avaliações',
        features: ['Consulta HD', 'ECG remoto'],
        doctors: [
            { id: 1, name: 'Dr. João', availability: 'online' },
            { id: 2, name: 'Dr. Maria', availability: 'busy' }
        ]
    },
    {
        id: 2,
        name: 'Pediatria',
        description: 'Cuidados infantis',
        icon: '👶',
        price: 79.90,
        priceFormatted: 'R$ 79,90',
        waitTime: '~5 min',
        doctorsOnline: 4,
        rating: 4.8,
        reviews: 890,
        reviewsFormatted: '890 avaliações',
        features: ['Consulta infantil', 'Orientação pais'],
        doctors: [
            { id: 3, name: 'Dra. Ana', availability: 'online' }
        ]
    }
];

describe('Task 3 - Sistema de Especialidades', () => {
    
    describe('Availability Functions', () => {
        test('getAvailabilityStatus should return correct status', () => {
            const result = getAvailabilityStatus(mockSpecialties[0]);
            expect(['online', 'busy', 'offline']).toContain(result);
        });
        
        test('getAvailabilityClass should return valid CSS classes', () => {
            const onlineClass = getAvailabilityClass('online');
            const busyClass = getAvailabilityClass('busy');
            const offlineClass = getAvailabilityClass('offline');
            
            expect(onlineClass).toContain('bg-green');
            expect(busyClass).toContain('bg-yellow');
            expect(offlineClass).toContain('bg-red');
        });
        
        test('getAvailabilityText should return descriptive text', () => {
            expect(getAvailabilityText('online')).toBe('Disponível agora');
            expect(getAvailabilityText('busy')).toBe('Ocupado');
            expect(getAvailabilityText('offline')).toBe('Indisponível');
        });
    });
    
    describe('Search and Filter Functions', () => {
        test('sortSpecialties should sort by price ascending', () => {
            const sorted = sortSpecialties(mockSpecialties, 'price-asc');
            expect(sorted[0].price).toBeLessThanOrEqual(sorted[1].price);
        });
        
        test('sortSpecialties should sort by name', () => {
            const sorted = sortSpecialties(mockSpecialties, 'name');
            expect(sorted[0].name.localeCompare(sorted[1].name)).toBeLessThanOrEqual(0);
        });
    });
    
    describe('Utility Functions', () => {
        test('getSpecialtyById should return correct specialty', () => {
            const specialty = getSpecialtyById(1);
            expect(specialty).toBeDefined();
            expect(specialty.id).toBe(1);
            expect(specialty.name).toBe('Cardiologia');
        });
        
        test('getAvailableDoctors should return only online doctors', () => {
            const availableDoctors = getAvailableDoctors(1);
            expect(Array.isArray(availableDoctors)).toBe(true);
            availableDoctors.forEach(doctor => {
                expect(doctor.availability).toBe('online');
            });
        });
    });
});