export function fmt(v) {
  // formata número em moeda BRL
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function parsePrecoSeguro(v) {
  // converte texto de preço em número seguro
  let s = v.replace(/[^\d.,]/g, '');
  const lc = s.lastIndexOf(','),
    ld = s.lastIndexOf('.');
  
  // ajusta formato decimal brasileiro/internacional
  if (lc > ld) s = s.replace(/\./g, '').replace(',', '.');
  else if (ld > lc) s = s.replace(/,/g, '');
  
  return Number(s);
}

export function entradaNumero(str) {
  // converte entrada monetária (R$) para número
  return Number(str.replace(/[^\d]/g, '')) / 100 || 0;
}