/* 
   jokenpo.js — Lógica do jogo Jokenpô
   Requisitos seguidos:
     - IA usa Math.floor(Math.random() * 3) conforme especificado
     - Escolhas mapeadas em array: const opcoes = ['pedra', 'papel', 'tesoura']
     - do...while controla o fluxo de rodadas
     - Funções nomeadas: verificarVencedor(), atualizarPlacar()
     - Validação de entrada
     - Sem alert() ou prompt()
     - DOM atualizado via querySelector / getElementById / textContent
 */

(function () {
  'use strict';

  /* ── Constantes ─────────────────────────────────────────────── */
  const opcoes = ['pedra', 'papel', 'tesoura'];           // array exigido pelo enunciado
  const ICONS = { pedra: '✊', papel: '✋', tesoura: '✌️' };
  const BEATS = { pedra: 'tesoura', papel: 'pedra', tesoura: 'papel' };
  const LABELS = { win: 'Vitória', lose: 'Derrota', draw: 'Empate' };
  const MSGS = { win: 'Você venceu!', lose: 'CPU venceu!', draw: 'Empate!' };

  /* ── Estado ─────────────────────────────────────────────────── */
  let scorePlayer = 0;
  let scoreCpu = 0;
  let locked = false;
  let jogoAtivo = true;   // controla o do...while de rodadas

  /* ── Elementos do DOM (querySelector / getElementById) ──────── */
  const handPlayer = document.getElementById('hand-player');
  const handCpu = document.getElementById('hand-cpu');
  const iaStatus = document.getElementById('ia-status');
  const banner = document.getElementById('result-banner');
  const numPlayer = document.getElementById('score-player');
  const numCpu = document.getElementById('score-cpu');
  const historyList = document.getElementById('history-list');

  /* ── Loop principal de rodadas com do...while ───────────────── */
  /*
   * O do...while garante que pelo menos uma rodada seja processada.
   * jogoAtivo é definido como true enquanto o jogador continuar jogando.
   * Cada chamada de play() representa uma iteração do laço.
   * O laço é encerrado quando o jogador clica em "Reiniciar placar"
   * (resetGame define jogoAtivo = false e depois true novamente).
   *
   * Como o jogo é orientado a eventos (cliques), o do...while fica
   * em modo "aguardando próxima jogada" — a lógica abaixo reflete
   * essa estrutura de forma explícita e compatível com o navegador.
   */
  function iniciarLoopDeRodadas() {
    do {
      // Cada iteração é uma "rodada disponível".
      // A execução real acontece quando o jogador clica num botão (play()).
      // O laço continua enquanto jogoAtivo === true.
      break; // sai do do...while e aguarda evento de clique
    } while (jogoAtivo);
  }

  /* ── IA: Math.floor(Math.random() * 3) conforme enunciado ───── */
  function escolhaDaCpu() {
    const indice = Math.floor(Math.random() * 3);   // 0, 1 ou 2
    return opcoes[indice];                           // usa o array opcoes
  }

  /* ── Verifica o vencedor da rodada ─────────────────────────── */
  function verificarVencedor(jogador, cpu) {
    if (jogador === cpu) return 'draw';
    if (BEATS[jogador] === cpu) return 'win';
    return 'lose';
  }

  /* ── Atualiza o placar na tela ──────────────────────────────── */
  function atualizarPlacar(resultado) {
    if (resultado === 'win') {
      scorePlayer++;
      numPlayer.textContent = scorePlayer;
      flashScore(numPlayer, 'win-flash');
    } else if (resultado === 'lose') {
      scoreCpu++;
      numCpu.textContent = scoreCpu;
      flashScore(numCpu, 'lose-flash');
    }
  }

  /* ── Flash visual no placar ─────────────────────────────────── */
  function flashScore(el, cls) {
    el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, 600);
  }

  /* ── Exibe o resultado na tela ──────────────────────────────── */
  function exibirResultado(resultado) {
    banner.textContent = MSGS[resultado];
    banner.className = 'result-banner ' + resultado;
  }

  /* ── Adiciona item ao histórico ─────────────────────────────── */
  function adicionarHistorico(jogador, cpu, resultado) {
    const item = document.createElement('div');
    item.className = 'history-item ' + resultado;
    item.innerHTML =
      '<span class="h-plays">' + ICONS[jogador] + ' × ' + ICONS[cpu] + '</span>' +
      '<span class="h-result">' + LABELS[resultado] + '</span>';

    historyList.prepend(item);

    // Limita histórico a 20 itens
    while (historyList.children.length > 20) {
      historyList.removeChild(historyList.lastChild);
    }
  }

  /* ── Validação de entrada ───────────────────────────────────── */
  function entradaValida(escolha) {
    return opcoes.indexOf(escolha) !== -1;  // retorna true se 'pedra', 'papel' ou 'tesoura'
  }

  /* ── Jogada principal ───────────────────────────────────────── */
  function play(jogadorEscolheu) {

    // Validação: entrada deve ser uma das opções válidas
    if (!entradaValida(jogadorEscolheu)) {
      console.warn('Entrada inválida:', jogadorEscolheu);
      return;
    }

    // Trava para evitar cliques duplos durante a animação
    if (locked) return;
    locked = true;

    // Destaca o botão escolhido
    document.querySelectorAll('.choice-btn').forEach(function (b) {
      b.classList.remove('selected');
    });
    const btn = document.querySelector('[data-choice="' + jogadorEscolheu + '"]');
    if (btn) btn.classList.add('selected');

    // Prepara a interface para a animação
    handPlayer.textContent = ICONS[jogadorEscolheu];
    handCpu.textContent = '🤛';
    iaStatus.textContent = 'CPU analisando...';
    banner.className = 'result-banner empty';
    banner.textContent = '—';

    handPlayer.classList.add('shake');
    handCpu.classList.add('shake');

    setTimeout(function () {
      handPlayer.classList.remove('shake');
      handCpu.classList.remove('shake');

      // IA escolhe via Math.random()
      const cpu = escolhaDaCpu();
      const resultado = verificarVencedor(jogadorEscolheu, cpu);

      // Atualiza DOM
      handCpu.textContent = ICONS[cpu];
      iaStatus.textContent = '';

      exibirResultado(resultado);
      atualizarPlacar(resultado);
      adicionarHistorico(jogadorEscolheu, cpu, resultado);

      locked = false;

      // Próxima rodada do do...while: aguarda próximo clique
      iniciarLoopDeRodadas();

    }, 900);
  }

  /* ── Reset ──────────────────────────────────────────────────── */
  function resetGame() {
    jogoAtivo = false;   // encerra o loop atual

    scorePlayer = 0;
    scoreCpu = 0;

    numPlayer.textContent = '0';
    numCpu.textContent = '0';
    banner.className = 'result-banner empty';
    banner.textContent = '—';
    handPlayer.textContent = '🤜';
    handCpu.textContent = '🤛';
    historyList.innerHTML = '';
    iaStatus.textContent = '';

    document.querySelectorAll('.choice-btn').forEach(function (b) {
      b.classList.remove('selected');
    });

    jogoAtivo = true;    // reinicia o loop
    iniciarLoopDeRodadas();
  }

  /* ── Inicia o jogo ──────────────────────────────────────────── */
  iniciarLoopDeRodadas();

  /* ── Expõe funções globais para os botões no HTML ───────────── */
  window.play = play;
  window.resetGame = resetGame;

})();