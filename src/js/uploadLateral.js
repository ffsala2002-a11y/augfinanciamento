export default function uploadLateral() {
    
    // botão do menu lateral
    const btnLateral = document.getElementById('btn-lateral');
    
    // menu lateral e overlay
    const uploadLateral = document.querySelector('.menu-lateral');
    const fundoAtivo = document.querySelector('.fundo');
    
    // barra inferior
    const bottomBar = document.querySelector(".bottom-bar");
    
    // abre/fecha menu lateral
    btnLateral.addEventListener('click', () => {
        
        uploadLateral.classList.toggle('active-lateral');
        fundoAtivo.classList.toggle('active-fundo');
        btnLateral.classList.toggle('active-lateral');
        bottomBar.classList.toggle('active-bar');
        
    });
    
    // fecha ao clicar no fundo
    fundoAtivo.addEventListener('click', () => {
        
        uploadLateral.classList.remove('active-lateral');
        fundoAtivo.classList.remove('active-fundo');
        btnLateral.classList.remove('active-lateral');
        bottomBar.classList.remove('active-bar');
        
    });
    
}