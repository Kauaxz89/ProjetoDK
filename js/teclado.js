const NOTAS_BRANCAS = [
      { nota: 'Dó',  nome: 'C',  key: 'a' },
      { nota: 'Ré',  nome: 'D',  key: 's' },
      { nota: 'Mi',  nome: 'E',  key: 'd' },
      { nota: 'Fá',  nome: 'F',  key: 'f' },
      { nota: 'Sol', nome: 'G',  key: 'g' },
      { nota: 'Lá',  nome: 'A',  key: 'h' },
      { nota: 'Si',  nome: 'B',  key: 'j' },
      { nota: 'Dó²', nome: 'C2', key: 'k' },
      { nota: 'Ré²', nome: 'D2', key: 'l' },
    ];
 
    const NOTAS_PRETAS = [
      { nota: 'Dó#',  nome: 'C#',  pos: 0, key: 'w' },
      { nota: 'Ré#',  nome: 'D#',  pos: 1, key: 'e' },
      { nota: 'Fá#',  nome: 'F#',  pos: 3, key: 't' },
      { nota: 'Sol#', nome: 'G#',  pos: 4, key: 'y' },
      { nota: 'Lá#',  nome: 'A#',  pos: 5, key: 'u' },
    ];
 
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
      return FREQS_BASE[nome] * Math.pow(2, oitava - 4);
    }
 
    function getAudioCtx() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return audioCtx;
    }
 
    function tocarNota(nome, notaDisplay, freq) {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc.type = 'triangle'; osc.frequency.value = freq;
      osc2.type = 'sine'; osc2.frequency.value = freq * 2;
      const t = ctx.currentTime;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      gain2.gain.setValueAtTime(0, t);
      gain2.gain.linearRampToValueAtTime(0.06, t + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.start(t); osc.stop(t + 1.3);
      osc2.start(t); osc2.stop(t + 0.9);
 
      const nEl = document.getElementById('nota-nome');
      nEl.textContent = notaDisplay;
      nEl.classList.remove('tocando');
      void nEl.offsetWidth;
      nEl.classList.add('tocando');
      document.getElementById('nota-freq').textContent = Math.round(freq) + ' Hz';
 
      animarOndas();
      adicionarHistorico(notaDisplay);
 
      if (gravando) {
        const t2 = Date.now();
        if (!tempoInicio) tempoInicio = t2;
        sequencia.push({ nome, notaDisplay, freq, time: t2 - tempoInicio });
        document.getElementById('gravacao-notas').textContent =
          sequencia.map(n => n.notaDisplay).join(' · ');
      }
    }
 
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
 
    let historico = [];
    function adicionarHistorico(nota) {
      historico.push(nota);
      if (historico.length > 10) historico.shift();
      document.getElementById('historico').innerHTML =
        historico.map(n => `<span class="hist-tag">${n}</span>`).join('');
    }
 
    function construirTeclado() {
      const teclado = document.getElementById('teclado');
      teclado.innerHTML = '';
 
      // Mede largura real de uma tecla branca
      const tempB = document.createElement('div');
      tempB.className = 'tecla-branca';
      tempB.style.visibility = 'hidden';
      teclado.appendChild(tempB);
      const realW = tempB.offsetWidth || 56;
      teclado.removeChild(tempB);
      const pretaW = Math.floor(realW * 0.65);
 
      NOTAS_BRANCAS.forEach((n, i) => {
        const t = document.createElement('div');
        t.className = 'tecla-branca';
        t.dataset.nome = n.nome;
        t.innerHTML = `
          <div class="face-top">
            <span class="nota-label">${n.nota}</span>
            <span class="key-hint">${n.key}</span>
          </div>
          <div class="face-front"></div>
        `;
        t.addEventListener('mousedown', () => pressionar(n.nome, n.nota));
        t.addEventListener('touchstart', e => { e.preventDefault(); pressionar(n.nome, n.nota); });
        teclado.appendChild(t);
      });
 
      NOTAS_PRETAS.forEach(n => {
        const t = document.createElement('div');
        t.className = 'tecla-preta';
        t.dataset.nome = n.nome;
        t.innerHTML = `
          <div class="face-top">
            <span class="nota-label">${n.nota}</span>
            <span class="key-hint">${n.key}</span>
          </div>
          <div class="face-front"></div>
        `;
        const left = n.pos * realW + realW * 0.66;
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
      const tecla = document.querySelector(`[data-nome="${nome}"]`);
      if (tecla) {
        tecla.classList.add('pressionada');
        setTimeout(() => tecla.classList.remove('pressionada'), 200);
      }
    }
 
    const keyMap = {};
    [...NOTAS_BRANCAS, ...NOTAS_PRETAS].forEach(n => {
      keyMap[n.key] = { nome: n.nome, nota: n.nota };
    });
 
    const pressionadas = new Set();
    document.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      if (pressionadas.has(k)) return;
      if (keyMap[k]) { pressionadas.add(k); pressionar(keyMap[k].nome, keyMap[k].nota); }
    });
    document.addEventListener('keyup', e => pressionadas.delete(e.key.toLowerCase()));
 
    function mudarOitava(delta) {
      oitava = Math.max(2, Math.min(6, oitava + delta));
      document.getElementById('oitava-label').textContent = oitava;
    }
 
    function toggleGravacao() {
      gravando = !gravando;
      const btn = document.getElementById('btn-rec');
      const dot = document.getElementById('rec-dot');
      const lbl = document.getElementById('gravacao-label');
      if (gravando) {
        sequencia = []; tempoInicio = null;
        btn.textContent = '⏹ Parar'; btn.classList.add('ativo');
        dot.classList.add('gravando'); lbl.textContent = 'Gravando...';
        document.getElementById('gravacao-notas').textContent = '';
        document.getElementById('btn-play').disabled = true;
      } else {
        btn.textContent = '⏺ Gravar'; btn.classList.remove('ativo');
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
        setTimeout(() => pressionar(n.nome, n.notaDisplay), n.time);
      });
      const duracao = sequencia[sequencia.length - 1].time + 1500;
      setTimeout(() => {
        reproduzindo = false;
        document.getElementById('btn-play').disabled = false;
        document.getElementById('gravacao-label').textContent = 'Reprodução concluída';
      }, duracao);
    }
 
    construirTeclado();
    window.addEventListener('resize', construirTeclado);