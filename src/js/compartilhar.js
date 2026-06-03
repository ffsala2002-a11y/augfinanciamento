// Importa função de cálculo do financiamento
import { calcularTotal } from './calculo.js';

// Importa o carrinho atual
import { carrinho } from './carrinho.js';

// Importa função que busca imagens dos produtos
import { pegarImagens } from './imagens.js';

// Importação da função alerta
import mostrarAlerta from '../../main.js';

// Imagem padrão caso o produto não tenha foto
const placeholder =
  "https://raw.githubusercontent.com/ffsala2002-a11y/produtos-imagens/main/img-produtos/sem_img.png";

// URL base do projeto
const BASE_URL =
  "https://ffsala2002-a11y.github.io/augfinanciamentov4";

// Inicializa modal de compartilhamento
export function iniciarCompartilhar() {
  
  // Evita criar modal duplicado
  if (
    document.getElementById('modalCompartilhar')
  ) return;
  
  // Cria modal
  const modal = document.createElement('div');
  
  modal.id = 'modalCompartilhar';
  
  modal.className = 'modal-compartilhar';
  
  // HTML do modal
  modal.innerHTML = `
    
    <div class="comp-box">

      <div class="comp-handle"></div>

      <button
        class="comp-fechar"
        id="fecharCompartilhar">

        ✕

      </button>

      <p class="comp-titulo">
        Compartilhar Produtos
      </p>

      <div
        id="compProdutosList"
        class="comp-produtos-list">

      </div>

      <div class="comp-opcao-section">

        <p class="comp-pergunta">
          Incluir plano de pagamento?
        </p>

        <div class="comp-toggle-row">

          <button
            id="compSemPlano"
            class="comp-toggle ativo">

            <span class="comp-toggle-icon">
              📦
            </span>

            <span>
              Só os produtos
            </span>

          </button>

          <button
            id="compComPlano"
            class="comp-toggle">

            <span class="comp-toggle-icon">
              💳
            </span>

            <span>
              Com plano
            </span>

          </button>

        </div>

      </div>

      <div
        id="compPreviewPlano"
        class="comp-preview-plano"
        style="display:none">

        <div class="comp-plano-titulo">
          📋 Plano atual
        </div>

        <div
          id="compPlanoInfo"
          class="comp-plano-info">

        </div>

      </div>

      <button
        id="btnEnviarWhats"
        class="btn-enviar-whats">

        Enviar no WhatsApp

      </button>

    </div>
  `;
  
  // Adiciona modal no body
  document.body.appendChild(modal);
  
  // Estado do plano
  let comPlano = false;
  
  // Fecha modal no botão X
  document
    .getElementById('fecharCompartilhar')
    .onclick = fecharModal;
  
  // Fecha modal clicando fora
  modal.addEventListener('click', e => {
    
    if (e.target === modal) {
      fecharModal();
    }
  });
  
  // Ativa modo sem plano
  document
    .getElementById('compSemPlano')
    .onclick = () => {
      
      comPlano = false;
      
      document
        .getElementById('compSemPlano')
        .classList.add('ativo');
      
      document
        .getElementById('compComPlano')
        .classList.remove('ativo');
      
      document
        .getElementById('compPreviewPlano')
        .style.display = 'none';
    };
  
  // Ativa modo com plano
  document
    .getElementById('compComPlano')
    .onclick = () => {
      
      comPlano = true;
      
      document
        .getElementById('compComPlano')
        .classList.add('ativo');
      
      document
        .getElementById('compSemPlano')
        .classList.remove('ativo');
      
      document
        .getElementById('compPreviewPlano')
        .style.display = 'block';
      
      atualizarPreviewPlano();
    };
  
  // Envia mensagem no WhatsApp
  document
    .getElementById('btnEnviarWhats')
    .onclick = () => {
      
      enviarWhatsApp(
        modal._imagensCache,
        comPlano
      );
    };
  
  // Função para fechar modal
  function fecharModal() {
    
    modal.classList.remove('active');
    
    comPlano = false;
    
    document
      .getElementById('compSemPlano')
      .classList.add('ativo');
    
    document
      .getElementById('compComPlano')
      .classList.remove('ativo');
    
    document
      .getElementById('compPreviewPlano')
      .style.display = 'none';
  }
  
  // Detecta clique no botão compartilhar
  document.addEventListener('click', e => {
    
    if (
      e.target.closest(
        '#btnCompartilharFinanc'
      )
    ) {
      
      abrirCompartilharGeral();
    }
  });
}

/* Abrir modal de compartilhamento */
async function abrirCompartilharGeral() {
  
  // Verifica se há produtos
  if (!carrinho.length) {
    
    mostrarAlerta("Adicione produtos ao carrinho primeiro", "erro", 3000)
    
    return;
  }
  
  // Pega elementos do modal
  const modal =
    document.getElementById(
      'modalCompartilhar'
    );
  
  const lista =
    document.getElementById(
      'compProdutosList'
    );
  
  // Mensagem de carregamento
  lista.innerHTML = `
    <p style="
      font-size:12px;
      color:#9CA3AF;
      padding:8px 0">

      Carregando imagens...

    </p>
  `;
  
  // Exibe modal
  modal.classList.add('active');
  
  // Cache de imagens
  const imagensCache = {};
  
  // Busca imagens dos produtos
  await Promise.all(
    
    carrinho.map(async p => {
      
      try {
        
        const imgs =
          await pegarImagens(p.nce);
        
        imagensCache[p.nce] =
          imgs.length ?
          imgs :
          [placeholder];
        
      } catch {
        
        imagensCache[p.nce] = [placeholder];
      }
    })
  );
  
  // Salva cache dentro do modal
  modal._imagensCache =
    imagensCache;
  
  // Renderiza produtos
  lista.innerHTML =
    carrinho.map(p => {
      
      const imgs =
        imagensCache[p.nce] || [placeholder];
      
      return `
        <div class="comp-produto-item">

          <img
            src="${imgs[0]}"
            onerror="this.src='${placeholder}'">

          <div class="comp-produto-info">

            <span class="comp-produto-desc">
              ${p.descricao}
            </span>

            <span class="comp-produto-preco">

              ${(p.preco * p.quantidade)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}

              × ${p.quantidade}

            </span>

          </div>

        </div>
      `;
      
    }).join('');
}

/* Atualiza preview das parcelas */
function atualizarPreviewPlano() {
  
  const infoEl =
    document.getElementById(
      'compPlanoInfo'
    );
  
  // Verifica carrinho vazio
  if (!carrinho.length) {
    
    infoEl.innerHTML = `
      <p style="
        color:#e05555;
        font-size:12px;">

        Nenhum produto no carrinho

      </p>
    `;
    
    return;
  }
  
  try {
    
    // Captura valores do simulador
    const entrada =
      document.getElementById('entrada')
      ?.value || 'R$ 0,00';
    
    const taxa =
      Number(
        document.getElementById('taxa')
        ?.value || 9.9
      );
    
    const semJuros =
      document.getElementById('semJuros3x')
      ?.checked || false;
    
    const parc18 =
      document.getElementById('parc18x')
      ?.checked || false;
    
    // Converte entrada para número
    const entradaNum =
      Number(
        entrada.replace(/\D/g, '')
      ) / 100 || 0;
    
    // Soma total do carrinho
    const total =
      carrinho.reduce(
        (acc, p) =>
        acc + (p.preco * p.quantidade),
        0
      );
    
    // Valor financiado
    const financiado =
      Math.max(
        total - entradaNum,
        0
      );
    
    // Define máximo de parcelas
    const maxParcelas =
      parc18 ? 18 : 12;
    
    let html = '';
    
    // Gera parcelas
    for (let n = 1; n <= maxParcelas; n++) {
      
      const isSemJuros =
        semJuros && n <= 3;
      
      const taxaEfetiva =
        isSemJuros ? 0 : taxa;
      
      const i =
        taxaEfetiva / 100;
      
      const coef =
        i === 0 ?
        1 / n :
        (
          i * Math.pow(1 + i, n)
        ) /
        (
          Math.pow(1 + i, n) - 1
        );
      
      const valorParcela =
        financiado * coef;
      
      html += `
        <div class="plano-row">

          <span>
            ${n}x
          </span>

          <strong>
            ${valorParcela.toLocaleString(
              'pt-BR',
              {
                style: 'currency',
                currency: 'BRL'
              }
            )}
          </strong>

        </div>
      `;
    }
    
    infoEl.innerHTML = html;
    
  } catch {
    
    infoEl.innerHTML = `
      <p style="
        color:#e05555;
        font-size:12px;">

        Configure o simulador primeiro

      </p>
    `;
  }
}

/* Envia mensagem no WhatsApp */
function enviarWhatsApp(imagensCache,comPlano) {
  
  // Texto inicial
  let msg =
    `🛒 *Produtos selecionados*\n`;
  
  msg +=
    `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // Lista produtos
  carrinho.forEach((p, i) => {
    
    msg +=
      `\n*${i + 1}. ${p.descricao}*\n`;
    
    msg +=
      `P/AVISTA ${p.preco.toLocaleString(
        'pt-BR',
        {
          style: 'currency',
          currency: 'BRL'
        }
      )}`;
    
    // Quantidade
    if (p.quantidade > 1) {
      
      msg += ` × ${p.quantidade}`;
    }
    
    msg += `\n`;
    
    // Imagens
    const imgs =
      (
        imagensCache?.[p.nce] || []
      ).filter(
        u => u !== placeholder
      );
    
    // Link galeria
    if (imgs.length > 0) {
      
      const descEncoded =
        encodeURIComponent(
          p.descricao
        );
      
      const galeriaUrl =
        `${BASE_URL}/page/galeria/galeria.html?nce=${p.nce}&desc=${descEncoded}`;
      
      msg +=
        `🖼️ Ver fotos: ${galeriaUrl}\n`;
    }
  });
  
  /* Plano de pagamento */
  if (comPlano) {
    
    try {
      
      const entrada =
        document.getElementById('entrada')
        ?.value || 'R$ 0,00';
      
      const taxa =
        Number(
          document.getElementById('taxa')
          ?.value || 9.9
        );
      
      const semJuros =
        document.getElementById('semJuros3x')
        ?.checked || false;
      
      const parc18 =
        document.getElementById('parc18x')
        ?.checked || false;
      
      const entradaNum =
        Number(
          entrada.replace(/\D/g, '')
        ) / 100 || 0;
      
      const total =
        carrinho.reduce(
          (acc, p) =>
          acc + (
            p.preco * p.quantidade
          ),
          0
        );
      
      const financiado =
        Math.max(
          total - entradaNum,
          0
        );
      
      const maxParcelas =
        parc18 ? 18 : 12;
      
      msg +=
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      
      msg +=
        `💳 *Plano de pagamento*\n\n`;
      
      // Gera parcelas
      for (
        let n = 1; n <= maxParcelas; n++
      ) {
        
        const isSemJuros =
          semJuros && n <= 3;
        
        const taxaEfetiva =
          isSemJuros ?
          0 :
          taxa;
        
        const i =
          taxaEfetiva / 100;
        
        const coef =
          i === 0 ?
          1 / n :
          (
            i * Math.pow(1 + i, n)
          ) /
          (
            Math.pow(1 + i, n) - 1
          );
        
        const valorParcela =
          financiado * coef;
        
        msg +=
          `${n}x de ${valorParcela.toLocaleString(
            'pt-BR',
            {
              style: 'currency',
              currency: 'BRL'
            }
          )}`;
        
        // Marca parcelas sem juros
        if (isSemJuros) {
          msg += ` ✅`;
        }
        
        msg += `\n`;
      }
      
    } catch {}
  }
  
  // Rodapé
  msg += `\n_AUG Financeira_ ✨`;
  
  // Abre WhatsApp
  window.open(
    `https://wa.me/?text=${encodeURIComponent(msg)}`,
    '_blank'
  );
}