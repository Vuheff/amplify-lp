# Backlog da v0

Fonte de verdade da execução. Um item muda de status somente com evidência do critério de aceite.

Status: `Pendente`, `Pronto`, `Em andamento`, `Em validação`, `Concluído`, `Bloqueado`.

WIP: **um container em execução; nenhum container posterior começa antes da aprovação do anterior**.

> Exceção de integração — 2026-08-07: o usuário definiu uma referência como estrutura real da jornada. O protótipo cobre Hero, Método/Timeline, Números, Comparação, Prova, Inscrição e CTA final. Preço, acesso, garantia, fotos e marcas foram confirmados depois; checkout, operação do reembolso e owner dos claims continuam pendentes em G0.

> Direção do topo — 2026-08-07: trabalhar somente `CNT-001`; manter os quatro cards sem redesign, reduzir a copy inicial e substituir a faixa textual repetitiva por 8 registros Amplify. A sequência futura aprovada é Oportunidade → Produto/experiência → Método → Dor/fit → Prova → Oferta/risco → Objeções/CTA final.

> Correção de motion — 2026-08-07: manter `CNT-001` em validação, substituir o keyframe da faixa por Web Animations API a 22 px/s e oficializar a prévia local por servidor. `file://` preserva somente o fallback estático.

> Sinal de oferta — 2026-08-07: por solicitação do usuário, `CNT-001` recebe uma faixa promocional inclinada imediatamente abaixo da navegação. Ela usa somente produto, preço, acesso e estrutura confirmados em um loop JavaScript contínuo, sem inventar prazo, vagas ou contagem regressiva.

> Prova por repertório — 2026-08-07: por solicitação do usuário, `CNT-005` começa com a composição editorial e o carrossel infinito da referência fornecida. Nove logos autorizados entram no protótipo; a relação exata de cada marca continua bloqueada em `BUS-003` antes da publicação.

## Gate R0 — pesquisa e direção, sem UI

| ID | P | Status | Entrega | Critério de aceite |
|---|---:|---|---|---|
| ORG-001 | P0 | Concluído | Isolar legado e organizar a raiz | Nova fonte de verdade em `v0/`; legado recuperável em `_legacy/`; materiais classificados. |
| RES-001 | P0 | Concluído | Preservar e analisar briefing | Texto original armazenado sem edição e lacunas identificadas. |
| RES-002 | P0 | Concluído | Estudar landing/webinar | Sequência, responsabilidades, riscos e métricas documentados com fontes. |
| RES-003 | P0 | Concluído | Estudar psicologia ética | Cada princípio possui aplicação, limite, risco e forma de avaliação. |
| RES-004 | P0 | Concluído | Estudar stack e módulos | Framework, bibliotecas, alternativas nativas e gates registrados. |
| RES-005 | P0 | Concluído | Estudar psicologia aplicada ao design | Percepção, atenção, memória, escolha, estética, cor, prova e motion traduzidos em regras testáveis. |
| ARC-001 | P0 | Concluído | Definir runtime ativo | HTML, CSS e JavaScript modulares adotados; Next e DC permanecem apenas como decisões históricas/legado. |
| SKL-001 | P1 | Concluído | Preparar skills Vercel | React, composição e web design instalados para uso a partir da próxima sessão. |
| GOV-001 | P0 | Concluído | Registrar Instructions | `v0/AGENTS.md` impede scaffold precoce, importação do legado e trabalho em múltiplos containers. |
| CON-001 | P0 | Concluído | Aprovar sete perguntas | Exatamente sete containers; cada um tem uma responsabilidade exclusiva. |
| BRD-001 | P0 | Concluído | Aprovar identidade | Missão, papel e voz representam a Amplify. |
| VIS-001 | P0 | Concluído | Aprovar direção visual | Cor, fonte e regras provisórias de logo aceitas como base evolutiva. |

R0 foi concluído com a aprovação de `CON-001`, `BRD-001` e `VIS-001`.

## Gate G0 — verdade comercial, sem UI

| ID | P | Status | Responsável | Entrega | Critério de aceite |
|---|---:|---|---|---|---|
| BUS-001 | P0 | Em andamento | Negócio | Produto canônico | Aula única gravada, 4 blocos, 29 temas e 12 meses confirmados; suporte e pós-compra seguem pendentes. |
| BUS-002 | P0 | Em andamento | Negócio | Oferta canônica | De R$ 1.632 por R$ 97 e garantia de 7 dias confirmados; parcelamento, reembolso operacional e checkout seguem pendentes. |
| BUS-003 | P0 | Em andamento | Negócio/Jurídico | Registro de claims | Fotos UGC, logos e case foram autorizados pelo usuário; fonte, relação exata, owner e revisão precisam ser registrados antes da publicação. |
| KPI-001 | P0 | Pendente | Growth | Plano de mensuração | Compra ou proxy, eventos, consentimento, guardrails e linha de base documentados. |
| PRD-001 | P0 | Em andamento | Produto | PRD v1 | `docs/PRD.md` reúne direção, restrições e critérios; falta fechar `BUS-002`/`BUS-003` e resolver a sobreposição Hero×Método antes de `Concluído`. |

## Gate G1 — fundação técnica

A estrutura técnica pode ser preparada sem copy. Containers com conteúdo comercial continuam bloqueados pelas verdades correspondentes de G0.

| ID | P | Status | Entrega | Critério de aceite |
|---|---:|---|---|---|
| FND-001 | P0 | Concluído | Scaffold limpo | HTML, CSS e JS modulares iniciam sem importar código do legado. |
| FND-002 | P0 | Pendente | Fonte única de conteúdo | Produto, oferta, decisões, provas e CTAs não se repetem no HTML/JS. |
| FND-003 | P0 | Concluído | Tokens aprovados | Cor, tipo, espaço, grid, raios, sombra, container e motion são semânticos. |
| FND-004 | P0 | Concluído | Primitivas estruturais | Objetos de `container`, `section` e `flow` cobrem a estrutura sem CSS de section. |
| FND-005 | P0 | Em validação | Qualidade | `check:js` e `check:hero` validam sintaxe, viewports e comportamento; validação HTML/CSS formal ainda será adicionada. |
| FND-006 | P0 | Em validação | Progressive enhancement | Smoke test sem JS preserva conteúdo e quatro decisões; enquanto o checkout está fora de escopo, nenhum CTA abre Notion ou destino externo. |

## Gate G2 — containers, em sequência

Cada item passa pelo ciclo: texto puro → wireframe → estático responsivo → acessibilidade → motion/interação justificada → aprovação. Se não houver ganho funcional, a etapa de motion termina com a decisão `não usar`.

| Ordem | ID | Status | Pergunta | Critério de saída |
|---:|---|---|---|---|
| 01 | CNT-001 | Em validação | Por que vale continuar? | Faixa promocional em loop fica abaixo da navegação e identifica produto e condição atual; Hero noturno centraliza a leitura mobile, apresenta o resultado educacional, mantém a pilha real e conecta 8 registros Amplify; foco, teclado, fallback sem JS e estados de motion validados; ainda depende de aprovação visual. |
| 02 | CNT-002 | Pendente | O que é e como acontece? | Participante explica modalidade, duração, acesso, suporte e pós-compra sem inferir algo inexistente. |
| 03 | CNT-003 | Pendente | Como o método tira minha operação da dúvida? | As quatro decisões são recordadas sem repetir literalmente o teaser do Hero; interação e fallback preservam o conteúdo. |
| 04 | CNT-004 | Pendente | O que custa entrar sem critério e isso serve para minha marca? | Visitante reconhece riscos plausíveis, ganhos, pré-requisitos e não-fit sem medo artificial. |
| 05 | CNT-005 | Em validação | Por que acreditar? | Repertório visual com 9 marcas e case contextualizado aparecem no mesmo container; trilho roda continuamente sem botão, preserva fallback manual e reduced motion; relação/fonte de cada marca segue pendente antes da publicação. |
| 06 | CNT-006 | Pendente | O que recebo e vale o compromisso? | Entregas, preço, condição, garantia, restrições e CTA são encontrados sem conteúdo oculto. |
| 07 | CNT-007 | Pendente | O que ainda me impede de agir? | Dúvidas reais são respondidas com disclosure acessível e sem nova promessa. |

Matriz mínima por container: 320, 360, 390, 430 e 1440 px; teclado; zoom 200%; reduced motion; conteúdo longo; JS desligado quando aplicável.

## Gate G3 — integração da jornada

| ID | P | Status | Entrega | Critério de aceite |
|---|---:|---|---|---|
| JRN-001 | P0 | Em validação | Narrativa completa | Transições entre perguntas não repetem argumento nem criam salto lógico. |
| JRN-002 | P0 | Em validação | Consistência visual | Grid, tipo, cor, cards e CTA seguem o mesmo sistema em toda a página. |
| JRN-003 | P0 | Em validação | Motion global | Trilho fotográfico usa Web Animations API com pausa; faixas promocional e de marcas reutilizam o mesmo motor nativo em autoplay contínuo, sem controle visual. Todos tratam resize e fallback; por decisão explícita, os dois loops comerciais continuam em reduced motion. Falta aprovação visual. |
| JRN-004 | P0 | Pendente | Oferta ponta a ponta | CTA, checkout, pagamento, confirmação e acesso funcionam. |

## Gate G4 — publicação

| ID | P | Status | Entrega | Critério de aceite |
|---|---:|---|---|---|
| QA-001 | P0 | Em validação | Responsividade | Sem overflow, corte ou sobreposição nos viewports definidos. |
| QA-002 | P0 | Em validação | Acessibilidade AA | Semântica, contraste, foco, teclado, drag alternativo e motion revisados. |
| QA-003 | P0 | Pendente | Resiliência | Falha de uma ilha não derruba conteúdo ou compra. |
| PERF-001 | P0 | Pendente | Performance | Budgets de JS/mídia e metas de Core Web Vitals atendidos. |
| ANA-001 | P0 | Pendente | Analytics | Eventos documentados, sem duplicidade e com consentimento adequado. |
| SEO-001 | P1 | Pendente | Descoberta | Metadata, canonical, Open Graph, favicon e social image validados. |
| REL-001 | P0 | Pendente | Release | Preview aprovado, variáveis, rollback e monitoramento documentados. |

## Depois da linha de base

| ID | P | Status | Entrega | Critério de aceite |
|---|---:|---|---|---|
| EXP-001 | P1 | Pendente | Primeiro experimento | Muda uma hipótese; amostra, janela, métrica e guardrails definidos antes do teste. |
| GOV-002 | P1 | Pendente | Governança de conteúdo | Oferta, claims e termos do TikTok Shop possuem owner e data de revisão. |

## Próxima decisão

Validar o ritmo e a leitura do novo trilho de marcas em `CNT-005` antes de iniciar outra alteração visual. A publicação comercial continua bloqueada por checkout, processo de reembolso, relação/fonte das marcas e owner dos claims.
