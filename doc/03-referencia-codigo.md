# 03 · Referencia de código

Referencia de las piezas de la aplicación. **`app.js` (ES) y `en/app.js` (EN) comparten estructura,
orden de funciones y nombres**, pero no la numeración exacta: la versión inglesa ocupa tres líneas
menos. Los números de línea de esta página corresponden a `app.js` (ES); en `en/app.js` suelen estar
tres líneas antes. Las diferencias de contenido son los textos de `COPY`, los comentarios,
`STORAGE_KEY` y `DEFAULT_OPTIONS`. El estado verificado es el 21/10/2026.

## 1. Constantes

| Constante | Línea | Valor (ES / EN) | Uso |
| --- | ---: | --- | --- |
| `TAU` | 8 | `Math.PI * 2` | Ángulo completo; porciones y normalización |
| `STORAGE_KEY` | 9 | `"ruleta-de-la-suerte:v1"` / `"spin-the-wheel:v1"` | Clave de opciones, historial y sonido |
| `THEME_KEY` | 10 | `"ruleta-theme"` | Clave del tema (compartida por ambos idiomas) |
| `MAX_OPTIONS` | 11 | `20` | Límite de opciones al añadir y al cargar |
| `REDUCED` | 12 | `matchMedia("(prefers-reduced-motion: reduce)").matches` | Movimiento reducido (se evalúa una sola vez) |
| `FONT` | 13 | `"Karla", "Segoe UI", system-ui, sans-serif` | Tipografía del texto dentro del canvas |
| `DEFAULT_OPTIONS` | 15–18 | ES: `Pizza, Sushi, Hamburguesa, Tacos, Ensalada, Pasta, Ramen, Helado` · EN: `Pizza, Sushi, Burger, Tacos, Salad, Pasta, Ramen, Ice cream` | Lista inicial y destino de «Reiniciar» |
| `COPY` | 22–47 | Objeto de textos ES / EN | Toda la copia que JS escribe en la interfaz |
| `THEMES` | 51–78 | `day` y `night` | Paleta del canvas, tintas, marcas y aro por tema |

### Paletas del canvas

```text
Día:   #B83E27 #E4D5B8 #2C4A44 #D8A44E #33405C #D9A6A0
       #5A6A32 #CFC7B4 #6A3E58 #B7C6BC #8C3B2C #DCC49A

Noche: #E0704D #E2D2B4 #41706A #E0AC58 #4A5B82 #D8A49C
       #7E8F49 #C9C1AE #7A4C6C #AFC5B7 #D97A5B #D6BA86
```

Cada tema define además `ink`, `paper`, `tick`, `tickStrong`, `ring` y `empty`. Las paletas no están
en CSS: cambiarlas obliga a tocar ambos `app.js`.

## 2. Funciones

### Utilidades y color

| Función | Línea | Firma | Qué hace |
| --- | ---: | --- | --- |
| `normalize` | 126 | `(angle) => number` | Lleva un ángulo a `[0, 2π)` |
| `currentTheme` | 128 | `() => "day" \| "night"` | Lee `document.documentElement.dataset.theme` |
| `palette` | 132 | `() => object` | Devuelve `THEMES[theme]` con caída a `day` |
| `luminance` | 136 | `(hex) => number` | Luminancia relativa sRGB |
| `contrast` | 145 | `(a, b) => number` | Ratio de contraste WCAG entre dos hex |
| `labelColor` | 152 | `(hex, theme) => string` | Elige tinta o papel, el que más contraste dé sobre la porción |
| `toast` | 156 | `(message) => void` | Muestra el toast 2,8 s; reinicia el temporizador si ya había uno |
| `colorsFor` | 163 | `(n) => string[]` | Devuelve `n` colores ciclando la paleta; evita que el último repita el primero |
| `getIndexAtPointer` | 176 | `(rot) => number` | Índice de la porción bajo el puntero para una rotación dada |

`colorsFor(n)` asigna `palette[i % 12]`. Si `n > 1` y el último color coincide con el primero, busca
un color alternativo que no sea ni el primero ni el penúltimo.

### Persistencia

| Función | Línea | Qué hace |
| --- | ---: | --- |
| `loadState` | 186 | Lee y sanea el JSON de la clave del idioma. Devuelve `true` si encontró datos, `false` si no o si falló |
| `saveState` | 219 | Serializa `{ options, history, muted }`; ignora errores de cuota/permiso |

Saneado al cargar:

| Campo | Regla |
| --- | --- |
| `options` | Debe ser array; descarta no-strings y vacíos; `trim`; recorta a 40 caracteres; máximo 20 |
| `history` | Debe ser array; cada entrada necesita `label` string; máximo 12; el color se reasigna al de la opción actual si sigue existiendo |
| `muted` | `Boolean(data.muted)` |

El historial antiguo conserva su color solo si la opción ya no existe; si existe, adopta el color de
la paleta vigente. Si `JSON.parse` falla o `localStorage` lanza, se devuelve `false` y se usan los
valores por defecto (la app no avisa al usuario).

### Tema

| Función | Línea | Qué hace |
| --- | ---: | --- |
| `syncThemeUI` | 229 | Actualiza `aria-pressed` (verdadero = noche), `aria-label`, `title` y el `theme-color` del `<head>` |
| `setTheme` | 239 | Fija `data-theme`, sincroniza la UI, guarda si se pide y redibuja opciones, historial y canvas |
| `toggleTheme` | 254 | Alterna día/noche y persiste la elección |

La primera visita la resuelve el script inline del `<head>`: lee `ruleta-theme`; si no hay valor,
sigue `prefers-color-scheme`. Un listener de `matchMedia("(prefers-color-scheme: dark)")` cambia el
tema en caliente **solo** mientras no haya una preferencia guardada.

### Sonido

| Función | Línea | Qué hace | Textos |
| --- | ---: | --- | --- |
| `getAudio` | 260 | Devuelve el `AudioContext` (lo crea y reanuda si hace falta) o `null` si está silenciado o no hay soporte | — |
| `playTick` | 275 | Tick cuadrado de 60 ms; frecuencia `740 + progress * 560` Hz; pico de ganancia 0,026 | — |
| `playFanfare` | 291 | Arpegio C5–E5–G5–C6 con ondas triangulares, 85 ms entre notas, 520 ms cada una | — |
| `updateSoundUI` | 310 | Sincroniza `aria-pressed` (verdadero = silenciado), `aria-label`, `title` e iconos vía CSS | Sí (desde `COPY`) |

### Dibujo

| Función | Línea | Qué hace |
| --- | ---: | --- |
| `fitLabel` | 319 | Recorta el texto y añade `…` si supera `maxWidth` |
| `drawTicks` | 328 | Dibuja 144 marcas de graduación, una más larga cada 12, y el aro exterior |
| `draw` | 350 | Dibuja la ruleta completa; no hace nada si `wheelSize === 0` |
| `resizeWheel` | 431 | Ajusta tamaño y DPR del canvas de la ruleta y redibuja |

`draw()` usa `R = wheelSize / 2 - 26` (26 px para marcas y aro). El tamaño de fuente es
`max(11, min(22, R * factor))`, con factor `0.084` hasta 10 opciones, `0.073` de 11 a 15 y `0.062` a
partir de 16. El ancho máximo de etiqueta es `R * 0.56`, situada a `R * 0.93` del centro. Las
etiquetas de la mitad izquierda se giran 180° para no quedar boca abajo.

### Confeti

| Función | Línea | Qué hace |
| --- | ---: | --- |
| `resizeFx` | 449 | Ajusta el canvas de confeti al viewport con DPR máximo 2 |
| `burstConfetti` | 455 | Crea 100 flecos (60 si el ancho < 640 px) desde el centro de la ruleta; no hace nada con movimiento reducido |
| `stepConfetti` | 487 | Bucle de física y dibujo; se detiene solo al vaciar `particles` |

Cada partícula: `x, y, vx, vy, w, h, rot, vr, color, life, decay, flip`. Gravedad `+0.24`,
rozamiento `0.994` horizontal / `0.996` vertical, vida inicial `1` y decaimiento `0.006–0.013`. Se
dibujan como rectángulos de papel que giran y se escoran con `scale(1, |cos(flip)|)`.

### Giro

| Función | Línea | Qué hace | Textos |
| --- | ---: | --- | --- |
| `finishSpin` | 527 | Fija el resultado, color y estado; añade al historial; guarda; suena; lanza confeti; asegura visibilidad | Sí |
| `spin` | 561 | Valida, bloquea controles, sortea ganador, calcula animación y ejecuta el bucle `requestAnimationFrame` | Sí |

### Interfaz

| Función | Línea | Qué hace | Textos |
| --- | ---: | --- | --- |
| `syncControls` | 625 | Habilita/deshabilita controles según `spinning` y `options.length`; actualiza el subtítulo del hub | Sí |
| `renderOptions` | 638 | Reconstruye la lista, contador, vacío, `aria-label` del canvas; llama a `draw()` y `syncControls()` | Sí |
| `renderHistory` | 677 | Pinta hasta 10 chips y alterna el mensaje vacío | — |
| `addOption` | 699 | Normaliza espacios, valida, limita a 20 y 40 caracteres, limpia el input, renderiza y guarda | Sí |
| `removeOption` | 716 | Elimina por índice, renderiza y guarda | — |
| `shuffleOptions` | 723 | Fisher–Yates, renderiza, guarda y avisa con toast | Sí |
| `resetAll` | 734 | Confirma, restaura opciones por defecto, borra historial y resultado, guarda y avisa | Sí |

Notas de comportamiento:

- `addOption` **no** impide duplicados.
- `addOption` conserva el foco en el input tras añadir.
- `resetAll` **no** cambia `muted` ni el tema.
- `removeOption` no pide confirmación.
- `renderHistory` muestra 10 aunque se guarden 12.
- `syncControls` deshabilita el botón de girar cuando hay menos de 2 opciones.

## 3. Mapa de elementos del DOM

`const els = { … }` (líneas 82–106) cachea estos IDs, **iguales en `index.html` y `en/index.html`**:

| Clave JS | ID en HTML | Etiqueta / función |
| --- | --- | --- |
| `fx` | `fx` | Canvas de confeti (aria-hidden) |
| `wheel` | `wheel` | Contenedor de la ruleta; recibe `.is-spinning` |
| `canvas` | `wheelCanvas` | Canvas de la ruleta; `role="img"`; clic para girar |
| `spinBtn` | `spinBtn` | Botón central «Girar» / «Spin» |
| `hubSub` | `hubSub` | Subtítulo «N opciones» / «N options» |
| `resultCard` | `resultCard` | Pliego del veredicto; `data-state` |
| `resultValue` | `resultValue` | Texto del ganador; `aria-live="polite"` |
| `resultMeta` | `resultMeta` | Texto secundario del veredicto |
| `statusText` | `statusText` | Estado: «En espera», «Girando», «Resuelto» |
| `form` | `optionForm` | Formulario de alta |
| `input` | `optionInput` | Campo de texto (`maxlength="40"`) |
| `list` | `optionsList` | `<ul>` de opciones |
| `empty` | `optionsEmpty` | Mensaje de lista vacía |
| `count` | `optCount` | Contador `N/20` |
| `shuffleBtn` | `shuffleBtn` | Botón «Barajar» / «Shuffle» |
| `resetBtn` | `resetBtn` | Botón «Reiniciar» / «Reset» |
| `history` | `history` | Contenedor de chips |
| `historyEmpty` | `historyEmpty` | Mensaje sin historial |
| `soundBtn` | `soundBtn` | Botón de sonido; `aria-pressed` |
| `themeBtn` | `themeBtn` | Conmutador de tema; `aria-pressed` |
| `issueDate` | `issueDate` | Fecha editorial del masthead |
| `themeColor` | `themeColor` | `<meta name="theme-color">` que sigue al tema |
| `toast` | `toast` | Mensaje flotante; `role="status"` |

No están en `els` porque JS no los necesita: `.lang-link`, `.masthead__actions`, `.wordmark`,
`.pointer`, `.caption`, `.colophon` y `.noscript`.

## 4. Clases y atributos generados

| Selector | Generado por | Estados |
| --- | --- | --- |
| `.option` `.option__dot` `.option__label` `.option__remove` | `renderOptions` | `:hover`, `:disabled` |
| `.chip` `.chip__dot` | `renderHistory` | — |
| `.wheel.is-spinning` | `spin` / `finishSpin` | Cursor y aro del hub |
| `.result[data-state="idle\|spinning\|done"]` | `resetAll` / `spin` / `finishSpin` | Punto de estado y color |
| `.result__value.is-win` | `finishSpin` | Subrayado `var(--win)` |
| `.result.is-pop` | `finishSpin` | Animación `inkIn` (se reinicia con reflujo forzado) |
| `.toast.is-visible` | `toast` | Opacidad y desplazamiento |
| `html[data-theme]` | script inline / `setTheme` | Tokens de día o noche |
| `#soundBtn[aria-pressed]` | `updateSoundUI` | Icono on/off |
| `#themeBtn[aria-pressed]` | `syncThemeUI` | Icono sol/luna |
| `--c` | `renderOptions` / `renderHistory` | Color del punto |
| `--win` | `finishSpin` | Color del subrayado ganador |

Clases estáticas que JS no toca: `.masthead__actions`, `.lang-link`, `.slip`, `.plate`, `.caption`,
`.block`, `.panel__actions` y `.colophon`.

## 5. Eventos y guardas

| Evento | Guarda / detalle |
| --- | --- |
| `submit` del formulario | `preventDefault`; `Enter` en el input dispara el submit nativo |
| `click` en `#wheelCanvas` | Sin guarda explícita; `spin()` ignora si ya está girando |
| `click` en `#themeBtn` | `toggleTheme()`; persiste en `ruleta-theme` |
| `keydown` de `Espacio` | Ignora `INPUT`, `TEXTAREA`, `SELECT`, `contenteditable` y botones que no sean `#spinBtn`; hace `preventDefault` para evitar scroll |
| `click` en sonido | Guarda el estado; si se reactiva, reproduce un tick de confirmación |
| `resize` | Redimensiona ruleta y confeti |
| `ResizeObserver` | Solo si el navegador lo soporta; observa el canvas |
| `matchMedia(...).change` | Sigue el tema del sistema solo si no hay preferencia guardada |
| Clic en `.lang-link` | Navegación normal del navegador a la otra página (sin listener) |

Los botones de eliminar se recrean en cada `renderOptions`, por lo que sus listeners se añaden de
nuevo a cada render (no se acumulan porque los nodos anteriores se descartan).

## 6. Geometría y física del giro

### Sistema de ángulos

- El canvas usa `0 rad` a la derecha (3 en punto) y ángulos **positivos en sentido horario**.
- La porción `i` ocupa `[rotation + i·segmento, rotation + (i+1)·segmento]`.
- El puntero está fijo arriba, es decir, en `-π/2`.
- `getIndexAtPointer(rot) = floor(normalize(-π/2 - rot) / segmento)`.

### Cálculo del ganador

```js
winner = floor(random() * n)
jitter = (random() - 0.5) * segmento * 0.44         // ±22 % del segmento
target = -π/2 - (winner + 0.5) * segmento - jitter
delta  = normalize(target - normalize(rotation)) + 2π * turns
```

`normalize` devuelve siempre un valor en `[0, 2π)`, de modo que `delta` es positivo y el giro siempre
es en sentido horario. El `jitter` nunca saca al puntero de la porción ganadora porque su máximo es
`0.22·segmento` frente al margen de `0.5·segmento` hasta el borde.

### Animación

| Parámetro | Valor normal | Movimiento reducido |
| --- | --- | --- |
| Vueltas | `5 + floor(random()*3)` → 5, 6 o 7 | 2 |
| Duración | `4400 + random()*1400` ms → 4,4–5,8 s | 650 ms |
| Easing | `1 - (1 - t)^4` (ease-out cuártico) | Igual |
| Tick | Al cambiar de porción, desde `t > 0.04`, máximo 1 cada 45 ms | Igual (suena poco) |
| Confeti | Sí | No |
| Scroll al veredicto | `smooth` si hace falta | `auto` |

Al acabar se hace `rotation = normalize(startRotation + delta)`, se redibuja y se llama a
`finishSpin(winner)`.

### Tamaños

| Elemento | Fórmula |
| --- | --- |
| Radio de la ruleta | `R = wheelSize/2 - 26` |
| Canvas | Cuadrado de `floor(min(ancho, alto))` px CSS, DPR limitado a 2 |
| Marcas | 144, de `R + 4` a `R + 11`; aro a `R + 15` |
| Hub HTML | 30 % del ancho de la ruleta |
| Puntero | 22×34 px |
| Canvas de confeti | Viewport completo × DPR (máx. 2) |

## 7. Puntos de extensión

> **Importante:** salvo `styles.css`, los cambios de lógica deben replicarse en `app.js` **y**
> `en/app.js`. Los textos viven en `COPY` y en los dos HTML.

| Quiero cambiar… | Tocar |
| --- | --- |
| Opciones iniciales | `DEFAULT_OPTIONS` en ambos JS |
| Colores de porciones | `THEMES.day` / `THEMES.night` en ambos JS |
| Límite de opciones | `MAX_OPTIONS` en ambos JS; el contador se ajusta solo |
| Longitud máxima de una opción | `maxlength` en ambos HTML y los dos `slice(0, 40)` de cada JS |
| Claves de almacenamiento | `STORAGE_KEY` (por idioma) y `THEME_KEY` (compartida) |
| Velocidad del giro | `duration` y `turns` en `spin` de ambos JS |
| Sonidos | `playTick` / `playFanfare` |
| Textos de la interfaz | `COPY` en ambos JS |
| Colores y tipografía de la página | Tokens `:root` y `[data-theme="night"]` de `styles.css` |
| Enlace de idioma | `.lang-link` en cada HTML |
| Puntos de ruptura | Media queries `1020px` y `640px` de `styles.css` |
| Textos y SEO | `index.html` y `en/index.html` (title, meta description, OG, hero) |
