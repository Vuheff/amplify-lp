# Arquitetura do projeto

## Objetivo

Manter a landing simples de publicar, segura para editar na plataforma DC e fácil de evoluir sem misturar conteúdo, estilo, comportamento e arquivos temporários.

## Estrutura

```text
Landing webinar mobile-first 2/
├── Webinar Landing v3.dc.html       # entrada, template e dados comerciais
├── support.js                       # runtime DC da plataforma
├── assets/
│   ├── css/
│   │   └── landing.css              # sistema visual e responsividade
│   ├── js/
│   │   └── motions.js               # ScrollReveal, Swiper e interações de UI
│   ├── vendor/                      # dependências versionadas e servidas localmente
│   │   ├── react.production.min.js
│   │   ├── react-dom.production.min.js
│   │   ├── scrollreveal.min.js
│   │   ├── swiper-bundle.min.js
│   │   ├── swiper-bundle.min.css
│   │   └── README.md
│   └── images/
│       ├── brand/
│       │   └── amplify-logo.png
│       ├── brands/                  # logos usados como prova social
│       ├── proof/                   # fotos de cases e resultados
│       └── people/
│           └── matheus-head-operacoes-amplify.png
├── docs/
│   ├── ARCHITECTURE.md
│   ├── BACKLOG.md
│   └── MOTION.md                  # contrato e ciclo de animações
├── tests/
│   ├── motion-contract.mjs         # contrato estático de motion e cache
│   └── motion-browser-smoke.mjs    # narrativa, responsividade, fallback e modal
├── _ds/                             # dependência da plataforma; não editar
├── .thumbnail                       # metadado da plataforma; não editar
└── _archive/                        # itens fora de produção e recuperáveis
```

## Responsabilidades

### HTML e conteúdo

`Webinar Landing v3.dc.html` contém:

- estrutura semântica da página;
- textos e componentes de conversão;
- propriedades editáveis do checkout e preço;
- prólogo do hero, sete capítulos comerciais e suas perguntas do lead;
- quatro decisões operacionais, entregas, case real e FAQ;
- lógica de renderização e controle do FAQ.

Por compatibilidade com o runtime DC, a classe `Component extends DCLogic` permanece embutida no documento.

### Estilos

`assets/css/landing.css` reúne:

- tokens de cor e tipografia;
- componentes base;
- sistema visual mobile-first, raios, bordas, espaçamento e containers consistentes;
- componentes de conversão;
- camada compacta mobile-first até 699 px.

Novos estilos devem usar classes semânticas. As classes `u-*` são legadas do gerador e devem ser substituídas gradualmente, não renomeadas em massa.

### Movimento e interação

`assets/js/motions.js` é responsável por:

- loader inicial de marca com encerramento seguro e exibição reduzida na mesma sessão;
- entrada coordenada do hero e progresso de leitura da página;
- estado do capítulo comercial ativo;
- progresso, teclado e affordance dos trilhos horizontais;
- inicialização segura do ScrollReveal;
- deck de perguntas com Swiper, controles acessíveis e fallback por scroll-snap;
- fallback com `IntersectionObserver`;
- revelação por máscara das imagens de case e mentor;
- estado visual do cabeçalho;
- feedback dos links internos;
- movimento sutil do cartão principal e dos CTAs em dispositivos com ponteiro;
- exibição contextual do dock de conversão depois do hero e fora da oferta/footer;
- abertura, fechamento e controle de foco do modal de oferta.

React e ReactDOM locais carregam antes de `support.js`; ScrollReveal e Swiper locais carregam depois do runtime e antes de `motions.js`. Essa ordem deixa a renderização essencial independente de CDN e mantém motion como aprimoramento opcional.
Todo movimento precisa respeitar `prefers-reduced-motion` e deixar o conteúdo visível se uma biblioteca falhar.
A arquitetura, os tipos permitidos e o procedimento de mudança estão em `docs/MOTION.md`.

### Dependências locais

`assets/vendor/` contém versões fixas das bibliotecas usadas no navegador. O HTML não busca React, ScrollReveal, Swiper ou o CSS do Swiper em rede. `support.js` conserva a URL remota somente como contingência do próprio runtime, mas não a utiliza no fluxo normal porque React e ReactDOM já estão disponíveis.

Ao atualizar uma dependência, substitua seus arquivos locais, revise `assets/vendor/README.md`, incremente o cache no HTML e execute a matriz completa de smoke tests.

### Imagens

- `brand/`: logos, ícones proprietários e identidade.
- `brands/`: logos de clientes e parceiros usados em faixas de prova social.
- `proof/`: registros de operações, cases e resultados.
- `people/`: fotos de mentor, equipe e convidados.
- Novas categorias devem ser criadas somente quando houver pelo menos dois ativos relacionados.

## Fluxo de dados

```text
Propriedades DC
      ↓
Component.renderVals()
      ↓
Template HTML
      ↓
CSS + motions.js
      ↓
Landing renderizada
```

O template visível com placeholders não é considerado uma landing renderizada. A falha ou demora de React, do runtime DC ou de uma CDN precisa terminar em conteúdo válido e utilizável, nunca apenas no desbloqueio do scroll.

## Dois níveis de leitura

A landing possui duas estruturas diferentes e complementares:

1. **Sete capítulos comerciais:** organizam as dúvidas humanas necessárias para o lead entender, confiar e comprar.
2. **Quatro decisões operacionais:** explicam o conteúdo ensinado dentro da mentoria.

O hero é o prólogo. Ele apresenta a promessa e permite explorar as quatro decisões, mas não recebe número de capítulo comercial.

### Sete capítulos comerciais

| Capítulo | Pergunta do lead | Containers | Função na conversão |
|---|---|---|---|
| 01 · Experiência | O que estou comprando? | `#experiencia` | Tornar formato, acesso e jornada pós-compra concretos. |
| 02 · Contexto e diagnóstico | Por que olhar para isso agora e por que minha operação trava? | `.context` + `.diagnosis` | Explicar a oportunidade sem urgência artificial e gerar reconhecimento do problema. |
| 03 · Outcomes e público | O que muda na prática e isso serve para o meu momento? | `.outcomes-section` + `.audience-section` | Converter conteúdo em benefício e qualificar o lead. |
| 04 · Marcas e case | Quem já vive essa operação e existe prova além da promessa? | `.brand-proof` + `#resultados` | Construir confiança com ativos e contexto reais. |
| 05 · Mentor | Quem construiu esse método? | `#mentor` | Apresentar autoridade verificável antes do mecanismo. |
| 06 · Método | Como as decisões se conectam? | `#metodo` | Mostrar como cada pergunta vira critério e decisão aplicável. |
| 07 · Entregas e FAQ | O que recebo pelo investimento e o que falta para decidir? | `#entregas` + `#faq` | Construir valor, apresentar oferta, reduzir risco e conduzir ao próximo passo. |

No HTML, o primeiro container de cada capítulo usa `data-journey-step="01..07"`. Um aprofundamento do mesmo capítulo usa `data-journey-parent` e não cria nova etapa. Desktop não pode separar, inverter ou renumerar essas relações.

### Quatro decisões operacionais

| Ordem | Decisão | Pergunta central | Saída esperada |
|---|---|---|---|
| 01 | Produto | O que vale vender primeiro? | SKU prioritário e oferta viável. |
| 02 | Creators | Quem pode distribuir com recorrência? | Seleção e rotina de creators. |
| 03 | Conteúdo | Como transformar atenção em pedidos? | Vídeos e lives com função clara. |
| 04 | Escala | O que merece mais verba? | Critérios de escala e uso do GMV Max. |

Essas decisões mantêm ordem, labels e significado no hero, diagnóstico, método e entregas. Elas não substituem capítulos como prova, autoridade, público ou FAQ, nem obrigam toda seção a possuir quatro cards.

## Ordem narrativa de conversão

```text
Prólogo: promessa + quatro decisões operacionais
    ↓
01 Experiência
    ↓
02 Contexto + diagnóstico
    ↓
03 Outcomes + público
    ↓
04 Marcas + case
    ↓
05 Mentor
    ↓
06 Método
    ↓
07 Entregas + oferta + FAQ + próximo passo
```

Público deve vir antes do case; mentor antes do método; método antes da apresentação detalhada do preço. A oferta e o FAQ pertencem ao mesmo capítulo, mas o FAQ vem depois da condição comercial.

Cada capítulo segue o contrato:

```text
Pergunta do lead → resposta curta → superfície de interação ou prova
                 → conclusão concreta → ponte para a próxima pergunta
```

Os padrões de interação permitidos são pequenos e reutilizáveis:

- **Decision deck:** sequência ordenada das quatro decisões, com controle do usuário.
- **State switch:** comparação entre dois estados, como antes/depois ou é/não é.
- **Proof story:** foto, contexto, decisão e resultado na mesma narrativa.
- **Disclosure:** detalhes de currículo e FAQ expansíveis sem perda de conteúdo.

ScrollReveal conduz a entrada dos containers. Swiper controla apenas decks que realmente dependem de arraste. Conteúdo essencial não pode depender de autoplay, de gesto oculto ou de motion para existir.

Preço e URL de checkout devem ter uma única fonte nas propriedades DC. Textos que repetem esses valores não devem ficar hardcoded em novas seções.

## Regras de manutenção

1. Mobile entre 360 e 430 px é o viewport principal de aprovação.
2. Desktop não pode alterar a ordem narrativa definida no mobile.
3. Nenhum CTA novo entra sem evento de analytics previsto no backlog.
4. Imagens devem usar nomes descritivos, minúsculos e separados por hífen.
5. Capturas de teste não ficam na raiz nem são publicadas.
6. `_ds`, `.thumbnail` e `support.js` só podem ser removidos após teste dentro da plataforma.
7. Alterações em CSS ou JS devem atualizar o parâmetro de versão no HTML.
8. Faixas automáticas precisam duplicar conteúdo apenas visualmente e ocultar a cópia com `aria-hidden`.
9. No mobile, um bloco de prova deve priorizar foto, número e contexto curto; textos longos ficam abaixo ou em seções de aprofundamento.
10. CTAs de venda usam `data-offer-open`; apenas o CTA interno do modal segue para `checkoutUrl`.
11. O loader possui encerramento normal em até 3,2 segundos e destravamento independente em 3,6 segundos; depois da primeira exibição da sessão ele deve ser mais curto.
12. Antes de entregar qualquer mudança visual, executar `node tests/motion-contract.mjs`.
13. No mobile, grupos comparáveis e sequências extensas podem usar trilhos horizontais com indicação “Deslize”, progresso, scroll snap e o próximo card parcialmente visível.
14. Apenas a oferta pode concentrar grandes números e contraste prolongado. Seções de explicação usam cards curtos e leitura em até três varreduras.
15. Toda alteração mobile precisa passar em 360, 390 e 430 px no smoke test de navegador.
16. Prova social usa somente cases, números, logos, fotos e depoimentos reais e autorizados. Não entram placeholders ou testemunhos de produtos semelhantes.
17. O produto permanece organizado em quatro blocos mentais: Produto, Creators, Conteúdo e Escala. Vídeos e lives pertencem a Conteúdo; GMV Max pertence a Escala.
18. O visual do hero demonstra apenas a promessa e a transformação. Preço, garantia e fechamento pertencem às superfícies de oferta e não devem ser duplicados nesse card.
19. O hero não recebe `data-journey-step`; a numeração comercial começa em Experiência e termina em Entregas + FAQ.
20. Subseções usam `data-journey-parent` e nunca avançam artificialmente a numeração da jornada.
21. Nenhum texto essencial pode usar truncamento permanente. `line-clamp` só é aceito quando existe expansão acessível e utilizável sem motion.
22. Sem JavaScript de motion, sem bibliotecas visuais ou em movimento reduzido, a página base permanece visível. Sem o runtime de renderização, deve existir fallback válido sem placeholders expostos.
23. A página não introduz uma nova biblioteca apenas para variar efeitos; primeiro reutiliza os quatro padrões de interação documentados.
24. Mudanças em CSS, JavaScript ou `support.js` incrementam seus parâmetros de cache no HTML e rodam o contrato estático antes do smoke test.

## Arquivo recuperável

`_archive/removed-2026-08-06/` contém previews e dependências antigas que saíram da arquitetura de produção. Pode ser apagado definitivamente depois de uma publicação validada.
