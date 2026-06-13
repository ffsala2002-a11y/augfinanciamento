import { parsePrecoSeguro } from './util.js';

// Faz parse da base de produtos
export function parseProdutos(txt) {
  
  // Divide arquivo por linhas
  const linhas = txt.split("\n");
  
  const produtos = [];
  
  // Guarda último grupo encontrado
  let grupoAtual = "";
  
  // Percorre linhas
  for (let linha of linhas) {
    
    // Ignora linhas inválidas
    if (!linha.trim().startsWith("*")) {
      continue;
    }
    
    try {
      
      // Extrai grupo
      const grupo = linha.substring(3, 5).trim() || grupoAtual
      
      // Extrai NCE
      const nce = linha.substring(6, 12).trim();
      
      // Extrai cor
      const cor = linha.substring(18, 38).trim();
      
      // Extrai descrição
      const descricaoBruta = linha.substring(39).trim();
      
      // Extrai saldo e preço
      const valores =
        extrairValoresFinais(linha);
      
      console.log(
        "SALDO:",
        valores.saldo,
        "PRECO:",
        valores.preco
      );
      
      const saldo =
        valores.saldo;
      
      const preco =
        valores.preco;
      
      // Atualiza grupo atual
      if (grupo) {
        grupoAtual = grupo;
      }
      
      // Adiciona produto
      produtos.push({
        
        descricao: limparDescricao(descricaoBruta),
        
        nce,
        
        grupo: grupoAtual,
        
        cor,
        
        saldo: Number(saldo) || 0,
        
        preco: Number(preco) || 0
      });
      
    } catch (err) {
      
      console.log(
        "Erro parse linha:",
        linha
      );
    }
  }
  
  return produtos;
}

// Extrai saldo e preço da linha
function extrairValoresFinais(linha) {
  
  if (!linha) {
    
    return {
      saldo: 0,
      preco: 0
    };
  }
  
  // Busca valores monetários
  const matches =
    linha.match(
      /\d+(?:[.,]\d{3})*\.\d{2}\b/g
    );
  
  // Se não encontrar valores
  if (!matches || matches.length < 2) {
    
    return {
      saldo: 0,
      preco: 0
    };
  }
  
  // Primeiro valor = saldo
  const saldo =
    parseFloat(matches[0]) || 0;
  
  // Último valor = preço
  const precoBruto =
    matches[matches.length - 1];
  
  // Remove separador de milhar
  const precoLimpo =
    precoBruto.replace(
      /[.,](?=\d{3}\.)/g,
      ""
    );
  
  const preco =
    Number(precoLimpo) || 0;
  
  return {
    saldo,
    preco
  };
}

// Limpa descrição
function limparDescricao(desc) {
  if (!desc || typeof desc !== "string") return "";
  
  try {
    // Divide em tokens e para no primeiro número isolado (saldo/preço)
    const tokens = desc.trim().split(/\s+/);
    const resultado = [];
    
    for (const token of tokens) {
      // Para quando encontra token numérico puro como 3.00, 0.00301, 199.00
      if (/^\d+\.\d+$/.test(token)) break;
      resultado.push(token);
    }
    
    return resultado.join(' ').trim();
    
  } catch {
    return desc;
  }
}

// Faz parse da base de garantias
export function parseGarantias(txt) {
  
  return txt
    
    // Divide linhas
    .split(/\r?\n/)
    
    // Converte cada linha
    .map(l => {
      
      // Busca NCE
      const nceMatch =
        l.match(/\b(\d{4,})\b/);
      
      if (!nceMatch) {
        return null;
      }
      
      // Busca valores monetários
      const valores = [...l.matchAll(/(\d+[.,]\d{2})/g)]
        
        .map(v =>
          parsePrecoSeguro(v[1])
        );
      
      // Se não tiver valores
      if (valores.length === 0) {
        return null;
      }
      
      return {
        
        nce: nceMatch[1].trim(),
        
        g1: valores[0] || 0,
        
        g2: valores[1] || 0
      };
      
    })
    
    // Remove valores nulos
    .filter(Boolean);
}