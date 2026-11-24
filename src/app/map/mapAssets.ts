// Where the map's libraries and default style come from. Kept apart from mapShared (which pulls in
// client components) so the /map page can name them all up front from the server (see page.tsx),
// and the loaders in mapShared fetch the very same files.

export const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
export const CLUSTER_CSS = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css";
export const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
export const CLUSTER_JS = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js";
export const MAPLIBRE_CSS = "https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css";
export const MAPLIBRE_JS = "https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js";
export const BRIDGE_JS = "https://unpkg.com/@maplibre/maplibre-gl-leaflet@0.1.4/leaflet-maplibre-gl.js";
/** The default map style, and the tile index it points at */
export const DARK_STYLE = "https://tiles.openfreemap.org/styles/dark";
export const PLANET_TILEJSON = "https://tiles.openfreemap.org/planet";
