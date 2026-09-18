# Custom Lists to Status

A Seanime plugin that maps your **AniList custom lists** into **virtual status lists** (CURRENT / REPEATING / PLANNING / PAUSED / COMPLETED / DROPPED), so Seanime can see, filter and track anime that AniList hides from the standard status lists.

>

Un plugin de Seanime que mapea tus **listas personalizadas de AniList** a **listas de estado virtuales** (CURRENT / REPEATING / PLANNING / PAUSED / COMPLETED / DROPPED), para que Seanime pueda ver, filtrar y hacer seguimiento de animes que AniList oculta de las listas de estado estándar.

---

## Features / Funcionalidades

- Exposes all your custom list anime inside the standard AniList status lists (Home, My Lists, library).
- / Expone todos los animes de tus listas personalizadas dentro de las listas de estado estándar (Home, My Lists, librería).
- Mapped entries behave like normal status entries: progress, score, repeat and dates are preserved.
- / Las entradas mapeadas se comportan como entradas normales: progreso, nota, repeticiones y fechas se conservan.
- Configurable mapping per status (which custom lists feed which status list), with a UI available through Streamer Mode / `$ui`.
- / Mapeo configurable por estado (qué listas personalizadas alimentan qué lista de estado), con interfaz disponible en Streamer Mode / `$ui`.
- English (`en`) and Spanish (`es`) interface.
- / Interfaz en inglés (`en`) y español (`es`).

## Installation / Instalación

### From the marketplace / Desde el marketplace
Add the repository to Seanime (**Extensions → Marketplace → Change repository**) and install *Custom Lists to Status*:

Or install directly by URL (**Extensions → Add extensions**): paste the raw manifest URL

```text
https://raw.githubusercontent.com/AlwaysBorderRadius/custom-list-mapper/main/custom-list-mapper.json
```

### Manual (development) / Manual (desarrollo)
Copy the plugin folder into `$SEANIME_DATA_DIR/extensions/` and reload extensions, keeping `isDevelopment: true` in the manifest.

## Usage / Uso

1. In AniList, create your custom lists (e.g. "Viendo con doblaje", "Para la cuarentena", "Suite").
2. Open the plugin settings UI and assign each custom list to one of the six statuses.
3. The plugin injects the mapped entries into the target status list whenever Seanime builds the collection.
4. Entries are deduplicated: if an anime is already present in a status list, it is not added twice.

## Permissions / Permisos

- `anilist` — reads your AniList collection (raw + normalized) to merge custom list entries.
- `storage` — persists the mapping configuration.

No unsafe flags are used, so auto-updates stay enabled.

## Known issue / Problema conocido

Seanime versions up to **3.10.2-Saisei** can intermittently crash (`nil pointer dereference`) when building the library collection under concurrent requests with large injected collections. This is an upstream Seanime bug (see `collection_helper.go:31`, `collection.go:187`); it is recovered by Seanime and typically results in a temporary empty Home. Not caused by this plugin's data itself.

## Development

- `code.js` — plugin payload (JavaScript), v1.8.6.
- `custom-list-mapper.json` — release manifest (`isDevelopment: false`, payload served from this repo).

## License

MIT. / MIT.