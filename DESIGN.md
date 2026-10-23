---
name: La Ruleta — Aurora
description: Una ruleta de decisiones sobre una aurora en movimiento, con paneles de vidrio, bisel cromado con bombillas y porciones de gema.
colors:
  bg-night: "#07060f"
  bg-day: "#f1efff"
  surface-night: "#15132b"
  surface-day: "#fbfaff"
  text-night: "#f4f2ff"
  text-day: "#15122e"
  accent-night: "#8b7bff"
  accent-day: "#5b4bff"
  cyan: "#22d3ee"
  pink: "#ff4fa3"
typography:
  display:
    fontFamily: "Unbounded, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 5.6vw, 4.3rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Manrope, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
---

# La Ruleta — Aurora

Diseño oficial de `main`. Sustituye al almanaque editorial anterior por un escenario inmersivo, oscuro por defecto y en pastel de día.

## Principios

- **La aurora es el escenario.** Dos capas de gradientes radiales derivan despacio detrás de todo (`body::before` y `body::after`, solo `transform`). El color vive en el fondo y en la ruleta; la interfaz es vidrio.
- **Vidrio con intención.** Cabecera, bloques y avisos usan `backdrop-filter` con borde de 1 px y un brillo interior superior. El veredicto es la excepción: superficie opaca con borde degradado y un tinte del color ganador, para que el texto se lea siempre.
- **La ruleta es una pieza de joyería.** Bisel cromado (`conic-gradient`), pozo oscuro, 24 bombillas que parpadean en cadena (más rápido mientras gira), porciones de gema con degradado radial, brillo fijo de luz y clavijas en cada separador. El puntero es una gema rosa.
- **El veredicto tiñe la escena.** Al terminar, `--win` colorea el halo detrás de la rueda, el borde del bisel y el resplandor de la tarjeta.
- **Dos voces tipográficas.** Unbounded (ancha, 700–800) para titulares y resultado; Manrope para texto e interfaz.
- **Una sola paleta de gemas.** Las porciones se dibujan sobre un pozo oscuro, así que `GEMS` en `app.js` es la misma de día y de noche.

## Tokens

`styles.css`, en `:root` (día) y `[data-theme="night"]`: `--bg`, `--surface`, `--text`, `--text-soft`, `--text-mute`, `--glass`, `--glass-strong`, `--glass-border`, `--field`, `--accent`, `--accent-2`, `--accent-3`, `--btn-grad`, `--text-grad`, `--focus` y los cuatro `--aurora-*`.

## Componentes

- **Cabecera:** píldora de vidrio fija (`sticky`) con insignia cónica, nombre y etiqueta; botones circulares de tema, idioma y sonido.
- **Titular:** centrado, con la palabra clave en degradado animado (`--text-grad`).
- **Rueda:** columna principal; debajo, la leyenda de teclado y el veredicto.
- **Botón central:** vidrio oscuro con un anillo que late para invitar a girar; deja de latir al girar.
- **Panel:** opciones (campo, filas con punto luminoso, barajar/reiniciar) e historial en píldoras.
- **Portada y 404:** tarjeta de vidrio centrada con título en degradado y dos botones de idioma.

## Accesibilidad

Enlace «Saltar al contenido», foco de 3 px, errores del campo en línea, región `aria-live` aparte para el veredicto, foco devuelto al borrar, botón de girar sin `disabled` en pleno giro, `touch-action`, y `prefers-reduced-motion` desactiva la aurora, las bombillas, el anillo y la entrada escalonada (CSS y JS). Contraste mínimo 4,5:1 en texto.
