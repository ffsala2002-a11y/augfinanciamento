// Imports principais do sistema
import { fmt } from './util.js';
import { pegarImagens } from './imagens.js';
import { renderFinanciamento } from './financiamento.js';

// Carrinho salvo no localStorage
export let carrinho =
  JSON.parse(localStorage.getItem('carrinho')) || [];

// Imagem padrão caso não exista imagem do produto
const placeholder =
  "https://raw.githubusercontent.com/ffsala2002-a11y/produtos-imagens/main/img-produtos/sem_img.png";

// Cache das imagens já carregadas
const cacheImagens = {};

// Busca imagem do produto
async function getImagem(nce) {
  
  // Retorna do cache se já existir
  if (cacheImagens[nce]) {
    return cacheImagens[nce];
  }
  
  // Busca imagens
  const imgs = await pegarImagens(nce);
  
  // Salva no cache
  cacheImagens[nce] = imgs;
  
  return imgs;
}

// Salva carrinho no localStorage
export function salvarCarrinho() {
  
  localStorage.setItem(
    'carrinho',
    JSON.stringify(carrinho)
  );
}

// Adiciona produto ao carrinho
export function adicionarCarrinho(produto) {
  
  // Estrutura padrão do produto
  const produtoPadrao = {
    descricao: produto.descricao || "",
    nce: produto.nce || "",
    grupo: produto.grupo || "",
    saldo: Number(produto.saldo || 0),
    cor: produto.cor || "",
    preco: Number(produto.preco) || 0
  };
  
  // Procura produto já existente
  const produtoExistente =
    carrinho.find(
      p => p.nce === produtoPadrao.nce
    );
  
  // Se existir aumenta quantidade
  if (produtoExistente) {
    
    produtoExistente.quantidade += 1;
    
  } else {
    
    // Se não existir cria novo item
    carrinho.push({
      ...produtoPadrao,
      quantidade: 1,
      garantia: 0
    });
  }
  
  // Salva alterações
  salvarCarrinho();
  
  // Atualiza tela
  render();
  
  // Atualiza financiamento
  renderFinanciamento();
}

// Limpa todo carrinho
export function limparCarrinho() {
  
  carrinho.length = 0;
  
  salvarCarrinho();
  
  render();
  
  renderFinanciamento();
}

// Timeout do render
let renderTimeout;

// Renderização segura
function renderSafe() {
  
  clearTimeout(renderTimeout);
  
  renderTimeout = setTimeout(() => {
    
    render();
    
    renderFinanciamento();
    
  }, 10);
}

// Renderiza carrinho na tela
export function render() {
  
  // Lista do carrinho
  const lista =
    document.getElementById('lista');
  
  // Verifica se existe
  if (!lista) return;
  
  // Limpa lista
  lista.innerHTML = '';
  
  // Busca garantias
  const garantias =
    JSON.parse(
      localStorage.getItem('garantias') || '[]'
    );
  
  // Percorre carrinho
  carrinho.forEach((p, index) => {
    
    // Cria card
    const div =
      document.createElement('div');
    
    div.classList.add('item');
    
    // Busca garantia do produto
    const g =
      garantias.find(
        k => k.nce === p.nce
      );
    
    // Valor garantia 1
    const valorG1 =
      g ? (g.g1 || 0) * p.quantidade : 0;
    
    // Valor garantia 2
    const valorG2 =
      g ? (g.g2 || 0) * p.quantidade : 0;
    
    // Estrutura HTML do produto
    div.innerHTML = `
      <div>
      
      <div class="linha"></div>
        <div class="box-img-card">

          <img
            class="img-produto"
            src="${placeholder}"
            data-nce="${p.nce}"
            onerror="this.src='${placeholder}'">

        </div>

        <div class="box-descricao">

          <p class="descricao">
            ${p.descricao}
          </p>

        </div>

        <div class="info-produto">

          <small class="NCE">
            NCE: <span>${p.nce}</span>
          </small>

          <small class="grupo">
            Grupo:
            <strong>${p.grupo || "-"}</strong>
          </small>

          <small class="saldo">
            Saldo:
            <strong>${p.saldo ?? "-"}</strong>
          </small>

          <small class="cor">
            🎨: ${p.cor || "-"}
          </small>

        </div>

        <div class="box-quantidade">

          <div class="quantidade">

            Quantidade:
            <span>${p.quantidade}</span>

          </div>

          <div class="buttons">

            <button class="btn-minus">
              −
            </button>

            <button class="btn-plus">
              +
            </button>

          </div>

        </div>

        <div class="garantia-item">

          <button
            class="btn-garantia ${p.garantia === 1 ? 'ativo' : ''}"
            data-valor="1">

            <span class="description">
              🛡️ GE 1
            </span>

            <span>
              ${fmt(valorG1)}
            </span>

          </button>

          <button
            class="btn-garantia ${p.garantia === 2 ? 'ativo' : ''}"
            data-valor="2">

            <span class="description">
              🛡️ GE 2
            </span>

            <span>
              ${fmt(valorG2)}
            </span>

          </button>

        </div>

        <div>

          <strong class="valor-total">

            <span>Preço</span>

            ${(Number(p.preco) * Number(p.quantidade))
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}

          </strong>

        </div>

      </div>
    `;
    
    // Carrega imagem do produto
    setTimeout(async () => {
      
      const imgEl =
        div.querySelector('.img-produto');
      
      if (!imgEl) return;
      
      try {
        
        // Busca imagens
        const imgs =
          await getImagem(p.nce);
        
        // Define imagem
        imgEl.src =
          imgs[0] || placeholder;
        
      } catch {
        
        // Fallback
        imgEl.src = placeholder;
      }
      
    }, 0);
    
    // Botão aumentar quantidade
    div.querySelector('.btn-plus').onclick = () => {
      
      p.quantidade++;
      
      salvarCarrinho();
      
      renderSafe();
    };
    
    // Botão diminuir quantidade
    div.querySelector('.btn-minus').onclick = () => {
      
      // Se quantidade maior que 1
      if (p.quantidade > 1) {
        
        p.quantidade--;
        
      } else {
        
        // Remove item
        carrinho.splice(index, 1);
      }
      
      salvarCarrinho();
      
      renderSafe();
    };
    
    // Botões de garantia
    div
      .querySelectorAll('.btn-garantia')
      .forEach(btn => {
        
        btn.addEventListener('click', () => {
          
          // Valor da garantia
          const val =
            Number(btn.dataset.valor);
          
          // Ativa/desativa garantia
          p.garantia =
            p.garantia === val ?
            0 :
            val;
          
          salvarCarrinho();
          
          renderSafe();
        });
      });
    
    // Cria botão apagar
    const btnApagar =
      document.createElement('button');
    
    btnApagar.className =
      'btn-apagar';
    
    btnApagar.innerHTML =
      `<img src="./src/img/trash-can.png">`;
    
    // Evento apagar item
    btnApagar.onclick = () => {
      
      carrinho.splice(index, 1);
      
      salvarCarrinho();
      
      renderSafe();
    };
    
    // Adiciona botão no card
    div.appendChild(btnApagar);
    
    // Adiciona card na lista
    lista.appendChild(div);
  });
}

// Evento global para abrir modal das imagens
document.addEventListener(
  'click',
  async e => {
    
    // Verifica clique na imagem
    if (
      !e.target.classList.contains(
        'img-produto'
      )
    ) return;
    
    // Pega NCE
    const nce =
      e.target.dataset.nce;
    
    // Busca imagens
    const imagensOriginais =
      await getImagem(nce);
    
    // Verifica se existem imagens
    if (!imagensOriginais.length) return;
    
    // Elementos do modal
    const modal =
      document.getElementById(
        'modalCarrossel'
      );
    
    const track =
      document.getElementById(
        'carrosselTrack'
      );
    
    const indicadoresBox =
      document.getElementById(
        'indicadores'
      );
    
    // Segurança
    if (!modal || !track || !indicadoresBox) return;
    
    // Limpa conteúdo antigo
    track.innerHTML = '';
    
    indicadoresBox.innerHTML = '';
    
    // Array de imagens
    let imagens = [...imagensOriginais];
    
    // Adiciona imagens extras para efeito infinito
    if (imagensOriginais.length > 1) {
      
      imagens = [
        imagensOriginais[
          imagensOriginais.length - 1
        ],
        ...imagensOriginais,
        imagensOriginais[0]
      ];
    }
    
    // Cria imagens do carrossel
    imagens.forEach(src => {
      
      const img =
        document.createElement('img');
      
      img.src = src;
      
      img.onerror = () => {
        img.src = placeholder;
      };
      
      img.classList.add(
        'img-carrossel'
      );
      
      track.appendChild(img);
    });
    
    // Cria indicadores
    imagensOriginais.forEach((_, i) => {
      
      const dot =
        document.createElement('div');
      
      dot.classList.add('indicador');
      
      if (i === 0) {
        dot.classList.add('ativo');
      }
      
      indicadoresBox.appendChild(dot);
    });
    
    // Índice inicial
    let index =
      imagensOriginais.length > 1 ?
      1 :
      0;
    
    // Controle touch
    let startX = 0;
    
    // Atualiza indicador ativo
    function atualizarIndicador() {
      
      const dots =
        document.querySelectorAll(
          '.indicador'
        );
      
      dots.forEach(d =>
        d.classList.remove('ativo')
      );
      
      let realIndex;
      
      if (imagensOriginais.length === 1) {
        
        realIndex = 0;
        
      } else {
        
        realIndex = index - 1;
        
        if (index === 0) {
          realIndex =
            imagensOriginais.length - 1;
        }
        
        if (
          index ===
          imagensOriginais.length + 1
        ) {
          realIndex = 0;
        }
      }
      
      dots[realIndex]
        ?.classList.add('ativo');
    }
    
    // Abre modal
    modal.style.display = 'flex';
    
    // Remove transição temporariamente
    track.style.transition = 'none';
    
    // Posiciona slide inicial
    track.style.transform =
      `translateX(-${index * 100}%)`;
    
    // Reativa animação
    setTimeout(() => {
      
      track.style.transition =
        'transform 0.3s ease';
      
    }, 50);
    
    atualizarIndicador();
    
    // Início do toque
    track.ontouchstart = ev => {
      
      startX =
        ev.touches[0].clientX;
    };
    
    // Final do toque
    track.ontouchend = ev => {
      
      const endX =
        ev.changedTouches[0].clientX;
      
      const diff =
        startX - endX;
      
      // Próxima imagem
      if (diff > 50) index++;
      
      // Imagem anterior
      if (diff < -50) index--;
      
      // Move carrossel
      track.style.transform =
        `translateX(-${index * 100}%)`;
      
      atualizarIndicador();
      
      // Loop infinito
      if (imagensOriginais.length > 1) {
        
        setTimeout(() => {
          
          if (index === 0) {
            index =
              imagensOriginais.length;
          }
          
          if (
            index ===
            imagensOriginais.length + 1
          ) {
            index = 1;
          }
          
          track.style.transition =
            'none';
          
          track.style.transform =
            `translateX(-${index * 100}%)`;
          
          atualizarIndicador();
          
          setTimeout(() => {
            
            track.style.transition =
              'transform 0.3s ease';
            
          }, 50);
          
        }, 300);
      }
    };
  }
);

// Botão fechar modal
const fecharModal =
  document.getElementById('fecharModal');

if (fecharModal) {
  
  fecharModal.onclick = () => {
    
    const modal =
      document.getElementById(
        'modalCarrossel'
      );
    
    // Fecha modal
    if (modal) {
      modal.style.display = 'none';
    }
  };
}

// Quando carregar página
document.addEventListener(
  'DOMContentLoaded',
  () => {
    
    // Renderiza carrinho
    render();
    
    // Renderiza financiamento
    renderFinanciamento();
  }
);