# Arquitetura de motion

## Objetivo

O conteúdo e a conversão da landing nunca podem depender de uma animação para existir. Motion é uma camada progressiva: quando funciona, conduz a leitura; se uma biblioteca ou render atrasar, a página continua visível, rolável e comprável. As dependências do navegador são servidas localmente para remover CDN do caminho crítico.

## Ciclo real da página

```text
Template dentro de <x-dc>
        ↓
Runtime DC + React
        ↓
.landing-page renderizada fora de <x-dc>
ou, conforme o preview, dentro do próprio <x-dc>
        ↓
motions.js encontra a árvore renderizada
        ↓
Swiper inicializa [data-question-deck]
        ↓
ScrollReveal registra [data-motion]
        ↓
MutationObserver chama sr.sync() quando o DC adiciona conteúdo
```

O React preserva os nós estáveis, mas FAQ, listas editáveis e atualizações da plataforma podem inserir novos elementos. Por isso, registrar os elementos apenas uma vez no carregamento não é suficiente.

A descoberta prioriza uma `.landing-page` renderizada fora de `<x-dc>`. Quando esse clone não existe, aceita a árvore visível dentro do próprio `<x-dc>`, desde que os placeholders `{{ ... }}` já tenham sido resolvidos. Essa compatibilidade é obrigatória porque editor, preview local e publicação podem usar ciclos diferentes.

## Camadas

1. **Conteúdo base:** HTML e CSS completamente visíveis sem JavaScript de motion.
2. **Loader:** isolado do conteúdo e com destravamento independente após 3,6 segundos.
3. **Hero:** entrada coordenada por CSS usando `.hero-motion`; não é registrado no ScrollReveal para evitar disputa de `transform`.
4. **Deck de perguntas:** Swiper controla somente `.question-swiper` e seus slides. Uma demonstração única sugere o gesto; qualquer interação a cancela.
5. **Scroll:** blocos declaram `data-motion="rise|scale|top|left|right"`. ScrollReveal cuida somente desses alvos.
6. **Reconciliação DC:** `MutationObserver` chama `sr.sync()` para registrar conteúdo adicionado depois.
7. **Trilhos da jornada:** o wrapper recebe a entrada; cards internos permanecem visíveis. Scroll, teclado e `--rail-progress` atualizam a dica sem controlar o conteúdo.
8. **Capítulos:** o capítulo mais próximo da linha de leitura recebe `.is-journey-active`; esse estado produz apenas feedback visual.
9. **Dock contextual:** aparece depois do hero e sai sobre oferta, fechamento, modal e footer.
10. **Fail-open:** `opacity` base permanece em `1`; um observador verifica elementos na viewport. Se o estado quebrar, `sr.clean()` e `.motion-force-visible` liberam o alvo. Sem Swiper, o deck usa scroll-snap nativo.
11. **Interações:** modal, foco, tilt e botões magnéticos ficam isolados do sistema de revelação.

## Regras não negociáveis

- Nunca aplicar `visibility: hidden` globalmente em `.sr-reveal`.
- Nunca colocar `motion-pending` estaticamente no `<html>`.
- Nunca selecionar animações por classes legadas `u-*`.
- Nunca aplicar ScrollReveal no mesmo elemento controlado pelo hero/tilt.
- Nunca aplicar `transform` próprio em `.question-swiper`, `.swiper-wrapper` ou `.swiper-slide`; esses elementos pertencem ao Swiper.
- Nunca aplicar ScrollReveal individualmente em filhos de um trilho horizontal; revele somente o wrapper.
- Nunca usar autoplay contínuo no deck sem um controle visível de pausa.
- Todo novo bloco animado recebe `data-motion` no HTML.
- Alterações em CSS ou JavaScript sempre incrementam as duas versões de cache no HTML.
- `prefers-reduced-motion` reduz deslocamento, parallax e duração, interrompe faixas automáticas não essenciais e nunca deixa elementos presos.
- A criação do Swiper é isolada por `try/catch`; uma falha muda o deck para `data-deck-status="native"` e não interrompe modal, CTA ou ScrollReveal.
- Somente uma raiz DC visível fica ativa. Ao trocar de clone, listeners, Swiper, observers e registros do ScrollReveal são limpos antes da reinicialização.
- Toda mudança de layout roda o contrato antes da entrega.

## Como adicionar um efeito

```html
<article class="meu-card" data-motion="rise">...</article>
```

Tipos permitidos:

- `rise`: entrada vertical padrão;
- `scale`: entrada curta com escala;
- `top`: entrada a partir do topo;
- `left`: entrada lateral pela esquerda;
- `right`: entrada lateral pela direita.

Não adicione chamadas avulsas de `ScrollReveal().reveal()` dentro do template.

## Validação

```powershell
node tests/motion-contract.mjs
node tests/motion-browser-smoke.mjs --viewport=320
node tests/motion-browser-smoke.mjs --viewport=360
node tests/motion-browser-smoke.mjs --viewport=390
node tests/motion-browser-smoke.mjs --viewport=430
node tests/motion-browser-smoke.mjs --viewport=390 --reduced
node tests/motion-browser-smoke.mjs --viewport=390 --fallback
node tests/motion-browser-smoke.mjs --viewport=390 --swiper-fallback
node tests/motion-browser-smoke.mjs --viewport=390 --fallback --swiper-fallback
```

O primeiro teste verifica dependências locais, ordem dos scripts, versões de cache, sintaxe, tipos permitidos, sincronização dinâmica e regras que já causaram regressão. O smoke abre um Chrome real, percorre os trilhos até o fim, procura cards ocultos e textos truncados, valida os sete capítulos, as quatro decisões, o deck, o dock, o fechamento e o modal.
