# 04 · Persistencia

## 1. Resumen

| Aspecto | Valor |
| --- | --- |
| API | `window.localStorage` |
| Claves | `ruleta-de-la-suerte:v1` (ES) · `spin-the-wheel:v1` (EN) |
| Formato | JSON de un solo objeto por idioma |
| Se guarda | Opciones, historial y silencio |
| No se guarda | Resultado actual, rotación, confeti, estado `spinning` |
| Alcance | Por origen (esquema + dominio + puerto) y por navegador/perfil |
| Caducidad | Ninguna; persiste hasta que se borre |
| Cifrado | No |
| Sincronización | No (no se escucha el evento `storage`) |
| Separación por idioma | **Sí**: cada página usa su propia clave |

Las páginas `/` y `/en/` comparten el mismo **origen** (mismo dominio y puerto) y, por tanto, el mismo
almacén de `localStorage`. Lo que las separa es la clave: son dos registros independientes dentro del
mismo almacén.

## 2. Esquema

Idéntico en ambos idiomas:

```json
{
  "options": ["Pizza", "Sushi", "Tacos"],
  "history": [
    { "label": "Tacos", "color": "#FFE066" },
    { "label": "Pizza", "color": "#FF6B6B" }
  ],
  "muted": false
}
```

| Campo | Tipo | Límite al guardar | Límite al cargar |
| --- | --- | --- | --- |
| `options` | `string[]` | Máx. 20 (lo impone `addOption`); cada una ≤ 40 caracteres | Filtra strings no vacíos, `trim`, ≤ 40 caracteres, máx. 20 |
| `history` | `{label: string, color: string}[]` | Máx. 12 (recorte en `finishSpin`) | Filtra entradas con `label` y `color` strings; máx. 12 |
| `muted` | `boolean` | Booleano | `Boolean(valor)` |

El historial se guarda de más reciente a más antiguo (`unshift`). La interfaz solo pinta los 10
primeros, así que las posiciones 11 y 12 existen en disco pero no se ven.

Tamaño máximo teórico por idioma con datos generados por la interfaz: ~20×40 + 12×(40 + 9) +
sobrecarga ≈ **1,5 KB**. No hay riesgo de cuota.

## 3. Claves por idioma

| Página | Idioma | Clave | Opciones iniciales |
| --- | --- | --- | --- |
| `index.html` | `es` | `ruleta-de-la-suerte:v1` | Pizza, Sushi, Hamburguesa, Tacos, Ensalada, Pasta, Ramen, Helado |
| `en/index.html` | `en` | `spin-the-wheel:v1` | Pizza, Sushi, Burger, Tacos, Salad, Pasta, Ramen, Ice cream |

Consecuencias:

- Cambiar de idioma **no** migra ni comparte opciones, historial ni silencio.
- Se puede tener una lista en español y otra distinta en inglés en el mismo navegador.
- Borrar una clave no afecta a la otra.
- Si en el futuro se unifica la clave, habría que decidir qué datos prevalecen y migrarlos.

## 4. Cuándo se escribe

`saveState()` se llama en cada página, sobre su clave, en:

| Acción | Función |
| --- | --- |
| Termina un giro | `finishSpin` |
| Añadir opción | `addOption` |
| Eliminar opción | `removeOption` |
| Mezclar | `shuffleOptions` |
| Restablecer | `resetAll` |
| Activar/silenciar sonido | listener de `#soundBtn` |

No se guarda durante el giro (solo al final), ni al cambiar el tamaño de ventana, ni al mostrar toasts.
Tampoco hay guardado por inactividad ni `beforeunload`.

## 5. Cuándo se lee

Una sola vez al arrancar la página, en `loadState()` (`app.js:98` / `en/app.js:98`), usando la clave
del idioma correspondiente. No se vuelve a leer después. Si otra pestaña modifica los datos, esta
pestaña no se enterará hasta recargar.

## 6. Saneado y casos límite

| Situación | Resultado |
| --- | --- |
| No hay clave para ese idioma | `loadState` devuelve `false`; se usan las opciones por defecto de ese idioma |
| JSON inválido | Se captura la excepción; se usan los valores por defecto |
| `localStorage` bloqueado o lleno | `loadState`/`saveState` fallan en silencio; la app sigue funcionando en memoria |
| `options` no es array | Se conservan las opciones por defecto |
| `options` es `[]` | **Se respeta**: la ruleta arranca vacía (es un estado alcanzable borrando todas las opciones) |
| Opciones con espacios o > 40 caracteres | Se normalizan/recortan al cargar |
| Historial con entradas corruptas | Se descartan esas entradas, no todo el historial |
| Etiqueta de historial muy larga | Se acepta sin recortar (solo se valida que sea string); puede romper el diseño |
| Color de historial inválido | Se acepta como variable CSS; el punto puede quedar sin color, sin ejecutar código |
| `muted` ausente | `false` (sonido activo) |
| `muted` con valor no booleano | Se convierte con `Boolean()` |
| Datos de una versión futura | No hay migración; se intentan leer con las reglas actuales |

## 7. Reset y borrado

- **Botón «Restablecer» / «Reset»**: pide confirmación, restaura las 8 opciones de ejemplo de ese
  idioma, vacía el historial y guarda el nuevo estado. La clave **no** se elimina. El silencio
  (`muted`) **se conserva**.
- **Borrado manual** desde DevTools:

```js
// Ver el estado guardado de cada idioma
JSON.parse(localStorage.getItem("ruleta-de-la-suerte:v1"));
JSON.parse(localStorage.getItem("spin-the-wheel:v1"));

// Borrar solo el español
localStorage.removeItem("ruleta-de-la-suerte:v1");
location.reload();

// Borrar ambos idiomas
localStorage.removeItem("ruleta-de-la-suerte:v1");
localStorage.removeItem("spin-the-wheel:v1");
location.reload();
```

- **Borrar datos del navegador**: también elimina estas claves, junto con el resto del sitio.
- **Cambiar de origen** (`file://`, `http://localhost:8000`, dominio publicado): son almacenes
  distintos; los datos no viajan entre ellos. `/` y `/en/` sí comparten origen, pero no clave.

## 8. Exportar / importar (recetas)

No hay función de exportación en la interfaz, pero el formato es JSON trivial:

```js
// Exportar el idioma actual (ejecutar en esa página)
copy(localStorage.getItem("ruleta-de-la-suerte:v1")); // o "spin-the-wheel:v1"

// Importar (pegar el JSON entre las comillas simples)
localStorage.setItem("ruleta-de-la-suerte:v1", '{"options":["A","B"],"history":[],"muted":true}');
location.reload();
```

## 9. Privacidad

- Los datos **nunca salen del navegador**: no hay `fetch`, `XMLHttpRequest`, `sendBeacon`, websockets
  ni recursos remotos.
- En un equipo compartido, cualquier persona que use el mismo perfil puede ver las opciones guardadas
  de ambos idiomas.
- No se guardan marcas de tiempo, identificadores ni resultados del sistema.
- Al no haber backend, no hay retención del lado del servidor; el hosting solo ve la petición de los
  archivos estáticos.

## 10. Versionado

Las claves incluyen `:v1` y son distintas por idioma. No existe lógica de migración entre versiones.
Estrategias al cambiar el esquema:

1. **Cambiar de clave** (p. ej. `:v2`): los usuarios empiezan de cero, sin errores. Hay que hacerlo en
   ambos JS.
2. **Migrar en `loadState`**: detectar campos ausentes y completarlos. Mantener compatibilidad y
   probar los casos corruptos.

Si se renombra una clave, conviene actualizar este documento, el README y el plan de pruebas.
