const $ = id => document.getElementById(id);

let acesa = false;
let vezes = 0;

function applyDark(el, dark, light) {
  el.style.background = acesa ? light : dark;
}

function ligar() {
  // ── AMBIENTE ──
  $('scene').style.background    = '#3a2810';
  $('ceiling').style.background  = '#2e1e0c';
  $('wallB').style.background    = '#3a2a14';
  $('wallL').style.background    = '#2e2010';
  $('wallR').style.background    = '#2e2010';
  $('floor').style.background    = '#241808';
  $('base').style.background     = '#2e1c08';

  // lâmpada
  $('halo').style.opacity = '1';
  $('cone').style.opacity = '1';
  $('floorLight').style.opacity = '1';
  $('lampSvg').style.filter = 'drop-shadow(0 0 14px rgba(255,200,80,0.9))';
  document.getElementById('bulb-body').setAttribute('fill', 'rgba(255,240,180,0.85)');
  document.getElementById('bulb-body').setAttribute('stroke', 'rgba(255,220,100,0.95)');
  document.getElementById('filament').setAttribute('stroke', 'rgba(255,180,60,0.9)');
  document.getElementById('inner-glow').setAttribute('fill', 'rgba(255,230,120,0.6)');
  document.getElementById('inner-glow').setAttribute('opacity', '1');
  document.getElementById('shine').setAttribute('fill', 'rgba(255,255,255,0.4)');

  // janela (luar)
  $('winSky').style.background = '#0a0814';
  $('moonlight').style.opacity = '1';

  // quadro
  $('pic').style.borderColor = '#4a3018';
  $('picInner').style.background = 'linear-gradient(135deg, #3d2e1a 0%, #2a1e10 100%)';

  // mesa
  $('tabletop').style.background = '#6a3a18';
  $('tleg1').style.background    = '#4e2a10';
  $('tleg2').style.background    = '#4e2a10';
  $('dlshade').style.background  = 'rgba(232,200,74,0.55)';
  $('dlshade').style.borderColor = 'rgba(232,200,74,0.7)';
  $('dlglow').style.opacity      = '0.8';
  $('dlpole').style.background   = 'rgba(200,160,80,0.6)';
  $('dlbase').style.background   = 'rgba(200,160,80,0.5)';
  $('b1').style.background       = 'rgba(180,90,40,0.85)';
  $('b2').style.background       = 'rgba(60,100,140,0.85)';
  $('b3').style.background       = 'rgba(40,100,60,0.85)';

  // cadeira
  $('chback').style.background  = '#5a3818';
  $('chseat').style.background  = '#6a4420';
  $('chleg1').style.background  = '#4a2e10';
  $('chleg2').style.background  = '#4a2e10';

  // interruptor
  $('toggle').classList.add('on');
  $('swlbl').textContent = 'ON';
  $('swlbl').style.color = 'rgba(232,200,74,0.8)';
  $('plate').style.background = '#f0e8d0';

  // personagem feliz
  $('head').style.background  = '#f5d060';
  $('body').style.background  = '#e8c84a';
  $('armL').style.background  = '#e8c84a';
  $('armR').style.background  = '#e8c84a';
  $('armL').style.transform   = 'rotate(18deg)';
  $('armR').style.transform   = 'rotate(-18deg)';
  $('legL').style.background  = '#3a5fa0';
  $('legR').style.background  = '#3a5fa0';

  $('eyL').style.cssText = 'position:absolute;top:12px;left:8px;width:6px;height:7px;border-radius:50%;background:#1a1210;transition:all 0.8s ease;';
  $('eyR').style.cssText = 'position:absolute;top:12px;right:8px;width:6px;height:7px;border-radius:50%;background:#1a1210;transition:all 0.8s ease;';
  $('brL').style.cssText = 'position:absolute;top:7px;left:8px;width:8px;height:2px;border-radius:1px;background:#b8860b;transform:none;transition:all 0.8s ease;';
  $('brR').style.cssText = 'position:absolute;top:7px;right:8px;width:8px;height:2px;border-radius:1px;background:#b8860b;transform:none;transition:all 0.8s ease;';
  $('mth').style.cssText  = 'position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:16px;height:8px;border-radius:0 0 8px 8px;border:2px solid #b8860b;border-top:none;overflow:hidden;transition:all 0.8s ease;';
  $('teeth').style.opacity = '1';
  $('ckL').style.opacity  = '1';
  $('ckR').style.opacity  = '1';
  $('hat').style.opacity  = '1';
  $('horns').style.opacity = '0';
  $('hearts').style.opacity = '1';
  $('spooks').style.opacity = '0';

  // painel
  $('cnt').style.color    = '#e8c84a';
  $('estado').style.color = '#e8c84a';
  $('estado').textContent = 'ACESA';
  $('track').style.background   = 'rgba(232,200,74,0.18)';
  $('track').style.borderColor  = 'rgba(232,200,74,0.38)';
  $('thumb').style.transform    = 'translateX(26px)';
  $('thumb').style.background   = '#e8c84a';
  $('btxt').style.color = '#e8c84a';
  $('btxt').textContent = 'DESLIGAR';
}

function desligar() {
  // ── AMBIENTE ESCURO ──
  $('scene').style.background    = '#1a1008';
  $('ceiling').style.background  = '#1c1206';
  $('wallB').style.background    = '#1e1408';
  $('wallL').style.background    = '#181006';
  $('wallR').style.background    = '#181006';
  $('floor').style.background    = '#120d05';
  $('base').style.background     = '#1c1205';

  // lâmpada apagada
  $('halo').style.opacity = '0';
  $('cone').style.opacity = '0';
  $('floorLight').style.opacity = '0';
  $('lampSvg').style.filter = 'drop-shadow(0 0 0px rgba(255,200,80,0))';
  document.getElementById('bulb-body').setAttribute('fill', 'rgba(200,180,140,0.1)');
  document.getElementById('bulb-body').setAttribute('stroke', 'rgba(200,180,140,0.2)');
  document.getElementById('filament').setAttribute('stroke', 'rgba(200,180,140,0.2)');
  document.getElementById('inner-glow').setAttribute('fill', 'rgba(255,200,80,0)');
  document.getElementById('inner-glow').setAttribute('opacity', '0');
  document.getElementById('shine').setAttribute('fill', 'rgba(255,255,255,0.04)');

  // janela
  $('winSky').style.background = '#050208';
  $('moonlight').style.opacity = '0';

  // quadro
  $('pic').style.borderColor = '#1e1206';
  $('picInner').style.background = 'linear-gradient(135deg, #1a1008 0%, #0a0804 100%)';

  // mesa
  $('tabletop').style.background = '#3a2010';
  $('tleg1').style.background    = '#2e1808';
  $('tleg2').style.background    = '#2e1808';
  $('dlshade').style.background  = 'rgba(180,140,60,0.12)';
  $('dlshade').style.borderColor = 'rgba(180,140,60,0.12)';
  $('dlglow').style.opacity      = '0';
  $('dlpole').style.background   = 'rgba(180,140,60,0.15)';
  $('dlbase').style.background   = 'rgba(180,140,60,0.12)';
  $('b1').style.background       = 'rgba(100,50,20,0.3)';
  $('b2').style.background       = 'rgba(30,60,90,0.3)';
  $('b3').style.background       = 'rgba(40,80,40,0.3)';

  // cadeira
  $('chback').style.background  = '#2a1a08';
  $('chseat').style.background  = '#3a2410';
  $('chleg1').style.background  = '#2a1808';
  $('chleg2').style.background  = '#2a1808';

  // interruptor
  $('toggle').classList.remove('on');
  $('swlbl').textContent = 'OFF';
  $('swlbl').style.color = 'rgba(240,237,232,0.25)';
  $('plate').style.background = '#e8dfc8';

  // personagem assustado
  $('head').style.background  = '#c0392b';
  $('body').style.background  = '#8b0000';
  $('armL').style.background  = '#c0392b';
  $('armR').style.background  = '#c0392b';
  $('armL').style.transform   = 'rotate(-75deg)';
  $('armR').style.transform   = 'rotate(75deg)';
  $('legL').style.background  = '#5a0000';
  $('legR').style.background  = '#5a0000';

  $('eyL').style.cssText = 'position:absolute;top:10px;left:6px;width:8px;height:10px;border-radius:50%;background:#ff1a00;box-shadow:0 0 6px #ff1a00;transition:all 0.8s ease;';
  $('eyR').style.cssText = 'position:absolute;top:10px;right:6px;width:8px;height:10px;border-radius:50%;background:#ff1a00;box-shadow:0 0 6px #ff1a00;transition:all 0.8s ease;';
  $('brL').style.cssText = 'position:absolute;top:6px;left:6px;width:9px;height:2.5px;border-radius:1px;background:#5a0000;transform:rotate(22deg);transition:all 0.8s ease;';
  $('brR').style.cssText = 'position:absolute;top:6px;right:6px;width:9px;height:2.5px;border-radius:1px;background:#5a0000;transform:rotate(-22deg);transition:all 0.8s ease;';
  $('mth').style.cssText  = 'position:absolute;bottom:7px;left:50%;transform:translateX(-50%);width:18px;height:9px;border-radius:9px 9px 0 0;border:2px solid #5a0000;border-bottom:none;overflow:hidden;transition:all 0.8s ease;';
  $('teeth').style.opacity = '0';
  $('ckL').style.opacity  = '0';
  $('ckR').style.opacity  = '0';
  $('hat').style.opacity  = '0';
  $('horns').style.opacity = '1';
  $('hearts').style.opacity = '0';
  $('spooks').style.opacity = '1';

  // painel
  $('cnt').style.color    = 'rgba(240,237,232,0.25)';
  $('estado').style.color = 'rgba(240,237,232,0.25)';
  $('estado').textContent = 'APAGADA';
  $('track').style.background   = 'rgba(240,237,232,0.07)';
  $('track').style.borderColor  = 'rgba(255,255,255,0.06)';
  $('thumb').style.transform    = 'translateX(0)';
  $('thumb').style.background   = 'rgba(240,237,232,0.28)';
  $('btxt').style.color = 'rgba(240,237,232,0.35)';
  $('btxt').textContent = 'LIGAR';
}

function toggle() {
  acesa = !acesa;
  if (acesa) {
    vezes++;
    $('cnt').textContent = vezes;
    $('cnt').classList.remove('bump');
    void $('cnt').offsetWidth;
    $('cnt').classList.add('bump');
    ligar();
  } else {
    desligar();
  }
}

// clique no botão e no interruptor físico
$('btn').addEventListener('click', toggle);
$('switchBox').addEventListener('click', toggle);

// estado inicial
desligar();