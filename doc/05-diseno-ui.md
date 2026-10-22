# 05 · Diseño y UI

## 1. Intención visual

El diseño se llama **Aurora**. La página es un escenario: una aurora de colores que deriva despacio
detrás de todo, paneles de vidrio esmerilado encima y, en el centro, una ruleta con bisel cromado,
bombillas y porciones de gema. Es oscura por defecto y pasa a un amanecer en pastel de día.

Cuatro ideas lo gobiernan:

- **La aurora es el escenario.** El color vive en el fondo y en la ruleta; la interfaz es vidrio.
- **La ruleta es la pieza principal.** Bisel cromado, 24 bombillas que parpadean en cadena, porciones
  con degradado radial, brillo fijo de luz y clavijas en cada separador.
- **El veredicto tiñe la escena.** Al terminar un giro, el color ganador (`--win`) colorea el halo
  de la rueda, el resplandor del bisel y el borde de la tarjeta del veredicto.
- **Legibilidad primero.** El veredicto es la única superficie opaca (con un tinte suave del color
  ganador) para que el texto se lea siempre, aunque la aurora esté detrás.

La misma hoja `styles.css` se usa en español (`/es/`), en inglés (`/en/`), en la portada y en la 404;
las páginas de idioma la referencian como `../styles.css`. El diseño es idéntico en ambos idiomas salvo los textos.

## 2. Temas y tokens

Dos temas comparten estructura y componentes:

- **Noche** (`[data-theme="night"]`): fondo `#07060f`, texto `#f4f2ff`, acento `#8b7bff`.
- **Día** (`:root`): fondo `#f1efff`, texto `#15122e`, acento `#5b4bff`.

El atributo `data-theme="day|night"` vive en `<html>`. `theme.js`, un script síncrono del `<head>`, lo fija antes
de pintar para evitar el destello del tema equivocado, y sincroniza el `theme-color`:

1. Si `localStorage["ruleta-theme"]` es `day` o `night`, usa esa preferencia.
2. Si no, sigue `prefers-color-scheme`.
3. Si el almacenamiento falla, cae en `day`.

`color-scheme` cambia con el tema, de modo que los controles nativos y las barras de desplazamiento
acompañan al tema.

| Token | Día | Noche | Uso |
| --- | --- | --- | --- |
| `--bg` | `#f1efff` | `#07060f` | Fondo de la página |
| `--surface` | `#fbfaff` | `#15132b` | Superficie opaca del veredicto |
| `--text` | `#15122e` | `#f4f2ff` | Texto principal |
| `--text-soft` | `#403c6a` | `#c5c2e6` | Texto secundario |
| `--text-mute` | `#5a5589` | `#9d99c8` | Metadatos y etiquetas |
| `--glass` | `rgba(255,255,255,.58)` | `rgba(255,255,255,.055)` | Fondo de los paneles de vidrio |
| `--glass-strong` | `rgba(255,255,255,.82)` | `rgba(255,255,255,.1)` | Hover y superficies destacadas |
| `--glass-border` | `rgba(21,18,46,.12)` | `rgba(255,255,255,.15)` | Bordes de 1 px |
| `--field` | `rgba(21,18,46,.05)` | `rgba(255,255,255,.06)` | Campo, filas y chips |
| `--accent` | `#5b4bff` | `#8b7bff` | Acento principal |
| `--accent-2` | `#0b8fb0` | `#22d3ee` | Acento frío (hover de bordes, anillo del hub) |
| `--accent-3` | `#d6247f` | `#ff4fa3` | Acento cálido (errores, estado «girando») |
| `--btn-grad` | violeta → rosa | cian → violeta → rosa | Botón de añadir y enlace de salto |
| `--on-btn` | `#ffffff` | `#0b0a1a` | Texto sobre el degradado del botón |
| `--text-grad` | violeta → rosa → naranja | cian → lila → rosa | Palabra clave del titular |
| `--focus` | `#5b4bff` | `#22d3ee` | Contorno de foco |
| `--aurora-a…d` | pasteles | violetas, cian y rosa | Capas de la aurora |
| `--radius` / `--radius-sm` | `24px` / `14px` | igual | Tarjetas y controles |

Sombras: `--card-shadow` (desplazamiento vertical y desenfoque) más un brillo interior superior
(`inset 0 1px 0 var(--glass-hi)`) en las superficies de vidrio.

### Colores de la ruleta

Las porciones no usan tokens CSS: viven en `GEMS` dentro de `app.js`. Se dibujan sobre
un pozo oscuro, por lo que la paleta es **la misma de día y de noche** (`THEMES.day` y `THEMES.night`
apuntan a ella):

```text
#7C4DFF #F5A524 #E0338F #00B8D9 #10B981 #FF5D5D
#4F46E5 #9BE15D #FF8A3D #38BDF8 #C026D3 #14B8A6
```

Cada porción se rellena con un degradado radial (`shade(color, -0.42)` en el centro, el color puro
al 58 % del radio y `shade(color, +0.16)` en el borde). Después se dibujan los separadores, las
etiquetas, un brillo fijo (`rgba(255,255,255,.24)` arriba a la izquierda, viñeta oscura en el borde)
y una clavija blanca en cada separador.

La etiqueta de cada porción elige entre tinta (`#0B0A1A`) y blanco según cuál dé **mayor contraste**
(`labelColor`). No se usa un umbral de luminancia fijo.

## 3. Tipografía

Dos familias autoalojadas en `assets/fonts/` (woff2 variables, subconjuntos latino y latín extendido):

- **Unbounded** (400–900) — titular, marca, títulos de bloque, botón central y valor del veredicto.
  Es ancha y geométrica; se usa con peso 700–800 y tracking negativo.
- **Manrope** (400–800) — interfaz, etiquetas, opciones, botones y texto de las porciones del canvas.

Ambas se declaran con `font-display: swap` y se precargan las variantes latinas en el `<head>`.
No hay peticiones a Google Fonts ni a ningún CDN.

| Elemento | Tamaño | Detalle |
| --- | --- | --- |
| `h1` | `clamp(2.1rem, 5.6vw, 4.3rem)` | Unbounded 800, `line-height: 1.04`, `letter-spacing: -.04em`, centrado, máx. `18ch` |
| Palabra clave del `h1` | igual | Degradado `--text-grad` con `background-clip: text` y `@keyframes shimmer` |
| Lede | `clamp(1rem, 1.5vw, 1.12rem)` | Manrope, `line-height: 1.55`, máx. `50ch` |
| Marca | `1.02rem` | Unbounded 700 |
| Etiqueta de marca | `.7rem` | Mayúsculas, `letter-spacing: .1em`; se oculta por debajo de 760px |
| Meta del hero | `.74rem` | Mayúsculas, píldoras de vidrio con punto de degradado |
| Títulos de bloque | `.98rem` | Unbounded 700 |
| Etiquetas | `.74rem` | Mayúsculas, `letter-spacing: .16em` |
| Valor del veredicto | `clamp(1.9rem, 4.6vw, 3.1rem)` | Unbounded 800; con `.is-win` lleva `text-shadow` del color ganador |
| Texto meta del veredicto | `.92rem` | `--text-soft` |
| Hub «Girar» | `clamp(.78rem, 2.5vw, 1.3rem)` | Unbounded 800, mayúsculas, `letter-spacing: .06em` |
| Contador del hub | `clamp(.62rem, 1.1vw, .74rem)` | Cifras tabulares |
| Opciones | `.97rem` | Una línea con elipsis |
| Campo de texto | `.98rem` | — |
| Botones | `.86rem` | Manrope 800 |
| Chips del historial | `.86rem` | Una línea con elipsis |
| Colofón | `.8rem` | `text-wrap: pretty` |
| Toast | `.88rem` | — |

Texto del canvas: `max(12px, min(25px, R × factor))`, con factor `0.092` hasta 10 opciones, `0.08`
hasta 15 y `0.068` a partir de 16, en Manrope 800. El texto se recorta con puntos suspensivos si no
cabe (`R × 0.54` de ancho máximo, situado a `R × 0.9` del centro).

## 4. Layout

```text
body        fondo + puntos sutiles; ::before y ::after = capas de aurora (fixed, z-index -1)
.app        max-width 1180px · gutter fluido · z-index 1
├─ .masthead   píldora de vidrio sticky: marca + etiqueta · acciones (tema, idioma, sonido)
├─ .hero       columna centrada: h1 · lede · píldoras de meta
├─ .stage      grid 1fr | 340–420px
│  ├─ .stage__wheel   .plate (rueda hasta 600px) · caption · tarjeta del veredicto
│  └─ .panel          opciones · historial
└─ .colophon   créditos y privacidad, centrados
```

- `.app` centra el contenido y mantiene el `z-index` por encima del canvas de confeti.
- `.fx` es un canvas fijo a pantalla completa, `pointer-events: none`, `z-index: 50`.
- La cabecera es `position: sticky`; `html` usa `scroll-padding-top: 88px` para que ancla y foco no
  queden tapados por ella.
- El veredicto vive **debajo de la ruleta**, dentro de `.stage__wheel`; el orden del DOM coincide con
  el orden de lectura (rueda → veredicto → opciones → historial).

### Estructura de la rueda

`.wheel` es un cuadrado (`aspect-ratio: 1`) con capas apiladas:

| Capa | Elemento | Descripción |
| --- | --- | --- |
| Halo | `.wheel__glow` | Degradado radial con el color `--win` (o el acento); más intenso al girar |
| Bisel | `.bezel` | `conic-gradient` cromado; `::after` dibuja el pozo oscuro (`inset: 6.2%`) |
| Bombillas | `.bulbs` > `i` | 24 `<i>` creadas por `buildBulbs()`, a un 48,4 % del radio; tres colores en ciclo |
| Ruleta | `#wheelCanvas` | `inset: 7%`, 86 % del lado; dibuja porciones, etiquetas, brillo y clavijas |
| Puntero | `.pointer` | Gema rosa con `clip-path`, arriba al centro |
| Hub | `.hub` | Botón de vidrio oscuro al 27 % del lado, con anillo que late |

## 5. Componentes

| Componente | Selectores | Notas |
| --- | --- | --- |
| Cabecera | `.masthead`, `.wordmark` | Píldora de vidrio; insignia cónica con una ruleta SVG |
| Acciones | `.masthead__actions`, `.icon-btn`, `.lang-link` | Círculos de 42×42; 40×40 en móvil |
| Titular | `.hero`, `.hero__title`, `.hero__aside`, `.hero__meta` | Centrado; píldoras con punto de degradado |
| Rueda | `.plate`, `.wheel`, `.bezel`, `.bulbs`, `#wheelCanvas` | Canvas con `role="img"`; bisel y bombillas aria-hidden |
| Puntero | `.pointer` | Degradado blanco → rosa, con sombra |
| Hub | `.hub`, `.hub__label`, `.hub__sub` | Botón real; escala 1,05 al hover; `::before` es el anillo que late |
| Caption | `.caption`, `kbd` | Pista de teclado; en táctil «Toca la ruleta para girar» |
| Veredicto | `.slip`, `.slip__head`, `.result__value`, `.result__meta`, `.status` | Superficie opaca con borde degradado y estado en píldora |
| Opciones | `.block`, `.add-form`, `.field-hint`, `.options`, `.option` | Filas con punto luminoso y botón `×`; error inline bajo el campo |
| Portada y 404 | `.gate`, `.gate__card`, `.gate__title`, `.gate__langs`, `.gate__lang` | Tarjeta de vidrio centrada sobre la aurora con dos botones de idioma (degradado `--btn-grad`); se usa en `public/index.html` y `public/404.html` |
| Acciones | `.panel__actions`, `.btn` | Barajar y reiniciar, con iconos SVG |
| Historial | `.history` (`<ul>`), `.chip`, `.chip__dot` | Últimos 10 veredictos visibles |
| Toast | `.toast` | Píldora de vidrio fija abajo, `role="status"` |
| Salto | `.skip` | Enlace «Saltar al contenido», visible solo con foco |
| Sin JS | `.noscript` | Aviso fijo |

### Estados

| Estado | Selector | Efecto |
| --- | --- | --- |
| Girando | `.wheel.is-spinning` | Cursor por defecto; halo más intenso; bombillas a 0,72 s; el anillo del hub se detiene |
| Girando | `.result[data-state="spinning"]` | Punto rosa parpadeante |
| Ganador | `.result[data-state="done"]` | Punto y resplandor del color ganador |
| Ganador | `.result__value.is-win` | `text-shadow` con el color de la porción |
| Tema noche | `html[data-theme="night"]` | Cambia tokens, aurora, icono sol/luna |
| Sonido off | `.icon-btn[aria-pressed="true"]` | Fondo `--glass-strong`, borde de acento e icono tachado |
| Campo con error | `input[aria-invalid="true"]` | Borde `--accent-3`; el mensaje aparece en `.field-hint.is-error` |
| Campo bloqueado | `input:read-only` | Opacidad reducida (durante el giro) |
| Botón de girar | `.hub[aria-disabled="true"]` | Sin hover ni `:active`; no se usa `disabled` durante el giro |
| Toast | `.toast.is-visible` | Opacidad 1 y desplazamiento a 0 |
| Deshabilitado | `:disabled` | Opacidad reducida y cursor por defecto |

`--win` lo fija `setWin(color)` en `#resultCard` y en `#wheel`; sin ganador se elimina y todo vuelve
al acento.

## 6. Movimiento

| Animación | Implementación | Duración / easing |
| --- | --- | --- |
| Giro | JS + `requestAnimationFrame` | 4,4–5,8 s; `1-(1-t)^4`; 5–7 vueltas |
| Tick | Web Audio | Oscilador de 60 ms; frecuencia sube con el progreso |
| Fanfarria | Web Audio | 4 notas, 85 ms de separación |
| Confeti | Canvas | Flecos con gravedad, giro y desvanecido (colores de la paleta y blanco) |
| Aurora | `@keyframes drift-a` / `drift-b` en `body::before/::after` | 26 s y 34 s, `alternate`; solo `transform` |
| Bombillas | `@keyframes bulb` | 3 s en reposo, 0,72 s al girar; retardo por bombilla (`--i`) |
| Halo de la rueda | `@keyframes glow` | 1,4 s mientras gira |
| Anillo del hub | `@keyframes ping` | 2,6 s, infinito; se detiene al girar y si el botón está desactivado |
| Palabra clave del titular | `@keyframes shimmer` | 7 s, `alternate` |
| Entrada de la página | `@keyframes rise` | 0,7–0,9 s con retardos escalonados |
| Entrada del veredicto | Web Animations API (`animate()`) | 420 ms; opacidad y desplazamiento |
| Punto de estado | `@keyframes blink` | 0,7 s |
| Hover / foco / toast | `transition` | 0,18–0,22 s sobre `transform`, color y opacidad |

### Movimiento reducido

1. **CSS**: `@media (prefers-reduced-motion: reduce)` apaga **todas** las animaciones (`animation:
   none`) y reduce las transiciones a `0.01ms`; las bombillas quedan fijas al 90 %.
2. **JS**: si `reduced()` es verdadero, el giro dura 650 ms, da 2 vueltas, no hay confeti, el
   desplazamiento al veredicto es instantáneo y no se anima la entrada del resultado.

`reduced()` consulta el `MediaQueryList` en cada uso, de modo que un cambio de la preferencia con la
página abierta se respeta desde el siguiente giro.

## 7. Responsive

| Rango | Cambios |
| --- | --- |
| > 1020px | Dos columnas; rueda hasta 600px; panel de 340–420px |
| ≤ 1020px | Una columna; panel máx. 600px centrado |
| ≤ 760px | Se oculta la etiqueta de marca |
| ≤ 640px | Padding 14px; acciones de 40px; veredicto y bloques con menos padding; lista sin scroll interno |
| `hover: none` y puntero grueso | La pista de teclado se sustituye por «Toca la ruleta para girar» |
| `pointer: fine` | `html` usa `overscroll-behavior: none` (sin rebote de página) |

La lista de opciones tiene `max-height: 372px` en escritorio y `max-height: none` en móvil, con
`overscroll-behavior: contain`. No hay estilos de impresión.

## 8. Accesibilidad

### Semántica y ARIA

- `<header>`, `<main id="main">`, `<aside>`, `<section>`, `<footer>`, un `h1` y dos `h2` en orden.
- Enlace «Saltar al contenido» (`.skip`) como primer elemento enfocable.
- El canvas tiene `role="img"` y un `aria-label` que se actualiza: «Ruleta con N opciones: …» o
  «Ruleta vacía» / «Wheel with N options: …» o «Empty wheel».
- El hub es un `<button>` real con `aria-label="Girar la ruleta"` / `"Spin the wheel"`. Durante el
  giro usa `aria-disabled="true"` en lugar de `disabled`, para no perder el foco del teclado.
- El enlace de idioma lleva `hreflang`, `lang` del idioma destino y `aria-label` en ese idioma; cada
  documento declara su `lang`.
- El campo tiene `<label class="sr-only">` y `aria-describedby` hacia `#optionHint`; los errores
  («Escribe una opción primero», «Puedes añadir hasta 20 opciones») aparecen bajo el campo con
  `aria-invalid`.
- El veredicto se anuncia por una región propia, `#resultLive` (`role="status"`, `aria-live="polite"`,
  `aria-atomic="true"`, visualmente oculta), con «Resuelto: X»; el texto visible del veredicto no es
  una región viva, por lo que el lector no anuncia el «…» intermedio. El toast usa `role="status"`.
- Los botones de tema y sonido exponen `aria-pressed` y actualizan `aria-label` y `title`.
- Las listas de opciones e historial son `<ul>`; cada botón de eliminar lleva `aria-label="Quitar X"`
  / `"Remove X"`.
- Los SVG decorativos, el bisel, las bombillas, el halo y el canvas de confeti llevan
  `aria-hidden="true"`.

### Teclado y foco

- `Tab` recorre enlaces, botones y campo; el foco visible es un contorno de 3 px con offset 3 px
  (`--focus`, cian en noche, violeta de día).
- `Espacio` gira salvo dentro de campos editables o sobre otros botones, donde conserva su función.
- `Enter` en el campo añade la opción.
- Al borrar una opción, el foco pasa al botón `×` vecino (o al campo si no queda ninguno).
- Durante el giro el campo pasa a `readOnly` (no `disabled`) para conservar el foco.
- `touch-action: manipulation` y `-webkit-tap-highlight-color` transparente en botones, enlaces y
  canvas.

### Contraste

Medido sobre los tokens actuales:

| Combinación | Día | Noche |
| --- | --- | --- |
| Texto sobre fondo | 16,0:1 | 18,2:1 |
| Texto secundario sobre fondo | 8,9:1 | 11,7:1 |
| Metadatos sobre fondo | 6,0:1 | 7,5:1 |
| Metadatos sobre `--surface` | 6,5:1 | 6,7:1 |
| Texto del botón sobre su degradado | blanco sobre `#5b4bff` 5,4:1 y sobre `#d6247f` 4,8:1 | tinta sobre `#22d3ee` 10,8:1, `#8b7bff` 5,9:1 y `#ff4fa3` 6,4:1 |

Todas superan AA para texto normal. En el canvas, la etiqueta usa la tinta de mayor contraste; el
peor par de la paleta actual es `#E0338F` con 4,70:1. Los paneles de vidrio dependen de lo que haya
detrás; se verificaron con la aurora por defecto y con los metadatos más tenues.

### Puntos a revisar

- **El canvas no es enfocable**: el clic para girar no está disponible por teclado directamente, pero
  el botón central equivalente sí.
- **Objetivos táctiles**: los botones `×` miden 36×36px y los de cabecera 40–42px, por debajo de los
  44×44 recomendados.
- **Estado intermedio**: «Girando» no está en una región `aria-live`; el lector anuncia el ganador,
  no el estado intermedio.
- **`confirm()` nativo** para reiniciar: accesible, pero rompe la estética y no se puede personalizar.
- **Vidrio**: `backdrop-filter` no existe en navegadores antiguos; sin él los paneles quedan
  semitransparentes sobre la aurora (legibles, pero con menos separación).
- **Alto contraste**: `@media (forced-colors: active)` fuerza bordes `CanvasText` en las superficies
  principales y quita el degradado del titular.

## 9. Assets

| Asset | Uso |
| --- | --- |
| `assets/fonts/unbounded-*.woff2` | Display, marca y veredicto (latín y latín-ext) |
| `assets/fonts/manrope-*.woff2` | Interfaz y texto del canvas (latín y latín-ext) |
| SVG inline | Marca, tema, sonido, barajar, reiniciar y añadir |
| Favicon | `data:image/svg+xml` en el `<head>` (gema con puntero) |
| `preview.png` | Solo documentación; la app no lo carga |

## 10. Cómo tematizar

1. Cambia los tokens de `:root` (día) y `[data-theme="night"]` (noche) en `styles.css`. La aurora
   se ajusta con `--aurora-a…d`.
2. Cambia `GEMS` (y, si hace falta, `THEMES.day` / `THEMES.night`) en `app.js`.
3. Mantén el contraste de las etiquetas del canvas; `labelColor` elige entre tinta y blanco, pero la
   paleta debe seguir dando al menos 4,5:1.
4. Revisa los literales de color que no son tokens: el bisel cromado, el pozo `#0b0a1a`, el hub, el
   puntero y las bombillas (`#ffd36b`, `#7ee7ff`, `#ff9bd0`), además del `theme-color` del `<head>` y
   de `theme.js`.
5. Comprueba día y noche en móvil (390px y 320px) y escritorio (1440px), en `/es/` y en `/en/` (y la portada `/`, que se ve un instante antes de redirigir).
