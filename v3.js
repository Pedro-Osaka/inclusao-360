/** Inclusão 360° 3.0: atividades educativas e apresentação guiada.
 * Complementa script.js sem substituir as funções originais de acessibilidade. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const completed = { vision: false, hearing: false, motor: false, cognitive: false };
  const mission = { text: false, contrast: false, link: false };
  let previousInput = 'pointer';
  const tourSteps = [
    { target: 'na-pratica', title: '1. Experimente um recurso', desc: 'Clique em “Aumentar o texto” ou “Ouvir a frase”. A mudança acontece aqui mesmo.' },
    { target: 'missao', title: '2. Ajude a melhorar uma página', desc: 'Toque nos três botões para corrigir texto, cores e descrição de um link.' },
    { target: 'libras', title: '3. Conheça o intérprete virtual', desc: 'Escolha uma frase e teste o VLibras oficial. Para traduzir, é necessário ter internet.' },
    { target: 'mais', title: '4. Continue no seu ritmo', desc: 'Os recursos extras ficam guardados aqui. Você pode abrir quando quiser, sem complicação.' }
  ];  let tourIndex = 0;
  let startButton = null;

  document.addEventListener('keydown', () => { previousInput = 'keyboard'; }, true);
  document.addEventListener('pointerdown', () => { previousInput = 'pointer'; }, true);

  function setComplete(area) {
    if (!completed[area]) { completed[area] = true; updateJourney(); }
  }
  function updateJourney() {
    const total = Object.values(completed).filter(Boolean).length;
    byId('journey-bar').style.width = `${total * 25}%`;
    byId('journey-count').textContent = `${total} de 4 experiências concluídas`;
    for (const [name, done] of Object.entries(completed)) {
      const item = document.querySelector(`[data-journey="${name}"]`);
      if (!item) continue;
      item.dataset.done = String(done);
      item.querySelector('span').textContent = done ? '✓' : '○';
      item.querySelector('a').textContent = done ? 'Rever' : 'Experimentar';
    }
    byId('journey-summary-text').textContent = total === 0
      ? 'Cada recurso que você experimenta aparece aqui. Não registramos dados pessoais.'
      : total === 4
        ? 'Você experimentou quatro maneiras diferentes de tornar a navegação mais acessível. Isso é apenas o começo!'
        : `Você experimentou ${total} ${total === 1 ? 'área' : 'áreas'} de acessibilidade. Continue explorando no seu ritmo.`;
  }
  function setMission(key, value) {
    mission[key] = value;
    const btn = document.querySelector(`[data-fix="${key}"]`);
    btn.setAttribute('aria-pressed', String(value));
    btn.querySelector('.fix-check').textContent = value ? '✓' : '○';
    btn.querySelector('.fix-action').textContent = value ? 'Desfazer ↶' : 'Corrigir →';
    byId('mission-preview').classList.toggle(`fixed-${key}`, value);
    const count = Object.values(mission).filter(Boolean).length;
    byId('mission-count').textContent = `${count} de 3 melhorias feitas`;
    byId('mission-grade').textContent = count === 3 ? 'Mais fácil de usar ✓' : count === 0 ? 'Precisa melhorar' : 'Melhorando…';
    byId('mission-link').textContent = valueForLink();
    byId('mission-result').textContent = count === 3
      ? 'Parabéns! Você corrigiu as três barreiras deste exemplo. As mudanças podem ser vistas na prévia.'
      : count === 0 ? 'Cada correção muda a prévia de verdade. Comece pela primeira tarefa.'
      : `Você corrigiu ${count} de 3 problemas. Observe a mudança na prévia e continue.`;
  }
  function valueForLink() { return mission.link ? 'Ver informações da comunidade →' : 'Clique aqui'; }

  const badExample = `<h1>Inscreva-se</h1>\n<img src="foto.jpg">\n<input id="nome" placeholder="Seu nome">\n<a href="/servicos">Clique aqui</a>\n<h3>Como participar</h3>`;
  const goodExample = `<h1>Inscreva-se</h1>\n<img src="foto.jpg" alt="Pessoa preenchendo um cadastro">\n<label for="nome">Seu nome</label>\n<input id="nome">\n<a href="/servicos">Ver serviços disponíveis</a>\n<h2>Como participar</h2>`;
  const code = byId('analyzer-code');
  const presets = { broken: badExample, fixed: goodExample };
  function updateExample(value) { code.value = presets[value] || badExample; updatePreview(); byId('analyzer-count').textContent = 'Pronto para analisar.'; byId('analyzer-results').replaceChildren(listItem('Clique em “Verificar página” para conferir.')); }
  function listItem(message, positive = false) { const li = document.createElement('li'); li.textContent = message; if (positive) li.className = 'analyzer-ok'; return li; }
  function parser() { return new DOMParser().parseFromString(code.value, 'text/html'); }
  function updatePreview() {
    // A prévia usa apenas nós de texto e elementos criados localmente; nenhum HTML editável é executado.
    const doc = parser();
    const box = byId('analyzer-preview');
    box.replaceChildren();
    const title = document.createElement('strong'); title.textContent = doc.body.querySelector('h1,h2,h3')?.textContent || 'Página de exemplo'; box.append(title);
    if (doc.querySelector('img')) { const illustration = document.createElement('div'); illustration.className = 'example-image'; illustration.textContent = '▧  Imagem de exemplo'; box.append(illustration); }
    const labelText = doc.querySelector('label')?.textContent?.trim();
    const label = document.createElement('span'); label.className = 'example-field'; label.textContent = labelText || 'Campo sem rótulo visível'; box.append(label);
    const input = document.createElement('div'); input.className = 'example-input'; input.textContent = doc.querySelector('input')?.getAttribute('placeholder') || 'Campo de texto'; box.append(input);
    const link = document.createElement('span'); link.className = 'example-link'; link.textContent = doc.querySelector('a')?.textContent?.trim() || 'Sem link'; box.append(link);
  }
  function analyze() {
    const doc = parser();
    const issues = [];
    for (const img of doc.querySelectorAll('img:not([alt])')) issues.push('Imagem sem descrição: adicione alt com a informação importante da imagem.');
    for (const input of doc.querySelectorAll('input:not([type="hidden"]), select, textarea')) {
      if (['submit','button','reset','image'].includes(input.type)) continue;
      const id = input.getAttribute('id');
      const named = Boolean(input.getAttribute('aria-label')?.trim() || input.getAttribute('aria-labelledby')?.trim() || input.closest('label') || (id && [...doc.querySelectorAll('label[for]')].some(label => label.htmlFor === id)));
      if (!named) issues.push('Campo sem rótulo: associe um <label> ao campo ou forneça um nome acessível.');
    }
    for (const a of doc.querySelectorAll('a')) {
      const text = a.textContent.trim() || a.getAttribute('aria-label')?.trim() || a.querySelector('img[alt]')?.getAttribute('alt')?.trim() || '';
      if (!text) issues.push('Link sem nome: escreva para onde ele leva.');
      else if (/^(clique aqui|aqui|saiba mais|link)$/i.test(text)) issues.push('Link pouco claro: troque “Clique aqui” por algo como “Ver serviços disponíveis”.');
    }
    let previous = 0;
    for (const heading of doc.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
      const current = Number(heading.tagName[1]);
      if (previous && current > previous + 1) issues.push(`Ordem de títulos: depois do H${previous}, evite saltar diretamente para H${current}.`);
      previous = current;
    }
    const results = byId('analyzer-results'); results.replaceChildren();
    if (issues.length === 0) results.append(listItem('Nenhum dos quatro tipos de problema verificados foi encontrado. Ainda são necessários outros testes.', true));
    else issues.forEach(issue => results.append(listItem(issue)));
    byId('analyzer-count').textContent = issues.length === 0 ? '0 problemas detectados nestas verificações' : `${issues.length} ${issues.length === 1 ? 'problema identificado' : 'problemas identificados'}`;
  }

  function goToTourStep() {
    const info = tourSteps[tourIndex];
    byId('presenter-step-label').textContent = `ETAPA ${tourIndex + 1} / ${tourSteps.length}`;
    byId('presenter-title').textContent = info.title;
    byId('presenter-description').textContent = info.desc;
    byId('presenter-progress').firstElementChild.style.width = `${(tourIndex+1)/tourSteps.length*100}%`;
    byId('tour-prev').disabled = tourIndex === 0;
    byId('tour-next').textContent = tourIndex === tourSteps.length - 1 ? 'Concluir apresentação ✓' : 'Próxima etapa →';
    const target = byId(info.target);
    const heading = target?.querySelector('h2');
    target?.scrollIntoView({ behavior: 'auto', block: 'start' });
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  function endTour() { byId('presenter').hidden = true; document.body.classList.remove('tour-active'); startButton?.focus({preventScroll:true}); }
  function startTour(trigger) { startButton = trigger; tourIndex = 0; byId('presenter').hidden = false; document.body.classList.add('tour-active'); goToTourStep(); }

  const quickVideo = byId('quick-video');
  const transcriptTrack = () => quickVideo.textTracks && quickVideo.textTracks[0];
  const updateCaptions = value => {
    const track = transcriptTrack();
    if (track) track.mode = value ? 'showing' : 'disabled';
    const btn = document.querySelector('[data-action="quick-captions"]');
    btn.setAttribute('aria-pressed', String(value));
    btn.firstChild.textContent = value ? 'Desativar legendas ' : 'Ativar legendas ';
    byId('quick-caption-result').textContent = value ? 'Legendas ativadas. Dê play e acompanhe as palavras.' : 'Legendas desativadas. Ative novamente quando quiser.';
    if (value) setComplete('hearing');
  };
  byId('quick-keyboard').addEventListener('click', event => {
    const valid = previousInput === 'keyboard' && event.detail === 0;
    byId('quick-keyboard-result').textContent = valid
      ? 'Muito bem! Você ativou o botão usando o teclado.'
      : 'Agora tente com o teclado: Tab para chegar aqui, Enter para ativar.';
    if (valid) setComplete('motor');
  });
  const observer = new MutationObserver(() => { if (document.body.dataset.simple === 'true') setComplete('cognitive'); });
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-simple'] });
  document.addEventListener('click', event => {
    const fixer = event.target.closest('button[data-fix]');
    if (fixer) { const key = fixer.dataset.fix; setMission(key, !mission[key]); return; }
    const action = event.target.closest('[data-action]');
    if (!action) return;
    switch (action.dataset.action) {
      case 'quick-reading': {
        const on = action.getAttribute('aria-pressed') !== 'true';
        action.setAttribute('aria-pressed', String(on));
        action.firstChild.textContent = on ? 'Voltar ao texto original ' : 'Aumentar o texto ';
        byId('quick-reading-sample').classList.toggle('reading-enhanced', on);
        byId('quick-reading-result').textContent = on ? 'Percebeu? A letra ficou maior e o contraste mais nítido.' : 'Voltamos ao exemplo original.';
        if (on) setComplete('vision');
        break;
      }
      case 'quick-voice': {
        const status = byId('quick-voice-result');
        if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { status.textContent='Este navegador não oferece a leitura em voz alta.'; break; }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('A informação deve chegar a todas as pessoas.');
        utterance.lang = 'pt-BR'; utterance.rate = 0.91;
        const voice = window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase()==='pt-br');
        if (voice) utterance.voice = voice;
        utterance.onstart = () => { status.textContent = 'Lendo a frase em voz alta…'; };
        utterance.onend = () => { status.textContent = 'Leitura concluída. Você também pode ouvir outros textos.'; };
        utterance.onerror = e => { if (!['canceled', 'interrupted'].includes(e.error)) status.textContent='Não foi possível reproduzir a voz neste dispositivo.'; };
        window.speechSynthesis.speak(utterance);
        status.textContent = 'Preparando leitura no navegador…';
        break;
      }
      case 'stop': byId('quick-voice-result').textContent = 'Leitura interrompida.'; break;
      case 'quick-captions': updateCaptions(action.getAttribute('aria-pressed') !== 'true'); break;
      case 'reset-mission': for (const key of Object.keys(mission)) setMission(key, false); break;
      case 'analyze': analyze(); break;
      case 'start-tour': startTour(action); break;
      case 'tour-next': if (tourIndex === tourSteps.length-1) endTour(); else {tourIndex++; goToTourStep();} break;
      case 'tour-prev': if (tourIndex>0) {tourIndex--;goToTourStep();} break;
      case 'tour-close': endTour(); break;
      case 'download-summary': {
        const current = new Date().toLocaleDateString('pt-BR');
        const names = {vision:'Visão: texto maior',hearing:'Audição: legendas',motor:'Navegação: teclado',cognitive:'Clareza: leitura simplificada'};
        const lines = [ 'INCLUSÃO 360° — RESUMO DA VISITA', `Data: ${current}`, '', 'Experiências:', ...Object.entries(completed).map(([key,done])=>`${done?'[x]':'[ ]'} ${names[key]}`), '', `Missão: ${Object.values(mission).filter(Boolean).length} de 3 correções`, '', 'Resumo educativo, não é um laudo nem uma avaliação WCAG.', 'Nenhum dado pessoal foi enviado.' ];
        const blob = new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'});
        const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download='inclusao360-minha-experiencia.txt'; document.body.append(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),500); break;
      }
      case 'clear-progress': for (const key of Object.keys(completed)) completed[key]=false; updateJourney(); break;
    }
  });
  byId('analyzer-preset').addEventListener('change',e=>updateExample(e.target.value));
  code.addEventListener('input',()=>{updatePreview(); byId('analyzer-count').textContent='Código alterado. Faça outra verificação.';});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!byId('presenter').hidden) endTour();});
  updateExample('broken'); updateJourney();
})();
