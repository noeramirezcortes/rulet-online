# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas y grupos que necesitan decidir algo rápido —qué comer, quién paga, qué plan elegir— normalmente desde el móvil, en el momento y sin ganas de registrarse ni de leer instrucciones.

## Product Purpose

Una ruleta aleatoria gratuita que convierte una lista de opciones en una decisión. El éxito es que el visitante añada opciones, gire y obtenga un veredicto en segundos, y pueda repetir o ajustar sin fricción.

## Positioning

Instrumento de decisión instantáneo, sin registro, sin anuncios y sin servidor: las opciones y el historial se guardan solo en el navegador. Frente a las ruletas cargadas de anuncios y cuentas, gana por sobriedad y velocidad.

## Operating Context

- Se usa en el móvil o el escritorio, a menudo en grupo y con prisa.
- Dos idiomas completos: español en la raíz e inglés en `en/`, con conmutador entre ambos.
- Sitio estático: HTML, CSS y JavaScript sin dependencias ni compilación; se abre con doble clic o se sirve desde cualquier hosting.
- Persistencia en `localStorage`: opciones, historial, sonido y tema.
- Atajos: `Espacio` gira y `Enter` añade una opción.

## Capabilities and Constraints

- Hasta 20 opciones de 40 caracteres; mínimo 2 para girar.
- Añadir, eliminar, barajar y reiniciar; historial de los 12 últimos resultados (10 visibles).
- Sonido opcional con Web Audio (tics y fanfarria), silenciable y persistente.
- Tema día/noche con preferencia guardada; la primera visita sigue `prefers-color-scheme`.
- La ruleta se dibuja en `<canvas>`; los colores de las porciones viven en JavaScript, no en CSS.
- Sin backend, sin cuentas, sin cookies y sin anuncios.
- Accesibilidad: teclado, foco visible, etiquetas ARIA y `prefers-reduced-motion`.

## Brand Commitments

- Nombre: «Ruleta de la suerte» / «Spin the Wheel».
- Voz directa, breve y cordial, sin hype de casino ni promesas de premios.
- Identidad visual aprobada por el usuario: almanaque editorial en marfil (día) y tinta (noche), acento bermellón, filetes finos y tipografía didone.

## Evidence on Hand

- `preview.png` documenta el diseño anterior; no hay testimonios, métricas ni casos reales. No inventarlos.
- Las opciones por defecto son comida (Pizza, Sushi…): contenido de ejemplo, no datos de usuario.

## Product Principles

1. La decisión ocurre en segundos; ningún paso decorativo se interpone.
2. La ruleta es la protagonista; el resto de la interfaz la sirve.
3. Privacidad por diseño: todo se queda en el navegador.
4. Sobriedad con carácter: elegante, nunca estridente.
5. Funciona igual con teclado, lector de pantalla o movimiento reducido.

## Accessibility & Inclusion

- Objetivo WCAG 2.1 AA en texto y controles; foco visible y objetivos táctiles cómodos.
- Respeto a `prefers-reduced-motion` en CSS y JavaScript.
- Interfaz bilingüe con `lang` correcto en cada documento.
