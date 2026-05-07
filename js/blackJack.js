/* ───────────────────────────────────────────────────────────────
   blackjack.js — Lógica do jogo Blackjack
   Regras implementadas:
     - Baralho de 52 cartas embaralhado com Fisher-Yates
     - Dealer para em 17 ou mais (regra padrão)
     - Ás vale 11 ou 1 (ajuste automático)
     - Blackjack natural (21 com 2 cartas) detectado
     - Histórico das últimas 20 rodadas
─────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Constantes ── */
  const NAIPES = ['♠', '♥', '♦', '♣'];
  const VALORES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const VERMELHO = ['♥', '♦'];

  /* ── Estado ── */
  let baralho      = [];
  let maoJogador   = [];
  let maoDealer    = [];
  let emJogo       = false;
  let scoreWin     = 0;
  let scoreLose    = 0;
  let scoreDraw    = 0;

  /* ── Elementos do DOM ── */
  const dealerCardsEl  = document.getElementById('dealer-cards');
  const playerCardsEl  = document.getElementById('player-cards');
  const dealerValueEl  = document.getElementById('dealer-value');
  const playerValueEl  = document.getElementById('player-value');
  const resultBanner   = document.getElementById('result-banner');
  const historyList    = document.getElementById('history-list');
  const btnDeal        = document.getElementById('btn-deal');
  const btnHit         = document.getElementById('btn-hit');
  const btnStand       = document.getElementById('btn-stand');
  const numWin         = document.getElementById('score-win');
  const numLose        = document.getElementById('score-lose');
  const numDraw        = document.getElementById('score-draw');

  /* ── Cria baralho e embaralha (Fisher-Yates) ── */
  function criarBaralho() {
    var cartas = [];
    for (var n = 0; n < NAIPES.length; n++) {
      for (var v = 0; v < VALORES.length; v++) {
        cartas.push({ valor: VALORES[v], naipe: NAIPES[n] });
      }
    }
    /* Fisher-Yates shuffle */
    for (var i = cartas.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = cartas[i];
      cartas[i] = cartas[j];
      cartas[j] = temp;
    }
    return cartas;
  }

  /* ── Valor numérico de uma carta ── */
  function valorCarta(carta) {
    if (carta.valor === 'A') return 11;
    if (['J', 'Q', 'K'].indexOf(carta.valor) !== -1) return 10;
    return parseInt(carta.valor);
  }

  /* ── Calcula total da mão (ajusta Ás de 11→1 se necessário) ── */
  function calcularMao(mao) {
    var total = 0;
    var ases  = 0;

    for (var i = 0; i < mao.length; i++) {
      total += valorCarta(mao[i]);
      if (mao[i].valor === 'A') ases++;
    }

    /* Reduz Ás de 11 para 1 enquanto estoura */
    while (total > 21 && ases > 0) {
      total -= 10;
      ases--;
    }

    return total;
  }

  /* ── Verifica Blackjack natural (21 com exatamente 2 cartas) ── */
  function isBlackjack(mao) {
    return mao.length === 2 && calcularMao(mao) === 21;
  }

  /* ── Compra carta do topo do baralho ── */
  function comprarCarta() {
    if (baralho.length === 0) baralho = criarBaralho();
    return baralho.pop();
  }

  /* ── Renderiza uma carta no container ── */
  function renderCarta(carta, container, oculta) {
    var el = document.createElement('div');

    if (oculta) {
      el.className = 'card hidden';
      el.id = 'carta-oculta';
      var pattern = document.createElement('div');
      pattern.className = 'card-back-pattern';
      el.appendChild(pattern);
      container.appendChild(el);
      return;
    }

    var cor = VERMELHO.indexOf(carta.naipe) !== -1 ? 'red' : 'black';
    el.className = 'card ' + cor;

    /* Canto superior */
    var topCorner = document.createElement('div');
    topCorner.className = 'card-corner';
    topCorner.innerHTML =
      '<span class="card-rank">' + carta.valor + '</span>' +
      '<span class="card-suit">' + carta.naipe + '</span>';

    /* Símbolo central */
    var center = document.createElement('div');
    center.className = 'card-center';
    center.textContent = carta.naipe;

    /* Canto inferior (invertido) */
    var botCorner = document.createElement('div');
    botCorner.className = 'card-corner';
    botCorner.style.transform = 'rotate(180deg)';
    botCorner.innerHTML =
      '<span class="card-rank">' + carta.valor + '</span>' +
      '<span class="card-suit">' + carta.naipe + '</span>';

    el.appendChild(topCorner);
    el.appendChild(center);
    el.appendChild(botCorner);
    container.appendChild(el);
  }

  /* ── Revela a carta oculta do dealer ── */
  function revelarCartaOculta() {
    var oculta = document.getElementById('carta-oculta');
    if (!oculta) return;

    /* Cria carta revelada com animação */
    var carta = maoDealer[1]; /* segunda carta é a oculta */
    var cor = VERMELHO.indexOf(carta.naipe) !== -1 ? 'red' : 'black';

    oculta.className = 'card ' + cor;
    oculta.id = '';
    oculta.innerHTML = '';

    var topCorner = document.createElement('div');
    topCorner.className = 'card-corner';
    topCorner.innerHTML =
      '<span class="card-rank">' + carta.valor + '</span>' +
      '<span class="card-suit">' + carta.naipe + '</span>';

    var center = document.createElement('div');
    center.className = 'card-center';
    center.textContent = carta.naipe;

    var botCorner = document.createElement('div');
    botCorner.className = 'card-corner';
    botCorner.style.transform = 'rotate(180deg)';
    botCorner.innerHTML =
      '<span class="card-rank">' + carta.valor + '</span>' +
      '<span class="card-suit">' + carta.naipe + '</span>';

    oculta.appendChild(topCorner);
    oculta.appendChild(center);
    oculta.appendChild(botCorner);
  }

  /* ── Atualiza display do valor da mão ── */
  function atualizarValores(mostrarDealer) {
    var totalJogador = calcularMao(maoJogador);
    playerValueEl.textContent = totalJogador;
    playerValueEl.className   = 'hand-value' + (totalJogador > 21 ? ' bust' : '');

    if (mostrarDealer) {
      var totalDealer = calcularMao(maoDealer);
      dealerValueEl.textContent = totalDealer;
      dealerValueEl.className   = 'hand-value' + (totalDealer > 21 ? ' bust' : '');
    } else {
      /* Mostra apenas o valor da carta visível */
      dealerValueEl.textContent = valorCarta(maoDealer[0]);
      dealerValueEl.className   = 'hand-value';
    }
  }

  /* ── Flash no placar ── */
  function flashScore(el, cls) {
    el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, 600);
  }

  /* ── Define resultado e atualiza placar ── */
  function definirResultado(tipo, msg) {
    resultBanner.textContent = msg;
    resultBanner.className   = 'result-banner ' + tipo;

    if (tipo === 'win' || tipo === 'bj') {
      scoreWin++;
      numWin.textContent = scoreWin;
      flashScore(numWin, 'win-flash');
    } else if (tipo === 'lose') {
      scoreLose++;
      numLose.textContent = scoreLose;
      flashScore(numLose, 'lose-flash');
    } else {
      scoreDraw++;
      numDraw.textContent = scoreDraw;
    }

    adicionarHistorico(tipo, msg);
  }

  /* ── Adiciona ao histórico ── */
  function adicionarHistorico(tipo, msg) {
    var totalJ = calcularMao(maoJogador);
    var totalD = calcularMao(maoDealer);

    var item = document.createElement('div');
    item.className = 'history-item ' + (tipo === 'bj' ? 'bj' : tipo);
    item.innerHTML =
      '<span class="h-plays">Você ' + totalJ + ' × Dealer ' + totalD + '</span>' +
      '<span class="h-result">' + msg + '</span>';

    historyList.prepend(item);
    while (historyList.children.length > 20) historyList.removeChild(historyList.lastChild);
  }

  /* ── Habilita/desabilita botões ── */
  function setBotoes(jogando) {
    btnDeal.disabled  = jogando;
    btnHit.disabled   = !jogando;
    btnStand.disabled = !jogando;
  }

  /* ── Vez do dealer (revela carta e compra até >= 17) ── */
  function turnoDealer(callback) {
    revelarCartaOculta();
    atualizarValores(true);

    function dealerStep() {
      var total = calcularMao(maoDealer);
      if (total < 17) {
        setTimeout(function () {
          var carta = comprarCarta();
          maoDealer.push(carta);
          renderCarta(carta, dealerCardsEl, false);
          atualizarValores(true);
          dealerStep();
        }, 500);
      } else {
        setTimeout(callback, 300);
      }
    }

    setTimeout(dealerStep, 400);
  }

  /* ── Verifica quem ganhou após o dealer jogar ── */
  function verificarVencedor() {
    var totalJ = calcularMao(maoJogador);
    var totalD = calcularMao(maoDealer);

    if (totalD > 21) {
      definirResultado('win', 'Dealer estourou! Você vence!');
    } else if (totalJ > totalD) {
      definirResultado('win', 'Você vence! 🎉');
    } else if (totalD > totalJ) {
      definirResultado('lose', 'Dealer vence.');
    } else {
      definirResultado('draw', 'Empate!');
    }

    setBotoes(false);
    emJogo = false;
  }

  /* ── INICIAR JOGO ── */
  function startGame() {
    if (emJogo) return;

    /* Limpa mesa */
    dealerCardsEl.innerHTML = '';
    playerCardsEl.innerHTML = '';
    resultBanner.className  = 'result-banner empty';
    resultBanner.textContent = '—';
    dealerValueEl.textContent = '—';
    playerValueEl.textContent = '—';
    dealerValueEl.className = 'hand-value';
    playerValueEl.className = 'hand-value';

    /* Novo baralho se necessário */
    if (baralho.length < 10) baralho = criarBaralho();

    maoJogador = [];
    maoDealer  = [];
    emJogo     = true;
    setBotoes(true);

    /* Distribui 2 cartas para cada um (alternado) */
    maoJogador.push(comprarCarta());
    maoDealer.push(comprarCarta());
    maoJogador.push(comprarCarta());
    maoDealer.push(comprarCarta());

    /* Renderiza: dealer mostra só a primeira */
    renderCarta(maoDealer[0], dealerCardsEl, false);
    renderCarta(maoDealer[1], dealerCardsEl, true);   /* segunda fica oculta */

    /* Jogador vê as duas */
    renderCarta(maoJogador[0], playerCardsEl, false);
    renderCarta(maoJogador[1], playerCardsEl, false);

    atualizarValores(false);

    /* Verifica Blackjack natural do jogador */
    if (isBlackjack(maoJogador)) {
      turnoDealer(function () {
        if (isBlackjack(maoDealer)) {
          definirResultado('draw', 'Empate! Dois Blackjacks!');
        } else {
          definirResultado('bj', 'BLACKJACK! 🃏✨');
        }
        setBotoes(false);
        emJogo = false;
      });
    }
  }

  /* ── PEDIR (Hit) ── */
  function hit() {
    if (!emJogo) return;

    var carta = comprarCarta();
    maoJogador.push(carta);
    renderCarta(carta, playerCardsEl, false);
    atualizarValores(false);

    var total = calcularMao(maoJogador);

    if (total > 21) {
      revelarCartaOculta();
      atualizarValores(true);
      definirResultado('lose', 'Você estourou! 💥');
      setBotoes(false);
      emJogo = false;
    } else if (total === 21) {
      /* 21 exato — passa para o dealer automaticamente */
      stand();
    }
  }

  /* ── PARAR (Stand) ── */
  function stand() {
    if (!emJogo) return;
    setBotoes(false);
    turnoDealer(verificarVencedor);
  }

  /* ── REINICIAR ── */
  function resetGame() {
    scoreWin = scoreLose = scoreDraw = 0;
    numWin.textContent  = '0';
    numLose.textContent = '0';
    numDraw.textContent = '0';
    historyList.innerHTML = '';
    dealerCardsEl.innerHTML = '';
    playerCardsEl.innerHTML = '';
    resultBanner.className  = 'result-banner empty';
    resultBanner.textContent = '—';
    dealerValueEl.textContent = '—';
    playerValueEl.textContent = '—';
    dealerValueEl.className = 'hand-value';
    playerValueEl.className = 'hand-value';
    baralho = criarBaralho();
    maoJogador = [];
    maoDealer  = [];
    emJogo     = false;
    setBotoes(false);
  }

  /* ── Expõe funções globais ── */
  window.startGame  = startGame;
  window.hit        = hit;
  window.stand      = stand;
  window.resetGame  = resetGame;

  /* ── Init ── */
  baralho = criarBaralho();

})();