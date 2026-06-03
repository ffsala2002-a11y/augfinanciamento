// importar parsers
import {
  parseProdutos,
  parseGarantias
} from './parser.js';


// carregar base
export function carregarBase(
  fileProdutos,
  fileGarantias,
  callback
) {
  
  // validar arquivos
  if (
    !fileProdutos ||
    !fileGarantias
  ) {
    
    return alert(
      "Envie os dois arquivos"
    );
  }
  
  
  // leitor produtos
  const r1 =
    new FileReader();
  
  
  // quando carregar produtos
  r1.onload = e => {
    
    // converter produtos
    const prod =
      parseProdutos(
        e.target.result
      );
    
    
    // salvar produtos
    localStorage.setItem(
      "produtos",
      JSON.stringify(prod)
    );
    
    
    // leitor garantias
    const r2 =
      new FileReader();
    
    
    // quando carregar garantias
    r2.onload = ev => {
      
      // salvar garantias
      localStorage.setItem(
        "garantias",
        
        JSON.stringify(
          parseGarantias(
            ev.target.result
          )
        )
      );
      
      
      // callback
      if (callback) {
        
        callback(prod.length);
      }
    };
    
    
    // ler arquivo garantias
    r2.readAsText(
      fileGarantias
    );
  };
  
  
  // ler arquivo produtos
  r1.readAsText(
    fileProdutos
  );
}


// limpar base
export function limparBase() {
  
  // remove produtos
  localStorage.removeItem(
    "produtos"
  );
  
  
  // remove garantias
  localStorage.removeItem(
    "garantias"
  );
}