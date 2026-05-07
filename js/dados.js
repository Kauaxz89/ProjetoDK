/* ───────────────────────────────────────────────────────────────
   dados.js — Batalha de Dados com animação 3D (Three.js)
─────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Estado ─────────────────────────────────────────────────── */
  let scorePlayer = 0;
  let scoreCpu    = 0;
  let locked      = false;
  let jogoAtivo   = true;

  /* ── Elementos do DOM ───────────────────────────────────────── */
  const valorPlayer = document.getElementById('valor-player');
  const valorCpu    = document.getElementById('valor-cpu');
  const banner      = document.getElementById('result-banner');
  const numPlayer   = document.getElementById('score-player');
  const numCpu      = document.getElementById('score-cpu');
  const historyList = document.getElementById('history-list');
  const btnLancar   = document.getElementById('btn-lancar');

  /* ── Three.js: cria um dado 3D em um canvas ─────────────────── */
  function criarDado3D(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const W = canvas.clientWidth  || 100;
    const H = canvas.clientHeight || 100;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffeebb, 1.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8c84a, 0.3);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.15);
    rimLight.position.set(0, -5, -3);
    scene.add(rimLight);

    // Gera texturas para cada face
    function criarTextura(numero) {
      const size = 256;
      const cvs = document.createElement('canvas');
      cvs.width  = size;
      cvs.height = size;
      const ctx = cvs.getContext('2d');

      // Fundo
      ctx.fillStyle = '#1a1a1a';
      ctx.roundRect(0, 0, size, size, 24);
      ctx.fill();

      // Borda interna sutil
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 4;
      ctx.roundRect(4, 4, size - 8, size - 8, 20);
      ctx.stroke();

      // Pontos
      ctx.fillStyle = '#e8c84a';
      const r = 22;
      const pad = 64;
      const mid = size / 2;

      const posicoes = {
        1: [[mid, mid]],
        2: [[pad, pad], [size - pad, size - pad]],
        3: [[pad, pad], [mid, mid], [size - pad, size - pad]],
        4: [[pad, pad], [size - pad, pad], [pad, size - pad], [size - pad, size - pad]],
        5: [[pad, pad], [size - pad, pad], [mid, mid], [pad, size - pad], [size - pad, size - pad]],
        6: [[pad, pad], [size - pad, pad], [pad, mid], [size - pad, mid], [pad, size - pad], [size - pad, size - pad]],
      };

      (posicoes[numero] || []).forEach(function ([x, y]) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        // Brilho no ponto
        const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r);
        grad.addColorStop(0, 'rgba(255,255,255,0.5)');
        grad.addColorStop(1, 'rgba(232,200,74,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e8c84a';
      });

      return new THREE.CanvasTexture(cvs);
    }

    // Materiais para as 6 faces (+x, -x, +y, -y, +z, -z)
    // THREE.BoxGeometry mapeia: +x=right, -x=left, +y=top, -y=bottom, +z=front, -z=back
    // Ordem padrão BoxGeometry: right(+x), left(-x), top(+y), bottom(-y), front(+z), back(-z)
    // Queremos: frente=1, trás=6, topo=2, baixo=5, dir=3, esq=4
    const materiais = [
      new THREE.MeshStandardMaterial({ map: criarTextura(4), roughness: 0.3, metalness: 0.1 }), // +x (right)
      new THREE.MeshStandardMaterial({ map: criarTextura(3), roughness: 0.3, metalness: 0.1 }), // -x (left)
      new THREE.MeshStandardMaterial({ map: criarTextura(5), roughness: 0.3, metalness: 0.1 }), // +y (top)
      new THREE.MeshStandardMaterial({ map: criarTextura(2), roughness: 0.3, metalness: 0.1 }), // -y (bottom)
      new THREE.MeshStandardMaterial({ map: criarTextura(1), roughness: 0.3, metalness: 0.1 }), // +z (front)
      new THREE.MeshStandardMaterial({ map: criarTextura(6), roughness: 0.3, metalness: 0.1 }), // -z (back)
    ];

    const geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8, 1, 1, 1);

    // Suaviza as arestas com um wireframe invisível + geometria extra não é necessária
    // Em vez disso, usamos um plano de reflexo sutil
    const dado = new THREE.Mesh(geometry, materiais);
    dado.castShadow = true;
    scene.add(dado);

    // Sombra no chão
    const shadowGeo = new THREE.PlaneGeometry(4, 4);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.5;
    scene.add(shadowPlane);

    // Rotações que colocam cada face virada para a câmera (+z)
    // Face 1 (+z front): rot (0,0,0)
    // Face 2 (-y bottom → virar p/ frente): rot (PI/2, 0, 0)  → topo fica p/ frente → não, bottom: rot(-PI/2,0,0)
    // Mapeamento cuidadoso:
    // Material index 4 = face +z = valor 1 → rotação (0,0,0)
    // Material index 2 = face +y = valor 5 → rotação (PI/2, 0, 0)   (topo vira frente)
    // Material index 0 = face +x = valor 4 → rotação (0, -PI/2, 0)  (direita vira frente)
    // Material index 1 = face -x = valor 3 → rotação (0, PI/2, 0)   (esquerda vira frente)
    // Material index 3 = face -y = valor 2 → rotação (-PI/2, 0, 0)  (baixo vira frente)
    // Material index 5 = face -z = valor 6 → rotação (0, PI, 0)     (trás vira frente)
    const faceRotations = {
      1: { x: 0,           y: 0,          z: 0 },
      2: { x: -Math.PI/2,  y: 0,          z: 0 },
      3: { x: 0,           y: Math.PI/2,  z: 0 },
      4: { x: 0,           y: -Math.PI/2, z: 0 },
      5: { x: Math.PI/2,   y: 0,          z: 0 },
      6: { x: 0,           y: Math.PI,    z: 0 },
    };

    // Estado da animação
    let animState = {
      rolling: false,
      targetFace: 1,
      startRot: { x: 0, y: 0, z: 0 },
      targetRot: { x: 0, y: 0, z: 0 },
      progress: 1,
      duration: 1200,
      startTime: 0,
      idleTime: 0,
      glowColor: null,
    };

    // Partículas de faísca
    let particles = [];
    function criarFaisca(cor) {
      for (let i = 0; i < 18; i++) {
        particles.push({
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08 + 0.03,
          vz: (Math.random() - 0.5) * 0.08,
          life: 1.0,
          cor: cor,
        });
      }
    }

    // Mesh de partículas
    const partGeo = new THREE.BufferGeometry();
    const partPos = new Float32Array(18 * 3 * 10); // prealoc
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({ color: 0xe8c84a, size: 0.08, transparent: true });
    const partSystem = new THREE.Points(partGeo, partMat);
    scene.add(partSystem);

    // Efeito de glow (outline sutil com escala)
    const glowGeo = new THREE.BoxGeometry(1.85, 1.85, 1.85);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xe8c84a,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    // Animação de bouncing ocioso
    let clock = { then: performance.now() };

    function easeOutBounce(t) {
      const n1 = 7.5625, d1 = 2.75;
      if (t < 1 / d1)      return n1 * t * t;
      if (t < 2 / d1)      return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1)    return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function lerpAngle(a, b, t) {
      return a + (b - a) * t;
    }

    function animateLoop(now) {
      requestAnimationFrame(animateLoop);

      const dt = (now - clock.then) / 1000;
      clock.then = now;

      if (animState.rolling) {
        const elapsed = now - animState.startTime;
        let t = Math.min(elapsed / animState.duration, 1);

        // Fase 1 (0..0.7): rolagem caótica com múltiplas voltas
        // Fase 2 (0.7..1): assentamento na face correta
        if (t < 0.7) {
          const t1 = t / 0.7;
          const spin = t1 * Math.PI * 6;
          dado.rotation.x = animState.startRot.x + spin * 1.3;
          dado.rotation.y = animState.startRot.y + spin * 0.9;
          dado.rotation.z = animState.startRot.z + spin * 0.4;

          // Bounce na posição Y
          dado.position.y = Math.sin(t1 * Math.PI * 3) * 0.4;
          dado.scale.setScalar(1 + Math.sin(t1 * Math.PI * 6) * 0.05);

          // Glow fraco durante rolagem
          glowMat.color.set(0xe8c84a);
          glowMat.opacity = 0.04 + Math.sin(t1 * Math.PI * 8) * 0.02;

        } else {
          const t2 = easeOutBounce((t - 0.7) / 0.3);

          dado.rotation.x = lerpAngle(
            animState.startRot.x + Math.PI * 6 * 1.3,
            animState.targetRot.x,
            t2
          );
          dado.rotation.y = lerpAngle(
            animState.startRot.y + Math.PI * 6 * 0.9,
            animState.targetRot.y,
            t2
          );
          dado.rotation.z = lerpAngle(
            animState.startRot.z + Math.PI * 6 * 0.4,
            animState.targetRot.z,
            t2
          );

          dado.position.y = lerpAngle(
            Math.sin(Math.PI * 3) * 0.4,
            0,
            easeInOutCubic(t2)
          );
          dado.scale.setScalar(1);
          glowMat.opacity = 0;
        }

        if (t >= 1) {
          animState.rolling = false;
          dado.rotation.set(animState.targetRot.x, animState.targetRot.y, animState.targetRot.z);
          dado.position.y = 0;
          dado.scale.setScalar(1);

          // Exibe glow de resultado e faíscas
          const cor = animState.glowColor;
          if (cor === 'win') {
            glowMat.color.set(0xe8c84a);
            criarFaisca(0xe8c84a);
          } else if (cor === 'lose') {
            glowMat.color.set(0xe85a4a);
            criarFaisca(0xe85a4a);
          } else {
            glowMat.color.set(0xffffff);
          }
          glowMat.opacity = 0.15;

          animState.glowPeak = now;
        }

      } else {
        // Idle: leve balanço
        animState.idleTime += dt;
        dado.rotation.y += dt * 0.3;
        dado.rotation.x = Math.sin(animState.idleTime * 0.7) * 0.08;

        // Fade do glow de resultado
        if (animState.glowPeak) {
          const age = (now - animState.glowPeak) / 1000;
          glowMat.opacity = Math.max(0, 0.15 - age * 0.1);
        }
      }

      // Atualiza partículas
      let pi = 0;
      particles = particles.filter(function (p) {
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
        p.vy -= 0.003;
        p.life -= 0.025;
        if (p.life > 0) {
          partPos[pi * 3]     = p.x;
          partPos[pi * 3 + 1] = p.y;
          partPos[pi * 3 + 2] = p.z;
          pi++;
        }
        return p.life > 0;
      });
      partGeo.setDrawRange(0, pi);
      partGeo.attributes.position.needsUpdate = true;
      partMat.opacity = particles.length > 0 ? 1 : 0;

      // Sincroniza glow mesh com dado
      glowMesh.rotation.copy(dado.rotation);
      glowMesh.position.copy(dado.position);

      renderer.render(scene, camera);
    }

    requestAnimationFrame(animateLoop);

    // API pública
    return {
      rolar: function (face, glowColor, onComplete) {
        animState.startRot = {
          x: dado.rotation.x,
          y: dado.rotation.y,
          z: dado.rotation.z,
        };
        const tr = faceRotations[face] || faceRotations[1];
        animState.targetRot = { x: tr.x, y: tr.y, z: tr.z };
        animState.rolling    = true;
        animState.progress   = 0;
        animState.startTime  = performance.now();
        animState.duration   = 1300;
        animState.glowColor  = glowColor;
        animState.glowPeak   = null;
        particles = [];

        setTimeout(function () {
          if (onComplete) onComplete();
        }, 1350);
      },
      resetGlow: function () {
        glowMat.opacity = 0;
        particles = [];
      }
    };
  }

  /* ── Gera valor do dado ─────────────────────────────────────── */
  function lancarDado() {
    return Math.floor(Math.random() * 6) + 1;
  }

  function verificarVencedor(player, cpu) {
    if (player > cpu) return 'win';
    if (cpu > player) return 'lose';
    return 'draw';
  }

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

  function flashScore(el, cls) {
    el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, 600);
  }

  function exibirResultado(resultado) {
    const msgs = { win: 'Você venceu!', lose: 'CPU venceu!', draw: 'Empate!' };
    banner.textContent = msgs[resultado];
    banner.className   = 'result-banner ' + resultado;
  }

  function colorirValores(resultado) {
    valorPlayer.className = 'dado-valor ' + (resultado === 'win' ? 'win' : resultado === 'lose' ? 'lose' : 'draw');
    valorCpu.className    = 'dado-valor ' + (resultado === 'lose' ? 'win' : resultado === 'win' ? 'lose' : 'draw');
  }

  function adicionarHistorico(vPlayer, vCpu, resultado) {
    const labels = { win: 'Vitória', lose: 'Derrota', draw: 'Empate' };
    const item = document.createElement('div');
    item.className = 'history-item ' + resultado;
    item.innerHTML =
      '<span class="h-plays">🎲' + vPlayer + ' × 🎲' + vCpu + '</span>' +
      '<span class="h-result">' + labels[resultado] + '</span>';
    historyList.prepend(item);
    while (historyList.children.length > 20) {
      historyList.removeChild(historyList.lastChild);
    }
  }

  /* ── Loop de rodadas ───────────────────────────────────────── */
  function iniciarRodada() {
    while (jogoAtivo) { break; }
  }

  /* ── Instâncias dos dados 3D ────────────────────────────────── */
  let dadoPlayerInstance = null;
  let dadoCpuInstance    = null;

  function initDados() {
    dadoPlayerInstance = criarDado3D('canvas-player');
    dadoCpuInstance    = criarDado3D('canvas-cpu');
  }

  /* ── Jogada principal ───────────────────────────────────────── */
  function jogar() {
    if (locked || !jogoAtivo) return;
    locked = true;
    btnLancar.disabled = true;

    // Reseta interface
    banner.className  = 'result-banner empty';
    banner.textContent = '—';
    valorPlayer.textContent = '—';
    valorCpu.textContent    = '—';
    valorPlayer.className   = 'dado-valor';
    valorCpu.className      = 'dado-valor';

    if (dadoPlayerInstance) dadoPlayerInstance.resetGlow();
    if (dadoCpuInstance)    dadoCpuInstance.resetGlow();

    const vPlayer   = lancarDado();
    const vCpu      = lancarDado();
    const resultado = verificarVencedor(vPlayer, vCpu);

    const glowPlayer = resultado === 'win' ? 'win' : resultado === 'lose' ? 'lose' : 'draw';
    const glowCpu    = resultado === 'lose' ? 'win' : resultado === 'win' ? 'lose' : 'draw';

    let playerDone = false;
    let cpuDone    = false;

    function onBothDone() {
      if (!playerDone || !cpuDone) return;

      valorPlayer.textContent = vPlayer;
      valorCpu.textContent    = vCpu;
      colorirValores(resultado);
      exibirResultado(resultado);
      atualizarPlacar(resultado);
      adicionarHistorico(vPlayer, vCpu, resultado);

      locked = false;
      btnLancar.disabled = false;
      iniciarRodada();
    }

    if (dadoPlayerInstance) {
      dadoPlayerInstance.rolar(vPlayer, glowPlayer, function () {
        playerDone = true;
        onBothDone();
      });
    } else { playerDone = true; }

    // CPU começa 150ms depois para parecer independente
    setTimeout(function () {
      if (dadoCpuInstance) {
        dadoCpuInstance.rolar(vCpu, glowCpu, function () {
          cpuDone = true;
          onBothDone();
        });
      } else { cpuDone = true; }
    }, 150);
  }

  /* ── Reset ──────────────────────────────────────────────────── */
  function resetGame() {
    jogoAtivo = false;
    scorePlayer = 0;
    scoreCpu    = 0;
    locked      = false;

    numPlayer.textContent   = '0';
    numCpu.textContent      = '0';
    banner.className        = 'result-banner empty';
    banner.textContent      = '—';
    valorPlayer.textContent = '—';
    valorCpu.textContent    = '—';
    valorPlayer.className   = 'dado-valor';
    valorCpu.className      = 'dado-valor';
    historyList.innerHTML   = '';
    btnLancar.disabled      = false;

    if (dadoPlayerInstance) dadoPlayerInstance.resetGlow();
    if (dadoCpuInstance)    dadoCpuInstance.resetGlow();

    jogoAtivo = true;
    iniciarRodada();
  }

  /* ── Inicia ─────────────────────────────────────────────────── */
  // Aguarda Three.js carregar antes de iniciar
  function waitForThree(tries) {
    if (typeof THREE !== 'undefined') {
      initDados();
      iniciarRodada();
    } else if (tries > 0) {
      setTimeout(function () { waitForThree(tries - 1); }, 100);
    }
  }
  waitForThree(30);

  window.lancarDados = jogar;
  window.resetGame   = resetGame;

})();