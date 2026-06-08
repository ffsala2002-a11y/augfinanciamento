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

// Função de erro visual
function mostrarErro(el, msg, audio) {
  el.textContent = msg;
  el.classList.add("active");
  navigator.vibrate?.(80);
  if (audio) {
    audio.currentTime = 0;
    audio.volume = 0.5;
    audio.play();
  }
  clearTimeout(timeErroId);
  timeErroId = setTimeout(() => {
    el.classList.remove("active");
  }, 1800);
}

// Evento do botão entrar
document
  .getElementById('btnEntrar')
  .addEventListener('click', async () => {

    // Pega valores dos inputs
    const nome =
      document.getElementById('nomeUsuario')
      .value.trim();

    const sigla =
      document.getElementById('siglaLoja')
      .value.trim().toUpperCase();

    const senha =
      document.getElementById('senhaLogin')
      .value.trim();

    // Verifica campos vazios
    if (!nome || !sigla || !senha) {
      mostrarErro(
        dadosErro,
        'Preencha todos os campos',
        vozErroCampo
      );
      return;
    }

    // Verifica tamanho da sigla
    if (sigla.length < 3) {
      mostrarErro(
        erroSigla,
        'A sigla deve ter pelo menos 3 caracteres',
        vozErroSigla
      );
      return;
    }

    // Busca loja no Supabase verificando sigla + senha
    const { data, error } =
      await supabase
        .from('lojas')
        .select('*')
        .eq('sigla', sigla)
        .eq('senha', senha)
        .single();

    // Loja não encontrada ou senha errada
    if (error || !data) {
      mostrarErro(
        dadosErro,
        'Sigla ou senha incorretos',
        vozErroLoja
      );
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
