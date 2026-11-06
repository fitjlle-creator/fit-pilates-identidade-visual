// Catálogo de estilos. Cada modelo tem tipos de slide; cada tipo declara campos, fotos e como se desenha.
// Para criar um estilo novo: adicione uma entrada em MODELOS e, se precisar, um bloco .m-<id> em slides.css.

const LOGOS = {
  claro: 'logo/PNG/01_horizontal/fitpilates_horizontal_petroleo-escuro.png',
  escuro: 'logo/PNG/01_horizontal/fitpilates_horizontal_creme.png',
  grafite: 'logo/PNG/01_horizontal/fitpilates_horizontal_grafite.png',
  simbolo: 'logo/PNG/03_simbolo/fitpilates_simbolo_creme.png',
};

// Tamanhos de saída. O carrossel usa sempre o feed; as peças únicas escolhem.
const FORMATOS = {
  feed: { nome: 'Feed 4:5', w: 1080, h: 1350 },
  quadrado: { nome: 'Quadrado 1:1', w: 1080, h: 1080 },
  story: { nome: 'Story e Status 9:16', w: 1080, h: 1920 },
  paisagem: { nome: 'Paisagem 16:9', w: 1600, h: 900 },
};

// Opções que um tipo de slide pode oferecer no editor. Viram as classes v-* e pos-* em slides.css.
const OPCOES = {
  fundo: { nome: 'Cor de fundo', valores: { petroleo: 'Petróleo', escuro: 'Petróleo escuro', creme: 'Creme', terracota: 'Terracota', grafite: 'Grafite' } },
  posicao: { nome: "Posição da marca d'água", valores: { canto: 'Canto superior', base: 'Canto inferior', esquerda: 'Esquerda', centro: 'Centro' } },
};

// Fotos enviadas pelo editor ficam no navegador (id 'idb:...') e são resolvidas aqui para um endereço temporário.
const FOTO_SRC = new Map();
const srcFoto = (u) => (u && u.startsWith('idb:') ? FOTO_SRC.get(u) : u);

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// *trecho* vira destaque de cor; quebras de linha são mantidas.
const rico = (t) => esc(t).replace(/\*([^*\n]+)\*/g, '<em class="d">$1</em>').replace(/\n/g, '<br>');

const tag = (el, cls, t) => (t ? `<${el} class="${cls}">${rico(t)}</${el}>` : '');
// fundo: true para fundo claro, 'cor' para terracota, vazio para fundo escuro.
const logo = (fundo) => `<img class="logo" alt="Fit Pilates" src="${fundo === 'cor' ? LOGOS.grafite : fundo ? LOGOS.claro : LOGOS.escuro}">`;
const topo = (c, claro) => `<div class="topo">${logo(claro)}<span>${esc(c.assinatura)}</span></div>`;
const pe = (c) => `<div class="pe"><span>${esc(c.perfil)}</span><span>${c.pos}/${c.total}</span></div>`;
const foto = (s, i, cls = '') => {
  const url = srcFoto(s.fotos[i]);
  return url ? `<div class="foto ${cls}"><img alt="" src="${esc(url)}"></div>` : `<div class="foto vazia ${cls}"></div>`;
};
const miolo = (cls, html) => `<div class="miolo ${cls}">${html}</div>`;
const CTA = 'Arraste para o lado';

const TITULO = { titulo: 'Título' };
const TITULO_CORPO = { titulo: 'Título', corpo: 'Texto' };
const CAPA = { titulo: 'Título', subtitulo: 'Linha de apoio' };
const PAR = { cima: 'Frase de cima', baixo: 'Frase de baixo' };

const MODELOS = {
  ensaio: {
    nome: 'Ensaio', familia: 'Análise', exemplo: 'analise',
    desc: 'Páginas claras e escuras alternadas, foto de canto arredondado e título de marca.',
    capa: 'capa', fim: 'fim', ciclo: ['tituloFoto', 'fotoTitulo', 'texto', 'fotoCheia'],
    tipos: {
      capa: { nome: 'Capa · foto cheia', fundo: 'f-foto', fotos: 1, campos: CAPA,
        render: (s, c) => `${foto(s, 0, 'fundo')}<div class="veu topo-e-base"></div>${topo(c)}${miolo('base', tag('h2', 't-g', s.campos.titulo) + tag('p', 'c-g', s.campos.subtitulo))}${pe(c)}` },
      tituloFoto: { nome: 'Claro · título, foto e texto', fundo: 'f-claro', fotos: 1, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c, true)}${miolo('', tag('h2', 't-m', s.campos.titulo) + foto(s, 0, 'cresce redonda') + tag('p', 'c-m', s.campos.corpo))}${pe(c)}` },
      fotoTitulo: { nome: 'Escuro · foto, título e texto', fundo: 'f-escuro', fotos: 1, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c)}${miolo('', foto(s, 0, 'cresce redonda') + tag('h2', 't-m', s.campos.titulo) + tag('p', 'c-m', s.campos.corpo))}${pe(c)}` },
      texto: { nome: 'Claro · só texto', fundo: 'f-claro', fotos: 0, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c, true)}${miolo('meio', tag('h2', 't-g', s.campos.titulo) + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
      fotoCheia: { nome: 'Foto cheia · texto embaixo', fundo: 'f-foto', fotos: 1, campos: TITULO_CORPO,
        render: (s, c) => `${foto(s, 0, 'fundo')}<div class="veu"></div>${topo(c)}${miolo('base', tag('h2', 't-m', s.campos.titulo) + tag('p', 'c-m', s.campos.corpo))}${pe(c)}` },
      fim: { nome: 'Fecho · centralizado', fundo: 'f-foto', fotos: 1, campos: TITULO_CORPO,
        render: (s, c) => `${foto(s, 0, 'fundo')}<div class="veu cheio"></div>${topo(c)}${miolo('meio centro', tag('h2', 't-g', s.campos.titulo) + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
    },
  },

  folha: {
    nome: 'Folha', familia: 'Análise', exemplo: 'analise',
    desc: 'Creme e petróleo, capa emoldurada, linha pontilhada e cartão de fecho.',
    capa: 'capa', fim: 'fim', ciclo: ['texto', 'corFoto', 'cartao'],
    tipos: {
      capa: { nome: 'Capa · foto emoldurada', fundo: 'f-claro', fotos: 1, campos: { etiqueta: 'Etiqueta', titulo: 'Título' },
        render: (s, c) => `${topo(c, true)}<div class="moldura-capa">${foto(s, 0)}</div>${miolo('', tag('p', 'rot', s.campos.etiqueta) + tag('h2', 't-m', s.campos.titulo))}${pe(c)}` },
      texto: { nome: 'Creme · texto', fundo: 'f-claro', fotos: 0, campos: { titulo: 'Título', corpo: 'Texto', fecho: 'Fecho' },
        render: (s, c) => `${topo(c, true)}${miolo('meio', tag('h2', 't-g', s.campos.titulo) + tag('p', 'c-m', s.campos.corpo) + '<div class="pontilhado"></div>' + tag('p', 'c-f', s.campos.fecho))}${pe(c)}` },
      corFoto: { nome: 'Petróleo · texto e foto', fundo: 'f-escuro', fotos: 1, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c)}${miolo('', tag('h2', 't-m', s.campos.titulo) + tag('p', 'c-m', s.campos.corpo))}${foto(s, 0, 'sangra')}` },
      cartao: { nome: 'Petróleo · cartão creme', fundo: 'f-escuro', fotos: 0, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c)}${miolo('meio', `<div class="cartao">${tag('h2', 't-m', s.campos.titulo)}${tag('p', 'c-m', s.campos.corpo)}</div>`)}${pe(c)}` },
      fim: { nome: 'Fecho · duas fotos', fundo: 'f-claro', fotos: 2, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c, true)}${miolo('', `<div class="duas">${foto(s, 0)}${foto(s, 1)}</div>` + tag('h2', 't-m', s.campos.titulo) + tag('p', 'c-m', s.campos.corpo))}${pe(c)}` },
    },
  },

  dossie: {
    nome: 'Dossiê', familia: 'Análise', exemplo: 'analise',
    desc: 'Reportagem em grafite: título pesado, cabeçalho entre colchetes e filete de cor no pé.',
    capa: 'capa', fim: 'fecho', ciclo: ['cartao', 'fotoCima', 'fotoCheia'],
    tipos: {
      capa: { nome: 'Capa · foto cheia', fundo: 'f-foto', fotos: 1, campos: CAPA,
        render: (s, c) => `${foto(s, 0, 'fundo')}<div class="veu"></div><div class="topo"><span class="colchete">${esc(c.assinatura)}</span><span>${esc(c.perfil)}</span></div>${miolo('base centro', tag('h2', 't-g', s.campos.titulo) + tag('p', 'c-m', s.campos.subtitulo) + `<span class="pilula">${CTA}</span>`)}<div class="filete"></div>` },
      cartao: { nome: 'Cartão · foto com borda', fundo: 'f-grafite', fotos: 1, campos: TITULO_CORPO,
        render: (s, c) => `<div class="topo"><span class="colchete">${esc(c.assinatura)}</span><span>${c.pos}/${c.total}</span></div>${miolo('', foto(s, 0, 'cresce borda') + tag('h2', 't-m', s.campos.titulo) + tag('p', 'c-m', s.campos.corpo))}<div class="filete"></div>` },
      fotoCima: { nome: 'Foto em cima · fundo claro', fundo: 'f-claro', fotos: 1, campos: TITULO_CORPO,
        render: (s, c) => `<div class="topo"><span class="colchete">${esc(c.assinatura)}</span><span>${c.pos}/${c.total}</span></div>${miolo('', foto(s, 0, 'cresce redonda') + tag('h2', 't-m', s.campos.titulo) + tag('p', 'c-m', s.campos.corpo))}<div class="filete"></div>` },
      fotoCheia: { nome: 'Foto cheia · texto', fundo: 'f-foto', fotos: 1, campos: TITULO_CORPO,
        render: (s, c) => `${foto(s, 0, 'fundo')}<div class="veu"></div><div class="topo"><span class="colchete">${esc(c.assinatura)}</span><span>${c.pos}/${c.total}</span></div>${miolo('base', tag('h2', 't-m', s.campos.titulo) + tag('p', 'c-m', s.campos.corpo))}<div class="filete"></div>` },
      fecho: { nome: 'Fecho · duas fotos', fundo: 'f-grafite', fotos: 2, campos: TITULO_CORPO,
        render: (s, c) => `<div class="topo"><span class="colchete">${esc(c.assinatura)}</span><span>${esc(c.perfil)}</span></div>${miolo('', tag('h2', 't-m', s.campos.titulo) + tag('p', 'c-m', s.campos.corpo) + `<div class="duas">${foto(s, 0, 'redonda')}${foto(s, 1, 'redonda')}</div>`)}<div class="filete"></div>` },
    },
  },

  mosaico: {
    nome: 'Mosaico', familia: 'Análise', exemplo: 'analise',
    desc: 'Fundos alternados sem foto: gradiente, banda, cartão e numeração automática.',
    capa: 'capa', fim: 'fim', ciclo: ['claro', 'banda', 'cartao', 'escuro'],
    tipos: {
      capa: { nome: 'Capa · gradiente', fundo: 'f-grad', fotos: 0, campos: { titulo: 'Título', subtitulo: 'Frase final' },
        render: (s, c) => `${topo(c)}${miolo('base', tag('h2', 't-xg', s.campos.titulo) + tag('p', 'c-g regua', s.campos.subtitulo))}${pe(c)}` },
      claro: { nome: 'Claro · título e texto', fundo: 'f-claro', fotos: 0, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c, true)}${miolo('meio', `<span class="num">/${String(c.pos).padStart(2, '0')}</span>` + tag('h2', 't-g', s.campos.titulo) + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
      banda: { nome: 'Cor · banda escura', fundo: 'f-cor', fotos: 0, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c, 'cor')}${miolo('meio', `<div class="banda">${tag('h2', 't-g', s.campos.titulo)}</div>` + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
      cartao: { nome: 'Claro · cartão petróleo', fundo: 'f-claro', fotos: 0, campos: { titulo: 'Título', cartao: 'Texto do cartão', corpo: 'Texto' },
        render: (s, c) => `${topo(c, true)}${miolo('meio', tag('h2', 't-m', s.campos.titulo) + (s.campos.cartao ? `<div class="cartao">${tag('p', 'c-g', s.campos.cartao)}</div>` : '') + tag('p', 'c-m', s.campos.corpo))}${pe(c)}` },
      escuro: { nome: 'Escuro · título e texto', fundo: 'f-grafite', fotos: 0, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c)}${miolo('meio', `<span class="num">/${String(c.pos).padStart(2, '0')}</span>` + tag('h2', 't-g', s.campos.titulo) + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
      fim: { nome: 'Fecho · gradiente', fundo: 'f-grad', fotos: 0, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c)}${miolo('meio centro', tag('h2', 't-g', s.campos.titulo) + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
    },
  },

  manifesto: {
    nome: 'Manifesto', familia: 'Alternativo', exemplo: 'analise',
    desc: 'Apresentação de estúdio: caixa de cor sobre foto, páginas sólidas e tiras de imagem.',
    capa: 'caixa', fim: 'fim', ciclo: ['solida', 'tiras', 'solidaCor', 'grande'],
    tipos: {
      caixa: { nome: 'Capa · caixa de cor', fundo: 'f-foto', fotos: 1, campos: { titulo: 'Título', corpo: 'Texto da caixa' },
        render: (s, c) => `${foto(s, 0, 'fundo')}<div class="veu cheio"></div>${topo(c)}${miolo('', `<div class="caixa">${tag('h2', 't-g', s.campos.titulo)}${tag('p', 'c-m', s.campos.corpo)}</div>`)}${pe(c)}` },
      solida: { nome: 'Página petróleo', fundo: 'f-escuro', fotos: 0, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c)}${miolo('base', tag('h2', 't-xg', s.campos.titulo) + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
      solidaCor: { nome: 'Página terracota', fundo: 'f-cor', fotos: 0, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c, 'cor')}${miolo('base', tag('h2', 't-xg', s.campos.titulo) + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
      tiras: { nome: 'Grafite · duas tiras de foto', fundo: 'f-grafite', fotos: 2, campos: { titulo: 'Título', cima: 'Frase da tira de cima', baixo: 'Frase da tira de baixo' },
        render: (s, c) => `${topo(c)}${miolo('', tag('h2', 't-m', s.campos.titulo) + `<div class="tira-foto">${foto(s, 0)}${tag('p', '', s.campos.cima)}</div><div class="tira-foto">${foto(s, 1)}${tag('p', '', s.campos.baixo)}</div>`)}${pe(c)}` },
      grande: { nome: 'Foto · título gigante', fundo: 'f-foto', fotos: 1, campos: { titulo: 'Título', subtitulo: 'Linha de apoio' },
        render: (s, c) => `${foto(s, 0, 'fundo')}<div class="veu"></div>${topo(c)}${miolo('base', tag('h2', 't-xg', s.campos.titulo) + tag('p', 'c-g', s.campos.subtitulo))}${pe(c)}` },
      fim: { nome: 'Fecho · foto', fundo: 'f-foto', fotos: 1, campos: TITULO_CORPO,
        render: (s, c) => `${foto(s, 0, 'fundo')}<div class="veu cheio"></div>${topo(c)}${miolo('meio centro', tag('h2', 't-g', s.campos.titulo) + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
    },
  },

  jornal: {
    nome: 'Jornal', familia: 'Alternativo', exemplo: 'analise',
    desc: 'Jornal de feed: fundo grafite com grade, foto em cartão e *asterisco* que pinta de cor.',
    capa: 'capa', fim: 'fim', ciclo: ['texto', 'fotoMeio', 'cor'],
    tipos: {
      capa: { nome: 'Capa · foto em cartão', fundo: 'f-grafite quadriculado', fotos: 1, campos: { titulo: 'Título', subtitulo: 'Linha de apoio' },
        render: (s, c) => `${topo(c)}${miolo('centro', foto(s, 0, 'cresce') + tag('h2', 'forte', s.campos.titulo) + tag('p', 'c-m', s.campos.subtitulo))}${pe(c)}` },
      texto: { nome: 'Só texto · grade', fundo: 'f-grafite quadriculado', fotos: 0, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c)}${miolo('meio', tag('h2', 'forte', s.campos.titulo) + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
      fotoMeio: { nome: 'Texto e foto em cartão', fundo: 'f-grafite quadriculado', fotos: 1, campos: { titulo: 'Título', corpo: 'Texto', fecho: 'Fecho' },
        render: (s, c) => `${topo(c)}${miolo('', tag('h2', 'forte', s.campos.titulo) + foto(s, 0, 'cresce') + tag('p', 'c-m', s.campos.corpo) + tag('p', 'c-f', s.campos.fecho))}${pe(c)}` },
      cor: { nome: 'Página de cor', fundo: 'f-cor', fotos: 0, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c, 'cor')}${miolo('meio', tag('h2', 'forte', s.campos.titulo) + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
      fim: { nome: 'Fecho · chamada', fundo: 'f-foto', fotos: 1, campos: TITULO_CORPO,
        render: (s, c) => `${foto(s, 0, 'fundo')}<div class="veu cheio"></div>${topo(c)}${miolo('meio centro', tag('h2', 'forte', s.campos.titulo) + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
    },
  },

  contraste: {
    nome: 'Contraste', familia: 'Split', exemplo: 'split',
    desc: 'Duas fotos empilhadas por slide no choque e páginas de tese no meio do carrossel.',
    capa: 'duplo', fim: 'fecho', ciclo: ['duplo', 'tese', 'teseClara'],
    tipos: {
      duplo: { nome: 'Contraste · 2 fotos', fundo: 'f-grafite', fotos: 2, campos: PAR,
        render: (s) => `<div class="metade">${foto(s, 0)}<div class="veu"></div>${tag('p', '', s.campos.cima)}</div><div class="metade">${foto(s, 1)}<div class="veu"></div>${tag('p', '', s.campos.baixo)}</div>` },
      tese: { nome: 'Escuro · foto e tese', fundo: 'f-escuro', fotos: 1, campos: { corpo: 'Texto', fecho: 'Frase de fecho' },
        render: (s, c) => `${topo(c)}${miolo('', foto(s, 0, 'cresce') + tag('p', 'c-m', s.campos.corpo) + tag('p', 't-p', s.campos.fecho))}${pe(c)}` },
      teseClara: { nome: 'Claro · foto e tese', fundo: 'f-claro', fotos: 1, campos: { corpo: 'Texto', fecho: 'Frase de fecho' },
        render: (s, c) => `${topo(c, true)}${miolo('', tag('p', 'c-m', s.campos.corpo) + foto(s, 0, 'cresce') + tag('p', 't-p', s.campos.fecho))}${pe(c)}` },
      fecho: { nome: 'Fecho · frase', fundo: 'f-grafite', fotos: 0, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c)}${miolo('meio centro', tag('h2', 't-g', s.campos.titulo) + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
    },
  },

  contrasteTexto: {
    nome: 'Contraste sem foto', familia: 'Split', exemplo: 'split',
    desc: 'O mesmo choque em bandas de gradiente, para quando ainda não há banco de imagens.',
    capa: 'duplo', fim: 'fim', ciclo: ['duplo', 'banda'],
    tipos: {
      duplo: { nome: 'Contraste · 2 frases', fundo: 'f-grafite', fotos: 0, campos: PAR,
        render: (s) => `<div class="metade banda-a">${tag('p', '', s.campos.cima)}</div><div class="metade banda-b">${tag('p', '', s.campos.baixo)}</div>` },
      banda: { nome: 'Banda e texto', fundo: 'f-escuro', fotos: 0, campos: { corpo: 'Texto', fecho: 'Frase de fecho' },
        render: (s, c) => `${topo(c)}${miolo('meio', tag('p', 'c-g', s.campos.corpo) + tag('p', 't-p', s.campos.fecho))}${pe(c)}` },
      fim: { nome: 'Fecho · frase grande', fundo: 'f-grafite', fotos: 0, campos: TITULO_CORPO,
        render: (s, c) => `${topo(c)}${miolo('meio centro', tag('h2', 't-g', s.campos.titulo) + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
    },
  },

  espelho: {
    nome: 'Espelho', familia: 'Identificação', exemplo: 'identificacao',
    desc: 'A mesma foto duas vezes, em cor e em preto e branco, com uma frase em cada metade.',
    capa: 'duplo', fim: 'fim', ciclo: ['duplo'],
    tipos: {
      duplo: { nome: 'Cor × preto e branco', fundo: 'f-grafite', fotos: 1, campos: { cima: 'Frase da esquerda', baixo: 'Frase da direita' },
        render: (s) => `<div class="espelho"><div>${foto(s, 0)}<div class="veu"></div>${tag('p', '', s.campos.cima)}</div><div class="pb">${foto(s, 0)}<div class="veu"></div>${tag('p', '', s.campos.baixo)}</div></div>` },
      fim: { nome: 'Fecho · fundo liso', fundo: 'f-claro', fotos: 0, campos: TITULO,
        render: (s, c) => `${topo(c, true)}${miolo('meio centro', tag('h2', 't-g', s.campos.titulo))}${pe(c)}` },
    },
  },

  veredito: {
    nome: 'Veredito', familia: 'Identificação', exemplo: 'identificacao',
    desc: 'Foto com a fala entre aspas em cima e, embaixo, a conclusão em uma linha.',
    capa: 'quadro', fim: 'fim', ciclo: ['quadro'],
    tipos: {
      quadro: { nome: 'Foto e veredito', fundo: 'f-claro', fotos: 1, campos: { frase: 'Fala', titulo: 'Veredito' },
        render: (s, c) => `<div class="acima">${foto(s, 0)}<div class="veu"></div>${topo(c)}${tag('p', 'fala', s.campos.frase)}</div><div class="abaixo">${tag('h2', 't-g', s.campos.titulo)}</div>` },
      fim: { nome: 'Fecho · foto cheia', fundo: 'f-foto', fotos: 1, campos: TITULO,
        render: (s, c) => `${foto(s, 0, 'fundo')}<div class="veu cheio"></div>${topo(c)}${miolo('meio centro', tag('h2', 't-g', s.campos.titulo))}${pe(c)}` },
    },
  },

  umaFrase: {
    nome: 'Uma frase', familia: 'Identificação', exemplo: 'identificacao',
    desc: 'Foto cheia com granulado e uma frase mínima por slide; a história se monta no arrastar.',
    capa: 'palavra', fim: 'fim', ciclo: ['palavra'],
    tipos: {
      palavra: { nome: 'Foto e frase mínima', fundo: 'f-foto', fotos: 1, campos: { titulo: 'A frase deste slide' },
        render: (s, c) => `${foto(s, 0, 'fundo')}<div class="veu cheio"></div><div class="grao"></div>${topo(c)}${miolo('meio centro', tag('h2', 't-g', s.campos.titulo))}${pe(c)}` },
      fim: { nome: 'Fecho · segue', fundo: 'f-foto', fotos: 1, campos: TITULO_CORPO,
        render: (s, c) => `${foto(s, 0, 'fundo')}<div class="veu cheio"></div><div class="grao"></div>${topo(c)}${miolo('meio centro', tag('h2', 't-g', s.campos.titulo) + tag('p', 'c-g', s.campos.corpo))}${pe(c)}` },
    },
  },
};

// Conversa: formato de post em texto. Sem logo nem selo de rede social, com o símbolo da Fit como avatar.
function tiposConversa(fundo) {
  const autor = (c) => `<div class="autor"><img class="avatar" alt="" src="${LOGOS.simbolo}"><div><div class="nome">Fit Pilates</div><div class="arroba">${esc(c.perfil)}</div></div></div>`;
  const campos = { texto: 'Texto do post' };
  return {
    so: { nome: 'Só texto', fundo, fotos: 0, campos,
      render: (s, c) => miolo('meio', autor(c) + tag('p', 'post', s.campos.texto)) },
    umaFoto: { nome: 'Texto e 1 foto', fundo, fotos: 1, campos,
      render: (s, c) => miolo('meio', autor(c) + tag('p', 'post', s.campos.texto) + foto(s, 0, 'cresce redonda')) },
    duasFotos: { nome: 'Texto e 2 fotos', fundo, fotos: 2, campos,
      render: (s, c) => miolo('meio', autor(c) + tag('p', 'post', s.campos.texto) + `<div class="duas">${foto(s, 0, 'redonda')}${foto(s, 1, 'redonda')}</div>`) },
  };
}
const CONVERSA = { familia: 'Conversa', exemplo: 'conversa', capa: 'umaFoto', fim: 'so', ciclo: ['so', 'so', 'umaFoto'], classe: 'conversa' };
MODELOS.conversa = { ...CONVERSA, nome: 'Conversa clara', desc: 'Cada slide é um post em texto, com avatar e perfil, em fundo claro.', tipos: tiposConversa('f-branco') };
MODELOS.conversaEscura = { ...CONVERSA, nome: 'Conversa escura', desc: 'O mesmo formato em fundo escuro.', tipos: tiposConversa('f-preto') };

// Marca d'água: cor de fundo e símbolo gigante em um tom próximo, como a capa do manual da marca.
const agua = () => `<svg class="agua" viewBox="${SIMBOLO.viewBox}" aria-hidden="true">${SIMBOLO.paths.map((d) => `<path d="${d}"/>`).join('')}</svg>`;
const logoGrande = (c) => {
  const fundo = c.op.fundo;
  const src = fundo === 'creme' ? LOGOS.claro : fundo === 'terracota' ? LOGOS.grafite : LOGOS.escuro;
  return `<img class="logo grande" alt="Fit Pilates" src="${src}">`;
};
const rotulos = (s, c) => {
  const direita = s.campos.etiqueta ? esc(s.campos.etiqueta) : c.total > 1 ? `${c.pos}/${c.total}` : '';
  return `<div class="rotulos"><span>Fit Pilates</span><span>${direita}</span></div>`;
};
const ficha = (s) => (s.campos.rotulo || s.campos.info
  ? `<div class="ficha">${tag('span', '', s.campos.rotulo)}${tag('b', '', s.campos.info)}</div>` : '');
const texto = (s, classe = 't-xg') => tag('h2', classe, s.campos.titulo) + tag('p', 'c-g', s.campos.corpo) + ficha(s);

function renderMarca(s, c, { comLogo = true, titulo = 't-xg' } = {}) {
  return `${agua()}${rotulos(s, c)}${miolo('base', (comLogo ? logoGrande(c) : '') + texto(s, titulo))}`;
}

const tipoMarca = (nome, fundo, posicao, opcoesRender, campos = TITULO_CORPO) => ({
  nome, fundo: 'f-escuro', fotos: 0, campos, opcoes: ['fundo', 'posicao'], opcoesPadrao: { fundo, posicao },
  render: (s, c) => renderMarca(s, c, opcoesRender),
});

MODELOS.marcaDagua = {
  nome: "Marca d'água", familia: 'Alternativo', exemplo: 'analise',
  desc: 'Cor de fundo e o símbolo da Fit gigante em um tom próximo, como a capa do manual.',
  capa: 'capa', fim: 'fim', ciclo: ['creme', 'terracota', 'escuro'],
  tipos: {
    capa: tipoMarca('Capa · petróleo', 'petroleo', 'canto'),
    creme: tipoMarca('Creme · texto', 'creme', 'base', { comLogo: false, titulo: 't-g' }),
    terracota: tipoMarca('Terracota · texto', 'terracota', 'esquerda', { comLogo: false, titulo: 't-g' }),
    escuro: tipoMarca('Petróleo escuro · texto', 'escuro', 'canto', { comLogo: false, titulo: 't-g' }),
    fim: tipoMarca('Fecho · centro', 'petroleo', 'centro', { titulo: 't-g' }),
  },
};

// Peças únicas: cada finalidade troca rótulos e texto inicial; os visuais são compartilhados.
function tiposPeca(campos) {
  return {
    marca: tipoMarca("Marca d'água", 'petroleo', 'canto', {}, campos),
    solido: { nome: 'Cor sólida', fundo: 'f-escuro', fotos: 0, campos, opcoes: ['fundo'], opcoesPadrao: { fundo: 'escuro' },
      render: (s, c) => `${rotulos(s, c)}${miolo('meio', logoGrande(c) + texto(s))}` },
    foto: { nome: 'Foto cheia', fundo: 'f-foto', fotos: 1, campos,
      render: (s, c) => `${foto(s, 0, 'fundo')}<div class="veu topo-e-base"></div>${rotulos(s, c)}${miolo('base', texto(s, 't-g'))}` },
    dividido: { nome: 'Foto e cor', fundo: 'f-escuro', fotos: 1, campos, opcoes: ['fundo'], opcoesPadrao: { fundo: 'petroleo' },
      render: (s, c) => `<div class="dividido">${foto(s, 0)}<div class="lado">${miolo('meio', texto(s, 't-g'))}</div></div>` },
    cartao: { nome: 'Cartão sobre foto', fundo: 'f-foto', fotos: 1, campos,
      render: (s, c) => `${foto(s, 0, 'fundo')}<div class="veu cheio"></div>${rotulos(s, c)}${miolo('meio', `<div class="cartao-peca">${texto(s, 't-g')}</div>`)}` },
  };
}

const PECA = 'Peça única';
const peca = (nome, desc, formato, campos, padrao) => ({
  nome, desc, formato, padrao, familia: PECA, unico: true, tipos: tiposPeca(campos),
});
const CAMPOS_BASE = { etiqueta: 'Etiqueta (canto)', titulo: 'Título', corpo: 'Texto', rotulo: 'Rótulo', info: 'Informação' };

Object.assign(MODELOS, {
  postUnico: peca('Post único', 'Um post de imagem só para o feed.', 'feed', CAMPOS_BASE, {
    etiqueta: 'Corpo na vida real', titulo: 'Movimento bem cuidado.',
    corpo: 'Observar, adaptar, corrigir e acompanhar. Cada ajuste tem um motivo.',
  }),
  aviso: peca('Aviso', 'Feriado, horário novo, recesso ou qualquer recado para as alunas.', 'feed',
    { ...CAMPOS_BASE, etiqueta: 'Etiqueta (canto)', titulo: 'O recado', rotulo: 'Rótulo (ex.: Voltamos)', info: 'Data ou horário' }, {
      etiqueta: 'Aviso', titulo: 'Não teremos aula no feriado.',
      corpo: 'As aulas de sexta serão repostas. Fale com a gente para combinar o melhor horário.',
      rotulo: 'Voltamos', info: 'Segunda-feira',
    }),
  frase: peca('Frase', 'Lema ou ideia da marca em destaque.', 'quadrado',
    { etiqueta: 'Etiqueta (canto)', titulo: 'Frase', corpo: 'Complemento' }, {
      titulo: 'Capacidade para a vida.',
    }),
  agenda: peca('Data e evento', 'Aula especial, encontro ou data importante.', 'feed',
    { ...CAMPOS_BASE, rotulo: 'Rótulo (ex.: Quando)', info: 'Data, hora e local' }, {
      etiqueta: 'Agenda', titulo: 'Nome do encontro.',
      corpo: 'Uma frase sobre o que vai acontecer e para quem é.',
      rotulo: 'Quando', info: 'Dia, horário e local',
    }),
  compartilhar: peca('Para compartilhar', 'Imagem vertical para Story e Status do WhatsApp.', 'story',
    { etiqueta: 'Etiqueta (canto)', titulo: 'Frase', corpo: 'Texto', rotulo: 'Rótulo', info: 'Chamada' }, {
      titulo: 'O corpo deve ampliar possibilidades, não impor limites.',
      corpo: 'Manda para quem precisa ouvir isso hoje.',
    }),
});

const FAMILIAS = ['Análise', 'Alternativo', 'Split', 'Identificação', 'Conversa'];
const DESC_FAMILIAS = {
  'Análise': 'Um tema explicado em vários slides, para quem quer entender antes de decidir.',
  Alternativo: 'Fora do padrão: manifesto de estúdio e jornal de feed.',
  Split: 'Duas ideias frente a frente em cada slide, no choque e na tese.',
  'Identificação': 'Frases curtas e fotos com atmosfera, para a pessoa se reconhecer.',
  Conversa: 'Cada slide é um post em texto, com avatar e perfil.',
};
