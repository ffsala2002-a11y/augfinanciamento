// Importa função de cálculo do financiamento
import { calcularTotal } from './calculo.js';

// Importa o carrinho atual
import { carrinho } from './carrinho.js';

// Importa função que busca imagens dos produtos
import { pegarImagens } from './imagens.js';

// Importa cálculo das garantias
import { calcularGarantiaTotal } from './garantias.js';

// Importação da função alerta
import mostrarAlerta from '../../main.js';


// Imagem padrão caso o produto não tenha foto
const placeholder =
  "https://raw.githubusercontent.com/ffsala2002-a11y/produtos-imagens/main/img-produtos/sem_img.png";


// URL base do projeto
const BASE_URL =
  "https://ffsala2002-a11y.github.io/augfinanciamentov4";


// ================= TOTAL COM GARANTIA =================

function pegarTotalFinanciamento() {
  
  const totalProdutos =
    carrinho.reduce(
      (acc, p) =>
      acc + (p.preco * p.quantidade),
      0
    );
  
  
  const totalGarantia =
    calcularGarantiaTotal(carrinho) || 0;
  
  
  return totalProdutos + totalGarantia;
}


// Inicializa modal de compartilhamento
export function iniciarCompartilhar() {
  
  if (
    document.getElementById('modalCompartilhar')
  ) return;
  
  
  const modal = document.createElement('div');
  
  modal.id = 'modalCompartilhar';
  
  modal.className = 'modal-compartilhar';
  
  
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

            📦 Só os produtos

          </button>


          <button
            id="compComPlano"
            class="comp-toggle">

            💳 Com plano

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
  
  
  document.body.appendChild(modal);
  
  
  let comPlano = false;
  
  
  document
    .getElementById('fecharCompartilhar')
    .onclick = fecharModal;
  
  
  
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
  
  
  
  // WhatsApp
  
  document
    .getElementById('btnEnviarWhats')
    .onclick = () => {
      
      enviarWhatsApp(
        modal._imagensCache,
        comPlano
      );
      
    };
  
  
  
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
  
  
  
  document.addEventListener('click', e => {
    
    if (
      e.target.closest('#btnCompartilharFinanc')
    ) {
      
      abrirCompartilharGeral();
      
    }
    
  });
  
}



// ================= MODAL =================


async function abrirCompartilharGeral() {
  
  
  if (!carrinho.length) {
    
    mostrarAlerta(
      "Adicione produtos ao carrinho primeiro",
      "erro",
      3000
    );
    
    return;
    
  }
  
  
  const modal =
    document.getElementById('modalCompartilhar');
  
  
  const lista =
    document.getElementById('compProdutosList');
  
  
  
  lista.innerHTML =
    `
<p>
Carregando imagens...
</p>
`;
  
  
  
  modal.classList.add('active');
  
  
  
  const imagensCache = {};
  
  
  
  await Promise.all(
    
    carrinho.map(async p => {
      
      
      try {
        
        
        const imgs =
          await pegarImagens(p.nce);
        
        
        imagensCache[p.nce] =
          imgs.length ? imgs : [placeholder];
        
        
      } catch {
        
        
        imagensCache[p.nce] = [placeholder];
        
        
      }
      
      
    })
    
  );
  
  
  
  modal._imagensCache =
    imagensCache;
  
  
  
  lista.innerHTML =
    carrinho.map(p => {
      
      
      const imgs =
        imagensCache[p.nce] || [placeholder];
      
      
      return `

<div class="comp-produto-item">


<img src="${imgs[0]}"
onerror="this.src='${placeholder}'">


<div>


${p.descricao}


<br>


${(p.preco*p.quantidade)
.toLocaleString('pt-BR',{
style:'currency',
currency:'BRL'
})}


</div>


</div>

`;
      
    }).join('');
  
}




// ================= PREVIEW PARCELAS =================


function atualizarPreviewPlano() {
  
  
  const infoEl =
    document.getElementById('compPlanoInfo');
  
  
  
  try {
    
    
    const entrada =
      document.getElementById('entrada')
      ?.value || 'R$0,00';
    
    
    
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
    
    
    
    
    // AQUI entra GE
    
    const financiado =
      Math.max(
        pegarTotalFinanciamento() - entradaNum,
        0
      );
    
    
    
    const maxParcelas =
      parc18 ? 18 : 12;
    
    
    
    let html = '';
    
    
    
    for (
      let n = 1; n <= maxParcelas; n++
    ) {
      
      
      const sem =
        semJuros && n <= 3;
      
      
      const i =
        sem ? 0 : taxa / 100;
      
      
      
      const coef =
        i === 0 ?
        1 / n :
        (
          i * Math.pow(1 + i, n)
        ) /
        (
          Math.pow(1 + i, n) - 1
        );
      
      
      
      const parcela =
        financiado * coef;
      
      
      
      html += `

<div class="plano-row">

<span>
${n}x
</span>


<strong>

${parcela.toLocaleString(
'pt-BR',
{
style:'currency',
currency:'BRL'
}
)}

</strong>


</div>

`;
      
    }
    
    
    
    infoEl.innerHTML = html;
    
    
    
  } catch {
    
    
    infoEl.innerHTML =
      "Configure o simulador";
    
  }
  
  
}




// ================= WHATSAPP =================


function enviarWhatsApp(imagensCache, comPlano) {

  const garantias = JSON.parse(localStorage.getItem('garantias') || '[]');

  let msg = `🛒 *Produtos selecionados*\n`;

  carrinho.forEach((p, i) => {

    msg += `\n*${i + 1}. ${p.descricao}*\n`;
    msg += p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (p.quantidade > 1) msg += ` × ${p.quantidade}`;
    msg += `\n`;

    // ← Garantia selecionada
    if (p.garantia === 1 || p.garantia === 2) {
      const g = garantias.find(k => k.nce === p.nce);
      if (g) {
        const valorG = p.garantia === 1
          ? (g.g1 || 0) * p.quantidade
          : (g.g2 || 0) * p.quantidade;
        msg += `🛡️ GE ${p.garantia}: ${valorG.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
      }
    }

    // ← Link da galeria
    const imgs = (imagensCache?.[p.nce] || []).filter(u => u !== placeholder);
    if (imgs.length > 0) {
      const descEncoded = encodeURIComponent(p.descricao);
      const galeriaUrl = `${BASE_URL}/page/galeria/galeria.html?nce=${p.nce}&desc=${descEncoded}`;
      msg += `🖼️ Ver fotos: ${galeriaUrl}\n`;
    }

  });

  if (comPlano) {
    const entrada    = document.getElementById('entrada')?.value || 'R$0,00';
    const entradaNum = Number(entrada.replace(/\D/g, '')) / 100 || 0;
    const financiado = Math.max(pegarTotalFinanciamento() - entradaNum, 0);
    const taxa       = Number(document.getElementById('taxa')?.value || 9.9);
    const max        = document.getElementById('parc18x')?.checked ? 18 : 12;
    const semJuros   = document.getElementById('semJuros3x')?.checked || false;

    msg += `\n💳 *Plano de pagamento*\n`;

    for (let n = 1; n <= max; n++) {
      const sem  = semJuros && n <= 3;
      const i    = sem ? 0 : taxa / 100;
      const coef = i === 0 ? 1 / n : (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
      const parcela = financiado * coef;
      msg += `${n}x de ${parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}${sem ? ' (sem juros)' : ''}\n`;
    }
  }

  msg += `\n_AUG Financeira_ ✨`;

  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}