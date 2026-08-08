# Arquitetura da aplicação

Status: **HTML, CSS e JavaScript modular — fundação autorizada**.

## Decisão

A landing será uma aplicação estática progressivamente aprimorada:

- HTML semântico como fonte do conteúdo;
- CSS nativo dividido em camadas;
- JavaScript em ES Modules, apenas para comportamentos que exigem estado;
- nenhuma dependência de framework ou runtime para renderizar conteúdo e CTA;
- publicação possível em qualquer hospedagem estática.

Durante o desenvolvimento, os ES Modules são servidos por `http://127.0.0.1:4173`. `preview.cmd` é a entrada local em um clique; o carrossel de marcas possui um controlador JavaScript clássico independente para também funcionar em `file://`, enquanto os demais comportamentos continuam validados pelo servidor.

A decisão anterior de Next/Vercel foi substituída pelo pedido explícito de organizar o projeto em HTML, CSS e JavaScript. Não existirão dois runtimes ativos.

## Estrutura real

```text
public/
├── index.html
└── assets/
    ├── css/
    │   ├── main.css
    │   ├── settings/
    │   ├── generic/
    │   ├── elements/
    │   ├── objects/
    │   ├── components/
    │   └── utilities/
    ├── js/
    │   ├── main.js
    │   ├── core/
    │   └── modules/
    ├── icons/
    └── images/web/
docs/
tests/
package.json
netlify.toml
```

## HTML

`public/index.html` é a composição final e mantém a ordem de leitura. Sections não serão baixadas como fragments por JavaScript, pois isso degradaria conteúdo, SEO e fallback.

Regras:

- HTML semântico e landmarks;
- um `h1` quando o Hero for criado;
- nenhuma regra visual inline;
- nenhum handler inline como `onclick`;
- conteúdo essencial e links funcionam sem JavaScript;
- containers entram na ordem do backlog, um por vez;
- comentários marcam o ponto de entrada do próximo container, não criam sete placeholders vazios.

## CSS: camadas e responsabilidade

Ordem fixa da cascata:

```text
settings → generic → elements → objects → components → utilities
```

| Camada | Pode conter | Não pode conter |
|---|---|---|
| `settings` | tokens de cor, tipo, espaço, raio, sombra, container e motion | seletores de componentes |
| `generic` | reset e normalização | identidade visual de section |
| `elements` | `body`, headings, links, imagens, controles nativos | classes de layout |
| `objects` | container, section e padrões de fluxo reutilizáveis | cores específicas de componente |
| `components` | um arquivo por componente real aprovado | utilitários genéricos |
| `utilities` | acessibilidade e exceções atômicas raras | substituto para componentes |

`public/assets/css/main.css` apenas declara `@layer` e importa os arquivos na ordem correta.

Budgets:

- `main.css`: até 30 linhas;
- arquivo de componente: ideal até 120, limite 180 linhas;
- tokens: ideal até 160, limite 220 linhas;
- zero `!important`;
- zero classes `u-*` genéricas;
- zero CSS de um container dentro de outro;
- valor repetido vira token;
- no máximo três breakpoints globais;
- no máximo três papéis de card e dois containers.

## JavaScript

`public/assets/js/main.js` é o único entrypoint. Ele chama funções explícitas; não concentra a implementação dos módulos.

Contrato futuro de módulo:

```js
export function initFeature(root) {
  if (!root) return () => {};

  // listeners e estado local

  return () => {
    // remove listeners quando necessário
  };
}
```

Regras:

- ES Modules e escopo local;
- um módulo por comportamento real;
- módulos recebem a raiz que controlam;
- nenhum seletor percorre a página inteira sem necessidade;
- listeners são registrados uma vez;
- conteúdo não começa invisível aguardando JavaScript;
- estado visual é refletido em atributos HTML/ARIA;
- sem biblioteca de estado;
- ScrollReveal 4.0.9 local controla exclusivamente elementos com `data-motion`; sem Swiper, GSAP ou manipulação global de DOM. Autoplay fica restrito aos trilhos isolados e não compartilha o motor de entrada.

O primeiro bootstrap apenas troca o estado técnico `no-js` por `js`. Nenhum estilo poderá usar esse estado para esconder conteúdo essencial.

## Convenções de nome

- componentes: `.c-nome`;
- objetos estruturais: `.o-nome`;
- estados controlados por JavaScript: `[data-state="..."]` ou atributos ARIA;
- hooks JavaScript: `[data-js="..."]`, nunca classe visual;
- tokens: `--color-*`, `--space-*`, `--radius-*`, `--duration-*`;
- arquivos e pastas: kebab-case;
- IDs apenas para âncoras, labels e relações ARIA.

Não será criada uma classe diferente para cada combinação visual. Componentes terão uma base e poucas variantes semânticas aprovadas.

## Progressive enhancement

Ordem de construção:

1. conteúdo e ação em HTML;
2. layout legível com CSS;
3. comportamento nativo quando existir;
4. JavaScript como melhoria;
5. motion curta após validação do estado estático.

Sem JavaScript, a landing continuará legível, navegável e capaz de abrir o checkout.

## Motion

- CSS para hover, focus, press e transições simples;
- pilha CSS Grid com cards reais após a melhoria JavaScript; fluxo vertical completo sem JavaScript;
- biblioteca só entra por ADR;
- apenas `transform` e `opacity` quando possível;
- nenhum conteúdo essencial começa com `opacity: 0`;
- deslocamento máximo de 24 px;
- durações de 160, 240 ou 360 ms;
- reduced motion elimina deslocamentos contínuos não aprovados e reduz as entradas de seção a no máximo 12 px por 480 ms;
- entradas de section usam uma única instância local de ScrollReveal, inicializada por script clássico após `load` para preservar a geometria final e funcionar em `file://`; executam uma vez e mantêm opacidade inicial legível; sem biblioteca ou sem JavaScript, o conteúdo permanece estático;
- drag sempre possui alternativa por botão.
- movimento contínuo usa JavaScript nativo: os dois trilhos usam Web Animations API. O fotográfico permanece a 22 px/s com pausa explícita; o de marcas inicia automaticamente a 56 px/s, sem botão, e usa dois grupos idênticos no HTML. Ambos medem a largura real e preservam o progresso no resize. Por escolha explícita registrada no `ADR-018`, o trilho de marcas continua em reduced motion; com JavaScript desativado, volta à navegação horizontal manual.
- a faixa promocional fica abaixo da navegação e usa um controlador clássico isolado com Web Animations API a 72 px/s. Dois grupos idênticos formam o loop; a duplicata é `aria-hidden`, o fallback sem JavaScript permanece horizontal e, por decisão explícita no `ADR-019`, o movimento continua em reduced motion.

## Qualidade

- validação de HTML e links;
- lint/formatador serão escolhidos somente quando houver ferramenta de build aprovada;
- testes de comportamento por módulo;
- smoke test com JavaScript desativado;
- revisão em 320, 360, 390, 430 e 1440 px;
- teclado, zoom 200%, contraste e reduced motion;
- nenhum asset candidato migra para `assets/images/` sem aprovação.
