// importar carrinho
import { carrinho }
from './carrinho.js';

// importar util
import { entradaNumero }
from './util.js';

// importar garantia
import {
  calcularGarantiaTotal
}
from './garantias.js';


// calcular total
export function calcularTotal(
  entradaStr,
  parcelas,
  taxa,
  arredondar
) {

  // converter entrada
  let entrada =
    entradaNumero(entradaStr);


  // total produtos
  let totalProdutos = 0;


  // loop carrinho
  carrinho.forEach(p => {
    
    totalProdutos +=
      p.preco *
      p.quantidade;
  });


  // total garantias
  const totalGarantia =
    calcularGarantiaTotal(
      carrinho
    );


  // soma total
  const total =
    totalProdutos +
    totalGarantia;


  // limitar entrada
  if (entrada > total) {
    
    entrada = total;
  }


  // valor financiado
  const financiado =
    total - entrada;


  // parcelas
  const n =
    Number(parcelas);


  // taxa juros
  const i =
    Number(taxa) / 100;


  // cálculo coeficiente
  const coef =
    
    i === 0
    
      ? 1 / n
      
      : (
          i *
          Math.pow(
            1 + i,
            n
          )
        ) /
        (
          Math.pow(
            1 + i,
            n
          ) - 1
        );


  // valor parcela
  let valorParcela =
    financiado * coef;


  // arredondar
  if (arredondar) {
    
    valorParcela =
      Math.round(
        valorParcela * 100
      ) / 100;
  }


  // total com juros
  const totalComJuros =
    valorParcela * n;


  // juros aplicado
  const jurosAplicado =
    totalComJuros -
    financiado;


  // retorno
  return {
    
    total,
    
    financiado,
    
    entrada,
    
    valorParcela,
    
    parcelas: n,
    
    totalComJuros,
    
    jurosAplicado
  };
}