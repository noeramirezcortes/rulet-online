# Documentación — Ruleta de la Suerte / Spin the Wheel

Documentación funcional y técnica de la aplicación de este repositorio, que desde la revisión del
**21/10/2026** es **bilingüe (español e inglés)**.

Verificada directamente contra el código actual (no contra suposiciones ni solo contra el README).

---

## Qué es, en una frase

Dos páginas estáticas equivalentes —español en la raíz e inglés en `en/`— que dibujan una ruleta en
`<canvas>`, eligen una opción al azar y guardan opciones, historial y silencio en `localStorage`,
cada idioma con su propia clave.

## Índice

| Documento | Contenido | Cuándo leerlo |
| --- | --- | --- |
| [01 · Visión general](01-vision-general.md) | Propósito, funciones, flujo de usuario, alcance, glosario | Primera lectura, producto |
| [02 · Arquitectura](02-arquitectura.md) | Stack, estructura bilingüe, estado, flujos, eventos | Entender cómo encaja todo |
| [03 · Referencia de código](03-referencia-codigo.md) | Constantes, funciones, contrato del DOM, geometría y tiempos | Tocar `app.js` o `en/app.js` |
| [04 · Persistencia](04-persistencia.md) | Esquema de `localStorage`, claves por idioma, validación, reseteo | Cambiar datos guardados |
| [05 · Diseño y UI](05-diseno-ui.md) | Tokens, tipografía, componentes, animaciones, responsive, accesibilidad | Tocar `styles.css` o la interfaz |
| [06 · Desarrollo y despliegue](06-desarrollo-despliegue.md) | Ejecutar, publicar, personalizar, depurar, plan de pruebas | Desarrollar o publicar |
| [07 · Decisiones y limitaciones](07-decisiones-limitaciones.md) | Decisiones, deuda técnica, mejoras propuestas, convenciones | Antes de refactorizar |

## Ficha del proyecto

| Dato | Valor |
| --- | --- |
| Tipo | Sitio web estático de una sola página por idioma, sin rutas ni backend |
| Stack | HTML5, CSS3 y JavaScript moderno sin frameworks |
| Entradas | `index.html` (español) y `en/index.html` (inglés) |
| Lógica | `app.js` (español) y `en/app.js` (inglés), prácticamente duplicados |
| Estilos | `styles.css`, **compartido** por ambos idiomas |
| Captura | `preview.png` (1440×1200, solo documentación) |
| Tamaño del código | ES: HTML 135 + CSS 807 + JS 697 líneas · EN: HTML 135 + JS 697 líneas |
| Dependencias | **Ninguna** (sin `package.json`, sin CDN, sin fuentes externas) |
| Build / compilación | **Ninguno**; se sirven los archivos tal cual |
| Backend / red | **Ninguno**; las páginas no hacen peticiones de red |
| Persistencia | `localStorage`: `ruleta-de-la-suerte:v1` (ES) y `spin-the-wheel:v1` (EN) |
| Tests automatizados | **No existen**; hay un plan de pruebas manual en el documento 06 |
| Idiomas | Español (raíz) e inglés (`/en/`), con enlace cruzado y `hreflang` |
| Repositorio git | Inicializado en rama `main`, con `.gitignore` |
| Carpeta `doc/` | Esta documentación (no la usa la app) |

## Verificación realizada

- Se leyó el código completo de las cinco piezas de la aplicación (dos HTML, dos JS y el CSS).
- Se comprobó el contrato entre HTML y JS (IDs, clases y atributos usados dinámicamente) en ambos
  idiomas: los IDs son los mismos.
- Se revisaron los valores reales de animación, sonido, límites y persistencia; el documento 07 recoge
  los matices que el `README.md` no detalla (por ejemplo, 12 resultados guardados frente a 10 visibles,
  o que cada idioma guarda sus datos por separado).
- Se detectó y documentó la duplicación de lógica entre `app.js` y `en/app.js`, que es el principal
  riesgo de mantenimiento.
- Se comprobó la sintaxis de ambos JS (`node --check`) y se sirvieron las páginas en local para
  confirmar que `/`, `/en/`, `styles.css` y `en/app.js` responden correctamente.
- No se modificó ningún archivo de la aplicación; solo se creó esta carpeta `doc/`.

## Aviso sobre carpetas ajenas a la app

`.agents/`, `.devin/` y `.vibe/` contienen copias de la *skill* `impeccable` para distintas herramientas
de agentes (ver `skills-lock.json`). **No forman parte de la aplicación**, no se cargan en el navegador
y están excluidas por `.gitignore`. La documentación se centra en `index.html`, `en/index.html`,
`styles.css`, `app.js` y `en/app.js`.
