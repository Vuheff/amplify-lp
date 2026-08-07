# Leitura das referências visuais

Status: **análise de padrões; nenhuma interface será copiada**.

## Amplify Marcas

Arquivos: `references/visual/amplify-marcas/`.

### O que ensina

- marca e CTA aparecem cedo;
- contraste alto e blocos visuais deixam a leitura escaneável;
- o case usa imagens operacionais, métricas e contexto, em vez de um depoimento genérico;
- números relacionados ficam próximos do material que pretende comprová-los.

### O que não migra automaticamente

- promessa de “máquina de vendas” é mais agressiva que a proposta educacional atual;
- métricas antes da definição do produto podem atrair pela renda e criar expectativa errada;
- a página vende aplicação/serviço para marcas, não necessariamente o mesmo produto;
- rosa, ciano, script e estética promocional não pertencem ao sistema visual proposto;
- volume de métricas não substitui fonte, período, papel da Amplify e autorização.

Uso permitido: referência para anatomia de case e força de hierarquia. Não é referência de copy, paleta ou arquitetura narrativa.

## Faixa editorial de marcas

Arquivo: `references/visual/brand-rail/section-reference.png`.

### O que migra

- eyebrow curto e centralizado identifica o papel da seção;
- headline editorial, respiro amplo e trilho no limite inferior criam uma leitura única;
- cards claros, arredondados e parcialmente cortados nas bordas tornam a continuidade perceptível sem instrução longa;
- movimento contínuo permanece discreto, sem pausa por interação, e respeita `prefers-reduced-motion`.

### O que não migra automaticamente

- a captura não substitui os arquivos reais dos logos;
- repetição visual não duplica conteúdo para tecnologias assistivas;
- nenhuma marca comprova relação comercial sem o registro pendente em `BUS-003`;
- a faixa vive em Prova de operação e não cria uma section independente.

## Dixie

Arquivos: `references/visual/dixie/`.

### O que ensina

- contraste editorial entre sans e serif cria ritmo sem depender de muitos cards;
- whitespace e fundo discreto podem dar hierarquia a uma composição simples;
- previews visuais tornam um serviço abstrato mais concreto.

### O que não migra automaticamente

- o conteúdo observado aparece cortado horizontalmente no mobile, um risco incompatível com a landing;
- portfolio em mosaico serve a uma agência visual, não explica um produto educacional;
- menu e decoração competem com a ação principal;
- tipografia decorativa não pode reduzir clareza da promessa.

Uso permitido: referência para ritmo editorial e concretude visual. Não é referência de grid mobile nem componente interativo.

## Hero — deck de perguntas

Arquivo: `references/Hero/capture-320-hero-question-deck.png`.

### O que migra para o Hero

- um card ativo em primeiro plano e dois cards reais em segundo plano antecipam que há conteúdo seguinte;
- contador, pontos de progresso, botões e instrução de arraste tornam o gesto descobrível;
- pergunta e saída prática vivem no mesmo card, reforçando causa e consequência;
- a superfície escura enquadra o diagnóstico sem transformar toda a landing em tema escuro.
- o componente deve ser gerado em HTML/CSS; a captura não entra na página como imagem.

### O que não migra automaticamente

- copy, preço fixo e CTA da captura não pertencem à oferta aprovada;
- a proporção vertical do card é preservada; em telas muito curtas, sua continuação ocorre no scroll em vez de achatar o conteúdo;
- o padrão de cards fica restrito ao mapa; não será repetido em todos os containers.

### Pesquisa de interação aplicada

- [Motion — Drag](https://motion.dev/docs/react-drag): eixo travado, elevação durante o gesto, elasticidade e decisão por distância/velocidade.
- [Motion — Card Stack](https://motion.dev/examples/react-card-stack): somente o card superior responde ao gesto enquanto a pilha preserva profundidade.
- [Playing Cards Hover Effect](https://github.com/constgenius/PlayingCardsHoverEffect): pilha compacta que se abre em leque usando o centro inferior como pivô; aplicado aqui como referência de comportamento, não como cópia visual.
- [Card Stack Manager](https://dribbble.com/shots/12202960-Interaction-27-The-Card-Stack-Manager): referência de fisicalidade e foco em uma unidade de informação por vez.
- [MDN — Pointer capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture): continuidade do gesto fora dos limites do card.
- [MDN — touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action): drag horizontal sem bloquear scroll vertical e zoom.

A implementação usa Pointer Events e CSS Grid nativos. Os próprios cards formam a pilha; ela abre no hover/foco em dispositivos compatíveis e durante o arraste no touch. Motion, GSAP Draggable e Embla foram estudados, mas não adicionados porque a interação possui apenas quatro estados e não justifica uma dependência neste gate.

## Critério para qualquer nova referência

Toda referência futura será registrada com:

1. problema que ela resolve;
2. padrão transferível;
3. contexto diferente do nosso;
4. risco de cópia indevida;
5. hipótese que precisará de validação.
