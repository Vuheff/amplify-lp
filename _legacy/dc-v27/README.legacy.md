# Landing Mentoria TikTok Shop

Landing page mobile-first para venda da mentoria gravada da Amplify.

> A implementação atual está congelada como legado. O reinício organizado está em [`v0/`](v0/README.md) e permanece na fase de direcionamento, sem código de interface novo.

## Entrada principal

- `Webinar Landing v3.dc.html`: template, conteúdo editável e lógica DC.
- `support.js`: runtime da plataforma que renderiza o template DC.
- `assets/vendor/`: React, ScrollReveal e Swiper versionados localmente; a página não depende de CDN para renderizar.

## Executar localmente

Na raiz do projeto:

```powershell
py -m http.server 8765 --bind 127.0.0.1
```

Depois acesse:

```text
http://127.0.0.1:8765/Webinar%20Landing%20v3.dc.html
```

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Backlog](docs/BACKLOG.md)
- [Contrato de motion](docs/MOTION.md)

## Validar

```powershell
node tests/motion-contract.mjs
node tests/motion-browser-smoke.mjs --viewport=390
```

## Regra de publicação

Publicar apenas o HTML principal, `support.js`, `assets/`, `_ds/` e os metadados exigidos pela plataforma. A pasta `_archive/` não faz parte da landing em produção.
