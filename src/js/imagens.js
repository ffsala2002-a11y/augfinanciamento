// Inicializa banco de imagens
export async function iniciarBancoImagens() {
  
  try {
    
    // Busca JSON de imagens no GitHub
    const res = await fetch(
      "https://raw.githubusercontent.com/ffsala2002-a11y/produtos-imagens/refs/heads/main/data/imagens.json"
    );
    
    // Verifica erro na resposta
    if (!res.ok) {
      
      throw new Error(
        "Erro ao carregar JSON de imagens do GitHub"
      );
    }
    
    // Converte resposta para objeto
    const imagensPadrao =
      await res.json();
    
    // Salva no localStorage
    localStorage.setItem(
      "imagens",
      JSON.stringify(imagensPadrao)
    );
    
    return imagensPadrao;
    
  } catch (err) {
    
    console.error(err);
    
    return {};
  }
}

// Busca imagens pelo NCE
export async function pegarImagens(nce) {
  
  // Busca banco salvo
  let banco =
    JSON.parse(
      localStorage.getItem("imagens")
    ) || {};
  
  // Se não existir o NCE
  if (!banco[nce]) {
    
    // Atualiza banco
    banco =
      await iniciarBancoImagens();
  }
  
  // Busca imagens do produto
  let imagens =
    banco[nce] || [];
  
  // Remove imagens inválidas
  imagens = imagens.filter(
    img =>
    img &&
    img !== "null" &&
    img.trim() !== ""
  );
  
  // Se não tiver imagem
  if (!imagens.length) {
    
    return [
      "https://raw.githubusercontent.com/ffsala2002-a11y/produtos-imagens/main/img-produtos/sem_img.png"
    ];
  }
  
  // Limita até 4 imagens
  return imagens.slice(0, 4);
}