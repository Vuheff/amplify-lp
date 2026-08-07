# Fundação de marca e design system

Status: **direção v0.1 proposta; precisa de aprovação da marca antes da UI**.

Este documento transforma as cinco frentes solicitadas — identidade, visual, layout, componentes e acessibilidade — em contratos verificáveis. Não é uma tela nem um CSS pronto.

## 1. Brand identity

### Missão central

Dar a donos e gestores de e-commerce clareza operacional para avaliar e estruturar sua entrada no TikTok Shop antes de comprometer estoque, equipe e mídia.

### Papel da marca

`Especialista que organiza a decisão`, não guru que promete atalho.

### Voz

| A voz é | A voz não é |
|---|---|
| Direta e específica | Hiperbólica |
| Didática sem infantilizar | Repleta de jargão |
| Confiante porque mostra critérios | Certeza sem evidência |
| Pragmática e operacional | Motivacional genérica |
| Transparente sobre limites | Agressiva ou alarmista |

Regras de copy:

- verbo concreto e sujeito explícito;
- uma ideia principal por frase;
- usar sempre o mesmo nome para o produto;
- explicar siglas na primeira ocorrência;
- trocar promessa financeira por capacidade adquirida;
- urgência somente quando houver evento, data ou condição verificável;
- evitar “segredo”, “fórmula”, “garantido”, “explodir vendas” e “última chance” sem sustentação factual.

## 2. Visual style

### Evidência disponível

O único master de marca encontrado é um PNG quadrado de 512 × 512 px. A amostra do fundo retorna **`#1E4DD1`** e o símbolo é branco. Não foi encontrado wordmark, SVG nem manual oficial; por isso, as regras abaixo são candidatas.

### Paleta semântica candidata

| Papel | Token | Valor | Uso |
|---|---|---:|---|
| Marca | `brand` | `#1E4DD1` | CTA primário, links e destaque. |
| Marca forte | `brand-strong` | `#173FAF` | Press/hover e superfícies de marca. |
| Texto principal | `ink` | `#10131A` | Títulos e corpo. |
| Texto secundário | `muted` | `#5B6472` | Apoio; nunca informação crítica em tamanho reduzido. |
| Fundo | `canvas` | `#F7F8FB` | Página. |
| Superfície | `surface` | `#FFFFFF` | Cards e oferta. |
| Divisor | `line` | `#DDE2EA` | Bordas não essenciais. |
| Sucesso | `success` | `#177A53` | Confirmação, nunca como único sinal. |
| Perigo | `danger` | `#B42318` | Erro, nunca como único sinal. |

Contrastes calculados sobre branco: `brand` 6,91:1; `ink` 18,58:1; `muted` 5,98:1; `success` 5,32:1; `danger` 6,57:1. A aprovação final ainda exige teste nos pares e estados realmente usados.

Não criar “azuis alternativos” por section. Gradiente só entra se tiver papel de marca documentado; não é necessário na primeira versão.

### Tipografia candidata

- Família única: **Geist Sans**, carregada por `next/font`.
- Fallback: `Arial, sans-serif`.
- Pesos: 400, 500, 600 e 700; nenhum peso sintético.
- Display mobile: 40/44.
- Heading de section: 32/36.
- Heading de card: 22/28.
- Corpo principal: 17/27.
- Corpo secundário: 15/23.
- Label: 13/18, peso 600; não usar em parágrafos.
- Comprimento de leitura: 45–65 caracteres por linha.

Uma família variável reduz custo e evita que cada section invente uma personalidade tipográfica. A implementação futura seguirá a otimização de fontes do [Next.js](https://nextjs.org/docs/app/api-reference/components/font).

### Regras candidatas do logo

- usar o master sem esticar, inclinar, contornar, aplicar sombra ou mudar proporções;
- não reconstruir um wordmark digitando “Amplify”; nenhum arquivo oficial foi encontrado;
- respiro mínimo ao redor: 25% da largura renderizada do master;
- tamanho mínimo digital: 32 × 32 px; no header, alvo de 40–48 px;
- o PNG opaco só pode aparecer como tile azul; não tentar remover o fundo via CSS;
- obter SVG e versão transparente oficiais antes da produção;
- sem motion no logo;
- logo decorativo ao lado do nome recebe `alt=""`; logo que sozinho identifica o link recebe `alt="Amplify"`.

## 3. Layout e grids

### Escala

Base de 4 px: `4, 8, 12, 16, 24, 32, 48, 64, 96`.

### Grid

| Faixa | Colunas | Gutter | Gap | Comportamento |
|---|---:|---:|---:|---|
| 320–639 | 4 | 16 px | 12 px | Fluxo único; cards ocupam largura útil. |
| 640–1023 | 8 | 24 px | 16 px | Composição intermediária baseada no container. |
| ≥1024 | 12 | 32 px | 24 px | Expansão da mesma narrativa, sem uma segunda landing. |

Containers permitidos:

- `reading`: máximo 704 px para copy e FAQ;
- `wide`: máximo 1184 px para hero, método e prova.

Ritmo de section: 64 px vertical no mobile e 96 px no desktop. Exceções exigem justificativa visual, não um novo token.

Raios permitidos: 12 px para controles, 20 px para cards, 28 px para feature/offer. Sombras permitidas: `raised`, `floating` e nenhuma.

## 4. Componentes

Primitivas só serão criadas quando houver uso real:

| Primitiva | Responsabilidade | Regra |
|---|---|---|
| `Container` | Aplicar gutter e largura `reading`/`wide`. | Duas larguras, sem valores por section. |
| `Section` | Semântica, ritmo e tema. | Não recebe flags visuais combinatórias. |
| `SectionIntro` | Pergunta, título e resposta curta. | Ordem de headings validada. |
| `ConversionCta` | Link ou botão primário/secundário. | Link para navegação; botão para ação local. |
| `DecisionDeck` | Quatro decisões e controles alternativos ao drag. | Conteúdo completo sem JS. |
| `EvidenceCard` | Contexto, ação, resultado, limite e fonte. | Nunca apenas métrica solta. |
| `OfferPanel` | Entregas, preço, garantia, restrições e CTA. | Dados comerciais vêm de uma fonte tipada. |
| `Disclosure` | FAQ secundária. | Preferir `details/summary`; condição essencial fica fora. |

Máximo inicial de três papéis de card: `decision`, `evidence` e `offer`.

Formulários e menus não serão criados por antecipação. Se captura de lead entrar no escopo, campos terão label persistente, ajuda, erro associado e autocomplete. Se navegação de página for necessária, começa como links nativos; menu colapsável só entra quando houver itens suficientes para justificar o estado interativo.

## 5. Acessibilidade

Meta: WCAG 2.2 nível AA, com revisão automática e manual. Contrato mínimo:

- `main`, sections e headings em ordem; um `h1`;
- skip link e foco sempre visível;
- 44 × 44 px como meta interna para controles;
- texto e informação não dependem só de cor;
- drag possui botões anterior/próximo;
- teclado acessa CTA, deck e FAQ;
- zoom de 200% sem perda ou corte;
- imagens têm dimensões e `alt` contextual;
- conteúdo essencial existe sem JavaScript;
- `prefers-reduced-motion` remove deslocamentos não essenciais;
- nenhuma animação contínua ou autoplay;
- sticky UI não cobre foco nem conteúdo;
- labels persistentes em qualquer formulário futuro.

A WCAG 2.2 inclui alternativa para movimentos de arraste e critérios de tamanho de alvo; o padrão interno de 44 px é deliberadamente maior que o mínimo AA de 24 px. Fontes: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) e [novidades da WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/).

## Decisões que ainda precisam de validação humana

1. missão e voz representam a Amplify;
2. `#1E4DD1` é oficialmente a cor principal ou apenas a cor deste arquivo;
3. Geist é aceitável como fonte digital;
4. existe SVG, wordmark e manual de marca oficiais;
5. imagens, logos e cases candidatos têm autorização de uso.
