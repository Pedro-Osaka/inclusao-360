# Inclusão 360° — Versão 5.2 (mais simples)

O projeto demonstra acessibilidade digital com exemplos concretos e fáceis de entender. Esta versão foi organizada para que a pessoa não precise aprender uma interface complicada antes de experimentar.

## Como iniciar no Windows

1. Extraia o ZIP e abra a pasta `inclusao-360`.
2. Dê dois cliques em **`iniciar-site.bat`** (ou abra o PowerShell na pasta e digite `py -m http.server 8080`).
3. Abra **http://localhost:8080** no Chrome ou Edge.
4. Mantenha o terminal aberto. Para parar, pressione Ctrl+C.

**Ao atualizar uma versão antiga:** pare o servidor antigo, use uma pasta nova para evitar misturar arquivos, inicie a versão atual e recarregue com Ctrl+F5. Se preferências antigas alterarem o aspecto do site, clique em **Ajustar acessibilidade → Restaurar padrões**. Isso remove apenas as preferências do projeto naquele navegador.

## O caminho para quem visita

1. **Experimente:** três opções principais (texto maior, leitura em voz alta, VLibras). Um botão mostra dois exemplos adicionais (legendas e teclado).
2. **Desafio:** corrija com três cliques um portal fictício com texto ruim, contraste fraco e link impreciso.
3. **Libras:** selecione frases e experimente o **VLibras oficial**; depende de acesso à internet e do serviço externo.

O botão **Ajustar acessibilidade** fica sempre acessível no início da página e oferece controles para aumentar/diminuir texto, modos de cores, leitura simples, redução de distrações etc. Existe também um **modo de apresentação guiada em quatro etapas**.

Para não deixar o site confuso, outros recursos foram agrupados sob **Quer descobrir mais? → Mostrar mais recursos**. Continuam implementados: perfis, comparador, painel completo, desafios de teclado e contraste, formulário, análise educativa de HTML, progresso e informações sobre validação. Links diretos para essas seções abrem automaticamente o conteúdo extra.

## Estrutura

- `index.html`: estrutura do site e carregamento do widget VLibras oficial.
- `styles.css`, `script.js`: recursos anteriores.
- `v3.css`, `v3.js`: desafios, verificador, comparação e apresentação.
- `v4.css`, `v4.js`: navegação simples, layout refinado, agrupamento de extras e correções do rodapé/mobile.
- `assets/`: vídeo local MP4, legendas, poster e ícones.
- `ROTEIRO-APRESENTACAO.md`: roteiro rápido.
- `TESTES.md`: testes efetuados e limitações.
- `PUBLICAR-E-QR.md`: guia de publicação e QR Code.

## Privacidade, dependências e limitações

- Não há cadastro, banco de dados ou envio dos dados do formulário.
- Preferências de acessibilidade são salvas localmente quando o navegador permite. O resumo de experiências é temporário e local.
- A narração depende da API de voz e das vozes instaladas no navegador/sistema.
- O VLibras é **o widget oficial**, carregado de `https://vlibras.gov.br/app/vlibras-plugin.js`. Não é simulado; requer internet.
- O verificador de HTML cobre **quatro classes educativas de problemas**, sem substituir uma auditoria de conformidade.
- A plataforma ainda requer testes manuais com leitores de tela, em dispositivos reais e com participantes com deficiência. Não reivindicamos certificação WCAG.

Referências: [VLibras — documentação oficial](https://vlibras.gov.br/doc/widget/installation/webpageintegration.html) e [W3C — avaliação de acessibilidade](https://www.w3.org/WAI/test-evaluate/preliminary/).
