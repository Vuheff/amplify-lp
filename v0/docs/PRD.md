# PRD v1 — Landing Webinar TikTok Shop (Amplify)

Status: **rascunho**. Fecha parcialmente `PRD-001`. Bloqueado para virar `Concluído`
enquanto `BUS-002` (oferta) e `BUS-003` (registro de claims) seguirem `Pendente`.

Este documento existe para dar contexto consistente a qualquer prompt de container
individual (protocolo de sete blocos, `WORKFLOW.md`). **Não deve ser usado para gerar
a página inteira de uma vez** — isso é um não-objetivo explícito (`DIRECTION.md`).
A execução continua container por container, na ordem do `BACKLOG.md`, com aprovação
antes de cada avanço.

## Relação entre Hero e Método

O usuário aprovou manter o deck completo no Hero como demonstração visual. O Método,
agora `CNT-003`, não repetirá os cards: aprofundará contexto, critérios, aplicação e
próxima ação das quatro decisões. A faixa fotográfica é uma transição de autoridade,
não um container adicional. Essa escolha está consolidada no `ADR-014`.

## 0. Bloco global — vale para todo prompt de container

**Contexto de produto**: Amplify vende clareza para decidir e estruturar a entrada no
TikTok Shop; não vende promessa de faturamento. Público: donos/gestores de e-commerce
com catálogo próprio, avaliando ou começando sem processo claro no TikTok Shop.
Promessa-base: organizar a entrada em quatro decisões — Produto, Creators, Conteúdo,
Escala — antes de comprometer estoque, equipe e mídia.

**North star**: compras únicas por sessão mobile elegível (`begin_checkout` como proxy
enquanto compra não for observável). Critério qualitativo: 4 de 5 pessoas do público
explicam corretamente produto, público e ganho só com o Hero.

**Restrições globais**:
- uma cor de marca dominante (`--color-brand` #1E4DD1) + cores semânticas; superfície
  escura (`--color-ink`) só onde já aprovada (painel do deck do Hero, ADR-008), não se
  propaga à página inteira;
- no máximo dois "containers visuais" (papel claro/editorial e papel escuro/produto) e
  três papéis de card;
- HTML semântico primeiro, CSS em cascade layers, JS ES Modules — zero framework de
  runtime e zero lib de motion; o loop fotográfico nativo do `ADR-014` é a única
  exceção de autoplay e exige pausa/reduced motion;
- arquivo de componente até 180 linhas; `main.css` até 30 linhas; zero `!important`;
  valor repetido vira token;
- progressive enhancement: conteúdo, leitura e CTA funcionam sem JavaScript;
- não duplicar preço, acesso, garantia, prova ou URL de checkout entre containers;
- não inventar copy comercial, preço, garantia, suporte, credencial, claim ou prova;
- não usar urgência, escassez, marcas ou resultados sem evidência e autorização;
- não esconder preço, condição ou restrição em modal/accordion;
- inspiração de UI mobile (ex.: fullsalessystem.com/playbook) vale para mecânica —
  confiança tipográfica, swipe físico, painel-como-tela-de-produto — nunca para tom,
  cor de urgência (vermelho, selos "grátis"/"agora") ou promessa de faturamento.

**Estados obrigatórios por container**: 320, 360, 390, 430 e 1440 px; teclado; zoom
200%; `prefers-reduced-motion`; JavaScript desligado (fallback legível); conteúdo
longo; ausência de asset opcional.

## 1–7. Containers

Pergunta e responsabilidade de cada container são aprovadas (`CON-001`). Resposta,
evidência e aceite detalhados só existem hoje para o Hero — os demais dependem das
verdades comerciais listadas em `BUS-001/002/003` e `KPI-001`, ainda pendentes.

| # | ID | Pergunta | Container | Status de conteúdo |
|---:|---|---|---|---|
| 01 | CNT-001 | Por que vale continuar? | Hero: produto, público, promessa, formato e CTA | Em validação — ver bloco dedicado abaixo |
| 02 | CNT-002 | O que é e como acontece? | Experiência: modalidade, duração, acesso, materiais, suporte e pós-compra | Parcialmente desbloqueado; suporte e pós-compra pendentes |
| 03 | CNT-003 | Como o método tira minha operação da dúvida? | Mapa aprofundado das quatro decisões (Produto, Creators, Conteúdo, Escala) | Conteúdo-base aprovado; não deve repetir o teaser do Hero |
| 04 | CNT-004 | O que custa entrar sem critério e isso serve para minha marca? | Dor/fit: riscos plausíveis, benefícios, pré-requisitos e desqualificação honesta | Bloqueado — pré-requisitos dependem de `BUS-001` |
| 05 | CNT-005 | Por que acreditar? | Case contextualizado, fonte, papel da Amplify e autoridade | Parcialmente desbloqueado; uso autorizado, fonte e owner pendentes |
| 06 | CNT-006 | O que recebo e vale o compromisso? | Entregas, preço, condições, garantia e CTA | Parcialmente desbloqueado; checkout, parcelamento e reembolso operacional pendentes |
| 07 | CNT-007 | O que ainda me impede de agir? | FAQ real, recapitulação e CTA final | Bloqueado — depende do conteúdo de 02, 05 e 06 já existir |

Nenhuma section independente para logos, mentor, "benefícios" ou currículo — esses
argumentos vivem dentro do container cuja pergunta ajudam a responder.

### 01 · Hero (CNT-001) — bloco completo

```text
Contexto: primeiro container da jornada; dados de DIRECTION.md, ADR-009 (pilha real)
e ADR-013 (autoridade com acervo fotográfico).

Pergunta: Por que vale continuar?

Resposta: em até 10s no mobile, o lead entende que a nova era das vendas no Brasil
começa no feed e que existe um método de quatro decisões para entrar no TikTok Shop
com critério — sem promessa de faturamento.

Evidência: nome do produto, linguagem oficial “Compra por Descoberta” e acervo
fotográfico autorizado. Modalidade, 4 blocos, 29 temas, acesso e garantia saem do
primeiro olhar e permanecem registrados para Produto/experiência e Oferta.

Restrições: ver bloco global; o Hero usa fundo noturno e quatro cards fotográficos
reais sem redesign. O mapa detalhado permanece no container 03 e os 29 temas na Oferta.

Estados: ver bloco global.

Aceite: headline e CTA aparecem antes; deck mantém a pilha e recebe arraste agrupado
por frame, velocidade suavizada e encaixe contínuo; faixa usa 8 WebPs, loop pausável,
duplicata inacessível e fallback estático; controles têm no mínimo 44px; `check:js` e
`check:hero` passam; aprovação visual do usuário.
```

### 02–07 · demais containers

Para cada um, o prompt de sete blocos só pode ser escrito quando a verdade comercial
correspondente sair de `Pendente`. Usar o bloco global acima + a linha da tabela +
a verdade comercial aprovada no momento como "Evidência". Não preencher "Resposta"
com suposição.

## Ordem de execução

Mantém o gate do `BACKLOG.md`: um container por vez, aprovação antes do próximo.
Próximo passo após o Hero: concluir suporte/pós-compra em `BUS-001` e executar
`CNT-002`; depois seguir `CNT-003` → `CNT-004` → `CNT-005` → `CNT-006` → `CNT-007`.
