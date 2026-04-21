/**
 * site.js — shared components injected into every page
 * (nav, footer) and utility helpers
 */

// Auto-detect subdirectory for GitHub Pages project repos vs local dev
const ROOT = location.hostname.includes('github.io') ? '/ShipwreckCity' : '';

function buildNav(activePage) {
  return `
  <nav class="site-nav">
    <a href="${ROOT}/index.html" class="nav-logo">SHIPWRECK<span>CITY</span></a>
    <div class="nav-links">
      <a href="${ROOT}/index.html"  class="${activePage === 'home'   ? 'active' : ''}">Explore</a>
      <a href="${ROOT}/map.html"    class="${activePage === 'map'    ? 'active' : ''}">Map</a>
      <a href="${ROOT}/archive.html"class="${activePage === 'archive'? 'active' : ''}">Archive</a>
      <a href="${ROOT}/support.html" class="${activePage === 'support' ? 'active' : ''}">Support</a>
      <a href="${ROOT}/about.html"  class="${activePage === 'about'  ? 'active' : ''}">About</a>
    </div>
  </nav>`;
}

function buildFooter() {
  const year = new Date().getFullYear();
  return `
  <footer class="site-footer">
    <div class="footer-logo">SHIPWRECK<span>CITY</span></div>
    <div class="footer-copy">© ${year} Shipwreck City · Lake Union, Seattle</div>
    <div class="footer-links">
      <a href="${ROOT}/index.html">Explore</a>
      <a href="${ROOT}/map.html">Map</a>
      <a href="${ROOT}/about.html">About</a>
      <a href="${ROOT}/support.html">Support</a>
    </div>
  </footer>`;
}

function statusLabel(status) {
  const labels = {
    'recently-explored':  'Recently Explored',
    'previously-explored':'Previously Explored',
    'never-explored':     'Never Explored',
  };
  return labels[status] || status;
}

function depthDisplay(depth) {
  return depth ? `${depth} ft` : '—';
}

function yearDisplay(w) {
  if (!w.year && w.yearNote) return w.yearNote;
  if (w.year && w.yearNote) return `${w.yearNote} ${w.year}`;
  if (w.year) return String(w.year);
  return 'Unknown';
}

function coordDisplay(coords) {
  if (!coords) return '—';
  const lat  = coords[0].toFixed(4);
  const lng  = coords[1].toFixed(4);
  const latD = coords[0] >= 0 ? 'N' : 'S';
  const lngD = coords[1] >= 0 ? 'E' : 'W';
  return `${Math.abs(lat)}° ${latD}<br>${Math.abs(lng)}° ${lngD}`;
}

// Custom Leaflet marker
function makeMarker(L, wreck) {
  const color = {
    'recently-explored':  '#4a9eba',   // blue
    'previously-explored':'#5a8a6a',   // green
    'never-explored':     '#c87941',   // orange
  }[wreck.status] || '#4a6070';

  const icon = L.divIcon({
    className: '',
    html: `<div class="wreck-marker" style="--mc:${color}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10]
  });
  return icon;
}

// Tile layers — call once per map, pass both to L.control.layers()
function makeTileLayers(L) {
  const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  });
  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri &mdash; Esri, USDA, USGS, GeoEye, Aerogrid, IGN, IGP and the GIS User Community',
    maxZoom: 19
  });
  return { dark, satellite };
}

// Apply brightness boost to dark tile pane; remove it for satellite
function applyTileFilter(map, layerName) {
  const pane = map.getPanes().tilePane;
  pane.style.filter = (layerName === 'Satellite') ? '' : 'brightness(1.6) contrast(1.1)';
}

function makePopup(wreck) {
  const yr = yearDisplay(wreck);
  return `
    <div class="popup-name">${wreck.name}</div>
    <div class="popup-meta">${wreck.catalog} · ${wreck.type} · ${yr}</div>
    <div class="popup-meta">${wreck.location}</div>
    <a class="popup-link" href="${ROOT}/wrecks/${wreck.id}.html">View record →</a>
  `;
}
