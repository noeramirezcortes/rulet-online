# 06 · Desarrollo y despliegue

## 1. Requisitos

- Un navegador moderno.
- Opcional para servidor local: Python 3 o Node.js.
- No hace falta `npm install`, compilador, bundler ni variables de entorno.

## 2. Ejecutar en local

El sitio es la carpeta `public/`. Las páginas usan rutas como `/es/` y `/en/` y el enlace de idioma
sale de una carpeta a otra, así que **necesita un servidor estático** (abrir los archivos con doble
clic ya no basta).

```powershell
# Python
python -m http.server 8000 --directory public

# Node.js (descarga `serve` la primera vez)
npx serve public
```

Abre `http://localhost:8000` (portada, redirige a `/es/` o `/en/`), `http://localhost:8000/es/` y
`http://localhost:8000/en/`. También vale la extensión *Live Server* de VS Code abriendo `public/`.

Estos servidores **no aplican `_headers`**: en local no se ve la CSP. Para probarla, sirve `public/` con
un servidor que añada esas cabeceras (o prueba en un despliegue de vista previa de Cloudflare Pages).

## 3. Desplegar

### Cloudflare Pages (despliegue actual)

| Ajuste | Valor |
| --- | --- |
| Repositorio | `noeramirezcortes/rulet-online`, rama `main` |
| Comando de build | vacío |
| **Directorio de salida (*Build output directory*)** | **`public`** |
| Dominio personalizado | `ruleta.yadale.click` (el único dominio de la app) |

Qué hace Pages con los archivos de `public/`:

- `_headers` se aplica como cabeceras HTTP (y no se publica como archivo).
- `404.html` se sirve en las rutas inexistentes. Sin él, Pages trata el sitio como una SPA y responde
  `200` con la portada en cualquier URL.
- `/es` → `/es/` y `/en/index.html` → `/en/` (URLs limpias) se resuelven solos.

**Solo se publica `public/`.** Antes de este cambio se servía la raíz del repositorio, de modo que
`doc/`, `PRODUCT.md`, `DESIGN.md` y `.impeccable/` eran accesibles desde internet.

#### Un solo dominio: reglas en Cloudflare

El subdominio inglés antiguo (`roulette.yadale.click`) **no se elimina**: se deja como redirección
permanente para no romper enlaces ni buscadores.

1. *Rules → Redirect Rules*: sustituye la regla actual de `roulette.yadale.click` (que mandaba `/` a
   `/en/` con 302) por una única regla:
   - Si el *hostname* es igual a `roulette.yadale.click` → redirección **estática**, código **301**, a
     `https://ruleta.yadale.click/en/`, sin conservar la cadena de consulta.
2. Mantén el dominio `roulette.yadale.click` asociado (registro DNS con proxy) mientras la regla deba
   funcionar. Si el dominio se quitara de Pages y del DNS, los enlaces antiguos dejarían de resolver.
3. En *SSL/TLS → Edge Certificates* conviene tener *Always Use HTTPS* activado.

#### Orden recomendado al migrar

1. En Pages, cambia el directorio de salida a `public` **antes** de fusionar el cambio (si se fusiona
   primero, la compilación no encuentra `public/` o publica una raíz vacía; el despliegue anterior
   sigue activo mientras no haya uno nuevo correcto).
2. Fusiona el PR a `main` y espera al despliegue.
3. Comprueba las rutas (lista de abajo).
4. Cambia la regla de redirección del subdominio inglés.
5. En Google Search Console, envía `https://ruleta.yadale.click/sitemap.xml`.

Comprobaciones tras publicar:

- `https://ruleta.yadale.click/` redirige a `/es/` o `/en/` según tu navegador (prueba una ventana
  privada con el idioma del navegador cambiado).
- `/es/` y `/en/` cargan con estilos y sin errores en la consola (incluidos avisos de CSP).
- El botón `EN`/`ES` cambia de idioma y `/` recuerda la elección.
- `https://roulette.yadale.click/` y `https://roulette.yadale.click/cualquier-ruta` dan **301** a
  `https://ruleta.yadale.click/en/`.
- `https://ruleta.yadale.click/doc/README.md`, `/PRODUCT.md` y `/.impeccable/config.json` dan **404**.
- Una ruta inventada devuelve **404** con la página 404 (no `200`).
- Las cabeceras de `/es/` incluyen `Content-Security-Policy`, `X-Content-Type-Options`, etc.
  (`curl -sI https://ruleta.yadale.click/es/`).

### Otros hosts

| Plataforma | Pasos | Notas |
| --- | --- | --- |
| **Netlify** | Publicar la carpeta `public` | Lee también `_headers`; para 404 usa `404.html` |
| **GitHub Pages** | Publicar `public` (acción de despliegue o rama `gh-pages`) | No lee `_headers`: sin CSP |
| **Vercel** | Framework «Other», directorio de salida `public` | Las cabeceras van en `vercel.json` |
| **Hosting compartido / FTP** | Subir el **contenido** de `public/` | Las cabeceras van en `.htaccess` o la configuración del servidor |

### Cabeceras de seguridad (`public/_headers`)

| Cabecera | Valor | Para qué |
| --- | --- | --- |
| `Content-Security-Policy` | `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'` | Solo se permite lo del propio dominio; sin scripts ni estilos en línea; el favicon `data:` está permitido. Bloquea inyección de scripts y *clickjacking* |
| `X-Content-Type-Options` | `nosniff` | El navegador respeta el tipo MIME declarado |
| `X-Frame-Options` | `DENY` | Refuerzo de `frame-ancestors` en navegadores antiguos |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | No filtra rutas a otros sitios |
| `Permissions-Policy` | cámara, micrófono, geolocalización, pago y USB desactivados | La app no los usa |
| `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy` | `same-origin` | Aísla la página y sus recursos |
| `Strict-Transport-Security` | `max-age=31536000` | Obliga a HTTPS durante un año |
| `Cache-Control` (solo `/assets/fonts/*`) | `public, max-age=31536000, immutable` | Las fuentes no cambian |

Consecuencias de la CSP al desarrollar:

- **No añadas `<script>` ni `<style>` en línea ni atributos `style="…"`**: se bloquearían. Usa archivos
  propios (por eso el script del tema es `theme.js`). Asignar estilos desde JS (`el.style.x = …`,
  `setProperty`) sí está permitido.
- No cargues nada de otros dominios (analítica, fuentes, CDN) sin ampliar la política. La analítica
  web de Cloudflare inyecta un script externo: quedaría bloqueada hasta permitir `static.cloudflareinsights.com`.
- Si añades `fetch`, hay que abrir `connect-src`.

El HTML y los JS/CSS usan el `Cache-Control` por defecto de Pages (`max-age=0, must-revalidate`, con
ETag): se revalidan en cada visita, sin riesgo de servir versiones viejas.

## 4. Personalización

> La lógica (`public/app.js`) y el CSS (`public/styles.css`) son únicos. Los textos viven en `LANGS`
> (dentro de `app.js`) y en `public/es/index.html` y `public/en/index.html`.

| Cambio | Archivo | Instrucciones |
| --- | --- | --- |
| Opciones iniciales | `public/app.js` | Edita `defaults` de cada idioma en `LANGS`. Afecta también a «Reiniciar» |
| Colores de la ruleta | `public/app.js` | Edita `GEMS` (y `THEMES.day` / `THEMES.night`). Se usan en porciones, puntos, chips y confeti |
| Máximo de opciones | `public/app.js` | `MAX_OPTIONS`. El contador se actualiza solo |
| Longitud máxima de una opción | ambos HTML y `public/app.js` | Cambia el `maxlength` y los `slice(0, 40)` |
| Claves de almacenamiento | `public/app.js` | `storageKey` por idioma en `LANGS`; `THEME_KEY` y `LANG_KEY` compartidas; cambiarlas invalida los datos |
| Velocidad / vueltas | `public/app.js` | `turns`, `duration` y los valores de `reduced()` dentro de `spin` |
| Confeti | `public/app.js` | `60` móvil / `100` escritorio en `burstConfetti` |
| Sonido | `public/app.js` | Frecuencias, tipos de onda y ganancias en `playTick` / `playFanfare` |
| Tema visual | `public/styles.css` | Tokens de `:root` (día) y `[data-theme="night"]` (noche); afecta a ambos idiomas |
| Tipografía | `public/styles.css`, `public/assets/fonts/` | Sustituye los woff2 y actualiza los `@font-face` y los `preload` de los tres HTML |
| Enlace de idioma | ambos HTML de idioma, `public/styles.css` | `href` relativo (`../en/`, `../es/`), `hreflang` y estilos de `.lang-link` |
| Dominio | `public/` | Reemplaza `https://ruleta.yadale.click` en `es/index.html`, `en/index.html`, `index.html`, `sitemap.xml` y `robots.txt` |
| Textos, título y SEO | `public/es/index.html`, `public/en/index.html` | `<title>`, `meta description`, OG, `canonical`, hero, footer |
| Favicon | los tres HTML y `404.html` | SVG en data URI (permitido por `img-src data:`) |
| Imagen para redes | los HTML de idioma | No hay `og:image`; añade una imagen de 1200×630 con URL absoluta |
| Añadir un idioma | `public/<código>/index.html`, `LANGS`, `sitemap.xml`, `hreflang` de todas las páginas, `gate.js`, `.lang-link` | Ver [07 · Decisiones](07-decisiones-limitaciones.md) |

> **Coherencia de color:** la paleta de la ruleta está en `app.js` y el resto del tema en CSS. Si cambias
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
- **Lighthouse / axe**: accesibilidad, contraste y buenas prácticas, en `/es/` y `/en/`.
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
| La versión EN no tiene estilos | Se desplegó una carpeta distinta de `public/` o se movió `en/index.html` (carga `../styles.css`) |
| El enlace de idioma da 404 | No se desplegó `public/en/` o `public/es/` (o el `href` cambió) |
| La página queda sin estilos o sin script y la consola habla de «Content Security Policy» | Se añadió un `<script>`/`<style>`/`style="…"` en línea o un recurso externo; ver «Cabeceras de seguridad» |
| `/` no redirige | `gate.js` bloqueado o JavaScript desactivado: se ven los dos botones de idioma (comportamiento esperado) |
| Cambiar de idioma «pierde» las opciones | Es el comportamiento actual: cada idioma usa su clave |

## 6. Plan de pruebas manual

No hay tests automatizados. Checklist mínima antes de publicar cambios:

| # | Caso | Resultado esperado |
| ---: | --- | --- |
| 1 | Primera visita a `/es/` sin datos | 8 opciones de ejemplo en español, contador `8/20`, resultado `—`, historial vacío, tema según el sistema |
| 2 | Primera visita a `/en/` sin datos | 8 opciones en inglés, textos en inglés, contador `8/20`, tema según el sistema |
| 3 | Enlace `EN` desde `/es/` | Navega a `/en/`; la página tiene `lang="en"` y estilos; guarda `wheel-lang=en` |
| 4 | Enlace `ES` desde `/en/` | Navega a `/es/` con `lang="es"`, sin pasar por redirecciones (también con el subdominio inglés antiguo ya redirigido) |
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
| 30 | Revisar el código fuente | `canonical` propio, `hreflang` es/en/x-default absolutos y `og:locale` correctos en cada página |
| 35 | Abrir `/` con navegador en español, inglés y otro idioma | Redirige a `/es/`, `/en/` y `/en/`; con `wheel-lang` guardado manda siempre a ese idioma |
| 36 | Abrir una ruta inexistente | Página 404 con enlaces a los dos idiomas y código HTTP 404 |
| 37 | Consola con la página cargada (en el despliegue) | Sin avisos de CSP ni 404 |
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
- **Recursos compartidos**: al cambiar de idioma, `styles.css`, `app.js`, `theme.js` y las fuentes ya
  están en caché; solo se descarga el HTML de la otra versión.
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

1. Mantener sincronizados los IDs de ambos HTML de idioma y el objeto `els` de `app.js`.
2. Mantener las entradas `es` y `en` de `LANGS` con las mismas claves de `copy`.
3. Si cambias el esquema guardado, actualizar `loadState`, `saveState`, este documento y el README.
4. Si cambias `MAX_OPTIONS`, revisar el texto `0/20` inicial de ambos HTML y el `maxlength` si aplica.
   Si añades scripts, estilos o recursos nuevos, ajusta la CSP de `public/_headers`.
5. Si cambias `THEMES.day`/`THEMES.night` o los tokens de color, comprueba el contraste real de las
   etiquetas del canvas (las resuelve `labelColor`), el puntero, el hub y los chips del historial, en
   día y en noche. Mantén alineadas la paleta de `app.js` y los tokens de `styles.css`.
6. Probar el giro con 2, 8, 13 y 20 opciones (los casos de color y tamaño de fuente cambian).
7. Repetir el plan de pruebas manual en `/es/` y, al menos, los casos clave en `/en/`.
8. Verificar móvil real o emulación a 360 px.
9. Revisar que no se hayan añadido peticiones de red accidentales (privacidad y offline).
10. Mantener el README sincronizado; ya describe la estructura, las fuentes autoalojadas, los dos
    temas y enlaza a `doc/README.md`.

## 10. Control de versiones

El repositorio está inicializado en git. `main` contiene el sitio bilingüe en `public/`, la
documentación y el enlace a ella desde el README. El diseño
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
