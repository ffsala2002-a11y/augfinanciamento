import { supabase } from './supabase.js';

const dadosErro = document.getElementById('erroLogin');
const erroSigla = document.querySelector('.erro-sigla');
const vozErroCampo = document.querySelector(".vozErroCampo");
const vozErroSigla = document.querySelector(".vozErroSigla");
const vozErroLoja = document.querySelector(".vozErroLoja");

let timeErroId;


document.getElementById('btnEntrar').addEventListener('click', async () => {
  const nome = document.getElementById('nomeUsuario').value.trim();
  const sigla = document.getElementById('siglaLoja').value.trim().toUpperCase();
  
  if (!nome || !sigla) {
    dadosErro.textContent = 'Preencha todos os campos';
    dadosErro.classList.add("active");
    
    navigator.vibrate(80);
    
    vozErroCampo.currentTime = 0;
    vozErroSigla.volume = 0.5;
    vozErroCampo.play();
    
    clearTimeout(timeErroId);
    
    timeErroId = setTimeout(() => {
      dadosErro.classList.remove("active")
    }, 1200)
    
    return
  };
  
  if (sigla.length < 3) {
    erroSigla.textContent = 'A sigla deve ter exatamente 3 caracteres';
    erroSigla.classList.add("active");
    
    navigator.vibrate(80);
    
    vozErroSigla.currentTime = 0;
    vozErroSigla.volume = 0.5;
    vozErroSigla.play();
    
    return
  };
  
  // Verifica se a loja existe no banco
  const { data, error } = await supabase
    .from('lojas')
    .select('*')
    .eq('sigla', sigla)
    .single();
  
  if (error || !data) {
    dadosErro.textContent = 'Loja não encontrada. Contate o administrador';
    dadosErro.classList.add("active");
    
    navigator.vibrate(80);
    
    vozErroLoja.currentTime = 0;
    vozErroLoja.volume = 0.5;
    vozErroLoja.play();
    
    clearTimeout(timeErroId);
    
    timeErroId = setTimeout(() => {
      dadosErro.classList.remove("active")
    }, 1200)
    return;
  }
  
  // Salva sessão local
  localStorage.setItem('usuario', JSON.stringify({ nome, sigla, nomeLoja: data.nome }));
  
  // Redireciona pro app
  window.location.href = '../../index.html';
});