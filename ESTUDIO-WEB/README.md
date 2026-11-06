# Estúdio de Posts · Fit Pilates

Site estático para montar carrosséis, posts, avisos e imagens para compartilhar com a identidade da Fit Pilates. Não tem servidor nem etapa de build: são só arquivos HTML, CSS e JavaScript.

## Publicar no Vercel

1. Suba esta pasta para um repositório no GitHub (veja abaixo).
2. No [vercel.com](https://vercel.com), clique em **Add New → Project** e escolha o repositório.
3. Deixe **Framework Preset** em *Other*. Deixe **Build Command** e **Output Directory** em branco.
4. Clique em **Deploy**.

Cada `git push` na branch principal publica a versão nova sozinho.

## Subir para o GitHub

```bash
git init
git add .
git commit -m "Estúdio de Posts da Fit Pilates"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

Crie o repositório como **privado**. O site expõe o logo, os mockups e as fontes da marca.

## Proteger o acesso

Quem tiver o endereço abre o site. Para limitar:

- No Vercel, em **Settings → Deployment Protection**, ative a proteção por senha ou por login. Dependendo do plano, parte dessas opções é paga.
- Alternativa gratuita: colocar o domínio atrás do Cloudflare Access.

O site tem `noindex` para não aparecer no Google, mas isso não é proteção de acesso.

## Publicar no GitHub Pages

Também funciona, porque todos os caminhos são relativos. Em **Settings → Pages**, escolha a branch `main` e a pasta raiz. Em repositório privado, o GitHub Pages exige plano pago.

## Rodar no seu computador

Abra um terminal na pasta e rode:

```bash
npx serve .
```

Não abra o `index.html` com dois cliques, porque o navegador bloqueia a leitura do `fotos.json` nesse modo.

## Fotos

- **Do repositório:** coloque as fotos da Fit em `fotos/` e rode `node scripts/gerar-fotos.js`. Depois envie ao GitHub. Elas aparecem no editor para todos que usam o site.
- **Enviadas no editor:** ficam guardadas só no navegador de quem enviou. Não vão para o repositório.

## Onde ficam os trabalhos

Carrosséis e peças ficam salvos no navegador de cada pessoa. Se os dados do site forem limpos, eles somem da lista, então o ZIP baixado é a cópia segura. Não há login nem banco de dados.

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| `index.html` | Página única do estúdio |
| `css/` | Estilos da interface e dos slides |
| `js/` | Estilos de post (`modelos.js`), leitura do roteiro (`roteiro.js`), interface (`app.js`) e as bibliotecas em `vendor/` |
| `fontes/` | Working e Overused Grotesk |
| `logo/`, `mockups/`, `fotos/` | Imagens usadas nos slides |
| `fotos.json` | Lista das fotos disponíveis, gerada por `scripts/gerar-fotos.js` |

## Licenças

- **Overused Grotesk:** licença OFL 1.1, que permite uso comercial e publicação na web. O texto está em `fontes/OverusedGrotesk/LICENSE.txt`.
- **Working:** fonte da marca. Confirme com quem a forneceu se a licença permite publicação na web antes de deixar o site público.
- **Bibliotecas:** `html-to-image` (MIT) e `JSZip` (MIT ou GPLv3).
