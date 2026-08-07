# Metodologia de execução

## Regra central

> Uma pergunta, um container, uma hipótese, um critério verificável e uma aprovação.

O v0 não receberá “crie/melhore a landing inteira”. O fluxo oficial recomenda requisitos claros, geração incremental e validação de completude, viabilidade, consistência, clareza e testabilidade. Fonte: [v0 — PRD design](https://v0.dev/docs/prd-design).

## Gates

### R0 · Estudar antes de escolher

Saída: pesquisa, arquitetura narrativa, psicologia ética, marca candidata e stack.

Proibido: scaffold, tela final e motion.

### G0 · Verdade antes da interface

Saída: produto, oferta, claims, KPI e PRD aprovados.

Proibido: preencher lacuna comercial com copy inventada.

### G1 · Fundação antes do primeiro container

Saída: app, tokens, conteúdo tipado, primitivas e testes básicos.

Proibido: copiar código ou CSS do legado.

### G2 · Um container por vez

Saída de cada item: pergunta compreendida, versão mobile validada, estados acessíveis e aprovação do usuário.

Proibido: começar o seguinte enquanto o atual estiver em execução/validação.

### G3/G4 · Integrar e publicar

Saída: jornada coerente, checkout, analytics, acessibilidade, performance, SEO e rollback.

## Ciclo obrigatório de um container

1. Escrever pergunta e resposta em texto puro.
2. Definir evidência, risco psicológico e métrica.
3. Criar wireframe sem decoração.
4. Implementar HTML estático e conteúdo tipado.
5. Validar 320, 360, 390, 430 e 1440 px.
6. Aplicar tokens/primitivas já aprovados.
7. Adicionar interação ou motion somente se ela melhorar orientação, estado ou feedback.
8. Testar teclado, zoom, reduced motion e fallback.
9. Gerar preview e obter aprovação.
10. Atualizar backlog antes de liberar o próximo container.

WIP: um container em implementação; nenhum em paralelo.

## Definition of Ready

Um container só entra em `Pronto` quando possui:

- pergunta exclusiva;
- resposta curta e copy aprovada/provisória explicitamente marcada;
- dados e claims com status;
- referência/evidência;
- risco de interpretação incorreta;
- estados mobile, desktop, teclado, sem JS e reduced motion;
- hipótese de interação, inclusive `nenhuma`;
- critério de aceite observável;
- dependências e arquivos esperados.

## Definition of Done

Um container só fica `Concluído` quando:

- responde à pergunta sem ajuda;
- preserva uma ação primária;
- respeita budgets de arquivo/CSS/JS;
- mantém HTML semântico e headings corretos;
- passa a matriz de viewports;
- funciona com teclado e zoom;
- não depende de motion para existir;
- não repete dado comercial;
- possui teste proporcional ao risco;
- possui preview revisado;
- foi aprovado antes do início do próximo.

## Protocolo de prompt para v0

Todo pedido usa sete blocos:

```text
Contexto: posição na jornada e origem dos dados.
Pergunta: dúvida humana exclusiva.
Resposta: conclusão que o lead precisa formar.
Evidência: conteúdo/claim aprovado e seus limites.
Restrições: tokens, componentes, acessibilidade e budgets.
Estados: mobile, desktop, sem JS e reduced motion.
Aceite: comportamento e compreensão verificáveis.
```

Prompts rejeitados:

- “melhore tudo”;
- “deixe moderno” sem critério;
- “crie mais camadas” sem função;
- “use várias animações”;
- “faça uma landing que converta” sem produto/medição;
- regenerar arquivos fora do ticket.

## Revisão

- A pergunta é única?
- O lead entende sem executar gesto?
- O CTA descreve corretamente o destino?
- O claim possui fonte e aprovação?
- A interação resolve orientação, estado ou feedback?
- A alternativa sem JS preserva a decisão?
- O componente usa dados tipados?
- Há dependência ou abstração especulativa?
- Algum arquivo excedeu budget?
- O teste mede compreensão ou apenas clique?

Mudança de stack, deploy, motion, conteúdo, checkout ou analytics exige ADR: `contexto → decisão → alternativas → consequências → data`.
