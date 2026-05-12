import { fmt } from './util.js';
import { pegarImagens } from './imagens.js';
//import { iniciarFichaTecnica } from './fichaTecnica.js';


iniciarFichaTecnica(pegarImagens);

export let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

const placeholder = "https://raw.githubusercontent.com/ffsala2002-a11y/produtos-imagens/main/img-produtos/sem_img.png";

//  cache de imagens (evita requisições repetidas)
const cacheImagens = {};

async function getImagem(nce) {
  if (cacheImagens[nce]) return cacheImagens[nce];
  
  const imgs = await pegarImagens(nce);
  cacheImagens[nce] = imgs;
  
  return imgs;
}

export function salvarCarrinho() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

export function adicionarCarrinho(produto) {
  const produtoPadrao = {
    descricao: produto.descricao || "",
    nce: produto.nce || "",
    grupo: produto.grupo || "",
    saldo: Number(produto.saldo || 0),
    cor: produto.cor || "",
    preco: Number(produto.preco) || 0
  };
  
  const produtoExistente = carrinho.find(p => p.nce === produtoPadrao.nce);
  
  if (produtoExistente) {
    produtoExistente.quantidade += 1;
  } else {
    carrinho.push({ ...produtoPadrao, quantidade: 1, garantia: 0 });
  }
  
  salvarCarrinho();
  renderSafe();
}

export function limparCarrinho() {
  carrinho.length = 0;
  salvarCarrinho();
  renderSafe();
}

//  debounce de render (evita travar UI)
let renderTimeout;

function renderSafe() {
  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(render, 50);
}

//  Render principal (SEM BLOQUEIO)
export function render() {
  const lista = document.getElementById('lista');
  const resultado = document.getElementById('resultado');
  if (!lista || !resultado) return;
  
  lista.innerHTML = '';
  const garantias = JSON.parse(localStorage.getItem('garantias') || '[]');
  
  carrinho.forEach((p, index) => {
    const div = document.createElement('div');
    div.classList.add('item');
    
    const g = garantias.find(k => k.nce === p.nce);
    const valorG1 = g ? (g.g1 || 0) * p.quantidade : 0;
    const valorG2 = g ? (g.g2 || 0) * p.quantidade : 0;
    
    //  render imediato com placeholder
    div.innerHTML = `
      <div>

        <div class="box-img-card">
          <img 
            class="img-produto" 
            src="${placeholder}" 
            data-nce="${p.nce}"
            onerror="this.src='${placeholder}'"
          >
        </div>

        <div class="box-descricao">
          <p class="descricao">${p.descricao}</p>
        </div>

        <div class="info-produto">
          <small class="NCE">NCE: ${p.nce}</small>
          <small class="grupo">Grupo: <strong>${p.grupo || "-"}</strong></small>
          <small class="saldo">Saldo: <strong>${p.saldo ?? "-"}</strong></small>
          <small class="cor">🎨: ${p.cor || "-"}</small>
        </div>

        <div class="box-quantidade">
          <div class="quantidade">Quantidade: <span>${p.quantidade}</span></div>
          <div class="buttons">
            <button class="btn-minus">−</button>
            <button class="btn-plus">+</button>
          </div>
        </div>
        
        <div class="garantia-item">
          <button class="btn-garantia ${p.garantia === 1 ? 'ativo' : ''}" data-valor="1">
            <span class="description">🛡️ GE 1</span> <span>${fmt(valorG1)}</span>
          </button>
          <button class="btn-garantia ${p.garantia === 2 ? 'ativo' : ''}" data-valor="2">
            <span class="description">🛡️ GE 2</span> <span>${fmt(valorG2)}</span>
          </button>
        </div>
      
      <button class="btn-ficha" data-index="${index}">✦ Ficha Técnica</button>

      <div>
        <strong class="valor-total">
           <span>Preço</span>
          ${(Number(p.preco) * Number(p.quantidade)).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
        </strong>
      </div>
    `;
    
    div.querySelector('.btn-ficha').onclick = () => {
      abrirFicha(p);
    };
    
    //  carrega imagem depois (sem travar)
    setTimeout(async () => {
      const imgEl = div.querySelector(".img-produto");
      if (!imgEl) return;
      
      try {
        const imgs = await getImagem(p.nce);
        imgEl.src = imgs[0] || placeholder;
      } catch {
        imgEl.src = placeholder;
      }
    }, 0);
    
    // 🔹 botões
    div.querySelector('.btn-plus').onclick = () => {
      p.quantidade++;
      salvarCarrinho();
      renderSafe();
    };
    
    div.querySelector('.btn-minus').onclick = () => {
      if (p.quantidade > 1) p.quantidade--;
      else carrinho.splice(index, 1);
      
      salvarCarrinho();
      renderSafe();
    };
    
    // ===== GARANTIA — TOGGLE =====
    div.querySelectorAll('.btn-garantia').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = Number(btn.dataset.valor);
        // Se já está ativo, desativa. Senão ativa
        p.garantia = p.garantia === val ? 0 : val;
        salvarCarrinho();
        renderSafe();
      });
    });
    
    // apagar
    const btnApagar = document.createElement('button');
    btnApagar.className = 'btn-apagar';
    btnApagar.innerHTML = `<img src="./src/img/trash-can.png">`;
    
    btnApagar.onclick = () => {
      carrinho = carrinho.filter(item => item.nce !== p.nce);
      salvarCarrinho();
      renderSafe();
      resultado.style = "display:none;";
    };
    
    div.appendChild(btnApagar);
    lista.appendChild(div);
  });
}

// 🔹 modal (mantido igual)
document.addEventListener("click", async e => {
  if (!e.target.classList.contains("img-produto")) return;
  
  const nce = e.target.dataset.nce;
  let imagensOriginais = await getImagem(nce);
  
  if (!imagensOriginais.length) return;
  
  const modal = document.getElementById("modalCarrossel");
  const track = document.getElementById("carrosselTrack");
  const indicadoresBox = document.getElementById("indicadores");
  
  track.innerHTML = "";
  indicadoresBox.innerHTML = "";
  
  let imagens = [...imagensOriginais];
  
  if (imagensOriginais.length > 1) {
    imagens = [
      imagensOriginais[imagensOriginais.length - 1],
      ...imagensOriginais,
      imagensOriginais[0]
    ];
  }
  
  imagens.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.onerror = () => img.src = placeholder;
    img.classList.add("img-carrossel");
    track.appendChild(img);
  });
  
  imagensOriginais.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.classList.add("indicador");
    if (i === 0) dot.classList.add("ativo");
    indicadoresBox.appendChild(dot);
  });
  
  let index = imagensOriginais.length > 1 ? 1 : 0;
  let startX = 0;
  
  function atualizarIndicador() {
    const dots = document.querySelectorAll(".indicador");
    dots.forEach(d => d.classList.remove("ativo"));
    
    let realIndex;
    
    if (imagensOriginais.length === 1) {
      realIndex = 0;
    } else {
      realIndex = index - 1;
      
      if (index === 0) realIndex = imagensOriginais.length - 1;
      if (index === imagensOriginais.length + 1) realIndex = 0;
    }
    
    dots[realIndex]?.classList.add("ativo");
  }
  
  modal.style.display = "flex";
  track.style.transition = "none";
  track.style.transform = `translateX(-${index * 100}%)`;
  
  setTimeout(() => { track.style.transition = "transform 0.3s ease" }, 50);
  
  atualizarIndicador();
  
  track.ontouchstart = ev => { startX = ev.touches[0].clientX; };
  
  track.ontouchend = ev => {
    const endX = ev.changedTouches[0].clientX;
    const diff = startX - endX;
    
    if (diff > 50) index++;
    if (diff < -50) index--;
    
    track.style.transform = `translateX(-${index * 100}%)`;
    atualizarIndicador();
    
    if (imagensOriginais.length > 1) {
      setTimeout(() => {
        if (index === 0) index = imagensOriginais.length;
        if (index === imagensOriginais.length + 1) index = 1;
        
        track.style.transition = "none";
        track.style.transform = `translateX(-${index * 100}%)`;
        
        atualizarIndicador();
        
        setTimeout(() => { track.style.transition = "transform 0.3s ease" }, 50);
      }, 300);
    }
  };
});

document.getElementById("fecharModal").onclick = () => {
  document.getElementById("modalCarrossel").style.display = "none";
};

document.addEventListener("DOMContentLoaded", () => {
  render();
});
