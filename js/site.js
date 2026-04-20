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
    documented:   'Documented',
    unidentified: 'Unidentified',
    partial:      'Partial'
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
    documented:   '#5a8a6a',
    unidentified: '#8a6a3a',
    partial:      '#2a6080'
  }[wreck.status] || '#4a9eba';

  const icon = L.divIcon({
    className: '',
    html: `<div class="wreck-marker" style="--mc:${color}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10]
  });
  return icon;
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
