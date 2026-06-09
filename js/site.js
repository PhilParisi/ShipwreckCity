/**
 * site.js — shared components injected into every page
 * (nav, footer) and utility helpers
 */

// Auto-detect subdirectory for GitHub Pages project repos vs local dev
const ROOT = location.hostname.includes('github.io') ? '/ShipwreckCity' : '';

function buildNav(activePage) {
  return `
  <nav class="site-nav" id="site-nav">
    <a href="${ROOT}/index.html" class="nav-logo">SHIPWRECK <span>CITY</span></a>
    <button class="nav-hamburger" aria-label="Toggle menu" onclick="this.closest('.site-nav').classList.toggle('nav-open')">
      <span></span><span></span><span></span>
    </button>
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
  <a href="https://buymeacoffee.com/shipwreckcity" target="_blank" rel="noopener" style="background:#0a1f2e;border-top:1px solid #1a4a6a;border-bottom:1px solid #1a4a6a;padding:14px 32px;display:flex;align-items:center;justify-content:center;gap:12px;text-decoration:none;transition:filter 0.2s;" onmouseover="this.style.filter='brightness(1.4)'" onmouseout="this.style.filter=''">
    <span class="footer-support-text" style="font-family:var(--font-serif);font-size:16px;color:#7fc4d8;line-height:1.5;text-align:center;">— Support The Shipwreck City Project —</span>
  </a>
  <footer class="site-footer">
    <div class="footer-logo">SHIPWRECK <span>CITY</span></div>
    <div class="footer-copy">© ${year} Shipwreck City · Seattle, WA, USA</div>
    <div class="footer-links">
      <a href="${ROOT}/index.html">Explore</a>
      <a href="${ROOT}/map.html">Map</a>
      <a href="${ROOT}/about.html">About</a>
      <a href="${ROOT}/support.html">Support</a>
      <a href="${ROOT}/press.html">Press</a>
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
  const satBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxZoom: 19
  });
  const satLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  });
  const satellite = L.layerGroup([satBase, satLabels]);
  return { dark, satellite };
}

// Apply brightness boost to dark tile pane; remove it for satellite
function applyTileFilter(map, layerName) {
  const pane = map.getPanes().tilePane;
  pane.style.filter = (layerName === 'Satellite') ? '' : 'brightness(2.8) contrast(2) grayscale(0.5)';
}

// Inline Dark / Satellite toggle control — replaces the stack-icon layer switcher
function addTileToggle(L, map, tiles, defaultLayer = 'Dark') {
  const TileToggle = L.Control.extend({
    onAdd() {
      const wrap = L.DomUtil.create('div', 'tile-toggle');
      L.DomEvent.disableClickPropagation(wrap);
      ['Dark', 'Satellite'].forEach(name => {
        const btn = L.DomUtil.create('button', 'tile-toggle-btn', wrap);
        btn.textContent = name;
        if (name === defaultLayer) btn.classList.add('active');
        L.DomEvent.on(btn, 'click', () => {
          if (name === 'Dark') { map.removeLayer(tiles.satellite); tiles.dark.addTo(map); }
          else                 { map.removeLayer(tiles.dark);      tiles.satellite.addTo(map); }
          applyTileFilter(map, name);
          wrap.querySelectorAll('.tile-toggle-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
      return wrap;
    }
  });
  new TileToggle({ position: 'topright' }).addTo(map);
}

// ── Credit toast ─────────────────────────────────────────────────────────────
(function () {
  const style = document.createElement('style');
  style.textContent = `
    #gallery-download-btn,
    #press-download-btn,
    #csv-download-btn { position: relative; }
    #gallery-download-btn::after,
    #press-download-btn::after,
    #csv-download-btn::after {
      content: 'Please credit ShipwreckCity.org';
      position: absolute; bottom: calc(100% + 8px); left: 50%;
      transform: translateX(-50%);
      background: #0a1f2e; border: 1px solid #4a9eba; color: #e8e0cc;
      font-family: var(--font-body); font-size: 11px; letter-spacing: 1.5px;
      text-transform: uppercase; padding: 8px 14px;
      white-space: nowrap; pointer-events: none;
      opacity: 0; transition: opacity 0.2s ease;
      z-index: 100;
    }
    #gallery-download-btn:hover::after,
    #press-download-btn:hover::after,
    #csv-download-btn:hover::after { opacity: 1; }
    #credit-toast {
      position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: #0a1f2e; border: 1px solid #4a9eba; color: #e8e0cc;
      font-family: var(--font-body); font-size: 13px; letter-spacing: 1.5px;
      text-transform: uppercase; padding: 14px 28px; z-index: 9999;
      opacity: 0; pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease;
      white-space: nowrap;
    }
    #credit-toast.show {
      opacity: 1; transform: translateX(-50%) translateY(0);
    }
  `;
  document.head.appendChild(style);

  const toast = document.createElement('div');
  toast.id = 'credit-toast';
  toast.textContent = 'Please credit ShipwreckCity.org when using these images';
  document.body.appendChild(toast);

  let hideTimer;
  function showCreditToast() {
    clearTimeout(hideTimer);
    toast.classList.add('show');
    hideTimer = setTimeout(() => toast.classList.remove('show'), 4000);
  }

  const DOWNLOAD_IDS = new Set(['gallery-download-btn', 'press-download-btn', 'csv-download-btn']);

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('button, a');
    if (btn && DOWNLOAD_IDS.has(btn.id)) showCreditToast();
  }, true);
})();

function makePopup(wreck) {
  return `
    <div class="popup-catalog">${wreck.catalog}</div>
    <div class="popup-name">${wreck.name}</div>
    <div class="popup-meta">${wreck.dimensions ? `Dimensions: ${wreck.dimensions}<br>` : ''}Depth: ${depthDisplay(wreck.depth)}</div>
    <div class="wreck-type-badge" style="margin:8px 0;">${wreck.type}</div>
    <a class="popup-link" href="${ROOT}/wrecks/${wreck.id}.html" target="_blank" rel="noopener">View record →</a>
  `;
}
