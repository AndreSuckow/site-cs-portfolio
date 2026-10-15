# Envio de mensagens com FormSubmit

O formulário envia diretamente para **andre.suckow.dev@gmail.com** usando FormSubmit AJAX. Não precisa de conta Resend, chave de API, variáveis de ambiente ou backend. Funciona também na hospedagem estática.

1. Abra o site pelo servidor local ou pela URL publicada (não por file://).
2. Envie uma mensagem sua pelo formulário.
3. Se o FormSubmit solicitar ativação, abra seu Gmail, confira também spam e clique no link de confirmação. Como esse e-mail já era usado, a ativação pode já estar válida.
4. Envie novamente e confirme o recebimento. A resposta de aceite do serviço não comprova chegada na caixa de entrada.

O visitante permanece na página; erros preservam o texto e permitem tentar novamente. O e-mail informado serve para responder ao visitante. O campo invisível filtra bots. Cliques simultâneos são bloqueados; em caso de timeout, verifique o Gmail antes de reenviar pois a tentativa anterior pode ter sido processada.

Documentação: [FormSubmit](https://formsubmit.co/) e [AJAX](https://formsubmit.co/ajax-documentation).
