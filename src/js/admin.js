// importar supabase
import { supabase }
from './supabase.js';

// importar parsers
import {
  parseProdutos,
  parseGarantias
} from './parser.js';


// mostrar status
function mostrarStatus(
  elId,
  msg,
  tipo = 'info'
) {
  
  // pega elemento
  const el =
    document.getElementById(elId);
  
  // se não existir
  if (!el) return;
  
  // adiciona mensagem
  el.textContent = msg;
  
  // adiciona classes
  el.className =
    `status-msg show ${tipo}`;
  
  // remove mensagem depois
  setTimeout(() => {
    
    el.classList.remove('show');
    
  }, 5000);
}


// login admin
document
  .getElementById('btnLoginAdmin')
  .addEventListener(
    'click',
    async () => {
      
      // email
      const email =
        document
        .getElementById('emailAdmin')
        .value
        .trim();
      
      // senha
      const senha =
        document
        .getElementById('senhaAdmin')
        .value;
      
      // elemento erro
      const erroEl =
        document
        .getElementById('erroAdmin');
      
      // limpa erro
      erroEl.innerText = '';
      
      // login supabase
      const {
        data,
        error
      } =
      await supabase.auth
        .signInWithPassword({
          email,
          password: senha
        });
      
      // erro login
      if (
        error ||
        !data.user
      ) {
        
        erroEl.innerText =
          '❌ Email ou senha incorretos.';
        
        return;
      }
      
      // verifica admin
      if (
        data.user.email !==
        'admin@augfinanceira.com'
      ) {
        
        // desloga
        await supabase.auth.signOut();
        
        erroEl.innerText =
          '❌ Acesso negado.';
        
        return;
      }
      
      // esconde login
      document
        .getElementById(
          'telaLoginAdmin'
        )
        .style.display = 'none';
      
      // mostra painel
      document
        .getElementById(
          'telaAdmin'
        )
        .style.display = 'flex';
      
      // carregar lojas
      carregarLojas();
    }
  );


// logout admin
document
  .getElementById('btnLogoutAdmin')
  ?.addEventListener(
    'click',
    async () => {
      
      // sair conta
      await supabase.auth.signOut();
      
      // recarrega página
      window.location.reload();
    }
  );


// verifica sessão
window.addEventListener(
  'load',
  async () => {
    
    // pega sessão
    const { data } =
    await supabase.auth.getSession();
    
    // usuário
    const user =
      data?.session?.user;
    
    // se for admin
    if (
      user &&
      user.email ===
      'admin@augfinanceira.com'
    ) {
      
      // esconde login
      document
        .getElementById(
          'telaLoginAdmin'
        )
        .style.display = 'none';
      
      // mostra admin
      document
        .getElementById(
          'telaAdmin'
        )
        .style.display = 'flex';
      
      // carregar lojas
      carregarLojas();
    }
  }
);


// carregar lojas
async function carregarLojas() {
  
  // buscar lojas
  const { data } =
  await supabase
    .from('lojas')
    .select('*');
  
  // selects
  const select =
    document.getElementById(
      'selectLoja'
    );
  
  const selectApagar =
    document.getElementById(
      'selectLojaApagar'
    );
  
  const selectRemover =
    document.getElementById(
      'selectLojaRemover'
    );
  
  // lista lojas
  const listaEl =
    document.getElementById(
      'listaLojas'
    );
  
  // limpa selects
  select.innerHTML = '';
  
  selectApagar.innerHTML = '';
  
  selectRemover.innerHTML = '';
  
  listaEl.innerHTML = '';
  
  // loop lojas
  data?.forEach(loja => {
    
    // option html
    const option = `
      <option value="${loja.sigla}">
        ${loja.nome}
        (${loja.sigla})
      </option>
    `;
    
    // adiciona options
    select.innerHTML += option;
    
    selectApagar.innerHTML += option;
    
    selectRemover.innerHTML += option;
    
    // adiciona card
    listaEl.innerHTML += `
      <div class="loja-card">
        
        <div class="loja-sigla">
          ${loja.sigla}
        </div>
        
        <div class="loja-nome">
          ${loja.nome}
        </div>
        
        <div class="loja-badge">
          ● Ativa
        </div>
        
      </div>
    `;
  });
}


// criar loja
document
  .getElementById('btnCriarLoja')
  .addEventListener(
    'click',
    async () => {
      
      // nome loja
      const nome =
        document
        .getElementById(
          'nomeLoja'
        )
        .value
        .trim();
      
      // sigla loja
      const sigla =
        document
        .getElementById(
          'siglaLoja'
        )
        .value
        .trim()
        .toUpperCase();
      
      // validação
      if (!nome || !sigla) {
        
        mostrarStatus(
          'statusCriarLoja',
          '⚠️ Preencha nome e sigla.',
          'erro'
        );
        
        return;
      }
      
      // inserir loja
      const { error } =
      await supabase
        .from('lojas')
        .insert({
          nome,
          sigla
        });
      
      // erro insert
      if (error) {
        
        mostrarStatus(
          'statusCriarLoja',
          '❌ Erro: ' +
          error.message,
          'erro'
        );
        
      } else {
        
        // sucesso
        mostrarStatus(
          'statusCriarLoja',
          `✅ Loja "${sigla}" criada com sucesso!`,
          'sucesso'
        );
        
        // limpa inputs
        document
          .getElementById(
            'nomeLoja'
          )
          .value = '';
        
        document
          .getElementById(
            'siglaLoja'
          )
          .value = '';
        
        // atualiza lista
        carregarLojas();
      }
    }
  );


// apagar banco
document
  .getElementById('btnApagarBanco')
  .addEventListener(
    'click',
    async () => {
      
      // sigla
      const sigla =
        document
        .getElementById(
          'selectLojaApagar'
        )
        .value;
      
      // se vazio
      if (!sigla) return;
      
      // confirmação
      const confirmou =
        confirm(
          `⚠️ Tem certeza que deseja apagar TODOS os dados da loja "${sigla}"?\n\nEssa ação não pode ser desfeita.`
        );
      
      // cancelar
      if (!confirmou) return;
      
      // status
      mostrarStatus(
        'statusApagar',
        '⏳ Apagando...',
        'info'
      );
      
      // apagar produtos
      const {
        error: errProd
      } =
      await supabase
        .from('produtos')
        .delete()
        .eq(
          'loja_sigla',
          sigla
        );
      
      // erro produtos
      if (errProd) {
        
        mostrarStatus(
          'statusApagar',
          '❌ Erro produtos: ' +
          errProd.message,
          'erro'
        );
        
        return;
      }
      
      // apagar garantias
      const {
        error: errGar
      } =
      await supabase
        .from('garantias')
        .delete()
        .eq(
          'loja_sigla',
          sigla
        );
      
      // erro garantias
      if (errGar) {
        
        mostrarStatus(
          'statusApagar',
          '❌ Erro garantias: ' +
          errGar.message,
          'erro'
        );
        
        return;
      }
      
      // sucesso
      mostrarStatus(
        'statusApagar',
        `✅ Banco da loja "${sigla}" apagado com sucesso!`,
        'sucesso'
      );
    }
  );