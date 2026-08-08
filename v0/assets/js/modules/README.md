# Módulos JavaScript

Interações aprovadas recebem um módulo isolado nesta pasta. Conteúdo e layout não dependem deles.

## Contrato

- exportar uma função `initFeature(root)`;
- retornar uma função de cleanup quando registrar listeners;
- receber uma raiz específica em vez de consultar a página inteira;
- usar hooks `data-js` e estado em `aria-*`/`data-state`;
- preservar funcionalidade essencial sem JavaScript;
- respeitar teclado e `prefers-reduced-motion`;
- não importar bibliotecas sem ADR.

Módulos ativos:

- `hero-decision-deck.js`: pilha real do Hero com botões, teclado e gesto horizontal;
- `lead-modal.js`: diálogo progressivo, seis passos, validação, foco, estados de oferta e confirmação;
- `lead-funnel-api.js`: contrato isolado dos webhooks de lead/intenção, atribuição e eventos da jornada;
- `photo-rail.js`: cria a duplicata inacessível e controla, via Web Animations API, velocidade, pausa, visibilidade, resize e reduced motion;
- `section-motion.js`: entradas curtas que nunca ocultam conteúdo.
- `site-navigation.js`: menu mobile, seção ativa, progresso e ocultação/revelação da navbar conforme a direção do scroll.

Próximo candidato: `faq-disclosure.js`, somente se `details/summary` não atender ao `CNT-007`.
