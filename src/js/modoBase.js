import { supabase } from './supabase.js';

// Retorna o modo atual: 'nuvem' ou 'local'
export function getModo() {
  return localStorage.getItem('modoBase') || 'nuvem';
}

export function setModo(modo) {
  localStorage.setItem('modoBase', modo);
}

// Busca produtos conforme o modo
export async function getProdutos() {
  if (getModo() === 'local') {
    return JSON.parse(localStorage.getItem('produtos') || '[]');
  }

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const sigla = usuario.sigla;

  if (!sigla) return [];

  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('loja_sigla', sigla);

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }

  // Cacheia localmente
  localStorage.setItem('produtos', JSON.stringify(data));
  return data;
}

export async function getGarantias() {
  if (getModo() === 'local') {
    return JSON.parse(localStorage.getItem('garantias') || '[]');
  }

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const sigla = usuario.sigla;

  const { data, error } = await supabase
    .from('garantias')
    .select('*')
    .eq('loja_sigla', sigla);

  if (error) return [];

  localStorage.setItem('garantias', JSON.stringify(data));
  return data;
}