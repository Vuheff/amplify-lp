# Estudo: psicologia comportamental ética

Status: **princípios aprováveis; efeitos serão tratados como hipóteses, não garantias**.

Este documento define persuasão e limites éticos. A tradução detalhada para hierarquia, agrupamento, memória, cor, motion e controles está em [`DESIGN-PSYCHOLOGY.md`](DESIGN-PSYCHOLOGY.md).

## Posição

Psicologia não será usada para pressionar, esconder informação ou retirar autonomia. O objetivo é tornar uma decisão complexa mais compreensível, verificável e segura.

> Persuasão aceitável aumenta clareza e agência. Manipulação reduz clareza ou agência para obter o clique.

## Módulos comportamentais

| ID | Princípio | Aplicação permitida | Limite ético | Como avaliar |
|---|---|---|---|---|
| PSI-01 | Fluência de processamento | Frases concretas, termos consistentes, hierarquia previsível e contraste legível. | Facilidade visual não pode fazer claim fraco parecer verdadeiro. | Teste de compreensão e recordação. |
| PSI-02 | Relevância/autorreconhecimento | Descrever público, momento operacional e pré-requisitos reais. | Não explorar insegurança pessoal nem sugerir inadequação social. | Identificação correta de “serve/não serve”. |
| PSI-03 | Segmentação e carga cognitiva | Uma pergunta por container; quatro decisões em partes controláveis. | Interação não pode ocultar informação essencial. | Recordação da sequência e erros de navegação. |
| PSI-04 | Concretude e simulação mental | Mostrar formato, pós-compra e aplicação de cada bloco. | Não simular experiência ou suporte inexistente. | Usuário explica o que acontece depois de pagar. |
| PSI-05 | Arquitetura de escolha | Uma ação primária e comparação clara entre comprar/não comprar agora. | Sem opção pré-selecionada, confirmshaming ou saída escondida. | Decisão correta, não apenas mais cliques. |
| PSI-06 | Prova social contextual | Case semelhante, verificável e com contexto/limites. | Sem logos ambíguos, contadores falsos ou resultado atípico como expectativa. | Compreensão de autoria e condições do resultado. |
| PSI-07 | Autoridade verificável | Função, experiência relevante, participação no case e fonte. | Cargo e credencial não substituem evidência. | Usuário consegue explicar por que a pessoa é competente. |
| PSI-08 | Redução de risco | Preço total, garantia, restrições, suporte e próximo passo visíveis. | Sem esconder custo ou criar ansiedade para depois “aliviar”. | Menos dúvidas, estornos e expectativa incorreta. |
| PSI-09 | Progresso e fechamento | Estado real `1 de 4` dentro do deck e conclusão clara. | Nunca conceder progresso artificial ou usar barra falsa para prender atenção. | Conclusão do deck com compreensão. |
| PSI-10 | Controle e agência | Swipe opcional, botões, teclado, pausa e movimento reduzido. | Sem autoplay que force ritmo ou motion que bloqueie conteúdo. | Tarefa concluída por touch, teclado e sem JS. |

A literatura de fluência mostra que a facilidade percebida de processamento influencia julgamentos; por isso ela exige cuidado especial com veracidade. [Alter & Oppenheimer, 2009](https://pubmed.ncbi.nlm.nih.gov/19638628/). Experimentos de segmentação em aprendizagem multimídia sustentam dividir material complexo em partes controláveis, mas a transferência para conversão é uma hipótese a testar, não uma causalidade estabelecida. [Moreno, 2007](https://doi.org/10.1002/acp.1348).

O estudo clássico de escolha limitada encontrou contextos em que mais opções reduziram decisão e satisfação; não autoriza a regra simplista de que “menos sempre vende mais”. A aplicação aqui é apenas remover CTAs e ofertas concorrentes sem valor. [Iyengar & Lepper, 2000](https://pubmed.ncbi.nlm.nih.gov/11138768/).

O efeito de progresso dotado aumentou persistência em programas de fidelidade, mas usar avanço artificial na landing seria enganoso. Só mostraremos progresso realmente percorrido pelo visitante. [Nunes & Drèze, 2006](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=991962).

## Aplicação nas sete perguntas

| Container | Módulos dominantes | Função psicológica |
|---:|---|---|
| 01 · Hero | PSI-01, PSI-02, PSI-05 | Orientar, gerar relevância e eliminar competição de ações. |
| 02 · Experiência | PSI-04, PSI-08 | Transformar o abstrato em uma experiência previsível. |
| 03 · Relevância/fit | PSI-02, PSI-08 | Permitir identificação e desqualificação sem pressão. |
| 04 · Método | PSI-03, PSI-09, PSI-10 | Dividir complexidade e dar controle sobre a exploração. |
| 05 · Prova | PSI-06, PSI-07 | Trocar afirmação por evidência contextualizada. |
| 06 · Oferta | PSI-05, PSI-08 | Tornar custo, valor, risco e ação comparáveis. |
| 07 · FAQ | PSI-01, PSI-08, PSI-10 | Resolver incerteza residual sem esconder condição essencial. |

## Guardrail contra dark patterns

A FTC descreve dark patterns como interfaces que obscurecem, subvertem ou prejudicam escolha e decisão. Seu relatório cita anúncios disfarçados, termos/taxas enterrados, cancelamento difícil e coleta enganosa de dados. Fonte: [FTC — Bringing Dark Patterns to Light](https://www.ftc.gov/reports/bringing-dark-patterns-light).

Portanto, ficam proibidos:

- urgência ou escassez sem fato auditável;
- timer que reinicia;
- preço “de” não praticado;
- custo, restrição ou garantia escondidos;
- botão de recusa humilhante;
- opção pré-marcada;
- CTA com destino diferente do rótulo;
- testemunho inventado ou relação de marca ambígua;
- conteúdo essencial invisível até motion ou gesto;
- obstáculo para cancelar, pedir reembolso ou rejeitar cookies;
- falsa personalização, falso progresso ou falso “ao vivo”.

No Brasil, a oferta precisa ser clara e sustentada. O [CDC](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm) proíbe publicidade enganosa inclusive por omissão, e o [Decreto 7.962/2013](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm) exige condições e restrições facilmente visíveis.

## Protocolo de validação

Nenhum princípio entra porque “é um gatilho famoso”. Para ser usado, precisa declarar:

1. qual dúvida humana resolve;
2. qual comportamento observável se espera;
3. qual dano pode causar;
4. qual condição de transparência o limita;
5. como compreensão, compra, reembolso e expectativa serão medidos.

Uma alteração é rejeitada se aumentar clique enquanto piora compreensão, autonomia, reembolso, chargeback ou confiança.
