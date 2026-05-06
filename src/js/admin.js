import { supabase } from './supabase.js';
import { parseProdutos, parseGarantias } from './parser.js';

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
  
  // Verifica se é o admin de verdade
  if (data.user.email !== 'admin@augfinanceira.com') {
    await supabase.auth.signOut();
    erroEl.innerText = '❌ Acesso negado.';
    return;
  }
  
  document.getElementById('telaLoginAdmin').style.display = 'none';
  document.getElementById('telaAdmin').style.display = 'block';
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
    document.getElementById('telaAdmin').style.display = 'block';
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
  
  // Limpa tudo antes de popular
  select.innerHTML = '';
  selectApagar.innerHTML = '';
  selectRemover.innerHTML = '';
  listaEl.innerHTML = '';
  
  data?.forEach(loja => {
    const option = `<option value="${loja.sigla}">${loja.nome} (${loja.sigla})</option>`;
    select.innerHTML += option;
    selectApagar.innerHTML += option;
    selectRemover.innerHTML += option;
    listaEl.innerHTML += `<div class="loja-item">${loja.nome} — <strong>${loja.sigla}</strong></div>`;
  });
}


// ================= APAGAR LOJA =================
document.getElementById('btnApagarLoja').addEventListener('click', async () => {
  const sigla = document.getElementById('selectLojaRemover').value;
  const status = document.getElementById('statusApagarLoja');
  
  if (!sigla) return;
  
  const confirmou = confirm(`⚠️ Deseja apagar a loja "${sigla}" e todos os seus dados?\n\nEssa ação não pode ser desfeita.`);
  if (!confirmou) return;
  
  status.innerText = '⏳ Apagando...';
  
  // Ordem obrigatória: filhos antes do pai
  const { error: errProd } = await supabase.from('produtos').delete().eq('loja_sigla', sigla);
  if (errProd) { status.innerText = '❌ Erro produtos: ' + errProd.message; return; }
  
  const { error: errGar } = await supabase.from('garantias').delete().eq('loja_sigla', sigla);
  if (errGar) { status.innerText = '❌ Erro garantias: ' + errGar.message; return; }
  
  const { error: errLoja } = await supabase.from('lojas').delete().eq('sigla', sigla);
  if (errLoja) { status.innerText = '❌ Erro loja: ' + errLoja.message; return; }
  
  status.innerText = `✅ Loja "${sigla}" apagada com sucesso!`;
  carregarLojas();
});


// ================= CRIAR LOJA =================
document.getElementById('btnCriarLoja').addEventListener('click', async () => {
  const nome = document.getElementById('nomeLoja').value.trim();
  const sigla = document.getElementById('siglaLoja').value.trim().toUpperCase();
  
  if (!nome || !sigla) return alert('Preencha nome e sigla.');
  
  const { error } = await supabase.from('lojas').insert({ nome, sigla });
  
  if (error) {
    alert('Erro: ' + error.message);
  } else {
    alert('✅ Loja criada!');
    document.getElementById('nomeLoja').value = '';
    document.getElementById('siglaLoja').value = '';
    carregarLojas();
  }
});

// ================= APAGAR BANCO =================
document.getElementById('btnApagarBanco').addEventListener('click', async () => {
  const sigla = document.getElementById('selectLojaApagar').value;
  const status = document.getElementById('statusApagar');
  
  if (!sigla) return;
  
  const confirmou = confirm(`⚠️ Tem certeza que deseja apagar TODOS os dados da loja "${sigla}"?\n\nEssa ação não pode ser desfeita.`);
  if (!confirmou) return;
  
  status.innerText = '⏳ Apagando...';
  
  const { error: errProd } = await supabase.from('produtos').delete().eq('loja_sigla', sigla);
  if (errProd) { status.innerText = '❌ Erro ao apagar produtos: ' + errProd.message; return; }
  
  const { error: errGar } = await supabase.from('garantias').delete().eq('loja_sigla', sigla);
  if (errGar) { status.innerText = '❌ Erro ao apagar garantias: ' + errGar.message; return; }
  
  status.innerText = `✅ Banco da loja "${sigla}" apagado com sucesso!`;
});

// ================= IMPORTAR BASE =================
document.getElementById('btnImportar').addEventListener('click', async () => {
  const sigla = document.getElementById('selectLoja').value;
  const fileProd = document.getElementById('fileProd').files[0];
  const fileGar = document.getElementById('fileGar').files[0];
  const status = document.getElementById('statusImport');
  
  if (!fileProd || !fileGar) return alert('Selecione os dois arquivos.');
  
  status.innerText = '⏳ Processando...';
  
  const lerArquivo = f => new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.readAsText(f);
  });
  
  const txtProd = await lerArquivo(fileProd);
  const txtGar = await lerArquivo(fileGar);
  
  const produtos = parseProdutos(txtProd).map(p => ({ ...p, loja_sigla: sigla }));
  const garantias = parseGarantias(txtGar).map(g => ({ ...g, loja_sigla: sigla }));
  
  // Limpa base antiga
  await supabase.from('produtos').delete().eq('loja_sigla', sigla);
  await supabase.from('garantias').delete().eq('loja_sigla', sigla);
  
  // Insere em lotes de 500
  const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) },
    (_, i) => arr.slice(i * n, i * n + n)
  );
  
  for (const lote of chunk(produtos, 500)) {
    const { error } = await supabase.from('produtos').insert(lote);
    if (error) { status.innerText = '❌ Erro ao inserir produtos: ' + error.message; return; }
  }
  
  for (const lote of chunk(garantias, 500)) {
    const { error } = await supabase.from('garantias').insert(lote);
    if (error) { status.innerText = '❌ Erro ao inserir garantias: ' + error.message; return; }
  }
  
  status.innerText = `✅ ${produtos.length} produtos e ${garantias.length} garantias importados para ${sigla}!`;
});