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
