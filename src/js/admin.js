import { supabase } from './supabase.js';
import { parseProdutos, parseGarantias } from './parser.js';

// ================= STATUS =================
function mostrarStatus(elId, msg, tipo = 'info') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = msg;
  el.className = `status-msg show ${tipo}`;
  setTimeout(() => el.classList.remove('show'), 5000);
}

// ================= LOGIN ADMIN REAL =================
document.getElementById('btnLoginAdmin').addEventListener('click', async () => {
  const email = document.getElementById('emailAdmin').value.trim();
  const senha = document.getElementById('senhaAdmin').value;
  const erroEl = document.getElementById('erroAdmin');

  erroEl.innerText = '';

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error || !data.user) {
    erroEl.innerText = '❌ Email ou senha incorretos.';
    return;
  }

  if (data.user.email !== 'admin@augfinanceira.com') {
    await supabase.auth.signOut();
    erroEl.innerText = '❌ Acesso negado.';
    return;
  }

  document.getElementById('telaLoginAdmin').style.display = 'none';
  document.getElementById('telaAdmin').style.display = 'flex';
  carregarLojas();
});

// ================= LOGOUT ADMIN =================
document.getElementById('btnLogoutAdmin')?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.reload();
});

// ================= VERIFICA SESSÃO AO CARREGAR =================
window.addEventListener('load', async () => {
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user;

  if (user && user.email === 'admin@augfinanceira.com') {
    document.getElementById('telaLoginAdmin').style.display = 'none';
    document.getElementById('telaAdmin').style.display = 'flex';
    carregarLojas();
  }
});

// ================= CARREGAR LOJAS =================
async function carregarLojas() {
  const { data } = await supabase.from('lojas').select('*');

  const select = document.getElementById('selectLoja');
  const selectApagar = document.getElementById('selectLojaApagar');
  const selectRemover = document.getElementById('selectLojaRemover');
  const listaEl = document.getElementById('listaLojas');

  select.innerHTML = '';
  selectApagar.innerHTML = '';
  selectRemover.innerHTML = '';
  listaEl.innerHTML = '';

  data?.forEach(loja => {
    const option = `<option value="${loja.sigla}">${loja.nome} (${loja.sigla})</option>`;
    select.innerHTML += option;
    selectApagar.innerHTML += option;
    selectRemover.innerHTML += option;

    listaEl.innerHTML += `
      <div class="loja-card">
        <div class="loja-sigla">${loja.sigla}</div>
        <div class="loja-nome">${loja.nome}</div>
        <div class="loja-badge">● Ativa</div>
      </div>
    `;
  });
}

// ================= CRIAR LOJA =================
document.getElementById('btnCriarLoja').addEventListener('click', async () => {
  const nome = document.getElementById('nomeLoja').value.trim();
  const sigla = document.getElementById('siglaLoja').value.trim().toUpperCase();

  if (!nome || !sigla) {
    mostrarStatus('statusCriarLoja', '⚠️ Preencha nome e sigla.', 'erro');
    return;
  }

  const { error } = await supabase.from('lojas').insert({ nome, sigla });

  if (error) {
    mostrarStatus('statusCriarLoja', '❌ Erro: ' + error.message, 'erro');
  } else {
    mostrarStatus('statusCriarLoja', `✅ Loja "${sigla}" criada com sucesso!`, 'sucesso');
    document.getElementById('nomeLoja').value = '';
    document.getElementById('siglaLoja').value = '';
    carregarLojas();
  }
});

// ================= APAGAR BANCO =================
document.getElementById('btnApagarBanco').addEventListener('click', async () => {
  const sigla = document.getElementById('selectLojaApagar').value;
  if (!sigla) return;

  const confirmou = confirm(`⚠️ Tem certeza que deseja apagar TODOS os dados da loja "${sigla}"?\n\nEssa ação não pode ser desfeita.`);
  if (!confirmou) return;

  mostrarStatus('statusApagar', '⏳ Apagando...', 'info');

  const { error: errProd } = await supabase.from('produtos').delete().eq('loja_sigla', sigla);
  if (errProd) { mostrarStatus('statusApagar', '❌ Erro produtos: ' + errProd.message, 'erro'); return; }

  const { error: errGar } = await supabase.from('garantias').delete().eq('loja_sigla', sigla);
  if (errGar) { mostrarStatus('statusApagar', '❌ Erro garantias: ' + errGar.message, 'erro'); return; }

  mostrarStatus('statusApagar', `✅ Banco da loja "${sigla}" apagado com sucesso!`, 'sucesso');
});

// ================= APAGAR LOJA =================
document.getElementById('btnApagarLoja').addEventListener('click', async () => {
  const sigla = document.getElementById('selectLojaRemover').value;
  if (!sigla) return;

  const confirmou = confirm(`⚠️ Deseja apagar a loja "${sigla}" e todos os seus dados?\n\nEssa ação não pode ser desfeita.`);
  if (!confirmou) return;

  mostrarStatus('statusApagarLoja', '⏳ Apagando...', 'info');

  const { error: errProd } = await supabase.from('produtos').delete().eq('loja_sigla', sigla);
  if (errProd) { mostrarStatus('statusApagarLoja', '❌ Erro produtos: ' + errProd.message, 'erro'); return; }

  const { error: errGar } = await supabase.from('garantias').delete().eq('loja_sigla', sigla);
  if (errGar) { mostrarStatus('statusApagarLoja', '❌ Erro garantias: ' + errGar.message, 'erro'); return; }

  const { error: errLoja } = await supabase.from('lojas').delete().eq('sigla', sigla);
  if (errLoja) { mostrarStatus('statusApagarLoja', '❌ Erro loja: ' + errLoja.message, 'erro'); return; }

  mostrarStatus('statusApagarLoja', `✅ Loja "${sigla}" apagada com sucesso!`, 'sucesso');
  carregarLojas();
});

// ================= IMPORTAR BASE =================
document.getElementById('btnImportar').addEventListener('click', async () => {
  const sigla = document.getElementById('selectLoja').value;
  const fileProd = document.getElementById('fileProd').files[0];
  const fileGar = document.getElementById('fileGar').files[0];

  if (!fileProd || !fileGar) {
    mostrarStatus('statusImport', '⚠️ Selecione os dois arquivos.', 'erro');
    return;
  }

  mostrarStatus('statusImport', '⏳ Processando...', 'info');

  const lerArquivo = f => new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.readAsText(f);
  });

  const txtProd = await lerArquivo(fileProd);
  const txtGar = await lerArquivo(fileGar);

  const produtos = parseProdutos(txtProd).map(p => ({ ...p, loja_sigla: sigla }));
  const garantias = parseGarantias(txtGar).map(g => ({ ...g, loja_sigla: sigla }));

  await supabase.from('produtos').delete().eq('loja_sigla', sigla);
  await supabase.from('garantias').delete().eq('loja_sigla', sigla);

  const chunk = (arr, n) => Array.from(
    { length: Math.ceil(arr.length / n) },
    (_, i) => arr.slice(i * n, i * n + n)
  );

  for (const lote of chunk(produtos, 500)) {
    const { error } = await supabase.from('produtos').insert(lote);
    if (error) { mostrarStatus('statusImport', '❌ Erro produtos: ' + error.message, 'erro'); return; }
  }

  for (const lote of chunk(garantias, 500)) {
    const { error } = await supabase.from('garantias').insert(lote);
    if (error) { mostrarStatus('statusImport', '❌ Erro garantias: ' + error.message, 'erro'); return; }
  }

  mostrarStatus('statusImport', `✅ ${produtos.length} produtos e ${garantias.length} garantias importados para ${sigla}!`, 'sucesso');
});