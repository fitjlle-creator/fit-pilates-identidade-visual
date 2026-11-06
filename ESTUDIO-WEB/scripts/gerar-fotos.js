// Gera o fotos.json com as imagens das pastas fotos/ e mockups/.
// Rode depois de adicionar ou remover fotos: node scripts/gerar-fotos.js
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..');
const lista = [];
for (const pasta of ['fotos', 'mockups']) {
  const dir = path.join(raiz, pasta);
  if (!fs.existsSync(dir)) continue;
  for (const nome of fs.readdirSync(dir).sort()) {
    if (/\.(png|jpe?g|webp)$/i.test(nome)) lista.push({ nome, url: `${pasta}/${encodeURIComponent(nome)}` });
  }
}
fs.writeFileSync(path.join(raiz, 'fotos.json'), JSON.stringify(lista, null, 2) + '\n');
console.log(`fotos.json com ${lista.length} imagens.`);
