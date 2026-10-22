---
name: La Ruleta — Pop
description: Una ruleta de decisiones de bloques de color plano, trazo grueso y sombras duras; clara de día, tinta de noche.
colors:
  bg: "#eceffb"
  bg-night: "#0c0d16"
  surface: "#ffffff"
  surface-night: "#171929"
  ink: "#12131f"
  ink-night: "#f1f2fb"
  accent: "#3a4bff"
  accent-night: "#8e9bff"
  pop: "#d7ff4a"
  coral: "#ff5b3a"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 4.9rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.035em"
  label:
    fontFamily: "Space Mono, ui-monospace, Consolas, monospace"
    fontSize: "0.7rem"
    fontWeight: 700
    textTransform: uppercase
---

# La Ruleta — Pop

Rama `dev`. Sustituye al diseño «almanaque editorial» (marfil, bermellón, didone) por un sistema de bloques de color plano.

## Principios

- **Trazo y sombra duros.** Todo contenedor lleva borde de 2 px (`--edge`) y una sombra sólida sin desenfoque (`--cast`). Al pulsar, el elemento se hunde 2 px y la sombra casi desaparece.
- **Color solo donde manda.** El fondo es neutro (lavanda fría de día, tinta azulada de noche). El color vive en la ruleta, en el veredicto (bloque `--accent`) y en los acentos `--pop` (lima) y `--coral`.
- **La ruleta es la protagonista.** Doce colores planos, separadores de tinta gruesos y un aro exterior; la etiqueta de cada porción usa el tono con más contraste (tinta o blanco).
- **Dos voces tipográficas.** Bricolage Grotesque (variable, 400–800) para titulares y texto; Space Mono para etiquetas, botones y contadores.
- **Día y noche con la misma estructura.** `[data-theme="night"]` solo redefine tokens; en noche la sombra pasa a `#3a3f7a` y el foco a lima.

## Tokens

Definidos en `:root` y `[data-theme="night"]` de `styles.css`: `--bg`, `--surface`, `--surface-2`, `--ink`, `--ink-soft`, `--ink-mute`, `--edge`, `--cast`, `--accent`, `--pop`, `--coral`, `--focus`, `--radius` (10 px) y `--stroke` (2 px). Los colores de las porciones viven en `THEMES` de `app.js` (canvas), no en CSS.

## Componentes

- **Cabecera:** insignia cuadrada azul con sombra, nombre en 800 y etiqueta «Gira y decide» en píldora lima; botones de tema, idioma y sonido de 44 px.
- **Titular:** la palabra clave va en una etiqueta lima ligeramente girada; el lema y tres píldoras (gratis, sin registro, sin anuncios) acompañan.
- **Ruleta:** lienzo circular con sombra de 8 px; puntero de tinta con relleno coral; botón central lima que pasa a coral al pasar el cursor.
- **Veredicto:** tarjeta `--accent` con estado en píldora, resultado grande y barra del color ganador.
- **Opciones e historial:** tarjetas blancas; cada opción es una fila con borde; el historial son píldoras (`<ul>`/`<li>`).
- **Aviso:** píldora lima con sombra dura, en `role="status"`.

## Accesibilidad

Enlace «Saltar al contenido», foco visible de 3 px, errores del campo en línea (`aria-describedby`/`aria-invalid`), región `aria-live` aparte para el veredicto, foco devuelto al borrar una opción, botón de girar sin `disabled` durante el giro, y `prefers-reduced-motion` respetado en CSS y JS.
