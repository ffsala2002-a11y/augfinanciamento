// mudar rota
function mudarRota(rotaId, botao) {
  
  // todas as rotas
  const rotas =
    document.querySelectorAll(".rota");
  
  // todos os botões
  const botoes =
    document.querySelectorAll(".btn");
  
  // remove active das rotas
  rotas.forEach(r => {
    
    r.classList.remove("active");
  });
  
  // remove active dos botões
  botoes.forEach(r => {
    
    r.classList.remove("active");
  });
  
  // ativa rota atual
  document
    .getElementById(rotaId)
    ?.classList.add("active");
  
  // ativa botão atual
  botao?.classList.add("active");
}