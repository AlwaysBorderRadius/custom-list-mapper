[🇬🇧 English](#custom-lists-to-status-en) | [🇪🇸 Español](#custom-lists-to-status-es)

---

# 🇬🇧 Custom Lists to Status (EN)

A Seanime plugin that maps your **AniList custom lists** into **virtual status lists** (CURRENT / REPEATING / PLANNING / PAUSED / COMPLETED / DROPPED), so Seanime can see, filter and track anime that AniList hides from the standard status lists.

---

## Features

- Exposes all your custom list anime inside the standard AniList status lists (Home, My Lists, library).
- Mapped entries behave like normal status entries: progress, score, repeat and dates are preserved.
- Configurable mapping per status (which custom lists feed which status list), with a UI available through Streamer Mode / `$ui`.
- English (`en`) and Spanish (`es`) interface.

## Installation

### From the marketplace
Add the repository to Seanime (**Extensions → Marketplace → Change repository**) and install *Custom Lists to Status*.

Or install directly by URL (**Extensions → Add extensions**): paste the raw manifest URL

```text
https://raw.githubusercontent.com/AlwaysBorderRadius/custom-list-mapper/main/custom-list-mapper.json
```

### Manual (development)
Copy the plugin folder into `$SEANIME_DATA_DIR/extensions/` and reload extensions, keeping `isDevelopment: true` in the manifest.

## Usage

1. In AniList, create your custom lists (e.g. "Watching with dubs", "For later", "Suite").
2. Open the plugin settings UI and assign each custom list to one of the six statuses.
3. The plugin injects the mapped entries into the target status list whenever Seanime builds the collection.
4. Entries are deduplicated: if an anime is already present in a status list, it is not added twice.

## Permissions

- `anilist` — reads your AniList collection (raw + normalized) to merge custom list entries.
- `storage` — persists the mapping configuration.

No unsafe flags are used, so auto-updates stay enabled.

## Known issue

Seanime versions up to **3.10.2-Saisei** can intermittently crash (`nil pointer dereference`) when building the library collection under concurrent requests with large injected collections. This is an upstream Seanime bug (see `collection_helper.go:31`, `collection.go:187`); it is recovered by Seanime and typically results in a temporary empty Home. Not caused by this plugin's data itself.

## Development

- `code.js` — plugin payload (JavaScript), v1.8.6.
- `custom-list-mapper.json` — release manifest (`isDevelopment: false`, payload served from this repo).

## License

MIT.

---

# 🇪🇸 Custom Lists to Status (ES)

Un plugin de Seanime que mapea tus **listas personalizadas de AniList** a **listas de estado virtuales** (CURRENT / REPEATING / PLANNING / PAUSED / COMPLETED / DROPPED), para que Seanime pueda ver, filtrar y hacer seguimiento de animes que AniList oculta de las listas de estado estándar.

---

## Funcionalidades

- Expone todos los animes de tus listas personalizadas dentro de las listas de estado estándar (Home, My Lists, librería).
- Las entradas mapeadas se comportan como entradas normales: progreso, nota, repeticiones y fechas se conservan.
- Mapeo configurable por estado (qué listas personalizadas alimentan qué lista de estado), con interfaz disponible en Streamer Mode / `$ui`.
- Interfaz en inglés (`en`) y español (`es`).

## Instalación

### Desde el marketplace
Añade el repositorio en Seanime (**Extensions → Marketplace → Change repository**) e instala *Custom Lists to Status*.

O instala directamente por URL (**Extensions → Add extensions**): pega la URL del manifest.

```text
https://raw.githubusercontent.com/AlwaysBorderRadius/custom-list-mapper/main/custom-list-mapper.json
```

### Manual (desarrollo)
Copia la carpeta del plugin dentro de `$SEANIME_DATA_DIR/extensions/` y recarga las extensiones, manteniendo `isDevelopment: true` en el manifest.

## Uso

1. En AniList, crea tus listas personalizadas (p. ej. "Viendo con doblaje", "Para más tarde", "Suite").
2. Abre la interfaz de ajustes del plugin y asigna cada lista personalizada a uno de los seis estados.
3. El plugin inyecta las entradas mapeadas en la lista de estado objetivo siempre que Seanime construye la colección.
4. Las entradas se deduplican: si un anime ya existe en una lista de estado, no se añade dos veces.

## Permisos

- `anilist` — lee tu colección de AniList (raw + normalizada) para fusionar las entradas de listas personalizadas.
- `storage` — guarda la configuración del mapeo.

No se usan unsafe flags, por lo que las auto-actualizaciones siguen activas.

## Problema conocido

Las versiones de Seanime hasta **3.10.2-Saisei** pueden crashear de forma intermitente (`nil pointer dereference`) al construir la colección de la librería bajo peticiones concurrentes con colecciones inyectadas grandes. Es un bug de Seanime (ver `collection_helper.go:31`, `collection.go:187`); Seanime lo recupera y normalmente solo deja Home vacía temporalmente. No lo causa la data del plugin en sí.

## Desarrollo

- `code.js` — payload del plugin (JavaScript), v1.8.6.
- `custom-list-mapper.json` — manifest de release (`isDevelopment: false`, payload servido desde este repo).

## Licencia

MIT.