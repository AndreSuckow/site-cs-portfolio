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