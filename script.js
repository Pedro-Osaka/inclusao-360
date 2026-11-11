/** Inclusão 360° — recursos locais, sem dependências de framework. */
(() => {
  'use strict';
  const KEY = 'inclusao360:preferencias:v1';
  const PROFILE_KEY = 'inclusao360:perfil:v2';
  const MIGRATION_KEY = 'inclusao360:migration:v41';
  const defaults = Object.freeze({ fontScale: 100, contrast: false, theme: 'light', lineHeight: 1.65, letterSpacing: 0, altfont: false, links: false, cursor: false, simple: false, distractions: false, reduceMotion: false });
  const simpleCopy = 'Cada pessoa usa a internet de um jeito. Aqui você pode aumentar as letras, ouvir o texto e mudar as cores. Escolha o que ajuda você.';
  const regularCopy = 'Acessibilidade digital significa oferecer diferentes caminhos para ler, compreender e interagir. Experimente ajustar este texto e descubra como uma pequena mudança pode fazer diferença.';
  const safeStored = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
  const stored = safeStored();
  const prefs = { ...defaults };
  try {
    if (!localStorage.getItem(MIGRATION_KEY)) {
      // The previous implementation of highlighted links could create visually noisy link backgrounds.
      // Keep all other preferences, but start link highlighting turned off after the update.
      if (stored && typeof stored === 'object' && stored.links === true) stored.links = false;
      localStorage.setItem(MIGRATION_KEY, 'done');
      localStorage.setItem(KEY, JSON.stringify(stored || {}));
    }
  } catch {}
  const allowedProfiles = ['default', 'reading', 'focus', 'keyboard'];
  let profileId = 'default';
  try { const item = localStorage.getItem(PROFILE_KEY); profileId = allowedProfiles.includes(item) ? item : (Object.keys(stored || {}).length ? 'custom' : 'default'); } catch {}
  for (const key of Object.keys(defaults)) {
    const candidate = stored && typeof stored === 'object' ? stored[key] : undefined;
    if (typeof candidate === typeof defaults[key]) prefs[key] = candidate;
  }
  prefs.fontScale = clamp(prefs.fontScale, 90, 150);
  prefs.lineHeight = clamp(prefs.lineHeight, 1.4, 2.2);
  prefs.letterSpacing = clamp(prefs.letterSpacing, 0, 2);
  if (!['light', 'dark'].includes(prefs.theme)) prefs.theme = 'light';

  const root = document.documentElement;
  const body = document.body;
  const dialog = document.getElementById('access-dialog');
  const announcer = document.getElementById('global-announcement');
  let announceTimer;
  let speech = null;
  let vlibrasScriptLoaded = false;
  let vlibrasScriptError = false;
  const profileDescriptions = { default: 'Experiência padrão selecionada.', reading: 'Leitura confortável: texto maior, espaçamento e links destacados.', focus: 'Foco e concentração: leitura simples, menos distrações e movimento reduzido.', keyboard: 'Navegação por teclado: links destacados e foco reforçado.', custom: 'Ajustes personalizados em uso.' };
  const profilePresets = { default: {}, reading: { fontScale: 120, lineHeight: 1.9, letterSpacing: 0.5, links: true }, focus: { simple: true, distractions: true, reduceMotion: true, lineHeight: 1.85 }, keyboard: { links: true } };
  const phrases = { welcome: 'A informação precisa chegar a todas as pessoas.', access: 'A acessibilidade digital cria mais possibilidades de participação.', rights: 'Todas as pessoas têm direito à informação e ao respeito.' };
  const scenarios = { text: { badTitle: 'Entenda seus direitos', badCopy: 'Informações importantes sobre acesso a serviços e oportunidades para você.', goodTitle: 'Entenda seus direitos', goodCopy: 'Informações importantes sobre acesso a serviços e oportunidades para você.', badExplain: 'Texto muito pequeno dificulta a leitura e obriga a ampliar a tela.', goodExplain: 'Texto maior, boa organização e espaçamento tornam a leitura mais confortável.', feedback: 'Comparando texto pequeno com tipografia confortável.', order: 1 }, contrast: { badTitle: 'Informação importante', badCopy: 'Conheça as informações necessárias para usar nossos serviços.', goodTitle: 'Informação importante', goodCopy: 'Conheça as informações necessárias para usar nossos serviços.', badExplain: 'O texto em tom claro fica difícil de distinguir do fundo.', goodExplain: 'A diferença entre as cores oferece melhor percepção das palavras.', feedback: 'Comparando contraste insuficiente com texto que se destaca do fundo.', order: 2 }, links: { badTitle: 'Encontre um serviço', badCopy: 'Veja os serviços disponíveis e escolha o mais adequado.', goodTitle: 'Encontre um serviço', goodCopy: 'Veja os serviços disponíveis e escolha o mais adequado.', badExplain: 'Um texto vago e sem indicação visual não deixa claro o destino do link.', goodExplain: 'Um rótulo descritivo e sublinhado deixa mais claro o que esperar.', feedback: 'Comparando orientação vaga com um link descritivo e identificável.', order: 3 } };
  let keyboardStarted = false;
  let keyboardStep = 0;
  let lastInteraction = 'pointer';

  function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value))); }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
      const label = document.getElementById('save-status');
      if (label) label.textContent = 'Preferências salvas neste navegador.';
    } catch {
      const label = document.getElementById('save-status');
      if (label) label.textContent = 'Ajustes aplicados; o navegador não permitiu salvá-los.';
    }
  }
  function announce(message) {
    if (!announcer) return;
    announcer.textContent = '';
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { announcer.textContent = message; }, 30);
  }
  function applyPreferences() {
    body.dataset.theme = prefs.theme;
    body.dataset.contrast = String(prefs.contrast);
    body.dataset.simple = String(prefs.simple);
    body.dataset.distractions = String(prefs.distractions);
    body.dataset.motion = prefs.reduceMotion ? 'reduce' : 'normal';
    body.dataset.links = String(prefs.links);
    body.dataset.altfont = String(prefs.altfont);
    body.dataset.cursor = prefs.cursor ? 'large' : 'normal';
    root.style.fontSize = `${16 * prefs.fontScale / 100}px`;
    root.style.setProperty('--reading-line', String(prefs.lineHeight));
    root.style.setProperty('--tracking', `${prefs.letterSpacing}px`);
    document.querySelectorAll('[data-setting]').forEach(input => {
      const key = input.dataset.setting;
      if (!(key in prefs)) return;
      if (input.type === 'checkbox') input.checked = Boolean(prefs[key]);
      else input.value = String(prefs[key]);
    });
    document.querySelectorAll('[data-theme-choice]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.themeChoice === prefs.theme)));
    document.querySelectorAll('[data-action="contrast"]').forEach(btn => btn.setAttribute('aria-pressed', String(prefs.contrast)));
    document.querySelectorAll('[data-action="dark"]').forEach(btn => btn.setAttribute('aria-pressed', String(prefs.theme === 'dark')));
    document.querySelectorAll('[data-action="simple"]').forEach(btn => btn.setAttribute('aria-pressed', String(prefs.simple)));
    document.querySelectorAll('[data-action="distractions"]').forEach(btn => btn.setAttribute('aria-pressed', String(prefs.distractions)));
    document.getElementById('font-value').textContent = `${prefs.fontScale}%`;
    document.getElementById('font-indicator').textContent = `${prefs.fontScale}%`;
    document.getElementById('line-value').textContent = `${prefs.lineHeight.toFixed(2).replace('.', ',')}×`;
    document.getElementById('letter-value').textContent = `${prefs.letterSpacing.toLocaleString('pt-BR')} px`;
    document.getElementById('sample-copy').textContent = prefs.simple ? simpleCopy : regularCopy;
    document.getElementById('clarity-example').textContent = prefs.simple
      ? '“Cada pessoa usa a internet de um jeito. Aqui você escolhe o que ajuda.”'
      : '“Acessibilidade digital significa oferecer diferentes caminhos para ler, compreender e interagir.”';
    document.getElementById('clarity-hint').textContent = prefs.simple
      ? 'Versão simplificada ativa. Volte a desativar para comparar.'
      : 'Ative “Leitura simplificada” acima para comparar.';
    body.dataset.profile = profileId;
    document.querySelectorAll('button[data-profile]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.profile === profileId)));
    const profileStatus = document.getElementById('profile-status');
    if (profileStatus) profileStatus.textContent = profileDescriptions[profileId] || profileDescriptions.custom;
  }
  function setPreference(name, value, description) {
    if (!(name in prefs)) return;
    prefs[name] = value;
    profileId = 'custom';
    try { localStorage.setItem(PROFILE_KEY, profileId); } catch {}
    applyPreferences();
    save();
    if (description) announce(description);
  }
  function resetPreferences() {
    Object.assign(prefs, defaults);
    profileId = 'default';
    try { localStorage.setItem(PROFILE_KEY, profileId); } catch {}
    applyPreferences();
    save();
    stopSpeech(false);
    announce('Todas as preferências foram restauradas para os padrões.');
  }

  function applyProfile(id) {
    if (!allowedProfiles.includes(id)) return;
    Object.assign(prefs, defaults, profilePresets[id]);
    profileId = id;
    try { localStorage.setItem(PROFILE_KEY, profileId); } catch {}
    applyPreferences();
    save();
    announce(profileDescriptions[id]);
  }
  function setScenario(id) {
    const item = scenarios[id];
    if (!item) return;
    const frame = document.querySelector('.comparison-frame');
    frame.dataset.scenario = id;
    const swap = (name, value) => document.getElementById(name).textContent = value;
    for (const side of ['bad', 'good']) {
      swap(`compare-${side}-title`, item[`${side}Title`]);
      swap(`compare-${side}-copy`, item[`${side}Copy`]);
      swap(`compare-${side}-explain`, item[`${side}Explain`]);
    }
    swap('compare-bad-link', id === 'links' ? 'Clique aqui' : 'Saiba mais');
    document.getElementById('compare-good-link').innerHTML = id === 'links' ? 'Ver serviços disponíveis <span aria-hidden="true">→</span>' : 'Saiba mais <span aria-hidden="true">→</span>';
    swap('comparison-counter', `Cenário ${item.order} de 3`);
    swap('comparison-feedback', item.feedback);
    document.querySelectorAll('button[data-scenario]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.scenario === id)));
  }
  function setPhrase(key) {
    if (!Object.hasOwn(phrases, key)) return;
    document.getElementById('libras-example').textContent = phrases[key];
    document.querySelectorAll('[data-libras-phrase]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.librasPhrase === key)));
    document.getElementById('libras-phrase-status').textContent = 'Frase alterada. Ative o VLibras e selecione o texto para traduzir.';
  }
  async function copyPhrase() {
    const phrase = document.getElementById('libras-example').textContent;
    const status = document.getElementById('libras-phrase-status');
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(phrase);
        status.textContent = 'Frase copiada para a área de transferência.';
        announce('Frase copiada.');
        return;
      } catch { /* Continue with manual selection instructions. */ }
    }
    const range = document.createRange();
    range.selectNodeContents(document.getElementById('libras-example'));
    const selection = window.getSelection();
    if (selection) { selection.removeAllRanges(); selection.addRange(range); }
    status.textContent = 'Texto selecionado. Use Ctrl+C para copiar ou o widget do VLibras para traduzir.';
  }
  function keyboardRender(message) {
    document.getElementById('keyboard-progress').setAttribute('aria-valuenow', String(keyboardStep));
    document.getElementById('keyboard-progress-fill').style.width = `${keyboardStep / 3 * 100}%`;
    document.getElementById('keyboard-progress-label').textContent = `${keyboardStep} de 3 etapas`;
    document.getElementById('keyboard-completion').textContent = keyboardStep === 3 ? 'Concluído ✓' : 'Em andamento';
    for (let i = 1; i <= 3; i++) {
      const check = document.getElementById(`step-check-${i}`);
      const checked = i <= keyboardStep;
      check.textContent = checked ? '✓' : '○';
      check.setAttribute('aria-label', checked ? 'Etapa concluída' : 'Etapa pendente');
    }
    if (message) document.getElementById('keyboard-feedback').textContent = message;
  }
  function startKeyboard() {
    keyboardStarted = true;
    keyboardStep = 0;
    document.querySelectorAll('input[name="keyboard-choice"]').forEach(input => input.checked = false);
    keyboardRender('Começou! Pressione Enter ou Espaço para ativar este primeiro botão.');
    document.getElementById('keyboard-first').focus({ preventScroll: false });
  }
  function advanceKeyboard(to) {
    if (!keyboardStarted || to !== keyboardStep + 1) return;
    keyboardStep = to;
    const message = to === 1 ? 'Etapa 1 concluída. Pressione Tab até uma opção e selecione-a com o teclado.' : to === 2 ? 'Etapa 2 concluída. Pressione Tab para chegar ao botão Concluir desafio.' : 'Parabéns! Você concluiu três interações usando apenas o teclado, sem usar o mouse.';
    keyboardRender(message);
    if (to === 3) announce('Desafio por teclado concluído.');
  }
  const colorPairs = { light: ['#a9b5c3', '#ffffff'], mid: ['#1ab5a4', '#ffffff'], strong: ['#102e4e', '#ffffff'] };
  function luminance(hex) {
    const parts = hex.slice(1).match(/.{2}/g).map(v => parseInt(v, 16) / 255).map(c => c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4));
    return .2126 * parts[0] + .7152 * parts[1] + .0722 * parts[2];
  }
  function contrastRatio(foreground, background) {
    const a = luminance(foreground), b = luminance(background);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  }
  function updateContrast(value) {
    const pair = colorPairs[value] || colorPairs.light;
    const ratio = contrastRatio(...pair);
    const passed = ratio >= 4.5;
    document.getElementById('contrast-ratio').textContent = `${ratio.toFixed(2).replace('.', ',')}:1`;
    document.getElementById('contrast-result').textContent = passed ? 'Atende ao nível AA para texto comum ✓' : 'Ainda não atende ao nível AA para texto comum';
    document.getElementById('contrast-explanation').textContent = passed ? 'Esta combinação ultrapassa a razão mínima de 4,5:1 para texto comum.' : 'Para texto comum, precisamos de pelo menos 4,5:1. Experimente uma cor mais escura.';
    document.getElementById('contrast-live').dataset.pass = String(passed);
    document.getElementById('contrast-hint').textContent = passed ? 'Boa escolha! Contraste calculado com a fórmula de luminância da WCAG.' : 'Continue experimentando: a cor mais bonita nem sempre é a mais legível.';
  }
  function openDialog() { if (!dialog.open) dialog.showModal(); }
  function closeDialog() { if (dialog.open) dialog.close(); }

  function setActiveTab(name, shouldFocus = false) {
    const tabs = [...document.querySelectorAll('[data-tab]')];
    if (!tabs.some(tab => tab.dataset.tab === name)) return;
    tabs.forEach(tab => {
      const active = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle('active', active);
      const panel = document.getElementById(`panel-${tab.dataset.tab}`);
      if (panel) panel.hidden = !active;
      if (active && shouldFocus) tab.focus();
    });
  }
  document.querySelector('[role="tablist"]').addEventListener('keydown', event => {
    const tabs = [...document.querySelectorAll('[data-tab]')];
    const index = tabs.indexOf(document.activeElement);
    if (index === -1) return;
    let next;
    if (['ArrowDown', 'ArrowRight'].includes(event.key)) next = (index + 1) % tabs.length;
    else if (['ArrowUp', 'ArrowLeft'].includes(event.key)) next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(tabs[next].dataset.tab, true);
  });

  const speechStatus = document.getElementById('speech-status');
  function updateSpeechStatus(status) { speechStatus.textContent = status; }
  function stopSpeech(shouldAnnounce = true) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    speech = null;
    updateSpeechStatus('Leitura interrompida.');
    if (shouldAnnounce) announce('Leitura em voz alta interrompida.');
  }
  function readAloud() {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      updateSpeechStatus('A leitura em voz alta não está disponível neste navegador.');
      announce('Este navegador não oferece síntese de voz.');
      return;
    }
    window.speechSynthesis.cancel();
    const text = `${document.getElementById('sample-title').textContent} ${document.getElementById('sample-copy').textContent}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR'; utterance.rate = .93; utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const brazilVoice = voices.find(v => v.lang.toLowerCase() === 'pt-br');
    if (brazilVoice) utterance.voice = brazilVoice;
    utterance.onstart = () => updateSpeechStatus('Lendo texto demonstrativo em voz alta.');
    utterance.onend = () => { if (speech === utterance) { speech = null; updateSpeechStatus('Leitura concluída.'); } };
    utterance.onerror = event => {
      if (event.error === 'canceled' || event.error === 'interrupted') return;
      updateSpeechStatus('Não foi possível reproduzir a voz neste dispositivo.');
      speech = null;
    };
    speech = utterance;
    window.speechSynthesis.speak(utterance);
    updateSpeechStatus('Preparando leitura. Use Pausar ou Parar quando desejar.');
    announce('Leitura em voz alta iniciada.');
  }
  function pauseSpeech() {
    if (!('speechSynthesis' in window) || !window.speechSynthesis.speaking) return updateSpeechStatus('Nenhuma leitura está em execução.');
    window.speechSynthesis.pause(); updateSpeechStatus('Leitura pausada.');
  }
  function resumeSpeech() {
    if (!('speechSynthesis' in window) || !window.speechSynthesis.paused) return updateSpeechStatus('Nenhuma leitura está pausada.');
    window.speechSynthesis.resume(); updateSpeechStatus('Leitura retomada.');
  }

  function updateVLibrasStatus() {
    const status = document.getElementById('vlibras-status');
    const nativeButton = getVLibrasButton();
    if (nativeButton) {
      status.textContent = 'Widget oficial disponível. Abra o botão flutuante do VLibras ou use “Abrir o VLibras”.';
    } else if (vlibrasScriptError) {
      status.textContent = 'Não foi possível carregar o VLibras. Verifique sua conexão e tente atualizar a página.';
    } else if (vlibrasScriptLoaded) {
      status.textContent = 'Script oficial carregado. Aguarde o botão flutuante do VLibras aparecer na página.';
    } else {
      status.textContent = 'Carregando o serviço oficial de Libras pela internet...';
    }
  }
  function getVLibrasButton() {
    // A API initBtn é descrita na documentação oficial (v7).
    const apiButton = window.VLibrasWidget?.initBtn;
    if (apiButton && typeof apiButton.click === 'function') return apiButton;
    // Compatibilidade com a estrutura de integração de versões anteriores.
    const legacyButton = document.querySelector('[vw-access-button]');
    return legacyButton && typeof legacyButton.click === 'function' ? legacyButton : null;
  }
  function openVLibras() {
    const button = getVLibrasButton();
    if (button) {
      button.click();
      announce('Comando enviado ao widget oficial do VLibras.');
    } else {
      document.getElementById('vlibras-status').textContent = vlibrasScriptError
        ? 'O serviço do VLibras está indisponível neste momento. Verifique a internet e recarregue a página.'
        : 'O VLibras ainda está inicializando. Use o botão oficial flutuante quando ele aparecer.';
      announce('O VLibras ainda não está disponível.');
    }
  }
  window.addEventListener('vlibras-script-loaded', () => { vlibrasScriptLoaded = true; updateVLibrasStatus(); });
  window.addEventListener('vlibras-script-error', () => { vlibrasScriptError = true; updateVLibrasStatus(); });
  let widgetChecks = 0;
  const widgetPoll = window.setInterval(() => {
    updateVLibrasStatus();
    if (getVLibrasButton() || ++widgetChecks >= 60) window.clearInterval(widgetPoll);
  }, 500);

  document.addEventListener('click', event => {
    const mobileLink = event.target.closest('.mobile-nav a');
    if (mobileLink) mobileLink.closest('details')?.removeAttribute('open');
    const profile = event.target.closest('button[data-profile]');
    if (profile) { applyProfile(profile.dataset.profile); return; }
    const scenario = event.target.closest('button[data-scenario]');
    if (scenario) { setScenario(scenario.dataset.scenario); return; }
    const phrase = event.target.closest('button[data-libras-phrase]');
    if (phrase) { setPhrase(phrase.dataset.librasPhrase); return; }
    const tab = event.target.closest('[data-tab]');
    if (tab) { setActiveTab(tab.dataset.tab); return; }
    const theme = event.target.closest('[data-theme-choice]');
    if (theme) { setPreference('theme', theme.dataset.themeChoice, `Tema ${theme.dataset.themeChoice === 'light' ? 'claro' : 'escuro'} ativado.`); return; }
    const button = event.target.closest('[data-action]');
    if (!button) return;
    switch (button.dataset.action) {
      case 'open-dialog': openDialog(); break;
      case 'close-dialog': closeDialog(); break;
      case 'font-up': setPreference('fontScale', clamp(prefs.fontScale + 10, 90, 150), 'Tamanho de texto atualizado.'); break;
      case 'font-down': setPreference('fontScale', clamp(prefs.fontScale - 10, 90, 150), 'Tamanho de texto atualizado.'); break;
      case 'contrast': setPreference('contrast', !prefs.contrast, `Alto contraste ${!prefs.contrast ? 'ativado' : 'desativado'}.`); break;
      case 'dark': setPreference('theme', prefs.theme === 'dark' ? 'light' : 'dark', `Tema ${prefs.theme === 'light' ? 'escuro' : 'claro'} ativado.`); break;
      case 'simple': setPreference('simple', !prefs.simple, `Leitura simplificada ${!prefs.simple ? 'ativada' : 'desativada'}.`); break;
      case 'distractions': setPreference('distractions', !prefs.distractions, `Redução de distrações ${!prefs.distractions ? 'ativada' : 'desativada'}.`); break;
      case 'reset': resetPreferences(); break;
      case 'read': readAloud(); break;
      case 'pause': pauseSpeech(); break;
      case 'resume': resumeSpeech(); break;
      case 'stop': stopSpeech(); break;
      case 'vlibras': openVLibras(); break;
      case 'copy-phrase': copyPhrase(); break;
      case 'start-keyboard': startKeyboard(); break;
    }
  });
  document.querySelectorAll('[data-setting]').forEach(input => {
    const handle = () => {
      const name = input.dataset.setting;
      const value = input.type === 'checkbox' ? input.checked : Number(input.value);
      setPreference(name, value);
    };
    input.addEventListener(input.type === 'range' ? 'input' : 'change', handle);
  });
  document.getElementById('all-resources').addEventListener('click', closeDialog);
  document.addEventListener('keydown', () => { lastInteraction = 'keyboard'; }, { capture: true });
  document.addEventListener('pointerdown', () => { lastInteraction = 'pointer'; }, { capture: true });
  document.getElementById('keyboard-first').addEventListener('click', event => {
    if (!keyboardStarted) return keyboardRender('Comece usando o botão Iniciar / reiniciar desafio.');
    if (event.detail !== 0) return keyboardRender('Este desafio conta ações feitas pelo teclado. Use Enter ou Espaço.');
    advanceKeyboard(1);
  });
  document.querySelectorAll('input[name="keyboard-choice"]').forEach(input => input.addEventListener('change', () => {
    if (!keyboardStarted) return keyboardRender('Comece usando o botão Iniciar / reiniciar desafio.');
    if (lastInteraction !== 'keyboard') return keyboardRender('Escolha uma opção usando o teclado para completar esta etapa.');
    if (keyboardStep === 1) advanceKeyboard(2);
  }));
  document.getElementById('keyboard-last').addEventListener('click', event => {
    if (!keyboardStarted) return keyboardRender('Comece usando o botão Iniciar / reiniciar desafio.');
    if (event.detail !== 0) return keyboardRender('Use Enter ou Espaço para finalizar pelo teclado.');
    if (keyboardStep < 2) return keyboardRender('Conclua as etapas anteriores primeiro.');
    advanceKeyboard(3);
  });
  document.querySelectorAll('input[name="contrast-demo"]').forEach(input => input.addEventListener('change', () => updateContrast(input.value)));
  updateContrast(document.querySelector('input[name="contrast-demo"]:checked').value);
  setScenario('text');
  document.addEventListener('keydown', event => {
    if (!event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey) return;
    const key = event.key.toLowerCase();
    if (!['a', 'l', 's'].includes(key)) return;
    event.preventDefault();
    if (key === 'a') dialog.open ? closeDialog() : openDialog();
    else if (key === 'l') { closeDialog(); document.getElementById('texto-demonstracao').focus(); announce('Foco no texto demonstrativo.'); }
    else stopSpeech();
  });
  document.getElementById('focus-test').addEventListener('click', () => {
    document.getElementById('focus-feedback').textContent = 'Controle ativado com sucesso. Agora use Tab para continuar.';
  });

  const form = document.getElementById('demo-form');
  const nameInput = document.getElementById('nome');
  const emailInput = document.getElementById('email');
  function showFieldError(input, errorId, message) {
    input.setAttribute('aria-invalid', 'true');
    document.getElementById(errorId).textContent = message;
  }
  function clearFieldError(input, errorId) {
    input.removeAttribute('aria-invalid');
    document.getElementById(errorId).textContent = '';
  }
  nameInput.addEventListener('input', () => clearFieldError(nameInput, 'nome-error'));
  emailInput.addEventListener('input', () => clearFieldError(emailInput, 'email-error'));
  form.addEventListener('submit', event => {
    event.preventDefault();
    clearFieldError(nameInput, 'nome-error'); clearFieldError(emailInput, 'email-error');
    let firstInvalid = null;
    if (nameInput.value.trim().length < 2) {
      showFieldError(nameInput, 'nome-error', 'Informe um nome com pelo menos dois caracteres.');
      firstInvalid = nameInput;
    }
    if (!emailInput.value.trim() || !emailInput.checkValidity()) {
      showFieldError(emailInput, 'email-error', 'Informe um endereço de e-mail válido.');
      firstInvalid ||= emailInput;
    }
    const result = document.getElementById('form-result');
    if (firstInvalid) { result.textContent = 'Verifique os campos sinalizados. Nenhum dado foi enviado.'; result.style.color = '#b84632'; firstInvalid.focus(); return; }
    const method = new FormData(form).get('contato') === 'audio' ? 'áudio' : 'texto';
    result.textContent = `Demonstração concluída! Preferência de comunicação: ${method}. Nenhum dado foi transmitido.`;
    result.style.color = 'var(--ink)';
    announce('Validação concluída com sucesso. Este formulário não envia dados.');
  });
  document.getElementById('current-year').textContent = new Date().getFullYear();
  applyPreferences();
  updateVLibrasStatus();
})();
