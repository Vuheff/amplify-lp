# Stack e módulos

Status: **arquitetura ativa em HTML, CSS e JavaScript modular**.

## Stack atual

- HTML5 semântico;
- CSS nativo com cascade layers;
- JavaScript nativo em ES Modules;
- zero dependências de runtime;
- hospedagem estática independente de fornecedor.

A recomendação anterior de Next/v0 foi substituída pelo ADR-007 após o pedido explícito de trabalhar com HTML, CSS e JavaScript. O runtime DC também não participa da nova aplicação.

## Por que começar sem framework

- a página possui uma única rota e conteúdo majoritariamente estático;
- HTML continua disponível sem hidratação;
- o deck e o FAQ podem ser melhorias locais;
- reduz bundle, superfície de falha e acoplamento;
- a organização por camadas impede o retorno a um CSS monolítico;
- uma biblioteca futura ainda pode ser adotada quando existir um problema verificável.

Isso não significa “JavaScript solto”. O entrypoint apenas inicializa módulos isolados e cada módulo controla uma raiz específica.

## Matriz de adoção

| Problema | Primeira escolha | Candidato futuro | Gatilho para adotar | Rejeitado agora |
|---|---|---|---|---|
| Layout | Grid/Flexbox e objetos CSS | — | Nativo cobre o requisito | Framework CSS completo |
| Tokens | Custom properties | Style Dictionary | Mais de uma aplicação consumidora | Hexadecimais por componente |
| Deck | Scroll-snap + módulo local | Embla | Teste demonstrar falha do nativo | Swiper |
| FAQ | `details/summary` | Módulo local acessível | Requisito de estado não atendido | Plugin genérico |
| Motion | Transições CSS | Motion One | Coordenação/estado complexo comprovado | ScrollReveal e GSAP |
| Estado | Estado local no módulo | — | Apenas se surgir estado realmente compartilhado | Redux/Zustand |
| Conteúdo | HTML e fonte única documentada | JSON validado | Atualização externa/automática | CMS prematuro |
| Build | Nenhum inicialmente | Vite | Minificação, hashing ou módulos crescerem | Toolchain antes da necessidade |
| Teste | Validação estática/manual | Playwright + axe | Primeiro componente interativo | Snapshot como único QA |
| Analytics | Adaptador isolado | Provedor a decidir | KPI, consentimento e checkout aprovados | Pixels inline |

## Organização CSS

```text
settings → generic → elements → objects → components → utilities
```

O entrypoint `main.css` só orquestra imports. Cada componente aprovado recebe um arquivo próprio e permanece dentro do budget.

## Organização JavaScript

```text
main.js
├── core/       # infraestrutura pequena e independente da landing
└── modules/    # um comportamento por arquivo
```

Regras:

- módulos exportam inicializador explícito;
- hooks usam `data-js`;
- estado usa ARIA ou `data-state`;
- nenhum conteúdo é inserido apenas por JavaScript;
- nenhuma consulta global quando existe raiz local;
- ausência/falha do módulo preserva leitura e CTA.

## Bibliotecas

Nenhuma biblioteca foi adicionada. Uma adoção futura precisa registrar:

1. problema real;
2. alternativa nativa testada;
3. peso e custo de manutenção;
4. impacto de acessibilidade;
5. fallback sem JavaScript;
6. critério de remoção.

## Skills instaladas

- `web-design-guidelines` continua útil para auditoria da UI futura;
- `react-best-practices` e `composition-patterns` permanecem instaladas, mas não se aplicam enquanto o projeto não usa React.

Nenhuma skill justifica introduzir React sem uma nova decisão do produto.
