    // Estado
    let minutosFoco  = 25;
    let minutosPausa = 5;
    let segundosTotal = minutosFoco * 60;
    let segundosRestantes = segundosTotal;
    let intervalo = null;
    let rodando = false;
    let emPausa = false;
    let sessaoAtual = 0;
    const TOTAL_SESSOES = 4;

    const CIRCUNFERENCIA = 2 * Math.PI * 46; // ~289

    const tempoEl    = document.getElementById('tempo-display');
    const sessaoEl   = document.getElementById('sessoes-display');
    const modoBadge  = document.getElementById('modo-badge');
    const progress   = document.getElementById('progress-circle');
    const btnIniciar = document.getElementById('btn-iniciar');
    const btnPausar  = document.getElementById('btn-pausar');

    function pad(n) { return String(n).padStart(2, '0'); }

    function atualizarDisplay() {
      const m = Math.floor(segundosRestantes / 60);
      const s = segundosRestantes % 60;
      tempoEl.textContent = pad(m) + ':' + pad(s);

      // urgência
      if (!emPausa && segundosRestantes <= 60) tempoEl.classList.add('urgente');
      else tempoEl.classList.remove('urgente');

      // arco
      const frac = segundosRestantes / segundosTotal;
      progress.style.strokeDashoffset = CIRCUNFERENCIA * (1 - frac);

      // título do browser
      document.title = pad(m) + ':' + pad(s) + ' — Pomodoro';
    }

    function atualizarSessoes() {
      sessaoEl.textContent = emPausa
        ? 'Pausa ' + sessaoAtual + ' de ' + (TOTAL_SESSOES - 1)
        : 'Sessão ' + (sessaoAtual + 1) + ' de ' + TOTAL_SESSOES;

      for (let i = 0; i < TOTAL_SESSOES; i++) {
        document.getElementById('dot-' + i).classList.toggle('feita', i < sessaoAtual);
      }
    }

    function tick() {
      if (segundosRestantes <= 0) {
        clearInterval(intervalo);
        intervalo = null;
        rodando = false;
        tocarSom();

        if (!emPausa) {
          sessaoAtual++;
          if (sessaoAtual >= TOTAL_SESSOES) {
            sessaoAtual = 0;
            emPausa = false;
            segundosTotal = minutosFoco * 60;
            modoBadge.textContent = 'FOCO';
            modoBadge.classList.remove('ativo');
            atualizarSessoes();
            atualizarDisplay();
            btnIniciar.textContent = 'INICIAR';
            btnPausar.disabled = true;
            return;
          }
          emPausa = true;
          segundosTotal = minutosPausa * 60;
          modoBadge.textContent = 'PAUSA';
          modoBadge.classList.add('ativo');
        } else {
          emPausa = false;
          segundosTotal = minutosFoco * 60;
          modoBadge.textContent = 'FOCO';
          modoBadge.classList.remove('ativo');
        }

        segundosRestantes = segundosTotal;
        atualizarSessoes();
        atualizarDisplay();
        // auto-iniciar próxima fase
        iniciarIntervalo();
        return;
      }
      segundosRestantes--;
      atualizarDisplay();
    }

    function iniciarIntervalo() {
      rodando = true;
      intervalo = setInterval(tick, 1000);
      btnIniciar.textContent = rodando ? 'RODANDO' : 'INICIAR';
      btnIniciar.disabled = true;
      btnPausar.disabled = false;
    }

    function iniciar() {
      if (rodando) return;
      iniciarIntervalo();
    }

    function pausar() {
      if (!rodando) {
        // retomar
        iniciarIntervalo();
        btnPausar.textContent = 'PAUSAR';
      } else {
        clearInterval(intervalo);
        intervalo = null;
        rodando = false;
        btnIniciar.disabled = false;
        btnIniciar.textContent = 'INICIAR';
        btnPausar.textContent = 'RETOMAR';
      }
    }

    function resetar() {
      clearInterval(intervalo);
      intervalo = null;
      rodando = false;
      emPausa = false;
      sessaoAtual = 0;
      segundosTotal = minutosFoco * 60;
      segundosRestantes = segundosTotal;
      modoBadge.textContent = 'FOCO';
      modoBadge.classList.remove('ativo');
      btnIniciar.disabled = false;
      btnIniciar.textContent = 'INICIAR';
      btnPausar.disabled = true;
      btnPausar.textContent = 'PAUSAR';
      document.title = 'Pomodoro';
      atualizarSessoes();
      atualizarDisplay();
    }

    function ajustarTempo(tipo, delta) {
      if (rodando) return;
      if (tipo === 'foco') {
        minutosFoco = Math.max(1, Math.min(60, minutosFoco + delta));
        document.getElementById('cfg-foco').textContent = minutosFoco;
        if (!emPausa) {
          segundosTotal = minutosFoco * 60;
          segundosRestantes = segundosTotal;
          atualizarDisplay();
        }
      } else {
        minutosPausa = Math.max(1, Math.min(30, minutosPausa + delta));
        document.getElementById('cfg-pausa').textContent = minutosPausa;
        if (emPausa) {
          segundosTotal = minutosPausa * 60;
          segundosRestantes = segundosTotal;
          atualizarDisplay();
        }
      }
    }

    function tocarSom() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notas = [523, 659, 784, 1047]; // Dó Mi Sol Dó
        notas.forEach((freq, i) => {
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          const t = ctx.currentTime + i * 0.18;
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          osc.start(t);
          osc.stop(t + 0.4);
        });
      } catch(e) {}
    }

    function toggleNoturno() {
      document.body.classList.toggle('modo-noturno');
      const noturno = document.body.classList.contains('modo-noturno');
      document.getElementById('btn-noturno').textContent = noturno ? '☀️ Claro' : '🌙 Noturno';
    }

    atualizarSessoes();
    atualizarDisplay();