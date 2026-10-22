(() => {
  "use strict";

  /* ============================================================
     Ruleta de la suerte — HTML, CSS y JavaScript sin dependencias
     ============================================================ */

  const TAU = Math.PI * 2;
  const STORAGE_KEY = "ruleta-de-la-suerte:v1";
  const THEME_KEY = "ruleta-theme";
  const MAX_OPTIONS = 20;
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FONT = '"Karla", "Segoe UI", system-ui, sans-serif';

  const DEFAULT_OPTIONS = [
    "Pizza", "Sushi", "Hamburguesa", "Tacos",
    "Ensalada", "Pasta", "Ramen", "Helado"
  ];

  /* ============================ Copia ============================ */

  const COPY = {
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
    shuffled: "Opciones barajadas",
    resetConfirm: "¿Reiniciar la ruleta, el veredicto y el historial?",
    resetDone: "De vuelta al principio",
    removeOption: (label) => `Quitar ${label}`,
    hubCount: (n) => (n === 1 ? "1 opción" : `${n} opciones`),
    wheelAria: (n, list) => (n ? `Ruleta con ${n} opciones: ${list}` : "Ruleta vacía"),
    dateline: (date) => {
      const text = new Intl.DateTimeFormat("es-ES", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      }).format(date);
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
  };

  /* ============================ Fin de copia ============================ */

  const THEMES = {
    day: {
      palette: [
        "#F28C54", "#A6D9D2", "#EEC967", "#9DB7E5",
        "#E9AAB0", "#89C4A6", "#F2B877", "#B7CCED",
        "#D7B4DF", "#C3DB98", "#E99B82", "#B4D8DB"
      ],
      ink: "#172C4B",
      paper: "#FFFFFF",
      tick: "rgba(26, 22, 17, 0.36)",
      tickStrong: "rgba(26, 22, 17, 0.62)",
      ring: "rgba(26, 22, 17, 0.5)",
      empty: "rgba(26, 22, 17, 0.28)"
    },
    night: {
      palette: [
        "#F28C54", "#A6D9D2", "#EEC967", "#9DB7E5",
        "#E9AAB0", "#89C4A6", "#F2B877", "#B7CCED",
        "#D7B4DF", "#C3DB98", "#E99B82", "#B4D8DB"
      ],
      ink: "#172C4B",
      paper: "#FFFFFF",
      tick: "rgba(242, 233, 216, 0.3)",
      tickStrong: "rgba(242, 233, 216, 0.55)",
      ring: "rgba(242, 233, 216, 0.4)",
      empty: "rgba(242, 233, 216, 0.24)"
    }
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
    statusText: $("statusText"),
    form: $("optionForm"),
    input: $("optionInput"),
    list: $("optionsList"),
    empty: $("optionsEmpty"),
    count: $("optCount"),
    shuffleBtn: $("shuffleBtn"),
    resetBtn: $("resetBtn"),
    history: $("history"),
    historyEmpty: $("historyEmpty"),
    soundBtn: $("soundBtn"),
    themeBtn: $("themeBtn"),
    issueDate: $("issueDate"),
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
            label: h.label,
            // El historial antiguo conserva colores de otra paleta: se reasigna
            // al color actual de la opción cuando sigue existiendo.
            color: theme.palette[options.indexOf(h.label)] || h.color || theme.palette[0]
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
    if (els.themeColor) els.themeColor.setAttribute("content", night ? "#15120e" : "#f4eee1");
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

  function drawTicks(R, theme) {
    const inner = R + 4;
    const outer = R + 11;

    for (let i = 0; i < 144; i++) {
      const angle = (i / 144) * TAU;
      const cardinal = i % 12 === 0;
      ctx.beginPath();
      ctx.lineWidth = cardinal ? 1.6 : 1;
      ctx.strokeStyle = cardinal ? theme.tickStrong : theme.tick;
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * (cardinal ? outer + 2 : outer), Math.sin(angle) * (cardinal ? outer + 2 : outer));
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, R + 15, 0, TAU);
    ctx.lineWidth = 1;
    ctx.strokeStyle = theme.ring;
    ctx.stroke();
  }

  function draw() {
    if (!wheelSize) return;

    const W = wheelSize;
    const theme = palette();
    const R = W / 2 - 26;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, W);
    ctx.save();
    ctx.translate(W / 2, W / 2);

    const n = options.length;

    drawTicks(R, theme);

    if (!n) {
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, TAU);
      ctx.setLineDash([3, 8]);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = theme.empty;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }

    const segment = TAU / n;
    const colors = colorsFor(n);
    const fontSize = Math.max(11, Math.min(22, R * (n >= 16 ? 0.062 : n >= 11 ? 0.073 : 0.084)));

    // Porciones en tintas planas.
    for (let i = 0; i < n; i++) {
      const start = rotation + i * segment;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, start, start + segment);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
    }

    // Separadores finos, como cortes de imprenta.
    ctx.lineWidth = Math.max(1.5, R * 0.008);
    ctx.strokeStyle = theme.paper;
    for (let i = 0; i < n; i++) {
      const angle = rotation + i * segment;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * R, Math.sin(angle) * R);
      ctx.stroke();
    }

    // Etiquetas: tinta oscura sobre tintas claras, papel sobre tintas oscuras.
    // En la mitad izquierda se giran 180° para que siempre se lean de pie.
    ctx.font = `600 ${fontSize}px ${FONT}`;
    ctx.textBaseline = "middle";
    const maxWidth = R * 0.56;

    for (let i = 0; i < n; i++) {
      const angle = rotation + (i + 0.5) * segment;
      const flipped = Math.cos(angle) < 0;
      ctx.save();
      ctx.rotate(angle + (flipped ? Math.PI : 0));
      ctx.translate((flipped ? -1 : 1) * R * 0.93, 0);
      ctx.textAlign = flipped ? "left" : "right";
      ctx.fillStyle = labelColor(colors[i], theme);
      ctx.fillText(fitLabel(options[i], maxWidth), 0, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, R + 15, 0, TAU);
    ctx.lineWidth = 1;
    ctx.strokeStyle = theme.ring;
    ctx.stroke();

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

  /* ============================ Confeti de papel ============================ */

  function resizeFx() {
    fxDpr = Math.min(window.devicePixelRatio || 1, 2);
    els.fx.width = Math.floor(window.innerWidth * fxDpr);
    els.fx.height = Math.floor(window.innerHeight * fxDpr);
  }

  function burstConfetti() {
    if (REDUCED) return;

    const rect = els.canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const total = window.innerWidth < 640 ? 60 : 100;
    const theme = palette();
    const flecks = [theme.ink, theme.palette[0], ...theme.palette];

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
    els.resultValue.style.setProperty("--win", color);
    els.resultValue.classList.add("is-win");
    els.resultCard.dataset.state = "done";
    els.statusText.textContent = COPY.statusDone;
    els.resultMeta.textContent = COPY.metaDone;

    els.resultCard.classList.remove("is-pop");
    void els.resultCard.offsetWidth;
    els.resultCard.classList.add("is-pop");

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
      els.resultCard.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" });
    }
  }

  function spin() {
    if (spinning) return;

    if (options.length < 2) {
      toast(COPY.needTwo);
      els.input.focus();
      return;
    }

    spinning = true;
    syncControls();
    els.wheel.classList.add("is-spinning");
    els.resultCard.dataset.state = "spinning";
    els.resultValue.textContent = "…";
    els.resultValue.classList.remove("is-win");
    els.resultValue.style.removeProperty("--win");
    els.resultMeta.textContent = COPY.metaSpinning;
    els.statusText.textContent = COPY.statusSpinning;

    getAudio(); // Desbloquea el audio dentro del gesto del usuario.

    const n = options.length;
    const segment = TAU / n;
    const winner = Math.floor(Math.random() * n);
    const jitter = (Math.random() - 0.5) * segment * 0.44;
    const target = -Math.PI / 2 - (winner + 0.5) * segment - jitter;
    const turns = REDUCED ? 2 : 5 + Math.floor(Math.random() * 3);
    const delta = normalize(target - normalize(rotation)) + TAU * turns;
    const startRotation = rotation;
    const duration = REDUCED ? 650 : 4400 + Math.random() * 1400;
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
    els.spinBtn.disabled = busy || options.length < 2;
    els.input.disabled = busy;
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
      const chip = document.createElement("span");
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

  function addOption(raw) {
    if (spinning) return;
    const text = raw.trim().replace(/\s+/g, " ");
    if (!text) return;

    if (options.length >= MAX_OPTIONS) {
      toast(COPY.maxOptions(MAX_OPTIONS));
      return;
    }

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
    els.resultValue.style.removeProperty("--win");
    els.resultMeta.textContent = COPY.metaIdle;
    els.statusText.textContent = COPY.statusIdle;
    els.resultCard.dataset.state = "idle";
    els.resultCard.classList.remove("is-pop");

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

  els.spinBtn.addEventListener("click", spin);
  els.canvas.addEventListener("click", spin);
  els.shuffleBtn.addEventListener("click", shuffleOptions);
  els.resetBtn.addEventListener("click", resetAll);
  if (els.themeBtn) els.themeBtn.addEventListener("click", toggleTheme);

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

  if (els.issueDate) els.issueDate.textContent = COPY.dateline(new Date());

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
