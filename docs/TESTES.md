# Verificações — Inclusão 360° 5.1

## Resultado da revisão

**27 de 27 verificações aprovadas** em Chromium com HTML, CSS e JavaScript carregados em uma página isolada. O ambiente de teste não permitiu abrir `localhost`; por isso, o teste interativo foi feito com os arquivos locais incorporados ao documento de teste.

Cobertura:

- navegação reorganizada em 3 passos e seção adicional inicialmente oculta;
- três demonstrações principais e abertura/fechamento dos dois exemplos opcionais;
- ação de aumentar texto, missão 3/3, tour em quatro etapas;
- abertura/fechamento dos extras, comparador e analisador preservados;
- links diretos para seções ocultas que expandem os recursos automaticamente;
- rodapé redesenhado com links mais distinguíveis;
- menu no celular (abrir e fechar após selecionar);
- sem overflow horizontal em 320, 375, 390, 768, 1024 e 1440 pixels;
- sem overflow horizontal com aumento do texto por controles do site em 320 px;
- nenhuma exceção de JavaScript nos fluxos avaliados.

Os testes acima **não constituem aprovação WCAG**. Ainda precisam de testes no navegador/HTTP real (incluindo persistência de preferências), desempenho em dispositivos diferentes, avaliação da experiência por pessoas com deficiência, leitores de tela, VLibras conectado pela internet, voz e vídeo em hardware real.

## Como verificar manualmente

1. Abra o site e confira o cabeçalho com os links: Início, Experimentar, Desafio, Libras.
2. Teste texto maior e leitura em voz alta; abra os dois exemplos extras.
3. Complete as três correções na Missão.
4. Abra **Ajustar acessibilidade**, teste contraste, leitura simples e restaurar padrões.
5. Abra **Mostrar mais recursos**; confira comparador, perfis, análise e teclado.
6. Ative **Destacar links** e confira que o rodapé continua legível.
7. Teste `Tab` / `Shift+Tab` / `Enter` / `Escape` e aumente a fonte até 150%.
8. Com internet, teste o botão e as traduções do VLibras oficial.


## Revisão 5.2: botões e contraste

Removida a regra de CSS que sobrescrevia as cores dos botões. Verificação visual e de estilos computados do botão "Testar envio" com fundos azul-escuro e modos de acessibilidade.
