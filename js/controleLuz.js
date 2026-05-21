  // Estado
    let ligada = false;
    let vezes = 0;

    const quarto       = document.getElementById('quarto');
    const btn          = document.getElementById('btn-luz');
    const statusDot    = document.getElementById('status-dot');
    const statusText   = document.getElementById('status-text');
    const contador     = document.getElementById('contador');
    const corpoSVG     = document.getElementById('lampada-corpo');
    const filamento    = document.getElementById('filamento');
    const reflexo      = document.getElementById('reflexo');

    // Animação do contador
    function animarContador(valor) {
      contador.style.transform = 'scale(1.3)';
      contador.textContent = valor;
      setTimeout(() => { contador.style.transform = 'scale(1)'; contador.style.transition = 'transform 0.25s ease'; }, 150);
    }

    function alternarLuz() {
      ligada = !ligada;

      if (ligada) {
        vezes++;
        animarContador(vezes);

        quarto.classList.add('aceso');
        document.body.classList.add('luz-acesa');
        btn.textContent = 'DESLIGAR';
        btn.classList.add('ativo');
        statusDot.classList.add('aceso');
        statusText.textContent = 'Ligada';

        // SVG aceso
        corpoSVG.setAttribute('fill', '#e8c84a');
        corpoSVG.setAttribute('stroke', 'rgba(232,200,74,0.4)');
        filamento.setAttribute('stroke', 'rgba(255,240,160,0.9)');
        reflexo.setAttribute('stroke', 'rgba(255,255,255,0.35)');

      } else {
        quarto.classList.remove('aceso');
        document.body.classList.remove('luz-acesa');
        btn.textContent = 'LIGAR';
        btn.classList.remove('ativo');
        statusDot.classList.remove('aceso');
        statusText.textContent = 'Desligada';

        // SVG apagado
        corpoSVG.setAttribute('fill', '#1a1a1a');
        corpoSVG.setAttribute('stroke', 'rgba(255,255,255,0.1)');
        filamento.setAttribute('stroke', 'rgba(255,255,255,0.15)');
        reflexo.setAttribute('stroke', 'rgba(255,255,255,0.08)');
      }
    }

    // Atalho teclado: espaço
    document.addEventListener('keydown', e => {
      if (e.code === 'Space') { e.preventDefault(); alternarLuz(); }
    });