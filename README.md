<div align="center">
  
[🇬🇧 English](#custom-lists-to-status-en) | [🇪🇸 Español](#custom-lists-to-status-es)

</div>

# 🇬🇧 Custom Lists to Status (EN)

A Seanime plugin that maps your **AniList custom lists** into **virtual status lists** (CURRENT / REPEATING / PLANNING / PAUSED / COMPLETED / DROPPED), so that Seanime can detect the anime you've marked as **'Hide from status lists'** in AniList — anime that only appear organized in your custom lists.

## Features

- Exposes all your custom list anime inside the standard AniList status lists (Home, My Lists, local library).
- Mapped entries behave like normal status entries: progress, score, repeat and dates are preserved.
- Configurable mapping per status (which custom lists feed which status list), with a settings UI available from the plugin's icon in the tray.
- English (`en`) and Spanish (`es`) interface.

## Installation

### From the marketplace
Add the community marketplace repository in Seanime (**Extensions → Marketplace → Change repository**):

```text
https://raw.githubusercontent.com/Bas1874/Seanime-Marketplace/refs/heads/main/Marketplace/Main.json
```

Or install directly by URL (**Extensions → Add extensions**): paste the raw manifest URL

```text
https://raw.githubusercontent.com/AlwaysBorderRadius/custom-list-mapper/main/custom-list-mapper.json
```

### Manual (development)
Copy the plugin folder into `$SEANIME_DATA_DIR/extensions/` and reload extensions, keeping `isDevelopment: true` in the manifest.

## Usage

1. In AniList, create your custom lists (e.g. "Watching with dubs", "For later", "Classics").
2. Open the plugin settings UI by clicking its icon in **Tray Plugins** and assign each custom list to one of the six statuses.
3. The plugin injects the mapped entries into the target status list whenever Seanime builds the collection.
4. Entries are deduplicated: if an anime is already present in a status list, it is not added twice.

## Permissions

- `anilist` — reads your AniList collection (raw + normalized) to merge custom list entries.
- `storage` — persists the mapping configuration.

No unsafe flags are used, so auto-updates stay enabled.

## Known issue

With Seanime up to **v3.10.2**, building the library collection under concurrent requests with large injected collections can intermittently fail inside the extension's serve flow (`nil pointer dereference` — upstream Seanime bug, see `collection_helper.go:31`, `collection.go:187`). The app does not crash: the error is recovered by Seanime, so you just get spammy error notifications (and possibly an empty Home until the next load). The extension keeps working afterwards.

## Development

- `code.js` — plugin payload (JavaScript), v1.8.6.
- `custom-list-mapper.json` — release manifest (`isDevelopment: false`, payload served from this repo).

## License

MIT.

---

# 🇪🇸 Custom Lists to Status (ES)

Un plugin de Seanime que mapea tus **listas personalizadas de AniList** a **listas de estado virtuales** (CURRENT / REPEATING / PLANNING / PAUSED / COMPLETED / DROPPED), para que Seanime pueda detectar los animes que tienes marcados como **'Hide from status lists'** en AniList — animes que solo aparecen organizados en tus listas personalizadas.

## Funcionalidades

- Expone todos los animes de tus listas personalizadas dentro de las listas de estado estándar (Home, My Lists, librería local).
- Las entradas mapeadas se comportan como entradas normales: progreso, nota, repeticiones y fechas se conservan.
- Mapeo configurable por estado (qué listas personalizadas alimentan qué lista de estado), con interfaz de ajustes accesible desde el icono de la extensión en la bandeja.
- Interfaz en inglés (`en`) y español (`es`).

## Instalación

### Desde el marketplace
Añade el repositorio del marketplace comunitario en Seanime (**Extensions → Marketplace → Change repository**):

```text
https://raw.githubusercontent.com/Bas1874/Seanime-Marketplace/refs/heads/main/Marketplace/Main.json
```

O instala directamente por URL (**Extensions → Add extensions**): pega la URL del manifest.

```text
https://raw.githubusercontent.com/AlwaysBorderRadius/custom-list-mapper/main/custom-list-mapper.json
```

### Manual (desarrollo)
Copia la carpeta del plugin dentro de `$SEANIME_DATA_DIR/extensions/` y recarga las extensiones, manteniendo `isDevelopment: true` en el manifest.

## Uso

1. En AniList, crea tus listas personalizadas (p. ej. "Viendo con doblaje", "Para más tarde", "Clásicos").
2. Abre la interfaz de ajustes del plugin haciendo clic en su icono en **Tray Plugins** y asigna cada lista personalizada a uno de los seis estados.
3. El plugin inyecta las entradas mapeadas en la lista de estado objetivo siempre que Seanime construye la colección.
4. Las entradas se deduplican: si un anime ya existe en una lista de estado, no se añade dos veces.

## Permisos

- `anilist` — lee tu colección de AniList (raw + normalizada) para fusionar las entradas de listas personalizadas.
- `storage` — guarda la configuración del mapeo.

No se usan unsafe flags, por lo que las auto-actualizaciones siguen activas.

## Problema conocido

Con Seanime hasta **v3.10.2**, al construir la colección de la librería bajo peticiones concurrentes con colecciones inyectadas grandes, la extensión puede fallar de forma intermitente con un error `nil pointer dereference` (bug de Seanime, ver `collection_helper.go:31` y `collection.go:187`). No es un crash de la aplicación: Seanime recupera el error y solo se spamean notificaciones (y a veces Home queda vacía hasta la siguiente carga). La extensión sigue funcionando después.

## Desarrollo

- `code.js` — payload del plugin (JavaScript), v1.8.6.
- `custom-list-mapper.json` — manifest de release (`isDevelopment: false`, payload servido desde este repo).