# Estratégia de testes

Nenhuma ferramenta foi adicionada antes de existir comportamento para testar.

Preview local sem dependências:

```text
npm run preview
```

Prévia com abertura automática do navegador:

```text
preview.cmd
npm run preview:open
```

O acesso oficial é `http://127.0.0.1:4173`. A abertura direta de `index.html` por `file://` preserva o fallback estático, mas pode bloquear os ES Modules e, portanto, não valida motion ou interações.

Validação reproduzível do Hero em Edge headless:

```text
npm run check:js
npm run check:hero
```

`check:hero` captura 320, 360, 390, 430 e 1440 px, além do trilho fotográfico em 390 px, hover em 1440 px, drag em 430 px e páginas completas em 390/1440 px. Valida a pilha de cards reais, loop em JavaScript, velocidade, pausa/retomada com foco, hover, resize, visibilidade da página, entradas de seção sempre visíveis, drag nos dois sentidos, gesto vertical, teclado, ARIA, controles de 44 px, overflow, fallback sem JS e reduced motion.

Os 8 derivados WebP do trilho podem ser reproduzidos a partir dos originais autorizados:

```text
npm run assets:photo-rail
```

## Fundação

- validar caminhos de CSS e JavaScript;
- validar sintaxe JavaScript;
- verificar ausência de estilos e handlers inline;
- verificar que o HTML não importa arquivos do legado.

## Por container

- 320, 360, 390, 430 e 1440 px;
- teclado e foco visível;
- zoom de 200%;
- `prefers-reduced-motion`;
- JavaScript ligado e desligado;
- conteúdo longo e ausência de asset opcional;
- critério de compreensão definido no backlog.
