// scripts.js - TTRPG Notes Frontend

// ============================================================================
// CONFIGURAÇÃO E ESTADO GLOBAL
// ============================================================================

// URL base da API
const API_BASE_URL = 'http://localhost:5000';

// Estado global da aplicação
const AppState = {
    currentCampaignId: null,
    campaigns: [],
    notes: [],
    quill: null,
    isApiConnected: false
};

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando TTRPG Notes...');
    initializeApp();
});

async function initializeApp() {
    try {
        await checkApiConnection();
        await loadCampaigns();
        setupEventListeners();
        console.log('✅ App inicializado com sucesso');
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showMessage('Erro ao inicializar aplicação', 'error');
    }
}

// ============================================================================
// CONEXÃO COM API
// ============================================================================

async function checkApiConnection() {
    const statusEl = document.getElementById('connection-status');
    
    try {
        const response = await fetch(`${API_BASE_URL}/campaigns`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            AppState.isApiConnected = true;
            statusEl.textContent = '✅ Conectado';
            statusEl.className = 'connection-status connected';
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        AppState.isApiConnected = false;
        statusEl.textContent = '❌ Desconectado';
        statusEl.className = 'connection-status error';
        showMessage('Não foi possível conectar com o servidor', 'error');
    }
}

// ============================================================================
// GERENCIAMENTO DE CAMPANHAS
// ============================================================================

async function loadCampaigns() {
    if (!AppState.isApiConnected) return;
    
    const container = document.getElementById('campaigns-list');
    showLoadingState(container, '📋 Carregando campanhas...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/campaigns`);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        AppState.campaigns = await response.json();
        renderCampaigns();
        
    } catch (error) {
        console.error('Erro ao carregar campanhas:', error);
        showErrorState(container, 'Erro ao carregar campanhas');
    }
}

function renderCampaigns() {
    const container = document.getElementById('campaigns-list');
    
    if (AppState.campaigns.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h4>Nenhuma campanha ainda</h4>
                <p>Crie sua primeira campanha!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    AppState.campaigns.forEach(campaign => {
        const campaignEl = createCampaignElement(campaign);
        container.appendChild(campaignEl);
    });
}

function createCampaignElement(campaign) {
    const div = document.createElement('div');
    div.className = 'campaign-item';
    div.dataset.campaignId = campaign.id;
    div.onclick = () => selectCampaign(campaign.id);
    
    div.innerHTML = `
        <div class="campaign-name">${escapeHtml(campaign.name)}</div>
        <div class="campaign-date">${formatDate(campaign.created_at)}</div>
        ${campaign.description ? `
            <div class="campaign-desc-preview">
                ${escapeHtml(campaign.description)}
            </div>
        ` : ''}
    `;
    
    return div;
}

async function selectCampaign(campaignId) {
    AppState.currentCampaignId = campaignId;
    
    // Atualizar visual das campanhas
    document.querySelectorAll('.campaign-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedItem = document.querySelector(`[data-campaign-id="${campaignId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    // Encontrar dados da campanha
    const campaign = AppState.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
        showMessage('Campanha não encontrada', 'error');
        return;
    }
    
    // Mostrar tela da campanha
    showCampaignScreen(campaign);
    
    // Carregar notas
    await loadNotes(campaignId);
}

function showCampaignScreen(campaign) {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('search-screen').classList.add('hidden');
    document.getElementById('campaign-screen').classList.remove('hidden');
    
    document.getElementById('campaign-title').textContent = campaign.name;
    document.getElementById('campaign-description').textContent = 
        campaign.description || 'Sem descrição';
        
    // Atualizar UI
    updateUIState();
}

// ============================================================================
// GERENCIAMENTO DE UI
// ============================================================================

function updateUIState() {
    const newNoteBtn = document.getElementById('new-note-btn');
    
    if (AppState.currentCampaignId && newNoteBtn) {
        const campaign = AppState.campaigns.find(c => c.id === AppState.currentCampaignId);
        if (campaign) {
            newNoteBtn.disabled = false;
            newNoteBtn.classList.remove('disabled');
            newNoteBtn.title = `Criar nova nota para ${campaign.name}`;
        } else {
            newNoteBtn.disabled = true;
            newNoteBtn.classList.add('disabled');
            newNoteBtn.title = 'Selecione uma campanha válida primeiro';
        }
    } else if (newNoteBtn) {
        newNoteBtn.disabled = true;
        newNoteBtn.classList.add('disabled');
        newNoteBtn.title = 'Selecione uma campanha primeiro';
    }
}

function showWelcomeScreen() {
    document.getElementById('campaign-screen').classList.add('hidden');
    document.getElementById('search-screen').classList.add('hidden');
    document.getElementById('welcome-screen').classList.remove('hidden');
    
    AppState.currentCampaignId = null;
    updateUIState();
}

// ============================================================================
// FORMULÁRIO DE CAMPANHA
// ============================================================================

function showNewCampaignForm() {
    const form = document.getElementById('new-campaign-form');
    form.classList.remove('hidden');
    document.getElementById('campaign-name').focus();
}

function cancelNewCampaign() {
    const form = document.getElementById('new-campaign-form');
    form.classList.add('hidden');
    document.getElementById('campaign-name').value = '';
    document.getElementById('campaign-description').value = '';
}

async function createCampaign() {
    const nameEl = document.getElementById('campaign-name');
    const descEl = document.getElementById('campaign-description');
    const btnText = document.getElementById('create-btn-text');
    
    const name = nameEl.value.trim();
    const description = descEl.value.trim();
    
    if (!name) {
        showMessage('Nome da campanha é obrigatório', 'error');
        nameEl.focus();
        return;
    }
    
    if (!AppState.isApiConnected) {
        showMessage('Sem conexão com a API', 'error');
        return;
    }
    
    // Mostrar loading
    const originalText = btnText.textContent;
    btnText.textContent = 'Criando...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/campaigns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });
        
        if (response.ok) {
            showMessage('🎉 Campanha criada com sucesso!', 'success');
            cancelNewCampaign();
            await loadCampaigns();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao criar campanha');
        }
    } catch (error) {
        console.error('Erro ao criar campanha:', error);
        showMessage(error.message || 'Erro ao criar campanha', 'error');
    } finally {
        btnText.textContent = originalText;
    }
}

// ============================================================================
// GERENCIAMENTO DE NOTAS
// ============================================================================

async function loadNotes(campaignId) {
    if (!AppState.isApiConnected) return;
    
    const container = document.getElementById('notes-list');
    showLoadingState(container, '📝 Carregando notas...');
    
    try {
        // Buscar a campanha para obter o nome
        const campaign = AppState.campaigns.find(c => c.id === campaignId);
        if (!campaign) {
            throw new Error('Campanha não encontrada');
        }
        
        // Usar o nome da campanha com encoding de URL
        const encodedCampaignName = encodeURIComponent(campaign.name);
        const response = await fetch(`${API_BASE_URL}/campaigns/${encodedCampaignName}/notes`);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        
        // A API retorna uma estrutura com "notes", "total", e "campaign_name"
        AppState.notes = responseData.notes || [];
        
        // Ordenar notas por data de criação (mais recentes primeiro)
        AppState.notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        renderNotes();
        updateNotesCounter();
        
    } catch (error) {
        console.error('Erro ao carregar notas:', error);
        showErrorState(container, 'Erro ao carregar notas');
    }
}

function renderNotes() {
    const container = document.getElementById('notes-list');
    
    if (AppState.notes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h4>Nenhuma nota ainda</h4>
                <p>Clique em "Nova Nota" para começar!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    AppState.notes.forEach((note, index) => {
        const noteEl = createNoteElement(note, AppState.notes.length - index);
        container.appendChild(noteEl);
    });
}

function createNoteElement(note, sessionNumber) {
    const article = document.createElement('article');
    article.className = 'note-item';
    article.dataset.noteId = note.id;
    
    article.innerHTML = `
        <header class="note-header">
            <div class="note-info">
                <h4 class="note-title">
                    ${escapeHtml(note.title) || `Sessão ${sessionNumber}`}
                </h4>
                <time class="note-date">${formatDate(note.created_at)}</time>
            </div>
        </header>
        <div class="note-content">${note.content}</div>
        <footer class="note-actions">
            <div class="note-meta">
                Campanha: ${note.campaign_name || 'N/A'}
            </div>
        </footer>
    `;
    
    return article;
}

function updateNotesCounter() {
    const counter = document.getElementById('notes-count');
    counter.textContent = AppState.notes.length;
}

// ============================================================================
// FORMULÁRIO DE NOTA
// ============================================================================

function showNewNoteForm() {
    // Verificar se há campanhas disponíveis
    if (AppState.campaigns.length === 0) {
        showMessage('❌ Não há campanhas disponíveis. Crie uma campanha primeiro!', 'error');
        return;
    }
    
    console.log('📝 Criando nova nota');
    
    // Resetar estado
    document.getElementById('note-form-title').textContent = '📝 Nova Nota';
    document.getElementById('save-btn-text').textContent = '💾 Salvar';
    document.getElementById('note-title').value = '';
    
    // Populate campaign dropdown
    populateCampaignDropdown();
    
    // Mostrar formulário
    const form = document.getElementById('new-note-form');
    form.classList.remove('hidden');
    
    // Inicializar editor
    initializeEditor();
    
    // Focar no dropdown de campanha
    document.getElementById('note-campaign').focus();
    
    // Scroll suave para o formulário
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function populateCampaignDropdown() {
    const campaignSelect = document.getElementById('note-campaign');
    
    // Limpar opções existentes (exceto a primeira)
    campaignSelect.innerHTML = '<option value="">Selecione uma campanha...</option>';
    
    // Adicionar campanhas disponíveis
    AppState.campaigns.forEach(campaign => {
        const option = document.createElement('option');
        option.value = campaign.id;
        option.textContent = campaign.name;
        
        // Se há uma campanha selecionada atualmente, marcá-la como padrão
        if (AppState.currentCampaignId && campaign.id === AppState.currentCampaignId) {
            option.selected = true;
        }
        
        campaignSelect.appendChild(option);
    });
}

function initializeEditor() {
    if (!AppState.quill) {
        const toolbarOptions = [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            ['link'],
            ['clean']
        ];
        
        AppState.quill = new Quill('#note-editor', {
            theme: 'snow',
            placeholder: 'Descreva o que aconteceu na sessão...',
            modules: {
                toolbar: toolbarOptions
            }
        });
    } else {
        // Limpar conteúdo existente
        AppState.quill.setContents([]);
    }
}

async function saveNote() {
    const titleEl = document.getElementById('note-title');
    const campaignSelect = document.getElementById('note-campaign');
    const btnText = document.getElementById('save-btn-text');
    
    const title = titleEl.value.trim();
    const selectedCampaignId = parseInt(campaignSelect.value);
    const content = AppState.quill.root.innerHTML;
    
    // Validar campanha selecionada
    if (!selectedCampaignId) {
        showMessage('❌ Você deve selecionar uma campanha!', 'error');
        campaignSelect.focus();
        return;
    }
    
    // Verificar se a campanha selecionada ainda existe
    const selectedCampaign = AppState.campaigns.find(c => c.id === selectedCampaignId);
    if (!selectedCampaign) {
        showMessage('❌ A campanha selecionada não foi encontrada! Recarregue a página e tente novamente.', 'error');
        await loadCampaigns(); // Recarregar campanhas
        populateCampaignDropdown(); // Repopular dropdown
        return;
    }
    
    // Validar título
    if (!title) {
        showMessage('❌ Título da nota é obrigatório', 'error');
        titleEl.focus();
        return;
    }
    
    // Validar conteúdo
    if (!content || content === '<p><br></p>' || AppState.quill.getText().trim().length === 0) {
        showMessage('❌ Conteúdo da nota é obrigatório', 'error');
        AppState.quill.focus();
        return;
    }
    
    if (!AppState.isApiConnected) {
        showMessage('❌ Sem conexão com a API', 'error');
        return;
    }
    
    // Mostrar loading
    const originalText = btnText.textContent;
    btnText.textContent = 'Salvando...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                campaign_name: selectedCampaign.name,
                title,
                content
            })
        });
        
        if (response.ok) {
            showMessage(`🎉 Nota criada com sucesso para a campanha "${selectedCampaign.name}"!`, 'success');
            
            cancelNewNote();
            
            // Se a nota foi criada para a campanha atualmente selecionada, recarregar notas
            if (AppState.currentCampaignId === selectedCampaignId) {
                await loadNotes(selectedCampaignId);
            }
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao salvar nota');
        }
    } catch (error) {
        console.error('Erro ao salvar nota:', error);
        showMessage(error.message || 'Erro ao salvar nota', 'error');
    } finally {
        btnText.textContent = originalText;
    }
}

function cancelNewNote() {
    const form = document.getElementById('new-note-form');
    form.classList.add('hidden');
    
    document.getElementById('note-title').value = '';
    document.getElementById('note-campaign').value = '';
    if (AppState.quill) {
        AppState.quill.setContents([]);
    }
}

// ============================================================================
// SISTEMA DE MENSAGENS
// ============================================================================

function showMessage(text, type = 'info') {
    // Remover mensagem existente
    const existing = document.querySelector('.message');
    if (existing) {
        existing.remove();
    }
    
    // Criar nova mensagem
    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.textContent = text;
    
    // Inserir no topo da área principal
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(message, mainContent.firstChild);
    
    // Auto-remover após 4 segundos
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 4000);
}

// ============================================================================
// ESTADOS DE LOADING E ERRO
// ============================================================================

function showLoadingState(container, message = 'Carregando...') {
    container.innerHTML = `
        <div class="loading-state">
            ${message}
        </div>
    `;
}

function showErrorState(container, message = 'Erro ao carregar dados') {
    container.innerHTML = `
        <div class="error-state">
            <div class="error-icon">❌</div>
            <p>${message}</p>
            <button class="btn btn-sm btn-secondary" onclick="location.reload()">
                🔄 Tentar Novamente
            </button>
        </div>
    `;
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'Data inválida';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Formatação relativa para datas recentes
    if (diffDays === 1) {
        return 'Hoje às ' + date.toLocaleTimeString('pt-BR', {
            hour: '2-digit', 
            minute: '2-digit'
        });
    } else if (diffDays === 2) {
        return 'Ontem às ' + date.toLocaleTimeString('pt-BR', {
            hour: '2-digit', 
            minute: '2-digit'
        });
    } else if (diffDays <= 7) {
        return `${diffDays - 1} dias atrás`;
    } else {
        // Formatação completa para datas antigas
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) + ' às ' + date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    // Verificar conexão periodicamente
    setInterval(checkApiConnection, 30000);
    
    // Atalhos de teclado
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Prevenir envio de formulário com Enter em inputs
    document.addEventListener('keypress', function(e) {
        if (e.target.tagName === 'INPUT' && e.key === 'Enter') {
            e.preventDefault();
            
            // Ação específica baseada no contexto
            if (e.target.id === 'campaign-name') {
                createCampaign();
            } else if (e.target.id === 'note-title') {
                // Focar no editor
                if (AppState.quill) {
                    AppState.quill.focus();
                }
            }
        }
    });
}

function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter: Salvar nota
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const noteForm = document.getElementById('new-note-form');
        if (!noteForm.classList.contains('hidden')) {
            e.preventDefault();
            saveNote();
        }
    }
    
    // Escape: Cancelar formulários
    if (e.key === 'Escape') {
        const noteForm = document.getElementById('new-note-form');
        const campaignForm = document.getElementById('new-campaign-form');
        
        if (!noteForm.classList.contains('hidden')) {
            cancelNewNote();
        } else if (!campaignForm.classList.contains('hidden')) {
            cancelNewCampaign();
        }
    }
    
    // Ctrl/Cmd + N: Nova nota (se campanha selecionada)
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && AppState.currentCampaignId) {
        e.preventDefault();
        showNewNoteForm();
    }
}

// ============================================================================
// BUSCA GLOBAL
// ============================================================================

async function searchAll() {
    const searchTerm = document.getElementById('global-search').value.trim();
    
    if (!searchTerm) {
        showMessage('Digite um termo para buscar', 'warning');
        return;
    }
    
    // Mostrar tela de busca
    showSearchScreen();
    
    // Buscar campanhas e notas
    await Promise.all([
        searchCampaigns(searchTerm),
        searchNotes(searchTerm)
    ]);
}

function showSearchScreen() {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('campaign-screen').classList.add('hidden');
    document.getElementById('search-screen').classList.remove('hidden');
    
    // Reset dos resultados
    document.getElementById('search-campaigns-list').innerHTML = 
        '<div class="loading-state">Buscando campanhas...</div>';
    document.getElementById('search-notes-list').innerHTML = 
        '<div class="loading-state">Buscando notas...</div>';
}

function hideSearchResults() {
    document.getElementById('search-screen').classList.add('hidden');
    document.getElementById('welcome-screen').classList.remove('hidden');
    
    // Limpar campo de busca
    document.getElementById('global-search').value = '';
}

async function searchCampaigns(searchTerm) {
    const container = document.getElementById('search-campaigns-list');
    
    try {
        if (!AppState.campaigns.length) {
            await loadCampaigns();
        }
        
        const results = AppState.campaigns.filter(campaign => {
            return campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()));
        });
        
        renderSearchCampaigns(results, searchTerm);
        
    } catch (error) {
        console.error('Erro na busca de campanhas:', error);
        container.innerHTML = '<div class="error-state">Erro ao buscar campanhas</div>';
    }
}

async function searchNotes(searchTerm) {
    const container = document.getElementById('search-notes-list');
    
    try {
        const response = await fetch(`${API_BASE_URL}/notes`);
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        
        // A API retorna uma estrutura com "notes", "total", e "campaign_name"
        const allNotes = responseData.notes || responseData || [];
        
        const results = allNotes.filter(note => {
            return note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   note.content.toLowerCase().includes(searchTerm.toLowerCase());
        });
        
        renderSearchNotes(results, searchTerm);
        
    } catch (error) {
        console.error('Erro na busca de notas:', error);
        container.innerHTML = '<div class="error-state">Erro ao buscar notas</div>';
    }
}

function renderSearchCampaigns(campaigns, searchTerm) {
    const container = document.getElementById('search-campaigns-list');
    
    if (campaigns.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Nenhuma campanha encontrada para "${searchTerm}"</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = campaigns.map(campaign => `
        <div class="search-item" onclick="selectCampaignFromSearch(${campaign.id})">
            <div class="search-item-title">${campaign.name}</div>
            <div class="search-item-content">
                ${campaign.description || 'Sem descrição'}
            </div>
            <div class="search-item-meta">
                ID: ${campaign.id} • Criada em ${formatDate(campaign.created_at)}
            </div>
        </div>
    `).join('');
}

function renderSearchNotes(notes, searchTerm) {
    const container = document.getElementById('search-notes-list');
    
    if (notes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Nenhuma nota encontrada para "${searchTerm}"</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notes.map(note => `
        <div class="search-item" onclick="viewNoteFromSearch(${note.id}, '${escapeHtml(note.campaign_name)}')">
            <div class="search-item-title">${note.title}</div>
            <div class="search-item-content">
                ${stripHtml(note.content).substring(0, 150)}...
            </div>
            <div class="search-item-meta">
                Campanha: ${note.campaign_name} • Criada em ${formatDate(note.created_at)}
            </div>
        </div>
    `).join('');
}

function selectCampaignFromSearch(campaignId) {
    hideSearchResults();
    selectCampaign(campaignId);
}

function viewNoteFromSearch(noteId, campaignName) {
    hideSearchResults();
    
    // Encontrar a campanha pelo nome
    const campaign = AppState.campaigns.find(c => c.name === campaignName);
    if (campaign) {
        selectCampaign(campaign.id);
        
        // Scroll para a nota específica após carregar
        setTimeout(() => {
            const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
            if (noteElement) {
                noteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                noteElement.classList.add('highlight');
                setTimeout(() => noteElement.classList.remove('highlight'), 2000);
            }
        }, 500);
    } else {
        showMessage(`Campanha "${campaignName}" não encontrada`, 'error');
    }
}

function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

// Adicionar evento de Enter no campo de busca
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchAll();
            }
        });
    }
});

// ============================================================================
// INICIALIZAÇÃO DE DEBUG
// ============================================================================

// Log de inicialização com informações úteis
console.log(`
🎮 TTRPG Notes Frontend Inicializado!

⚙️  Configuração:
   API Base URL: ${API_BASE_URL}

⌨️  Atalhos Disponíveis:
   Ctrl+Enter  - Salvar nota
   Ctrl+N      - Nova nota
   Escape      - Cancelar/Fechar
   Enter       - Ação contextual

🔧 Debug:
   AppState disponível no console
   Logs detalhados ativados
`);

// Expor AppState globalmente para debug
window.AppState = AppState;
window.API_BASE_URL = API_BASE_URL;