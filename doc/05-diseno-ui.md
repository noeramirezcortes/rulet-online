# 05 · Diseño y UI

## 1. Intención visual

La página se plantea como la lámina de un almanaque impreso: papel marfil de día, la misma página
impresa en tinta de noche. Un cabecero con fecha, filetes de uno y tres hilos, tinta bermellón como
único grito y una didone grande para el titular y el veredicto. La ruleta ocupa el lugar de la
figura principal, con marcas de graduación y porciones en tintas planas; el panel derecho es una
columna editorial de filetes, no una tarjeta de cristal.

No hay degradados en el texto, halos, `backdrop-filter` ni filtros de grano. La calidez viene del
papel, la tinta y el bermellón.

La misma hoja `styles.css` se usa en español (`/`) y en inglés (`/en/`); `en/index.html` la referencia
como `../styles.css`. El diseño es idéntico en ambos idiomas salvo los textos.

## 2. Temas y tokens

Dos ediciones comparten estructura y componentes:

- **Día** (`:root`): papel `#f4eee1`, tinta `#1a1611`, bermellón `#b03a24`.
- **Noche** (`[data-theme="night"]`): papel `#15120e`, tinta `#f2e9d8`, bermellón `#e2704d`.

El atributo `data-theme="day|night"` vive en `<html>`. Un script inline en el `<head>` lo fija antes
de pintar para evitar el destello del tema equivocado:

1. Si `localStorage["ruleta-theme"]` es `day` o `night`, usa esa preferencia.
2. Si no, sigue `prefers-color-scheme`.
3. Si el almacenamiento falla, cae en `day`.

`color-scheme` cambia con el tema, de modo que los controles nativos y las barras de desplazamiento
acompañan la edición.

| Token | Día | Noche | Uso |
| --- | --- | --- | --- |
| `--paper` | `#f4eee1` | `#15120e` | Fondo y texto sobre tinta |
| `--paper-2` | `#ede4d2` | `#1c1812` | Pliego del veredicto, hover, `kbd` |
| `--paper-3` | `#e6dbc5` | `#231d15` | Pressed, botones de sonido |
| `--ink` | `#1a1611` | `#f2e9d8` | Texto principal, filetes fuertes |
| `--ink-soft` | `#4e463a` | `#c9bca4` | Texto secundario |
| `--ink-mute` | `#6e6352` | `#a59880` | Metadatos y etiquetas |
| `--rule` | `rgba(26,22,17,.22)` | `rgba(242,233,216,.18)` | Filetes finos |
| `--rule-strong` | `rgba(26,22,17,.5)` | `rgba(242,233,216,.42)` | Filetes y bordes destacados |
| `--vermilion` | `#b03a24` | `#e2704d` | Acento, sello del veredicto, foco |
| `--vermilion-deep` | `#8a2b18` | `#f09a80` | Hover del botón de añadir |
| `--brass` | `#8c6e36` | `#c9a567` | Reserva editorial |
| `--focus` | `#8a2b18` | `#f09a80` | Contorno de foco |
| `--radius` | `2px` | `2px` | Esquinas casi rectas |

Sombras: `--shadow-plate` para la lámina de la ruleta y `--shadow-lift` para el toast. Siempre con
desplazamiento vertical y desenfoque, nunca un halo.

### Colores de la ruleta

Las porciones no usan tokens CSS: viven en `THEMES.day.palette` y `THEMES.night.palette` dentro de
`app.js` y `en/app.js`. Cada tema define también `ink`, `paper`, `tick`, `tickStrong`, `ring` y `empty`
para el dibujo del canvas.

La etiqueta de cada porción elige entre tinta y papel según cuál dé **mayor contraste** con esa
porción (`labelColor`). No se usa un umbral de luminancia fijo.

## 3. Tipografía

Dos familias autoalojadas en `assets/fonts/` (woff2, subconjuntos latino y latín extendido):

- **Bodoni Moda** — titular, marca y valor del veredicto. Didone, con cursiva para la palabra
  bermellón del titular.
- **Karla** — interfaz, etiquetas, opciones, botones y texto corrido del canvas.

Ambas se declaran con `font-display: swap` y se precargan las variantes latinas en el `<head>`.
No hay peticiones a Google Fonts ni a ningún CDN.

| Elemento | Tamaño | Detalle |
| --- | --- | --- |
| `h1` | `clamp(2.65rem, 5.9vw, 5rem)` | Bodoni 500, `line-height: .94`, ancho máx. `15ch` |
| `h1` móvil | `clamp(2.55rem, 12.6vw, 3.4rem)` | `text-wrap: wrap` |
| Lede | `clamp(.96rem, 1.15vw, 1.05rem)` | Karla, `line-height: 1.6`, máx. `34ch` |
| Marca | `1.42rem` | Bodoni 600; `1.24rem` en móvil |
| Tagline de marca | `.7rem` | Mayúsculas, `letter-spacing: .15em` |
| Fecha | `.75rem` | `letter-spacing: .04em` |
| Meta del hero | `.7rem` | Mayúsculas, separada por `·` bermellón |
| Etiquetas y títulos de bloque | `.7rem` | Mayúsculas, `letter-spacing: .16–.18em` |
| Valor del veredicto | `clamp(1.95rem, 2.9vw, 2.55rem)` | Bodoni 500 |
| Texto meta del veredicto | `.82rem` | `--ink-soft` |
| Hub «Girar» | `clamp(.7rem, 1.4vw, .82rem)` | Mayúsculas, `letter-spacing: .24em` |
| Contador del hub | `clamp(.7rem, 1vw, .74rem)` | Cifras tabulares |
| Opciones | `.92rem` | Una línea con elipsis |
| Campo de texto | `.94rem` | — |
| Botones | `.7rem` | Mayúsculas, `letter-spacing: .1em` |
| Chips del historial | `.76rem` | Una línea con elipsis |
| Colofón | `.7rem` | `text-wrap: pretty` |
| Toast | `.84rem` | — |

Texto del canvas: `max(11px, min(22px, R × factor))`, con factor `0.084` hasta 10 opciones, `0.073`
hasta 15 y `0.062` a partir de 16. El texto se recorta con puntos suspensivos si no cabe.

## 4. Layout

```text
.app  max-width 1200px · padding 24px gutter 42px · columna · z-index 1
├─ .masthead   marca + tagline · fecha · acciones (tema, idioma, sonido)
│              filete doble inferior
├─ .hero       grid 1fr | 280–360px, alineado al pie
│  ├─ h1       dos líneas, «suerte» en cursiva bermellón
│  └─ aside    lede + meta, separados por filete vertical
├─ .stage      grid 1fr | 350–404px
│  ├─ .plate   ruleta hasta 560px + caption «Fig. 1»
│  └─ .panel   veredicto · opciones · historial
└─ .colophon   filete doble · créditos · privacidad
```

- `.app` centra el contenido y mantiene el `z-index` por encima del canvas de confeti.
- `.fx` es un canvas fijo a pantalla completa, `pointer-events: none`, `z-index: 50`.
- El cuerpo tiene un lavado radial muy suave de papel; en noche es una luz cálida casi imperceptible.
- El filete doble se hace con `border-bottom: 3px double`.

## 5. Componentes

| Componente | Selectores | Notas |
| --- | --- | --- |
| Cabecera | `.masthead`, `.wordmark` | Tres columnas; el icono es una ruleta de ocho radios |
| Fecha | `.dateline` | Se oculta por debajo de 1020px |
| Acciones | `.masthead__actions`, `.icon-btn`, `.lang-link` | 40×40; 38×38 en móvil |
| Titular | `.hero`, `.hero__title`, `.hero__aside` | Filete inferior; columna lateral con filete izquierdo |
| Lámina | `.plate`, `.wheel`, `#wheelCanvas` | Canvas con `role="img"`, sombra de imprenta |
| Marcas | dibujadas en canvas | 144 marcas; cada 12 una más larga y oscura, más un aro exterior |
| Puntero | `.pointer` | Triángulo con `clip-path`; tinta de día, bermellón de noche |
| Hub | `.hub`, `.hub__label`, `.hub__sub` | Botón real, aro interior, inversión al hover |
| Caption | `.caption`, `.caption__fig` | «Fig. 1»; en táctil cambia a «Toca la ruleta para girar» |
| Veredicto | `.slip`, `.slip__head`, `.result__value`, `.result__meta` | Pliego con filete superior bermellón y perforación discontinua |
| Opciones | `.block`, `.add-form`, `.options`, `.option` | Lista con puntos de color y botones `×` |
| Acciones | `.panel__actions`, `.btn` | Barajar y reiniciar, con iconos SVG |
| Historial | `.history`, `.chip`, `.chip__dot` | Últimos 10 veredictos visibles |
| Toast | `.toast` | Fijo abajo, `role="status"` |
| Sin JS | `.noscript` | Aviso fijo |

### Estados

| Estado | Selector | Efecto |
| --- | --- | --- |
| Girando | `.wheel.is-spinning` | Cursor por defecto; el aro interior del hub pasa a bermellón |
| Girando | `.result[data-state="spinning"]` | Punto bermellón parpadeante |
| Ganador | `.result[data-state="done"]` | Punto del color ganador |
| Ganador | `.result__value.is-win` | Subrayado con el color de la porción |
| Aparición | `.result.is-pop` | `inkIn`: entra con desenfoque y desplazamiento |
| Tema noche | `html[data-theme="night"]` | Cambia tokens, icono sol/luna y paleta del canvas |
| Sonido off | `.icon-btn[aria-pressed="true"]` | Fondo `--paper-3` e icono tachado |
| Toast | `.toast.is-visible` | Opacidad 1 y desplazamiento a 0 |
| Deshabilitado | `:disabled` | Opacidad reducida y cursor por defecto |

## 6. Movimiento

| Animación | Implementación | Duración / easing |
| --- | --- | --- |
| Giro | JS + `requestAnimationFrame` | 4,4–5,8 s; `1-(1-t)^4`; 5–7 vueltas |
| Tick | Web Audio | Oscilador de 60 ms; frecuencia sube con el progreso |
| Fanfarria | Web Audio | 4 notas, 85 ms de separación |
| Confeti | Canvas | Flecos de papel con gravedad, giro y desvanecido |
| Punto de estado | `@keyframes blink` | 0,9 s, infinito |
| Entrada del veredicto | `@keyframes inkIn` | 0,55 s |
| Tema | `transition` de color de fondo y texto | 0,35 s |
| Hover / foco / toast | `transition` | 0,16–0,22 s |

### Movimiento reducido

1. **CSS**: `@media (prefers-reduced-motion: reduce)` reduce animaciones y transiciones a `0.01ms`
   y una sola iteración.
2. **JS**: si `REDUCED`, el giro dura 650 ms, da 2 vueltas, no hay confeti y el desplazamiento al
   veredicto es instantáneo.

La preferencia se lee una vez al cargar; cambiarla con la página abierta no surte efecto hasta
recargar.

## 7. Responsive

| Rango | Cambios |
| --- | --- |
| > 1020px | Dos columnas; fecha visible; ruleta hasta 560px; panel de 350–404px |
| ≤ 1020px | Una columna; fecha oculta; hero apilado; panel máx. 560px centrado |
| ≤ 640px | Padding 16px; acciones de 38px; titular a dos líneas; lista sin scroll interno; colofón apilado |
| `hover: none` y puntero grueso | La pista de teclado se sustituye por «Toca la ruleta para girar» |

La lista de opciones tiene `max-height: 409px` en escritorio (ocho opciones) y `max-height: none` en
móvil. No hay estilos de impresión.

## 8. Accesibilidad

### Semántica y ARIA

- `<header>`, `<main>`, `<aside>`, `<section>`, `<footer>`, un `h1` y dos `h2` en orden.
- El canvas tiene `role="img"` y un `aria-label` que se actualiza: «Ruleta con N opciones: …» o
  «Ruleta vacía» / «Wheel with N options: …» o «Empty wheel».
- El hub es un `<button>` real con `aria-label="Girar la ruleta"` / `"Spin the wheel"`.
- El enlace de idioma lleva `hreflang`, `lang` del idioma destino y `aria-label` en ese idioma; cada
  documento declara su `lang`.
- El campo tiene `<label class="sr-only">`; cada botón de eliminar lleva `aria-label="Quitar X"` /
  `"Remove X"`.
- El valor del veredicto usa `aria-live="polite"` y `aria-atomic="true"`; el toast, `role="status"`.
- Los botones de tema y sonido exponen `aria-pressed` y actualizan `aria-label` y `title`.
- Los SVG decorativos y el canvas de confeti llevan `aria-hidden="true"`.

### Teclado

- `Tab` recorre enlaces, botones y campo; el foco visible es un contorno de 2px con offset 3px.
- `Espacio` gira salvo dentro de campos editables o sobre otros botones, donde conserva su función.
- `Enter` en el campo añade la opción.
- Los botones `×` son enfocables y se accionan con `Enter` o `Espacio`.

### Contraste

Medido sobre los tokens actuales:

| Combinación | Día | Noche |
| --- | --- | --- |
| Tinta sobre papel | 15,6:1 | 15,5:1 |
| Texto secundario sobre papel | 8,0:1 | 10,0:1 |
| Metadatos sobre papel | 5,1:1 | 6,6:1 |
| Metadatos sobre `--paper-2` | 4,7:1 | 6,2:1 |
| Bermellón sobre papel | 5,2:1 | 5,9:1 |

Todas superan AA para texto normal. En el canvas, la etiqueta usa la tinta de mayor contraste; el
peor par de las paletas actuales queda en 4,65:1.

### Puntos a revisar

- **El canvas no es enfocable**: el clic para girar no está disponible por teclado directamente, pero
  el botón central equivalente sí.
- **Objetivos táctiles**: los botones `×` miden 32×32px y los de cabecera 38–40px, por debajo de los
  44×44 recomendados.
- **Estado intermedio**: «Girando» no está en una región `aria-live`; el lector anuncia el ganador,
  no el estado intermedio.
- **`confirm()` nativo** para reiniciar: accesible, pero rompe la estética y no se puede personalizar.
- **Alto contraste**: `@media (forced-colors: active)` restaura el color heredado del titular y
  refuerza los bordes de los controles principales.

## 9. Assets

| Asset | Uso |
| --- | --- |
| `assets/fonts/bodoni-moda-*.woff2` | Display y veredicto (normal, cursiva, latín y latín-ext) |
| `assets/fonts/karla-*.woff2` | Interfaz y canvas (latín y latín-ext) |
| SVG inline | Marca, tema, sonido, barajar, reiniciar y añadir |
| Favicon | `data:image/svg+xml` en el `<head>` |
| `preview.png` | Solo documentación; la app no lo carga |

## 10. Cómo tematizar

1. Cambia los tokens de `:root` (día) y `[data-theme="night"]` (noche) en `styles.css`.
2. Cambia `THEMES.day` y `THEMES.night` en `app.js` **y** `en/app.js`: paleta, tintas, marcas y aro.
3. Mantén el contraste de las etiquetas del canvas; `labelColor` elige la tinta con más contraste,
   pero la paleta debe seguir dando al menos 4,5:1.
4. Revisa los literales de color que no son tokens: sombras del puntero y del hub, y el `theme-color`
   del `<head>`.
5. Comprueba día y noche en móvil (390px y 320px) y escritorio (1440px), en `/` y en `/en/`.
