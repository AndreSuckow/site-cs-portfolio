# Direção visual do portfólio

O portfólio atual de André Luis Suckow apresenta Customer Success, onboarding, implantação, adoção e retenção. A assinatura é o quarto 3D com TV de tubo; a versão 2D mantém o mesmo conteúdo e os mesmos contatos.

## Fontes e tokens

`public/style.css` é a fonte canônica de cores, tipografia e espaçamento. Space Grotesk nos títulos, Inter na leitura e Pixelify Sans na TV e nos detalhes de jogo. Fontes locais em `public/_astro/`. Acento âmbar em `--amber-400`, painéis em `--ink-850`, contornos em `--ink-600`, tooltips em `--tv-navy` e texto em `--tv-paper`. `public/custom.css` estende esses tokens.

## Conteúdo e interação

Em Colaboração, Desenvolvimento aparece após Suporte remoto e descreve este portfólio como projeto pessoal feito com habilidades de frontend e apoio de IA, conforme solicitado por André.

Nome completo André Luis Suckow, Campo Largo–PR e foco exclusivo em CS nas telas profissionais. Sua companhia é convite da Fase 3, sem vínculo ou período fictício. Hobbies inclui fé em Cristo, Torre Forte Church Campo Largo, jogos online, futebol, academia e praia, conforme informações fornecidas pelo usuário.

Atributos abrem tooltips por mouse, teclado ou toque, com descrições em verbos de atuação. Contatos usam LinkedIn confirmado, e-mail por `mailto:` e WhatsApp com saudação no horário de São Paulo. O formulário usa FormSubmit diretamente no front e só confirma após resposta de aceite do serviço.

Game Over reutiliza `dialog` e a apresentação dos modais. Continue ocorre somente no fim; ao zero, oferece WhatsApp e reinício completo. Modais respeitam foco, Escape, dimensões móveis e suspensão do scroll 3D. Movimento reduzido permanece disponível.

## Fontes do projeto

A imagem inicial e o fundo 2D do novo quarto usam `public/img/room-new-wide.webp`, capturada com a câmera de abertura do cenário real. A prévia de baixa resolução vem da mesma captura. O modo clássico mantém sua imagem anterior, acompanhando `profile.json.roomVersion`.

**Novo Quarto 3D:** cenário original modelado em `public/new-room.js` a partir da referência enviada por André: duas camas, guarda-roupa com malas, piso de tacos, janela de madeira, escrivaninha, livros e colecionáveis. A câmera começa acima do quarto e desce com o scroll até o enquadramento anterior da TV, mantendo as coordenadas e interações do console. As superfícies estáticas são agrupadas por material e as texturas são geradas localmente. `profile.json.roomVersion` controla essa versão. `npm run room:previous` restaura o cenário anterior; `npm run room:new` reativa o novo. O checkpoint completo anterior está em `.checkpoints/antes-novo-quarto-3d.zip`.

`public/audio-controller.js` mantém um único contexto de áudio para a TV 3D e os controles HTML nos dois modos. Movimentação e seleção têm efeitos curtos; o botão de som permanece disponível em 2D e 3D e respeita a preferência salva de mudo. O áudio é retomado nas interações permitidas pelo navegador, sem acumular efeitos enquanto o contexto está suspenso.

Hobbies usa ícones originais de pixel art em laranja, no canto superior direito dos cards. `public/hobby-icons.js` compartilha os desenhos entre o canvas da TV e o HTML 2D. Os ciclos duram cinco segundos, sem iframe ou recursos externos, e permanecem estáticos com movimento reduzido.

No celular, o conteúdo da TV 3D exige posição horizontal. Na vertical, um aviso bloqueia a interação e só desaparece ao girar o aparelho; não oferece continuar na vertical ou mudar para 2D. A versão 2D escolhida antes dessa etapa continua disponível. A rotação via API só é tentada após toque, com tela cheia e orientação manual quando indisponível. Na horizontal, a câmera prioriza o conteúdo da TV, com controles nas laterais e cabeçalho compacto; desktop e abertura do quarto preservam o enquadramento habitual.

Contato 2D: introdução à esquerda e cartões à direita; no celular, uma coluna. Cada cartão tem somente duas colunas internas, para o marcador SLOT e o texto. A lista ocupa a largura disponível e o texto pode quebrar sem comprimir os cartões.

`profile.json` e `skill-details.json` alimentam `customize.cjs` e `cs-portfolio.cjs`. As fontes HTML e do motor ficam em `src/`; o build escreve em `public/` e gera `dist/`. O quarto original e seus modelos foram preservados. O atlas RPG, a abertura alternativa, as trilhas e os pôsteres daquela versão foram removidos.
