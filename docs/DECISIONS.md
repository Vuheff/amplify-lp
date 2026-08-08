# Registro de decisões

Estados: `Proposta`, `Aceita`, `Substituída`.

## ADR-000 — reinício e legado

- Estado: `Aceita`
- Data: 2026-08-06
- Decisão: a v0 nasceu isolada da implementação DC e de seus previews históricos.
- Consequência: requisitos e ativos aprovados podem migrar; HTML, CSS, runtime e bibliotecas não migram.
- Substituição posterior: o `ADR-024` removeu os diretórios legados da árvore atual; a recuperação permanece possível pelo histórico do Git.

## ADR-001 — runtime e publicação

- Estado: `Substituída`
- Data: 2026-08-06
- Decisão: Next.js App Router + React + TypeScript + Tailwind no fluxo v0/Vercel.
- Alternativas rejeitadas: manter DC em paralelo; export estático sem requisito; refatorar o CSS legado.
- Motivo da substituição: o usuário pediu explicitamente a organização em HTML, CSS e JavaScript.

## ADR-002 — arquitetura narrativa

- Estado: `Proposta`
- Data: 2026-08-06
- Decisão: sete perguntas correspondem a sete containers; as quatro decisões operacionais vivem apenas no container do método.
- Consequência: logos, mentor, benefícios e currículo não viram sections autônomas.
- Pendente: aprovação do Gate `CON-001`.

## ADR-003 — persuasão ética

- Estado: `Proposta`
- Data: 2026-08-06
- Decisão: princípios psicológicos só entram com função, limite, risco e mensuração; dark patterns são proibidos.
- Consequência: clareza, autonomia, reembolso e expectativa são guardrails de conversão.

## ADR-004 — interação e motion

- Estado: `Proposta`
- Data: 2026-08-06
- Decisão: estático primeiro; CSS e comportamento nativo primeiro; Motion somente com necessidade demonstrada.
- Consequência: ScrollReveal, Swiper, GSAP, autoplay, loader e conteúdo inicialmente invisível não entram.

## ADR-005 — direção visual v0.1

- Estado: `Proposta`
- Data: 2026-08-06
- Decisão: azul `#1E4DD1`, Geist Sans, dois containers, escala de 4 px e no máximo três papéis de card.
- Consequência: a base permanece pequena e coerente.
- Pendente: confirmar manual oficial, SVG/wordmark, cor e tipografia com a marca.

## ADR-006 — skills de engenharia

- Estado: `Aceita`
- Data: 2026-08-06
- Decisão: instalar `react-best-practices`, `composition-patterns` e `web-design-guidelines` do repositório Vercel Labs.
- Consequência: estarão disponíveis a partir da próxima sessão; nenhuma foi usada para gerar UI neste turno.

## ADR-007 — arquitetura estática modular

- Estado: `Aceita`
- Data: 2026-08-06
- Decisão: HTML semântico, CSS em cascade layers e JavaScript por ES Modules, sem framework de runtime.
- Alternativas rejeitadas: manter Next em paralelo; fragments HTML carregados por JavaScript; um único CSS/JS monolítico.
- Consequência: conteúdo funciona sem JS, CSS e comportamento têm responsabilidades separadas e a publicação não depende de fornecedor.
- Limite: ferramentas ou bibliotecas futuras exigem ADR próprio.

## ADR-008 — referência editorial para o Hero

- Estado: `Proposta`
- Data: 2026-08-06
- Contexto: a base limpa pareceu genérica e a exploração industrial não representou a Amplify.
- Decisão: testar uma linguagem editorial de creator economy, com composição luminosa, contraste sans/serif, formas fluidas e azul dominante; no mapa, usar a anatomia em camadas, progresso e controles da referência local `Hero`.
- Alternativas rejeitadas: dashboard técnico; reprodução da landing de referência; uso de fotos, logo ou claims candidatos ainda não autorizados.
- Consequência: a identidade continua leve e mobile-first; só será propagada aos próximos containers após aprovação do Hero.

## ADR-009 — pilha real e gesto físico no deck do Hero

- Estado: `Proposta`
- Data: 2026-08-06
- Contexto: o rail horizontal, as camadas decorativas e o `transform` do drag concorriam entre si; o resultado não representava uma pilha real e podia cortar o card durante o gesto.
- Decisão: usar os próprios quatro cards como uma pilha CSS Grid quando o JavaScript está ativo. Um único estado controla posição, ARIA, progresso, botões e Pointer Events no eixo horizontal, com resistência nos limites e decisão por distância ou velocidade. Hover/foco abre o leque apenas em dispositivos compatíveis; no mobile, o leque responde ao gesto.
- Alternativas rejeitadas: Motion exige React; GSAP Draggable adiciona runtime e a inércia completa exige plugin; Embla resolve rail, mas ainda exigiria a transformação da pilha.
- Fallback: sem JavaScript, os quatro cards seguem em ordem vertical e legível; com JavaScript, botões, teclado e arraste executam a mesma mudança de estado.
- Motion: não há teaser ou autoplay. O movimento só responde a hover, foco, botão, teclado ou gesto e desaparece em reduced motion.

## ADR-010 — protótipo integrado de conversão

- Estado: `Proposta`
- Data: 2026-08-07
- Contexto: o Hero isolado permitia testar o componente, mas perdeu o ritmo, a densidade visual e a progressão persuasiva percebidos na landing anterior. O usuário pediu a reconstrução da jornada completa.
- Decisão: integrar quatro blocos visíveis — Hero com demonstração, benefícios, prova operacional contextualizada e CTA final — preservando arquivos CSS separados por responsabilidade.
- Prova: não criar depoimentos ou números sem fonte. Enquanto não existirem falas verificáveis, o protótipo apresenta o case identificado sem prometer resultado quantitativo.
- Conversão: por decisão posterior do usuário, a landing permanece autocontida durante a etapa visual; nenhum CTA usa o contato em Notion. Checkout e integrações ficam para uma fase futura.
- Consequência: a landing pode ser avaliada como sistema, mas não está liberada para publicação comercial até `BUS-002` e `BUS-003` serem concluídos.

## ADR-011 — estrutura de referência e acervo fotográfico

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: o usuário forneceu uma referência com header fixo, progressão “como funciona”, contraste antes/depois e prova visual; também autorizou as fotos existentes em `assets/images/AmplifyUGC Assets 2026-08-06/` para criativos.
- Decisão: adaptar as relações estruturais, sem copiar marca, números ou conteúdo da referência. A jornada recebe navegação curta, contexto de campo com três fotos e comparação “sem mapa / com mapa”.
- Mídia: a página carrega derivados JPEG otimizados. Os originais de 7–20 MB foram removidos da árvore atual durante a limpeza registrada no `ADR-024`.
- Motion: as fotos respondem apenas a hover compatível; conteúdo não começa oculto e reduced motion remove a transformação.
- Limite: a autorização do acervo geral não resolve automaticamente a autorização jurídica das imagens de case publicadas em `public/assets/images/web/`.

## ADR-012 — estrutura real e motion causal

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: o usuário definiu a referência Cadence como estrutura-base real e pediu mais movimento, citando a faixa do projeto anterior.
- Decisão estrutural: organizar a landing em `Header → Hero → Método/Timeline → Números → Comparação → Prova → Inscrição → CTA final → Footer`. A referência orienta hierarquia e ritmo, não copy, marca ou claims.
- Faixa: recuperar o formato visual anterior com dois grupos idênticos, deixando a duplicata fora da árvore acessível. O deslocamento horizontal é calculado a partir do scroll vertical; não existe timer, autoplay ou marquee independente do usuário.
- Entradas: `IntersectionObserver` remove deslocamentos máximos de 14 px dos blocos quando entram na viewport. A opacidade permanece sempre em `1`, portanto falha do JavaScript não oculta conteúdo.
- Movimento reduzido: faixa e entradas ficam estáticas; o deck continua utilizável por botões e teclado.
- Oferta: nesta implementação original, preço, garantia e checkout ainda não estavam aprovados. Confirmações posteriores estão registradas no ADR-013 e no backlog; a URL de checkout permanece pendente.
- Substituição parcial: o movimento da faixa textual orientado pelo scroll foi substituído pelo trilho fotográfico do `ADR-014`; a decisão sobre entradas sem opacidade continua válida.

## ADR-013 — Hero de autoridade com acervo real

- Estado: `Proposta`
- Data: 2026-08-07
- Contexto: o usuário indicou a landing publicada `webinar-7-perguntas` como trabalho aprovado e pediu mais qualidade, fotografia e movimento já na primeira dobra.
- Decisão visual: adotar o fundo azul-noturno, headline de alto contraste e pilha inclinada como DNA reconhecível da referência, substituindo os cards abstratos por Matheus Kaze e três cenas reais da operação Amplify.
- Conteúdo: o Hero responde apenas por promessa, transformação, formato e próximo passo. Os quatro cards demonstram visualmente Produto, Creators, Conteúdo e Escala; o detalhamento permanece no container do método.
- Motion: manter a pilha causal existente, acionada por arraste, botões, teclado, hover ou foco. Não há autoplay, teaser temporizado nem conteúdo essencial dependente de JavaScript.
- Mídia: quatro derivados JPEG de 640 × 800 px totalizam aproximadamente 258 KB; apenas a imagem inicial recebe prioridade alta.
- Limite: a linguagem visual só será propagada para os próximos containers depois da aprovação do `CNT-001`.

## ADR-014 — Topo “Nova era no feed” e trilho fotográfico acessível

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: o Hero foi aprovado em estrutura, mas a copy inicial ocupava espaço demais e a faixa textual repetia as quatro decisões. O usuário pediu um posicionamento de mercado mais marcante, preservação integral dos cards e fotos reais em movimento contínuo.
- Decisão de conteúdo: usar `Webinar TikTok Shop · Compra por descoberta`, a headline `A nova era das vendas no Brasil começa no feed.` e um apoio orientado aos critérios que o participante leva; mover 4 blocos, 29 temas, acesso e garantia para os containers próprios.
- Decisão visual: centralizar a leitura do Hero no mobile, manter o deck sem redesign e substituir a faixa textual por 8 derivados WebP do acervo Amplify. A faixa é uma transição, não uma oitava pergunta.
- Motion: o deck agrupa atualizações por frame, mede no início do gesto, suaviza velocidade e separa soltura de renderização. O trilho fotográfico é a única exceção de autoplay: só anima após o controle de pausa existir, pausa em hover/foco, remove a duplicata da árvore acessível e fica estático/manual sem JavaScript ou com `prefers-reduced-motion`.
- Alternativas rejeitadas: “método chinês” sem base do produto; headline com claim `102x`; importar runtime do Uiverse; redesenhar ou automatizar os cards.
- Consequência: próximos containers seguem `Produto/experiência → Método → Dor/fit → Prova → Oferta/risco → Objeções`, um por vez.
- Substituição parcial: o keyframe do trilho e a pausa por `:focus-within` foram substituídos pelo motor JavaScript e pelos estados explícitos do `ADR-015`.

## ADR-015 — Motor JavaScript do trilho e prévia local

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: a abertura direta de `index.html` bloqueava os ES Modules em navegadores comuns; a faixa permanecia estática e a regra `:focus-within` podia impedir a retomada mesmo depois do comando explícito do usuário.
- Decisão: adotar `http://127.0.0.1:4173` como prévia oficial e oferecer `preview.cmd`/`npm run preview:open`. O trilho passa a usar Web Animations API, distância medida do grupo real e velocidade constante de 22 px/s.
- Estados: o botão controla pausa manual; hover com ponteiro preciso e aba invisível pausam temporariamente; resize preserva o progresso; reduced motion cancela a animação e mantém acesso horizontal manual. O foco continua visível, mas não cria uma pausa implícita contraditória com “Retomar”.
- Alternativas rejeitadas: manter `@keyframes` com distância percentual; desmontar os ES Modules para suportar `file://`; adicionar bundler ou biblioteca de motion apenas para a prévia.
- Consequência: a arquitetura modular permanece pequena e sem dependência, enquanto o fallback sem JavaScript continua legível e navegável.

## ADR-016 — Faixa promocional e urgência verificável

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: o usuário pediu uma faixa animada que apresentasse produto, desconto e urgência já no topo. Nome, preço de referência e preço à vista estão confirmados; prazo promocional, vagas e checkout não estão.
- Decisão: inserir antes da navegação uma faixa semântica que leva a `#inscricao` e comunica `Webinar TikTok Shop`, `R$ 1.632` e `R$ 97 à vista`. “Condição atual” cria saliência sem afirmar prazo inexistente.
- Motion: uma passagem luminosa e um pulso executam uma única vez, usando somente `transform`/`opacity`; o conteúdo não se move, continua legível sem JavaScript e a decoração desaparece em `prefers-reduced-motion`.
- Alternativas rejeitadas: countdown sem data confirmada; escassez de vagas; marquee textual contínuo; duplicar preço em diferentes containers; adicionar biblioteca para uma microinteração simples.
- Consequência: a faixa é a fonte visível do preço nesta etapa. O futuro `CNT-006` deverá realocar ou referenciar essa condição sem duplicá-la no HTML.

## ADR-017 — Repertório de marcas em trilho acessível

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: o usuário forneceu uma composição aprovada com título editorial centralizado, respiro e logos em movimento infinito, pedindo sua reconstrução dentro da landing.
- Decisão narrativa: integrar a composição ao início de `CNT-005`, onde o repertório ajuda a responder “Por que acreditar?”. Ela não cria uma oitava section nem substitui o case contextualizado.
- Decisão visual: usar 9 logos reais e autorizados — Sallve, Aura Beauty, Gocase, BodyAction, Gummy Original, Mais Mu, Max Titanium, DOT e Spoiler — em superfícies claras, arredondadas e parcialmente visíveis nas bordas.
- Motion: usar um controlador JavaScript isolado com `requestAnimationFrame`. O trilho mede a largura real fora do loop, percorre exatamente um grupo a 56 px/s e preserva o progresso no resize; cada frame atualiza somente `transform`. Dois grupos já existem no HTML para o loop funcionar também em `file://`. Por solicitação posterior do usuário, botão e pausas por interação foram removidos: o movimento continua sob cursor e foco, interrompendo somente em aba oculta ou `prefers-reduced-motion`. A duplicata permanece `aria-hidden` e JavaScript desligado preserva o fallback estático.
- Alternativas rejeitadas: biblioteca de carrossel; `@keyframes` com distância aproximada; logos fictícios; section independente de clientes; movimento sem controle.
- Limite comercial: a autorização visual não comprova por si só o tipo de relação com cada marca. O claim permanece em protótipo e a publicação depende do registro de fonte e relação em `BUS-003`.

## ADR-018 — Autoplay de marcas sem dependência do botão

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: o trilho funcionava quando reutilizava Web Animations API com um botão, mas a remoção do controle também removeu os hooks obrigatórios do módulo. A substituição por `requestAnimationFrame` criou outro ciclo de execução e o movimento deixou de aparecer na prévia do usuário.
- Decisão: o controlador independente de marcas volta a usar `Element.animate()`, mede exatamente a largura do primeiro grupo e inicia uma única animação linear infinita a 56 px/s assim que o HTML está pronto. Nenhum seletor, estado ou evento de botão participa da inicialização.
- Estados: resize reconstrói a animação preservando o progresso; a duplicata continua `aria-hidden`; `file://` continua atendido pelo script clássico independente. Em 2026-08-07, após confirmar que o navegador local sinalizava `prefers-reduced-motion: reduce`, o usuário escolheu explicitamente manter este trilho em movimento também nesse estado.
- Alternativas rejeitadas: manter dois motores para o mesmo padrão visual; criar botão invisível; simular clique no carregamento; deixar `document.hidden` impedir o primeiro frame em prévias incorporadas; manter este trilho estático em reduced motion.
- Consequência: o comportamento comprovadamente funcional do trilho com botão é preservado sem manter o botão ou sua dependência no DOM. Esta é uma exceção consciente ao guardrail global de motion; as demais animações continuam respeitando a preferência do sistema.

## ADR-019 — Faixa promocional inclinada abaixo da navegação

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: a faixa promocional estava acima do menu e usava apenas uma entrada luminosa. O usuário forneceu como referência uma fita azul inclinada e pediu que ela ficasse abaixo da navegação, com conteúdo correndo continuamente.
- Decisão visual: posicionar a faixa imediatamente abaixo de `.c-site-nav`, com container externo transparente e somente a fita azul full-bleed visível. O container sobrepõe o início do Hero por margem negativa, e um modificador de padding preserva a headline na primeira dobra. A inclinação discreta, o texto branco em caixa alta e os separadores circulares seguem a transparência real do PNG de referência; claims externos como clientes ativos ou vendas geradas não são reutilizados.
- Conteúdo: manter somente verdades confirmadas — Webinar TikTok Shop, condição atual de R$ 1.632 por R$ 97 à vista, 4 blocos, 29 temas e 12 meses de acesso — com destino interno `#inscricao`.
- Motion: usar um controlador JavaScript clássico e independente com Web Animations API a 72 px/s, dois grupos idênticos, duplicata `aria-hidden`, progresso preservado no resize e autoplay sem botão. Por escolha explícita do usuário e para corresponder ao ambiente local já diagnosticado, este loop continua em `prefers-reduced-motion`.
- Fallback: sem JavaScript, somente o grupo semântico aparece em uma faixa horizontal navegável manualmente.
- Consequência: o `ADR-016` permanece histórico quanto à verdade da oferta, mas sua posição, aparência e motion são substituídas por esta decisão.

## ADR-020 — Modal de captura e intenção sem falsa compra

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: o checkout ainda não está disponível, mas a nova jornada precisa qualificar o lead, preservar atribuição e registrar o interesse na condição atual sem alterar a estrutura visual da landing.
- Decisão: todos os CTAs de captura abrem o mesmo `<dialog>` progressivo com 6 perguntas e validação por etapa. O primeiro webhook n8n recebe respostas, atribuição e metadados; somente `ok: true` com `lead_id` não vazio libera o estado de oferta. O segundo webhook envia `lead_id` e e-mail para registrar intenção no mesmo lead.
- Regra de negócio: envio do formulário e clique de intenção mantêm `Comprou? = Não`. Somente um webhook futuro autenticado de pagamento poderá registrar compra real. O evento de intenção declara `charged: false`.
- Persuasão: o modal apresenta o contraste confirmado de R$ 1.632 por R$ 97, 4 blocos, 29 temas, 12 meses de acesso e 7 dias de garantia. Aversão à perda fica limitada à natureza promocional da condição; não entram contador, vagas limitadas, prazo ou reserva fictícia.
- Acessibilidade e fallback: o diálogo fecha por botão, Escape e backdrop, restaura o foco e bloqueia a rolagem de fundo. Sem JavaScript, os links continuam levando à section `#inscricao` e nenhum dado é enviado.
- Linguagem do CTA: por decisão explícita do usuário, todos os gatilhos usam “Garantir minha vaga”. O modal continua registrando lead e intenção; compra, cobrança, reserva operacional e acesso permanecem dependentes do checkout futuro.
- Motion: backdrop, superfície e controle de fechamento entram de forma coordenada; perguntas usam transição direcional de 14 px via Web Animations API; preço, entregas e confirmação recebem revelação curta em cascata. Tudo usa apenas `transform`/`opacity` e é removido em `prefers-reduced-motion`.
- Limite: o teste automatizado substitui `fetch` e não grava dados em produção. Homologação real do n8n/Notion, checkout, pagamento e confirmação de acesso permanecem pendentes.

## ADR-021 — Símbolo Amplify fornecido para a navbar

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: a navegação usava o caractere provisório `≫`; o usuário forneceu o símbolo visual que deve identificar a marca no menu.
- Decisão: preservar o PNG original de 512 × 512 px em `assets/images/web/amplify-nav-logo.png` e exibi-lo a 36 px ao lado do texto Amplify. O arquivo possui dimensões explícitas, 28 KB e não recebe transformação gráfica.
- Acessibilidade: a imagem é decorativa (`alt=""`) porque o próprio link mantém `aria-label="Amplify, início"` e o nome visível.
- Limite: o ativo resolve somente o símbolo da navbar; manual de marca, SVG e wordmark oficiais continuam pendentes.

## ADR-022 — Navegação mobile e resposta à direção do scroll

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: os destinos da navbar ficavam ocultos no mobile e não havia resposta visual à posição ou direção de leitura.
- Decisão: adicionar menu mobile controlado por botão, manter os quatro destinos visíveis no desktop e expor o destino ativo com `aria-current`. A navbar se oculta após scroll descendente deliberado e reaparece ao subir, receber foco ou abrir o menu; uma linha de 2 px representa o progresso da página.
- Implementação: controlador nativo isolado agrupa atualizações de scroll em `requestAnimationFrame`, altera somente atributos/variável CSS e usa `inert`/`aria-hidden` no menu mobile fechado. Não há biblioteca ou listener por section.
- Acessibilidade: botão de 44 px informa expansão, Escape fecha e restaura foco, clique externo fecha, links possuem alvos mínimos de 48 px e reduced motion reduz as transições a 1 ms.
- Fallback: sem JavaScript, o botão não aparece e os quatro links ficam disponíveis em uma linha horizontal navegável.
- Iconografia: o menu mobile usa quatro SVGs locais da coleção oficial Google Material Symbols Rounded (`home`, `route`, `compare_arrows` e `verified`). Os ícones são decorativos, possuem texto adjacente e ficam ocultos no desktop; não há fonte externa, pacote ou nova dependência de runtime.

## ADR-023 — Produto e valor no segundo container

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: “Mapa em uma leitura” repetia argumentos do método e seus números abstratos não explicavam o produto nem a condição disponível. O usuário pediu que o bloco apresentasse curso, valor anterior, valor atual e um número dominante de desconto.
- Decisão: substituir o bloco por uma composição mobile-first que apresenta o Webinar TikTok Shop como aula gravada, destaca 94% de desconto e mostra R$ 1.632, R$ 97 à vista, 4 blocos, 29 temas, 12 meses de acesso e 7 dias de garantia.
- Regra de produto: a palavra “mentoria” não entra na interface porque criaria uma expectativa incompatível com a aula única gravada confirmada em `BUS-001`.
- Persuasão: o preço anterior cria referência, o percentual facilita a comparação e os detalhes reduzem ambiguidade. Não entram contador, lote, vagas ou prazo inventado.
- Consequência: a faixa promocional continua como teaser do topo e este container passa a ser a explicação detalhada de produto e valor. Suporte, pós-compra, parcelamento, checkout e operação do reembolso continuam pendentes.

## ADR-024 — Raiz de deploy e remoção do legado

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: o repositório misturava a landing ativa com 318 MB de legado, originais fotográficos, candidatos duplicados, referências e artefatos de teste. Isso aumentava o tempo de clone, confundia a fonte de verdade e dificultava a configuração do Netlify.
- Decisão: adotar `public/` como única raiz publicada; manter `docs/` e `tests/` fora do deploy; mover somente os assets realmente carregados pela landing; remover `_legacy`, pesquisas arquivadas, originais duplicados, referências visuais e capturas geradas.
- Deploy: `netlify.toml` publica `public/` sem etapa de build. O servidor local e os testes também usam essa mesma raiz.
- Recuperação: os arquivos removidos não permanecem na árvore atual, mas continuam acessíveis nos commits anteriores. Redução ou reescrita do histórico do Git não faz parte desta decisão.
- Consequência: o pacote publicado fica próximo de 1,5 MB e a estrutura de produção não expõe documentação, testes ou fontes brutas.

## ADR-025 — Crescimento como progressão do método

- Estado: `Substituída`
- Data: 2026-08-07
- Contexto: o container de inscrição estava claro, mas sem uma assinatura visual que conectasse valor percebido e evolução operacional.
- Decisão: preservar os dois cards existentes e antecedê-los com um painel de marca que apresenta Produto, Creators, Conteúdo e Escala em quatro barras ascendentes. O crescimento representa o encadeamento das decisões, não faturamento ou resultado prometido.
- Limite: o gráfico não possui valores, eixo financeiro ou claim quantitativo; a legenda visível declara que não é uma projeção financeira.
- Implementação: HTML semântico e CSS nativo no componente existente, sem biblioteca, novo runtime ou conteúdo dependente de JavaScript.
- Motivo da substituição: a revisão visual mostrou competição entre três camadas, sobreposição dos cards e invasão da legenda sobre o texto no desktop.

## ADR-026 — Inscrição como card único de crescimento

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: o usuário escolheu um card único, claro e orientado ao método em ascensão para reorganizar o container rejeitado no ADR-025.
- Decisão: manter a introdução externa e reunir mensagem, quatro etapas e CTA em um único card em fluxo normal. Cada decisão recebe uma ação curta: Produto/Escolher, Creators/Ativar, Conteúdo/Converter e Escala/Ampliar.
- Visual: superfície branca levemente azulada, contorno de marca e barras ascendentes em azul, violeta e ciano. Não existem elementos absolutos, margens negativas, eixo ou valor financeiro.
- Motion: as etapas sobem uma vez, em sequência, quando o card entra na viewport; reduced motion mantém todas estáticas. O observador existente é reutilizado, sem nova biblioteca ou runtime.
- Conteúdo: preço, garantia e acesso não se repetem neste card porque já são apresentados no container anterior. Textos de bastidor sobre landing, aprovação e prévia visual foram removidos.

## ADR-027 — Três pontos de conversão na jornada

- Estado: `Aceita`
- Data: 2026-08-07
- Contexto: sete gatilhos com a mesma ação criavam repetição visual, especialmente entre navbar/Hero e inscrição/CTA final.
- Decisão: manter `Garantir minha vaga` somente no Hero, no bloco de preço e no encerramento. Os três usam o mesmo hook e abrem o modal existente.
- Navegação: a faixa promocional deixa de abrir o modal e passa a levar a `#operacao`, com a indicação “Ver a condição completa”. Navbar, comparação e card de crescimento ficam sem gatilho de captura.
- Fallback: sem JavaScript, os três CTAs levam a `#inscricao` e a faixa continua levando ao preço.
- Consequência: o contrato público de captura passa a exigir exatamente três ocorrências de `data-js="open-lead-modal"`; modal, formulário, webhooks e cards do Hero não mudam.

## ADR-028 — Ancoragem única e entrada orientada pelo scroll

- Estado: `Aceita`
- Data: 2026-08-08
- Contexto: a revisão de oferta pediu uma ancoragem mais clara, sem preços artificiais por item, e uma nomenclatura pública compreensível para quem ainda não domina o vocabulário do mercado.
- Vocabulário: toda comunicação pública usa “Criadores de conteúdo”. O identificador interno `data-decision="creators"` é preservado para manter o contrato do deck e do gesto.
- Oferta: o card claro apresenta quatro componentes de valor e uma única referência de R$ 1.632. O card escuro apresenta Webinar TikTok Shop, 94% de desconto, R$ 97 à vista, 29 temas, 12 meses de acesso e 7 dias de garantia. Nenhum componente recebe preço individual.
- Motion: sections com `data-motion` usam CSS View Timelines somente durante a entrada na viewport. `IntersectionObserver` continua como fallback; sem JavaScript o conteúdo é estático e, em `prefers-reduced-motion`, animação, transformação e transição são removidas.
- Limites: navbar, faixas contínuas, modal e deck do Hero mantêm seus motores próprios. Não entra biblioteca, listener de scroll adicional ou novo ponto de conversão.

## ADR-029 — Revalidação de código e versão de assets

- Estado: `Aceita`
- Data: 2026-08-08
- Contexto: CSS e JavaScript eram publicados em URLs estáveis com cache de 7 dias. Uma versão nova da landing podia receber HTML atualizado e continuar usando estilos antigos armazenados pelo navegador.
- Decisão: CSS e JavaScript passam a usar `max-age=0, must-revalidate` no Netlify. Imagens e ícones continuam com cache de 7 dias.
- Invalidação: o HTML referencia entradas versionadas e cada `@import` de CSS recebe o mesmo identificador de versão. Uma publicação visual nova deve atualizar esse identificador.
- Consequência: a interface não depende de limpeza manual do cache para carregar uma revisão; a raiz `public/` e o `netlify.toml` precisam estar versionados no mesmo commit do deploy.

## ADR-030 — ScrollReveal como motor único das entradas

- Estado: `Aceita`
- Data: 2026-08-08
- Contexto: CSS View Timelines e `IntersectionObserver` controlavam simultaneamente `opacity` e `transform` dos mesmos elementos. O efeito era sutil e variava entre navegadores, apesar de a estrutura e os componentes já estarem aprovados.
- Decisão: hospedar ScrollReveal 4.0.9 localmente e usar uma única instância para elementos com `data-motion`. Entradas `rise` usam até 24 px; entradas `scale` usam 12 px e escala discreta; ambas mantêm opacidade inicial legível, sequência curta, `reset: false` e limpeza após revelar.
- Fallback: sem biblioteca, sem JavaScript ou em `prefers-reduced-motion`, todo conteúdo permanece visível e estático. Navbar, modal, deck e trilhos contínuos preservam seus motores isolados.
- Substituição: esta decisão substitui as restrições de biblioteca do `ADR-004` e os motores de entrada descritos nos `ADR-012`, `ADR-026` e `ADR-028`, sem alterar seus demais contratos.
- Consequência: View Timelines e o observador de entrada são removidos; ScrollReveal passa a ser a única dependência de motion e sua licença MIT fica registrada em `THIRD_PARTY_NOTICES.md`.
