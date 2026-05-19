 // ─── Configuração das notas ──────────────────────────────────
    const NOTAS_BRANCAS = [
      { nota: 'Dó', nome: 'C', key: 'a' },
      { nota: 'Ré', nome: 'D', key: 's' },
      { nota: 'Mi', nome: 'E', key: 'd' },
      { nota: 'Fá', nome: 'F', key: 'f' },
      { nota: 'Sol', nome: 'G', key: 'g' },
      { nota: 'Lá', nome: 'A', key: 'h' },
      { nota: 'Si', nome: 'B', key: 'j' },
      // Oitava extra
      { nota: 'Dó²', nome: 'C2', key: 'k' },
      { nota: 'Ré²', nome: 'D2', key: 'l' },
    ];

    const NOTAS_PRETAS = [
      { nota: 'Dó#', nome: 'C#', pos: 0, key: 'w' },
      { nota: 'Ré#', nome: 'D#', pos: 1, key: 'e' },
      { nota: 'Fá#', nome: 'F#', pos: 3, key: 't' },
      { nota: 'Sol#', nome: 'G#', pos: 4, key: 'y' },
      { nota: 'Lá#', nome: 'A#', pos: 5, key: 'u' },
    ];

    // Frequências base oitava 4
    const FREQS_BASE = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99,
      'G': 392.00, 'G#': 415.30, 'A': 440.00, 'A#': 466.16,
      'B': 493.88, 'C2': 523.25, 'D2': 587.33,
    };

    let oitava = 4;
    let audioCtx = null;
    let gravando = false;
    let sequencia = [];
    let tempoInicio = null;
    let reproduzindo = false;

    function getFreq(nome) {
      const base = FREQS_BASE[nome];
      const mult = Math.pow(2, oitava - 4);
      return base * mult;
    }

    function getAudioCtx() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return audioCtx;
    }

    // ─── Sons ─────────────────────────────────────────────────────
    function tocarNota(nome, notaDisplay, freq) {
      const ctx = getAudioCtx();

      // Oscilador principal
      const osc   = ctx.createOscillator();
      const gain  = ctx.createGain();
      // Harmônico
      const osc2  = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc.type  = 'triangle';
      osc.frequency.value = freq;
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2;

      const t = ctx.currentTime;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      gain2.gain.setValueAtTime(0, t);
      gain2.gain.linearRampToValueAtTime(0.06, t + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      osc.start(t);
      osc.stop(t + 1.3);
      osc2.start(t);
      osc2.stop(t + 0.9);

      // UI
      document.getElementById('nota-nome').textContent = notaDisplay;
      document.getElementById('nota-nome').classList.remove('tocando');
      void document.getElementById('nota-nome').offsetWidth;
      document.getElementById('nota-nome').classList.add('tocando');
      document.getElementById('nota-freq').textContent = Math.round(freq) + ' Hz';

      animarOndas();
      adicionarHistorico(notaDisplay);

      // Gravar
      if (gravando) {
        const t2 = Date.now();
        if (!tempoInicio) tempoInicio = t2;
        sequencia.push({ nome, notaDisplay, freq, time: t2 - tempoInicio });
        document.getElementById('gravacao-notas').textContent =
          sequencia.map(n => n.notaDisplay).join(' · ');
      }
    }

    // ─── Visualizador de ondas ──────────────────────────────────
    const vizEl = document.getElementById('visualizador');
    for (let i = 0; i < 24; i++) {
      const b = document.createElement('div');
      b.className = 'onda-bar';
      vizEl.appendChild(b);
    }

    function animarOndas() {
      const bars = vizEl.querySelectorAll('.onda-bar');
      bars.forEach((b, i) => {
        const h = 4 + Math.random() * 32;
        b.style.height = h + 'px';
        b.style.background = 'rgba(232,200,74,' + (0.3 + Math.random() * 0.7) + ')';
        setTimeout(() => {
          b.style.height = '4px';
          b.style.background = 'rgba(232,200,74,0.2)';
        }, 200 + i * 12);
      });
    }

    // ─── Histórico ──────────────────────────────────────────────
    let historico = [];
    function adicionarHistorico(nota) {
      historico.push(nota);
      if (historico.length > 10) historico.shift();
      const el = document.getElementById('historico');
      el.innerHTML = historico.map(n =>
        `<span class="hist-tag">${n}</span>`
      ).join('');
    }

    // ─── Construção do teclado ───────────────────────────────────
    function construirTeclado() {
      const teclado = document.getElementById('teclado');
      teclado.innerHTML = '';

      const larguraBranca = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--tecla-w') || '0') || 60;

      // Obter largura real via CSS
      const tempBranca = document.createElement('div');
      tempBranca.className = 'tecla-branca';
      tempBranca.style.visibility = 'hidden';
      teclado.appendChild(tempBranca);
      const realW = tempBranca.offsetWidth || 56;
      teclado.removeChild(tempBranca);
      const pretaW = realW * 0.62;

      NOTAS_BRANCAS.forEach((n, i) => {
        const t = document.createElement('div');
        t.className = 'tecla-branca';
        t.dataset.nome = n.nome;
        t.innerHTML = `<span class="nota-label">${n.nota}</span><span class="key-hint">${n.key}</span>`;
        t.addEventListener('mousedown', () => pressionar(n.nome, n.nota));
        t.addEventListener('touchstart', e => { e.preventDefault(); pressionar(n.nome, n.nota); });
        teclado.appendChild(t);
      });

      // Teclas pretas — posicionadas sobre brancas
      NOTAS_PRETAS.forEach(n => {
        const t = document.createElement('div');
        t.className = 'tecla-preta';
        t.dataset.nome = n.nome;
        t.innerHTML = `<span class="nota-label">${n.nota}</span><span class="key-hint">${n.key}</span>`;

        // Posição: centro da branca[pos] + metade da branca - metade da preta
        const left = n.pos * realW + realW * 0.68;
        t.style.left = left + 'px';
        t.style.width = pretaW + 'px';

        t.addEventListener('mousedown', e => { e.stopPropagation(); pressionar(n.nome, n.nota); });
        t.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); pressionar(n.nome, n.nota); });
        teclado.appendChild(t);
      });
    }

    function pressionar(nome, notaDisplay) {
      const freq = getFreq(nome);
      tocarNota(nome, notaDisplay, freq);

      // Feedback visual
      const tecla = document.querySelector(`[data-nome="${nome}"]`);
      if (tecla) {
        tecla.classList.add('pressionada');
        setTimeout(() => tecla.classList.remove('pressionada'), 200);
      }
    }

    // ─── Teclado físico ─────────────────────────────────────────
    const keyMap = {};
    [...NOTAS_BRANCAS, ...NOTAS_PRETAS].forEach(n => {
      keyMap[n.key] = { nome: n.nome, nota: n.nota };
    });

    const pressionadas = new Set();
    document.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      if (pressionadas.has(k)) return;
      if (keyMap[k]) {
        pressionadas.add(k);
        pressionar(keyMap[k].nome, keyMap[k].nota);
      }
    });
    document.addEventListener('keyup', e => {
      pressionadas.delete(e.key.toLowerCase());
    });

    // ─── Oitava ─────────────────────────────────────────────────
    function mudarOitava(delta) {
      oitava = Math.max(2, Math.min(6, oitava + delta));
      document.getElementById('oitava-label').textContent = oitava;
    }

    // ─── Gravação ───────────────────────────────────────────────
    function toggleGravacao() {
      gravando = !gravando;
      const btn = document.getElementById('btn-rec');
      const dot = document.getElementById('rec-dot');
      const lbl = document.getElementById('gravacao-label');

      if (gravando) {
        sequencia = [];
        tempoInicio = null;
        btn.textContent = '⏹ Parar';
        btn.classList.add('ativo');
        dot.classList.add('gravando');
        lbl.textContent = 'Gravando...';
        document.getElementById('gravacao-notas').textContent = '';
        document.getElementById('btn-play').disabled = true;
      } else {
        btn.textContent = '⏺ Gravar';
        btn.classList.remove('ativo');
        dot.classList.remove('gravando');
        lbl.textContent = 'Gravação pronta — ' + sequencia.length + ' nota(s)';
        document.getElementById('btn-play').disabled = sequencia.length === 0;
      }
    }

    function reproduzir() {
      if (reproduzindo || sequencia.length === 0) return;
      reproduzindo = true;
      document.getElementById('btn-play').disabled = true;
      document.getElementById('gravacao-label').textContent = 'Reproduzindo...';

      sequencia.forEach(n => {
        setTimeout(() => {
          pressionar(n.nome, n.notaDisplay);
        }, n.time);
      });

      const duracao = sequencia[sequencia.length - 1].time + 1500;
      setTimeout(() => {
        reproduzindo = false;
        document.getElementById('btn-play').disabled = false;
        document.getElementById('gravacao-label').textContent = 'Reprodução concluída';
      }, duracao);
    }

    // ─── Init ───────────────────────────────────────────────────
    construirTeclado();
    window.addEventListener('resize', construirTeclado);