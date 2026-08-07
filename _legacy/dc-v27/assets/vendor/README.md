# Dependências locais

Estes arquivos ficam no projeto para que a landing renderize mesmo quando uma CDN estiver lenta ou indisponível.

| Arquivo | Pacote | Versão | Licença | Origem de atualização |
|---|---|---:|---|---|
| `react.production.min.js` | React | 18.3.1 | MIT | `unpkg.com/react@18.3.1/umd/react.production.min.js` |
| `react-dom.production.min.js` | ReactDOM | 18.3.1 | MIT | `unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js` |
| `scrollreveal.min.js` | ScrollReveal | 4.0.9 | MIT | `unpkg.com/scrollreveal@4.0.9/dist/scrollreveal.min.js` |
| `swiper-bundle.min.js` | Swiper | 14.0.7 | MIT | `cdn.jsdelivr.net/npm/swiper@14.0.7/swiper-bundle.min.js` |
| `swiper-bundle.min.css` | Swiper | 14.0.7 | MIT | `cdn.jsdelivr.net/npm/swiper@14.0.7/swiper-bundle.min.css` |

Ao atualizar uma biblioteca, substitua os arquivos JavaScript e CSS em conjunto, rode os testes da landing e incremente a versão de cache no HTML.
