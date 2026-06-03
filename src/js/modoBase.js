import { supabase } from './supabase.js';

// Retorna o modo atual
// Pode ser: "nuvem" ou "local"
export function getModo() {
  
  return (
    localStorage.getItem('modoBase') ||
    'nuvem'
  );
}

// Salva modo atual
export function setModo(modo) {
  
  localStorage.setItem(
    'modoBase',
    modo
  );
}

// Busca produtos
export async function getProdutos() {
  
  // Se estiver no modo local
  if (getModo() === 'local') {
    
    return JSON.parse(
      localStorage.getItem('produtos') ||
      '[]'
    );
  }
  
  // Busca usuário salvo
  const usuario =
    JSON.parse(
      localStorage.getItem('usuario') ||
      '{}'
    );
  
  const sigla =
    usuario.sigla;
  
  // Se não tiver sigla
  if (!sigla) return [];
  
  // Busca produtos no Supabase
  const { data, error } =
  await supabase
    .from('produtos')
    .select('*')
    .eq('loja_sigla', sigla);
  
  // Se der erro
  if (error) {
    
    console.error(
      'Erro ao buscar produtos:',
      error
    );
    
    return [];
  }
  
  // Salva cache local
  localStorage.setItem(
    'produtos',
    JSON.stringify(data)
  );
  
  return data;
}

// Busca garantias
export async function getGarantias() {
  
  // Se estiver no modo local
  if (getModo() === 'local') {
    
    return JSON.parse(
      localStorage.getItem('garantias') ||
      '[]'
    );
  }
  
  // Busca usuário salvo
  const usuario =
    JSON.parse(
      localStorage.getItem('usuario') ||
      '{}'
    );
  
  const sigla =
    usuario.sigla;
  
  // Busca garantias no Supabase
  const { data, error } =
  await supabase
    .from('garantias')
    .select('*')
    .eq('loja_sigla', sigla);
  
  // Se der erro
  if (error) {
    
    return [];
  }
  
  // Salva cache local
  localStorage.setItem(
    'garantias',
    JSON.stringify(data)
  );
  
  return data;
}