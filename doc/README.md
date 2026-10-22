# Documentación — Ruleta de la Suerte / Spin the Wheel

Documentación funcional y técnica de la aplicación de este repositorio, **bilingüe (español e
inglés)** y con el diseño **Aurora** (22/10/2026): paneles de vidrio sobre una aurora en movimiento, ruleta
con bisel cromado y bombillas, y dos temas, noche por defecto y día en pastel.

Verificada directamente contra el código actual (no contra suposiciones ni solo contra el README).

---

## Qué es, en una frase

Dos páginas estáticas equivalentes —español en la raíz e inglés en `en/`— que dibujan una ruleta en
`<canvas>`, eligen una opción al azar y guardan opciones, historial, silencio y tema en
`localStorage`, cada idioma con su propia clave.

## Índice

| Documento | Contenido | Cuándo leerlo |
| --- | --- | --- |
| [01 · Visión general](01-vision-general.md) | Propósito, funciones, flujo de usuario, alcance, glosario | Primera lectura, producto |
| [02 · Arquitectura](02-arquitectura.md) | Stack, estructura bilingüe, estado, flujos, eventos | Entender cómo encaja todo |
| [03 · Referencia de código](03-referencia-codigo.md) | Constantes, funciones, contrato del DOM, geometría y tiempos | Tocar `app.js` o `en/app.js` |
| [04 · Persistencia](04-persistencia.md) | Esquema de `localStorage`, claves por idioma, validación, reseteo | Cambiar datos guardados |
| [05 · Diseño y UI](05-diseno-ui.md) | Temas, tokens, tipografía, componentes, animaciones, responsive, accesibilidad | Tocar `styles.css` o la interfaz |
| [06 · Desarrollo y despliegue](06-desarrollo-despliegue.md) | Ejecutar, publicar, personalizar, depurar, plan de pruebas | Desarrollar o publicar |
| [07 · Decisiones y limitaciones](07-decisiones-limitaciones.md) | Decisiones, deuda técnica, mejoras propuestas, convenciones | Antes de refactorizar |

En la raíz del repositorio, fuera de `doc/`, hay dos documentos de referencia del rediseño:

- **[`../DESIGN.md`](../DESIGN.md)** — sistema visual: tokens, tipografía, espaciado, movimiento y
  componentes, con frontmatter legible por herramientas.
- **[`../PRODUCT.md`](../PRODUCT.md)** — propósito, público, principios de producto y criterios de
  éxito.

## Ficha del proyecto

| Dato | Valor |
| --- | --- |
| Tipo | Sitio web estático de una sola página por idioma, sin rutas ni backend |
| Stack | HTML5, CSS3 y JavaScript moderno sin frameworks |
| Entradas | `index.html` (español) y `en/index.html` (inglés) |
| Lógica | `app.js` (español) y `en/app.js` (inglés), prácticamente duplicados |
| Estilos | `styles.css`, **compartido** por ambos idiomas y ambos temas |
| Fuentes | `assets/fonts/`: Unbounded y Manrope, cuatro woff2 autoalojados (latín y latín-ext) |
| Temas | Día y noche; conmutador en cabecera, preferencia en `ruleta-theme` y respeto a `prefers-color-scheme` en la primera visita |
| Captura | `preview.png` (1440×1320, modo día; solo documentación) |
| Tamaño del código | ES: HTML 180 + CSS 977 + JS 824 líneas · EN: HTML 180 + JS 821 líneas |
| Dependencias | **Ninguna** (sin `package.json`, sin CDN, sin fuentes externas) |
| Build / compilación | **Ninguno**; se sirven los archivos tal cual |
| Backend / red | **Ninguno**; las páginas no hacen peticiones de red |
| Persistencia | `localStorage`: `ruleta-de-la-suerte:v1` (ES), `spin-the-wheel:v1` (EN) y `ruleta-theme` (compartida) |
| Tests automatizados | **No existen**; hay un plan de pruebas manual en el documento 06 |
| Idiomas | Español (raíz) e inglés (`/en/`), con enlace cruzado y `hreflang` |
| Repositorio git | Inicializado, con `.gitignore`; `main` contiene el diseño «Aurora» (PR #1); el almanaque anterior queda en el historial |
| Carpeta `doc/` | Esta documentación (no la usa la app) |

## Verificación realizada

- Se revisó el código completo de las piezas de la aplicación (dos HTML, dos JS, el CSS y las cuatro
  fuentes) y el contrato entre HTML y JS: IDs de `els`, presentes en ambos idiomas.
- Se comprobaron los valores reales de animación, sonido, límites, persistencia y geometría del canvas;
  el documento 07 recoge los matices que el `README.md` no detalla (por ejemplo, 12 resultados
  guardados frente a 10 visibles, o que cada idioma guarda sus datos por separado).
- Se verificó la sintaxis de ambos JS (`node --check`) y se sirvieron las páginas en local para
  confirmar que `/`, `/en/`, `styles.css`, `en/app.js` y las fuentes responden correctamente.
- Se revisó el resultado renderizado en Chrome (escritorio y 390 px), en día y noche, con resultado y
  ambas versiones de idioma, sin errores de consola.
- Se midió el contraste del texto sobre los tokens y de las etiquetas del canvas: el peor par queda en
  4,70:1.
- No se ha vuelto a ejecutar el detector Impeccable con el diseño Aurora.

## Aviso sobre carpetas ajenas a la app

`.agents/`, `.devin/` y `.vibe/` contienen copias de la *skill* `impeccable` para distintas herramientas
de agentes (ver `skills-lock.json`). **No forman parte de la aplicación**, no se cargan en el navegador
y están excluidas por `.gitignore`. `.impeccable/` guarda la configuración, el sidecar de diseño y las
capturas de revisión; tampoco se publica. La documentación se centra en `index.html`, `en/index.html`,
`styles.css`, `app.js`, `en/app.js` y `assets/fonts/`.
