/* VORTEXUS 26 — Interactive Sound FX
   Lightweight Web Audio API sounds: no external audio files required. */
(() => {
  'use strict';

  const KEY = 'vortexus_sound_enabled';
  let enabled = localStorage.getItem(KEY) !== 'off';
  let ctx = null;

  const getCtx = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };

  const tone = (freq, duration, type='sine', volume=.045, delay=0, endFreq=null) => {
    const ac = getCtx();
    if (!ac || !enabled) return;
    const now = ac.currentTime + delay;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, now);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), now + duration);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(volume, now + .012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    o.connect(g); g.connect(ac.destination);
    o.start(now); o.stop(now + duration + .025);
  };

  const sounds = {
    click() { tone(520,.055,'square',.025); tone(760,.075,'sine',.018, .035); },
    pop() { tone(220,.07,'sine',.04,0,520); tone(680,.11,'triangle',.03,.055,980); },
    camera() { tone(1050,.045,'square',.035); tone(620,.08,'triangle',.028,.045,300); },
    login() { tone(440,.09,'sine',.04); tone(660,.10,'sine',.04,.08); tone(880,.16,'sine',.035,.17); },
    logout() { tone(740,.09,'sine',.035); tone(500,.11,'sine',.03,.08); tone(320,.16,'sine',.025,.18); },
    upload() { tone(330,.08,'triangle',.035); tone(520,.08,'triangle',.035,.07); tone(780,.14,'sine',.03,.14); },
    success() { tone(523,.09,'sine',.04); tone(659,.09,'sine',.04,.08); tone(784,.17,'sine',.045,.16); },
    error() { tone(210,.11,'sawtooth',.025); tone(150,.16,'sawtooth',.022,.1); },
    whoosh() {
      const ac=getCtx(); if(!ac || !enabled) return;
      const now=ac.currentTime;
      const o=ac.createOscillator(), g=ac.createGain();
      o.type='sine'; o.frequency.setValueAtTime(180,now); o.frequency.exponentialRampToValueAtTime(900,now+.22);
      g.gain.setValueAtTime(.0001,now); g.gain.exponentialRampToValueAtTime(.035,now+.03); g.gain.exponentialRampToValueAtTime(.0001,now+.24);
      o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now+.27);
    }
  };

  const labelFor = (el) => {
    const text = ((el.innerText || el.value || el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('href') || '')).toLowerCase();
    const id = (el.id || '').toLowerCase();
    const cls = (el.className && typeof el.className === 'string' ? el.className : '').toLowerCase();

    if (id.includes('logout') || text.includes('logout') || text.includes('keluar')) return 'logout';
    if (id.includes('login') || text.includes('login') || text.includes('masuk')) return 'login';
    if (id.includes('upload') || text.includes('upload') || text.includes('unggah') || cls.includes('upload')) return 'upload';
    if (cls.includes('media-open') || text.includes('buka') || text.includes('lihat')) return 'camera';
    if (text.includes('like') || text.includes('suka') || cls.includes('like')) return 'pop';
    if (text.includes('hapus') || text.includes('delete') || text.includes('tolak') || text.includes('reject')) return 'error';
    if (text.includes('setujui') || text.includes('approve') || text.includes('berhasil') || text.includes('simpan')) return 'success';
    if (cls.includes('random')) return 'whoosh';
    if (el.matches('select')) return 'pop';
    if (el.matches('a') || el.matches('button')) return 'click';
    return null;
  };

  const setToggleUI = () => {
    const btn = document.getElementById('vortexusSoundToggle');
    if (!btn) return;
    btn.textContent = enabled ? '🔊' : '🔇';
    btn.title = enabled ? 'Matikan suara' : 'Nyalakan suara';
    btn.setAttribute('aria-label', enabled ? 'Matikan suara' : 'Nyalakan suara');
    btn.classList.toggle('sound-off', !enabled);
  };

  const makeToggle = () => {
    if (document.getElementById('vortexusSoundToggle')) return;
    const btn = document.createElement('button');
    btn.id = 'vortexusSoundToggle';
    btn.type = 'button';
    btn.className = 'vortexus-sound-toggle';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      enabled = !enabled;
      localStorage.setItem(KEY, enabled ? 'on' : 'off');
      setToggleUI();
      if (enabled) sounds.success();
    });
    document.body.appendChild(btn);
    setToggleUI();
  };

  document.addEventListener('click', (e) => {
    if (!enabled) return;
    const el = e.target.closest('button, a, select, [role="button"], .media-card');
    if (!el || el.id === 'vortexusSoundToggle') return;
    const sound = labelFor(el);
    if (sound && sounds[sound]) sounds[sound]();
  }, true);

  document.addEventListener('DOMContentLoaded', makeToggle);
})();
