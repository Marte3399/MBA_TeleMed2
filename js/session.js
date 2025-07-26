// Gerenciamento de sessão e autenticação

// Verificar se o usuário está autenticado
async function isAuthenticated() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Erro ao verificar sessão:', error);
            return false;
        }
        
        return session !== null;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return false;
    }
}

// Obter dados do usuário atual
async function getCurrentUser() {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
            return null;
        }
        
        // Buscar dados adicionais do usuário na tabela users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();
        
        if (userError) {
            console.error('Erro ao buscar dados do usuário:', userError);
            return {
                id: session.user.id,
                email: session.user.email,
                name: session.user.email // fallback
            };
        }
        
        return {
            id: userData.id,
            auth_user_id: userData.auth_user_id,
            email: userData.email,
            name: userData.name,
            created_at: userData.created_at,
            updated_at: userData.updated_at
        };
        
    } catch (error) {
        console.error('Erro ao obter usuário atual:', error);
        return null;
    }
}

// Fazer logout
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('Erro ao fazer logout:', error);
            return false;
        }
        
        // Redirecionar para tela de login
        window.location.href = 'auth.html';
        return true;
        
    } catch (error) {
        console.error('Erro no logout:', error);
        return false;
    }
}

// Proteger página - redirecionar se não autenticado
async function requireAuth() {
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
        window.location.href = 'auth.html';
        return false;
    }
    
    return true;
}

// Redirecionar se já autenticado (para páginas de login)
async function redirectIfAuthenticated() {
    const authenticated = await isAuthenticated();
    
    if (authenticated) {
        window.location.href = 'index.html';
        return true;
    }
    
    return false;
}

// Listener para mudanças de autenticação
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    
    if (event === 'SIGNED_OUT') {
        // Limpar dados locais se necessário
        localStorage.removeItem('user_data');
    } else if (event === 'SIGNED_IN') {
        // Usuário logou
        console.log('Usuário logado:', session.user.email);
    } else if (event === 'TOKEN_REFRESHED') {
        // Token foi renovado automaticamente
        console.log('Token renovado');
    }
});

// Verificar expiração de token periodicamente
setInterval(async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            const now = Math.floor(Date.now() / 1000);
            const expiresAt = session.expires_at;
            
            // Se o token já expirou, redirecionar imediatamente
            if (expiresAt <= now) {
                console.log('Token expirado, redirecionando para login');
                window.location.href = 'auth.html';
                return;
            }
            
            // Se o token expira em menos de 5 minutos, tentar renovar
            if (expiresAt - now < 300) {
                console.log('Renovando token que expira em breve');
                const { error } = await supabase.auth.refreshSession();
                if (error) {
                    console.error('Erro ao renovar token:', error);
                    // Redirecionar para login se não conseguir renovar
                    window.location.href = 'auth.html';
                }
            }
        }
    } catch (error) {
        console.error('Erro na verificação de token:', error);
    }
}, 60000); // Verificar a cada minuto

// Verificar token imediatamente quando a página carrega
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            const now = Math.floor(Date.now() / 1000);
            const expiresAt = session.expires_at;
            
            // Se o token já expirou, fazer logout
            if (expiresAt <= now) {
                console.log('Token expirado na inicialização');
                await supabase.auth.signOut();
                if (window.location.pathname !== '/auth.html') {
                    window.location.href = 'auth.html';
                }
            }
        }
    } catch (error) {
        console.error('Erro na verificação inicial de token:', error);
    }
});