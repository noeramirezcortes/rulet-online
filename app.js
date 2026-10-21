(() => {
  "use strict";

  /* ============================================================
     Ruleta de la suerte — HTML, CSS y JavaScript sin dependencias
     ============================================================ */

  const TAU = Math.PI * 2;
  const STORAGE_KEY = "ruleta-de-la-suerte:v1";
  const MAX_OPTIONS = 20;
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  const DEFAULT_OPTIONS = [
    "Pizza", "Sushi", "Hamburguesa", "Tacos",
    "Ensalada", "Pasta", "Ramen", "Helado"
  ];

  const PALETTE = [
    "#FF6B6B", "#FFB84D", "#FFE066", "#9AE66E", "#4ECDC4", "#4DA8FF",
    "#8B7BFF", "#D77BFF", "#FF7BCB", "#FF9F6B", "#5EEAD4", "#C084FC"
  ];

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

  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 2800);
  }

  function colorsFor(n) {
    const colors = [];
    for (let i = 0; i < n; i++) colors.push(PALETTE[i % PALETTE.length]);

    // Evita que la última porción repita el color de la primera.
    if (n > 1 && colors[n - 1] === colors[0]) {
      const alt = PALETTE.find((c) => c !== colors[0] && c !== colors[n - 2]);
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
        history = data.history
          .filter((h) => h && typeof h.label === "string" && typeof h.color === "string")
          .slice(0, 12);
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
    gain.gain.exponentialRampToValueAtTime(0.032, now + 0.004);
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
      gain.gain.exponentialRampToValueAtTime(0.075, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(ac.destination);
      osc.start(start);
      osc.stop(start + 0.52);
    });
  }

  function updateSoundUI() {
    els.soundBtn.setAttribute("aria-pressed", String(muted));
    const label = muted ? "Activar sonido" : "Silenciar sonido";
    els.soundBtn.setAttribute("aria-label", label);
    els.soundBtn.title = label;
  }

  /* ============================ Dibujo de la ruleta ============================ */

  function drawHubDisc(R) {
    const hub = ctx.createRadialGradient(0, -R * 0.12, R * 0.02, 0, 0, R * 0.36);
    hub.addColorStop(0, "#1a2040");
    hub.addColorStop(1, "#090c16");

    ctx.beginPath();
    ctx.arc(0, 0, R * 0.34, 0, TAU);
    ctx.fillStyle = hub;
    ctx.fill();
    ctx.lineWidth = Math.max(1, R * 0.01);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, R * 0.42, 0, TAU);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
    ctx.stroke();
  }

  function fitLabel(text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let cut = text;
    while (cut.length > 1 && ctx.measureText(cut + "…").width > maxWidth) {
      cut = cut.slice(0, -1);
    }
    return cut.trimEnd() + "…";
  }

  function draw() {
    if (!wheelSize) return;

    const W = wheelSize;
    const R = W / 2 - 5;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, W);
    ctx.save();
    ctx.translate(W / 2, W / 2);

    const n = options.length;

    if (!n) {
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, TAU);
      ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
      ctx.fill();
      ctx.setLineDash([6, 10]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.stroke();
      ctx.setLineDash([]);
      drawHubDisc(R);
      ctx.restore();
      return;
    }

    const segment = TAU / n;
    const colors = colorsFor(n);
    const fontSize = Math.max(10, Math.min(22, R * (n >= 16 ? 0.061 : n >= 11 ? 0.072 : 0.076)));

    // Porciones
    for (let i = 0; i < n; i++) {
      const start = rotation + i * segment;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, start, start + segment);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.clip();

    // Luz y profundidad
    const shade = ctx.createRadialGradient(-R * 0.25, -R * 0.35, R * 0.08, 0, 0, R * 1.02);
    shade.addColorStop(0, "rgba(255, 255, 255, 0.2)");
    shade.addColorStop(0.45, "rgba(255, 255, 255, 0)");
    shade.addColorStop(1, "rgba(10, 10, 25, 0.2)");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.fill();

    // Separadores
    ctx.lineWidth = Math.max(1, R * 0.006);
    ctx.strokeStyle = "rgba(13, 16, 30, 0.18)";
    for (let i = 0; i < n; i++) {
      const angle = rotation + i * segment;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * R * 0.31, Math.sin(angle) * R * 0.31);
      ctx.lineTo(Math.cos(angle) * R, Math.sin(angle) * R);
      ctx.stroke();
    }
    ctx.restore();

    // Etiquetas
    ctx.font = `700 ${fontSize}px ${FONT}`;
    ctx.fillStyle = "#14182b";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const maxWidth = R * 0.57;

    for (let i = 0; i < n; i++) {
      const angle = rotation + (i + 0.5) * segment;
      ctx.save();
      ctx.rotate(angle);
      ctx.translate(R * 0.92, 0);
      ctx.fillText(fitLabel(options[i], maxWidth), 0, 0);
      ctx.restore();
    }

    drawHubDisc(R);

    // Borde exterior
    ctx.beginPath();
    ctx.arc(0, 0, R + 1.5, 0, TAU);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
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

  /* ============================ Confeti ============================ */

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
    const total = window.innerWidth < 640 ? 70 : 120;

    for (let i = 0; i < total; i++) {
      const angle = Math.random() * TAU;
      const speed = 3 + Math.random() * 11;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        w: 4 + Math.random() * 6,
        h: 6 + Math.random() * 8,
        rot: Math.random() * TAU,
        vr: (Math.random() - 0.5) * 0.5,
        color: PALETTE[(Math.random() * PALETTE.length) | 0],
        life: 1,
        decay: 0.006 + Math.random() * 0.008,
        round: Math.random() < 0.35
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
      p.vy += 0.28;
      p.vx *= 0.992;
      p.vy *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= p.decay;
    }

    particles = particles.filter((p) => p.life > 0 && p.y < height + 80);

    for (const p of particles) {
      fxCtx.save();
      fxCtx.globalAlpha = Math.min(1, p.life * 1.4);
      fxCtx.translate(p.x, p.y);
      fxCtx.rotate(p.rot);
      fxCtx.fillStyle = p.color;
      if (p.round) {
        fxCtx.beginPath();
        fxCtx.arc(0, 0, p.w / 2, 0, TAU);
        fxCtx.fill();
      } else {
        fxCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
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
    els.statusText.textContent = "¡Resultado!";
    els.resultMeta.textContent = "¿Te convence? Gira otra vez para cambiar el destino.";

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
      toast("Añade al menos 2 opciones para girar");
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
    els.resultMeta.textContent = "La ruleta está girando…";
    els.statusText.textContent = "Girando";

    getAudio(); // Desbloquea el audio dentro del gesto del usuario.

    const n = options.length;
    const segment = TAU / n;
    const winner = Math.floor(Math.random() * n);
    const jitter = (Math.random() - 0.5) * segment * 0.7;
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
    els.hubSub.textContent = options.length === 1 ? "1 opción" : `${options.length} opciones`;
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
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Quitar ${label}`);
      remove.addEventListener("click", () => removeOption(index));

      item.append(dot, text, remove);
      els.list.append(item);
    });

    els.empty.hidden = options.length > 0;
    els.count.textContent = `${options.length}/${MAX_OPTIONS}`;
    els.canvas.setAttribute(
      "aria-label",
      options.length
        ? `Ruleta con ${options.length} opciones: ${options.join(", ")}`
        : "Ruleta vacía"
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
      toast(`Puedes añadir hasta ${MAX_OPTIONS} opciones`);
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
    toast("Opciones mezcladas");
  }

  function resetAll() {
    if (spinning) return;
    if (!window.confirm("¿Restablecer las opciones, el resultado y el historial?")) return;

    options = [...DEFAULT_OPTIONS];
    history = [];
    els.resultValue.textContent = "—";
    els.resultValue.classList.remove("is-win");
    els.resultValue.style.removeProperty("--win");
    els.resultMeta.textContent = "Gira la ruleta para ver la opción ganadora.";
    els.statusText.textContent = "Lista";
    els.resultCard.dataset.state = "idle";
    els.resultCard.classList.remove("is-pop");

    renderOptions();
    renderHistory();
    saveState();
    toast("Todo listo de nuevo");
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

  /* ============================ Inicio ============================ */

  if (!loadState()) options = [...DEFAULT_OPTIONS];

  updateSoundUI();
  renderOptions();
  renderHistory();
  resizeFx();
  resizeWheel();
  syncControls();
})();
