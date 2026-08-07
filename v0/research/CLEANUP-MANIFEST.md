# Manifesto da reorganização

Data: 2026-08-06.

## Preservado como legado

A implementação anterior foi movida para `_legacy/dc-v27/`:

- HTML do editor DC;
- `support.js`;
- CSS, JavaScript e bibliotecas vendor;
- testes e documentação antigos;
- bundle `_ds` e thumbnail.

Capturas, experimentos e arquivos que já estavam em `_archive/` foram isolados em `_legacy/archive-v27/`.

## Preservado para pesquisa

- ativos de marca, pessoas, logos e cases foram movidos para `v0/research/assets-candidates/`;
- 11 fotos brutas encontradas em `v0/Amplify-fotos` foram classificadas em `v0/research/assets-candidates/photos/amplify-events/`, sem renomear ou otimizar;
- referências visuais Amplify Marcas e Dixie foram movidas para `v0/research/references/visual/`;
- o briefing anexado foi copiado para `v0/research/inputs/landing-direction-source.txt`.

## Exclusões

Nenhum arquivo foi apagado definitivamente. A exclusão ampla dos previews não foi executada porque o workspace não possui Git e o ambiente não conseguiu garantir que todo o conteúdo era descartável. O isolamento em `_legacy/` deixa a raiz limpa e mantém recuperação integral.
