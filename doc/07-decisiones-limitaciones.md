# 07 · Decisiones, limitaciones y mantenimiento

## 1. Decisiones de diseño y su porqué

| Decisión | Motivo | Coste / alternativa descartada |
| --- | --- | --- |
| **Vanilla JS, sin framework** | Cero dependencias, cero build, despliegue inmediato y carga mínima | Estado y DOM manuales; sin reactividad ni componentes |
| **Un único `app.js` en IIFE** | Evita globals, permite `file://` y mantiene todo localizable | No hay exports ni tests unitarios directos; acoplamiento interno |
| **Canvas 2D para la ruleta** | Sectores exactos, rotación barata y un solo elemento que redibujar | Texto menos accesible que HTML; hay que dibujar etiquetas a mano |
| **`localStorage`** | Persistencia clave-valor suficiente para < 2 KB | Sin consultas, sin sincronización, sin transacciones |
| **Web Audio sintetizado** | Sin archivos, sin licencias, sin peticiones; sonido inmediato | Tono sintético; requiere gesto del usuario |
| **Render imperativo** | Sencillo de leer para 20 elementos | Reconstruye listas completas; fácil olvidar sincronizar un control |
| **Ganador sorteado antes de animar** | La animación es solo presentación; el resultado es justo e inmediato | Hay que calcular el ángulo para que coincida con el puntero |
| **`Math.random()`** | Suficiente para decisiones cotidianas | **No es criptográficamente seguro**; no usar para sorteos con valor económico |
| **Sin tests ni build** | El proyecto nace como tres archivos estáticos | Deuda técnica: cualquier cambio se valida a mano |
| **Fuentes del sistema** | Rapidez y privacidad | La apariencia varía entre sistemas operativos |
| **Solo tema oscuro y solo español** | Coherencia visual y alcance acotado | No hay modo claro ni i18n |
| **Límite de 20 opciones** | Mantiene las etiquetas legibles en pantalla | Listas largas quedan fuera; el límite es fijo |
| **Historial de 12 (muestra 10)** | Margen para futuras ampliaciones sin cambiar el esquema | Se almacenan 2 entradas invisibles |
| **Reset con `confirm()`** | Evita pérdidas accidentales sin construir un modal | Ruptura estética y no personalizable |

## 2. Limitaciones conocidas

### Funcionales

1. **Una sola ruleta.** No hay listas con nombre ni cambio rápido entre conjuntos.
2. **Sin pesos.** Todas las opciones tienen la misma probabilidad.
3. **Sin compartir.** No se puede enviar una lista por URL ni importarla desde la interfaz.
4. **Sin sincronización entre pestañas.** No se escucha el evento `storage`; la última pestaña que
   guarde gana y las demás muestran datos obsoletos hasta recargar.
5. **El resultado no se restaura al recargar.** Opciones, historial y silencio sí; la tarjeta vuelve a
   `—`.
6. **Historial de solo 10 visibles** aunque se guarden 12, sin marcas de tiempo ni botón de vaciado.
7. **Duplicados permitidos.** Añadir «Pizza» dos veces crea dos porciones indistinguibles.
8. **Restablecer conserva el silencio.** Puede sorprender si se espera un reset total.
9. **El límite de 40 caracteres se aplica en tres sitios** (HTML y dos en JS); si se cambia uno solo,
   el comportamiento es inconsistente.
10. **La preferencia de movimiento reducido se lee una vez.** Cambiarla requiere recargar.
11. **Solo español y tema oscuro.**

### Técnicas

12. **Acoplamiento fuerte al DOM por ID.** Un ID renombrado provoca un `TypeError` al arrancar y deja
    la página sin funcionalidad (no hay manejo de errores de inicialización).
13. **Sin tests automatizados ni linting.** Las regresiones se detectan a mano.
14. **`localStorage` falla en silencio.** Si está bloqueado, el usuario no sabe que no se guardará nada.
15. **Historial sin validar longitud ni formato de color al cargar.** Se comprueba que `label` y
    `color` sean strings, pero una etiqueta de miles de caracteres o un color inválido pueden romper
    el diseño (no ejecutan código).
16. **`color-mix()` y `backdrop-filter`** requieren navegadores recientes; sin ellos se pierde el
    resplandor del resultado o parte del efecto cristal.
17. **El canvas no es enfocable** (`role="img"` + `click`), aunque el botón central ofrece la misma
    acción por teclado.
18. **Objetivos táctiles pequeños** en los botones `×` (26×26 px).
19. **El `h1` con degradado y `color: transparent`** puede desaparecer en modo de alto contraste.
20. **El estado «Girando» no es `aria-live`**; solo se anuncia el valor final.
21. **Animación ligada a `requestAnimationFrame` y al reloj.** En pestañas en segundo plano el giro se
    pausa y termina al volver; no hay control de pausa.
22. **Coste visual en móviles modestos** por blur, sombras y `backdrop-filter`.
23. **Sin `og:image`** pese a existir `preview.png`; al compartir no se muestra miniatura.
24. **Sin service worker.** No hay instalación como PWA ni garantía de funcionamiento offline tras
    limpiar caché.

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
| CSP | Compatible con `default-src 'self'`; el favicon requiere `img-src data:` |

## 4. Mejoras propuestas

### Prioridad alta

1. **Tests de humo automatizados** con Playwright: cargar, añadir, girar, persistir y resetear.
2. **Sincronización entre pestañas** con `window.addEventListener("storage", …)` y recarga de estado.
3. **Accesibilidad**:
   - Aumentar los botones `×` a ≥ 44 px o añadir área táctil.
   - Añadir `aria-live` al estado del giro o un `aria-describedby` con la pista.
   - Soportar `forced-colors: active` (color sólido para el `h1`).
   - Verificar contraste de footer, placeholders y textos vacíos.
4. **Validar el historial al cargar**: recortar etiquetas a 40 caracteres y aceptar solo colores
   `#rgb`/`#rrggbb` (o caer a un color por defecto).
5. **Añadir `og:image`** usando `preview.png` con URL absoluta.

### Prioridad media

6. **Compartir por URL**: serializar las opciones en el hash (`#opciones=Pizza,Sushi,…`) y leerlas al
   cargar; permite enviar una ruleta sin backend.
7. **Exportar/importar JSON** desde la interfaz.
8. **Vaciar historial** y eliminar entradas individuales; añadir marcas de tiempo.
9. **Advertir de duplicados** o ignorarlos opcionalmente.
10. **Pesos/probabilidades** por opción y modo «sin repetición».
11. **Varias listas** guardadas con nombre (IndexedDB o claves separadas).
12. **PWA** con service worker y manifiesto para uso offline instalado.
13. **Preferencia de movimiento reactiva** con `matchMedia(...).addEventListener("change", …)`.
14. **Tema claro** y tokens para todos los colores literales.

### Prioridad baja / refactor

15. Separar en módulos (`state.js`, `wheel.js`, `audio.js`, `storage.js`) con un build ligero.
16. Migrar a TypeScript para tipar el estado y el contrato DOM.
17. Sustituir `confirm()` por un diálogo propio accesible.
18. Añadir i18n (archivo de textos y `lang` dinámico).
19. Añadir `manifest.webmanifest`, iconos y meta `apple-touch-icon`.
20. Internacionalizar el formato de números del contador.

## 5. Cómo extender: tres recetas

### A. Botón «Vaciar historial»

1. Añadir el botón en `index.html` dentro de la tarjeta de historial.
2. Cachearlo en `els` (`app.js:26`).
3. Crear `clearHistory()`: `history = []`, `renderHistory()`, `saveState()`.
4. Enganchar el listener en la sección de eventos y deshabilitarlo durante el giro en `syncControls`.
5. Estilos: reutilizar `.btn` o `.icon-btn`.

### B. Leer opciones desde la URL

1. En el arranque, antes de `loadState` o después (decide prioridad), parsear `location.hash`.
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
4. Actualizar documentación y pruebas.

## 6. Convenciones del código

| Ámbito | Convención |
| --- | --- |
| Idioma de UI | Español |
| Idioma de identificadores | Inglés (`options`, `renderHistory`, `wheelSize`) |
| JS | Comillas dobles, punto y coma, 2 espacios, `camelCase` |
| Funciones | Declaraciones para lógica principal; arrows para utilidades y callbacks |
| Estado | Variables de módulo, sin clases; mutación directa con guardas `if (spinning)` |
| DOM | `els` centralizado; creación con `createElement` + `textContent` |
| CSS | kebab-case, BEM ligero (`option__label`, `result__value`), secciones comentadas |
| Tokens | Prefijo `--`, en `:root`; algunos colores siguen literales |
| Comentarios | Solo cabeceras de sección y aclaraciones puntuales; el código es autoexplicativo |
| Accesibilidad | `aria-label` en botones icónicos, `aria-hidden` en decoración, foco visible |

## 7. Registro de verificación

| Comprobación | Resultado |
| --- | --- |
| Los tres archivos existen y se referencian con rutas relativas | ✅ |
| IDs usados por `els` existen en el HTML | ✅ (20/20) |
| No hay dependencias, imports ni peticiones de red | ✅ |
| `localStorage` se lee al inicio y se escribe tras cada cambio | ✅ |
| Límites 20 opciones / 40 caracteres / 12 historial / 10 visibles | ✅ |
| Movimiento reducido aplicado en CSS y JS | ✅ |
| Sin tests, sin lint, sin git | ⚠️ Ausentes |
| Documentación previa | Solo `README.md`; esta carpeta la completa |

Las afirmaciones de este documento se basan en la lectura del código, no en la ejecución en un
navegador. Antes de un cambio grande, valida el plan de pruebas del documento 06.
