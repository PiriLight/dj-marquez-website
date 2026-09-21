# Booking e vídeo — validação local

Data: 21/09/2026. Base: `main`, checkpoint `f981d5635fce5181def94d2e71eb9527c0a2ac47`.
Sem commit, push ou deploy nesta ronda. Sem novas dependências.

## Booking

- Modal nativo, quatro grupos, um CTA principal na secção. O atalho no Hero passa a chamar-se “Booking” e mantém navegação para a secção.
- Campos mínimos: evento, data futura/hoje, cidade, nome e pelo menos telefone ou email.
- WhatsApp oficial confirmado pelo utilizador: `351913235224`, com override `VITE_BOOKING_WHATSAPP`.
- `VITE_BOOKING_EMAIL` vazio de propósito. Botão secundário indisponível até existir endereço oficial; geração de `mailto:` com assunto/corpo coberta por teste.
- Abertura, labels, mensagens de erro, foco no primeiro erro, Escape e devolução do foco ao CTA verificados no browser. Sem armazenamento persistente nem backend.
- Submissão de teste com dados fictícios: `window.open` intercetado temporariamente no browser, destino/encoding/feedback confirmados; nenhum pedido real enviado. Simulação removida por reload.
- Cinco testes Node: dados mínimos, dados inválidos, grupos/data, encoding WhatsApp e assunto/corpo email.

## YouTube: diagnóstico e resultado

- ID real `5Jwva63JP8g`, título “M4rquez-Ramboya”. Metadados obtidos com `yt-dlp --skip-download --dump-json`: público, `playable_in_embed: true`, sem restrição etária, 255 segundos. Nenhum vídeo descarregado.
- Pedido ao embed com HTTP 200 e `Referer: http://127.0.0.1:5173/`. Sem sandbox ou CSP local a bloquear o player. API e widget oficial também responderam 200.
- A versão anterior dependia de `iframe.onLoad`, que não confirma reprodução, e de um timeout de oito segundos. O iframe inicialmente ficou em `about:blank` no browser de QA; o fallback retirava a thumbnail.
- Uma comparação posterior com a URL anterior também reproduziu (`readyState=4`, tempo >28s). Portanto, não ficou demonstrado um URL incorreto nem uma restrição permanente do vídeo. A causa externa daquela primeira falha transitória não foi isolada.
- O host padrão `youtube.com/embed` também foi comparado num iframe temporário: `paused=false`, `readyState=4`, tempo >67s. Foi mantido `youtube-nocookie.com` na implementação. Os iframes de diagnóstico foram removidos por reload.
- Abertura direta do embed noutra tab, sem Referer da página, apresentou erro 153. Este resultado não foi atribuído ao embed do site, cujo Referer estava presente.
- Solução: API oficial carregada por clique, `enablejsapi`, `origin`, `playsinline`, host nocookie, referrer explícito, eventos de reprodução/erro/autoplay bloqueado e timeout. A thumbnail só sai quando chega `PLAYING`; mantém-se num erro ou bloqueio de rede.
- Reprodução real confirmada em sessões limpas e a 390px: vídeo HTML interno com `paused=false`, `readyState=4`, tempo a avançar e imagem visível (854×480).
- Bloqueio de rede da API simulado via DevTools: estado `api-unavailable`, thumbnail carregada, ligação correta “Ver no YouTube”. Regra removida no fim. Preview 16:9; playback mínimo de 200px de altura respeita o mínimo da API em ecrãs estreitos.

Referências técnicas: [IFrame API](https://developers.google.com/youtube/iframe_api_reference), [identificação do cliente/Referer](https://developers.google.com/youtube/terms/required-minimum-functionality#embedded-player-api-client-identity).

## Hero e desempenho

- `muted`, `playsInline`, autoplay, preload auto e poster. Reprodução automática confirmada no Chromium do browser de QA.
- Movimento reduzido: vídeo parado e início manual confirmado. Rejeição `NotAllowedError` simulada: poster/botão presentes e reprodução após clique. Simulação removida por reload.
- Sem retries em cada pause/scroll/touch. Pausa fora do viewport e em tab oculta.
- Hero existente: H.264/yuv420p, 784×464, 14,9s, 3 012 357 bytes, sem áudio. Poster existente ~52KB. Ficheiros não recodificados.
- API/iframe YouTube ausentes antes de clicar. Galeria continua a montar vídeo apenas quando aberto; vídeo dos eventos continua com a carga diferida existente. Galeria/eventos não foram alterados.
- As proporções reservadas evitam saltos de layout do preview. Não foram medidos Core Web Vitals em produção, nem feita auditoria Lighthouse sob rede móvel real.

Compatibilidade consultada: [Chrome autoplay](https://developer.chrome.com/blog/autoplay), [WebKit/iOS vídeo inline](https://webkit.org/blog/6784/new-video-policies-for-ios/).

## Limites e âmbito

- Homepage e modal medidos a 320, 360, 375, 390, 430, 1280 e 1440px: sem overflow horizontal, sem headings cortados. Formulário inspecionado visualmente em mobile e desktop.
- Browser disponível: Chromium/Chrome 153 integrado no Codex, Windows. Larguras móveis são emulação; Chrome Android e Safari/iOS físicos não estavam disponíveis.
- O envio final depende da aplicação WhatsApp/email do visitante. A incorporação continua sujeita à rede, políticas do browser e disponibilidade/restrições futuras do YouTube.
- Preservados ordem da homepage, About, Gallery, Arquivo, eventos, administração, Supabase e autenticação.
- Build e `git diff --check` passaram; cinco testes Node passaram. Sem novos erros da aplicação no teste final (o log histórico continha um erro de HMR durante a edição, já corrigido).

## Ficheiros desta ronda

- `src/sections/Booking.jsx`, `src/components/BookingForm.jsx`, `src/utils/booking.js`: ficha e mensagens.
- `src/sections/Activity.jsx`, `src/components/YouTubePlayer.jsx`, `src/utils/youtubeApi.js`: player e fallback.
- `src/sections/Hero.jsx`, `src/hooks/useAutoplayVideo.js`: autoplay, poster e controlo manual.
- `src/config/site.js`, `.env.example`: contactos oficiais/configuração.
- `src/styles/global.css`: ficha e estados dos vídeos.
- `tests/booking.test.js`, `README.md`, este relatório: validação e documentação.
