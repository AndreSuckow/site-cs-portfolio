# Verificação do portfólio atual

## Limpeza — 14/10/2026

Removidos 363 arquivos obsoletos (202,2 MB no projeto): atlas RPG e sua abertura, áudio e vídeo antigos, pôsteres e capas descartados, cópias de assets da captura da MarQ HR, casos de frontend não usados, scripts de importação/inspeção, testes de versões descartadas e evidências antigas.

A pasta `public/` e a publicação `dist/` têm 30 arquivos e 4,3 MB cada, antes 81,3 MB. Modelos do quarto, texturas, fontes, retrato, imagem da MarQ HR, currículo e formulário de e-mail continuam ativos. O DOCX original foi preservado em `documents/curriculo-original.docx`; DOCX e PDF foram comparados byte a byte com o backup.

Checagem de dependências: 32 arquivos de código/fontes inspecionados, 17 assets ativos encontrados, nenhuma dependência dos arquivos descartados e nenhum asset ativo ausente. A revisão automática rejeitou inicialmente a exclusão ampla. Após criação de backup, validação das dependências, exclusão dos assets ativos da lista e conferência de todos os arquivos no ZIP, a limpeza foi aprovada e executada.

Backup temporário fora do projeto: `C:/Users/andre/AppData/Local/Temp/siteCsPortfolio-cleanup-20261014-160850.zip`.

## Validação atual

- `npm run build`: passou; a pasta gerada é substituída para não manter arquivos removidos.
- `npm run check`: passou, com 67 referências locais e 5 modelos GLB válidos.
- `npm test`: 17 testes da versão atual passaram, cobrindo skills, contatos, WhatsApp, atributos, Continue/Game Over e download do PDF.
- `verify-contact.mjs`: validação no Chrome de disponibilidade, validação dos campos, falha/repetição e largura móvel. Respostas de envio simuladas; nenhum e-mail real foi enviado. Credenciais do Resend ainda precisam ser configuradas conforme EMAIL-SETUP.md.
- `verify-portfolio.mjs`: verificação da TV, navegação, tooltips por raycast, Hobbies, projetos, Game Over e reinício. Evidências novas em `tmp/portfolio-browser/`; formulário em `tmp/contact-browser/`.

Python complementar continua indisponível no ambiente WindowsApps. Verificações do projeto são as evidências executáveis mantidas.

## Revisão SNES e habilidades — 20/10/2026

- Console e controle físico SNES modelados localmente. Controles HTML em cinza, lilás e roxo seguem a posição dos botões da referência norte-americana.
- Árvore revisada com 4 habilidades de Onboarding e Implantação, 6 de Customer Success e 5 Complementares. Detalhes incluem implantação/treinamentos/Produto na Pilgrim’s e a experiência de frontend na GP Strategies. As cinco notas originais são preservadas e identificadas como autoavaliações.
- PDF de três páginas regenerado: acrescentado o total de mais de 300 empresas treinadas; todos os 81 parágrafos originais continuam presentes. As três páginas foram renderizadas e inspecionadas; dados e margens verificados pelo gerador.
- `npm test`: 17 testes passam. `npm run build` e `npm run check` passam, incluindo 95 referências locais.
- Verificação Chrome ampliada para X/Y, START, pausa via dialog, Escape, Despausar, restauração do foco e controles em celular horizontal. Capturas em `tmp/portfolio-browser/snes-*.png`.
- Auditoria complementar da skill frontend não executa: Python WindowsApps indisponível. Verificação funcional usa os comandos e o Chrome mantidos no projeto.

## Mapa da experiência — 20/10/2026

Descrição à esquerda e diorama WebGL ortográfico à direita. Três casinhas substituem os números; logos reais nas experiências anteriores e identificação “Sua companhia” na próxima. Duas bandeiras verdes e uma azul tremulam a partir de mastros fixados no terreno. O personagem 3D usa o retrato original e acompanha a seleção. Movimento reduzido congela bandeiras e personagem; a pausa mantém a cena atual.

Build, checagem de assets/sintaxe e os 18 testes passaram. Chrome validou as três seleções por teclado e os fluxos existentes sem exceções. Capturas inspecionadas em `tmp/portfolio-browser/career-map-marq.png`, `career-map-pilgrims.png` e `career-map-next.png`.

## Objetos pessoais do quarto — 20/10/2026

Bíblia no nicho com capa identificada e link NTLH; Pokéagenda aberta e quadro com ilustração original de família na mesa. Gaveta superior animada abre o caderno com 4 jogos riscados e 9 pendentes, em duas páginas. Controle SNES no assento da cadeira com cabo modelado até a porta do console; controle/cabo antigos do piso ocultos. As cinco adições à lista de jogos foram escolhidas entre títulos da seleção oficial SNES Classic da Nintendo.

Build, checagem de 96 referências e 19 testes passaram. Chrome confirmou o hover da Bíblia e clique real na gaveta pelo raycast, abertura e fechamento por Escape, listas e demais fluxos sem exceções. Capturas em `tmp/portfolio-browser/room-discoveries.png` e `games-notebook.png`.

## Caderno manuseável em 3D — 20/10/2026

O caderno usa geometria WebGL para capa, contracapa, páginas e espiral. O visitante pode segurá-lo e girá-lo com mouse/toque, aproximar, mover e reposicionar. A impressão preserva os jogos e as cores, com os zerados riscados no final. Lista HTML acessível e alternativa de carregamento mantidas. Não há rotação automática ou renderização contínua com o modal fechado.

Build, checagens e 19 testes passaram. Chrome verificou mudança dos pixels após arraste real de mouse e toque, botões sem arraste e retorno exato à posição original. Capturas de frente, girado e no celular inspecionadas em `tmp/portfolio-browser/games-notebook*.png`.

## Inspeção dos objetos pessoais — 20/10/2026

Bíblia, Pokédex e quadro da família compartilham o visualizador do caderno, com cópias dos modelos reais do quarto e controles de mouse, toque e teclado. O link NTLH aparece apenas na inspeção da Bíblia. O quadro foi recuado para x=.94 e virado 20° em direção à cadeira; a moldura e o suporte permanecem dentro dos limites do tampo.

Build, checagens e 20 testes passaram. Chrome verificou que cada modelo abre e gira de fato pelo mouse, alterna os controles e preserva o link correto. Capturas `inspect-bible.png`, `inspect-pokedex.png`, `inspect-family.png` e a posição do quadro na mesa foram inspecionadas em `tmp/portfolio-browser/`.

## Abertura da gaveta — 20/10/2026

Removido o botão “Explorar quarto”. O clique direto na gaveta inicia seu deslocamento (0,7 s), seguido do esmaecimento do entorno e da subida do caderno físico (0,38 s). O visualizador abre apenas no callback final da animação. Escape cancela a transição pendente; movimento reduzido evita a animação. Sombras são atualizadas durante o movimento.

Os 20 testes, build e check passaram. O Chrome acionou a gaveta por clique real no cenário e confirmou o modal fechado tanto no início quanto após a abertura física, antes da revelação do caderno; os fluxos de rotação, fechamento, desktop e celular continuaram passando. Captura em `tmp/portfolio-browser/drawer-opening.png`.

## Objetos clicáveis na cena — 20/10/2026

Bíblia, Pokédex, quadro e gaveta recebem o clique nas suas próprias geometrias, sem caixas invisíveis maiores que os objetos. Materiais individuais permitem realce âmbar sem iluminar outros móveis; os objetos sobem discretamente como as fitas e retornam ao sair do mouse. A gaveta mantém sua altura e animação de abertura. Removida a apresentação de painel ao focar as alternativas semânticas de teclado, que agora realçam os objetos físicos.

Build, check e 20 testes passaram. O teste Chrome passou a abrir os três objetos por mouse real, conferindo cursor, rotação e fechamento. Capturas de hover em `tmp/portfolio-browser/hover-*.png`.

## Discman na segunda gaveta — 20/10/2026

Modelo próprio de Discman com visor LCD, fones laranja e controles físicos. Segunda gaveta clicável com abertura antes da inspeção; cinco posições de playlist, mensagens de MP3 ausente e faixa reservada, reprodução pausada ao fechar. Pasta separada `public/audio/discman/`, sem gravações de terceiros incluídas. O servidor local reconhece tipos de áudio e JSON; a publicação versiona também os imports internos para evitar módulos antigos em cache.

22 testes cobrem as duas gavetas e estados de play/pause, falha e reserva. Verificação Chrome cobre clique na segunda gaveta, mudança de pixels do visor e tratamento de áudio ausente. Reprodução real da música depende do MP3 autorizado que ainda não foi fornecido.

## Navegação única e Tempo livre — 20/10/2026

O estado real do jogo controla a visibilidade do menu externo quando as abas da TV estão disponíveis. No 2D, o cabeçalho permanece fixo e a barra secundária foi removida, incluindo telas pequenas com navegação horizontal. “Hobbies” virou “Tempo livre” nos menus, título e HUD, preservando âncoras existentes. Família aparece primeiro, com o texto fornecido pelo usuário e ícone pixelado compartilhado.

Build, check e 23 testes passaram. Chrome percorreu as seis abas 3D sem menu externo duplicado e seis posições de scroll 2D com cabeçalho em y=0. Capturas desktop/mobile e TV foram inspecionadas: `fixed-menu-2d.png`, `cs-hobbies-3d.png`, `cs-hobbies-mobile.png`. Nenhuma exceção de execução.

## Abertura sempre em 3D — 20/10/2026

HTML inicia em 3D; preferências antigas de 2D são ignoradas na abertura. O botão altera o modo apenas durante a visita atual, sem sobrescrever som e CRT. Escolher 2D enquanto o motor carrega não é desfeito pela conclusão da carga. Falha de WebGL mantém o conteúdo legível.

Build com base do GitHub Pages, check e 25 testes passaram. Chrome foi iniciado com preferência antiga de 2D injetada em todas as navegações; abriu em 3D, permitiu a troca manual e voltou ao 3D após reiniciar no final. Fluxos anteriores continuaram passando sem exceções.

## Objetos suspensos no quarto — 20/10/2026

Removida a apresentação de painel da inspeção. Canvas transparente ocupa a tela sobre o quarto existente, com backdrop apenas desfocado. Câmera em perspectiva, luz hemisférica/direcionais, materiais de superfície e inclinação inicial mostram volume; enquadramento se adapta à largura da tela. Voltar e Escape restauram a cena. O botão da Bíblia, áudio do Discman e alternativas de teclado permanecem disponíveis.

Chrome verificou ausência de fundo e borda na camada, blur de 9 px, clique na geometria do Discman, rotação dos cinco objetos, restauração por fechamento e mobile. Capturas de caderno e Bíblia inspecionadas; nenhum erro de execução. Build/check e 25 testes passaram.

## Manipulação direta e zoom lateral — 20/10/2026

Removidos do HTML e do controlador os modos Girar/Mover e os botões de setas/Reposicionar. Arraste sempre gira. + e − ficam à direita, posicionados a partir dos limites projetados do objeto e contidos na tela; a câmera reserva espaço para eles. Link da Bíblia no mesmo conjunto lateral. CSS do portfólio agora recebe a versão do build na URL para evitar apresentação antiga em cache.

Build, check e 26 testes passaram. Chrome verificou ausência dos controles removidos, zoom por +/−, giro com mouse e toque, ações laterais dentro da tela, link correto da Bíblia e controles físicos do Discman. Capturas `inspect-bible.png` e `games-notebook-mobile.png` inspecionadas sem erros de execução.

## Projetos com seleção física das fitas — 20/10/2026

Projetos mantém a mesa aberta independentemente do progresso interno do scroll; Skills enquadra a TV de perto. A seção ativa passou a orientar a câmera. A inserção aguarda o enquadramento completo do console e termina antes do carregamento/aproximação. Ejetar retorna à mesa antes da animação física. Entrar novamente em Projetos limpa a aproximação anterior.

28 testes passaram, incluindo contratos de câmera em cinco posições de scroll, mobile e movimento reduzido, e a ordem de inserção, carregamento, aproximação e ejeção. Chrome clicou na fita real, acompanhou o carregamento, ejetou e encontrou a fita clicável novamente. Também verificou entrada por scroll. Capturas de seleção, inserção, detalhe, ejeção e Skills (`projects-cartridges.png`, `project-inserting.png`, `cs-project-3d.png`, `project-ejected.png`, `skills-close-up.png`) inspecionadas; nenhuma exceção de execução.
## Mapa vertical com caminhada por clique — 21/10/2026

Terreno em formato retangular vertical e casinhas distribuídas pela altura disponível. Hover destaca sem selecionar. Clique, toque ou Enter inicia percurso pela trilha durante dois segundos do relógio do jogo; o painel só muda na chegada. Novo destino parte da posição atual, e pausa congela o deslocamento. A dica do mouse é removida no clique e permanece oculta durante a caminhada.

Build com base do GitHub Pages, check e 32 testes passaram, incluindo percurso, continuidade ao mudar o destino, hover e momento da atualização do painel. Chrome confirmou clique real na Pilgrim’s, chegada após dois segundos e Enter até Sua companhia, sem exceções de execução. Capturas do mapa vertical e das chegadas foram inspecionadas. A repetição integral encontrou timeout de captura nos objetos; a verificação isolada do mapa sem screenshots passou após a correção final da dica. Testes de áudio usam fixture para não depender das escolhas de músicas locais.

## Discman D150 e inspeção mobile — 22/10/2026

Modelo fornecido pelo usuário carregado com o GLTFLoader existente, incluindo geometria, texturas e materiais PBR. Preservadas a carcaça clara e a tampa aberta do arquivo recebido. Normalização para a gaveta, cópia independente na inspeção, LCD animado sobre o visor e ações nas malhas de play, stop e troca de faixa. Stop pausa sem trocar a música. Crédito CC BY 4.0 visível na inspeção, em CREDITS.md e na licença original do modelo.

A verificação mobile encontrou a Pokédex sem margem inferior e os controles com deslocamento residual da animação. A câmera agora enquadra o volume de rotação com margem de 24 px, reservando espaço às ações. O posicionamento lateral considera a origem do canvas e é recalculado ao fim da abertura.

Build com base do GitHub Pages, check (incluindo dependências externas do glTF) e 33 testes passaram. Chrome verificou os cinco objetos em 844×390, 667×375 e 568×320: limites por pixels do WebGL, controles dentro da tela, ausência de overflow horizontal, giro com toque e retorno ao quarto. Também passou a rotação vertical/horizontal com cada objeto aberto. Teste isolado confirmou o LCD animado e o clique real no play do D150, sem exceções de execução. Capturas de Bíblia e Pokédex mobile inspecionadas. `verify-inspections-mobile.mjs` mantém essa cobertura; `inspection-layout.test.mjs` cobre o volume inteiro em paisagem, retrato e desktop.

