---
name: La Ruleta — Almanaque de decisiones
description: Una ruleta de decisiones impresa como lámina de almanaque, en marfil de día y tinta de noche.
colors:
  vermilion: "#b03a24"
  vermilion-night: "#e2704d"
  vermilion-deep: "#8a2b18"
  brass: "#8c6e36"
  paper: "#f4eee1"
  paper-night: "#15120e"
  paper-2: "#ede4d2"
  paper-3: "#e6dbc5"
  ink: "#1a1611"
  ink-night: "#f2e9d8"
  ink-soft: "#4e463a"
  ink-mute: "#6e6352"
  rule: "rgba(26, 22, 17, 0.22)"
  rule-strong: "rgba(26, 22, 17, 0.5)"
typography:
  display:
    fontFamily: "Bodoni Moda, Didot, Times New Roman, serif"
    fontSize: "clamp(2.65rem, 5.9vw, 5rem)"
    fontWeight: 500
    lineHeight: 0.94
    letterSpacing: "-0.018em"
  headline:
    fontFamily: "Bodoni Moda, Didot, Times New Roman, serif"
    fontSize: "clamp(1.95rem, 2.9vw, 2.55rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Karla, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Karla, Segoe UI, system-ui, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.18em"
rounded:
  none: "0"
  sm: "2px"
  circle: "50%"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "26px"
  xl: "44px"
  section: "72px"
components:
  button-primary:
    backgroundColor: "{colors.vermilion}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    size: "44px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "40px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.sm}"
    size: "40px"
  verdict-slip:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "15px 18px 20px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "5px 8px"
---

# Design System: La Ruleta — Almanaque de decisiones

## Overview

**Creative North Star: "El almanaque que firma veredictos"**

La ruleta no es un widget de casino: es la lámina de una publicación impresa. Un cabecero con fecha,
filetes de imprenta y una didone grande convierten la decisión en un pequeño ritual editorial. El
papel marfil y la tinta casi negra hacen el resto; de noche, la misma página se imprime en tinta.

La composición es asimétrica y gobernada por el texto: titular a la izquierda, lede estrecha a la
derecha, ruleta como figura principal y una columna de veredicto y opciones separada por filetes. No
hay tarjetas flotantes, cristal, halos ni degradados en el texto. La única voz alta es el bermellón:
la palabra en cursiva del titular, el sello del veredicto y el foco.

La densidad es la de una revista, no la de un panel de administración: generoso aire vertical,
jerarquía por escala y por línea, y controles que se leen como anotaciones al margen.

**Key Characteristics:**
- Papel marfil cálido de día; tinta cálida de noche.
- Bermellón como único acento, usado con avaricia.
- Bodoni Moda para display y veredicto; Karla para la interfaz.
- Filetes de 1px, dobles de 3px y una perforación discontinua en el veredicto.
- Ruleta plana con marcas de graduación, sin brillos ni biseles.
- Esquinas de 2px; el veredicto es cuadrado.

## Colors

Paleta de imprenta: dos neutros cálidos, un bermellón de tinta y un latón de reserva.

### Primary
- **Vermellón de sello** (`vermilion` / `vermilion-night`): la palabra en cursiva del titular, el
  filete superior del veredicto, el puntero nocturno, el foco y el botón de añadir. Es el único color
  que puede gritar.
- **Vermellón profundo** (`vermilion-deep`): solo el hover del botón de añadir y el foco de día.

### Secondary
- **Latón editorial** (`brass`): color de reserva para detalles impresos; no se usa en la interfaz
  principal. No introducirlo como segundo acento sin una razón editorial.

### Neutral
- **Papel marfil** (`paper`): fondo, tinta sobre porciones oscuras y texto del botón de añadir.
- **Papel sombra** (`paper-2`, `paper-3`): pliego del veredicto, hover de filas, `kbd`, botones
  presionados.
- **Tinta** (`ink` / `ink-night`): texto principal, filetes fuertes y fondo del toast.
- **Tinta suave** (`ink-soft`): texto secundario, lede, botones en reposo.
- **Tinta muda** (`ink-mute`): metadatos, etiquetas, fecha, placeholders.
- **Filete** (`rule`, `rule-strong`): separadores de 1px y bordes destacados.

### Named Rules
**The One Shout Rule.** El bermellón ocupa menos del 10 % de cualquier vista. Si dos elementos compiten
por él, uno sobra.

**The Paper-and-Ink Rule.** Cada tema intercambia papel y tinta; nunca se usa blanco puro ni negro puro.
La calidez del neutro es lo que hace que la página parezca impresa.

## Typography

**Display Font:** Bodoni Moda (con Didot y Times New Roman como respaldo)
**Body Font:** Karla (con Segoe UI y system-ui como respaldo)

**Character:** Una didone de contraste alto para la voz del almanaque y una grotesca humanista de
bajo contraste para la herramienta. La primera firma; la segunda explica. El emparejamiento es
deliberadamente editorial, no tecnológico.

### Hierarchy
- **Display** (500, `clamp(2.65rem, 5.9vw, 5rem)`, 0.94): titular de dos líneas, máximo `15ch`. La
  palabra «suerte» / «wheel» va en cursiva bermellón.
- **Headline** (500, `clamp(1.95rem, 2.9vw, 2.55rem)`, 1.02): valor del veredicto. Puede ocupar dos
  líneas; nunca se parte con guion.
- **Title** (700, 0.7rem, 1.4, `0.16em`, mayúsculas): títulos de bloque («Opciones», «Últimos
  veredictos»).
- **Body** (400, 1rem, 1.5): lede de `34ch` como máximo, texto de opciones a 0.92rem y metadatos a
  0.82rem.
- **Label** (700, 0.7rem, `0.18em`, mayúsculas): «Veredicto», estados, contadores, botones y chips.

### Named Rules
**The Italic Exception Rule.** La cursiva serif está reservada para una sola palabra del titular. No
se usa en cuerpo, botones, etiquetas ni en el veredicto.

**The Upright Interface Rule.** Karla nunca se inclina ni se estira. La interfaz se mantiene recta
para que el contraste con la didone sea legible como sistema, no como efecto.

## Layout

Contenedor de `1200px` como máximo, con un gutter fluido de `clamp(18px, 3.6vw, 44px)` y un ritmo
vertical de 26–72px. La retícula es de dos columnas en escritorio:

- **Masthead**: tres columnas (`1fr auto auto`), filete doble inferior.
- **Hero**: `1fr | 280–360px`, alineado al pie; el lede vive en una columna con filete izquierdo.
- **Stage**: `1fr | 350–404px`; la lámina de la ruleta llega a `560px` y el panel se queda en la
  columna estrecha.

Por debajo de `1020px` todo se apila: fecha oculta, hero en una columna, ruleta centrada y panel a
`560px` como máximo. Por debajo de `640px` el gutter baja a `16px`, las acciones a `38px`, el titular
se parte en dos líneas y la lista de opciones pierde su scroll interno.

La densidad es editorial: filas de opción de 9px de padding vertical, bloques separados por 26px y
un colofón a 44–72px del contenido. No se usan tarjetas anidadas ni sombras para separar secciones;
separan los filetes.

## Elevation & Depth

El sistema es plano por defecto. La profundidad no viene de capas ni de cristal, sino de la metáfora
del papel: la lámina de la ruleta se apoya con una sombra suave y el toast se levanta como una hoja.
No hay halos, `backdrop-filter`, brillos interiores ni degradados en el texto.

### Shadow Vocabulary
- **Lámina** (`0 26px 40px -30px rgba(48, 34, 16, 0.55)`): debajo del canvas de la ruleta, para que
  la figura se lea como una pieza impresa apoyada.
- **Hoja** (`0 18px 30px -18px rgba(48, 34, 16, 0.4)`): solo el toast.
- **Puntero** (`drop-shadow(0 5px 5px rgba(40, 28, 12, 0.22))`): el triángulo que señala la porción.
- **Noche**: las mismas sombras, más densas y sin luz cálida (`rgba(0,0,0,.8–.9)`).

### Named Rules
**The Printed Page Rule.** Si un elemento parece flotar sobre el papel en lugar de estar impreso en
él, está mal. La única excepción es el toast, que es una hoja temporal.

## Shapes

La forma base es recta: radio de `2px` en botones, campos, chips y toast; `0` en el pliego del
veredicto. La ruleta y el hub son círculos perfectos. El puntero es un triángulo recortado con
`clip-path`.

Los bordes son parte de la identidad: 1px para filetes y separadores, 3px doble para cabecero y
colofón, 3px sólido bermellón en la parte superior del veredicto, y una línea discontinua que separa
la cabecera del pliego como una perforación de ticket.

### Named Rules
**The Square Slip Rule.** El veredicto es un recorte de papel, no una tarjeta: esquinas a 0 y filete
superior bermellón. Redondearlo lo convierte en otro producto.

## Components

### Buttons
- **Shape:** rectangular con radio de 2px; el botón de añadir es cuadrado de 44px.
- **Primary:** fondo bermellón, texto papel, icono `+` de 16px. Solo para añadir una opción.
- **Hover / Focus:** el primario oscurece a `vermilion-deep`; los fantasma invierten a tinta con
  texto papel. El foco es un contorno de 2px con offset 3px.
- **Secondary / Ghost:** «Barajar» y «Reiniciar» con borde `rule-strong`, texto en mayúsculas de
  0.7rem y iconos SVG de 14px. No llevan relleno en reposo.

### Inputs / Fields
- **Style:** solo línea inferior de 1px `rule-strong`, sin caja ni fondo; altura 44px.
- **Focus:** la línea inferior pasa a bermellón y se refuerza con `box-shadow: inset 0 -2px 0`.
- **Disabled:** opacidad 0.5 mientras la ruleta gira.

### Cards / Containers
- **Corner Style:** 0 en el veredicto; 2px en el resto.
- **Background:** `paper-2` para el pliego; el resto es el papel de la página.
- **Shadow Strategy:** solo la lámina de la ruleta y el toast (ver Elevation).
- **Border:** 1px `rule-strong` en el pliego; filetes de 1px entre bloques.
- **Internal Padding:** 15–20px en el pliego; 14px por encima de cada bloque.

### Chips
- **Style:** borde de 1px `rule`, fondo transparente, texto `ink-soft` a 0.76rem, punto cuadrado de
  7px con el color de la porción.
- **State:** no son interactivos; representan los últimos veredictos y envuelven en varias líneas.

### Navigation
- **Style:** no hay barra de navegación. El masthead contiene la marca, la fecha y tres acciones:
  tema, idioma y sonido.
- **Default / Hover:** iconos de 40×40 con borde `rule`; al hover invierten a tinta. El enlace de
  idioma es texto de 0.7rem en mayúsculas que se subraya con bermellón al hover.
- **Mobile:** las acciones bajan a 38×38 y la tagline de la marca desaparece.

### Signature: The Wheel Plate
- **Canvas:** `role="img"` con `aria-label` actualizado; porciones en tintas planas, separadores de
  papel y 144 marcas de graduación.
- **Labels:** 600, entre 11 y 22px, orientadas radialmente; las de la mitad izquierda giran 180° para
  leerse de pie. El color se elige por contraste real, no por luminancia.
- **Hub:** botón circular del 30 % del ancho, fondo papel, borde tinta y aro interior de 1px. Al hover
  invierte a tinta; al girar, el aro pasa a bermellón.
- **Pointer:** triángulo de 22×34px sobre el borde superior; tinta de día, bermellón de noche.
- **Caption:** «Fig. 1» en bermellón y la pista de teclado; en táctil, «Toca la ruleta para girar».

## Do's and Don'ts

### Do:
- **Do** usar Bodoni Moda solo para el titular, la marca y el valor del veredicto.
- **Do** mantener el bermellón por debajo del 10 % de la vista y reservarlo para el foco, la cursiva
  del titular y el sello del veredicto.
- **Do** separar con filetes de 1px y reservar el doble de 3px para el cabecero y el colofón.
- **Do** elegir la tinta de cada etiqueta del canvas por contraste medido (≥ 4,5:1).
- **Do** mantener el pliego del veredicto cuadrado y con el filete superior bermellón.
- **Do** verificar día y noche, 320/390px y 1440px, en español y en inglés.

### Don't:
- **Don't** usar degradados en texto, cristal, `backdrop-filter`, halos ni brillos.
- **Don't** redondear el veredicto ni convertirlo en una tarjeta flotante.
- **Don't** añadir un segundo acento, una píldora de badge o un kicker sobre el titular.
- **Don't** usar blanco puro o negro puro: el papel y la tinta siempre son cálidos.
- **Don't** poner la cursiva didone en cuerpo, botones, etiquetas o resultados.
- **Don't** usar sombras difusas sin desplazamiento ni sombras para separar bloques.
