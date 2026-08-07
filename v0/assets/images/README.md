# Imagens de produção

Esta pasta contém os originais autorizados do acervo Amplify e os derivados web aprovados em `web/`. Originais não são sobrescritos.

Para migrar de `research/assets-candidates/`, o ativo precisa ter:

- autorização e relação com o produto documentadas;
- nome semântico em kebab-case;
- dimensões adequadas ao uso;
- versão WebP/AVIF quando trouxer ganho real;
- largura e altura reservadas no HTML;
- texto alternativo definido pelo contexto;
- orçamento de peso registrado.

Logos e cases não entram apenas por já existirem no workspace.

## Trilho fotográfico do Hero

- 8 arquivos `photo-rail-*.webp`, 480 × 640 px;
- aproximadamente 171 KB no total;
- regeneração reproduzível com `npm run assets:photo-rail`;
- grupo principal possui dimensões reservadas e lazy loading; a duplicata visual usa as mesmas URLs e fica fora da árvore acessível.
