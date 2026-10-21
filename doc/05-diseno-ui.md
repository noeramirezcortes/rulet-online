# 05 · Diseño y UI

## 1. Intención visual

Tema oscuro casi negro (`#080a14`) con acentos violeta, rosa y verde agua. La composición es una
tarjeta de cristal sobre un fondo con degradados radiales y una retícula sutil. La ruleta es el foco:
grande, con halo violeta, sombra profunda y un botón central luminoso. El panel lateral usa tarjetas
translúcidas con `backdrop-filter`.

La misma hoja `styles.css` se usa en español (`/`) y en inglés (`/en/`); `en/index.html` la referencia
como `../styles.css`. Por tanto, el diseño es idéntico en ambos idiomas salvo los textos.

No hay modo claro ni `prefers-color-scheme`; el `<meta name="color-scheme" content="dark">` fuerza
controles nativos oscuros en ambas páginas.

## 2. Tokens (`:root`, styles.css:2–16)

| Token | Valor | Uso real |
| --- | --- | --- |
| `--bg` | `#080a14` | Fondo base |
| `--surface` | `rgba(255,255,255,.045)` | **Declarado sin uso** |
| `--surface-2` | `rgba(255,255,255,.075)` | **Declarado sin uso** |
| `--line` | `rgba(255,255,255,.09)` | Bordes y separadores |
| `--line-strong` | `rgba(255,255,255,.16)` | Bordes de toast y `kbd` |
| `--text` | `#f3f4fb` | Texto principal |
| `--muted` | `#98a1bd` | Texto secundario |
| `--accent` | `#8b7bff` | Punto de estado «girando» |
| `--accent-soft` | `rgba(139,123,255,.16)` | Fondo del botón de sonido silenciado |
| `--pink` | `#ff5c9d` | **Declarado sin uso**; el literal se repite en gradientes |
| `--green` | `#5eead4` | Punto del badge «Gratis» |
| `--radius` | `22px` | Radio de tarjetas |
| `--font` | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, …` | Tipografía global |

Además se usan colores literales no tokenizados (violeta `#9a8cff`/`#6a5cff`, grises de texto,
`#6ee7a0` del estado «done»). Si se quiere tematizar, conviene tokenizarlos.

### Colores de la ruleta

Los 12 colores de las porciones viven en `PALETTE` (en ambos `app.js`), **no** en CSS. Cambiar solo los
tokens no cambia la ruleta; hay que tocar los dos JS para mantener coherencia con puntos, chips y confeti.

## 3. Tipografía

Se usa la pila de sistema (sin fuentes externas). Tamaño base del navegador (16 px por defecto).

| Elemento | Tamaño | Peso / detalle |
| --- | --- | --- |
| `h1` hero | `clamp(2.05rem, 4.6vw, 3.2rem)` | 800, `line-height: 1.03`, `letter-spacing: -0.035em`, texto con degradado blanco→lavanda |
| Lede | `clamp(.95rem, 1.4vw, 1.05rem)` | `--muted`, ancho máx. 54ch, `line-height: 1.55` |
| Badge | `.75rem` | 600, `letter-spacing: .02em` |
| Título de tarjeta | `.92rem` | 700 |
| Etiqueta «Resultado» | `.7rem` | 700, mayúsculas, `letter-spacing: .17em` |
| Valor del resultado | `clamp(1.6rem, 2.8vw, 2rem)` | 800, `letter-spacing: -.025em` |
| Texto meta del resultado | `.82rem` | `--muted` |
| Opciones | `.89rem` | Una línea con elipsis |
| Botones | `.8rem` | 600 |
| Enlace de idioma | `.72rem` | 700, mayúsculas, `letter-spacing: .06em` |
| Chips | `.78rem` | Una línea con elipsis |
| Footer | `.78rem` (`.72rem` en móvil) | `#6f7896` |
| Toast | `.86rem` | — |
| Hub «GIRAR» | `clamp(.68rem, 1.55vw, .85rem)` | 800, `letter-spacing: .2em` |
| Hub subtítulo | `clamp(.52rem, 1.05vw, .62rem)` | 600 |
| Texto del canvas | `max(10px, min(22px, R × factor))` | 700; factor según nº de opciones |

## 4. Layout

```text
.app  max-width 1120px · padding 26px 24px 40px · flex column · gap 22px
├─ .topbar      marca a la izquierda · .topbar__actions (lang switch + sonido) a la derecha
├─ .hero        badge + h1 + lede, centrados
├─ .stage       grid: minmax(0,1fr) | minmax(340px,390px) · gap clamp(24px,4vw,52px)
│  ├─ .stage__wheel   ruleta (máx. 500px) + pista de teclado
│  └─ .panel          resultado · opciones · historial
└─ .footer
```

- Fondo del `body`: tres degradados radiales (violeta arriba-izquierda, rosa arriba-derecha, verde
  abajo) + degradado vertical, con `background-attachment: fixed`.
- `body::before`: retícula de 68×68 px con máscara radial, `pointer-events: none`.
- `.fx`: canvas de confeti fijo, `z-index: 50`.
- `.app`: `z-index: 1`.

## 5. Componentes

| Componente | Selectores | Notas |
| --- | --- | --- |
| Cabecera | `.topbar`, `.brand`, `.brand__icon` | Icono SVG en cuadro con degradado violeta→rosa |
| Acciones de cabecera | `.topbar__actions` | Contenedor flex con gap de 8 px para idioma y sonido |
| Enlace de idioma | `.lang-switch` | Píldora de 38 px de alto, borde sutil, texto `EN`/`ES`; navega a la otra página |
| Botón de icono | `.icon-btn` | 38×38, borde sutil, dos SVG (on/off) alternados por `aria-pressed` |
| Badge | `.badge`, `.badge__dot` | Píldora con punto verde luminoso |
| Ruleta | `.wheel`, `#wheelCanvas`, `.pointer`, `.hub` | Halo en `::before`, sombra en canvas, puntero con `clip-path`, hub con anillo pulsante |
| Pista | `.hint`, `kbd` | «Haz clic en la ruleta o pulsa Espacio» |
| Tarjeta | `.card` | Cristal: borde, degradado blanco translúcido, sombra, blur 14 px, radio 22 px |
| Resultado | `.result`, `.result__*` | Degradado violeta superior; estados `data-state` |
| Alta de opción | `.add-form`, `input`, `button` | Input 42 px; botón `+` con degradado violeta |
| Lista de opciones | `.options`, `.option`, `.option__*` | Altura máx. 360 px con scroll fino; punto de color; `×` |
| Acciones | `.panel__actions`, `.btn` | «Mezclar» y «Restablecer» con SVG inline |
| Historial | `.history`, `.chip`, `.chip__dot` | Chips que envuelven en varias líneas |
| Toast | `.toast` | Fijo abajo, `translate(-50%, 14px)` → `0` al mostrarse |
| Sin JS | `.noscript` | Aviso fijo abajo |
| Solo lectores | `.sr-only` | Técnica de recorte 1×1 |

### Estados visuales

| Estado | Selector | Efecto |
| --- | --- | --- |
| Girando | `.wheel.is-spinning` | Halo más intenso, sombra violeta, cursor por defecto, anillo del hub detenido |
| Girando | `.result[data-state="spinning"]` | Punto violeta parpadeante (`blink`, 0.9 s) |
| Ganador | `.result[data-state="done"]` | Punto verde |
| Ganador | `.result__value.is-win` | Color de la porción + `text-shadow` con `color-mix` |
| Aparición | `.result.is-pop` | `popIn` 0.5 s con rebote |
| Sonido off | `.icon-btn[aria-pressed="true"]` | Fondo violeta tenue, icono `off` |
| Toast | `.toast.is-visible` | Opacidad 1 y desplazamiento a 0 |
| Deshabilitado | `:disabled` | Opacidad reducida y cursor por defecto |

## 6. Movimiento

| Animación | Implementación | Duración / easing |
| --- | --- | --- |
| Giro de la ruleta | JS, `requestAnimationFrame` | 4,4–5,8 s; `1-(1-t)^4` |
| Tick de sonido | Web Audio | 60 ms por oscilador |
| Fanfarria | Web Audio | 4 notas, 85 ms de separación, 520 ms cada una |
| Confeti | JS en canvas | Vida 1 con decaimiento 0,006–0,014 por frame |
| Anillo del hub | `@keyframes hubPulse` | 3 s, infinito, `ease-out` |
| Punto de estado | `@keyframes blink` | 0,9 s, infinito |
| Pop del resultado | `@keyframes popIn` | 0,5 s, `cubic-bezier(.22,.9,.3,1.4)` |
| Hover / foco / toast | `transition` | 0,16–0,4 s |
| Halo de la ruleta | `transition: opacity` | 0,4 s |

### Movimiento reducido

Doble tratamiento:

1. **CSS**: `@media (prefers-reduced-motion: reduce)` reduce animaciones y transiciones a `0.01ms`
   y una sola iteración.
2. **JS**: si `REDUCED`, el giro dura 650 ms y da 2 vueltas, el confeti no se genera y el scroll es
   instantáneo.

La preferencia se lee **una sola vez** al cargar; cambiarla con la página abierta no surte efecto
hasta recargar.

## 7. Responsive

| Rango | Cambios |
| --- | --- |
| > 960 px | Dos columnas; ruleta hasta 500 px; panel de 340–390 px |
| ≤ 960 px | Una columna; ruleta hasta 470 px centrada; panel máx. 560 px centrado |
| ≤ 560 px | Padding 18/16/32; ruleta hasta 400 px; tarjetas con 15 px y radio 19; puntero 24×32; footer más pequeño |

También hay ajustes fluidos con `clamp()` en tipografía, gaps y hub. No hay estilos de impresión ni
orientación específica.

## 8. Accesibilidad

### Semántica y ARIA

- `<header>`, `<main>`, `<aside>`, `<section>`, `<footer>`, `h1` y `h2` en orden.
- El canvas de la ruleta tiene `role="img"` y un `aria-label` que se actualiza con las opciones:
  «Ruleta con N opciones: …» o «Ruleta vacía».
- El botón central es un `<button>` real con `aria-label="Girar la ruleta"` / `aria-label="Spin the wheel"`.
- El enlace de idioma lleva `hreflang`, `lang` del idioma destino y `aria-label` en ese idioma
  («Switch to English» / «Cambiar a español»); cada documento declara su `lang` (`es`/`en`).
- El campo tiene `<label class="sr-only">`; los botones de eliminar llevan `aria-label="Quitar X"` /
  `aria-label="Remove X"`.
- El resultado usa `aria-live="polite"` y `aria-atomic="true"`; el toast usa `role="status"`.
- El botón de sonido expone `aria-pressed` (verdadero = silenciado) y actualiza `aria-label`/`title`.
- Los SVG decorativos llevan `aria-hidden="true"`; el canvas de confeti también.

### Teclado

- `Tab` recorre enlaces/botones/campo; el foco visible es un contorno violeta de 2 px con offset 3 px.
- `Espacio` gira (salvo dentro de campos editables o sobre otros botones, donde conserva su función).
- `Enter` en el campo envía el formulario y añade la opción.
- Los botones `×` son enfocables y accionables con `Enter`/`Espacio`.

### Puntos a revisar

- **El canvas no es enfocable**: el clic para girar no está disponible por teclado directamente, pero
  el botón central equivalente sí. Es aceptable, aunque el `role="img"` con `click` no es ideal.
- **Objetivos táctiles**: los botones `×` miden 26×26 px y los de cabecera 38×38 px, por debajo de los
  44×44 recomendados.
- **Contraste**: `--muted` sobre el fondo oscuro suele cumplir AA; los tonos más bajos
  (`.footer #6f7896`, placeholders `#6f7896`, `.history-empty #7882a3`) son los candidatos a fallar
  en texto pequeño. Conviene verificarlos con Lighthouse/axe.
- **Texto con degradado**: el `h1` usa `color: transparent` + `background-clip: text`; en modo de
  alto contraste de Windows puede quedar invisible. Considerar un `@media (forced-colors: active)`
  que restaure un color sólido.
- **Estado «Girando»/«¡Resultado!»** no está en una región `aria-live`; solo el valor del resultado lo
  está. Un lector de pantalla oirá el ganador, no el estado intermedio.
- **`confirm()` nativo** para restablecer: accesible, pero rompe la estética y no se puede personalizar.

## 9. Assets

| Asset | Uso |
| --- | --- |
| SVG inline | Marca, botón de sonido, mezclar, restablecer |
| Favicon | `data:image/svg+xml` en el `<head>` (círculo violeta con flecha) |
| `preview.png` | Solo documentación (README); la app no lo carga |
| Fuentes | Ninguna externa; pila del sistema |

## 10. Cómo tematizar

1. Cambia los tokens de `:root` en `styles.css` (fondo, texto, acento, radio). Afecta a ambos idiomas.
2. Cambia `PALETTE` en `app.js` **y** `en/app.js` para porciones, puntos, chips y confeti.
3. Revisa los literales de color (degradados del fondo, botón `+`, marca, estados) que no usan tokens.
4. Verifica contraste y los estados hover/foco.
5. Comprueba móvil a 360 px y escritorio a 1440 px, en `/` y en `/en/`.
