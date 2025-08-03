// Configuração do Supabase - Projeto Correto: Marte3399's Project
const SUPABASE_URL = 'https://xfgpoixiqppajhgkcwse.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZ3BvaXhpcXBwYWpoZ2tjd3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDYyNTEsImV4cCI6MjA2Njc4MjI1MX0.5zEXy_CnqnJYxEcdi_L3Qd_VrgyM2jiB40VLSr6brXY';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verificar se o Supabase foi inicializado corretamente
if (!supabase) {
    console.error('Erro ao inicializar Supabase');
} else {
    console.log('Supabase inicializado com sucesso');
}