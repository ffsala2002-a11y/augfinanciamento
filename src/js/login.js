import { supabase } from './supabase.js';

// Elementos de erro
const dadosErro =
  document.getElementById('erroLogin');

const erroSigla =
  document.querySelector('.erro-sigla');

// Áudios de erro
const vozErroCampo =
  document.querySelector(".vozErroCampo");

const vozErroSigla =
  document.querySelector(".vozErroSigla");

const vozErroLoja =
  document.querySelector(".vozErroLoja");

// Controle do timeout
let timeErroId;

// Evento do botão entrar
document
  .getElementById('btnEntrar')
  .addEventListener('click', async () => {
    
    // Pega valores dos inputs
    const nome =
      document.getElementById('nomeUsuario')
      .value
      .trim();
    
    const sigla =
      document.getElementById('siglaLoja')
      .value
      .trim()
      .toUpperCase();
    
    // Verifica campos vazios
    if (!nome || !sigla) {
      
      dadosErro.textContent =
        'Preencha todos os campos';
      
      dadosErro.classList.add("active");
      
      // Vibração
      navigator.vibrate(80);
      
      // Som erro campo
      vozErroCampo.currentTime = 0;
      vozErroSigla.volume = 0.5;
      vozErroCampo.play();
      
      // Limpa timeout anterior
      clearTimeout(timeErroId);
      
      // Remove erro depois
      timeErroId = setTimeout(() => {
        
        dadosErro.classList.remove("active");
        
      }, 1200);
      
      return;
    }
    
    // Verifica tamanho da sigla
    if (sigla.length < 3) {
      
      erroSigla.textContent =
        'A sigla deve ter exatamente 3 caracteres';
      
      erroSigla.classList.add("active");
      
      navigator.vibrate(80);
      
      // Som erro sigla
      vozErroSigla.currentTime = 0;
      vozErroSigla.volume = 0.5;
      vozErroSigla.play();
      
      return;
    }
    
    // Busca loja no Supabase
    const { data, error } =
    await supabase
      .from('lojas')
      .select('*')
      .eq('sigla', sigla)
      .single();
    
    // Loja não encontrada
    if (error || !data) {
      
      dadosErro.textContent =
        'Loja não encontrada. Contate o administrador';
      
      dadosErro.classList.add("active");
      
      navigator.vibrate(80);
      
      // Som erro loja
      vozErroLoja.currentTime = 0;
      vozErroLoja.volume = 0.5;
      vozErroLoja.play();
      
      clearTimeout(timeErroId);
      
      // Remove mensagem depois
      timeErroId = setTimeout(() => {
        
        dadosErro.classList.remove("active");
        
      }, 1200);
      
      return;
    }
    
    // Salva sessão local
    localStorage.setItem(
      'usuario',
      JSON.stringify({
        nome,
        sigla,
        nomeLoja: data.nome
      })
    );
    
    // Redireciona para o app
    window.location.href = '../../index.html';
  });