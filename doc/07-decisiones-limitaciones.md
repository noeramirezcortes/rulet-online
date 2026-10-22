# 07 · Decisiones, limitaciones y mantenimiento

## 1. Decisiones de diseño y su porqué

| Decisión | Motivo | Coste / alternativa descartada |
| --- | --- | --- |
| **Vanilla JS, sin framework** | Cero dependencias, cero build, despliegue inmediato y carga mínima | Estado y DOM manuales; sin reactividad ni componentes |
| **Un único `app.js` por idioma, en IIFE** | Evita globals, permite `file://` y mantiene todo localizable | Lógica duplicada; no hay exports ni tests unitarios directos |
| **Dos HTML independientes (ES/EN)** | Metadatos, `lang` y textos correctos sin runtime i18n | Duplicación de estructura y riesgo de que las versiones se desincronicen |
| **CSS único compartido** | Un solo sistema visual para ambos idiomas y ambos temas; menos peso y mantenimiento | Los estilos no pueden variar por idioma sin selectores extra |
| **Temas día y noche con preferencia guardada** | La página se adapta al sistema en la primera visita y recuerda la elección manual | Dos paletas que mantener y verificar; el tema se comparte entre idiomas |
| **Script mínimo en el `<head>`** | Fija `data-theme` antes del primer pintado y evita el destello de tema incorrecto | Un script inline más que autorizar en una CSP estricta |
| **Una paleta de gemas para ambos temas** | La ruleta se dibuja sobre un pozo oscuro, así que doce colores sirven de día y de noche; cada porción lleva degradado radial | Los colores viven en `GEMS` y hay que ajustarlos a mano en ambos JS |
| **Etiquetas del canvas con contraste calculado** | `labelColor` elige tinta o blanco según el contraste real de cada porción | Más código de dibujo; el resultado debe revisarse al cambiar la paleta |
| **Fuentes autoalojadas** | Unbounded y Manrope dan carácter sin CDN ni peticiones a terceros | Cuatro woff2 en el repositorio y `@font-face` que mantener |
| **Claves de almacenamiento separadas** | Cada idioma conserva su lista sin mezclar idiomas | Cambiar de idioma no traslada opciones; el usuario puede percibirlo como pérdida |
| **Enlace de idioma estático** | Sin JavaScript, sin parpadeo, indexable y accesible | Recarga completa; no conserva el estado de la ruleta |
| **Canvas 2D para la ruleta** | Sectores exactos, rotación barata y un solo elemento que redibujar | Texto menos accesible que HTML; etiquetas dibujadas a mano |
| **`localStorage`** | Persistencia clave-valor suficiente para < 2 KB por idioma | Sin consultas, sin sincronización, sin transacciones |
| **Web Audio sintetizado** | Sin archivos, sin licencias, sin peticiones; sonido inmediato | Tono sintético; requiere gesto del usuario |
| **Render imperativo** | Sencillo de leer para 20 elementos | Reconstruye listas completas; fácil olvidar sincronizar un control |
| **Ganador sorteado antes de animar** | La animación es solo presentación; el resultado es justo e inmediato | Hay que calcular el ángulo para que coincida con el puntero |
| **`Math.random()`** | Suficiente para decisiones cotidianas | **No es criptográficamente seguro**; no usar para sorteos con valor económico |
| **Sin tests ni build** | El proyecto nace como archivos estáticos | Deuda técnica: cualquier cambio se valida a mano |
| **Límite de 20 opciones** | Mantiene las etiquetas legibles en pantalla | Listas largas quedan fuera; el límite es fijo |
| **Historial de 12 (muestra 10)** | Margen para futuras ampliaciones sin cambiar el esquema | Se almacenan 2 entradas invisibles |
| **Reset con `confirm()`** | Evita pérdidas accidentales sin construir un modal | Ruptura estética y no personalizable |

## 2. Limitaciones conocidas

### Funcionales

1. **Una sola ruleta por idioma.** No hay listas con nombre ni cambio rápido entre conjuntos.
2. **Sin pesos.** Todas las opciones tienen la misma probabilidad.
3. **Sin compartir.** No se puede enviar una lista por URL ni importarla desde la interfaz.
4. **Sin sincronización entre pestañas.** No se escucha el evento `storage`; la última pestaña que
   guarde gana y las demás muestran datos obsoletos hasta recargar. El tema tampoco se propaga en
   caliente entre pestañas.
5. **Sin sincronización entre idiomas.** Cada versión guarda opciones, historial y silencio en su
   propia clave; cambiar de idioma no traslada nada. El tema sí es compartido.
6. **El resultado no se restaura al recargar.** Opciones, historial, silencio y tema sí; la tarjeta
   vuelve a `—`.
7. **Historial de solo 10 visibles** aunque se guarden 12, sin marcas de tiempo ni botón de vaciado.
8. **Duplicados permitidos.** Añadir «Pizza» dos veces crea dos porciones indistinguibles.
9. **Restablecer conserva el silencio y el tema.** Puede sorprender si se espera un reset total.
10. **El límite de 40 caracteres se aplica en tres sitios por idioma** (HTML y dos en JS); si se cambia
    uno solo, el comportamiento es inconsistente.
11. **La preferencia de movimiento reducido se lee una vez.** Cambiarla requiere recargar; el tema, en
    cambio, sí reacciona al sistema si no hay elección guardada.
12. **Solo dos idiomas.** No hay detección automática del navegador ni redirección.
13. **La fecha de la edición se escribe con JS.** Sin JavaScript queda el texto estático «Edición de
    hoy» / «Today's edition».

### Técnicas

14. **Lógica duplicada.** `app.js` y `en/app.js` son copias con textos distintos. Un arreglo en uno no
    llega al otro; ya hay pequeñas diferencias de comentarios.
15. **Acoplamiento fuerte al DOM por ID.** Un ID renombrado provoca un `TypeError` al arrancar y deja
    la página sin funcionalidad (no hay manejo de errores de inicialización).
16. **Sin tests automatizados ni linting.** Las regresiones se detectan a mano, y ahora hay que probar
    dos versiones, dos temas y varios anchos.
17. **`localStorage` falla en silencio.** Si está bloqueado, el usuario no sabe que no se guardará nada;
    el tema se resuelve siguiendo el sistema en cada carga.
18. **Historial sin validar longitud ni formato de color al cargar.** Se comprueba que `label` y
    `color` sean strings, pero una etiqueta de miles de caracteres o un color inválido pueden romper
    el diseño (no ejecutan código).
19. **`color-mix()` y `backdrop-filter`** requieren navegadores recientes. Sin `color-mix()` se pierden
    el halo de la rueda, el tinte del veredicto y el resplandor del texto ganador; sin `backdrop-filter`
    los paneles de vidrio no desenfocan la aurora.
20. **El canvas no es enfocable** (`role="img"` + `click`), aunque el botón central ofrece la misma
    acción por teclado. Las etiquetas tampoco son texto seleccionable ni traducible.
21. **Objetivos táctiles ajustados** en los botones `×` (36×36 px) y en los de cabecera (42×42 px en
    escritorio, 40×40 px en móvil).
22. **El estado «Girando»/«Spinning» no es `aria-live`**; solo se anuncia el valor final.
23. **Animación ligada a `requestAnimationFrame` y al reloj.** En pestañas en segundo plano el giro se
    pausa y termina al volver; no hay control de pausa.
24. **Coste visual en móviles modestos** por el `backdrop-filter`, las capas de aurora animadas, las
    24 bombillas y el canvas a DPR 2. Con movimiento reducido se apagan las animaciones.
25. **Sin `og:image`** pese a existir `preview.png`; al compartir no se muestra miniatura.
26. **Sin service worker.** No hay instalación como PWA ni garantía de funcionamiento offline tras
    limpiar caché.
27. **`hreflang` incompleto para producción.** Son rutas relativas (`index.html`, `en/index.html`), no
    URLs absolutas, y no hay `x-default` ni `canonical`. Los buscadores pueden ignorarlas o resolverlas
    de forma ambigua.
28. **Fuentes locales, no un CDN.** Son ~190 KB en total; la primera visita descarga las dos latinas
    precargadas (~71 KB) y el resto solo si aparece texto que las necesite.

## 3. Robustez y seguridad

| Tema | Estado |
| --- | --- |
| XSS por etiquetas | **Mitigado**: se usa `textContent`, nunca `innerHTML`, para datos del usuario |
| Inyección en atributos | Etiquetas usadas en `title` y `aria-label` mediante APIs del DOM; sin concatenación HTML |
| Datos remotos | No existen; no hay `fetch` ni terceros |
| Privacidad | Todo queda en `localStorage`; no hay analítica ni envío de datos |
| `Math.random` | No criptográfico; aceptable para ocio, no para apuestas |
| Manipulación de `localStorage` | El usuario puede editar los datos; se renderizan como texto, pero no se validan longitudes del historial |
| Dependencias | Ninguna; superficie de suministro nula |
| CSP | Compatible con `default-src 'self'`; el favicon requiere `img-src data:` y el script de tema un *hash* o `'unsafe-inline'` |
| Preferencia de tema | Se valida al leerla (`day`/`night`); cualquier otro valor cae al sistema |

## 4. Mejoras propuestas

### Prioridad alta

1. **Eliminar la duplicación de lógica.** Extraer un módulo compartido (`wheel.js`, `state.js`,
   `audio.js`) con un pequeño build, o al menos unificar mediante un objeto de textos (`i18n.js`).
2. **Tests de humo automatizados** con Playwright para ambas páginas: cargar, añadir, girar, persistir,
   resetear, cambiar de idioma y alternar tema.
3. **Sincronización entre pestañas** con `window.addEventListener("storage", …)` y recarga de estado,
   incluido el tema.
4. **Accesibilidad**:
   - Aumentar los botones `×` a ≥ 44 px o añadir área táctil.
   - Añadir `aria-live` al estado del giro o un `aria-describedby` con la pista.
   - Revisar el contraste del pie, placeholders y textos vacíos en ambos temas.
5. **Validar el historial al cargar**: recortar etiquetas a 40 caracteres y aceptar solo colores
   `#rgb`/`#rrggbb` (o caer a un color por defecto).
6. **Completar SEO bilingüe**: `hreflang` absolutos, `x-default`, `canonical` y `og:image` con
   `preview.png`.

### Prioridad media

7. **Compartir por URL**: serializar las opciones en el hash (`#opciones=Pizza,Sushi,…`) y leerlas al
   cargar; permite enviar una ruleta sin backend.
8. **Exportar/importar JSON** desde la interfaz.
9. **Vaciar historial** y eliminar entradas individuales; añadir marcas de tiempo.
10. **Advertir de duplicados** o ignorarlos opcionalmente.
11. **Pesos/probabilidades** por opción y modo «sin repetición».
12. **Varias listas** guardadas con nombre (IndexedDB o claves separadas).
13. **Detección de idioma** con `navigator.language` y redirección opcional, respetando una elección
    manual (cookie o `localStorage`).
14. **PWA** con service worker y manifiesto para uso offline instalado.
15. ~~**Preferencia de movimiento reactiva**~~ — hecho: `reduced()` consulta el `MediaQueryList` en cada uso.
16. **Tercer tema o acentos por estación** (por ejemplo, una variante sepia) reutilizando los tokens;
    y eliminar los colores literales que quedan en el bisel, el hub, las bombillas y el canvas.

### Prioridad baja / refactor

17. Separar en módulos con un build ligero y migrar a TypeScript.
18. Sustituir `confirm()` por un diálogo propio accesible.
19. Adoptar un sistema i18n real (archivos de mensajes, plurales, formato) para añadir idiomas sin
    duplicar JS.
20. Añadir `manifest.webmanifest`, iconos y meta `apple-touch-icon`.
21. Generar `en/app.js` desde `app.js` con un script versionado en el repositorio, en lugar de
    mantener dos copias a mano.

## 5. Cómo extender: cuatro recetas

### A. Botón «Vaciar historial» / «Clear history»

1. Añadir el botón en cada `index.html` dentro de la tarjeta de historial.
2. Cachearlo en `els` de ambos JS.
3. Crear `clearHistory()`: `history = []`, `renderHistory()`, `saveState()`.
4. Enganchar el listener en la sección de eventos y deshabilitarlo durante el giro en `syncControls`.
5. Estilos: reutilizar `.btn` o `.icon-btn`.

### B. Leer opciones desde la URL

1. En el arranque, antes o después de `loadState` (decide prioridad), parsear `location.hash`.
2. Validar con las mismas reglas que `loadState` (strings, ≤ 40, ≤ 20).
3. Si hay opciones válidas, usarlas y no sobrescribir con `localStorage`.
4. Al cambiar opciones, actualizar el hash con `history.replaceState` (sin recargar).
5. Cuidado con caracteres especiales: usa `encodeURIComponent`/`URLSearchParams`.

### C. Añadir pesos

1. Cambiar el modelo a `{ label, weight }` (afecta a persistencia y compatibilidad: migrar).
2. Sortear con suma acumulada en lugar de `floor(random * n)`.
3. Decidir cómo representar visualmente el peso: porciones de distinto ángulo (afecta a
   `getIndexAtPointer` y `draw`) o mantener porciones iguales y solo cambiar la probabilidad
   (más simple, pero visualmente engañoso).
4. Actualizar documentación y pruebas en ambos idiomas.

### D. Añadir un tercer idioma

1. Crear `xx/index.html` copiando uno existente y traduciendo textos/metadatos; ajustar `lang`,
   `hreflang`, `og:locale` y los enlaces de idioma de **todas** las páginas.
2. Crear `xx/app.js` con textos, `DEFAULT_OPTIONS` y una `STORAGE_KEY` propia. El tema se comparte:
   usa la misma `THEME_KEY`.
3. Añadir el enlace `.lang-switch` en las tres cabeceras.
4. Verificar que `styles.css` y las fuentes se referencian correctamente (`../../styles.css` y
   `../assets/fonts/` si hay dos niveles).
5. Actualizar `hreflang` recíprocos y este documento.
6. **Mejor:** extraer primero la lógica común para no triplicar el código.

## 6. Convenciones del código

| Ámbito | Convención |
| --- | --- |
| Idioma de UI | Español en la raíz, inglés en `en/`; mismos IDs y estructura |
| Idioma de identificadores | Inglés (`options`, `renderHistory`, `wheelSize`) |
| JS | Comillas dobles, punto y coma, 2 espacios, `camelCase` |
| Funciones | Declaraciones para lógica principal; arrows para utilidades y callbacks |
| Estado | Variables de módulo, sin clases; mutación directa con guardas `if (spinning)` |
| DOM | `els` centralizado; creación con `createElement` + `textContent` |
| CSS | kebab-case, BEM ligero (`option__label`, `result__value`), secciones comentadas |
| Tokens | Prefijo `--`, en `:root` (día) y `[data-theme="night"]`; nunca una clase `.dark` |
| Temas | El atributo `data-theme` vive en `<html>`; los colores del canvas salen de `THEMES` |
| Comentarios | Solo cabeceras de sección y aclaraciones puntuales; el código es autoexplicativo |
| Accesibilidad | `aria-label` en botones icónicos, `aria-hidden` en decoración, foco visible |
| Paridad ES/EN | Todo cambio funcional se aplica a los dos JS; los textos, a los dos HTML |

## 7. Registro de verificación

| Comprobación | Resultado |
| --- | --- |
| Las piezas de la app existen y las rutas relativas son correctas | ✅ HTML, CSS, JS y seis woff2 |
| IDs usados por `els` existen en ambos HTML | ✅ (23/23 en cada uno) |
| No hay dependencias, imports ni peticiones de red | ✅ |
| `localStorage` se lee al inicio y se escribe tras cada cambio | ✅ opciones, historial, silencio y tema |
| Claves separadas por idioma y tema compartido | ✅ (`ruleta-de-la-suerte:v1`, `spin-the-wheel:v1`, `ruleta-theme`) |
| Límites 20 opciones / 40 caracteres / 12 historial / 10 visibles | ✅ en ambos JS |
| Movimiento reducido aplicado en CSS y JS | ✅ |
| Tema día/noche, conmutador y respeto a `prefers-color-scheme` | ✅ en ambos idiomas; sin destello inicial |
| Contraste de las etiquetas del canvas | ✅ peor par 4,70:1 (`#E0338F`); la paleta es la misma en ambos temas |
| Sintaxis de ambos JS | ✅ `node --check` |
| Rutas HTTP `/`, `/en/`, `styles.css`, `en/app.js` y fuentes | ✅ 200 con un servidor local |
| `hreflang` y `og:locale` en ambas páginas | ✅ (rutas relativas) |
| Enlace de idioma recíproco | ✅ (`en/index.html` ↔ `../index.html`) |
| Revisión visual en Chrome | ✅ escritorio (≈1540×780) y móvil de 390 px; día, noche y resultado; ES y EN. Sin errores de consola. No se revisaron 820/320 px ni el estado vacío con el nuevo diseño |
| Detector Impeccable | ⚠️ No se ha vuelto a ejecutar con el diseño Aurora |
| Tests / lint / CI | ⚠️ Ausentes |
| Documentación | `doc/` completa, enlazada desde el README; `DESIGN.md` y `PRODUCT.md` en la raíz |

La verificación visual del diseño Aurora se hizo en Chrome con capturas manuales de `/` y `/en/`.
Antes de un cambio grande, repite el plan de pruebas del
documento 06 en los dos idiomas.
