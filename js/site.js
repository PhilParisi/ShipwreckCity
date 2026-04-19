/**
 * site.js — shared components injected into every page
 * (nav, footer) and utility helpers
 */

function buildNav(activePage) {
  return `
  <nav class="site-nav">
    <a href="/index.html" class="nav-logo">SHIPWRECK<span>CITY</span></a>
    <div class="nav-links">
      <a href="/index.html"  class="${activePage === 'home'   ? 'active' : ''}">Explore</a>
      <a href="/map.html"    class="${activePage === 'map'    ? 'active' : ''}">Map</a>
      <a href="/archive.html"class="${activePage === 'archive'? 'active' : ''}">Archive</a>
      <a href="/support.html" class="${activePage === 'support' ? 'active' : ''}">Support</a>
      <a href="/about.html"  class="${activePage === 'about'  ? 'active' : ''}">About</a>
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
      <a href="/index.html">Explore</a>
      <a href="/map.html">Map</a>
      <a href="/about.html">About</a>
      <a href="/support.html">Support</a>
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
    html: `<div style="
      width:12px;height:12px;
      background:${color};
      border:2px solid #07111a;
      border-radius:50%;
      box-shadow:0 0 0 3px ${color}44;
      cursor:pointer;
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
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
    <a class="popup-link" href="/wrecks/${wreck.id}.html">View record →</a>
  `;
}
