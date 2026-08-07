# Psicologia aplicada ao design

Status: **estudo consolidado; regras candidatas para o Gate R0**.

Este documento traduz percepção, atenção, memória e decisão em critérios de design. Ele não afirma que uma cor, posição ou animação isolada “aumenta conversão”. Efeitos comportamentais dependem de público, tarefa, contexto e qualidade da oferta.

## Escala de confiança

| Nível | Significado | Uso permitido |
|---|---|---|
| A | Evidência direta de percepção, cognição, HCI ou acessibilidade. | Pode virar regra-base, ainda validada na interface real. |
| B | Efeito consistente, mas transferido de outro contexto. | Entra como hipótese explícita. |
| C | Heurística popular ou efeito muito contextual. | Não vira regra sem teste próprio. |

## 1. Organização perceptiva

### DES-PSI-01 · Proximidade e região comum — nível A

Pessoas tendem a perceber elementos próximos, semelhantes, conectados ou dentro da mesma região como um grupo. A revisão moderna da Gestalt reúne evidências para proximidade, similaridade, continuidade, região comum e movimento comum. [Wagemans et al., 2012](https://pubmed.ncbi.nlm.nih.gov/22845751/).

Aplicação:

- pergunta, resposta e evidência de um container ficam visualmente mais próximas entre si do que do próximo assunto;
- label deve ficar mais próxima do campo/controle que descreve;
- preço, condição e CTA formam um único grupo de oferta;
- contexto, métrica e fonte formam um único grupo de prova;
- espaçamento comunica relação antes de bordas e sombras.

Evitar: card dentro de card apenas para “criar camadas”; proximidade ambígua; um badge parecer ligado ao item errado.

### DES-PSI-02 · Figura-fundo e hierarquia — nível A

A atenção visual é guiada por características do estímulo e pelo objetivo de busca. Saliência ajuda, mas elementos visualmente fortes também competem entre si. [Wolfe, 1994](https://doi.org/10.3758/BF03200774).

Aplicação:

- um foco primário por viewport;
- contraste máximo reservado à conclusão ou ação principal;
- decoração permanece claramente no fundo;
- tabs, setas e indicadores não podem ter mais peso que o conteúdo do deck;
- CTA primário e navegação do componente usam hierarquias diferentes.

Evitar: todos os cards destacados, múltiplos gradientes, badges fluorescentes e três CTAs com o mesmo peso.

## 2. Atenção

### DES-PSI-03 · Atenção seletiva e cegueira por desatenção — nível A

Algo pode estar visível e ainda assim não ser notado quando a atenção está ocupada com outra tarefa. Mudanças também podem passar despercebidas se não tiverem um sinal local claro. [Simons & Levin, 1997](https://pubmed.ncbi.nlm.nih.gov/21223921/).

Aplicação:

- informação essencial não aparece simultaneamente com motion decorativa;
- mudança de slide deve atualizar posição, título e estado no mesmo local;
- feedback de compra/erro aparece junto da ação que o provocou;
- não confiar em “está logo abaixo” como prova de que a informação será percebida;
- testar localização de preço, garantia e restrições, não apenas presença no DOM.

Evitar: ticker, marquee, contadores animados, vários reveals concorrentes e atualização silenciosa fora do foco.

### DES-PSI-04 · Primeira impressão visual — nível B

Estudos de websites encontraram julgamentos estéticos muito rápidos e associação entre menor complexidade visual, maior prototipicidade e avaliações iniciais melhores. Isso mede impressão estética, não compreensão nem compra. [Lindgaard et al., 2006](https://doi.org/10.1080/01449290500330448) e [Tuch et al., 2012](https://research.google/pubs/the-role-of-visual-complexity-and-prototypicality-regarding-first-impression-of-websites-working-towards-understanding-aesthetic-judgments/).

Aplicação:

- hero deve parecer imediatamente uma página confiável de produto educacional;
- identidade pode ser expressiva, mas produto, headline e CTA mantêm padrões familiares;
- reduzir complexidade inicial antes de adicionar originalidade;
- medir separadamente “parece profissional” e “entendi o produto”.

Evitar: usar “50 ms” como promessa de conversão ou justificar hero vazio só porque está bonito.

## 3. Memória e carga cognitiva

### DES-PSI-05 · Memória de trabalho limitada — nível A/B

A capacidade de manter itens distintos no foco é limitada e frequentemente estimada em torno de três a quatro chunks, dependendo da tarefa e do agrupamento. Não é uma lei de que toda UI deve ter quatro itens. [Cowan, 2001](https://pubmed.ncbi.nlm.nih.gov/11515286/).

Aplicação:

- as quatro decisões são apresentadas como quatro chunks estáveis;
- cada slide repete a mesma estrutura: pergunta → critério → aplicação → saída;
- labels `Produto`, `Creators`, `Conteúdo` e `Escala` permanecem visíveis;
- comparação importante não exige memorizar um slide oculto;
- uma section responde uma pergunta humana.

Evitar: listas de benefícios, módulos e bônus competindo na mesma tela; esconder labels e mostrar apenas `1/4`.

### DES-PSI-06 · Segmentação e sinalização — nível B

Em aprendizagem multimídia, segmentar material complexo e sinalizar sua estrutura pode reduzir sobrecarga. A transferência para uma landing é uma hipótese, mas combina com a natureza educacional do produto. [Mayer & Moreno, 2003](https://doi.org/10.1207/S15326985EP3801_6).

Aplicação:

- dividir conteúdo pela decisão que o lead está tentando formar;
- títulos informativos antecipam a conclusão;
- texto e visual correspondente aparecem próximos;
- progressive disclosure serve a detalhe secundário, não à condição essencial;
- o deck avança no ritmo do usuário.

Evitar: uma ilustração sem função, texto explicando outra área da tela e interação obrigatória para descobrir a proposta.

### DES-PSI-07 · Primazia e recência — nível B

Em tarefas de recordação, itens iniciais e finais podem ser lembrados melhor que itens intermediários. A landing não é uma lista de laboratório; portanto, o efeito orienta teste, não uma regra automática. [Murdock, 1962](https://doi.org/10.1037/h0045106).

Aplicação:

- hero estabelece o modelo mental correto;
- fechamento recapitula a mesma promessa, sem inventar outra;
- containers intermediários têm headings e conclusões próprias;
- informações críticas da oferta são repetidas apenas quando a tarefa exige, usando a mesma fonte de dados.

Evitar: acreditar que conteúdo no meio pode ser fraco ou repetir preço/CTA sem propósito em toda section.

## 4. Escolha e ação

### DES-PSI-08 · Complexidade de escolha — nível A/B

O tempo de decisão cresce com a informação e a incerteza das alternativas, mas a aplicação não é simplesmente “menos botões sempre é melhor”. Familiaridade e compatibilidade entre estímulo e resposta também importam. [Hyman, 1953](https://pubmed.ncbi.nlm.nih.gov/13052851/).

Aplicação:

- uma ação comercial primária por contexto;
- ações secundárias têm rótulo e peso diferentes;
- CTA usa verbo compatível com o destino: `Comprar`, `Ir para o checkout` ou `Inscrever-se`;
- deck tem poucas rotas equivalentes: swipe, anterior/próximo e tabs 1–4;
- não apresentar planos/opções inexistentes só para criar comparação.

Evitar: menu, CTA, modal, WhatsApp e navegação do deck com a mesma prioridade.

### DES-PSI-09 · Alvo e esforço motor — nível A

Alvos maiores e próximos tendem a ser adquiridos mais rapidamente; no mobile, tamanho e espaçamento também reduzem toque acidental. A WCAG 2.2 exige alternativa simples ao arraste e define mínimo AA de 24 × 24 CSS px, com exceções. [Fitts, 1954](https://www2.psychology.uiowa.edu/faculty/mordkoff/infoproc/pdfs/Fitts%201954.pdf) e [W3C WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/).

Aplicação:

- meta interna de 44 × 44 px para controles;
- distância suficiente entre anterior, próximo e CTA;
- área clicável inclui toda a superfície visível do controle;
- swipe nunca é o único caminho;
- ação frequente fica alcançável sem cobrir conteúdo.

Evitar: ícone de 16 px como único alvo, setas encostadas e dock sobre controles/foco.

## 5. Fluência, familiaridade e estética

### DES-PSI-10 · Fluência e consistência — nível B

Facilidade de processamento influencia julgamento. Padrões consistentes reduzem reaprendizado, mas fluência também pode aumentar aceitação de uma afirmação fraca. [Alter & Oppenheimer, 2009](https://pubmed.ncbi.nlm.nih.gov/19638628/).

Aplicação:

- mesma nomenclatura, posição de labels e comportamento de controles;
- no máximo três papéis de card;
- um padrão de SectionIntro;
- frase concreta antes de metáfora;
- claims fáceis de ler continuam acompanhados por fonte e limite.

Evitar: trocar nomes do produto, reinventar interação por section ou usar simplicidade visual para sugerir certeza inexistente.

### DES-PSI-11 · Estética percebida — nível B

Pesquisas de HCI distinguem estética clássica — ordem, clareza e equilíbrio — de estética expressiva — criatividade e originalidade. Ambas podem contribuir para satisfação, mas não substituem usabilidade. [Lavie & Tractinsky, 2004](https://cris.bgu.ac.il/en/publications/assessing-dimensions-of-perceived-visual-aesthetics-of-web-sites-2/).

Aplicação:

- base clássica para leitura, oferta e controles;
- expressão concentrada em imagem, tipografia de destaque ou composição do método;
- originalidade não altera convenções de botão, foco e navegação;
- avaliar estética, confiança e compreensão como métricas diferentes.

Evitar: confundir “premium” com baixa legibilidade ou criar uma interação inédita para tarefa comum.

### DES-PSI-12 · Cor é contextual — nível B/C

Cor pode afetar julgamento e comportamento, mas os efeitos dependem de significado aprendido, cultura, tarefa e contexto. Não existe tabela universal “azul gera confiança, vermelho vende”. [Elliot & Maier, 2014](https://pubmed.ncbi.nlm.nih.gov/23808916/).

Aplicação:

- `#1E4DD1` funciona primeiro como identidade e contraste, não como gatilho psicológico;
- cores semânticas mantêm significado consistente;
- CTA se destaca por contraste e hierarquia, não por uma suposta cor mágica;
- sucesso e erro usam texto/ícone além da cor;
- testar contraste e reconhecimento antes de preferência estética.

Evitar: paleta baseada em infográfico de psicologia das cores ou adicionar vermelho para criar urgência artificial.

## 6. Persuasão, confiança e risco

### DES-PSI-13 · Prova social semelhante — nível B

Experimentos de campo encontraram que normas descritivas mais próximas do contexto do indivíduo podem influenciar comportamento mais que apelos genéricos. A transferência de toalhas de hotel para compra de treinamento é limitada. [Goldstein, Cialdini & Griskevicius, 2008](https://www.bulidomics.com/w/images/d/d4/A-room-with-a-view-point_goldstein-cialdini-griskevicius_2008.pdf).

Aplicação:

- um case de marca com contexto parecido vale mais que uma parede de logos;
- explicitar setor, estágio, problema, ação e limite;
- deixar claro se a prova é de cliente, operação Amplify ou aluno;
- sem contadores sociais até existirem fonte e recorte relevantes.

Evitar: “mais de X marcas” sem fonte ou sugerir que uma marca endossa o produto.

### DES-PSI-14 · Framing altera decisões — nível A/B

Apresentações diferentes dos mesmos fatos podem mudar preferências. Isso torna o framing poderoso e também perigoso. [Tversky & Kahneman, 1981](https://pubmed.ncbi.nlm.nih.gov/7455683/).

Aplicação:

- benefícios e custos usam números absolutos e condições completas;
- preço total permanece visível junto ao parcelamento;
- custo de inação é descrito como risco operacional plausível, não perda certa;
- garantia reduz incerteza explicando processo real;
- comparação “antes/depois” usa dimensões equivalentes.

Evitar: destacar parcela e esconder total, transformar GMV em renda, preço âncora fictício ou enquadrar não comprar como fracasso.

## 7. Motion como linguagem perceptiva

### DES-PSI-15 · Movimento cria agrupamento e causalidade — nível A/B

Elementos que se movem juntos tendem a ser percebidos como relacionados; mudanças visuais também capturam atenção. A aplicação deve explicar estado ou causa, não ocupar a atenção disponível.

Aplicação:

- card acompanha o gesto e retorna/avança de forma previsível;
- indicador e conteúdo mudam como um único evento;
- entrada curta pode sinalizar nova section, sem esconder o conteúdo;
- press/hover confirma ação;
- reduced motion preserva estado sem deslocamento.

Evitar: animações independentes em cada filho, parallax, autoplay e movimento contínuo próximo à copy.

## Matriz para os sete containers

| Container | Princípios prioritários | Decisão de design |
|---:|---|---|
| 01 · Hero | 02, 03, 04, 08, 10 | Um foco, baixa complexidade inicial, proposta familiar e um CTA. |
| 02 · Experiência | 01, 05, 06, 10 | Agrupar formato/pós-compra e tornar a experiência reconhecível. |
| 03 · Relevância/fit | 01, 06, 12, 14 | Comparação honesta, sem cor/medo como atalho. |
| 04 · Método | 01, 02, 05, 06, 09, 15 | Quatro chunks estáveis, controle por gesto e botão, motion causal. |
| 05 · Prova | 01, 02, 11, 13 | Case contextual em um grupo visual; estética apoia verificação. |
| 06 · Oferta | 01, 03, 08, 09, 14 | Preço, condição, garantia e CTA no mesmo contexto decisório. |
| 07 · FAQ | 03, 06, 07, 10 | Reconhecimento rápido, detalhe secundário e fechamento coerente. |

## Checklist de aplicação

Antes de aprovar um container:

- Qual elemento recebe a primeira atenção? Ele corresponde à pergunta?
- O espaçamento mostra corretamente o que pertence a quê?
- Há algo essencial que o usuário precisa lembrar de outra tela/slide?
- Quantas ações parecem primárias ao mesmo tempo?
- O movimento explica estado ou apenas decora?
- Cor está comunicando função ou tentando fabricar emoção?
- A prova é semelhante e verificável ou apenas prestigiosa?
- O framing apresenta total, condição e limite com simetria?
- A conclusão pode ser encontrada com touch, teclado, zoom e sem motion?
- A hipótese será medida por compreensão e qualidade da compra, não apenas clique?

## Mitos rejeitados

- “Azul gera confiança e vermelho converte.”
- “O cérebro só processa três coisas.”
- “Usuários sempre leem em padrão F.”
- “Sete é o número mágico para listas.”
- “Mais animação aumenta engajamento.”
- “Bonito é automaticamente usável.”
- “Urgência sempre aumenta decisão.”
- “Um CTA precisa estar em toda dobra.”
- “Gestalt é uma receita fixa de layout.”
- “Qualquer prova social é melhor que nenhuma.”

Essas frases transformam efeitos condicionais em certezas e não serão usadas como regra de produto.
