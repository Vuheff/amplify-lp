# Landing Amplify — v0

Status: **Protótipo integrado de conversão em validação**.

Esta pasta é a nova fonte de verdade da landing. Ela começa com decisões explícitas para que conteúdo, conversão, design e engenharia não voltem a ser resolvidos por acúmulo de CSS ou JavaScript.

## Objetivo

Transformar curiosidade em uma decisão de compra consciente: o visitante entende o produto, reconhece se ele serve para sua marca, confia na proposta e sabe exatamente o que acontece ao comprar.

> Uma página, uma promessa, um produto e uma ação principal.

## Prévia local

Abra `preview.cmd` para iniciar o servidor e carregar a landing automaticamente em `http://127.0.0.1:4173`. A janela permanece aberta enquanto a prévia estiver ativa; use `Ctrl+C` para encerrar.

No terminal, os comandos equivalentes são:

```text
npm run preview:open
npm run preview
```

Abrir `index.html` diretamente por `file://` mantém o conteúdo e executa o controlador JavaScript independente do trilho de marcas; os demais ES Modules continuam fora do modo oficial de prévia e podem ser bloqueados pelo navegador.

## Estado do trabalho

- a fundação estática continua modular em HTML, CSS e JavaScript;
- a próxima arquitetura narrativa segue `Oportunidade → Produto/experiência → Método → Dor/fit → Prova → Oferta/risco → Objeções/CTA final`;
- o Hero aprovado como candidato usa o posicionamento “A nova era das vendas no Brasil começa no feed”, preserva a pilha fotográfica e reduz a copy concorrente;
- uma faixa promocional inclinada abaixo da navegação identifica o webinar e apresenta a condição confirmada de R$ 1.632 por R$ 97 em carrossel JavaScript contínuo, sem prazo ou escassez inventados;
- uma faixa com 8 registros reais da Amplify cria continuidade visual abaixo do Hero; o loop em JavaScript nativo possui pausa, fallback estático e reduced motion;
- a prova de operação começa com 9 logos autorizados em um carrossel JavaScript infinito e acessível; a relação exata de cada marca ainda bloqueia a publicação do claim;
- a implementação anterior permanece congelada em [`../_legacy/`](../_legacy/);
- preço promocional, acesso e prazo de garantia foram confirmados; checkout, reembolso operacional e suporte continuam pendentes;
- as fotos do acervo Amplify foram autorizadas para os criativos e receberam versões web leves em `assets/images/web/`;
- as imagens específicas do case e os logos foram autorizados pelo usuário e permanecem em `research/assets-candidates/` até a etapa de produção;
- nenhum CTA abre Notion ou destino externo; a landing permanece autocontida até a etapa futura de checkout.

## Documentos de decisão

1. [Direcionamento](docs/DIRECTION.md) — produto, público e as sete perguntas.
2. [Backlog](docs/BACKLOG.md) — estudo, gates e fila container por container.
3. [Arquitetura](docs/ARCHITECTURE.md) — stack proposta, fronteiras e budgets.
4. [Metodologia](docs/WORKFLOW.md) — aprovação, Definition of Ready e Done.
5. [Decisões](docs/DECISIONS.md) — ADRs aceitos e pendentes.

## Estudos

1. [Landing e produto educacional](research/LANDING-WEBINAR.md).
2. [Psicologia comportamental ética](research/BEHAVIORAL-DESIGN.md).
3. [Psicologia aplicada ao design](research/DESIGN-PSYCHOLOGY.md).
4. [Fundação de marca e design system](research/BRAND-DESIGN-SYSTEM.md).
5. [Stack e módulos](research/STACK-MODULES.md).
6. [Mapa de fontes](research/REFERENCE-MAP.md).
7. [Leitura das referências visuais](research/VISUAL-REFERENCES.md).

## Gate atual

Validar a narrativa e o sistema visual do protótipo. A publicação comercial continua bloqueada por oferta, autorização de prova, depoimentos verificáveis e URL definitiva de checkout.
