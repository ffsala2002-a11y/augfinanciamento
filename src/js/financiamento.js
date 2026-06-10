// ================= FINANCIAMENTO =================
import { calcularTotal } from './calculo.js';
import { carrinho } from './carrinho.js';
import { calcularGarantiaTotal } from './garantias.js';

// Formata valor em real
const fmt = v =>
  Number(v || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

// Guarda qual item está expandido
let itemExpandido = -1;

// Inicializa eventos do financiamento
export function iniciarFinanciamento() {
  
  const entrada = document.getElementById('entrada');
  const taxa = document.getElementById('taxa');
  const semJuros = document.getElementById('semJuros3x');
  const parc18 = document.getElementById('parc18x');
  
  // Formata o campo entrada
  entrada?.addEventListener('input', () => {
    
    let v = entrada.value.replace(/\D/g, '');
    
    entrada.value = (Number(v) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    renderFinanciamento();
  });
  
  // Atualiza quando mudar taxa
  taxa?.addEventListener('input', renderFinanciamento);
  
  // Atualiza quando marcar sem juros
  semJuros?.addEventListener('change', renderFinanciamento);
  
  // Atualiza quando marcar 18x
  parc18?.addEventListener('change', renderFinanciamento);
}

// Renderiza lista de parcelamento
export function renderFinanciamento() {
  
  const lista = document.getElementById('financParcelasList');
  
  const totalValorEl = document.getElementById('financTotalValor');
  
  if (!lista) return;
  
  // Soma total dos produtos
  const totalProdutos = carrinho.reduce((acc, p) => {
    
    const preco = Number(
      String(p.preco || 0)
      .replace(',', '.')
    );
    
    const quantidade = Number(p.quantidade || 1);
    
    return acc + (preco * quantidade);
    
  }, 0);
  
  // Soma total das garantias
  const totalGarantia =
    Number(calcularGarantiaTotal(carrinho) || 0);
  
  // Total geral
  const total = totalProdutos + totalGarantia;
  
  // Atualiza valor total na tela
  if (totalValorEl) {
    totalValorEl.textContent = fmt(total);
  }
  
  // Se carrinho estiver vazio
  if (!carrinho.length || total <= 0 || isNaN(total)) {
    
    lista.innerHTML = `
      <div class="financ-empty">
        <div class="financ-empty-icon">🛒</div>

        <p>
          Adicione produtos ao carrinho para ver as opções de parcelamento
        </p>
      </div>
    `;
    
    return;
  }
  
  const entradaEl = document.getElementById('entrada');
  
  const taxaEl = document.getElementById('taxa');
  
  // Verifica opções marcadas
  const semJuros =
    document.getElementById('semJuros3x')?.checked || false;
  
  const parc18 =
    document.getElementById('parc18x')?.checked || false;
  
  // Valor da entrada
  const entradaNum =
    Number(
      (entradaEl?.value || 'R$ 0,00')
      .replace(/\D/g, '')
    ) / 100 || 0;
  
  // Taxa digitada
  const taxaNum =
    Number(taxaEl?.value || 9.9);
  
  // Define quantidade máxima de parcelas
  const maxParcelas =
    parc18 ? 18 : 12;
  
  // Valor financiado
  const financiado =
    Math.max(total - entradaNum, 0);
  
  lista.innerHTML = '';
  
  // Gera lista de parcelas
  for (let n = 1; n <= maxParcelas; n++) {
    
    // Define se parcela entra no sem juros
    const isSemJuros =
      semJuros && n <= 3;
    
    // Taxa usada
    const taxaEfetiva =
      isSemJuros ? 0 : taxaNum;
    
    // Juros compostos
    const i = taxaEfetiva / 100;
    
    // Fórmula do financiamento
    const coef =
      i === 0 ?
      1 / n :
      (
        i * Math.pow(1 + i, n)
      ) / (
        Math.pow(1 + i, n) - 1
      );
    
    // Valor da parcela
    const valorParcela =
      financiado * coef;
    
    // Total final
    const totalComJuros =
      valorParcela * n;
    
    // Juros aplicado
    const juros =
      totalComJuros - financiado;
    
    // Cria item
    // Cria item
    const item = document.createElement('div');
    
    item.className = 'financ-parcela-item';
    
    // Verifica se está expandido
    const isExpanded = itemExpandido === n;
    
    // HTML do item
    item.innerHTML = `
  <div class="financ-parcela-row">

    ${
      !isExpanded
        ? '<span class="text-info">Clique aqui pra mais detalhes</span>'
        : ''
    }

    <div class="financ-parcela-num ${isSemJuros ? 'sem-juros' : ''}">
      ${n}x
    </div>

    <div class="financ-parcela-valores">

      <span class="financ-parcela-valor">
        ${fmt(valorParcela)}
      </span>

      <span class="financ-parcela-sub">
        ${n === 1
          ? 'em até 1x'
          : `em até ${n}x`
        }
      </span>

    </div>

    <div class="financ-parcela-total">

      <span class="financ-parcela-total-val">
        ${fmt(totalComJuros)}
      </span>

      <span class="financ-parcela-juros ${isSemJuros ? 'sem-juros-tag' : ''}">

        ${
          isSemJuros
            ? '✓ sem juros'
            : juros > 0
              ? `+ juros ${fmt(juros)}`
              : 'sem juros'
        }

      </span>

    </div>

  </div>


  <div class="financ-parcela-detalhe ${isExpanded ? 'ativo' : ''}">

    <div class="financ-detalhe-item">
      <span>Valor avista</span>
      <strong>${fmt(total)}</strong>
    </div>


    <div class="financ-detalhe-item">
      <span>Entrada</span>
      <strong>${fmt(entradaNum)}</strong>
    </div>


    <div class="financ-detalhe-item">
      <span>Valor financiado</span>
      <strong>${fmt(financiado)}</strong>
    </div>


    <div class="financ-detalhe-item">
      <span>Parcelamento</span>
      <strong>${n}x de ${fmt(valorParcela)}</strong>
    </div>


    <div class="financ-detalhe-item">
      <span>Juros</span>
      <strong>
        ${
          juros > 0
            ? fmt(juros)
            : 'Sem juros'
        }
      </strong>
    </div>


    <div class="financ-detalhe-item total">
      <span>Total a pagar</span>
      <strong>${fmt(totalComJuros)}</strong>
    </div>

  </div>
`;
    
    
    // Clique abre/fecha
    item.addEventListener('click', () => {
      
      itemExpandido =
        itemExpandido === n ? -1 : n;
      
      renderFinanciamento();
      
    });
    
    
    lista.appendChild(item);
  }
}