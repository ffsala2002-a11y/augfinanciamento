import { supabase } from '../../src/js/supabase.js';
import { parseProdutos, parseGarantias } from '../../src/js/parser.js';

// ===== ESTADO =====
let siglaAtual = null;

// ===== UTILITÁRIOS =====
function mostrarStatus(elId, msg, tipo = 'info') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = msg;
  el.className = `status-msg show ${tipo}`;
  setTimeout(() => el.classList.remove('show'), 6000);
}

function lerArquivo(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.readAsText(file);
  });
}

const chunk = (arr, n) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) =>
    arr.slice(i * n, i * n + n)
  );

// ===== VERIFICAR LOJA =====
document.getElementById('btnVerificar').addEventListener('click', async () => {
  const sigla = document.getElementById('inputSigla').value.trim().toUpperCase();
  
  if (!sigla) {
    mostrarStatus('statusVerificar', '⚠️ Digite a sigla da loja.', 'erro');
    return;
  }
  
  mostrarStatus('statusVerificar', '⏳ Verificando...', 'info');
  
  // Busca loja no banco
  const { data, error } = await supabase
    .from('lojas')
    .select('nome, sigla')
    .eq('sigla', sigla)
    .single();
  
  if (error || !data) {
    mostrarStatus(
      'statusVerificar',
      '❌ Loja não encontrada. Peça ao administrador para cadastrá-la.',
      'erro'
    );
    // Esconde seção se estava aberta
    document.getElementById('secaoImportar').classList.remove('visivel');
    document.getElementById('lojaInfo').classList.remove('visivel');
    document.getElementById('topoBadge').style.display = 'none';
    siglaAtual = null;
    return;
  }
  
  // Loja encontrada
  siglaAtual = data.sigla;
  
  mostrarStatus('statusVerificar', `✅ Loja verificada com sucesso!`, 'sucesso');
  
  // Mostra info da loja
  document.getElementById('lojaInfoNome').textContent = data.nome;
  document.getElementById('lojaInfoSigla').textContent = `Sigla: ${data.sigla}`;
  document.getElementById('lojaInfo').classList.add('visivel');
  
  // Mostra badge no topo
  const badge = document.getElementById('topoBadge');
  badge.textContent = data.sigla;
  badge.style.display = 'block';
  
  // Mostra seção de importar
  document.getElementById('secaoImportar').classList.add('visivel');
});

// Enter no input dispara verificação
document.getElementById('inputSigla').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btnVerificar').click();
});

// ===== IMPORTAR BASE =====
document.getElementById('btnImportar').addEventListener('click', async () => {
  if (!siglaAtual) return;
  
  const fileProd = document.getElementById('fileProd').files[0];
  const fileGar = document.getElementById('fileGar').files[0];
  
  if (!fileProd || !fileGar) {
    mostrarStatus('statusImportar', '⚠️ Selecione os dois arquivos.', 'erro');
    return;
  }
  
  const btn = document.getElementById('btnImportar');
  btn.disabled = true;
  btn.textContent = '⏳ Processando...';
  
  mostrarStatus('statusImportar', '⏳ Lendo arquivos...', 'info');
  
  try {
    const txtProd = await lerArquivo(fileProd);
    const txtGar = await lerArquivo(fileGar);
    
    const produtos = parseProdutos(txtProd).map(p => ({ ...p, loja_sigla: siglaAtual }));
    const garantias = parseGarantias(txtGar).map(g => ({ ...g, loja_sigla: siglaAtual }));
    
    mostrarStatus('statusImportar', '⏳ Limpando base anterior...', 'info');
    
    // Apaga base antiga
    await supabase.from('produtos').delete().eq('loja_sigla', siglaAtual);
    await supabase.from('garantias').delete().eq('loja_sigla', siglaAtual);
    
    mostrarStatus('statusImportar', `⏳ Enviando ${produtos.length} produtos...`, 'info');
    
    // Insere produtos em lotes
    for (const lote of chunk(produtos, 500)) {
      const { error } = await supabase.from('produtos').insert(lote);
      if (error) throw new Error('Erro produtos: ' + error.message);
    }
    
    mostrarStatus('statusImportar', `⏳ Enviando ${garantias.length} garantias...`, 'info');
    
    // Insere garantias em lotes
    for (const lote of chunk(garantias, 500)) {
      const { error } = await supabase.from('garantias').insert(lote);
      if (error) throw new Error('Erro garantias: ' + error.message);
    }
    
    // Salva data da importação
    const agora = new Date().toISOString();
    await supabase
      .from('lojas')
      .update({ ultima_importacao: agora })
      .eq('sigla', siglaAtual);
    
    mostrarStatus(
      'statusImportar',
      `✅ ${produtos.length} produtos e ${garantias.length} garantias importados!`,
      'sucesso'
    );
    
  } catch (err) {
    mostrarStatus('statusImportar', '❌ ' + err.message, 'erro');
  } finally {
    btn.disabled = false;
    btn.textContent = '⬆️ Importar para Nuvem';
  }
});

// ===== APAGAR BANCO =====
document.getElementById('btnApagar').addEventListener('click', async () => {
  if (!siglaAtual) return;
  
  const confirmou = confirm(
    `⚠️ Deseja apagar TODOS os dados da loja "${siglaAtual}"?\n\nEssa ação não pode ser desfeita.`
  );
  if (!confirmou) return;
  
  const btn = document.getElementById('btnApagar');
  btn.disabled = true;
  
  mostrarStatus('statusApagar', '⏳ Apagando...', 'info');
  
  try {
    const { error: errProd } = await supabase
      .from('produtos')
      .delete()
      .eq('loja_sigla', siglaAtual);
    if (errProd) throw new Error('Erro produtos: ' + errProd.message);
    
    const { error: errGar } = await supabase
      .from('garantias')
      .delete()
      .eq('loja_sigla', siglaAtual);
    if (errGar) throw new Error('Erro garantias: ' + errGar.message);
    
    mostrarStatus(
      'statusApagar',
      `✅ Banco da loja "${siglaAtual}" apagado com sucesso!`,
      'sucesso'
    );
    
  } catch (err) {
    mostrarStatus('statusApagar', '❌ ' + err.message, 'erro');
  } finally {
    btn.disabled = false;
  }
});