# Ruleta de la Suerte

Aplicación web de una ruleta aleatoria, hecha con HTML, CSS y JavaScript puro. No necesita instalación, compilación ni dependencias: el sitio es una carpeta de archivos estáticos (`public/`) lista para subir a cualquier hosting.

![La ruleta Aurora en modo día](preview.png)

## Funciones

- Ruleta animada con física de frenado suave y sonido de tics (se puede silenciar).
- Opciones editables: añadir, eliminar, barajar y restablecer.
- Resultado destacado, confeti de papel e historial de los últimos veredictos.
- Dos temas, día y noche, con conmutador y preferencia guardada. La primera visita sigue el tema del sistema.
- Persistencia en `localStorage`: opciones, historial, sonido y tema se conservan al recargar.
- Atajos de teclado: `Espacio` para girar, `Enter` para añadir una opción.
- Diseño responsive para móvil, tableta y escritorio.
- Accesible: navegación por teclado, foco visible, etiquetas ARIA y respeto a `prefers-reduced-motion`.
- Dos idiomas en un solo dominio: `/es/` y `/en/`. La portada (`/`) lleva al idioma recordado o al del navegador, y el botón `EN`/`ES` de la cabecera cambia de uno a otro.

## Archivos

```
public/                 Todo lo que se publica (la raíz del sitio)
  index.html            Portada «/»: elige idioma y redirige
  es/index.html         Estructura y contenido en español
  en/index.html         Estructura y contenido en inglés
  404.html              Página de error
  styles.css            Sistema visual, temas y animaciones (compartido)
  app.js                Lógica de la ruleta y textos de los dos idiomas
  theme.js, gate.js     Scripts mínimos: tema antes del primer pintado y redirección de la portada
  assets/fonts/         Unbounded y Manrope autoalojadas (woff2)
  _headers              Cabeceras de seguridad y caché (Cloudflare Pages)
  robots.txt, sitemap.xml
doc/                    Documentación funcional y técnica (no se publica)
DESIGN.md               Sistema visual: tokens, tipografía y componentes
PRODUCT.md              Propósito, público y criterios de producto
preview.png             Captura de la interfaz (solo documentación)
```

La documentación detallada del proyecto está en [`doc/README.md`](doc/README.md).

## Uso local

Necesita un servidor estático (las páginas usan rutas como `/es/` y `/en/`):

```bash
# Opción 1: Python
python -m http.server 8000 --directory public

# Opción 2: Node.js
npx serve public
```

Luego visita `http://localhost:8000` (portada), `http://localhost:8000/es/` o `http://localhost:8000/en/`. Este servidor no aplica `_headers`, así que no reproduce la CSP.

## Publicarla en internet

Es un sitio 100 % estático: **publica solo la carpeta `public/`** (así `doc/`, `README.md` y demás no quedan expuestos).

- **Cloudflare Pages** (el despliegue actual): conecta el repositorio, comando de build vacío y *Build output directory* = `public`. Aplica `_headers` automáticamente.
- **Netlify / Vercel / GitHub Pages**: carpeta de publicación `public`. `_headers` es de Cloudflare y Netlify; en otros hosts hay que configurar esas cabeceras a su manera.
- **Hosting compartido**: sube por FTP el contenido de `public/`.

Las URLs absolutas para SEO (`canonical`, `hreflang`, `og:url`, `sitemap.xml`, `robots.txt`) usan el dominio `https://ruleta.yadale.click`. Si cambias de dominio, reemplaza ese texto en `public/`.

## Personalización

En `public/app.js` puedes cambiar:

- `LANGS`: por idioma (`es` y `en`), la clave de almacenamiento, las opciones iniciales y todos los textos de la interfaz. Cada idioma conserva sus opciones por separado.
- `THEMES` y `GEMS`: las paletas que usan la ruleta, los puntos y el confeti.
- `MAX_OPTIONS`: el límite de opciones (20 por defecto).

En `public/styles.css`, los tokens de `:root` definen la edición de día y `[data-theme="night"]` la de noche: fondo, superficies de vidrio, texto, acentos, degradados, aurora y tipografías. La estructura y los componentes usan esos tokens, así que un cambio de paleta afecta a ambos temas y a los dos idiomas.
