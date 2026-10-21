# 03 · Referencia de código

Referencia de las piezas de la aplicación. **`app.js` (ES) y `en/app.js` (EN) tienen la misma
estructura y numeración de líneas**; las diferencias son textos, comentarios, `STORAGE_KEY` y el
contenido de `DEFAULT_OPTIONS`. Los números de línea corresponden al estado verificado el 21/10/2026.

## 1. Constantes

| Constante | Línea | Valor (ES / EN) | Uso |
| --- | ---: | --- | --- |
| `TAU` | 8 | `Math.PI * 2` | Ángulo completo; porciones y normalización |
| `STORAGE_KEY` | 9 | `"ruleta-de-la-suerte:v1"` / `"spin-the-wheel:v1"` | Clave de `localStorage` de cada idioma |
| `MAX_OPTIONS` | 10 | `20` | Límite de opciones al añadir y al cargar |
| `REDUCED` | 11 | `matchMedia("(prefers-reduced-motion: reduce)").matches` | Movimiento reducido (se evalúa una sola vez) |
| `FONT` | 12 | `system-ui, -apple-system, "Segoe UI", …` | Tipografía del texto dentro del canvas |
| `DEFAULT_OPTIONS` | 14–17 | ES: `Pizza, Sushi, Hamburguesa, Tacos, Ensalada, Pasta, Ramen, Helado` · EN: `Pizza, Sushi, Burger, Tacos, Salad, Pasta, Ramen, Ice cream` | Lista inicial y destino de «Restablecer» |
| `PALETTE` | 19–22 | 12 colores hex (idénticos) | Colores de porciones, puntos, chips y confeti |

Paleta exacta, en orden:

```text
#FF6B6B  #FFB84D  #FFE066  #9AE66E  #4ECDC4  #4DA8FF
#8B7BFF  #D77BFF  #FF7BCB  #FF9F6B  #5EEAD4  #C084FC
```

## 2. Funciones

Las firmas son idénticas en ambos archivos. La columna «Textos» indica dónde hay cadenas traducidas
solo en `en/app.js`.

### Utilidades

| Función | Línea | Firma | Qué hace |
| --- | ---: | --- | --- |
| `normalize` | 67 | `(angle: number) => number` | Lleva un ángulo a `[0, 2π)` |
| `toast` | 69 | `(message: string) => void` | Muestra el toast 2,8 s; reinicia el temporizador si ya había uno |
| `colorsFor` | 76 | `(n: number) => string[]` | Devuelve `n` colores ciclando `PALETTE`; evita que el último repita el primero |
| `getIndexAtPointer` | 88 | `(rot: number) => number` | Índice de la porción bajo el puntero para una rotación dada |

`colorsFor(n)` asigna `PALETTE[i % 12]`. Si `n > 1` y el último color coincide con el primero
(caso `n = 13, 25…`), busca un color alternativo que no sea ni el primero ni el penúltimo.

### Persistencia

| Función | Línea | Qué hace |
| --- | ---: | --- |
| `loadState` | 98 | Lee y sanea el JSON guardado en la clave del idioma. Devuelve `true` si encontró datos, `false` si no o si falló |
| `saveState` | 124 | Serializa `{ options, history, muted }`; ignora errores de cuota/permiso |

Saneado al cargar:

| Campo | Regla |
| --- | --- |
| `options` | Debe ser array; descarta no-strings y vacíos; `trim`; recorta a 40 caracteres; máximo 20 |
| `history` | Debe ser array; cada entrada necesita `label` y `color` strings; máximo 12 |
| `muted` | `Boolean(data.muted)` |

Si `JSON.parse` falla o `localStorage` lanza, se devuelve `false` y se usan los valores por defecto
(la app no avisa al usuario).

### Sonido

| Función | Línea | Qué hace | Textos |
| --- | ---: | --- | --- |
| `getAudio` | 134 | Devuelve el `AudioContext` (lo crea y reanuda si hace falta) o `null` si está silenciado o no hay soporte | — |
| `playTick` | 149 | Tick cuadrado de 60 ms; frecuencia `740 + progress * 560` Hz; pico de ganancia 0,032 | — |
| `playFanfare` | 165 | Arpegio C5–E5–G5–C6 con ondas triangulares, 85 ms entre notas | — |
| `updateSoundUI` | 184 | Sincroniza `aria-pressed` (verdadero = silenciado), `aria-label`, `title` e iconos vía CSS | Sí (`Mute sound` / `Unmute sound`) |

### Dibujo

| Función | Línea | Qué hace |
| --- | ---: | --- |
| `drawHubDisc` | 193 | Disco central con degradado radial y dos anillos |
| `fitLabel` | 213 | Recorta el texto y añade `…` si supera `maxWidth` (mide con el contexto actual) |
| `draw` | 222 | Dibuja la ruleta completa; no hace nada si `wheelSize === 0` |
| `resizeWheel` | 320 | Ajusta tamaño y DPR del canvas de la ruleta y redibuja |

`draw()` usa `R = wheelSize / 2 - 5` (5 px de margen). El tamaño de fuente es
`max(10, min(22, R * factor))`, con factor `0.061` a partir de 16 opciones, `0.072` desde 11 y
`0.076` por debajo. El ancho máximo de etiqueta es `R * 0.57`, situada a `R * 0.92` del centro.

### Confeti

| Función | Línea | Qué hace |
| --- | ---: | --- |
| `resizeFx` | 338 | Ajusta el canvas de confeti al viewport con DPR máximo 2 |
| `burstConfetti` | 344 | Crea 120 partículas (70 si el ancho < 640 px) desde el centro de la ruleta; no hace nada con movimiento reducido |
| `stepConfetti` | 374 | Bucle de física y dibujo; se detiene solo al vaciar `particles` |

Cada partícula: `x, y, vx, vy, w, h, rot, vr, color, life, decay, round`. Gravedad `+0.28`,
rozamiento `0.992` horizontal / `0.995` vertical, vida inicial `1` y decaimiento `0.006–0.014`.

### Giro

| Función | Línea | Qué hace | Textos |
| --- | ---: | --- | --- |
| `finishSpin` | 418 | Fija el resultado, color y estado; añade al historial; guarda; suena; lanza confeti; asegura visibilidad | Sí |
| `spin` | 452 | Valida, bloquea controles, sortea ganador, calcula animación y ejecuta el bucle `requestAnimationFrame` | Sí |

### Interfaz

| Función | Línea | Qué hace | Textos |
| --- | ---: | --- | --- |
| `syncControls` | 516 | Habilita/deshabilita controles según `spinning` y `options.length`; actualiza el subtítulo del hub | Sí |
| `renderOptions` | 529 | Reconstruye la lista, contador, vacío, `aria-label` del canvas; llama a `draw()` y `syncControls()` | Sí |
| `renderHistory` | 570 | Pinta hasta 10 chips y alterna el mensaje «Aún no hay resultados» / «No results yet» | — |
| `addOption` | 592 | Normaliza espacios, valida, limita a 20 y 40 caracteres, limpia el input, renderiza y guarda | Sí |
| `removeOption` | 609 | Elimina por índice, renderiza y guarda | — |
| `shuffleOptions` | 616 | Fisher–Yates, renderiza, guarda y avisa con toast | Sí |
| `resetAll` | 627 | Confirma, restaura opciones por defecto, borra historial y resultado, guarda y avisa | Sí |

Notas de comportamiento (idénticas en ambos idiomas):

- `addOption` **no** impide duplicados.
- `addOption` conserva el foco en el input tras añadir.
- `resetAll` **no** cambia `muted`.
- `removeOption` no pide confirmación.
- `renderHistory` muestra 10 aunque se guarden 12.
- `syncControls` deshabilita el botón de girar cuando hay menos de 2 opciones.

## 3. Mapa de elementos del DOM

`const els = { … }` (líneas 26–47) cachea estos IDs, **iguales en `index.html` y `en/index.html`**:

| Clave JS | ID en HTML | Etiqueta / función |
| --- | --- | --- |
| `fx` | `fx` | Canvas de confeti (aria-hidden) |
| `wheel` | `wheel` | Contenedor de la ruleta; recibe `.is-spinning` |
| `canvas` | `wheelCanvas` | Canvas de la ruleta; `role="img"`; clic para girar |
| `spinBtn` | `spinBtn` | Botón central «GIRAR» / «SPIN» |
| `hubSub` | `hubSub` | Subtítulo «N opciones» / «N options» |
| `resultCard` | `resultCard` | Tarjeta de resultado; `data-state` |
| `resultValue` | `resultValue` | Texto del ganador; `aria-live="polite"` |
| `resultMeta` | `resultMeta` | Texto secundario del resultado |
| `statusText` | `statusText` | Estado: «Lista»/«Ready», «Girando»/«Spinning», «¡Resultado!»/«Result!» |
| `form` | `optionForm` | Formulario de alta |
| `input` | `optionInput` | Campo de texto (`maxlength="40"`, línea 86 de cada HTML) |
| `list` | `optionsList` | `<ul>` de opciones |
| `empty` | `optionsEmpty` | Mensaje de lista vacía |
| `count` | `optCount` | Contador `N/20` |
| `shuffleBtn` | `shuffleBtn` | Botón «Mezclar» / «Shuffle» |
| `resetBtn` | `resetBtn` | Botón «Restablecer» / «Reset» |
| `history` | `history` | Contenedor de chips |
| `historyEmpty` | `historyEmpty` | Mensaje sin historial |
| `soundBtn` | `soundBtn` | Botón de sonido; `aria-pressed` |
| `toast` | `toast` | Mensaje flotante; `role="status"` |

No están en `els` porque JS no los necesita: `.lang-switch` (enlace de idioma), `.topbar__actions`,
`.brand`, `.pointer`, `.hint`, `.footer` y `.noscript`.

## 4. Clases y atributos generados

| Selector | Generado por | Estados |
| --- | --- | --- |
| `.option` `.option__dot` `.option__label` `.option__remove` | `renderOptions` | `:hover`, `:disabled` |
| `.chip` `.chip__dot` | `renderHistory` | — |
| `.wheel.is-spinning` | `spin` / `finishSpin` | Brillo y cursor |
| `.result[data-state="idle\|spinning\|done"]` | `resetAll` / `spin` / `finishSpin` | Punto de estado y color |
| `.result__value.is-win` | `finishSpin` | Color `var(--win)` + sombra |
| `.result.is-pop` | `finishSpin` | Animación `popIn` (se reinicia con reflujo forzado) |
| `.toast.is-visible` | `toast` | Opacidad y desplazamiento |
| `#soundBtn[aria-pressed]` | `updateSoundUI` | Icono on/off |
| `--c` | `renderOptions` / `renderHistory` | Color del punto |
| `--win` | `finishSpin` | Color del texto ganador |

Clases estáticas de la cabecera bilingüe: `.topbar__actions` (contenedor flex) y `.lang-switch`
(enlace de 38 px). Ver documento 05.

## 5. Eventos y guardas

| Evento | Guarda / detalle |
| --- | --- |
| `submit` del formulario | `preventDefault`; `Enter` en el input dispara el submit nativo |
| `click` en `#wheelCanvas` | Sin guarda explícita; `spin()` ignora si ya está girando |
| `keydown` de `Espacio` | Ignora `INPUT`, `TEXTAREA`, `SELECT`, `contenteditable` y botones que no sean `#spinBtn`; hace `preventDefault` para evitar scroll |
| `click` en sonido | Guarda el estado; si se reactiva, reproduce un tick de confirmación |
| `resize` | Redimensiona ruleta y confeti |
| `ResizeObserver` | Solo si el navegador lo soporta; observa el canvas |
| Clic en `.lang-switch` | Navegación normal del navegador a la otra página (sin listener) |

Los botones de eliminar se recrean en cada `renderOptions`, por lo que sus listeners se añaden de nuevo
a cada render (no se acumulan porque los nodos anteriores se descartan).

## 6. Geometría y física del giro

### Sistema de ángulos

- El canvas usa `0 rad` a la derecha (3 en punto) y ángulos **positivos en sentido horario**.
- La porción `i` ocupa `[rotation + i·segmento, rotation + (i+1)·segmento]`.
- El puntero está fijo arriba, es decir, en `-π/2`.
- `getIndexAtPointer(rot) = floor(normalize(-π/2 - rot) / segmento)`.

### Cálculo del ganador

```js
winner = floor(random() * n)
jitter = (random() - 0.5) * segmento * 0.7          // ±35 % del segmento
target = -π/2 - (winner + 0.5) * segmento - jitter
delta  = normalize(target - normalize(rotation)) + 2π * turns
```

`normalize` devuelve siempre un valor en `[0, 2π)`, de modo que `delta` es positivo y el giro siempre
es en sentido horario. El `jitter` nunca saca al puntero de la porción ganadora porque su máximo es
`0.35·segmento` frente al margen de `0.5·segmento` hasta el borde.

### Animación

| Parámetro | Valor normal | Movimiento reducido |
| --- | --- | --- |
| Vueltas | `5 + floor(random()*3)` → 5, 6 o 7 | 2 |
| Duración | `4400 + random()*1400` ms → 4,4–5,8 s | 650 ms |
| Easing | `1 - (1 - t)^4` (ease-out cuártico) | Igual |
| Tick | Al cambiar de porción, desde `t > 0.04`, máximo 1 cada 45 ms | Igual (suena poco) |
| Confeti | Sí | No |
| Scroll al resultado | `smooth` si hace falta | `auto` |

Al acabar se hace `rotation = normalize(startRotation + delta)`, se redibuja y se llama a
`finishSpin(winner)`.

### Tamaños

| Elemento | Fórmula |
| --- | --- |
| Radio de la ruleta | `R = wheelSize/2 - 5` |
| Canvas | Cuadrado de `floor(min(ancho, alto))` px CSS, DPR limitado a 2 |
| Hub dibujado en canvas | Radio `0.34·R`, anillo a `0.42·R` |
| Botón hub HTML | 31 % del ancho de la ruleta |
| Puntero | 28×38 px (24×32 en móvil) |
| Canvas de confeti | Viewport completo × DPR (máx. 2) |

## 7. Puntos de extensión

> **Importante:** salvo `styles.css`, los cambios de lógica deben replicarse en `app.js` **y**
> `en/app.js`. Los textos, en `index.html` y `en/index.html`.

| Quiero cambiar… | Tocar |
| --- | --- |
| Opciones iniciales | `DEFAULT_OPTIONS` en `app.js:14` y `en/app.js:14` |
| Colores de porciones | `PALETTE` en ambos JS (`:19`) |
| Límite de opciones | `MAX_OPTIONS` en ambos JS (`:10`); el contador se ajusta solo |
| Longitud máxima de una opción | `maxlength` en ambos HTML (`:86`) y los dos `slice(0, 40)` de cada JS (`:107`, `:602`) |
| Claves de almacenamiento | `STORAGE_KEY` de cada idioma (`:9`); cambiarla invalida los datos de ese idioma |
| Velocidad del giro | `duration` y `turns` en `spin` (`:478–481`) de ambos JS |
| Sonidos | `playTick` / `playFanfare` (`:149–182`) |
| Colores y tipografía de la página | Tokens `:root` (`styles.css:2–16`), compartidos |
| Enlace de idioma | `.lang-switch` en cada HTML (`:35`) y estilos en `styles.css:232` |
| Puntos de ruptura | Media queries al final de `styles.css` |
| Textos y SEO | `index.html` y `en/index.html` (title, meta description, OG, hero) |
