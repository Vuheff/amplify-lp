# Direcionamento de produto

Status: **proposto para aprovação no Gate R0**.

## Objetivo

Transformar um visitante curioso em comprador consciente. A página vende clareza para decidir e estruturar a entrada no TikTok Shop; não vende promessa de faturamento.

Em até 10 segundos no mobile, o lead deve entender:

1. o que é o produto;
2. para quem ele serve;
3. qual capacidade prática entrega;
4. qual é o próximo passo.

## Público primário

- dono, fundador ou gestor de e-commerce com catálogo próprio;
- decide ou influencia produto, margem, estoque, creators, conteúdo ou mídia;
- avalia o TikTok Shop ou começou sem processo claro;
- possui capacidade de executar testes após o conteúdo.

Estado de entrada: curioso com a oportunidade, inseguro sobre a operação, receoso de desperdiçar recursos e desconfiado de promessas fáceis.

Não é o público principal: quem procura serviço feito pela Amplify, garantia de faturamento, produto para vender ou acompanhamento individual que não exista na entrega.

## Promessa-base

> Organize sua entrada no TikTok Shop em quatro decisões práticas — Produto, Creators, Conteúdo e Escala — antes de comprometer estoque, equipe e mídia.

| Decisão | Pergunta operacional | Saída educacional |
|---|---|---|
| Produto | O que vale testar primeiro? | Critério para priorizar SKU e avaliar oferta/margem. |
| Creators | Quem pode distribuir com recorrência? | Critério para selecionar e ativar creators. |
| Conteúdo | Como transformar atenção em pedido? | Direção para vídeos e lives com função comercial. |
| Escala | O que merece mais verba? | Sinais e métricas para ampliar o que funciona. |

A promessa é de capacidade e critério. Não significa execução feita pela Amplify nem resultado financeiro garantido.

## Arquitetura narrativa aprovada como candidata

| # | Pergunta | Container |
|---:|---|---|
| 01 | Por que vale continuar? | Hero: produto, público, promessa, formato e CTA. |
| 02 | O que é e como acontece? | Experiência: modalidade, duração, acesso, materiais, suporte e pós-compra. |
| 03 | Como o método tira minha operação da dúvida? | Um mapa das quatro decisões. |
| 04 | O que custa entrar sem critério e isso serve para minha marca? | Dor/fit: risco operacional plausível, benefícios, pré-requisitos e desqualificação honesta. |
| 05 | Por que acreditar? | Case contextualizado, fonte, papel da Amplify e autoridade. |
| 06 | O que recebo e vale o compromisso? | Entregas, preço, condições, garantia e CTA. |
| 07 | O que ainda me impede de agir? | FAQ real, recapitulação e CTA final. |

Não haverá sections independentes para logos, mentor, “benefícios” ou currículo. Esses argumentos vivem dentro do container cuja pergunta ajudam a responder.

## North star e guardrails

Métrica principal: **compras únicas por sessão mobile elegível**. `begin_checkout` será proxy apenas enquanto a compra não puder ser observada.

Critério qualitativo anterior ao lançamento: pelo menos 4 de 5 pessoas do público explicam corretamente produto, público e ganho após observar somente o hero.

Guardrails:

- reembolso e chargeback;
- ativação do conteúdo;
- dúvidas causadas por expectativa incorreta;
- compreensão do formato e da oferta;
- acessibilidade e Core Web Vitals.

## Direção de experiência

- mobile-first a partir de 320 px;
- leitura editorial, hierarquia forte e espaço útil;
- uma cor de marca principal e cores semânticas;
- dois containers, um padrão de intro e no máximo três papéis de card;
- conteúdo estático completo antes de interação;
- deck com swipe e botões no Hero como demonstração aprovada; o Método aprofunda critérios e aplicação sem repetir os cards;
- FAQ com disclosure nativo;
- motion curta e funcional, nunca condição de visibilidade;
- desktop amplia a composição, sem criar outra narrativa.

## Não-objetivos

- reaproveitar runtime, HTML, CSS ou JavaScript do legado;
- gerar a landing inteira de uma vez;
- criar uma interação diferente em cada section;
- usar autoplay, loader, marquee ou parallax fora dos trilhos acessíveis e controláveis registrados nos `ADR-014`/`ADR-015`/`ADR-017`;
- usar urgência, escassez, marcas ou resultados sem evidência;
- esconder preço, condição ou restrição em modal/accordion;
- iniciar teste A/B antes de estabelecer mensagem e linha de base.

## Verdades comerciais que bloqueiam a UI final

| Tema | Decisão necessária | Estado |
|---|---|---|
| Nome | `Webinar TikTok Shop`. | Confirmado |
| Modalidade | Aula única gravada. | Confirmado |
| Experiência | 4 blocos, 29 temas e 12 meses de acesso; suporte e pós-compra ainda precisam de definição. | Parcial |
| Oferta | De R$ 1.632 por R$ 97 à vista; parcelamento ainda não definido. | Parcial |
| Garantia | 7 dias; processo de reembolso ainda precisa ser documentado. | Parcial |
| Checkout | URL, fornecedor e rastreamento de compra. | Pendente |
| Case | Nome, imagens e resultado autorizados pelo usuário; fonte, investimento e owner de revisão seguem pendentes. | Parcial |
| Marcas | Acervo e uso visual autorizados pelo usuário; registrar relação exata de cada marca antes da publicação. | Parcial |
| Instrutor | Matheus Kaze, ligado à operação da Amplify; função e credenciais completas ainda precisam de validação. | Parcial |
| Marca | SVG/wordmark, cor e fonte oficiais. | Pendente |

Claims pendentes não entram no skeleton como se fossem verdade.
