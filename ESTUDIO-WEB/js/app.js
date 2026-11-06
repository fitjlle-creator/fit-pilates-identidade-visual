// Interface do estúdio: painel inicial, carrosséis salvos, editor e exportação.
const CORES_PADRAO = { esc: '#005059', pri: '#006B75', dest: '#B56A55', claro: '#F2E8DC', tx: '#212620' };
const NOMES_CORES = { esc: 'Escuro', pri: 'Principal', dest: 'Destaque', claro: 'Claro', tx: 'Texto' };
const CHAVE_MARCA = 'estudio-posts-v1';
const CHAVE_PROJETOS = 'estudio-posts-projetos';
const K_MINIMO = 0.55;

const $ = (id) => document.getElementById(id);
const estado = {
  id: null, nome: '', criado: 0, alterado: false, unico: false, formato: 'feed',
  modelo: 'ensaio', roteiro: '', slides: [], legenda: '', atual: 0,
  fotos: [], perfil: '@fit_pilatesstudio', assinatura: 'Movimento bem cuidado', cores: { ...CORES_PADRAO },
};
let projetos = [];
const rascunhos = new Map();

// ---------- Persistência ----------
function guardarMarca() {
  const { perfil, assinatura, cores } = estado;
  try { localStorage.setItem(CHAVE_MARCA, JSON.stringify({ perfil, assinatura, cores, perfilOficial: true })); } catch { /* segue sem salvar */ }
}

function gravarProjetos() {
  try {
    localStorage.setItem(CHAVE_PROJETOS, JSON.stringify(projetos));
    return true;
  } catch {
    avisar('Não consegui salvar. O espaço deste navegador pode ter acabado.');
    return false;
  }
}

function recuperar() {
  let marca = {};
  try {
    marca = JSON.parse(localStorage.getItem(CHAVE_MARCA)) || {};
    projetos = JSON.parse(localStorage.getItem(CHAVE_PROJETOS)) || [];
  } catch { /* começa do padrão */ }
  // O perfil salvo só vale depois que o @ oficial foi aplicado uma vez; daí em diante a edição manual manda.
  const campos = marca.perfilOficial ? ['perfil', 'assinatura', 'cores'] : ['assinatura', 'cores'];
  for (const campo of campos) if (marca[campo]) estado[campo] = marca[campo];
  if (!marca.perfilOficial) guardarMarca();
  projetos = projetos.filter((p) => MODELOS[p.modelo]);

  // A versão anterior guardava um único roteiro: ele vira o primeiro carrossel salvo.
  const antigo = marca.roteiro;
  if (antigo && !projetos.length && !Object.values(EXEMPLOS).includes(antigo)) {
    const modelo = MODELOS[marca.modelo] ? marca.modelo : 'ensaio';
    const { slides, legenda } = montarSlides(antigo, MODELOS[modelo], estado.fotos);
    const agora = Date.now();
    projetos.push({ id: novoId(), nome: '', modelo, roteiro: antigo, slides, legenda, criado: agora, atualizado: agora });
    gravarProjetos();
  }
  if (antigo) guardarMarca();
}

const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function nomeAutomatico(slides) {
  const primeiro = Object.values(slides[0]?.campos || {}).find(Boolean) || '';
  const limpo = primeiro.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
  return limpo.length > 60 ? `${limpo.slice(0, 57)}…` : limpo || 'Carrossel sem título';
}
const nomeDe = (p) => p.nome || nomeAutomatico(p.slides);

function salvarAgora() {
  clearTimeout(salvarAgora.espera);
  if (!estado.id || !estado.alterado) return;
  const { id, nome, modelo, roteiro, slides, legenda, criado, unico, formato } = estado;
  const projeto = { id, nome, modelo, roteiro, slides, legenda, criado, unico, formato, atualizado: Date.now() };
  const i = projetos.findIndex((p) => p.id === id);
  if (i >= 0) projetos[i] = projeto; else projetos.unshift(projeto);
  rascunhos.delete(id);
  estado.alterado = false;
  gravarProjetos();
}

// Toda alteração feita pela pessoa passa por aqui e é salva sozinha.
function marcar() {
  estado.alterado = true;
  clearTimeout(salvarAgora.espera);
  salvarAgora.espera = setTimeout(salvarAgora, 400);
}

// ---------- Slides ----------
const modeloAtual = () => MODELOS[estado.modelo];
const avisar = (t) => { $('status').textContent = t; };

function criarSlide(slide, indice, modeloId = estado.modelo, total = estado.slides.length, formato = estado.formato) {
  const modelo = MODELOS[modeloId];
  const tipo = modelo.tipos[slide.tipo];
  const op = { ...tipo.opcoesPadrao, ...slide.opcoes };
  const el = document.createElement('div');
  el.className = `sl m-${modelo.classe || modeloId} ${tipo.fundo} fmt-${formato}`;
  if (op.fundo) el.classList.add(`v-${op.fundo}`);
  if (op.posicao) el.classList.add(`pos-${op.posicao}`);
  el.style.width = `${FORMATOS[formato].w}px`;
  el.style.height = `${FORMATOS[formato].h}px`;
  for (const [nome, valor] of Object.entries(estado.cores)) el.style.setProperty(`--${nome}`, valor);
  el.innerHTML = tipo.render(slide, { pos: indice + 1, total, perfil: estado.perfil, assinatura: estado.assinatura, op });
  return el;
}

// Encolhe a tipografia até o texto caber. A área de foto cede espaço antes, por ser flexível.
function ajustar(el) {
  const transbordou = () => [...el.querySelectorAll('.miolo,.metade,.abaixo,.caixa')]
    .some((n) => n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1);
  let k = 1;
  el.style.setProperty('--k', k);
  while (transbordou() && k > K_MINIMO) {
    k = Math.round((k - 0.03) * 100) / 100;
    el.style.setProperty('--k', k);
  }
  return !transbordou();
}

// Miniatura de slide para o painel. Depois de inserir na página, chame ajustarMinis.
function miniatura(slide, indice, modeloId, total, altura, formato = 'feed') {
  const { w, h } = FORMATOS[formato];
  const box = document.createElement('div');
  box.className = 'mini';
  box.setAttribute('aria-hidden', 'true');
  box.style.width = `${(altura * w) / h}px`;
  box.style.height = `${altura}px`;
  const el = criarSlide(slide, indice, modeloId, total, formato);
  el.style.transform = `scale(${altura / h})`;
  box.append(el);
  return box;
}
const ajustarMinis = (raiz) => raiz.querySelectorAll('.mini .sl').forEach(ajustar);

const exemplos = {};
function exemploDe(modeloId) {
  const m = MODELOS[modeloId];
  exemplos[modeloId] ??= m.unico ? [slideDaPeca(modeloId)] : montarSlides(EXEMPLOS[m.exemplo], m, estado.fotos).slides;
  return exemplos[modeloId];
}

function slideDaPeca(modeloId) {
  const { padrao } = MODELOS[modeloId];
  return {
    tipo: 'marca', campos: { ...padrao }, fotos: [], opcoes: {},
    bloco: { numero: 1, tipo: '', rotulados: { ...padrao }, paragrafos: [], imagens: [] },
  };
}

// ---------- Painel inicial ----------
function elemento(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

function cabecalhoInicio() {
  const topo = elemento('div', 'inicio-topo');
  const marca = elemento('img', 'logo');
  marca.src = LOGOS.escuro;
  marca.alt = 'Fit Pilates';
  topo.append(marca, elemento('span', '', 'Estúdio de Posts'));
  return topo;
}

function desenharNumeros() {
  const usos = {};
  for (const p of projetos) usos[p.modelo] = (usos[p.modelo] || 0) + 1;
  const favorito = Object.entries(usos).sort((a, b) => b[1] - a[1])[0];
  const box = elemento('div', 'numeros');
  const dados = [
    [projetos.length, projetos.length === 1 ? 'trabalho salvo' : 'trabalhos salvos'],
    [projetos.reduce((soma, p) => soma + p.slides.length, 0), 'imagens criadas'],
    [MODELOS[favorito[0]].nome, 'estilo mais usado'],
  ];
  for (const [valor, rotulo] of dados) {
    const item = elemento('div');
    item.append(elemento('b', '', valor), elemento('span', '', rotulo));
    box.append(item);
  }
  return box;
}

function cardFamilia(familia) {
  const ids = Object.keys(MODELOS).filter((id) => MODELOS[id].familia === familia);
  const card = elemento('button', 'card');
  card.type = 'button';
  card.onclick = () => { location.hash = `f/${encodeURIComponent(familia)}`; };
  const minis = elemento('div', 'minis');
  const slides = exemploDe(ids[0]);
  slides.slice(0, 3).forEach((s, i) => minis.append(miniatura(s, i, ids[0], slides.length, 105)));
  card.append(
    minis,
    elemento('h3', '', familia),
    elemento('span', 'meta', ids.length === 1 ? '1 estilo' : `${ids.length} estilos`),
    elemento('p', '', DESC_FAMILIAS[familia]),
    elemento('span', 'ir', 'Escolher estilo →'),
  );
  return card;
}

function cardPeca(id) {
  const m = MODELOS[id];
  const card = elemento('button', 'card');
  card.type = 'button';
  card.onclick = () => novoProjeto(id);
  const minis = elemento('div', 'minis');
  minis.append(miniatura(exemploDe(id)[0], 0, id, 1, 170, m.formato));
  card.append(minis, elemento('h3', '', m.nome), elemento('span', 'meta', FORMATOS[m.formato].nome),
    elemento('p', '', m.desc), elemento('span', 'ir', 'Criar →'));
  return card;
}

function cardSalvo(p) {
  const card = elemento('div', 'card');
  const minis = elemento('div', 'minis');
  const formato = p.formato || 'feed';
  if (p.slides[0]) minis.append(miniatura(p.slides[0], 0, p.modelo, p.slides.length, 200, formato));
  const data = new Date(p.atualizado).toLocaleDateString('pt-BR');
  const n = p.slides.length;
  const acoes = elemento('div', 'salvo-acoes');

  const abrir = elemento('button', 'abrir', 'Abrir');
  abrir.onclick = () => { location.hash = `p/${p.id}`; };
  const base = elemento('button', '', 'Usar como base');
  base.onclick = () => {
    const agora = Date.now();
    const copia = { ...structuredClone(p), id: novoId(), nome: `${nomeDe(p)} (cópia)`, criado: agora, atualizado: agora };
    projetos.unshift(copia);
    gravarProjetos();
    location.hash = `p/${copia.id}`;
  };
  // Excluir pede um segundo clique no mesmo botão.
  const excluir = elemento('button', 'perigo', 'Excluir');
  excluir.onclick = () => {
    if (!excluir.dataset.confirmar) {
      excluir.dataset.confirmar = '1';
      excluir.textContent = 'Confirmar exclusão';
      return;
    }
    projetos = projetos.filter((x) => x.id !== p.id);
    gravarProjetos();
    desenharInicio();
  };
  for (const b of [abrir, base, excluir]) b.type = 'button';
  acoes.append(abrir, base, excluir);
  card.append(
    minis,
    elemento('h3', '', nomeDe(p)),
    elemento('span', 'meta', `${MODELOS[p.modelo].nome} · ${p.unico ? FORMATOS[formato].nome : `${n} ${n === 1 ? 'slide' : 'slides'}`} · ${data}`),
    acoes,
  );
  return card;
}

function desenharInicio() {
  const tela = $('tela-inicio');
  tela.textContent = '';
  const box = elemento('div', 'inicio-in');
  box.append(cabecalhoInicio(), elemento('h1', '', 'O que vamos criar hoje?'),
    elemento('p', 'sub', 'Comece um carrossel ou uma peça única.'));
  if (projetos.length) box.append(desenharNumeros());

  const familias = elemento('div', 'grade');
  familias.append(...FAMILIAS.map(cardFamilia));
  const pecas = elemento('div', 'grade');
  pecas.append(...Object.keys(MODELOS).filter((id) => MODELOS[id].unico).map(cardPeca));
  box.append(
    elemento('h2', 'primeiro', 'Carrossel'), familias,
    elemento('h2', '', 'Peça única'),
    elemento('p', 'aviso-salvo', 'Uma imagem só, em qualquer tamanho: post, aviso, frase ou imagem para compartilhar.'), pecas,
    elemento('h2', '', 'Meus trabalhos'),
  );

  if (projetos.length) {
    box.append(elemento('p', 'aviso-salvo', 'Ficam salvos neste computador, neste navegador. Baixe o ZIP do que for importante.'));
    const salvos = elemento('div', 'grade');
    const ordem = [...projetos].sort((a, b) => b.atualizado - a.atualizado);
    salvos.append(...ordem.map(cardSalvo));
    box.append(salvos);
  } else {
    box.append(elemento('div', 'vazio', 'Nada por aqui ainda. O primeiro trabalho que você editar aparece aqui e é salvo sozinho.'));
  }
  tela.append(box);
  ajustarMinis(tela);
}

function desenharFamilia(familia) {
  const tela = $('tela-inicio');
  tela.textContent = '';
  const box = elemento('div', 'inicio-in');
  const voltar = elemento('a', 'voltar', '← Início');
  voltar.href = '#';
  box.append(cabecalhoInicio(), voltar, elemento('h1', '', familia), elemento('p', 'sub', DESC_FAMILIAS[familia]));

  const grade = elemento('div', 'grade');
  for (const [id, m] of Object.entries(MODELOS)) {
    if (m.familia !== familia) continue;
    const card = elemento('button', 'card');
    card.type = 'button';
    card.onclick = () => novoProjeto(id);
    const minis = elemento('div', 'minis');
    const slides = exemploDe(id);
    slides.slice(0, 2).forEach((s, i) => minis.append(miniatura(s, i, id, slides.length, 155)));
    card.append(minis, elemento('h3', '', m.nome), elemento('p', '', m.desc), elemento('span', 'ir', 'Usar este estilo →'));
    grade.append(card);
  }
  box.append(grade);
  tela.append(box);
  ajustarMinis(tela);
}

// ---------- Editor ----------
function desenharPalco() {
  const stage = $('stage');
  stage.textContent = '';
  const slide = estado.slides[estado.atual];
  if (!slide) { stage.textContent = 'Cole um roteiro e clique em Aplicar roteiro.'; return; }
  const { w, h } = FORMATOS[estado.formato];
  const escala = Math.min((stage.clientHeight - 8) / h, (stage.clientWidth - 8) / w);
  const moldura = document.createElement('div');
  moldura.className = 'moldura';
  moldura.style.width = `${w * escala}px`;
  moldura.style.height = `${h * escala}px`;
  const el = criarSlide(slide, estado.atual);
  moldura.append(el);
  stage.append(moldura);
  const coube = ajustar(el);
  el.style.transform = `scale(${escala})`;
  avisar(coube ? '' : 'O texto não coube neste layout. Encurte a frase.');
}

function desenharTira() {
  const tira = $('tira');
  tira.textContent = '';
  estado.slides.forEach((slide, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Slide ${i + 1}`);
    if (i === estado.atual) b.setAttribute('aria-current', 'true');
    const el = criarSlide(slide, i);
    b.append(el);
    b.onclick = () => { estado.atual = i; desenhar(); };
    tira.append(b);
    ajustar(el);
  });
}

// Fotos enviadas ficam no IndexedDB do navegador, sem servidor.
const LIMITE_FOTO = 25 * 1024 * 1024;
const abrirBanco = () => new Promise((ok, erro) => {
  const req = indexedDB.open('estudio-posts-fotos', 1);
  req.onupgradeneeded = () => req.result.createObjectStore('fotos', { keyPath: 'id' });
  req.onsuccess = () => ok(req.result);
  req.onerror = () => erro(req.error);
});
const noBanco = async (modo, fn) => {
  const db = await abrirBanco();
  return new Promise((ok, erro) => {
    const t = db.transaction('fotos', modo);
    const r = fn(t.objectStore('fotos'));
    t.oncomplete = () => { db.close(); ok(r.result); };
    t.onerror = t.onabort = () => { db.close(); erro(t.error); };
  });
};

function registrarFoto(reg) {
  const url = `idb:${reg.id}`;
  FOTO_SRC.set(url, URL.createObjectURL(reg.blob));
  return { nome: reg.nome, url };
}

async function enviarFoto(arquivo) {
  if (!/^image\/(png|jpeg|webp)$/.test(arquivo.type)) throw new Error('use PNG, JPG ou WEBP');
  if (arquivo.size > LIMITE_FOTO) throw new Error('arquivo acima de 25 MB');
  const reg = { id: novoId(), nome: arquivo.name, blob: arquivo };
  await noBanco('readwrite', (loja) => loja.put(reg));
  return registrarFoto(reg);
}

async function carregarFotos() {
  let fixas = [];
  try { fixas = await (await fetch('fotos.json')).json(); } catch { /* sem lista, só as enviadas */ }
  let enviadas = [];
  try { enviadas = (await noBanco('readonly', (loja) => loja.getAll())).map(registrarFoto).reverse(); } catch { /* sem IndexedDB */ }
  return [...enviadas, ...fixas];
}

function desenharEditor() {
  const ed = $('editor');
  ed.textContent = '';
  const slide = estado.slides[estado.atual];
  ed.append(elemento('h2', '', estado.unico ? 'Peça' : slide ? `Slide ${estado.atual + 1}` : 'Slide'));
  if (!slide) return;
  const modelo = modeloAtual();
  const tipo = modelo.tipos[slide.tipo];

  const rotuloTipo = elemento('label', '', 'Layout');
  const select = document.createElement('select');
  for (const [id, t] of Object.entries(modelo.tipos)) select.add(new Option(t.nome, id, false, id === slide.tipo));
  select.onchange = () => {
    slide.tipo = select.value;
    slide.campos = preencherCampos(slide.bloco, modelo.tipos[slide.tipo]);
    completarFotos(slide);
    marcar();
    desenhar();
  };
  rotuloTipo.append(select);
  ed.append(rotuloTipo);

  for (const opcao of tipo.opcoes || []) {
    const { nome, valores } = OPCOES[opcao];
    const atual = { ...tipo.opcoesPadrao, ...slide.opcoes }[opcao];
    const l = elemento('label', '', nome);
    const campo = document.createElement('select');
    for (const [id, rotulo] of Object.entries(valores)) campo.add(new Option(rotulo, id, false, id === atual));
    campo.onchange = () => {
      slide.opcoes = { ...slide.opcoes, [opcao]: campo.value };
      marcar();
      desenharPalco();
      desenharTira();
    };
    l.append(campo);
    ed.append(l);
  }

  for (const [chave, nome] of Object.entries(tipo.campos)) {
    const l = elemento('label', '', nome);
    const area = document.createElement('textarea');
    area.rows = 3;
    area.value = slide.campos[chave] || '';
    area.oninput = () => {
      slide.campos[chave] = area.value;
      // O texto editado passa a ser a origem, para sobreviver à troca de layout ou de estilo.
      slide.bloco.rotulados = { ...slide.campos };
      slide.bloco.paragrafos = [];
      marcar();
      desenharPalco();
    };
    area.onchange = desenharTira;
    l.append(area);
    ed.append(l);
  }

  for (let i = 0; i < (tipo.fotos || 0); i++) {
    const grade = elemento('div', 'fotos');
    for (const f of estado.fotos) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', f.nome);
      b.setAttribute('aria-pressed', String(slide.fotos[i] === f.url));
      const img = document.createElement('img');
      img.src = srcFoto(f.url) || ''; img.alt = ''; img.loading = 'lazy';
      b.append(img);
      b.onclick = () => { slide.fotos[i] = f.url; marcar(); desenhar(); };
      grade.append(b);
    }
    const envio = elemento('label', '', 'Enviar outra foto');
    const arquivo = document.createElement('input');
    arquivo.type = 'file';
    arquivo.accept = 'image/png,image/jpeg,image/webp';
    arquivo.onchange = async () => {
      const f = arquivo.files[0];
      if (!f) return;
      try {
        const foto = await enviarFoto(f);
        estado.fotos.unshift(foto);
        slide.fotos[i] = foto.url;
        marcar();
        desenhar();
      } catch (e) {
        avisar(`Não consegui enviar a foto (${e.message}).`);
      }
    };
    envio.append(arquivo);
    ed.append(elemento('h2', '', tipo.fotos > 1 ? `Foto ${i + 1}` : 'Foto'), grade, envio);
  }
}

function desenhar() { desenharPalco(); desenharTira(); desenharEditor(); }

function completarFotos(slide) {
  const faltam = (modeloAtual().tipos[slide.tipo].fotos || 0) - slide.fotos.length;
  for (let i = 0; i < faltam && estado.fotos.length; i++) {
    slide.fotos.push(estado.fotos[(slide.fotos.length + i) % estado.fotos.length].url);
  }
}

function aplicarRoteiro() {
  estado.roteiro = $('roteiro').value;
  const { slides, legenda } = montarSlides(estado.roteiro, modeloAtual(), estado.fotos);
  estado.slides = slides;
  estado.legenda = legenda;
  estado.atual = Math.min(estado.atual, Math.max(slides.length - 1, 0));
  desenhar();
  avisar(slides.length ? `${slides.length} slides` : 'Nenhum slide encontrado. Comece cada bloco com SLIDE 1, SLIDE 2…');
}

// Troca o estilo mantendo textos e fotos do carrossel aberto.
function trocarEstilo(id) {
  if (estado.unico) return trocarPeca(id);
  for (const s of estado.slides) s.bloco.fotos = s.fotos;
  estado.modelo = id;
  estado.slides = montarDeBlocos(estado.slides.map((s) => s.bloco), modeloAtual(), estado.fotos);
  if (estado.alterado || projetos.some((p) => p.id === estado.id)) marcar();
  desenharModelos();
  desenhar();
}

// Todas as peças têm os mesmos layouts. Texto editado fica; texto de exemplo acompanha a finalidade.
function trocarPeca(id) {
  const slide = estado.slides[0];
  if (!estado.alterado && !projetos.some((p) => p.id === estado.id)) {
    const novo = slideDaPeca(id);
    slide.campos = novo.campos;
    slide.bloco = novo.bloco;
    estado.formato = MODELOS[id].formato;
    $('formato').value = estado.formato;
  } else {
    marcar();
  }
  estado.modelo = id;
  desenharModelos();
  desenhar();
}

function desenharModelos() {
  const box = $('modelos');
  box.textContent = '';
  for (const familia of estado.unico ? [PECA] : FAMILIAS) {
    const chips = elemento('div', 'chips');
    for (const [id, m] of Object.entries(MODELOS)) {
      if (m.familia !== familia) continue;
      const b = elemento('button', '', m.nome);
      b.type = 'button';
      b.title = m.desc;
      b.setAttribute('aria-pressed', String(id === estado.modelo));
      b.onclick = () => trocarEstilo(id);
      chips.append(b);
    }
    box.append(elemento('div', 'familia', familia), chips);
  }
}

function desenharCores() {
  const box = $('cores');
  box.textContent = '';
  for (const [nome, rotulo] of Object.entries(NOMES_CORES)) {
    const l = elemento('label', '', rotulo);
    const i = document.createElement('input');
    i.type = 'color';
    i.value = estado.cores[nome];
    i.oninput = () => { estado.cores[nome] = i.value; guardarMarca(); desenhar(); };
    l.append(i);
    box.append(l);
  }
}

// ---------- Exportação ----------
// As imagens esperam o evento de carga: decode() não conclui em elementos fora da tela.
const carregada = (img) => (img.complete ? null : new Promise((ok) => { img.onload = img.onerror = ok; }));
let fontesCSS = null;

async function gerarPng(indice) {
  const area = $('render');
  const el = criarSlide(estado.slides[indice], indice);
  area.append(el);
  await document.fonts.ready;
  await Promise.all([...el.querySelectorAll('img')].map(carregada));
  ajustar(el);
  try {
    fontesCSS ??= await htmlToImage.getFontEmbedCSS(el);
    const { w, h } = FORMATOS[estado.formato];
    return await htmlToImage.toBlob(el, { width: w, height: h, pixelRatio: 1, fontEmbedCSS: fontesCSS });
  } finally {
    el.remove();
  }
}

function baixar(blob, nome) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

const nomeArquivo = (i) => (estado.unico
  ? `${estado.modelo}-${estado.formato}.png`
  : `${estado.modelo}-${String(i + 1).padStart(2, '0')}.png`);

async function comBotao(botao, tarefa) {
  botao.disabled = true;
  try { await tarefa(); } catch (e) { avisar(`Não foi possível exportar: ${e.message}`); } finally { botao.disabled = false; }
}

// ---------- Navegação ----------
function novoProjeto(modeloId) {
  const id = novoId();
  const m = MODELOS[modeloId];
  const agora = Date.now();
  const base = { id, nome: '', modelo: modeloId, criado: agora, atualizado: agora };
  if (m.unico) {
    rascunhos.set(id, { ...base, unico: true, formato: m.formato, roteiro: '', slides: [slideDaPeca(modeloId)], legenda: '' });
  } else {
    const roteiro = EXEMPLOS[m.exemplo];
    rascunhos.set(id, { ...base, unico: false, formato: 'feed', roteiro, ...montarSlides(roteiro, m, estado.fotos) });
  }
  location.hash = `p/${id}`;
}

function mostrar(tela) {
  $('tela-inicio').hidden = tela !== 'inicio';
  $('tela-editor').hidden = tela !== 'editor';
}

function abrirProjeto(id) {
  const p = rascunhos.get(id) || projetos.find((x) => x.id === id);
  if (!p) { location.hash = ''; return; }
  Object.assign(estado, { unico: false, formato: 'feed' }, structuredClone(p), { atual: 0, alterado: false });
  mostrar('editor');
  $('sec-roteiro').hidden = estado.unico;
  $('sec-peca').hidden = !estado.unico;
  $('tira').hidden = estado.unico;
  $('btn-zip').hidden = estado.unico;
  $('btn-png').classList.toggle('primario', estado.unico);
  $('btn-png').textContent = estado.unico ? 'Baixar imagem' : 'Baixar este slide';
  $('formato').value = estado.formato;
  $('legenda').value = estado.legenda;
  $('nome').value = estado.nome;
  $('nome').placeholder = nomeAutomatico(estado.slides);
  $('roteiro').value = estado.roteiro;
  desenharModelos();
  desenharCores();
  desenhar();
}

function rota() {
  salvarAgora();
  estado.id = null;
  const destino = location.hash.slice(1);
  if (destino.startsWith('p/')) return abrirProjeto(destino.slice(2));
  mostrar('inicio');
  $('tela-inicio').scrollTop = 0;
  const familia = destino.startsWith('f/') ? decodeURIComponent(destino.slice(2)) : '';
  if (FAMILIAS.includes(familia)) desenharFamilia(familia); else desenharInicio();
}

function ligar() {
  $('btn-aplicar').onclick = () => { aplicarRoteiro(); marcar(); };
  $('btn-exemplo').onclick = () => { $('roteiro').value = EXEMPLOS[modeloAtual().exemplo]; aplicarRoteiro(); };
  $('btn-legenda').onclick = async () => {
    try { await navigator.clipboard.writeText(estado.legenda); avisar('Legenda copiada'); } catch { avisar('Não consegui copiar a legenda.'); }
  };
  $('btn-png').onclick = (e) => comBotao(e.target, async () => {
    if (!estado.slides.length) return;
    baixar(await gerarPng(estado.atual), nomeArquivo(estado.atual));
    marcar();
  });
  $('btn-zip').onclick = (e) => comBotao(e.target, async () => {
    if (!estado.slides.length) return;
    const zip = new JSZip();
    for (let i = 0; i < estado.slides.length; i++) {
      avisar(`Gerando ${i + 1} de ${estado.slides.length}…`);
      zip.file(nomeArquivo(i), await gerarPng(i));
    }
    if (estado.legenda) zip.file('legenda.txt', estado.legenda);
    baixar(await zip.generateAsync({ type: 'blob' }), `carrossel-${estado.modelo}.zip`);
    marcar();
    avisar('Carrossel exportado');
  });
  $('nome').oninput = () => { estado.nome = $('nome').value.trim(); marcar(); };
  for (const [id, f] of Object.entries(FORMATOS)) $('formato').add(new Option(`${f.nome} · ${f.w}×${f.h}`, id));
  $('formato').onchange = () => { estado.formato = $('formato').value; marcar(); desenharPalco(); };
  $('legenda').oninput = () => { estado.legenda = $('legenda').value; marcar(); };
  for (const campo of ['perfil', 'assinatura']) {
    $(campo).value = estado[campo];
    $(campo).oninput = () => { estado[campo] = $(campo).value; guardarMarca(); desenhar(); };
  }
  addEventListener('resize', () => { if (estado.id) desenharPalco(); });
  addEventListener('hashchange', rota);
  addEventListener('pagehide', salvarAgora);
}

async function iniciar() {
  estado.fotos = await carregarFotos();
  recuperar();
  ligar();
  await document.fonts.load("40px 'Working'");
  await document.fonts.load("40px 'Overused Grotesk'");
  rota();
}
iniciar();
