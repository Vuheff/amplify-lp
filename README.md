# Landing Webinar Amplify

Landing page estática e mobile-first para o Webinar TikTok Shop da Amplify.

## Estrutura

```text
public/          site enviado ao Netlify
  index.html     entrada da landing
  assets/        CSS, JavaScript, vendor, ícones e imagens otimizadas
docs/            direção, backlog, arquitetura e decisões
tests/           servidor local e validações de interface
package.json     comandos de desenvolvimento
netlify.toml     configuração do deploy
```

Somente `public/` faz parte do deploy. Originais pesados, referências antigas e a implementação legada foram removidos da árvore atual e continuam recuperáveis pelo histórico do Git.

## Prévia local

Abra `preview.cmd` ou execute:

```text
npm run preview:open
```

A landing ficará disponível em `http://127.0.0.1:4173`.

## Validação

```text
npm run check:js
npm run check:hero
```

## Netlify

O arquivo `netlify.toml` define `public/` como diretório de publicação. Ao conectar o repositório, use a branch `main` e não informe comando de build.

CSS e JavaScript próprios exigem revalidação a cada navegação. O vendor versionado usa cache imutável; imagens e ícones mantêm cache de 7 dias. O parâmetro de versão em `main.css` e em seus imports deve ser atualizado quando houver alteração visual publicada, evitando que um deploy novo reutilize componentes antigos armazenados pelo navegador.

O ScrollReveal 4.0.9 é hospedado localmente em `public/assets/vendor/` e controla somente as entradas declaradas com `data-motion`. Seu bootstrap clássico é independente dos ES Modules, portanto também funciona ao abrir o HTML diretamente; a landing não depende de CDN para inicializar esse comportamento. Quando o navegador informa `prefers-reduced-motion`, as entradas usam um perfil curto de 480 ms e até 12 px, sem repetição ou loop.
