# 06 · Desarrollo y despliegue

## 1. Requisitos

- Un navegador moderno.
- Opcional para servidor local: Python 3 o Node.js.
- No hace falta `npm install`, compilador, bundler ni variables de entorno.

## 2. Ejecutar en local

### Opción A — abrir el archivo

Doble clic en `index.html` (o arrastrarlo al navegador). Funciona porque no hay módulos ES, `fetch`
ni rutas absolutas. Limitación: `localStorage` en `file://` puede comportarse de forma distinta según
el navegador (origen opaco, datos por archivo o bloqueados).

### Opción B — servidor estático

```powershell
# Python
python -m http.server 8000

# Node.js (descarga `serve` la primera vez)
npx serve .
```

Abre `http://localhost:8000`. También vale la extensión *Live Server* de VS Code.

### Opción C — cualquier servidor

Sirve la carpeta tal cual. No hay reescrituras de rutas ni configuración especial.

## 3. Desplegar

| Plataforma | Pasos | Notas |
| --- | --- | --- |
| **Netlify Drop** | Arrastrar la carpeta a <https://app.netlify.com/drop> | Publica la raíz; no hay build |
| **GitHub Pages** | Subir los archivos → *Settings → Pages* → rama/carpeta raíz | Añadir `.nojekyll` si se sirven carpetas con `_` |
| **Vercel** | Importar el repositorio, framework «Other», sin build | Directorio de salida: raíz |
| **Cloudflare Pages** | Conectar repo, build vacío, salida `/` | — |
| **Hosting compartido / FTP** | Subir `index.html`, `styles.css`, `app.js` a la carpeta pública | `preview.png` y `doc/` son opcionales |

Recomendaciones:

- Publica solo lo necesario; evita subir `.agents/`, `.devin/`, `.vibe/` y `skills-lock.json`.
- `index.html` con `Cache-Control: no-cache` o vida corta; CSS/JS pueden cachearse más, pero al no
  llevar *hash* en el nombre conviene una vida corta o añadir `?v=...` al referenciarlos.
- No se necesitan cabeceras CORS, CSP especial ni redirecciones. Si añades CSP, permite `'self'` para
  scripts/estilos y `data:` para el favicon; el audio y el canvas no requieren permisos.
- HTTPS no es obligatorio para que funcione, pero es lo esperable en cualquier hosting moderno.

## 4. Personalización

| Cambio | Archivo · línea | Instrucciones |
| --- | --- | --- |
| Opciones iniciales | `app.js:14` | Edita el array `DEFAULT_OPTIONS`. Afecta también a «Restablecer» |
| Colores de la ruleta | `app.js:19` | Edita `PALETTE` (12 hex). Se usa para porciones, puntos, chips y confeti |
| Máximo de opciones | `app.js:10` | `MAX_OPTIONS`. El contador se actualiza solo |
| Longitud máxima de una opción | `index.html:80`, `app.js:107`, `app.js:602` | Cambia el `maxlength` y los dos `slice(0, 40)` |
| Clave de almacenamiento | `app.js:9` | Cambiarla invalida los datos anteriores |
| Velocidad / vueltas | `app.js:478–481` | `turns`, `duration`, y los valores de `REDUCED` |
| Confeti | `app.js:350` | `70` móvil / `120` escritorio |
| Sonido | `app.js:149–182` | Frecuencias, tipos de onda, ganancias |
| Tema visual | `styles.css:2–16` | Tokens de color, radio y fuente |
| Fondo y halos | `styles.css:28–32`, `234–244` | Degradados radiales y halo de la ruleta |
| Puntos de ruptura | `styles.css:755`, `761` | 960 px y 560 px |
| Textos, título y SEO | `index.html` | `<title>`, `meta description`, OG, hero, footer |
| Favicon | `index.html:13` | SVG en data URI |
| Imagen para redes | `index.html` | No hay `og:image`; puedes añadir `preview.png` con URL absoluta |

> **Coherencia de color:** la paleta de la ruleta está en JS y el resto del tema en CSS. Si cambias
> una, revisa la otra.

## 5. Depuración

### Inspeccionar el estado

```js
// Datos persistidos
JSON.parse(localStorage.getItem("ruleta-de-la-suerte:v1"));

// Empezar limpio
localStorage.removeItem("ruleta-de-la-suerte:v1");
location.reload();
```

### Forzar estados

```js
// Ruleta vacía
localStorage.setItem("ruleta-de-la-suerte:v1", '{"options":[],"history":[],"muted":false}');
location.reload();

// Historial largo
const s = JSON.parse(localStorage.getItem("ruleta-de-la-suerte:v1"));
s.history = Array.from({length: 12}, (_, i) => ({ label: "Opción " + i, color: "#FF6B6B" }));
localStorage.setItem("ruleta-de-la-suerte:v1", JSON.stringify(s));
location.reload();
```

### Herramientas del navegador

- **DevTools → Application → Local Storage**: ver/editar/borrar la clave.
- **DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion`**: probar el modo reducido
  (requiere recargar porque `REDUCED` se lee al inicio).
- **DevTools → Performance**: revisar frames durante el giro y el confeti.
- **Lighthouse / axe**: accesibilidad, contraste y buenas prácticas.
- **Consola**: los errores de `localStorage` se silencian a propósito; para depurarlos, pon un
  `console.log` temporal en los `catch` de `loadState`/`saveState`.

### Puntos donde mirar primero si algo falla

| Síntoma | Causa probable |
| --- | --- |
| La ruleta no se dibuja | `wheelSize` es 0 (canvas oculto o sin tamaño) o falta `#wheelCanvas` |
| `Cannot read properties of null` | Un ID del HTML no coincide con el objeto `els` |
| El botón de girar está siempre deshabilitado | Menos de 2 opciones o `spinning` atascado en `true` |
| No se guarda nada | `localStorage` bloqueado, modo privado o clave distinta por origen |
| El resultado no coincide con la porción | Se tocó la geometría (`target`, `getIndexAtPointer`, sentido de giro) |
| No hay sonido | Navegador sin Web Audio, contexto suspendido o `muted = true` |
| El confeti no aparece | `prefers-reduced-motion` activo o canvas `#fx` sin tamaño |

## 6. Plan de pruebas manual

No hay tests automatizados. Checklist mínima antes de publicar cambios:

| # | Caso | Resultado esperado |
| ---: | --- | --- |
| 1 | Primera visita sin datos | 8 opciones de ejemplo, contador `8/20`, resultado `—`, historial vacío |
| 2 | Añadir con `Enter` | La opción aparece al final, el input se vacía y mantiene el foco |
| 3 | Añadir con el botón `+` | Igual que el anterior |
| 4 | Añadir texto vacío o solo espacios | Se ignora, sin errores ni toast |
| 5 | Añadir 21 opciones | A la 21.ª aparece «Puedes añadir hasta 20 opciones»; el contador no pasa de 20 |
| 6 | Opción de más de 40 caracteres | Se recorta a 40 |
| 7 | Opción duplicada | Se permite (comportamiento actual) y ocupa dos porciones |
| 8 | Eliminar opción | Desaparece de la lista, la ruleta se redibuja y persiste al recargar |
| 9 | Eliminar todas | Ruleta vacía con borde discontinuo, mensaje de ayuda, girar deshabilitado; persiste al recargar |
| 10 | Quedar solo 1 opción | Botón de girar deshabilitado y subtítulo «1 opción» |
| 11 | Mezclar | Cambia el orden, toast «Opciones mezcladas» y persiste |
| 12 | Girar con botón / clic en ruleta / `Espacio` | Gira, muestra «Girando», ticks, y al final el ganador con fanfarria y confeti |
| 13 | Girar dos veces seguidas | El segundo intento durante el giro se ignora |
| 14 | Resultado e historial | El ganador aparece arriba del historial con su color; se muestran como máximo 10 |
| 15 | Recargar tras varios giros | Opciones, historial y silencio se conservan; el resultado vuelve a `—` |
| 16 | Silenciar / reactivar | Cambia el icono y `aria-pressed`, no suena durante el giro si está silenciado, y persiste |
| 17 | Restablecer → cancelar | No cambia nada |
| 18 | Restablecer → aceptar | Vuelven las 8 opciones, historial vacío, resultado `—`; el silencio se mantiene |
| 19 | `localStorage` corrupto | Arranca con las opciones por defecto, sin errores visibles |
| 20 | `localStorage` bloqueado | La app funciona en memoria; al recargar vuelve al estado inicial |
| 21 | Ancho 360 / 768 / 1440 px | Sin desbordamiento horizontal; una columna en móvil y tableta |
| 22 | Solo teclado | `Tab` recorre controles, foco visible, `Espacio` gira, `Enter` añade |
| 23 | Movimiento reducido | Giro de ~0,65 s y 2 vueltas, sin confeti |
| 24 | JavaScript desactivado | Se muestra el aviso `<noscript>` |
| 25 | Sin red tras cargar | La app sigue funcionando (no hay peticiones) |

## 7. Rendimiento

- **Peticiones**: 3 archivos (HTML, CSS, JS) + favicon inline; sin fuentes ni CDN.
- **Peso**: ~43 KB de código sin comprimir (HTML 6 KB + CSS 17 KB + JS 20 KB); `preview.png` no se carga.
- **Dibujo**: la ruleta solo se redibuja al girar, cambiar opciones o redimensionar. No hay bucle
  permanente.
- **Confeti**: máximo 120 partículas, un solo `requestAnimationFrame`, se detiene al vaciarse.
- **DPR** limitado a 2 para evitar canvas gigantes en pantallas 3x/4x.
- **DOM**: la lista se reconstruye entera en cada cambio, pero el máximo es 20 elementos.
- **Coste potencial**: `backdrop-filter` en tarjetas y sombras grandes pueden notarse en móviles
  modestos; el blur del halo (`filter: blur(26px)`) también.
- **Sin memoria acumulada**: los nodos antiguos se descartan; los listeners mueren con ellos.

## 8. Compatibilidad

| Característica | Requiere | Si falta |
| --- | --- | --- |
| `color-mix()` | Chrome/Edge 111+, Firefox 113+, Safari 16.4+ | El resplandor del resultado no se aplica; el resto igual |
| `aspect-ratio` | Navegadores de 2021+ | La ruleta podría deformarse |
| `100svh` | Chrome 108+, Safari 15.4+, Firefox 101+ | Se ignora `min-height` |
| `backdrop-filter` | Modernos (Safari con prefijo, ya incluido) | Tarjetas más opacas, sigue legibles |
| `ResizeObserver` | Modernos | Solo se redimensiona con `window.resize` |
| `String.prototype.trimEnd` | ES2019 | `fitLabel` fallaría |
| `AudioContext` / `webkitAudioContext` | Modernos | Sin sonido |
| `Canvas 2D` | Universal | No hay ruleta |
| `localStorage` | Universal (puede estar bloqueado) | Sin persistencia |

Público objetivo razonable: **Chrome/Edge/Firefox/Safari de los últimos años**. No hay polyfills ni
transpilación; el código usa `const/let`, arrow functions, template literals, spread, `Array.find` y
`Element.append`.

## 9. Mantenimiento

Checklist al modificar:

1. Mantener sincronizados los IDs de `index.html` y el objeto `els`.
2. Si cambias el esquema guardado, actualizar `loadState`, `saveState`, este documento y el README.
3. Si cambias `MAX_OPTIONS`, revisar el texto `0/20` inicial del HTML y el `maxlength` si aplica.
4. Si cambias la paleta, comprobar contraste del texto del resultado (`#14182b` sobre porciones
   claras) y el color de los chips.
5. Probar el giro con 2, 8, 13 y 20 opciones (los casos de color y tamaño de fuente cambian).
6. Repetir el plan de pruebas manual, sobre todo persistencia y teclado.
7. Verificar móvil real o emulación a 360 px.
8. Revisar que no se hayan añadido peticiones de red accidentales (privacidad y offline).
