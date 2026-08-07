# Backlog da landing

Legenda: `P0` bloqueia publicação, `P1` aumenta conversão ou confiança, `P2` melhora engenharia, `P3` é manutenção futura.

## Modelo de leitura

O hero é o prólogo da página: apresenta a promessa e as quatro decisões operacionais — Produto, Creators, Conteúdo e Escala. Depois dele, a conversão avança em sete capítulos comerciais:

1. Experiência.
2. Contexto + diagnóstico.
3. Outcomes + público.
4. Marcas + case.
5. Mentor.
6. Método.
7. Entregas + FAQ.

Os sete capítulos respondem às dúvidas do lead. As quatro decisões explicam o conteúdo do produto. Uma estrutura não deve ser numerada ou tratada como se fosse a outra.

## P0 — antes de publicar

| ID | Item | Status | Critério de aceite |
|---|---|---|---|
| LP-001 | Configurar URL real do checkout | Pendente | Todos os CTAs abrem o mesmo checkout válido e rastreável; o botão interno do modal não retorna para `#oferta`. |
| LP-003 | Validar preços e desconto | Pendente | Preço de referência, preço final, economia e percentual são aprovados comercialmente e permanecem consistentes em todas as superfícies. |
| LP-004 | Revisar provas e alegações | Pendente | Resultados, marcas, fotos e credenciais têm autorização e evidência interna; o case identifica GMV, período, contexto e papel da Amplify sem parecer resultado de aluno. |
| LP-005 | Testar compra ponta a ponta | Pendente | CTA, modal, checkout, pagamento, e-mail e acesso à mentoria funcionam em 360, 390 e 430 px. |
| LP-006 | Garantir renderização e fail-open | Concluído | React, ReactDOM, ScrollReveal, Swiper e seu CSS são locais; a landing continua legível, rolável e comprável sem ScrollReveal/Swiper, em movimento reduzido e sem conteúdo preso pelo loader. |
| LP-007 | Fixar os sete capítulos comerciais | Concluído | Arquitetura e HTML distinguem o prólogo do hero dos capítulos `01` a `07`; contexto/diagnóstico, outcomes/público, marcas/case e entregas/FAQ compartilham o mesmo capítulo e a ordem é igual no mobile e desktop. |
| LP-008 | Fixar o contrato das quatro decisões operacionais | Concluído | Hero, diagnóstico, método e entregas usam Produto → Creators → Conteúdo → Escala; os cards do método conectam pergunta, conteúdo e saída. |
| LP-009 | Fixar a verdade do produto | Concluído | Hero, experiência, oferta, modal, FAQ e fechamento apresentam a mesma “mentoria gravada em quatro decisões”; “operação completa” deixou de nomear o produto. |
| LP-010 | Corrigir condição comercial e urgência | Concluído | A urgência sem prazo verificável foi removida; percentual e economia são derivados de `precoDe` e `precoPor`; o rótulo incorreto “por curso” saiu. |

### Evidência atual de LP-006

- `node tests/motion-contract.mjs` passa com 20 alvos e cache `v27`.
- Os smokes passam isoladamente em 320, 360, 390 e 430 px.
- Também passam em movimento reduzido, sem ScrollReveal, sem Swiper e com as duas bibliotecas visuais bloqueadas ao mesmo tempo.
- Os testes percorrem todos os trilhos, confirmam cards visíveis, textos críticos sem truncamento, ausência de overflow global, modal e fechamento.

## P1 — conversão e confiança

| ID | Item | Status | Critério de aceite |
|---|---|---|---|
| LP-101 | Implantar analytics de conversão | Pendente | Cliques por CTA, abertura do modal, interação nos decks/trilhos, início de checkout e compra são identificáveis. |
| LP-102 | Consolidar prova visual real | Em validação | O case da Max usa fotos reais e contexto; novos cases ou depoimentos só entram com autorização e evidência. |
| LP-104 | Completar SEO e compartilhamento | Pendente | Canonical, Open Graph, imagem social e favicon passam na validação. |
| LP-105 | Revisar acessibilidade | Pendente | Navegação por teclado, contraste, foco, landmarks, textos alternativos e estados anunciados passam em auditoria; movimento reduzido também interrompe faixas automáticas não essenciais. |
| LP-106 | Otimizar imagens | Pendente | Foto do mentor possui WebP/AVIF responsivo sem perda visual perceptível. |
| LP-107 | Testar variações do primeiro bloco | Pendente | Uma hipótese por vez — headline, prova ou CTA — possui métrica, amostra e janela definidas. |
| LP-108 | Validar uso de marcas e fotos | Pendente | Jurídico/comercial confirma autorização, versões oficiais dos logos, relação descrita com cada marca e contexto das fotos. |
| LP-109 | Padronizar o shell dos capítulos | Concluído | Os sete capítulos compartilham pergunta, heading, largura, espaçamento e cards; a matriz de 320 a 430 px não apresenta overflow da página. |
| LP-110 | Transformar o diagnóstico nas quatro decisões | Concluído | Existem quatro travas na ordem canônica; no mobile o trilho mostra próximo card, dica, progresso, scroll snap e controle por teclado. |
| LP-111 | Transformar benefícios em mudança percebida | Pendente | O lead distingue capacidade, impacto operacional e segurança em até três varreduras e encontra as quatro saídas práticas sem depender de uma lista extensa. |
| LP-112 | Unificar mecanismo e currículo | Concluído | Existe uma única sequência de quatro cards conectando pergunta, critérios e decisão; todos os tópicos ficam visíveis no mobile. |
| LP-113 | Consolidar marcas e case como um capítulo de prova | Em andamento | Logos introduzem o case sem formar uma narrativa concorrente; a relação com as marcas é precisa e o resultado completo possui uma única fonte de verdade. |
| LP-114 | Completar identidade e autoridade do mentor | Pendente | Nome completo, função e credenciais são validados; números do case não são repetidos como credencial e nenhuma imagem sugere vínculo institucional inexistente. |
| LP-115 | Criar fechamento depois do FAQ | Concluído | O último bloco resume os quatro blocos, acesso, garantia e próximo passo em uma tela mobile e usa o mesmo modal de oferta. |
| LP-116 | Validar comportamento contextual do dock de conversão | Concluído | O dock aparece depois do hero, some sobre entregas, fechamento, modal e footer, usa preço dinâmico e mantém `aria-hidden` sincronizado. |

## P2 — engenharia e manutenção

| ID | Item | Status | Critério de aceite |
|---|---|---|---|
| LP-201 | Substituir classes `u-*` | Pendente | Componentes críticos usam nomes semânticos sem regressão visual. |
| LP-202 | Modularizar o CSS | Pendente | Tokens, base, capítulos, componentes, motion e responsividade ficam separados no build ou por imports documentados. |
| LP-203 | Centralizar valores comerciais | Em andamento | Preços e valores derivados vêm das propriedades DC; nenhum CTA, selo, texto alternativo ou resumo repete manualmente preço, desconto ou economia. |
| LP-204 | Automatizar smoke test | Em andamento | Testes cobrem renderização DC, React indisponível/lento, ScrollReveal e Swiper isolados ou simultaneamente indisponíveis, movimento reduzido, troca de raiz, imagens, âncoras, FAQ, modal, dock e todos os alvos/trilhos. |
| LP-205 | Criar rotina de qualidade | Pendente | Formatter, lint, validação de links e verificação de versão/cache rodam antes da publicação. |
| LP-206 | Registrar eventos e erros | Pendente | Falhas de runtime, renderização DC e checkout podem ser diagnosticadas sem acessar o aparelho do lead. |
| LP-207 | Validar performance do sistema de motion | Pendente | Loader, ScrollReveal, Swiper, faixas e imagens mantêm fluidez em Android intermediário, respeitam movimento reduzido e não pioram Web Vitals. |
| LP-208 | Centralizar conteúdo das quatro decisões | Pendente | Hero, diagnóstico, método e entregas derivam labels, ordem, perguntas e saídas de um único objeto de dados, sem cópias divergentes no template. |
| LP-209 | Testar o contrato narrativo | Concluído | O smoke falha se a ordem dos sete capítulos mudar, se uma das quatro decisões sumir ou se não houver fechamento após as objeções. |
| LP-210 | Detectar conteúdo oculto ou truncado | Concluído | O smoke percorre vertical e horizontalmente todos os trilhos e reprova card invisível, texto crítico truncado ou overflow global. |
| LP-211 | Remover CSS e comportamento órfãos | Pendente | Experimentos desativados, seletores sem elemento, estilos antigos de hero/oferta e media queries conflitantes saem da produção sem regressão; rollback permanece recuperável fora do CSS ativo. |

## P3 — limpeza posterior

| ID | Item | Status | Critério de aceite |
|---|---|---|---|
| LP-301 | Apagar `_archive` | Aguardando publicação | Uma versão publicada e validada não depende de nenhum item arquivado. |
| LP-302 | Auditar `_ds` e `.thumbnail` | Pendente | A plataforma confirma por teste que os arquivos são ou não necessários. |
| LP-303 | Renomear o entrypoint | Pendente | A plataforma aceita `index.html` ou redireciona sem quebrar props DC. |

## Próxima sprint recomendada

1. LP-001 e LP-005 — checkout real e compra ponta a ponta.
2. LP-003 e LP-004 — aprovação dos valores, desconto, marcas e alegações.
3. LP-208 — uma única fonte de conteúdo para as quatro decisões.
4. LP-101 — analytics de CTAs, modal, decks e checkout.
5. LP-105, LP-204 e LP-207 — auditoria de acessibilidade, lifecycle DC e performance em Android intermediário.
