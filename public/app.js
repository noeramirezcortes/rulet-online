(() => {
  "use strict";

  /* ============================================================
     Ruleta de la suerte / Spin the wheel — HTML, CSS y JavaScript sin dependencias
     ============================================================ */

  const TAU = Math.PI * 2;
  const THEME_KEY = "ruleta-theme";
  const LANG_KEY = "wheel-lang";
  const MAX_OPTIONS = 20;
  const HEX = /^#[0-9a-f]{3,8}$/i;
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => reducedQuery.matches;
  const FONT = '"Manrope", "Segoe UI", system-ui, sans-serif';

  /* ============================ Idiomas ============================ */

  // Cada página fija su idioma con <html lang>. Aquí viven los textos de los dos.
  const LANGS = {
    es: {
      storageKey: "ruleta-de-la-suerte:v1",
      defaults: [
        "Pizza", "Sushi", "Hamburguesa", "Tacos",
        "Ensalada", "Pasta", "Ramen", "Helado"
      ],
      copy: (() => {
        const plural = new Intl.PluralRules("es");
        return {
          themeToNight: "Activar modo noche",
          themeToDay: "Activar modo día",
          mute: "Silenciar sonido",
          unmute: "Activar sonido",
          statusIdle: "En espera",
          statusSpinning: "Girando",
          statusDone: "Resuelto",
          metaIdle: "Gira la ruleta para conocer el veredicto.",
          metaSpinning: "La rueda está girando…",
          metaDone: "La suerte ha hablado. Gira otra vez si no te convence.",
          needTwo: "Añade al menos dos opciones para girar",
          maxOptions: (max) => `Puedes añadir hasta ${max} opciones`,
          emptyOption: "Escribe una opción primero",
          shuffled: "Opciones barajadas",
          resetConfirm: "¿Reiniciar la ruleta, el veredicto y el historial?",
          resetDone: "De vuelta al principio",
          removeOption: (label) => `Quitar ${label}`,
          hubCount: (n) => `${n} ${plural.select(n) === "one" ? "opción" : "opciones"}`,
          wheelAria: (n, list) => (n ? `Ruleta con ${n} opciones: ${list}` : "Ruleta vacía")
        };
      })()
    },
    en: {
      storageKey: "spin-the-wheel:v1",
      defaults: [
        "Pizza", "Sushi", "Burger", "Tacos",
        "Salad", "Pasta", "Ramen", "Ice cream"
      ],
      copy: (() => {
        const plural = new Intl.PluralRules("en");
        return {
          themeToNight: "Switch to night mode",
          themeToDay: "Switch to day mode",
          mute: "Mute sound",
          unmute: "Unmute sound",
          statusIdle: "Waiting",
          statusSpinning: "Spinning",
          statusDone: "Decided",
          metaIdle: "Spin the wheel to hear the verdict.",
          metaSpinning: "The wheel is turning…",
          metaDone: "Chance has spoken. Spin again if you don't like it.",
          needTwo: "Add at least two options to spin",
          maxOptions: (max) => `You can add up to ${max} options`,
          emptyOption: "Type an option first",
          shuffled: "Options shuffled",
          resetConfirm: "Reset the wheel, the verdict and the history?",
          resetDone: "Back to the starting point",
          removeOption: (label) => `Remove ${label}`,
          hubCount: (n) => `${n} ${plural.select(n) === "one" ? "option" : "options"}`,
          wheelAria: (n, list) => (n ? `Wheel with ${n} options: ${list}` : "Empty wheel")
        };
      })()
    }
  };

  const LANG = document.documentElement.lang.slice(0, 2) in LANGS
    ? document.documentElement.lang.slice(0, 2)
    : "es";
  const { storageKey: STORAGE_KEY, defaults: DEFAULT_OPTIONS, copy: COPY } = LANGS[LANG];

  /* ============================ Fin de idiomas ============================ */

  // Los colores viven sobre un pozo oscuro, así que la paleta es la misma de día y de noche.
  const GEMS = [
    "#7C4DFF", "#F5A524", "#E0338F", "#00B8D9",
    "#10B981", "#FF5D5D", "#4F46E5", "#9BE15D",
    "#FF8A3D", "#38BDF8", "#C026D3", "#14B8A6"
  ];

  const THEMES = {
    day: { palette: GEMS, ink: "#0B0A1A", paper: "#FFFFFF", sep: "rgba(255, 255, 255, 0.55)" },
    night: { palette: GEMS, ink: "#0B0A1A", paper: "#FFFFFF", sep: "rgba(255, 255, 255, 0.5)" }
  };

  const $ = (id) => document.getElementById(id);

  const els = {
    wheel: $("wheel"),
    canvas: $("wheelCanvas"),
    spinBtn: $("spinBtn"),
    hubSub: $("hubSub"),
    resultCard: $("resultCard"),
    resultValue: $("resultValue"),
    resultMeta: $("resultMeta"),
    resultLive: $("resultLive"),
    statusText: $("statusText"),
    form: $("optionForm"),
    input: $("optionInput"),
    hint: $("optionHint"),
    list: $("optionsList"),
    empty: $("optionsEmpty"),
    count: $("optCount"),
    shuffleBtn: $("shuffleBtn"),
    resetBtn: $("resetBtn"),
    history: $("history"),
    historyEmpty: $("historyEmpty"),
    soundBtn: $("soundBtn"),
    themeBtn: $("themeBtn"),
    themeColor: $("themeColor"),
    toast: $("toast"),
    fx: $("fx")
  };

  const ctx = els.canvas.getContext("2d");
  const fxCtx = els.fx.getContext("2d");

  let options = [...DEFAULT_OPTIONS];
  let history = [];
  let rotation = 0;
  let spinning = false;
  let muted = false;
  let wheelSize = 0;
  let dpr = 1;
  let fxDpr = 1;
  let toastTimer = 0;
  let audio = null;
  let fxRaf = 0;
  let particles = [];

  /* ============================ Utilidades ============================ */

  const normalize = (angle) => ((angle % TAU) + TAU) % TAU;

  function currentTheme() {
    return document.documentElement.dataset.theme === "night" ? "night" : "day";
  }

  function palette() {
    return THEMES[currentTheme()] || THEMES.day;
  }

  function luminance(hex) {
    const clean = hex.replace("#", "");
    const channel = (offset) => {
      const value = parseInt(clean.slice(offset, offset + 2), 16) / 255;
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  }

  function contrast(a, b) {
    const la = luminance(a);
    const lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  // Cada etiqueta usa la tinta que más contrasta con su porción.
  function labelColor(hex, theme) {
    return contrast(hex, theme.ink) >= contrast(hex, theme.paper) ? theme.ink : theme.paper;
  }

  // El color del veredicto tiñe el halo de la rueda y el borde de la tarjeta.
  function setWin(color) {
    for (const el of [els.resultCard, els.wheel]) {
      if (color) el.style.setProperty("--win", color);
      else el.style.removeProperty("--win");
    }
  }

  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 2800);
  }

  function colorsFor(n) {
    const theme = palette();
    const colors = [];
    for (let i = 0; i < n; i++) colors.push(theme.palette[i % theme.palette.length]);

    // Evita que la última porción repita el color de la primera.
    if (n > 1 && colors[n - 1] === colors[0]) {
      const alt = theme.palette.find((c) => c !== colors[0] && c !== colors[n - 2]);
      if (alt) colors[n - 1] = alt;
    }
    return colors;
  }

  function getIndexAtPointer(rot) {
    const n = options.length;
    if (!n) return 0;
    const segment = TAU / n;
    const angle = normalize(-Math.PI / 2 - rot);
    return Math.min(n - 1, Math.floor(angle / segment));
  }

  /* ============================ Persistencia ============================ */

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);

      if (Array.isArray(data.options)) {
        options = data.options
          .filter((o) => typeof o === "string" && o.trim())
          .map((o) => o.trim().slice(0, 40))
          .slice(0, MAX_OPTIONS);
      }

      if (Array.isArray(data.history)) {
        const theme = palette();
        history = data.history
          .filter((h) => h && typeof h.label === "string")
          .slice(0, 12)
          .map((h) => ({
            label: h.label.slice(0, 40),
            // El historial antiguo conserva colores de otra paleta: se reasigna
            // al color actual de la opción cuando sigue existiendo.
            color: theme.palette[options.indexOf(h.label)] || (HEX.test(h.color) ? h.color : theme.palette[0])
          }));
      }

      muted = Boolean(data.muted);
      return true;
    } catch {
      return false;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ options, history, muted }));
    } catch {
      /* El almacenamiento puede estar desactivado: la app sigue funcionando. */
    }
  }

  /* ============================ Tema ============================ */

  function syncThemeUI() {
    if (!els.themeBtn) return;
    const night = currentTheme() === "night";
    const label = night ? COPY.themeToDay : COPY.themeToNight;
    els.themeBtn.setAttribute("aria-pressed", String(night));
    els.themeBtn.setAttribute("aria-label", label);
    els.themeBtn.title = label;
    if (els.themeColor) els.themeColor.setAttribute("content", night ? "#07060f" : "#f1efff");
  }

  function setTheme(theme, persist) {
    document.documentElement.dataset.theme = theme;
    syncThemeUI();
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        /* Sin almacenamiento, el tema dura lo que la visita. */
      }
    }
    renderOptions();
    renderHistory();
    draw();
  }

  function toggleTheme() {
    setTheme(currentTheme() === "night" ? "day" : "night", true);
  }

  /* ============================ Sonido ============================ */

  function getAudio() {
    if (muted) return null;
    if (!audio) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      try {
        audio = new AudioCtor();
      } catch {
        return null;
      }
    }
    if (audio.state === "suspended") audio.resume().catch(() => {});
    return audio;
  }

  function playTick(progress) {
    const ac = getAudio();
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(740 + progress * 560, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.026, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  function playFanfare() {
    const ac = getAudio();
    if (!ac) return;
    const now = ac.currentTime;
    [0, 4, 7, 12].forEach((semi, i) => {
      const start = now + i * 0.085;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "triangle";
      osc.frequency.value = 523.25 * Math.pow(2, semi / 12);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.055, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(ac.destination);
      osc.start(start);
      osc.stop(start + 0.52);
    });
  }

  function updateSoundUI() {
    const label = muted ? COPY.unmute : COPY.mute;
    els.soundBtn.setAttribute("aria-pressed", String(muted));
    els.soundBtn.setAttribute("aria-label", label);
    els.soundBtn.title = label;
  }

  /* ============================ Dibujo de la ruleta ============================ */

  function fitLabel(text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let cut = text;
    while (cut.length > 1 && ctx.measureText(cut + "…").width > maxWidth) {
      cut = cut.slice(0, -1);
    }
    return cut.trimEnd() + "…";
  }

  // Aclara (t > 0) u oscurece (t < 0) un color hexadecimal.
  function shade(hex, t) {
    const clean = hex.replace("#", "");
    const target = t < 0 ? 0 : 255;
    const amount = Math.abs(t);
    const channel = (offset) => {
      const value = parseInt(clean.slice(offset, offset + 2), 16);
      return Math.round(value + (target - value) * amount);
    };
    return `rgb(${channel(0)}, ${channel(2)}, ${channel(4)})`;
  }

  function draw() {
    if (!wheelSize) return;

    const W = wheelSize;
    const theme = palette();
    const R = W / 2 - 4;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, W);
    ctx.save();
    ctx.translate(W / 2, W / 2);

    const n = options.length;

    if (!n) {
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.96, 0, TAU);
      ctx.setLineDash([9, 10]);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }

    const segment = TAU / n;
    const colors = colorsFor(n);
    const fontSize = Math.max(12, Math.min(25, R * (n >= 16 ? 0.068 : n >= 11 ? 0.08 : 0.092)));

    // Gemas: cada porción es más oscura hacia el centro y se aclara en el borde.
    for (let i = 0; i < n; i++) {
      const start = rotation + i * segment;
      const gem = ctx.createRadialGradient(0, 0, R * 0.16, 0, 0, R);
      gem.addColorStop(0, shade(colors[i], -0.42));
      gem.addColorStop(0.58, colors[i]);
      gem.addColorStop(1, shade(colors[i], 0.16));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, start, start + segment);
      ctx.closePath();
      ctx.fillStyle = gem;
      ctx.fill();
    }

    // Separadores finos de luz.
    ctx.lineWidth = Math.max(1.5, R * 0.006);
    ctx.lineCap = "round";
    ctx.strokeStyle = theme.sep;
    for (let i = 0; i < n; i++) {
      const angle = rotation + i * segment;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(R * 0.2, 0);
      ctx.lineTo(R, 0);
      ctx.stroke();
      ctx.restore();
    }

    // Etiquetas: tinta oscura sobre colores claros, blanco sobre colores oscuros.
    // En la mitad izquierda se giran 180° para que siempre se lean de pie.
    ctx.font = `800 ${fontSize}px ${FONT}`;
    ctx.textBaseline = "middle";
    const maxWidth = R * 0.54;

    for (let i = 0; i < n; i++) {
      const angle = rotation + (i + 0.5) * segment;
      const flipped = Math.cos(angle) < 0;
      ctx.save();
      ctx.rotate(angle + (flipped ? Math.PI : 0));
      ctx.translate((flipped ? -1 : 1) * R * 0.9, 0);
      ctx.textAlign = flipped ? "left" : "right";
      ctx.fillStyle = labelColor(colors[i], theme);
      ctx.fillText(fitLabel(options[i], maxWidth), 0, 0);
      ctx.restore();
    }

    // Brillo fijo de luz sobre la rueda y viñeta en el borde.
    const gloss = ctx.createRadialGradient(-R * 0.32, -R * 0.38, R * 0.04, 0, 0, R);
    gloss.addColorStop(0, "rgba(255, 255, 255, 0.24)");
    gloss.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    gloss.addColorStop(1, "rgba(0, 0, 0, 0.22)");
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.fillStyle = gloss;
    ctx.fill();

    // Clavijas de luz en cada separador.
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    for (let i = 0; i < n; i++) {
      const angle = rotation + i * segment;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * R * 0.965, Math.sin(angle) * R * 0.965, Math.max(2, R * 0.011), 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  function resizeWheel() {
    const rect = els.canvas.getBoundingClientRect();
    const size = Math.floor(Math.min(rect.width, rect.height));
    if (size < 40) return;

    const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.floor(size * nextDpr);
    if (size === wheelSize && els.canvas.width === pixelWidth) return;

    wheelSize = size;
    dpr = nextDpr;
    els.canvas.width = pixelWidth;
    els.canvas.height = pixelWidth;
    draw();
  }

  /* ============================ Bombillas del bisel ============================ */

  function buildBulbs() {
    const host = $("bulbs");
    if (!host) return;
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * TAU - Math.PI / 2;
      const bulb = document.createElement("i");
      bulb.style.left = `${50 + Math.cos(angle) * 48.4}%`;
      bulb.style.top = `${50 + Math.sin(angle) * 48.4}%`;
      bulb.style.setProperty("--i", String(i));
      host.append(bulb);
    }
  }

  /* ============================ Confeti de papel ============================ */

  function resizeFx() {
    fxDpr = Math.min(window.devicePixelRatio || 1, 2);
    els.fx.width = Math.floor(window.innerWidth * fxDpr);
    els.fx.height = Math.floor(window.innerHeight * fxDpr);
  }

  function burstConfetti() {
    if (reduced()) return;

    const rect = els.canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const total = window.innerWidth < 640 ? 60 : 100;
    const theme = palette();
    const flecks = [theme.paper, ...theme.palette];

    for (let i = 0; i < total; i++) {
      const angle = Math.random() * TAU;
      const speed = 3 + Math.random() * 10;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        w: 3 + Math.random() * 6,
        h: 6 + Math.random() * 9,
        rot: Math.random() * TAU,
        vr: (Math.random() - 0.5) * 0.5,
        color: flecks[(Math.random() * flecks.length) | 0],
        life: 1,
        decay: 0.006 + Math.random() * 0.007,
        flip: Math.random() * TAU
      });
    }

    if (!fxRaf) fxRaf = window.requestAnimationFrame(stepConfetti);
  }

  function stepConfetti() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    fxCtx.setTransform(fxDpr, 0, 0, fxDpr, 0, 0);
    fxCtx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.vy += 0.24;
      p.vx *= 0.994;
      p.vy *= 0.996;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.flip += 0.09;
      p.life -= p.decay;
    }

    particles = particles.filter((p) => p.life > 0 && p.y < height + 60);

    for (const p of particles) {
      fxCtx.save();
      fxCtx.globalAlpha = Math.min(1, p.life * 1.5);
      fxCtx.translate(p.x, p.y);
      fxCtx.rotate(p.rot);
      fxCtx.scale(1, Math.max(0.25, Math.abs(Math.cos(p.flip))));
      fxCtx.fillStyle = p.color;
      fxCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      fxCtx.restore();
    }

    if (particles.length) {
      fxRaf = window.requestAnimationFrame(stepConfetti);
    } else {
      fxRaf = 0;
      fxCtx.clearRect(0, 0, width, height);
    }
  }

  /* ============================ Giro ============================ */

  function finishSpin(index) {
    const n = options.length;
    const label = options[Math.min(index, n - 1)];
    const color = colorsFor(n)[Math.min(index, n - 1)];

    spinning = false;
    els.wheel.classList.remove("is-spinning");
    els.resultValue.textContent = label;
    setWin(color);
    els.resultValue.classList.add("is-win");
    els.resultCard.dataset.state = "done";
    els.statusText.textContent = COPY.statusDone;
    els.resultMeta.textContent = COPY.metaDone;

    els.resultLive.textContent = "";
    window.setTimeout(() => { els.resultLive.textContent = `${COPY.statusDone}: ${label}`; }, 60);

    if (!reduced() && els.resultValue.animate) {
      els.resultValue.animate(
        [
          { opacity: 0, transform: "translateY(10px) scale(0.96)" },
          { opacity: 1, transform: "translateY(0) scale(1)" }
        ],
        { duration: 420, easing: "cubic-bezier(0.16, 0.84, 0.24, 1)" }
      );
    }

    history.unshift({ label, color });
    history = history.slice(0, 12);
    renderHistory();
    syncControls();
    saveState();

    playFanfare();
    burstConfetti();

    // En móvil, asegura que el resultado quede a la vista.
    const rect = els.resultCard.getBoundingClientRect();
    if (rect.bottom > window.innerHeight || rect.top < 0) {
      els.resultCard.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "nearest" });
    }
  }

  function spin() {
    if (spinning) return;

    if (options.length < 2) {
      toast(COPY.needTwo);
      if (window.matchMedia("(pointer: fine)").matches) els.input.focus();
      return;
    }

    spinning = true;
    syncControls();
    els.wheel.classList.add("is-spinning");
    els.resultCard.dataset.state = "spinning";
    els.resultValue.textContent = "…";
    els.resultValue.classList.remove("is-win");
    setWin(null);
    els.resultMeta.textContent = COPY.metaSpinning;
    els.statusText.textContent = COPY.statusSpinning;

    getAudio(); // Desbloquea el audio dentro del gesto del usuario.

    const n = options.length;
    const segment = TAU / n;
    const winner = Math.floor(Math.random() * n);
    const jitter = (Math.random() - 0.5) * segment * 0.44;
    const target = -Math.PI / 2 - (winner + 0.5) * segment - jitter;
    const turns = reduced() ? 2 : 5 + Math.floor(Math.random() * 3);
    const delta = normalize(target - normalize(rotation)) + TAU * turns;
    const startRotation = rotation;
    const duration = reduced() ? 650 : 4400 + Math.random() * 1400;
    const startTime = performance.now();
    let lastIndex = getIndexAtPointer(rotation);
    let lastTick = 0;

    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      rotation = startRotation + delta * eased;
      draw();

      const current = getIndexAtPointer(rotation);
      if (current !== lastIndex) {
        lastIndex = current;
        const nowMs = performance.now();
        if (t > 0.04 && nowMs - lastTick > 45) {
          lastTick = nowMs;
          playTick(t);
        }
      }

      if (t < 1) {
        window.requestAnimationFrame(frame);
      } else {
        rotation = normalize(startRotation + delta);
        draw();
        finishSpin(winner);
      }
    }

    window.requestAnimationFrame(frame);
  }

  /* ============================ Interfaz ============================ */

  function syncControls() {
    const busy = spinning;
    // El botón de girar no se desactiva en pleno giro para no perder el foco del teclado.
    els.spinBtn.disabled = options.length < 2;
    els.spinBtn.setAttribute("aria-disabled", String(busy));
    els.input.readOnly = busy;
    els.form.querySelector("button").disabled = busy;
    els.shuffleBtn.disabled = busy || options.length < 2;
    els.resetBtn.disabled = busy;
    els.list.querySelectorAll("button").forEach((btn) => {
      btn.disabled = busy;
    });
    els.hubSub.textContent = COPY.hubCount(options.length);
  }

  function renderOptions() {
    els.list.textContent = "";
    const colors = colorsFor(options.length);

    options.forEach((label, index) => {
      const item = document.createElement("li");
      item.className = "option";

      const dot = document.createElement("span");
      dot.className = "option__dot";
      dot.style.setProperty("--c", colors[index]);

      const text = document.createElement("span");
      text.className = "option__label";
      text.textContent = label;
      text.title = label;

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "option__remove";
      remove.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>';
      remove.setAttribute("aria-label", COPY.removeOption(label));
      remove.addEventListener("click", () => removeOption(index));

      item.append(dot, text, remove);
      els.list.append(item);
    });

    els.empty.hidden = options.length > 0;
    els.count.textContent = `${options.length}/${MAX_OPTIONS}`;
    els.canvas.setAttribute(
      "aria-label",
      COPY.wheelAria(options.length, options.join(", "))
    );

    draw();
    syncControls();
  }

  function renderHistory() {
    els.history.textContent = "";

    history.slice(0, 10).forEach((entry) => {
      const chip = document.createElement("li");
      chip.className = "chip";

      const dot = document.createElement("span");
      dot.className = "chip__dot";
      dot.style.setProperty("--c", entry.color);

      const label = document.createElement("span");
      label.textContent = entry.label;
      label.title = entry.label;

      chip.append(dot, label);
      els.history.append(chip);
    });

    els.historyEmpty.hidden = history.length > 0;
  }

  function showHint(message, isError) {
    els.hint.textContent = message;
    els.hint.classList.toggle("is-error", Boolean(isError && message));
    if (isError && message) els.input.setAttribute("aria-invalid", "true");
    else els.input.removeAttribute("aria-invalid");
  }

  function addOption(raw) {
    if (spinning) return;
    const text = raw.trim().replace(/\s+/g, " ");
    if (!text) {
      showHint(COPY.emptyOption, true);
      els.input.focus();
      return;
    }

    if (options.length >= MAX_OPTIONS) {
      showHint(COPY.maxOptions(MAX_OPTIONS), true);
      return;
    }

    showHint("", false);
    options.push(text.slice(0, 40));
    els.input.value = "";
    els.input.focus();
    renderOptions();
    saveState();
  }

  function removeOption(index) {
    if (spinning) return;
    options.splice(index, 1);
    renderOptions();
    saveState();

    // La lista se reconstruye: devuelve el foco al botón vecino (o al campo si no queda ninguno).
    const buttons = els.list.querySelectorAll(".option__remove");
    const next = buttons[Math.min(index, buttons.length - 1)];
    (next || els.input).focus();
  }

  function shuffleOptions() {
    if (spinning || options.length < 2) return;
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    renderOptions();
    saveState();
    toast(COPY.shuffled);
  }

  function resetAll() {
    if (spinning) return;
    if (!window.confirm(COPY.resetConfirm)) return;

    options = [...DEFAULT_OPTIONS];
    history = [];
    els.resultValue.textContent = "—";
    els.resultValue.classList.remove("is-win");
    setWin(null);
    els.resultMeta.textContent = COPY.metaIdle;
    els.statusText.textContent = COPY.statusIdle;
    els.resultCard.dataset.state = "idle";
    els.resultLive.textContent = "";
    showHint("", false);

    renderOptions();
    renderHistory();
    saveState();
    toast(COPY.resetDone);
  }

  /* ============================ Eventos ============================ */

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    addOption(els.input.value);
  });

  els.input.addEventListener("input", () => {
    if (els.input.hasAttribute("aria-invalid")) showHint("", false);
  });

  els.spinBtn.addEventListener("click", spin);
  els.canvas.addEventListener("click", spin);
  els.shuffleBtn.addEventListener("click", shuffleOptions);
  els.resetBtn.addEventListener("click", resetAll);
  if (els.themeBtn) els.themeBtn.addEventListener("click", toggleTheme);

  // Elegir el otro idioma se recuerda: la portada («/») lo usa para redirigir.
  document.querySelector(".lang-link")?.addEventListener("click", (event) => {
    try {
      localStorage.setItem(LANG_KEY, event.currentTarget.getAttribute("hreflang"));
    } catch {
      /* Sin almacenamiento: la portada decide por el idioma del navegador. */
    }
  });

  els.soundBtn.addEventListener("click", () => {
    muted = !muted;
    updateSoundUI();
    saveState();
    if (!muted) playTick(0.35);
  });

  window.addEventListener("keydown", (event) => {
    if (event.code !== "Space" && event.key !== " ") return;

    const active = document.activeElement;
    const tag = active ? active.tagName : "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (active && active.isContentEditable)) return;
    if (tag === "BUTTON" && active !== els.spinBtn) return;

    event.preventDefault();
    spin();
  });

  window.addEventListener("resize", () => {
    resizeWheel();
    resizeFx();
  });

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => resizeWheel()).observe(els.canvas);
  }

  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  systemTheme.addEventListener("change", (event) => {
    let stored = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch {
      /* Sin almacenamiento: se sigue el sistema. */
    }
    if (stored === "day" || stored === "night") return;
    setTheme(event.matches ? "night" : "day", false);
  });

  /* ============================ Inicio ============================ */

  if (!loadState()) options = [...DEFAULT_OPTIONS];

  buildBulbs();
  updateSoundUI();
  syncThemeUI();
  renderOptions();
  renderHistory();
  resizeFx();
  resizeWheel();
  syncControls();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => draw()).catch(() => {});
  }
})();
