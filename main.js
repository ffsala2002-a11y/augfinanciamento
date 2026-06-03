// imports
import { supabase } from './src/js/supabase.js';
import { iniciarBancoImagens, pegarImagens } from './src/js/imagens.js';
import { carregarBase, limparBase } from './src/js/base.js';
import { adicionarCarrinho, limparCarrinho, carrinho } from './src/js/carrinho.js';
import uploadLateral from './src/js/uploadLateral.js';
import { lupaMovie } from './src/js/lupaMovie.js';
//import { popupMobile } from './src/js/popup.js';
import { getProdutos, getGarantias, getModo, setModo } from './src/js/modoBase.js';
import { iniciarCompartilhar } from './src/js/compartilhar.js';
import { iniciarFinanciamento, renderFinanciamento } from './src/js/financiamento.js';


// html carregado
document.addEventListener('DOMContentLoaded', () => {
  
  document
    .getElementById('home')
    ?.classList.add('active');
  
});


// proteção de rota
const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

if (!usuario) {
  window.location.href = './page/login/login.html';
}


// init
iniciarBancoImagens();


// elementos
const fileProdutos = document.getElementById('fileProdutos');
const fileGarantias = document.getElementById('fileGarantias');
const msg = document.getElementById('msg');
const busca = document.getElementById('busca');
const sugestoes = document.getElementById('sugestoes');
const sugestoesBody = document.getElementById('sugestoesBody');
const nuvemAtivo = document.getElementById('nuvemAtivo');
const localAtivo = document.getElementById('localAtivo');


// nome da loja
const nomeLojaEl = document.getElementById('nomeLoja');

if (nomeLojaEl) {
  nomeLojaEl.innerText = usuario?.sigla || '';
}


// modo nuvem / local
const btnModoNuvem = document.getElementById('btnModoNuvem');
const btnModoLocal = document.getElementById('btnModoLocal');

function atualizarBotoesModo() {
  
  const modo = getModo();
  
  btnModoNuvem?.classList.toggle(
    'ativo',
    modo === 'nuvem'
  );
  
  btnModoLocal?.classList.toggle(
    'ativo',
    modo === 'local'
  );
}

btnModoNuvem?.addEventListener('click', () => {
  
  setModo('nuvem');
  
  atualizarBotoesModo();
  
  inicializarProdutos();
  
  mostrarAlerta(
    '☁️ Banco nuvem ativado!',
    'sucesso'
  );
  
  nuvemAtivo.currentTime = 0;
  
  nuvemAtivo.volume = 0.5;
  
  nuvemAtivo.play();
});

btnModoLocal?.addEventListener('click', () => {
  
  setModo('local');
  
  atualizarBotoesModo();
  
  inicializarProdutos();
  
  mostrarAlerta(
    '💾 Banco local ativado!',
    'info'
  );
  
  localAtivo.currentTime = 0;
  
  localAtivo.volume = 0.5;
  
  localAtivo.play();
});

atualizarBotoesModo();


// logout
document
  .getElementById('btnLogout')
  ?.addEventListener('click', () => {
    
    localStorage.removeItem('usuario');
    
    window.location.href =
      './page/login/login.html';
  });


// produtos
let produtosCache = [];

async function inicializarProdutos() {
  
  const { data, error } =
  await supabase
    .from('lojas')
    .select('sigla')
    .eq('sigla', usuario.sigla)
    .single();
  
  if (error || !data) {
    
    mostrarAlerta(
      '⚠️ Sua loja foi removida. Você será deslogado.',
      'erro',
      3000
    );
    
    setTimeout(() => {
      
      localStorage.removeItem('usuario');
      localStorage.removeItem('produtos');
      localStorage.removeItem('garantias');
      localStorage.removeItem('carrinho');
      
      window.location.href =
        './page/login/login.html';
      
    }, 3000);
    
    return;
  }
  
  produtosCache = await getProdutos();
  
  await getGarantias();
  
  atualizarResumoBase();
  
  exibirUltimaImportacao();
}

inicializarProdutos();


// última importação
async function exibirUltimaImportacao() {
  
  if (!usuario?.sigla) return;
  
  const { data, error } =
  await supabase
    .from('lojas')
    .select('ultima_importacao')
    .eq('sigla', usuario.sigla)
    .single();
  
  const el =
    document.getElementById(
      'dataImportacao'
    );
  
  if (!el) return;
  
  if (
    error ||
    !data?.ultima_importacao
  ) {
    
    el.innerText = 'Nunca importado';
    
    return;
  }
  
  const dataHora =
    new Date(
      data.ultima_importacao + 'Z'
    );
  
  el.innerText =
    dataHora.toLocaleString(
      'pt-BR',
      {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
}


// alerta
export default function mostrarAlerta(mensagem, tipo = "erro", tempo = 3000) {
  
  let alerta = document.getElementById("alerta");
  
  if (!alerta) {
    
    alerta = document.createElement("div");
    
    alerta.id = "alerta";
    
    alerta.className = "alerta";
    
    document.body.appendChild(alerta);
  }
  
  alerta.innerText = mensagem;
  
  if (tipo === "erro") {
    alerta.style.background = "#f44336";
  }
  
  else if (tipo === "sucesso") {
    alerta.style.background = "#4CAF50";
  }
  
  else {
    alerta.style.background = "#0068bd";
  }
  
  void alerta.offsetWidth;
  
  alerta.classList.add("show");
  
  navigator.vibrate(90)
  
  setTimeout(() => {
    alerta.classList.remove("show");
  }, tempo);
}


// base local
document
  .getElementById('btnSalvar')
  .addEventListener('click', () => {
    
    if (
      !fileProdutos.files[0] ||
      !fileGarantias.files[0]
    ) {
      
      mostrarAlerta(
        'Você precisa selecionar os dois arquivos.',
        'erro'
      );
      
      return;
    }
    
    carregarBase(
      fileProdutos.files[0],
      fileGarantias.files[0],
      len => {
        
        mostrarAlerta(
          `✔ Base carregada (${len} produtos)`,
          'sucesso'
        );
        
        inicializarProdutos();
      }
    );
  });

document
  .getElementById('btnLimparBase')
  .addEventListener('click', () => {
    
    limparBase();
    
    msg.innerText = '';
    
    limparCarrinho();
    
    mostrarAlerta(
      'Base e carrinho limpos.',
      'info'
    );
    
    produtosCache = [];
    
    document.getElementById(
      "totalProdutos"
    ).innerText = 0;
    
    document.getElementById(
      "totalSaldo"
    ).innerText = 0;
    
    document.getElementById(
      "totalGarantias"
    ).innerText = 0;
  });


// busca
let buscaAtual = 0;

const placeholder =
  "https://raw.githubusercontent.com/ffsala2002-a11y/produtos-imagens/main/img-produtos/sem_img.png";

busca.addEventListener('input', () => {
  
  const idBusca = ++buscaAtual;
  
  const q =
    busca.value
    .toLowerCase()
    .trim();
  
  sugestoesBody.innerHTML = '';
  
  if (!q) {
    
    sugestoes.style.display = 'none';
    
    return;
  }
  
  const filtrados =
    produtosCache
    .filter(p =>
      String(p.nce) === q ||
      String(p.nce).includes(q) ||
      p.descricao
      .toLowerCase()
      .includes(q)
    )
    .slice(0, 25);
  
  filtrados.forEach(p => {
    
    if (idBusca !== buscaAtual) return;
    
    const tr =
      document.createElement('tr');
    
    tr.innerHTML = `
      <td>
        <img class="img-sugestao"
          src="${placeholder}"
          loading="lazy">
      </td>

      <td>${p.nce}</td>

      <td>
        <span class="descricao">
          ${p.descricao}
        </span>
      </td>

      <td>
        <span class="preco">
          ${p.preco.toLocaleString(
            'pt-BR',
            {
              style:'currency',
              currency:'BRL'
            }
          )}
        </span>
      </td>

      <td>
        <span class="saldo">
          ${p.saldo}
        </span>
      </td>
    `;
    
    pegarImagens(p.nce)
      .then(imgs => {
        
        if (
          idBusca !== buscaAtual
        ) return;
        
        const imgEl =
          tr.querySelector("img");
        
        if (imgEl) {
          
          imgEl.src = imgs[0];
          
          imgEl.onerror = () => {
            imgEl.src = placeholder;
          };
        }
      });
    
    tr.onclick = () => {
      
      adicionarCarrinho(p);
      
      busca.value = '';
      
      sugestoes.style.display = 'none';
    };
    
    sugestoesBody.appendChild(tr);
  });
  
  sugestoes.style.display =
    filtrados.length ?
    'block' :
    'none';
});

document
  .getElementById("deleteInput")
  .addEventListener('click', () => {
    
    busca.value = "";
    
    busca.focus();
    
    sugestoes.style.display = 'none';
  });


// resumo
function atualizarResumoBase() {
  
  document.getElementById(
    "totalProdutos"
  ).innerText = produtosCache.length;
  
  document.getElementById(
      "totalSaldo"
    ).innerText =
    produtosCache.reduce(
      (acc, p) =>
      acc + (
        Number(p.saldo) || 0
      ),
      0
    );
  
  const garantias =
    JSON.parse(
      localStorage.getItem(
        "garantias"
      ) || "[]"
    );
  
  document.getElementById(
    "totalGarantias"
  ).innerText = garantias.length;
}


// spinner / internet
const fundoSpiner = document.getElementById("fundo-spiner");
const textSpin = document.getElementById("textSpin");

let timeId;

function mostrarSpinner() {
  
  if (!fundoSpiner) return;
  textSpin.textContent = "Sem conexão..."
  
  fundoSpiner.classList.remove(
    "active"
  );
}

function esconderSpinner() {
  
  if (!fundoSpiner) return;
  
  clearTimeout(timeId);
  textSpin.textContent = "Carregando..."
  
  timeId = setTimeout(() => {
    
    fundoSpiner.classList.add(
      "active"
    );
    
  }, 1500)
}


// load página
window.addEventListener("load", () => {
  
  if (navigator.onLine) {
    esconderSpinner();
  }
  
  else {
    mostrarSpinner();
  }
});


// offline
window.addEventListener("offline", () => {
  
  mostrarSpinner();
  
  mostrarAlerta(
    "Sem conexão com internet",
    "erro",
    4000
  );
});


// online
window.addEventListener("online", () => {
  
  mostrarAlerta(
    "Internet reconectada",
    "sucesso",
    2000
  );
  
  esconderSpinner()
});


// scanner
const btnScan =
  document.getElementById(
    "btn-scan"
  );

const overlay =
  document.getElementById(
    "scannerOverlay"
  );

const fecharScanner =
  document.getElementById(
    "fecharScanner"
  );

const container =
  document.getElementById(
    "scanner-container"
  );

const contadorEl =
  document.getElementById(
    "contadorLeitura"
  );

const ultimoProdutoEl =
  document.getElementById(
    "ultimoProduto"
  );

let stream = null;
let detector = null;
let rodando = false;
let contador = 0;
let ultimoCodigo = null;
let ultimoTempo = 0;


// áudio scanner
const audioCtx =
  new(
    window.AudioContext ||
    window.webkitAudioContext
  )();

function beep() {
  
  const osc =
    audioCtx.createOscillator();
  
  const gain =
    audioCtx.createGain();
  
  osc.type = "square";
  
  osc.frequency.setValueAtTime(
    1200,
    audioCtx.currentTime
  );
  
  gain.gain.setValueAtTime(
    0.25,
    audioCtx.currentTime
  );
  
  osc.connect(gain);
  
  gain.connect(
    audioCtx.destination
  );
  
  osc.start();
  
  osc.stop(
    audioCtx.currentTime + 0.08
  );
}


// extrair nce
function extrairNCE(codigo) {
  
  const clean =
    String(codigo)
    .replace(/\D/g, '');
  
  if (
    clean.startsWith("01") &&
    clean.length >= 14
  ) {
    
    return clean
      .substring(2, 16)
      .slice(-6);
  }
  
  return clean.slice(-6);
}


// eventos scanner
btnScan?.addEventListener(
  "click",
  iniciarScanner
);

fecharScanner?.addEventListener(
  "click",
  pararScanner
);


// iniciar scanner
async function iniciarScanner() {
  
  overlay?.classList.add(
    "active"
  );
  
  contador = 0;
  
  if (contadorEl) {
    contadorEl.innerText = "0";
  }
  
  if (ultimoProdutoEl) {
    ultimoProdutoEl.innerHTML = "";
  }
  
  try {
    
    stream =
      await navigator
      .mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment"
        }
      });
    
  } catch (err) {
    
    mostrarAlerta(
      "Erro ao acessar câmera",
      "erro"
    );
    
    return;
  }
  
  const video =
    document.createElement("video");
  
  video.srcObject = stream;
  
  video.setAttribute(
    "playsinline",
    true
  );
  
  video.autoplay = true;
  
  container.innerHTML = '';
  
  container.appendChild(video);
  
  await video.play();
  
  if ("BarcodeDetector" in window) {
    
    detector =
      new BarcodeDetector({
        formats: [
          "ean_13",
          "code_128"
        ]
      });
    
    rodando = true;
    
    scanLoop(video);
    
    mostrarAlerta(
      "Scanner ativo",
      "sucesso"
    );
    
  } else {
    
    mostrarAlerta(
      "Modo compatível ativado",
      "info"
    );
    
    iniciarQuaggaFallback();
  }
}


// loop scanner
async function scanLoop(video) {
  
  if (!rodando) return;
  
  try {
    
    const barcodes =
      await detector.detect(video);
    
    if (barcodes.length) {
      
      processarCodigo(
        barcodes[0].rawValue
      );
    }
    
  } catch (e) {}
  
  requestAnimationFrame(() =>
    scanLoop(video)
  );
}


// fallback quagga
function iniciarQuaggaFallback() {
  
  Quagga.init({
    
    inputStream: {
      type: "LiveStream",
      target: container,
      constraints: {
        facingMode: "environment"
      }
    },
    
    decoder: {
      readers: [
        "ean_reader",
        "code_128_reader"
      ]
    }
    
  }, err => {
    
    if (err) {
      
      mostrarAlerta(
        "Erro no scanner",
        "erro"
      );
      
      return;
    }
    
    Quagga.start();
  });
  
  Quagga.onDetected(data => {
    
    processarCodigo(
      data.codeResult.code
    );
  });
}


// processar código
function processarCodigo(codigo) {
  
  const nce =
    extrairNCE(codigo);
  
  const agora = Date.now();
  
  if (
    nce === ultimoCodigo &&
    (agora - ultimoTempo) < 2000
  ) {
    return;
  }
  
  ultimoCodigo = nce;
  
  ultimoTempo = agora;
  
  const produto =
    produtosCache.find(
      p => String(p.nce) === nce
    );
  
  if (produto) {
    
    adicionarCarrinho(produto);
    
    beep();
    
    contador++;
    
    if (contadorEl) {
      contadorEl.innerText = contador;
    }
    
    if (ultimoProdutoEl) {
      
      ultimoProdutoEl.innerHTML = `
        <strong>
          ${produto.descricao}
        </strong>

        <br>

        <span class="preco-scan">

          ${produto.preco.toLocaleString(
            'pt-BR',
            {
              style: 'currency',
              currency: 'BRL'
            }
          )}

        </span>
      `;
    }
    
    mostrarAlerta(
      "✔ Produto adicionado",
      "sucesso"
    );
    
  } else {
    
    mostrarAlerta(
      "Produto não encontrado",
      "erro"
    );
  }
}


// parar scanner
function pararScanner() {
  
  rodando = false;
  
  if (stream) {
    
    stream
      .getTracks()
      .forEach(t => t.stop());
    
    stream = null;
  }
  
  if (
    typeof Quagga !== "undefined"
  ) {
    
    try {
      
      Quagga.stop();
      
      Quagga.offDetected();
      
    } catch {}
  }
  
  container.innerHTML = '';
  
  overlay?.classList.remove(
    "active"
  );
}


// init final
uploadLateral();

lupaMovie();

//popupMobile();

iniciarCompartilhar();

iniciarFinanciamento();

renderFinanciamento();


localStorage.clear()
