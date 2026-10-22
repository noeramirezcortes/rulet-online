# 02 · Arquitectura

## 1. Stack y enfoque

| Capa | Tecnología | Notas |
| --- | --- | --- |
| Estructura | HTML5 semántico | Dos documentos independientes: español e inglés |
| Presentación | CSS3 puro | Una sola hoja **compartida** por ambos idiomas |
| Lógica | JavaScript (ES2019 aprox.) | Dos copias: `app.js` y `en/app.js`, IIFE con `"use strict"` |
| Dibujo | Canvas 2D | Dos canvas por página: ruleta (`#wheelCanvas`) y confeti (`#fx`) |
| Audio | Web Audio API | Osciladores en tiempo real; sin archivos |
| Persistencia | `localStorage` | Una clave por idioma, mismo esquema |
| Build | Ninguno | Sin transpilación, bundler, minificado ni tests |

**No hay dependencias externas.** Las tipografías se sirven desde `assets/fonts/`; no hay CDN,
service worker ni `fetch`.

## 2. Estructura del repositorio

```text
herraminetasweb/
├─ index.html          Documento español (raíz)
├─ app.js              Lógica española
├─ en/
│  ├─ index.html       Documento inglés
│  └─ app.js           Lógica inglesa (copia traducida)
├─ styles.css          Estilos compartidos por ambos idiomas
├─ assets/fonts/       Bodoni Moda y Karla autoalojadas (6 woff2)
├─ preview.png         Captura 1440×1312 usada en el README
├─ README.md           Guía breve de uso y personalización
├─ PRODUCT.md          Verdad de producto
├─ DESIGN.md           Sistema visual y tokens
├─ .gitignore          Excluye skills de agentes, logs y pruebas locales
├─ .git/               Repositorio git
├─ skills-lock.json    Registro de la skill de agentes (no es parte de la app)
├─ doc/                Esta documentación
├─ .agents/ .devin/ .vibe/
│                      Copias de la skill «impeccable» para herramientas de IA (no se cargan)
└─ (sin package.json, sin tests)
```

La aplicación se compone de **cinco archivos**: dos HTML, dos JS y un CSS, más las fuentes
autoalojadas. `preview.png`, los documentos de producto/diseño y las carpetas de skills son accesorios.

## 3. Separación de responsabilidades

```text
index.html (ES)                 en/index.html (EN)
  ├─ mismo esqueleto y mismos IDs     ├─ mismo esqueleto y mismos IDs
  ├─ textos y metadatos en español    ├─ textos y metadatos en inglés
  ├─ <html lang="es">                 ├─ <html lang="en">
  ├─ enlace EN → en/index.html        ├─ enlace ES → ../index.html
  ├─ <script src="app.js">            ├─ <script src="app.js">
  └─ <link styles.css>                └─ <link ../styles.css>

styles.css (compartido)
  ├─ :root (día) y [data-theme="night"] con tokens de diseño
  ├─ @font-face de Bodoni Moda y Karla
  ├─ estados visuales dirigidos por clases/atributos que pone JS
  │   (.is-spinning, .is-win, .is-pop, .is-visible, [data-state], [aria-pressed])
  ├─ componentes de cabecera: .masthead__actions, .lang-link
  └─ media queries (1020px, 640px, prefers-reduced-motion, forced-colors)

app.js (ES)  ≈  en/app.js (EN)
  ├─ localiza elementos por ID (objeto `els`)
  ├─ mantiene el estado en variables de módulo
  ├─ renderiza lista, historial y canvas de forma imperativa
  ├─ gestiona eventos y persistencia
  └─ no exporta nada: todo vive dentro de la IIFE
```

`en/index.html` reutiliza `../styles.css`, de modo que cualquier cambio visual afecta a ambos idiomas.
En cambio, cada JS lleva sus propios textos, opciones por defecto y clave de almacenamiento.

### Contrato HTML ↔ JS

- **IDs obligatorios** (si falta uno, `els.x` es `null` y la app falla al usarlo): ver tabla en
  [03 · Referencia de código](03-referencia-codigo.md#3-mapa-de-elementos-del-dom).
- **Los IDs son idénticos en ambos idiomas**, lo que permite que los dos JS sean casi intercambiables.
- **Clases generadas por JS**: `.option`, `.option__dot`, `.option__label`, `.option__remove`,
  `.chip`, `.chip__dot`.
- **Atributos de estado**: `#resultCard[data-state]`, `.wheel.is-spinning`, `.result.is-pop`,
  `.result__value.is-win`, `.toast.is-visible`, `#soundBtn[aria-pressed]`.
- **Variables CSS inyectadas**: `--c` (punto de color de opción/chip) y `--win` (color del resultado).
- **Enlace de idioma**: `.lang-link` es HTML estático; JS no lo toca. El tema se refleja en
  `html[data-theme]` y en `#themeBtn[aria-pressed]`.

## 4. Módulos internos de cada `app.js`

Ambos archivos comparten la misma estructura y orden de secciones (verificado: las diferencias son
textos, comentarios, `STORAGE_KEY` y algunas opciones por defecto). La numeración siguiente es la de
`app.js`; en `en/app.js` las mismas secciones están tres líneas antes:

| Líneas | Sección | Responsabilidad |
| --- | --- | --- |
| 1–78 | Arranque | `"use strict"`, constantes, `COPY`, `THEMES` |
| 80–124 | Referencias y estado | `els`, contextos de canvas, variables de módulo |
| 126–182 | Utilidades y color | `normalize`, `currentTheme`, `palette`, `luminance`, `contrast`, `labelColor`, `toast`, `colorsFor`, `getIndexAtPointer` |
| 184–226 | Persistencia | `loadState`, `saveState` |
| 227–257 | Tema | `syncThemeUI`, `setTheme`, `toggleTheme` |
| 258–316 | Sonido | `getAudio`, `playTick`, `playFanfare`, `updateSoundUI` |
| 317–446 | Dibujo de la ruleta | `fitLabel`, `drawTicks`, `draw`, `resizeWheel` |
| 447–524 | Confeti | `resizeFx`, `burstConfetti`, `stepConfetti` |
| 525–622 | Giro | `finishSpin`, `spin` |
| 623–753 | Interfaz | `syncControls`, `renderOptions`, `renderHistory`, CRUD y reset |
| 754–824 | Eventos e inicio | Listeners, `ResizeObserver`, `matchMedia` e inicialización |

No hay clases ni prototipos: son funciones y variables de módulo. Esto es intencional (ver documento 07).

## 5. Estado de la aplicación

| Variable | Tipo | Inicial | Dueño / mutadores | Persistida |
| --- | --- | --- | --- | --- |
| `options` | `string[]` | `DEFAULT_OPTIONS` (distintas por idioma) | `addOption`, `removeOption`, `shuffleOptions`, `resetAll`, `loadState` | Sí |
| `history` | `{label, color}[]` | `[]` | `finishSpin` (unshift + recorte), `resetAll`, `loadState` | Sí |
| `rotation` | `number` (radianes) | `0` | `spin` (por frame) | No |
| `spinning` | `boolean` | `false` | `spin`, `finishSpin` | No |
| `muted` | `boolean` | `false` | botón de sonido, `loadState` | Sí |
| tema | `"day" \| "night"` | script del `<head>` | `setTheme`, `toggleTheme`, `matchMedia` | Sí (`ruleta-theme`) |
| `wheelSize` | `number` (px CSS) | `0` | `resizeWheel` | No |
| `dpr` | `number` | `1` | `resizeWheel` | No |
| `fxDpr` | `number` | `1` | `resizeFx` | No |
| `particles` | `object[]` | `[]` | `burstConfetti`, `stepConfetti` | No |
| `fxRaf` | `number` | `0` | animación de confeti | No |
| `toastTimer` | `number` | `0` | `toast` | No |
| `audio` | `AudioContext \| null` | `null` | `getAudio` | No |

Constantes relevantes: `TAU`, `STORAGE_KEY`, `THEME_KEY`, `MAX_OPTIONS`, `REDUCED`, `FONT`,
`DEFAULT_OPTIONS`, `COPY` y `THEMES`. La única diferencia de configuración entre idiomas es
`STORAGE_KEY` y el contenido de `DEFAULT_OPTIONS`/`COPY`.

## 6. Flujo de arranque

```text
La página correspondiente se carga (ES o EN)
  └─ IIFE se ejecuta
       1. cachea elementos y contextos 2D
       2. loadState()
            ├─ éxito → options/history/muted desde la clave de ese idioma
            └─ false  → options = DEFAULT_OPTIONS del idioma
       3. escribe la fecha editorial en #issueDate
       4. updateSoundUI()        → aria-pressed + etiqueta del botón
       5. syncThemeUI()          → aria-pressed del tema + theme-color
       6. renderOptions()        → lista DOM + aria-label del canvas + draw() + syncControls()
       7. renderHistory()        → chips + visibilidad del mensaje vacío
       8. resizeFx()             → tamaño del canvas de confeti
       9. resizeWheel()          → tamaño real + DPR + draw()
      10. syncControls()         → habilita/deshabilita controles
      11. registra listeners y ResizeObserver
```

`draw()` sale inmediatamente si `wheelSize === 0`; por eso el primer dibujo efectivo ocurre en
`resizeWheel()`.

El enlace de idioma no ejecuta JavaScript: el navegador navega a la otra página, que arranca de cero
con su propia clave de almacenamiento.

## 7. Flujo de un giro

```text
spin()
 ├─ guardas: si spinning → return; si options.length < 2 → toast + foco al input
 ├─ spinning = true; syncControls(); UI a estado "spinning"
 ├─ getAudio()                     ← desbloquea audio dentro del gesto del usuario
 ├─ sorteo: winner = floor(random * n)
 ├─ cálculo: target, turns (5–7), delta, duration (4400–5800 ms)
 └─ requestAnimationFrame(frame)
      frame(t):
        ├─ eased = 1 - (1 - t)^4
        ├─ rotation = inicio + delta * eased
        ├─ draw()
        ├─ detecta cambio de porción bajo el puntero → playTick (máx. 1 cada 45 ms)
        └─ al terminar: normaliza rotation, draw() y finishSpin(winner)
              ├─ escribe resultado y color, data-state="done", animación is-pop
              ├─ history.unshift + recorte a 12 + renderHistory + saveState
              ├─ playFanfare() + burstConfetti()
              └─ scrollIntoView si el pliego quedó fuera de pantalla
```

Con `prefers-reduced-motion: reduce` (leído **una vez** al cargar): 2 vueltas, 650 ms, sin confeti y
con scroll instantáneo.

Detalle matemático en [03 · Referencia de código](03-referencia-codigo.md#6-geometría-y-física-del-giro).

## 8. Flujo de render de la interfaz

La app no usa renderizado declarativo; cada acción reconstruye lo necesario:

| Acción | Reconstruye |
| --- | --- |
| `renderOptions()` | `<ul>`, contador, estado vacío, `aria-label` del canvas, dibujo y controles |
| `renderHistory()` | Chips del historial y mensaje vacío |
| `syncControls()` | `disabled` de girar/input/añadir/mezclar/restablecer/eliminar y subtítulo del hub |
| `finishSpin()` | Tarjeta de resultado, historial y controles |
| `resetAll()` | Resultado, opciones, historial y controles |

Los nodos de la lista y del historial se crean con `createElement` y `textContent` (nunca `innerHTML`),
lo que evita inyección de HTML con las etiquetas del usuario.

## 9. Mapa de eventos

| Elemento | Evento | Acción |
| --- | --- | --- |
| `#optionForm` | `submit` | `preventDefault` + `addOption(input.value)` |
| `#spinBtn` | `click` | `spin()` |
| `#wheelCanvas` | `click` | `spin()` |
| `#shuffleBtn` | `click` | `shuffleOptions()` |
| `#resetBtn` | `click` | `resetAll()` (con `confirm`) |
| `#soundBtn` | `click` | alterna `muted`, actualiza UI, guarda y suena un tick al reactivar |
| `#themeBtn` | `click` | `toggleTheme()`; guarda `ruleta-theme` y redibuja la paleta |
| `window` | `keydown` | `Espacio` → `spin()` salvo en campos editables o en botones distintos del de girar |
| `window` | `resize` | `resizeWheel()` + `resizeFx()` |
| `#wheelCanvas` | `ResizeObserver` | `resizeWheel()` |
| `matchMedia("(prefers-color-scheme: dark)")` | `change` | Cambia el tema si no hay preferencia guardada |
| `.lang-link` | navegación | Cambia de documento (ES ↔ EN); sin listener de JS |
| Botones `×` de cada opción | `click` | `removeOption(index)` (se reenganchan al reconstruir la lista) |

No hay listeners de `storage`, `visibilitychange`, `beforeunload` ni gestos táctiles.

## 10. Dibujo de la ruleta (pipeline)

`draw()` se ejecuta en cada frame del giro y en cada cambio de tamaño/opciones:

1. Ajusta la transformación al DPR (`ctx.setTransform(dpr, …)`) y limpia.
2. Centra el contexto en `(W/2, W/2)` y dibuja las 144 marcas de graduación.
3. Si no hay opciones: círculo discontinuo y termina.
4. Calcula `segment = TAU / n`, colores y tamaño de fuente adaptativo.
5. Pinta cada porción como un sector plano (`moveTo(0,0)`, `arc`, `closePath`, `fill`).
6. Dibuja los separadores finos en color papel.
7. Dibuja las etiquetas rotadas, con la tinta de mayor contraste, recortadas con `fitLabel` si no
   caben; las de la mitad izquierda giran 180°.
8. Dibuja el aro exterior y restaura el contexto.

El hub y el puntero **no** se dibujan en canvas: son HTML/CSS (`.hub` y `.pointer`).

### Redimensionado

`resizeWheel()` mide el canvas con `getBoundingClientRect()` (cuadrado por `aspect-ratio: 1`), limita
el DPR a 2, ajusta `canvas.width/height` en píxeles físicos y redibuja. Si el tamaño no cambió,
no hace nada.

## 11. Confeti (pipeline)

- Canvas `#fx` fijo a viewport, `pointer-events: none`, `z-index: 50`.
- `burstConfetti()` crea 100 flecos (60 en móvil) desde el centro de la ruleta, con velocidad y ángulo
  aleatorios, gravedad (`vy += 0.24`), rozamiento, rotación y vida decreciente.
- `stepConfetti()` limpia, integra física, elimina partículas muertas o fuera de pantalla por abajo y
  dibuja rectángulos de papel con `globalAlpha` y escorzo.
- Un solo `requestAnimationFrame` activo a la vez; se detiene y limpia al no quedar partículas.
- Se omite por completo con movimiento reducido.

## 12. Sonido

Grafo por tick: `OscillatorNode(square, 740–1300 Hz)` → `GainNode` (envolvente 0.026 → 0, 50 ms) →
`destination`. La fanfarria crea cuatro osciladores triangulares (C5, E5, G5, C6) separados 85 ms.

El `AudioContext` se crea de forma perezosa en el primer gesto (girar o reactivar sonido) para cumplir
las políticas de autoplay. Si el contexto está suspendido, se reanuda.

## 13. Persistencia en la arquitectura

`saveState()` serializa `{ options, history, muted }` tras cada cambio:

- terminar un giro,
- añadir / eliminar / mezclar,
- restablecer,
- alternar sonido.

Cada página escribe en **su** clave (`ruleta-de-la-suerte:v1` o `spin-the-wheel:v1`). El tema se
guarda aparte, en `ruleta-theme`, y lo comparten ambos idiomas. No hay guardado periódico ni
*debounce*; el volumen de datos es mínimo. Detalle en [04 · Persistencia](04-persistencia.md).

## 14. Limitaciones estructurales

- **Lógica duplicada**: `app.js` y `en/app.js` son copias; un arreglo en uno no llega al otro.
- **Acoplamiento por IDs**: no hay capa de componentes; renombrar un ID rompe la app en silencio.
- **Estado global mutable**: cualquier función puede modificarlo; la disciplina la marcan las guardas
  `if (spinning)`.
- **Sin i18n real**: los textos están incrustados; añadir un idioma implica duplicar HTML y JS.
- **Sin sincronización entre pestañas**: dos pestañas pueden pisarse los datos (gana la última).
- **Sin sincronización entre idiomas**: cada versión guarda opciones distintas.
- **Sin red**: no se puede compartir una lista por URL ni cargar opciones remotas.
