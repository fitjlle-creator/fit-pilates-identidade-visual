// Transforma o texto colado em slides prontos para qualquer modelo.
//
// Formato:
//   SLIDE 1 [capa]            <- o tipo entre colchetes é opcional
//   Título: frase             <- rótulos são opcionais
//   Segundo parágrafo
//   Imagem: instrutora        <- trecho do nome do arquivo em FOTOS ou MOCKUPS
//
//   LEGENDA
//   Texto da legenda

const RE_SLIDE = /^\s*(?:#+\s*)?\**\s*slide\s+(\d+)\s*(?:\[([\w-]+)\])?\s*\**\s*:?\s*$/i;
const RE_LEGENDA = /^\s*(?:#+\s*)?\**\s*legenda\s*\**\s*:?\s*$/i;
const RE_IMAGEM = /^\s*(?:imagem|foto|fotos)\s*:\s*(.+)$/i;
const RE_ROTULO = /^\s*([\p{L} ]{3,16})\s*:\s*(.+)$/u;

const ROTULOS = {
  titulo: 'titulo', 'título': 'titulo', manchete: 'titulo', frase: 'frase',
  subtitulo: 'subtitulo', 'subtítulo': 'subtitulo', apoio: 'subtitulo',
  texto: 'corpo', corpo: 'corpo', fecho: 'fecho', etiqueta: 'etiqueta', cartao: 'cartao', 'cartão': 'cartao',
  cima: 'cima', baixo: 'baixo', esquerda: 'cima', direita: 'baixo',
};

function lerRoteiro(bruto) {
  const blocos = [];
  const legenda = [];
  let atual = null;
  let naLegenda = false;

  for (const linha of String(bruto).replace(/\r/g, '').split('\n')) {
    const slide = linha.match(RE_SLIDE);
    if (slide) {
      atual = { numero: Number(slide[1]), tipo: slide[2] || '', rotulados: {}, paragrafos: [], imagens: [] };
      blocos.push(atual);
      naLegenda = false;
      continue;
    }
    if (RE_LEGENDA.test(linha)) { naLegenda = true; continue; }
    if (naLegenda) { legenda.push(linha); continue; }
    if (!atual || !linha.trim()) continue;

    const imagem = linha.match(RE_IMAGEM);
    if (imagem) { atual.imagens.push(...imagem[1].split(/[,;]/).map((t) => t.trim()).filter(Boolean)); continue; }

    const rotulo = linha.match(RE_ROTULO);
    const campo = rotulo && ROTULOS[rotulo[1].trim().toLowerCase()];
    if (campo) atual.rotulados[campo] = rotulo[2].trim();
    else atual.paragrafos.push(linha.trim());
  }
  return { blocos, legenda: legenda.join('\n').trim() };
}

// Sem indicação de tipo: primeiro slide é a capa, o último é o fecho e o meio percorre o ciclo do modelo.
function tipoPorPosicao(modelo, indice, total) {
  if (indice === 0) return modelo.capa;
  if (indice === total - 1 && total > 1) return modelo.fim;
  return modelo.ciclo[(indice - 1) % modelo.ciclo.length];
}

// Rótulos vão direto para o campo; parágrafos soltos preenchem os campos livres em ordem,
// e o que sobrar entra junto no último campo.
function preencherCampos(bloco, tipo) {
  const chaves = Object.keys(tipo.campos);
  const campos = {};
  for (const [nome, valor] of Object.entries(bloco.rotulados)) {
    const destino = chaves.includes(nome) ? nome : chaves.find((c) => !bloco.rotulados[c] && !campos[c]);
    if (destino) campos[destino] = valor;
  }
  const livres = chaves.filter((c) => !campos[c]);
  bloco.paragrafos.forEach((p, i) => {
    const destino = livres[Math.min(i, livres.length - 1)];
    if (destino) campos[destino] = campos[destino] ? `${campos[destino]}\n${p}` : p;
  });
  return campos;
}

// bloco.fotos guarda as fotos já escolhidas, para a troca de estilo não perder nada.
function montarDeBlocos(blocos, modelo, fotos) {
  let proxima = 0;
  return blocos.map((bloco, i) => {
    const tipoId = modelo.tipos[bloco.tipo] ? bloco.tipo : tipoPorPosicao(modelo, i, blocos.length);
    const tipo = modelo.tipos[tipoId];
    const escolhidas = bloco.fotos ? [...bloco.fotos] : bloco.imagens
      .map((termo) => fotos.find((f) => f.nome.toLowerCase().includes(termo.toLowerCase())))
      .filter(Boolean)
      .map((f) => f.url);
    while (escolhidas.length < (tipo.fotos || 0) && fotos.length) {
      escolhidas.push(fotos[proxima++ % fotos.length].url);
    }
    return { tipo: tipoId, campos: preencherCampos(bloco, tipo), fotos: escolhidas, bloco };
  });
}

function montarSlides(bruto, modelo, fotos) {
  const { blocos, legenda } = lerRoteiro(bruto);
  return { slides: montarDeBlocos(blocos, modelo, fotos), legenda };
}

const EXEMPLOS = {
  analise: `SLIDE 1
Oito horas sentada *cobram* em silêncio.
A lombar descobre sua rotina antes de você.
Imagem: instrutora

SLIDE 2
Você senta às oito e levanta para o almoço.
Depois senta de novo. No fim do dia, o corpo passou mais tempo parado do que você imagina.

SLIDE 3
O incômodo não chega de uma vez.
Ele ganha espaço aos poucos: primeiro no fim do expediente, depois ao levantar da cadeira.

SLIDE 4
Na primeira aula, *observamos* antes de propor.
Olhamos como você senta, como respira e onde o corpo compensa, e só depois escolhemos o exercício.

SLIDE 5
Pilates não é movimento a qualquer custo.
Mais difícil nem sempre é melhor. O que importa é fazer sentido para o seu corpo e para a sua rotina.

SLIDE 6
Cuidar agora é manter *possibilidades* depois.
Agachar para pegar o filho no colo, carregar a mala, subir a escada sem pensar nisso.

SLIDE 7
Saúde é construída antes de virar urgência.
Manda este post para quem também passa o dia sentada.

LEGENDA
O corpo não reclama no primeiro dia. Ele vai avisando aos poucos, e a rotina costuma falar mais alto.
Por aqui, a gente começa observando como você se move antes de propor qualquer exercício.
Movimento bem cuidado.`,

  split: `SLIDE 1
Cima: Movimento feito para parecer avançado
Baixo: Movimento feito para o seu corpo

SLIDE 2
Cima: Repetir até cansar
Baixo: Entender o que está fazendo

SLIDE 3
Exercício difícil impressiona no vídeo. No estúdio, a pergunta é outra: isso faz sentido para este corpo, hoje?
Mais difícil nem sempre é melhor.

SLIDE 4
Observamos, adaptamos, corrigimos e acompanhamos, e cada ajuste tem um motivo.
Técnica e cuidado andam juntos.

SLIDE 5
O Pilates é o meio.
O que importa é a vida que ele sustenta.

LEGENDA
Tem movimento que serve para a foto e movimento que serve para a vida. A gente fica com o segundo.`,

  identificacao: `SLIDE 1
Cima: Você resolve o dia inteiro
Baixo: e as costas só avisam à noite
Frase: "Depois eu vejo isso."
Título: Isso é *rotina*.

SLIDE 2
Cima: Você cuida de todo mundo
Baixo: e o seu corpo fica para depois
Frase: "É só o cansaço da semana."
Título: Isso é *costume*.

SLIDE 3
Cima: Você ainda faz tudo
Baixo: e já pensa antes de agachar
Frase: "Acho que agora é assim mesmo."
Título: Isso *pode mudar*.

SLIDE 4
Título: O corpo deve ampliar possibilidades, não impor limites.

LEGENDA
Se você se reconheceu em alguma dessas frases, conta para a gente como está a sua rotina.`,

  conversa: `SLIDE 1
A pergunta que mais ouvimos no estúdio é qual exercício resolve.

A que mais ajuda é outra: como é o seu dia?

SLIDE 2
Quem passa oito horas sentada não precisa da mesma aula de quem carrega criança no colo o dia inteiro.

SLIDE 3
Por isso a primeira aula começa com observação.

A gente olha como você senta, como respira e onde o corpo compensa.

SLIDE 4
Movimento bem cuidado começa por entender quem está se movendo.

LEGENDA
Conta para a gente como é a sua rotina.`,
};
