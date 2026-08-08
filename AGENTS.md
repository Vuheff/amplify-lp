# Instruções permanentes do projeto

Escopo: todo o repositório.

## Antes de alterar

1. Ler `README.md`, `docs/DIRECTION.md`, `docs/BACKLOG.md`, `docs/ARCHITECTURE.md` e `docs/WORKFLOW.md`.
2. Confirmar o gate atual e o único item de backlog autorizado.
3. Não restaurar código legado ou ativos brutos removidos do histórico do Git.

## Regras de execução

- A fundação estática pode evoluir; não criar conteúdo comercial ou container final enquanto as verdades correspondentes de G0 estiverem pendentes.
- Não trabalhar em mais de um container por tarefa.
- Não iniciar o próximo container antes da aprovação do atual.
- Não inventar copy comercial, preço, garantia, suporte, credencial ou claim.
- Não adicionar dependência sem ADR com problema, alternativa nativa, custo e fallback.
- HTML é a fonte do conteúdo; JavaScript apenas aprimora comportamento.
- `public/` é a única raiz publicada; documentação e testes permanecem fora dela.
- Não duplicar preço, acesso, garantia, prova ou URL de checkout.
- Não colocar CSS de componente em `main.css`; cada componente aprovado recebe arquivo próprio.
- Não ocultar conteúdo essencial para executar reveal.
- ScrollReveal 4.0.9 é a única biblioteca de motion aprovada e fica restrita às entradas declaradas com `data-motion`, conforme `ADR-030`. Não usar Swiper, loader, marquee ou parallax. As exceções de autoplay são os trilhos fotográfico, promocional e de marcas aprovados nos `ADR-014`/`ADR-015`/`ADR-017`/`ADR-018`/`ADR-019`. O trilho fotográfico mantém pausa explícita e hover; por escolha explícita do usuário, os trilhos promocional e de marcas iniciam automaticamente, não dependem de controle visual e continuam em `prefers-reduced-motion`.
- Toda interação por arraste precisa de alternativa por botão e teclado.
- Motion deve respeitar reduced motion e funcionar como melhoria progressiva. Entradas de seção seguem a coreografia do `ADR-034`: no perfil reduzido, deslocamentos ficam limitados a 20 px e zoom a 0,98, sempre uma vez e com conteúdo legível; componentes contínuos mantêm seus contratos próprios.
- Se um arquivo atingir o budget, separar responsabilidade antes de acrescentar código.

## Entrega obrigatória

- validar os viewports e estados descritos no ticket;
- executar validações de HTML, CSS, JavaScript e testes proporcionais ao comportamento existente;
- atualizar backlog e ADR se uma decisão mudar;
- relatar arquivos alterados, validação realizada e pendências reais.
