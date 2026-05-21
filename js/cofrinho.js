// Estado (em centavos para evitar float)
    let saldoCentavos = 0;
    const META = 2000; // R$ 20,00 = meta visual 100%
    const qtds = { 10: 0, 25: 0, 50: 0, 100: 0 };

    const saldoEl  = document.getElementById('saldo');
    const fillBar  = document.getElementById('fill-bar');
    const fillPct  = document.getElementById('fill-pct');
    const cofreSVG = document.getElementById('cofre-svg');
    const nivelEl  = document.getElementById('cofre-nivel');

    function formatar(centavos) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(centavos / 100);
    }

    function atualizarUI() {
      saldoEl.textContent = formatar(saldoCentavos);
      document.getElementById('qtd-10').textContent  = qtds[10];
      document.getElementById('qtd-25').textContent  = qtds[25];
      document.getElementById('qtd-50').textContent  = qtds[50];
      document.getElementById('qtd-100').textContent = qtds[100];

      // barra
      const pct = Math.min((saldoCentavos / META) * 100, 100);
      fillBar.style.width = pct + '%';
      fillPct.textContent = Math.round(pct) + '%';

      // nível SVG
      const alturaMax = 70;
      const h = (pct / 100) * alturaMax;
      nivelEl.setAttribute('y', 115 - h);
      nivelEl.setAttribute('height', h);

      // glow
      if (saldoCentavos > 0) cofreSVG.classList.add('cheio');
      else cofreSVG.classList.remove('cheio');

      // pulsar saldo
      saldoEl.classList.remove('pulsar');
      void saldoEl.offsetWidth;
      saldoEl.classList.add('pulsar');

      // persistir
      localStorage.setItem('cofrinho_saldo', saldoCentavos);
      localStorage.setItem('cofrinho_qtds', JSON.stringify(qtds));
    }

    function adicionarMoeda(val) {
      saldoCentavos += val;
      qtds[val]++;
      atualizarUI();
      lancarParticula(val);
    }

    function lancarParticula(val) {
      const el = document.createElement('div');
      el.className = 'particula';
      el.textContent = '🪙';
      el.style.left = (Math.random() * 60 + 20) + 'vw';
      el.style.top  = '50vh';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 900);
    }

    function mostrarToast(msg, erro = false) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.className = 'toast' + (erro ? ' erro' : '') + ' show';
      clearTimeout(t._timer);
      t._timer = setTimeout(() => t.classList.remove('show'), 2800);
    }

    function abrirModal() {
      document.getElementById('overlay').classList.add('show');
      setTimeout(() => document.getElementById('input-saque').focus(), 100);
    }

    function fecharModal(e) {
      if (!e || e.target === document.getElementById('overlay')) {
        document.getElementById('overlay').classList.remove('show');
        document.getElementById('input-saque').value = '';
      }
    }

    function confirmarSaque() {
      const val = parseFloat(document.getElementById('input-saque').value);
      if (isNaN(val) || val <= 0) { mostrarToast('Informe um valor válido', true); return; }
      const centavos = Math.round(val * 100);
      if (centavos > saldoCentavos) {
        mostrarToast('Você não tem Saldo para o saque!!', true);
        return;
      }
      saldoCentavos -= centavos;
      atualizarUI();
      fecharModal();
      mostrarToast('Saque de ' + formatar(centavos) + ' realizado!');
    }

    function esvaziar() {
      if (saldoCentavos === 0) { mostrarToast('O cofre já está vazio!', true); return; }
      saldoCentavos = 0;
      qtds[10] = qtds[25] = qtds[50] = qtds[100] = 0;
      atualizarUI();
      mostrarToast('Cofre esvaziado!');
    }

    // Recuperar do localStorage
    const savedSaldo = localStorage.getItem('cofrinho_saldo');
    const savedQtds  = localStorage.getItem('cofrinho_qtds');
    if (savedSaldo) saldoCentavos = parseInt(savedSaldo);
    if (savedQtds)  Object.assign(qtds, JSON.parse(savedQtds));
    atualizarUI();