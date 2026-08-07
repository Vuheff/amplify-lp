# Componentes CSS

Um componente só entra nesta pasta quando nasce de um container ou comportamento aprovado.

## Convenção

- um arquivo por componente: `conversion-cta.css`, `decision-deck.css`;
- classe raiz com prefixo `.c-`;
- filhos usam nomes explícitos, sem depender da profundidade do DOM;
- estados usam `aria-*` ou `data-state`, não classes visuais duplicadas;
- componente não redefine tokens, reset ou objetos de layout;
- ideal até 120 linhas; limite de 180;
- o import entra em `main.css` somente quando o arquivo existir.

Exemplo de forma, não de implementação:

```css
.c-component {}
.c-component__title {}
.c-component[data-state="active"] {}
```
