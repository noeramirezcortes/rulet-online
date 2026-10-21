# Ruleta de la Suerte

Aplicación web de una ruleta aleatoria, hecha con HTML, CSS y JavaScript puro. No necesita instalación, compilación ni dependencias: son tres archivos estáticos listos para subir a cualquier hosting.

![Vista de la ruleta](preview.png)

## Funciones

- Ruleta animada con física de frenado suave y sonido de tics (se puede silenciar).
- Opciones editables: añadir, eliminar, mezclar y restablecer.
- Resultado destacado, confeti y historial de los últimos resultados.
- Persistencia en `localStorage`: las opciones y el historial se conservan al recargar.
- Atajos de teclado: `Espacio` para girar, `Enter` para añadir una opción.
- Diseño responsive para móvil, tableta y escritorio.
- Accesible: navegación por teclado, foco visible, etiquetas ARIA y respeto a `prefers-reduced-motion`.
- Versión en inglés en `en/index.html`, con enlace para cambiar de idioma.

## Archivos

```
index.html       Estructura y contenido (español)
en/index.html    Estructura y contenido (inglés)
styles.css       Diseño y animaciones (compartido)
app.js           Lógica de la ruleta (español)
en/app.js        Lógica de la ruleta (inglés)
```

## Uso local

Abre `index.html` con doble clic. Para probarla con un servidor local:

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js
npx serve .
```

Luego visita `http://localhost:8000`.

## Publicarla en internet

Es un sitio 100 % estático. Cualquiera de estas opciones funciona:

- **Netlify Drop**: arrastra la carpeta a https://app.netlify.com/drop.
- **GitHub Pages**: sube los archivos al repositorio y activa Pages en *Settings → Pages*.
- **Vercel**: importa el repositorio y despliega sin configuración adicional.
- **Cualquier hosting compartido**: sube los tres archivos por FTP a la carpeta pública.

La versión en inglés vive en la carpeta `en/` y usa la misma hoja de estilos: al desplegar, queda disponible en `https://tu-dominio.com/en/`.

## Personalización

En `app.js` puedes cambiar:

- `DEFAULT_OPTIONS`: las opciones que aparecen la primera vez.
- `PALETTE`: los colores de las porciones.
- `MAX_OPTIONS`: el límite de opciones (20 por defecto).
- `STORAGE_KEY`: la clave usada para guardar en el navegador.

En `en/app.js` están los mismos ajustes para la versión en inglés, con su propia `STORAGE_KEY` para que cada idioma conserve sus opciones por separado.

En `styles.css`, las variables de `:root` controlan colores, tipografía y radios.
