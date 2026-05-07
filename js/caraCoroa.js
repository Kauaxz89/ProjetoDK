/* ───────────────────────────────────────────────────────────────
   cara_coroa.js — Lógica do jogo Cara ou Coroa
   Animação: moeda sobe em arco girando e pousa mostrando o resultado
─────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Estado ── */
  let scoreWin  = 0;
  let scoreLose = 0;
  let locked    = false;

  /* ── Elementos ── */
  const coinArc     = document.getElementById('coin-arc');
  const coin        = document.getElementById('coin');
  const coinSymbol  = document.getElementById('coin-symbol');
  const coinText    = document.getElementById('coin-text');
  const banner      = document.getElementById('result-banner');
  const iaStatus    = document.getElementById('ia-status');
  const numWin      = document.getElementById('score-win');
  const numLose     = document.getElementById('score-lose');
  const historyList = document.getElementById('history-list');
  const btnCara     = document.getElementById('btn-cara');
  const btnCoroa    = document.getElementById('btn-coroa');

  /* ── Conteúdo de cada face ── */
  const FACES = {
    cara:  { symbol: '🧑', text: 'CARA',  cls: 'show-cara'  },
    coroa: { symbol: '👑', text: 'COROA', cls: 'show-coroa' }
  };

  /* ── Sorteia resultado ── */
  function sortear() {
    var sorteio = Math.round(Math.random()); // gera 0 (cara) ou 1 (coroa)
    return sorteio === 0 ? 'cara' : 'coroa';
  }

  /* ── Atualiza visual da moeda para uma face ── */
  function setFace(lado) {
    coin.classList.remove('show-cara', 'show-coroa');
    coin.classList.add(FACES[lado].cls);
    coinSymbol.textContent = FACES[lado].symbol;
    coinText.textContent   = FACES[lado].text;
  }

  /* ── Trava / destrava botões ── */
  function setBtns(disabled) {
    btnCara.disabled  = disabled;
    btnCoroa.disabled = disabled;
  }

  /* ── Flash no placar ── */
  function flashScore(el, cls) {
    el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, 600);
  }

  /* ── Histórico ── */
  function addHistory(escolha, resultado, acertou) {
    const item = document.createElement('div');
    item.className = 'history-item ' + (acertou ? 'win' : 'lose');

    const icons = { cara: '🧑', coroa: '👑' };
    item.innerHTML =
      '<span class="h-plays">' + icons[escolha] + ' → ' + icons[resultado] + '</span>' +
      '<span class="h-result">' + (acertou ? 'Acertou' : 'Errou') + '</span>';

    historyList.prepend(item);
    while (historyList.children.length > 20) historyList.removeChild(historyList.lastChild);
  }

  /* ── Animação de giro alternando faces ── */
  function startSpinInterval() {
    var faces = ['cara', 'coroa'];
    var i = 0;
    return setInterval(function () {
      i = 1 - i;
      setFace(faces[i]);
    }, 120);
  }

  /* ── Jogada principal ── */
  function play(escolha) {
    if (locked) return;
    locked = true;
    setBtns(true);

    /* Destaca botão */
    btnCara.classList.remove('selected');
    btnCoroa.classList.remove('selected');
    document.getElementById('btn-' + escolha).classList.add('selected');

    /* Limpa resultado anterior */
    banner.className   = 'result-banner empty';
    banner.textContent = '—';
    iaStatus.textContent = 'Jogando...';

    /* Inicia spin visual */
    coin.classList.add('spinning');
    var spinInterval = startSpinInterval();

    /* Dispara animação de arco */
    coinArc.classList.remove('throwing');
    void coinArc.offsetWidth; /* reflow */
    coinArc.classList.add('throwing');

    /* Após 1.4s (duração do arco), para e mostra resultado */
    setTimeout(function () {
      /* Para o spin */
      clearInterval(spinInterval);
      coin.classList.remove('spinning');

      var resultado = sortear();
      setFace(resultado);
      iaStatus.textContent = '';

      /* Pequeno delay para a moeda "pousar" antes de mostrar resultado */
      setTimeout(function () {
        var acertou = (escolha === resultado);

        if (acertou) {
          scoreWin++;
          numWin.textContent = scoreWin;
          flashScore(numWin, 'win-flash');
          banner.textContent = 'Você acertou! 🎉';
          banner.className   = 'result-banner win';
        } else {
          scoreLose++;
          numLose.textContent = scoreLose;
          flashScore(numLose, 'lose-flash');
          banner.textContent = 'Você errou!';
          banner.className   = 'result-banner lose';
        }

        addHistory(escolha, resultado, acertou);
        setBtns(false);
        locked = false;
      }, 200);

    }, 1400);
  }

  /* ── Reset ── */
  function resetGame() {
    scoreWin = scoreLose = 0;
    numWin.textContent    = '0';
    numLose.textContent   = '0';
    banner.className      = 'result-banner empty';
    banner.textContent    = '—';
    iaStatus.textContent  = '';
    historyList.innerHTML = '';
    coinArc.classList.remove('throwing');
    coin.classList.remove('spinning');
    setFace('cara');
    setBtns(false);
    locked = false;
    btnCara.classList.remove('selected');
    btnCoroa.classList.remove('selected');
  }

  window.play      = play;
  window.resetGame = resetGame;

})();