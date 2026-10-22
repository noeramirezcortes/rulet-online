# 06 · Desarrollo y despliegue

## 1. Requisitos

- Un navegador moderno.
- Opcional para servidor local: Python 3 o Node.js.
- No hace falta `npm install`, compilador, bundler ni variables de entorno.

## 2. Ejecutar en local

### Opción A — abrir los archivos

Doble clic en `index.html` (español) o en `en/index.html` (inglés). Funciona porque no hay módulos ES,
`fetch` ni rutas absolutas. Limitación: `localStorage` en `file://` puede comportarse de forma distinta
según el navegador (origen opaco, datos por archivo o bloqueados).

### Opción B — servidor estático

```powershell
# Python
python -m http.server 8000

# Node.js (descarga `serve` la primera vez)
npx serve .
```

Abre `http://localhost:8000` (ES) y `http://localhost:8000/en/` (EN). También vale la extensión
*Live Server* de VS Code.

### Opción C — cualquier servidor

Sirve la carpeta tal cual. No hay reescrituras de rutas ni configuración especial. Es importante
mantener la estructura: `en/index.html` carga `../styles.css` y `en/app.js`.

## 3. Desplegar

| Plataforma | Pasos | Notas |
| --- | --- | --- |
| **Netlify Drop** | Arrastrar la carpeta a <https://app.netlify.com/drop> | Publica la raíz, incluida `en/`; no hay build |
| **GitHub Pages** | Subir los archivos → *Settings → Pages* → rama/carpeta raíz | Mantener `en/` y `styles.css` en la raíz |
| **Vercel** | Importar el repositorio, framework «Other», sin build | Directorio de salida: raíz |
| **Cloudflare Pages** | Conectar repo, build vacío, salida `/` | — |
| **Hosting compartido / FTP** | Subir `index.html`, `app.js`, `styles.css`, `assets/fonts/` y la carpeta `en/` | `preview.png` y `doc/` son opcionales |

Comprobaciones tras publicar:

- `https://tu-dominio.com/` carga la versión española.
- `https://tu-dominio.com/en/` carga la inglesa con estilos (si no, falta `styles.css` en la raíz).
- El enlace `EN`/`ES` de la cabecera lleva a la otra versión.
- No hay errores 404 en la consola.

Recomendaciones:

- Publica solo lo necesario; evita subir `.agents/`, `.devin/`, `.vibe/`, `skills-lock.json` y `doc/`.
- `index.html` y `en/index.html` con `Cache-Control: no-cache` o vida corta; CSS/JS pueden cachearse
  más, pero al no llevar *hash* en el nombre conviene una vida corta o añadir `?v=...`.
- No se necesitan cabeceras CORS, CSP especial ni redirecciones. Si añades CSP, permite `'self'` para
  scripts, estilos y fuentes, `data:` para el favicon y un *hash* o `'unsafe-inline'` para el script
  mínimo del `<head>` que fija el tema antes de pintar; el audio y el canvas no requieren permisos.
- Las fuentes van en `assets/fonts/` y se sirven desde el propio dominio: no hay que configurar CORS,
  pero sí conviene cachearlas con una vida larga (llevan el peso en el nombre y no cambian).
- HTTPS no es obligatorio para que funcione, pero es lo esperable en cualquier hosting moderno.

## 4. Personalización

> Los cambios de lógica deben replicarse en **`app.js` y `en/app.js`**. Los textos, en
> **`index.html` y `en/index.html`**. `styles.css` es compartido.

| Cambio | Archivo | Instrucciones |
| --- | --- | --- |
| Opciones iniciales | `app.js`, `en/app.js` | Edita `DEFAULT_OPTIONS` en cada idioma. Afecta también a «Reiniciar» |
| Colores de la ruleta | `app.js`, `en/app.js` | Edita `THEMES.day` y `THEMES.night` en ambos. Se usan en porciones, puntos, chips y confeti |
| Máximo de opciones | `app.js`, `en/app.js` | `MAX_OPTIONS`. El contador se actualiza solo |
| Longitud máxima de una opción | `index.html`, `en/index.html`, ambos JS | Cambia el `maxlength` y los dos `slice(0, 40)` de cada JS |
| Claves de almacenamiento | `app.js`, `en/app.js` | `STORAGE_KEY` por idioma y `THEME_KEY` compartida; cambiarlas invalida los datos |
| Velocidad / vueltas | `app.js`, `en/app.js` | `turns`, `duration` y los valores de `reduced()` dentro de `spin` |
| Confeti | `app.js`, `en/app.js` | `60` móvil / `100` escritorio en `burstConfetti` |
| Sonido | `app.js`, `en/app.js` | Frecuencias, tipos de onda y ganancias en `playTick` / `playFanfare` |
| Tema visual | `styles.css` | Tokens de `:root` (día) y `[data-theme="night"]` (noche); afecta a ambos idiomas |
| Tipografía | `styles.css`, `assets/fonts/` | Sustituye los woff2 y actualiza los `@font-face` y los `preload` del `<head>` |
| Enlace de idioma | `index.html`, `en/index.html`, `styles.css` | Texto `EN`/`ES`, `href` (URL absoluta del otro subdominio), `hreflang` y estilos de `.lang-link` |
| Puntos de ruptura | `styles.css` | 1020 px y 640 px |
| Textos, título y SEO | `index.html`, `en/index.html` | `<title>`, `meta description`, OG, hero, footer |
| Favicon | `index.html`, `en/index.html` | SVG en data URI |
| Imagen para redes | Ambos HTML | No hay `og:image`; puedes añadir `preview.png` con URL absoluta |

> **Coherencia de color:** la paleta de la ruleta está en ambos JS y el resto del tema en CSS. Si cambias
> una, revisa la otra.

## 5. Depuración

### Inspeccionar el estado

```js
// Datos persistidos del idioma actual
JSON.parse(localStorage.getItem("ruleta-de-la-suerte:v1")); // ES
JSON.parse(localStorage.getItem("spin-the-wheel:v1"));      // EN

// Empezar limpio en el idioma actual (ejemplo ES)
localStorage.removeItem("ruleta-de-la-suerte:v1");
location.reload();
```

### Forzar estados

```js
// Ruleta vacía en español
localStorage.setItem("ruleta-de-la-suerte:v1", '{"options":[],"history":[],"muted":false}');
location.reload();

// Historial largo en inglés
const s = JSON.parse(localStorage.getItem("spin-the-wheel:v1"));
s.history = Array.from({length: 12}, (_, i) => ({ label: "Option " + i, color: "#FF6B6B" }));
localStorage.setItem("spin-the-wheel:v1", JSON.stringify(s));
location.reload();
```

### Herramientas del navegador

- **DevTools → Application → Local Storage**: ver/editar/borrar las dos claves.
- **DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion`**: probar el modo reducido
  (el CSS reacciona al instante; `reduced()` consulta la preferencia en cada giro).
- **DevTools → Performance**: revisar frames durante el giro y el confeti.
- **Lighthouse / axe**: accesibilidad, contraste y buenas prácticas, en `/` y `/en/`.
- **Consola**: los errores de `localStorage` se silencian a propósito; para depurarlos, pon un
  `console.log` temporal en los `catch` de `loadState`/`saveState`.

### Puntos donde mirar primero si algo falla

| Síntoma | Causa probable |
| --- | --- |
| La ruleta no se dibuja | `wheelSize` es 0 (canvas oculto o sin tamaño) o falta `#wheelCanvas` |
| `Cannot read properties of null` | Un ID del HTML no coincide con el objeto `els` |
| El botón de girar está siempre deshabilitado | Menos de 2 opciones o `spinning` atascado en `true` |
| No se guarda nada | `localStorage` bloqueado, modo privado o clave distinta por origen/idioma |
| El resultado no coincide con la porción | Se tocó la geometría (`target`, `getIndexAtPointer`, sentido de giro) |
| No hay sonido | Navegador sin Web Audio, contexto suspendido o `muted = true` |
| El confeti no aparece | `prefers-reduced-motion` activo o canvas `#fx` sin tamaño |
| La versión EN no tiene estilos | Falta `styles.css` en la raíz o se movió `en/index.html` |
| El enlace de idioma da 404 | No se desplegó la carpeta `en/` (o el `href` cambió) |
| Cambiar de idioma «pierde» las opciones | Es el comportamiento actual: cada idioma usa su clave |

## 6. Plan de pruebas manual

No hay tests automatizados. Checklist mínima antes de publicar cambios:

| # | Caso | Resultado esperado |
| ---: | --- | --- |
| 1 | Primera visita a `/` sin datos | 8 opciones de ejemplo en español, contador `8/20`, resultado `—`, historial vacío, tema según el sistema |
| 2 | Primera visita a `/en/` sin datos | 8 opciones en inglés, textos en inglés, contador `8/20`, tema según el sistema |
| 3 | Enlace `EN` desde la portada | Navega a `en/index.html`; la página tiene `lang="en"` y estilos |
| 4 | Enlace `ES` desde `/en/` | Vuelve a `index.html` con `lang="es"` |
| 5 | Añadir opciones en ES y cambiar a EN | La lista inglesa es independiente (y viceversa) |
| 6 | Añadir con `Enter` | La opción aparece al final, el input se vacía y mantiene el foco |
| 7 | Añadir con el botón `+` | Igual que el anterior |
| 8 | Añadir texto vacío o solo espacios | Se ignora, sin errores ni toast |
| 9 | Añadir 21 opciones | A la 21.ª aparece el toast de límite; el contador no pasa de 20 |
| 10 | Opción de más de 40 caracteres | Se recorta a 40 |
| 11 | Opción duplicada | Se permite (comportamiento actual) y ocupa dos porciones |
| 12 | Eliminar opción | Desaparece de la lista, la ruleta se redibuja y persiste al recargar |
| 13 | Eliminar todas | Ruleta vacía con borde discontinuo, mensaje de ayuda, girar deshabilitado; persiste |
| 14 | Quedar solo 1 opción | Botón de girar deshabilitado y subtítulo «1 opción» / «1 option» |
| 15 | Mezclar | Cambia el orden, toast correspondiente y persiste |
| 16 | Girar con botón / clic en ruleta / `Espacio` | Gira, muestra «Girando»/«Spinning», ticks, y al final el ganador con fanfarria y confeti |
| 17 | Girar dos veces seguidas | El segundo intento durante el giro se ignora |
| 18 | Resultado e historial | El ganador aparece arriba del historial con su color; máximo 10 visibles |
| 19 | Recargar tras varios giros | Opciones, historial y silencio se conservan por idioma; el resultado vuelve a `—` |
| 20 | Silenciar / reactivar | Cambia el icono y `aria-pressed`, no suena si está silenciado, y persiste por idioma |
| 21 | Reiniciar → cancelar | No cambia nada |
| 22 | Reiniciar → aceptar | Vuelven las 8 opciones de ese idioma, historial vacío, resultado `—`; el silencio y el tema se mantienen |
| 23 | `localStorage` corrupto | Arranca con las opciones por defecto del idioma, sin errores visibles |
| 24 | `localStorage` bloqueado | La app funciona en memoria; al recargar vuelve al estado inicial |
| 25 | Ancho 360 / 768 / 1440 px | Sin desbordamiento horizontal; una columna en móvil y tableta, en ambos idiomas |
| 26 | Solo teclado | `Tab` recorre tema, idioma, sonido, controles y `×`; foco visible; `Espacio` gira; `Enter` añade |
| 27 | Movimiento reducido | Giro de ~0,65 s y 2 vueltas, sin confeti |
| 28 | JavaScript desactivado | Se muestra el aviso `<noscript>` en el idioma de la página |
| 29 | Sin red tras cargar | La app sigue funcionando con los archivos y fuentes ya cacheados |
| 30 | Revisar el código fuente | `hreflang="es"`/`"en"` y `og:locale` correctos en cada página |
| 31 | Primera visita con el sistema en oscuro | Arranca en noche; con el sistema en claro, en día |
| 32 | Cambiar de tema y recargar | La preferencia se conserva y se comparte entre ES y EN |
| 33 | Cambiar `prefers-color-scheme` con la página abierta | Sigue el sistema solo si no hay preferencia guardada |
| 34 | Día y noche, escritorio y móvil | Etiquetas del canvas legibles, sin solaparse; el puntero y el hub contrastan |

## 7. Rendimiento

- **Peticiones**: HTML, CSS y JS de la página, más las dos fuentes latinas precargadas; el favicon es
  inline y no hay CDN.
- **Peso**: ~127 KB iniciales sin comprimir (unos 57 KB de HTML + CSS + JS y 71 KB de las dos fuentes
  latinas precargadas). Las variantes cursiva y latín-ext se descargan solo si se necesitan.
  `preview.png` no se carga.
- **CSS compartido**: al cambiar de idioma, `styles.css` y las fuentes suelen estar en caché; solo se
  descargan el HTML y el JS de la otra versión.
- **Dibujo**: la ruleta solo se redibuja al girar, cambiar opciones, cambiar de tema o redimensionar.
  No hay bucle permanente.
- **Confeti**: máximo 100 flecos, un solo `requestAnimationFrame`, se detiene al vaciarse.
- **DPR** limitado a 2 para evitar canvas gigantes en pantallas 3x/4x.
- **DOM**: la lista se reconstruye entera en cada cambio, pero el máximo es 20 elementos.
- **Coste potencial**: el `backdrop-filter` de los paneles de vidrio, las dos capas de aurora
  animadas (solo `transform`), las bombillas y el canvas a DPR 2 pueden notarse en móviles modestos.
  `prefers-reduced-motion` apaga las animaciones.
- **Sin memoria acumulada**: los nodos antiguos se descartan; los listeners mueren con ellos.

## 8. Compatibilidad

| Característica | Requiere | Si falta |
| --- | --- | --- |
| `color-mix()` | Chrome/Edge 111+, Firefox 113+, Safari 16.4+ | Se pierden el halo de la rueda, el tinte de la tarjeta del veredicto y el `text-shadow` del ganador; el resto igual |
| `backdrop-filter` | Chrome/Edge 76+, Safari 9+ (con prefijo), Firefox 103+ | Los paneles quedan semitransparentes sobre la aurora, sin desenfoque |
| `aspect-ratio` | Navegadores de 2021+ | La ruleta podría deformarse |
| `100svh` | Chrome 108+, Safari 15.4+, Firefox 101+ | Se ignora `min-height` |
| `text-wrap: balance` / `pretty` | Chrome 114+, Safari 17.5+, Firefox 121+ | Los títulos y el colofón parten de forma menos cuidada |
| `ResizeObserver` | Modernos | Solo se redimensiona con `window.resize` |
| `String.prototype.trimEnd` | ES2019 | `fitLabel` fallaría |
| `AudioContext` / `webkitAudioContext` | Modernos | Sin sonido |
| `Canvas 2D` | Universal | No hay ruleta |
| `localStorage` | Universal (puede estar bloqueado) | Sin persistencia |
| `hreflang` | Universal | Es solo una pista para buscadores; la navegación funciona igual |

Público objetivo razonable: **Chrome/Edge/Firefox/Safari de los últimos años**. No hay polyfills ni
transpilación; el código usa `const/let`, arrow functions, template literals, spread, `Array.find` y
`Element.append`.

## 9. Mantenimiento

Checklist al modificar:

1. Mantener sincronizados los IDs de ambos HTML y el objeto `els` de ambos JS.
2. **Replicar los cambios de lógica en `app.js` y `en/app.js`** (o extraer un módulo compartido).
3. Si cambias el esquema guardado, actualizar `loadState`, `saveState`, este documento y el README.
4. Si cambias `MAX_OPTIONS`, revisar el texto `0/20` inicial de ambos HTML y el `maxlength` si aplica.
5. Si cambias `THEMES.day`/`THEMES.night` o los tokens de color, comprueba el contraste real de las
   etiquetas del canvas (las resuelve `labelColor`), el puntero, el hub y los chips del historial, en
   día y en noche. Mantén alineadas la paleta de los dos JS y los tokens de `styles.css`.
6. Probar el giro con 2, 8, 13 y 20 opciones (los casos de color y tamaño de fuente cambian).
7. Repetir el plan de pruebas manual en ES y, al menos, los casos clave en EN.
8. Verificar móvil real o emulación a 360 px.
9. Revisar que no se hayan añadido peticiones de red accidentales (privacidad y offline).
10. Mantener el README sincronizado; ya describe la estructura, las fuentes autoalojadas, los dos
    temas y enlaza a `doc/README.md`.

## 10. Control de versiones

El repositorio está inicializado en git. `main` conserva la versión española original, la versión
inglesa con selector de idioma, la documentación y el enlace a ella desde el README. El diseño
**Aurora** (vidrio, aurora y bisel cromado) es el vigente en `main`; el diseño anterior, «almanaque
editorial», sigue en el historial y en la rama `rediseno-almanaque`. El número exacto de
commits puede variar:

El árbol de trabajo puede contener ajustes locales sin confirmar (por ejemplo, esta misma
documentación o retoques del README). Consulta siempre el estado real:

```powershell
git status
git diff
git log --oneline
```

No hay hooks, CI ni despliegue automatizado. Antes de publicar, confirma los cambios en un commit
coherente.
