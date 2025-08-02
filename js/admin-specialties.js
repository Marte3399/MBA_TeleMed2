// TeleMed - Administração de Especialidades
// Sistema completo de CRUD para especialidades médicas

let specialties = [];
let currentSpecialty = null;
let deleteSpecialtyId = null;

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', function () {
    console.log('🏥 Admin Specialties System Loading...');
    initializeDatabase();
    loadSpecialties();
    initializeIconSelector();
});

/**
 * DATABASE INITIALIZATION
 */
async function initializeDatabase() {
    try {
        // Check if specialties table exists and create if needed
        const { data, error } = await supabase
            .from('specialties')
            .select('count', { count: 'exact', head: true });

        if (error && error.code === '42P01') {
            // Table doesn't exist, create it
            console.log('📋 Creating specialties table...');
            await createSpecialtiesTable();
        } else if (error) {
            console.error('❌ Database error:', error);
            showToast('Erro', 'Erro ao conectar com o banco de dados', 'error');
        } else {
            console.log('✅ Database connection successful');
        }
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        showToast('Erro', 'Erro ao inicializar banco de dados', 'error');
    }
}

async function createSpecialtiesTable() {
    try {
        const { error } = await supabase.rpc('create_specialties_table');

        if (error) {
            console.error('❌ Error creating table:', error);
            // Try alternative approach - direct SQL
            await createTableDirectly();
        } else {
            console.log('✅ Specialties table created successfully');
            await seedInitialData();
        }
    } catch (error) {
        console.error('❌ Error in table creation:', error);
        await createTableDirectly();
    }
}

async function createTableDirectly() {
    // Since we can't create tables directly via Supabase client,
    // we'll show instructions to the user
    showToast('Configuração Necessária',
        'Execute o SQL de criação da tabela no Supabase Dashboard',
        'warning');

    console.log(`
    -- Execute este SQL no Supabase Dashboard:
    
    CREATE TABLE IF NOT EXISTS specialties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        icon VARCHAR(10) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        wait_time VARCHAR(20) NOT NULL DEFAULT '~10 min',
        features JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

    -- Create policies (adjust as needed)
    CREATE POLICY "Allow all operations for authenticated users" ON specialties
        FOR ALL USING (auth.role() = 'authenticated');
    `);
}

async function seedInitialData() {
    try {
        // Check if we already have data
        const { data: existingData } = await supabase
            .from('specialties')
            .select('id')
            .limit(1);

        if (existingData && existingData.length > 0) {
            console.log('📋 Data already exists, skipping seed');
            return;
        }

        // Seed with initial specialties from the existing system
        const initialSpecialties = [
            {
                name: 'Cardiologia',
                description: 'Cuidados com o coração e sistema cardiovascular',
                icon: '❤️',
                price: 89.90,
                wait_time: '~8 min',
                features: [
                    'Consulta por videochamada HD',
                    'Eletrocardiograma remoto',
                    'Monitoramento cardíaco',
                    'Prescrição digital',
                    'Acompanhamento contínuo'
                ],
                is_active: true
            },
            {
                name: 'Pediatria',
                description: 'Cuidados médicos para crianças e adolescentes',
                icon: '👶',
                price: 79.90,
                wait_time: '~5 min',
                features: [
                    'Consulta especializada infantil',
                    'Acompanhamento do crescimento',
                    'Orientação para pais',
                    'Vacinação e prevenção',
                    'Emergências pediátricas'
                ],
                is_active: true
            },
            {
                name: 'Dermatologia',
                description: 'Cuidados com a pele, cabelos e unhas',
                icon: '🧴',
                price: 99.90,
                wait_time: '~15 min',
                features: [
                    'Análise dermatológica',
                    'Diagnóstico por imagem',
                    'Tratamento de acne',
                    'Prevenção de câncer de pele',
                    'Cuidados estéticos'
                ],
                is_active: true
            },
            {
                name: 'Psiquiatria',
                description: 'Saúde mental e transtornos psiquiátricos',
                icon: '🧠',
                price: 129.90,
                wait_time: '~20 min',
                features: [
                    'Consulta psiquiátrica',
                    'Avaliação de ansiedade',
                    'Tratamento de depressão',
                    'Terapia medicamentosa',
                    'Acompanhamento psicológico'
                ],
                is_active: true
            }
        ];

        const { error } = await supabase
            .from('specialties')
            .insert(initialSpecialties);

        if (error) {
            console.error('❌ Error seeding data:', error);
        } else {
            console.log('✅ Initial data seeded successfully');
        }
    } catch (error) {
        console.error('❌ Error in seeding:', error);
    }
}

/**
 * CRUD OPERATIONS
 */
async function loadSpecialties() {
    try {
        showLoading(true);

        const { data, error } = await supabase
            .from('specialties')
            .select('id, name, description, icon, price, duration, is_active, created_at, updated_at')
            .order('name');

        if (error) {
            console.error('❌ Error loading specialties:', error);
            
            if (error.code === '42P01') {
                // Table doesn't exist
                showToast('Configuração Necessária', 
                    'Tabela specialties não encontrada. Execute o SQL de criação no Supabase Dashboard.', 
                    'warning');
                showTableCreationInstructions();
            } else {
                showToast('Erro', `Erro ao carregar especialidades: ${error.message}`, 'error');
            }
            showEmptyState();
            return;
        }

        // Transform data to match expected format
        specialties = (data || []).map(specialty => ({
            ...specialty,
            wait_time: specialty.duration ? `~${specialty.duration} min` : '~10 min',
            features: [] // Default empty features since column doesn't exist
        }));
        
        renderSpecialties(specialties);
        updateStats();

        console.log(`✅ Loaded ${specialties.length} specialties`);
    } catch (error) {
        console.error('❌ Error in loadSpecialties:', error);
        showToast('Erro', 'Erro ao carregar dados', 'error');
        showEmptyState();
    } finally {
        showLoading(false);
    }
}

async function saveSpecialty(specialtyData) {
    try {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Salvando...';

        // Transform data to match database structure
        const dbData = {
            name: specialtyData.name,
            description: specialtyData.description,
            icon: specialtyData.icon,
            price: specialtyData.price,
            duration: specialtyData.wait_time ? parseInt(specialtyData.wait_time.replace(/[^\d]/g, '')) || 10 : 10,
            is_active: specialtyData.is_active,
            updated_at: new Date().toISOString()
        };

        let result;

        if (currentSpecialty) {
            // Update existing specialty
            const { data, error } = await supabase
                .from('specialties')
                .update(dbData)
                .eq('id', currentSpecialty.id)
                .select();
            result = { data, error };
        } else {
            // Create new specialty
            const { data, error } = await supabase
                .from('specialties')
                .insert([dbData])
                .select();
            result = { data, error };
        }

        if (result.error) {
            console.error('❌ Error saving specialty:', result.error);
            showToast('Erro', `Erro ao salvar especialidade: ${result.error.message}`, 'error');
            return false;
        }

        const action = currentSpecialty ? 'atualizada' : 'criada';
        showToast('Sucesso', `Especialidade ${action} com sucesso!`, 'success');

        closeModal();
        loadSpecialties();
        return true;

    } catch (error) {
        console.error('❌ Error in saveSpecialty:', error);
        showToast('Erro', 'Erro ao salvar dados: ' + error.message, 'error');
        return false;
    } finally {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Salvar Especialidade';
    }
}

async function deleteSpecialty(id) {
    try {
        const { error } = await supabase
            .from('specialties')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ Error deleting specialty:', error);
            showToast('Erro', 'Erro ao excluir especialidade', 'error');
            return false;
        }

        showToast('Sucesso', 'Especialidade excluída com sucesso!', 'success');
        loadSpecialties();
        return true;

    } catch (error) {
        console.error('❌ Error in deleteSpecialty:', error);
        showToast('Erro', 'Erro ao excluir dados', 'error');
        return false;
    }
}

/**
 * UI RENDERING
 */
function renderSpecialties(data) {
    const container = document.getElementById('specialtiesContainer');

    if (!data || data.length === 0) {
        showEmptyState();
        return;
    }

    hideEmptyState();

    container.innerHTML = data.map(specialty => `
        <div class="specialty-card bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center">
                        <span class="text-3xl mr-3">${specialty.icon}</span>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">${specialty.name}</h3>
                            <p class="text-sm text-gray-600">${specialty.description}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${specialty.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }">
                            ${specialty.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                    </div>
                </div>

                <div class="space-y-2 mb-4">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Preço:</span>
                        <span class="font-semibold text-green-600">R$ ${specialty.price.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Tempo de espera:</span>
                        <span class="font-medium">${specialty.wait_time}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Duração:</span>
                        <span class="font-medium">${specialty.duration || 30} min</span>
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button onclick="editSpecialty('${specialty.id}')" 
                        class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition">
                        ✏️ Editar
                    </button>
                    <button onclick="toggleSpecialtyStatus('${specialty.id}', ${!specialty.is_active})" 
                        class="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition">
                        ${specialty.is_active ? '⏸️ Desativar' : '▶️ Ativar'}
                    </button>
                    <button onclick="openDeleteModal('${specialty.id}', '${specialty.name}')" 
                        class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const total = specialties.length;
    const active = specialties.filter(s => s.is_active).length;
    const inactive = total - active;
    const averagePrice = total > 0
        ? (specialties.reduce((sum, s) => sum + parseFloat(s.price), 0) / total).toFixed(2)
        : '0.00';

    document.getElementById('totalSpecialties').textContent = total;
    document.getElementById('activeSpecialties').textContent = active;
    document.getElementById('inactiveSpecialties').textContent = inactive;
    document.getElementById('averagePrice').textContent = `R$ ${averagePrice}`;
}

/**
 * MODAL MANAGEMENT
 */
function openAddModal() {
    currentSpecialty = null;
    document.getElementById('modalTitle').textContent = 'Nova Especialidade';
    document.getElementById('specialtyForm').reset();
    document.getElementById('specialtyId').value = '';

    // Reset icon selector to default
    document.getElementById('selectedIcon').textContent = '❤️';
    document.getElementById('selectedIconName').textContent = 'Coração';
    document.getElementById('icon').value = '❤️';

    document.getElementById('specialtyModal').classList.add('active');
}

function editSpecialty(id) {
    currentSpecialty = specialties.find(s => s.id === id);
    if (!currentSpecialty) return;

    document.getElementById('modalTitle').textContent = 'Editar Especialidade';
    document.getElementById('specialtyId').value = currentSpecialty.id;
    document.getElementById('name').value = currentSpecialty.name;
    document.getElementById('description').value = currentSpecialty.description;
    document.getElementById('price').value = currentSpecialty.price;
    document.getElementById('wait_time').value = currentSpecialty.wait_time;
    document.getElementById('is_active').checked = currentSpecialty.is_active;

    // Set the icon in the dropdown
    const icon = currentSpecialty.icon;
    document.getElementById('selectedIcon').textContent = icon;
    document.getElementById('icon').value = icon;
    
    // Find the icon name from the options
    const iconOption = document.querySelector(`[data-icon="${icon}"]`);
    if (iconOption) {
        document.getElementById('selectedIconName').textContent = iconOption.dataset.name;
    } else {
        document.getElementById('selectedIconName').textContent = 'Personalizado';
    }

    document.getElementById('specialtyModal').classList.add('active');
}

function closeModal() {
    document.getElementById('specialtyModal').classList.remove('active');
    currentSpecialty = null;
}

function openDeleteModal(id, name) {
    deleteSpecialtyId = id;
    document.getElementById('deleteSpecialtyName').textContent = name;
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deleteSpecialtyId = null;
}

async function confirmDelete() {
    if (!deleteSpecialtyId) return;

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Excluindo...';

    const success = await deleteSpecialty(deleteSpecialtyId);

    if (success) {
        closeDeleteModal();
    }

    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Excluir';
}

/**
 * FORM MANAGEMENT
 */
document.getElementById('specialtyForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    const specialtyData = {
        name: formData.get('name'),
        description: formData.get('description'),
        icon: formData.get('icon'),
        price: parseFloat(formData.get('price')),
        wait_time: formData.get('wait_time'), // This will be converted to duration in saveSpecialty
        is_active: formData.has('is_active')
    };

    await saveSpecialty(specialtyData);
});



/**
 * SEARCH AND FILTER
 */
function searchSpecialties() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = specialties.filter(specialty =>
        specialty.name.toLowerCase().includes(query) ||
        specialty.description.toLowerCase().includes(query)
    );
    renderSpecialties(filtered);
}

function filterSpecialties() {
    const status = document.getElementById('statusFilter').value;
    let filtered = specialties;

    if (status === 'active') {
        filtered = specialties.filter(s => s.is_active);
    } else if (status === 'inactive') {
        filtered = specialties.filter(s => !s.is_active);
    }

    renderSpecialties(filtered);
}

function sortSpecialties() {
    const sortBy = document.getElementById('sortBy').value;
    const sorted = [...specialties].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'price':
                return parseFloat(a.price) - parseFloat(b.price);
            case 'created_at':
                return new Date(b.created_at) - new Date(a.created_at);
            default:
                return 0;
        }
    });
    renderSpecialties(sorted);
}

async function toggleSpecialtyStatus(id, newStatus) {
    try {
        const { error } = await supabase
            .from('specialties')
            .update({ is_active: newStatus, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('❌ Error updating status:', error);
            showToast('Erro', 'Erro ao atualizar status', 'error');
            return;
        }

        const action = newStatus ? 'ativada' : 'desativada';
        showToast('Sucesso', `Especialidade ${action} com sucesso!`, 'success');
        loadSpecialties();

    } catch (error) {
        console.error('❌ Error in toggleSpecialtyStatus:', error);
        showToast('Erro', 'Erro ao atualizar status', 'error');
    }
}

function refreshSpecialties() {
    loadSpecialties();
    showToast('Atualizado', 'Lista de especialidades atualizada', 'info');
}

/**
 * UI UTILITIES
 */
function showLoading(show) {
    const loadingState = document.getElementById('loadingState');
    const container = document.getElementById('specialtiesContainer');

    if (show) {
        loadingState.style.display = 'block';
        container.style.display = 'none';
    } else {
        loadingState.style.display = 'none';
        container.style.display = 'grid';
    }
}

function showEmptyState() {
    document.getElementById('emptyState').classList.remove('hidden');
    document.getElementById('specialtiesContainer').style.display = 'none';
}

function hideEmptyState() {
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('specialtiesContainer').style.display = 'grid';
}

function showTableCreationInstructions() {
    const container = document.getElementById('specialtiesContainer');
    container.innerHTML = `
        <div class="col-span-full bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div class="text-center">
                <div class="text-6xl mb-4">⚠️</div>
                <h3 class="text-xl font-semibold text-yellow-800 mb-2">Configuração Necessária</h3>
                <p class="text-yellow-700 mb-4">A tabela 'specialties' não foi encontrada no banco de dados.</p>
                <p class="text-yellow-700 mb-4">Execute o SQL abaixo no Supabase Dashboard > SQL Editor:</p>
                
                <div class="bg-gray-900 text-green-400 p-4 rounded-lg text-left text-sm font-mono overflow-x-auto mb-4">
                    <pre>-- Criar tabela de especialidades
CREATE TABLE IF NOT EXISTS specialties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon VARCHAR(10) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    wait_time VARCHAR(20) NOT NULL DEFAULT '~10 min',
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Allow read access for all users" ON specialties
    FOR SELECT USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON specialties
    FOR ALL USING (auth.role() = 'authenticated');</pre>
                </div>
                
                <button onclick="loadSpecialties()" 
                    class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                    🔄 Tentar Novamente
                </button>
            </div>
        </div>
    `;
}

function showToast(title, message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');

    // Set icon and colors based on type
    const config = {
        success: { icon: '✅', color: 'border-green-500' },
        error: { icon: '❌', color: 'border-red-500' },
        warning: { icon: '⚠️', color: 'border-yellow-500' },
        info: { icon: 'ℹ️', color: 'border-blue-500' }
    };

    const { icon, color } = config[type] || config.info;

    toastIcon.textContent = icon;
    toastTitle.textContent = title;
    toastMessage.textContent = message;

    toast.className = `fixed top-4 right-4 z-50 ${color}`;
    toast.classList.remove('hidden');

    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 5000);
}

/**
 * ICON SELECTOR FUNCTIONALITY
 */
function toggleIconDropdown() {
    const dropdown = document.getElementById('iconDropdown');
    const isHidden = dropdown.classList.contains('hidden');
    
    if (isHidden) {
        dropdown.classList.remove('hidden');
        // Focus on search input when opening
        setTimeout(() => {
            document.getElementById('iconSearch').focus();
        }, 100);
    } else {
        dropdown.classList.add('hidden');
    }
}

function selectIcon(icon, name) {
    // Update the display
    document.getElementById('selectedIcon').textContent = icon;
    document.getElementById('selectedIconName').textContent = name;
    
    // Update the hidden input
    document.getElementById('icon').value = icon;
    
    // Close the dropdown
    document.getElementById('iconDropdown').classList.add('hidden');
    
    // Clear search
    document.getElementById('iconSearch').value = '';
    showAllIcons();
}

function filterIcons() {
    const searchTerm = document.getElementById('iconSearch').value.toLowerCase();
    const iconOptions = document.querySelectorAll('.icon-option');
    const categories = document.querySelectorAll('.icon-category');
    
    if (searchTerm === '') {
        showAllIcons();
        return;
    }
    
    iconOptions.forEach(option => {
        const iconName = option.dataset.name.toLowerCase();
        const iconText = option.querySelector('.text-xs').textContent.toLowerCase();
        const matches = iconName.includes(searchTerm) || iconText.includes(searchTerm);
        
        option.style.display = matches ? 'block' : 'none';
    });
    
    // Hide categories that have no visible icons
    categories.forEach(category => {
        const visibleIcons = category.querySelectorAll('.icon-option[style="display: block"], .icon-option:not([style*="display: none"])');
        category.style.display = visibleIcons.length > 0 ? 'block' : 'none';
    });
}

function showAllIcons() {
    const iconOptions = document.querySelectorAll('.icon-option');
    const categories = document.querySelectorAll('.icon-category');
    
    iconOptions.forEach(option => {
        option.style.display = 'block';
    });
    
    categories.forEach(category => {
        category.style.display = 'block';
    });
}

// Initialize icon selector event listeners
function initializeIconSelector() {
    // Add click event listeners to all icon options
    document.querySelectorAll('.icon-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const icon = this.dataset.icon;
            const name = this.dataset.name;
            selectIcon(icon, name);
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('iconDropdown');
        const selector = document.getElementById('iconSelector');
        
        if (dropdown && selector && !dropdown.contains(e.target) && !selector.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
    
    // Prevent dropdown from closing when clicking inside
    const dropdown = document.getElementById('iconDropdown');
    if (dropdown) {
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}



// Export functions for global access
window.openAddModal = openAddModal;
window.editSpecialty = editSpecialty;
window.closeModal = closeModal;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.searchSpecialties = searchSpecialties;
window.filterSpecialties = filterSpecialties;
window.sortSpecialties = sortSpecialties;
window.toggleSpecialtyStatus = toggleSpecialtyStatus;
window.refreshSpecialties = refreshSpecialties;
window.toggleIconDropdown = toggleIconDropdown;
window.selectIcon = selectIcon;
window.filterIcons = filterIcons;

console.log('✅ Admin Specialties System Loaded');