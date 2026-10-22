# 03 · Referencia de código

Referencia de las piezas de la aplicación. **`app.js` (ES) y `en/app.js` (EN) comparten estructura,
orden de funciones, nombres **y numeración de líneas**. Las diferencias de contenido son los textos
de `COPY`, `plural` (`Intl.PluralRules("es")` / `("en")`), `STORAGE_KEY` y `DEFAULT_OPTIONS`. Los números
de línea corresponden a `app.js` y `en/app.js`. Diseño vigente: **Aurora** (ver documento 05).

## 1. Constantes

| Constante | Línea | Valor (ES / EN) | Uso |
| --- | ---: | --- | --- |
| `TAU` | 8 | `Math.PI * 2` | Ángulo completo; porciones y normalización |
| `STORAGE_KEY` | 9 | `"ruleta-de-la-suerte:v1"` / `"spin-the-wheel:v1"` | Clave de opciones, historial y sonido |
| `THEME_KEY` | 10 | `"ruleta-theme"` | Clave del tema (compartida por ambos idiomas) |
| `MAX_OPTIONS` | 11 | `20` | Límite de opciones al añadir y al cargar |
| `reducedQuery` | 12 | `matchMedia("(prefers-reduced-motion: reduce)")` | `MediaQueryList` del movimiento reducido |
| `reduced` | 13 | `() => reducedQuery.matches` | Se consulta en cada uso, así que un cambio de preferencia se respeta |
| `FONT` | 14 | `"Manrope", "Segoe UI", system-ui, sans-serif` | Tipografía del texto dentro del canvas |
| `DEFAULT_OPTIONS` | 16–19 | ES: `Pizza, Sushi, Hamburguesa, Tacos, Ensalada, Pasta, Ramen, Helado` · EN: `Pizza, Sushi, Burger, Tacos, Salad, Pasta, Ramen, Ice cream` | Lista inicial y destino de «Reiniciar» |
| `plural` | 23 | `new Intl.PluralRules("es" \| "en")` | Pluralización de «N opción/opciones» |
| `COPY` | 25–45 | Objeto de textos ES / EN | Toda la copia que JS escribe en la interfaz |
| `GEMS` | 50–54 | 12 colores | Paleta de las porciones (la misma de día y de noche) |
| `THEMES` | 56–59 | `day` y `night` | `palette` (= `GEMS`), `ink`, `paper` y `sep` por tema |

### Paleta del canvas

```text
#7C4DFF #F5A524 #E0338F #00B8D9 #10B981 #FF5D5D
#4F46E5 #9BE15D #FF8A3D #38BDF8 #C026D3 #14B8A6
```

La ruleta se dibuja sobre un pozo oscuro, así que `THEMES.day` y `THEMES.night` comparten la paleta
`GEMS`. Cada tema define además `ink` (`#0B0A1A`), `paper` (`#FFFFFF`) y `sep`, el color de los
separadores. Las paletas no están en CSS: cambiarlas obliga a tocar ambos `app.js`.

## 2. Funciones

### Utilidades y color

| Función | Línea | Firma | Qué hace |
| --- | ---: | --- | --- |
| `normalize` | 108 | `(angle) => number` | Lleva un ángulo a `[0, 2π)` |
| `currentTheme` | 110 | `() => "day" \| "night"` | Lee `document.documentElement.dataset.theme` |
| `palette` | 114 | `() => object` | Devuelve `THEMES[theme]` con caída a `day` |
| `luminance` | 118 | `(hex) => number` | Luminancia relativa sRGB |
| `contrast` | 127 | `(a, b) => number` | Ratio de contraste WCAG entre dos hex |
| `labelColor` | 134 | `(hex, theme) => string` | Elige tinta o blanco, el que más contraste dé sobre la porción |
| `setWin` | 139 | `(color \| null) => void` | Fija o elimina `--win` en `#resultCard` y `#wheel` (halo, bisel y borde del veredicto) |
| `toast` | 146 | `(message) => void` | Muestra el toast 2,8 s; reinicia el temporizador si ya había uno |
| `colorsFor` | 153 | `(n) => string[]` | Devuelve `n` colores ciclando la paleta; evita que el último repita el primero |
| `getIndexAtPointer` | 166 | `(rot) => number` | Índice de la porción bajo el puntero para una rotación dada |

`colorsFor(n)` asigna `palette[i % 12]`. Si `n > 1` y el último color coincide con el primero, busca
un color alternativo que no sea ni el primero ni el penúltimo.

### Persistencia

| Función | Línea | Qué hace |
| --- | ---: | --- |
| `loadState` | 176 | Lee y sanea el JSON de la clave del idioma. Devuelve `true` si encontró datos, `false` si no o si falló |
| `saveState` | 209 | Serializa `{ options, history, muted }`; ignora errores de cuota/permiso |

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
| `syncThemeUI` | 219 | Actualiza `aria-pressed` (verdadero = noche), `aria-label`, `title` y el `theme-color` del `<head>` |
| `setTheme` | 229 | Fija `data-theme`, sincroniza la UI, guarda si se pide y redibuja opciones, historial y canvas |
| `toggleTheme` | 244 | Alterna día/noche y persiste la elección |

La primera visita la resuelve el script inline del `<head>`: lee `ruleta-theme`; si no hay valor,
sigue `prefers-color-scheme`. Un listener de `matchMedia("(prefers-color-scheme: dark)")` cambia el
tema en caliente **solo** mientras no haya una preferencia guardada.

### Sonido

| Función | Línea | Qué hace | Textos |
| --- | ---: | --- | --- |
| `getAudio` | 250 | Devuelve el `AudioContext` (lo crea y reanuda si hace falta) o `null` si está silenciado o no hay soporte | — |
| `playTick` | 265 | Tick cuadrado de 60 ms; frecuencia `740 + progress * 560` Hz; pico de ganancia 0,026 | — |
| `playFanfare` | 281 | Arpegio C5–E5–G5–C6 con ondas triangulares, 85 ms entre notas, 520 ms cada una | — |
| `updateSoundUI` | 300 | Sincroniza `aria-pressed` (verdadero = silenciado), `aria-label`, `title` e iconos vía CSS | Sí (desde `COPY`) |

### Dibujo

| Función | Línea | Qué hace |
| --- | ---: | --- |
| `fitLabel` | 309 | Recorta el texto y añade `…` si supera `maxWidth` |
| `shade` | 319 | `(hex, t) => string`: aclara (`t > 0`) u oscurece (`t < 0`) un color; devuelve `rgb(...)` |
| `draw` | 330 | Dibuja la ruleta completa; no hace nada si `wheelSize === 0` |
| `resizeWheel` | 430 | Ajusta tamaño y DPR del canvas de la ruleta y redibuja |
| `buildBulbs` | 448 | Crea las 24 bombillas `<i>` del bisel dentro de `#bulbs` (posición en %, retardo `--i`) |

`draw()` usa `R = wheelSize / 2 - 4`. Orden de dibujo: porciones con degradado radial
(`shade(color, -0.42)` → color → `shade(color, +0.16)`), separadores de `theme.sep`, etiquetas, brillo
fijo con viñeta y una clavija blanca en cada separador. El tamaño de fuente es
`max(12, min(25, R * factor))`, con factor `0.092` hasta 10 opciones, `0.08` de 11 a 15 y `0.068` a
partir de 16, en Manrope 800. El ancho máximo de etiqueta es `R * 0.54`, situada a `R * 0.9` del
centro. Las etiquetas de la mitad izquierda se giran 180° para no quedar boca abajo. Sin opciones se
dibuja solo un círculo discontinuo. El bisel, el halo y el puntero no están en el canvas: son
elementos CSS (documento 05, §4).

### Confeti

| Función | Línea | Qué hace |
| --- | ---: | --- |
| `resizeFx` | 464 | Ajusta el canvas de confeti al viewport con DPR máximo 2 |
| `burstConfetti` | 470 | Crea 100 flecos (60 si el ancho < 640 px) desde el centro de la ruleta, con los colores de la paleta y blanco; no hace nada con movimiento reducido |
| `stepConfetti` | 502 | Bucle de física y dibujo; se detiene solo al vaciar `particles` |

Cada partícula: `x, y, vx, vy, w, h, rot, vr, color, life, decay, flip`. Gravedad `+0.24`,
rozamiento `0.994` horizontal / `0.996` vertical, vida inicial `1` y decaimiento `0.006–0.013`. Se
dibujan como rectángulos que giran y se escoran con `scale(1, |cos(flip)|)`.

### Giro

| Función | Línea | Qué hace | Textos |
| --- | ---: | --- | --- |
| `finishSpin` | 542 | Fija resultado, color (`setWin`) y estado; anuncia «Resuelto: X» en `#resultLive`; anima la entrada con `animate()`; añade al historial; guarda; suena; lanza confeti; asegura visibilidad | Sí |
| `spin` | 585 | Valida, bloquea controles, sortea ganador, calcula animación y ejecuta el bucle `requestAnimationFrame` | Sí |

### Interfaz

| Función | Línea | Qué hace | Textos |
| --- | ---: | --- | --- |
| `syncControls` | 649 | Actualiza controles según `spinning` y `options.length`: el hub usa `aria-disabled` durante el giro (y `disabled` solo con menos de 2 opciones), el campo pasa a `readOnly`; actualiza el subtítulo del hub | Sí |
| `renderOptions` | 664 | Reconstruye la lista, contador, vacío, `aria-label` del canvas; llama a `draw()` y `syncControls()` | Sí |
| `renderHistory` | 703 | Pinta hasta 10 chips (`<li>`) y alterna el mensaje vacío | — |
| `showHint` | 725 | Escribe el mensaje bajo el campo (`#optionHint`) y marca `aria-invalid` si es un error | — |
| `addOption` | 732 | Normaliza espacios, valida (vacío y límite de 20 se avisan en línea con `showHint`), limita a 40 caracteres, limpia el input, renderiza y guarda | Sí |
| `removeOption` | 754 | Elimina por índice, renderiza, guarda y devuelve el foco al botón `×` vecino (o al campo) | — |
| `shuffleOptions` | 766 | Fisher–Yates, renderiza, guarda y avisa con toast | Sí |
| `resetAll` | 777 | Confirma, restaura opciones por defecto, borra historial, resultado, color y aviso del campo, guarda y avisa | Sí |

Notas de comportamiento:

- `addOption` **no** impide duplicados.
- `addOption` conserva el foco en el input tras añadir.
- `resetAll` **no** cambia `muted` ni el tema.
- `removeOption` no pide confirmación.
- `renderHistory` muestra 10 aunque se guarden 12.
- `syncControls` deshabilita (`disabled`) el botón de girar solo cuando hay menos de 2 opciones; durante el giro usa `aria-disabled`.
- `spin` con menos de 2 opciones muestra un toast y solo enfoca el campo si el puntero es fino (`pointer: fine`).

## 3. Mapa de elementos del DOM

`const els = { … }` (líneas 63–88) cachea estos IDs, **iguales en `index.html` y `en/index.html`**:

| Clave JS | ID en HTML | Etiqueta / función |
| --- | --- | --- |
| `fx` | `fx` | Canvas de confeti (aria-hidden) |
| `wheel` | `wheel` | Contenedor de la ruleta; recibe `.is-spinning` |
| `canvas` | `wheelCanvas` | Canvas de la ruleta; `role="img"`; clic para girar |
| `spinBtn` | `spinBtn` | Botón central «Girar» / «Spin» |
| `hubSub` | `hubSub` | Subtítulo «N opciones» / «N options» |
| `resultCard` | `resultCard` | Tarjeta del veredicto; `data-state` |
| `resultValue` | `resultValue` | Texto del ganador |
| `resultMeta` | `resultMeta` | Texto secundario del veredicto |
| `resultLive` | `resultLive` | Región `aria-live` oculta donde se anuncia «Resuelto: X» |
| `statusText` | `statusText` | Estado: «En espera», «Girando», «Resuelto» |
| `form` | `optionForm` | Formulario de alta |
| `input` | `optionInput` | Campo de texto (`maxlength="40"`) |
| `hint` | `optionHint` | Mensaje en línea bajo el campo (errores y avisos) |
| `list` | `optionsList` | `<ul>` de opciones |
| `empty` | `optionsEmpty` | Mensaje de lista vacía |
| `count` | `optCount` | Contador `N/20` |
| `shuffleBtn` | `shuffleBtn` | Botón «Barajar» / «Shuffle» |
| `resetBtn` | `resetBtn` | Botón «Reiniciar» / «Reset» |
| `history` | `history` | `<ul>` de chips |
| `historyEmpty` | `historyEmpty` | Mensaje sin historial |
| `soundBtn` | `soundBtn` | Botón de sonido; `aria-pressed` |
| `themeBtn` | `themeBtn` | Conmutador de tema; `aria-pressed` |
| `themeColor` | `themeColor` | `<meta name="theme-color">` que sigue al tema |
| `toast` | `toast` | Mensaje flotante; `role="status"` |

`buildBulbs` busca `#bulbs` por su cuenta. No están en `els` porque JS no los necesita: `.lang-link`,
`.masthead__actions`, `.wordmark`, `.pointer`, `.bezel`, `.wheel__glow`, `.caption`, `.colophon` y
`.noscript`.

## 4. Clases y atributos generados

| Selector | Generado por | Estados |
| --- | --- | --- |
| `.option` `.option__dot` `.option__label` `.option__remove` | `renderOptions` | `:hover`, `:disabled` |
| `.chip` `.chip__dot` | `renderHistory` | — |
| `.wheel.is-spinning` | `spin` / `finishSpin` | Cursor, halo, bombillas y anillo del hub |
| `#bulbs > i` | `buildBulbs` | 24 bombillas con `--i` |
| `.result[data-state="idle\|spinning\|done"]` | `resetAll` / `spin` / `finishSpin` | Punto de estado y color |
| `.result__value.is-win` | `finishSpin` | `text-shadow` del color ganador |
| `.field-hint.is-error`, `input[aria-invalid]` | `showHint` | Error en línea bajo el campo |
| `.toast.is-visible` | `toast` | Opacidad y desplazamiento |
| `html[data-theme]` | script inline / `setTheme` | Tokens de día o noche |
| `#soundBtn[aria-pressed]` | `updateSoundUI` | Icono on/off |
| `#themeBtn[aria-pressed]` | `syncThemeUI` | Icono sol/luna |
| `--c` | `renderOptions` / `renderHistory` | Color del punto |
| `--win` | `setWin` | Color ganador en `#resultCard` y `#wheel` (borde, resplandor y halo) |

Clases estáticas que JS no toca: `.masthead`, `.masthead__actions`, `.lang-link`, `.skip`, `.slip`,
`.plate`, `.bezel`, `.caption`, `.block`, `.panel__actions` y `.colophon`.

## 5. Eventos y guardas

| Evento | Guarda / detalle |
| --- | --- |
| `submit` del formulario | `preventDefault`; `Enter` en el input dispara el submit nativo |
| `click` en `#wheelCanvas` | Sin guarda explícita; `spin()` ignora si ya está girando |
| `click` en `#themeBtn` | `toggleTheme()`; persiste en `ruleta-theme` |
| `input` en el campo | Limpia el error en línea (`aria-invalid`) en cuanto se escribe |
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
| Entrada del resultado | `animate()` de 420 ms | Sin animación |

Al acabar se hace `rotation = normalize(startRotation + delta)`, se redibuja y se llama a
`finishSpin(winner)`.

### Tamaños

| Elemento | Fórmula |
| --- | --- |
| Radio de la ruleta | `R = wheelSize/2 - 4` |
| Canvas | Cuadrado de `floor(min(ancho, alto))` px CSS (86 % de `.wheel`), DPR limitado a 2 |
| Bombillas | 24, a un 48,4 % del lado de `.wheel`, de 2,3 % de diámetro |
| Hub HTML | 27 % del ancho de la rueda |
| Puntero | `clamp(28px, 7%, 42px)` de ancho, proporción 34:44 |
| Canvas de confeti | Viewport completo × DPR (máx. 2) |

## 7. Puntos de extensión

> **Importante:** salvo `styles.css`, los cambios de lógica deben replicarse en `app.js` **y**
> `en/app.js`. Los textos viven en `COPY` y en los dos HTML.

| Quiero cambiar… | Tocar |
| --- | --- |
| Opciones iniciales | `DEFAULT_OPTIONS` en ambos JS |
| Colores de porciones | `GEMS` (y `THEMES`) en ambos JS |
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
