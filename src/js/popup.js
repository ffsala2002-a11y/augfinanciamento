// Inicializa popup mobile
/*export function popupMobile() {
  
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      
      // Elementos
      const popup =
        document.getElementById("popup");
      
      const closeBtn =
        document.querySelector(".close");
      
      const toast =
        document.getElementById("toast");
      
      const som =
        document.getElementById("som");
      
      // Ativa dark mode automático
      if (
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
      ) {
        
        document.body.classList.add("dark");
      }
      
      // Abre popup uma vez por dia
      function abrirPopup() {
        
        const hoje =
          new Date().toLocaleDateString();
        
        const ultima =
          localStorage.getItem("popupData");
        
        // Se ainda não abriu hoje
        if (ultima !== hoje) {
          
          setTimeout(() => {
            
            popup.classList.add("show");
            
          }, 2000);
        }
      }
      
      // Fecha popup
      function fecharPopup() {
        
        popup.classList.remove("show");
        
        // Salva data atual
        const hoje =
          new Date().toLocaleDateString();
        
        localStorage.setItem(
          "popupData",
          hoje
        );
        
        // Toca som
        som.play().catch(() => {});
        
        // Mostra toast
        mostrarToast();
      }
      
      // Exibe toast
      function mostrarToast() {
        
        toast.classList.add("show");
        
        setTimeout(() => {
          
          toast.classList.remove("show");
          
        }, 3000);
      }
      
      // Evento botão fechar
      closeBtn.addEventListener(
        "click",
        fecharPopup
      );
      
      // Inicializa popup
      abrirPopup();
    }
  );
}*/