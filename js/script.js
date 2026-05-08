/* ───────────────────────────────────────────────────────────────
   script.js — Jogos Interativos
   Responsabilidades:
     1. Injetar a barra de ícones de mão animados
     2. Scroll reveal para os cards
     3. Efeito de ripple ao clicar nos cards
     4. Cursor personalizado (opcional, só desktop)
─────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── 1. Barra de mãos animadas ──────────────────────────────── */
  function injectHandsBar() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const bar = document.createElement('div');
    bar.className = 'hands-bar';
    bar.setAttribute('aria-hidden', 'true');

    const hands = ['✊', '✋', '✌️'];
    hands.forEach(function (emoji) {
      const span = document.createElement('span');
      span.className = 'hand-icon';
      span.textContent = emoji;
      bar.appendChild(span);
    });

    const label = document.createElement('span');
    label.className = 'hands-label';
    label.textContent = 'escolha seu desafio';
    bar.appendChild(label);

    hero.parentNode.insertBefore(bar, hero);
  }

  /* ── 2. Ícones por card ─────────────────────────────────────── */
  function assignIcons() {
    const map = {
      'jokenpo':   '✊',
      'cara_coroa':'🪙',
      'dados':     '🎲',
    };

    document.querySelectorAll('.game').forEach(function (card) {
      const link = card.querySelector('a');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      let icon = '🃏';

      Object.keys(map).forEach(function (key) {
        if (href.toLowerCase().includes(key)) icon = map[key];
      });

      /* Cria elemento ícone e insere antes do h2 */
      if (!card.querySelector('.game-icon')) {
        const el = document.createElement('span');
        el.className = 'game-icon';
        el.setAttribute('aria-hidden', 'true');
        el.textContent = icon;
        const h2 = card.querySelector('h2');
        if (h2) card.insertBefore(el, h2);
        else card.prepend(el);
      }
    });
  }

  /* ── 3. Scroll Reveal ───────────────────────────────────────── */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          /* Cascata: cada card aparece 120ms depois do anterior */
          const delay = i * 120;
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ── 4. Ripple ao clicar no card ────────────────────────────── */
  function initRipple() {
    document.querySelectorAll('.game').forEach(function (card) {
      card.addEventListener('click', function (e) {
        const rect   = card.getBoundingClientRect();
        const x      = e.clientX - rect.left;
        const y      = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.cssText = [
          'position:absolute',
          'border-radius:50%',
          'width:10px',
          'height:10px',
          'background:rgba(232,200,74,0.25)',
          'transform:scale(0)',
          'animation:ripple 0.55s ease-out forwards',
          'left:' + (x - 5) + 'px',
          'top:'  + (y - 5) + 'px',
          'pointer-events:none',
        ].join(';');

        card.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 600);
      });
    });

    /* Injeta keyframe se ainda não existe */
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent =
        '@keyframes ripple{to{transform:scale(30);opacity:0}}';
      document.head.appendChild(style);
    }
  }

  /* ── 5. Stagger de delay para cards ─────────────────────────── */
  function staggerCards() {
    document.querySelectorAll('.game.reveal').forEach(function (card, i) {
      card.style.transitionDelay = (i * 0.1) + 's';
    });
  }

  /* ── 6. Hover shake no ícone de mão ─────────────────────────── */
  function initHandHover() {
    document.querySelectorAll('.hand-icon').forEach(function (icon) {
      icon.addEventListener('mouseenter', function () {
        icon.style.animationPlayState = 'paused';
        icon.style.transform = 'scale(1.3) rotate(-10deg)';
      });
      icon.addEventListener('mouseleave', function () {
        icon.style.transform = '';
        /* Retoma animação após o hover */
        setTimeout(function () {
          icon.style.animationPlayState = '';
        }, 300);
      });
    });
  }

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    injectHandsBar();
    assignIcons();
    staggerCards();
    initReveal();
    initRipple();
    initHandHover();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();