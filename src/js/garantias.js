// Calcula o valor total das garantias
export function calcularGarantiaTotal(carrinho) {
  
  // Busca garantias salvas no localStorage
  const garantias = JSON.parse(
    localStorage.getItem("garantias") || "[]"
  );
  
  let total = 0;
  
  // Percorre produtos do carrinho
  carrinho.forEach(p => {
    
    // Procura garantia do produto pelo NCE
    const g = garantias.find(
      k => k.nce === p.nce
    );
    
    // Se não encontrar garantia, ignora
    if (!g) return;
    
    // Garantia tipo 1
    if (p.garantia === 1) {
      
      total +=
        (g.g1 || 0) * p.quantidade;
    }
    
    // Garantia tipo 2
    if (p.garantia === 2) {
      
      total +=
        (g.g2 || 0) * p.quantidade;
    }
  });
  
  // Retorna total das garantias
  return total;
}