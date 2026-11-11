# Publicar o Inclusão 360° e compartilhar por QR Code

## Rodar apenas no computador da apresentação

Use `iniciar-site.bat` ou `py -m http.server 8080`, então abra `http://localhost:8080`. Este endereço serve **apenas no computador que está executando o servidor**. Não o transforme em QR Code para uma plateia acessar pelos próprios celulares.

## Publicar gratuitamente como site estático (GitHub Pages)

1. Crie um repositório no GitHub para o projeto (ex.: `inclusao-360`).
2. Envie **os arquivos da pasta `inclusao-360` para a raiz do repositório**. O arquivo `index.html` precisa estar na raiz, ao lado de `styles.css`, `script.js`, `v3.css`, `v3.js` e `assets/`.
3. Abra **Settings → Pages** no repositório e selecione a publicação por branch (`main`, `/root`), conforme as opções exibidas no GitHub.
4. Aguarde a disponibilização e **abra a URL HTTPS informada pelo GitHub**. O endereço costuma seguir o formato `https://usuario.github.io/inclusao-360/`, mas confirme o link verdadeiro.
5. Teste no Chrome e no celular: recursos locais, áudio, vídeo, contraste, missão, verificador e VLibras oficial com internet.

A URL pública permite criar um QR Code em ferramentas de sua preferência. Confira se o QR aponta para o endereço HTTPS **real** e teste a leitura em um celular diferente do seu antes da apresentação.

## Cuidados antes de tornar público

- Considere um aviso de privacidade claro, especialmente porque o VLibras é um serviço externo.
- Não publique nomes/e-mails reais inseridos durante demonstrações; o formulário atual não envia dados.
- Faça verificações com leitores de tela e pessoas com deficiência, além dos testes automáticos, antes de afirmar conformidade com WCAG 2.2.
- Evite compartilhar um link de desenvolvimento `localhost`, IP local ou QR gerado antes da hospedagem.
