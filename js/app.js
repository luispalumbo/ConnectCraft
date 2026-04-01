/**
 * app.js — Main application entry point for ConnectCraft
 *
 * Wires together CanvasManager, Simulation, and the DOM.
 * Handles:
 *   • Tool selection (select / connect / delete)
 *   • Cable type selection (ethernet / wireless)
 *   • Drag-and-drop from the split device palette onto the canvas
 *   • Device interaction (click, double-click, drag to move)
 *   • Connection SVG click (select or delete)
 *   • Simulation (BFS packet send)
 *   • Rename modal
 *   • Log panel
 *   • Import / Export (JSON)
 */

/* global DEVICE_TYPES, CanvasManager, Simulation */

// ════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════

let currentTool      = 'select';   // 'select' | 'connect' | 'delete' | 'simulate'
let currentCableType = 'ethernet'; // 'ethernet' | 'wireless'
let connectSource    = null;       // device id awaiting second click in connect mode
let simulateSource   = null;       // device id awaiting second click in simulate mode
let dragState        = null;       // { deviceId, offsetX, offsetY }
let renameTarget     = null;       // device object being renamed
let simRunning       = false;      // guard against overlapping simulations

// ════════════════════════════════════════════════════
//  DOM REFS
// ════════════════════════════════════════════════════

const canvasWrap    = document.getElementById('canvas-wrap');
const canvasEl      = document.getElementById('canvas');
const svgEl         = document.getElementById('svg-layer');
const packetLayer   = document.getElementById('packet-layer');
const statusText    = document.getElementById('status-text');
const counterText   = document.getElementById('counter-text');
const simSrc        = document.getElementById('sim-src');
const simDst        = document.getElementById('sim-dst');
const logBody       = document.getElementById('log-body');
const emptyHint     = document.getElementById('empty-hint');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalInput    = document.getElementById('modal-input');
const importInput   = document.getElementById('import-file-input');

// ════════════════════════════════════════════════════
//  INITIALISE MODULES
// ════════════════════════════════════════════════════

CanvasManager.init(canvasEl, svgEl, onStateChange);
Simulation.init(packetLayer);

// ════════════════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════════════════

buildDevicePalette();
bindToolButtons();
bindCableTypeButtons();
bindCanvasEvents();
bindGlobalDrag();
bindSimButtons();
bindModalControls();
bindLogControls();
bindClearCanvas();
bindImportExport();
bindThemeToggle();

log('Welcome to ConnectCraft! Drag a device from the sidebar to get started.', 'info');

// ════════════════════════════════════════════════════
//  DEVICE PALETTE — split into End / Network sections
// ════════════════════════════════════════════════════

/**
 * Build two palette grids: one for End Devices, one for Network Devices.
 * Reads the `category` field on each DEVICE_TYPES entry.
 * Uses Cisco-style SVG icons (stored in def.svg).
 */
function buildDevicePalette() {
  const endGrid     = document.getElementById('palette-end');
  const networkGrid = document.getElementById('palette-network');

  Object.entries(DEVICE_TYPES).forEach(([type, def]) => {
    const grid = def.category === 'network' ? networkGrid : endGrid;

    const item = document.createElement('div');
    item.className    = 'palette-item';
    item.draggable    = true;
    item.dataset.type = type;
    item.title        = def.description;
    // Pass colour so the SVG currentColor and hover tint both work
    item.style.setProperty('--device-color', def.color);

    item.innerHTML = `
      <svg class="palette-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"
           aria-hidden="true">${def.svg}</svg>
      <span>${def.label}</span>
    `;

    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('deviceType', type);
      e.dataTransfer.effectAllowed = 'copy';
    });

    grid.appendChild(item);
  });
}

// ════════════════════════════════════════════════════
//  TOOL SELECTION
// ════════════════════════════════════════════════════

function bindToolButtons() {
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => setTool(btn.dataset.tool));
  });
}

function setTool(tool) {
  currentTool    = tool;
  connectSource  = null;
  simulateSource = null;
  CanvasManager.clearHighlights();

  document.querySelectorAll('.tool-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tool === tool);
  });

  document.body.className = `tool-${tool}`;

  const hints = {
    select:   'Select tool — drag devices to reposition them. Double-click to rename.',
    connect:  'Connect tool — click a device to start a cable, then click another to finish.',
    delete:   'Delete tool — click any device or cable to remove it.',
    simulate: 'Simulate tool — click any two connected devices to send a packet between them!'
  };
  setStatus(hints[tool] || '');
}

// ════════════════════════════════════════════════════
//  CABLE TYPE SELECTION
// ════════════════════════════════════════════════════

function bindCableTypeButtons() {
  document.querySelectorAll('.cable-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCableType = btn.dataset.cable;
      document.querySelectorAll('.cable-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.cable === currentCableType);
      });
      const label = currentCableType === 'wireless' ? 'Wireless (dashed)' : 'Ethernet (solid)';
      log(`Cable type set to: ${label}`, 'step');
    });
  });
}

// ════════════════════════════════════════════════════
//  CANVAS — drop + click events
// ════════════════════════════════════════════════════

function bindCanvasEvents() {

  // ── Drop: create a device at the drop position ──
  canvasWrap.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  canvasWrap.addEventListener('drop', e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('deviceType');
    if (!type || !DEVICE_TYPES[type]) return;

    const rect   = canvasWrap.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;
    const device = CanvasManager.addDevice(type, x, y);
    attachDeviceListeners(device);

    log(`Added ${DEVICE_TYPES[type].label}: ${device.name}`, 'info');
    setStatus(`Placed ${device.name}. Switch to the Connect tool to cable devices together.`);
  });

  // ── Click SVG hit-area lines — delete or select a cable ──
  // .connection-hit lines have pointer-events:stroke (18px hit zone).
  // #canvas has pointer-events:none so clicks pass through to the SVG layer.
  svgEl.addEventListener('click', e => {
    const hit = e.target.closest('.connection-hit');
    if (!hit) return;

    const connId = hit.dataset.id;

    if (currentTool === 'delete') {
      const conn = CanvasManager.getConnection(connId);
      if (conn) {
        const srcName   = CanvasManager.getDevice(conn.src)?.name ?? '?';
        const dstName   = CanvasManager.getDevice(conn.dst)?.name ?? '?';
        const typeLabel = conn.cableType === 'wireless' ? 'wireless' : 'ethernet';
        log(`Removed ${typeLabel} cable: ${srcName} ↔ ${dstName}`, 'step');
      }
      CanvasManager.removeConnection(connId);
      return;
    }

    if (currentTool === 'select') {
      CanvasManager.clearHighlights();
      const vizLine = svgEl.querySelector(`.connection-line[data-id="${connId}"]`);
      if (vizLine) vizLine.classList.add('selected');
    }
  });

  // ── Click empty canvas area — deselect everything ──
  // Listen on canvasWrap (parent); filter out clicks that came from
  // devices, cables, or other interactive elements.
  canvasWrap.addEventListener('click', e => {
    if (e.target.closest('.device, .connection-hit, .packet')) return;
    if (e.target.closest('#sidebar')) return;
    connectSource  = null;
    simulateSource = null;
    CanvasManager.clearHighlights();
  });
}

// ════════════════════════════════════════════════════
//  GLOBAL MOUSE DRAG — moves devices in select mode
// ════════════════════════════════════════════════════

function bindGlobalDrag() {
  document.addEventListener('mousemove', e => {
    if (!dragState || currentTool !== 'select') return;

    const rect   = canvasWrap.getBoundingClientRect();
    const margin = 36;
    const x = Math.max(margin, Math.min(rect.width  - margin, e.clientX - rect.left - dragState.offsetX));
    const y = Math.max(margin, Math.min(rect.height - margin, e.clientY - rect.top  - dragState.offsetY));

    CanvasManager.moveDevice(dragState.deviceId, x, y);
  });

  document.addEventListener('mouseup', () => {
    if (dragState) {
      const d = CanvasManager.getDevice(dragState.deviceId);
      if (d) d.el.style.zIndex = '';
      document.body.style.cursor = '';
      dragState = null;
    }
  });
}

// ════════════════════════════════════════════════════
//  DEVICE INTERACTION
// ════════════════════════════════════════════════════

/**
 * Attach all event listeners to a device element.
 * Called once per device when it is added to the canvas
 * (both via drag-drop and via import).
 * @param {Object} device
 */
function attachDeviceListeners(device) {
  const { el } = device;

  // Single click
  el.addEventListener('click', e => {
    e.stopPropagation();
    handleDeviceClick(device);
  });

  // Double-click — open rename modal
  el.addEventListener('dblclick', e => {
    e.stopPropagation();
    openRenameModal(device);
  });

  // Mouse down — begin drag (select tool only)
  el.addEventListener('mousedown', e => {
    if (currentTool !== 'select') return;
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    const rect = canvasWrap.getBoundingClientRect();
    dragState = {
      deviceId: device.id,
      offsetX:  e.clientX - rect.left - device.x,
      offsetY:  e.clientY - rect.top  - device.y
    };

    el.style.zIndex        = 20;
    document.body.style.cursor = 'grabbing';
  });
}

/** Handle a click on a device based on the active tool. */
function handleDeviceClick(device) {

  // ── Delete ────────────────────────────────────
  if (currentTool === 'delete') {
    const connCount = CanvasManager.getConnections()
      .filter(c => c.src === device.id || c.dst === device.id).length;
    CanvasManager.removeDevice(device.id);
    const cMsg = connCount > 0 ? ` and ${connCount} cable${connCount > 1 ? 's' : ''}` : '';
    log(`Removed device: ${device.name}${cMsg}`, 'step');
    setStatus(`Deleted ${device.name}${cMsg}.`);
    return;
  }

  // ── Connect ───────────────────────────────────
  if (currentTool === 'connect') {
    if (!connectSource) {
      connectSource = device.id;
      CanvasManager.setConnectingSource(device.id);
      setStatus(`Connecting from ${device.name} — click the destination device.`);
    } else if (connectSource === device.id) {
      connectSource = null;
      CanvasManager.clearHighlights();
      setStatus('Connection cancelled. Click a device to start again.');
    } else {
      const srcDevice = CanvasManager.getDevice(connectSource);
      const conn      = CanvasManager.addConnection(connectSource, device.id, currentCableType);
      if (conn) {
        const typeLabel = currentCableType === 'wireless' ? '📶 wireless' : '🔌 ethernet';
        log(`Connected (${typeLabel}): ${srcDevice.name} ↔ ${device.name}`, 'info');
        setStatus(`${currentCableType === 'wireless' ? 'Wireless link' : 'Cable'} added: ${srcDevice.name} ↔ ${device.name}`);
      } else {
        log(`Already connected: ${srcDevice.name} ↔ ${device.name}`, 'warn');
        setStatus('Those devices are already connected!');
      }
      connectSource = null;
      CanvasManager.clearHighlights();
    }
    return;
  }

  // ── Simulate ──────────────────────────────────
  if (currentTool === 'simulate') {
    if (!simulateSource) {
      // First click — pick source
      simulateSource = device.id;
      CanvasManager.setConnectingSource(device.id);
      setStatus(`Sending from ${device.name} — now click the destination device.`);
    } else if (simulateSource === device.id) {
      // Clicked same device — cancel
      simulateSource = null;
      CanvasManager.clearHighlights();
      setStatus('Simulation cancelled. Click a device to choose a new source.');
    } else {
      // Second click — run simulation
      const srcId = simulateSource;
      simulateSource = null;
      CanvasManager.clearHighlights();
      _runSimulationBetween(srcId, device.id);
    }
    return;
  }

  // ── Select ────────────────────────────────────
  CanvasManager.selectDevice(device.id);
}

// ════════════════════════════════════════════════════
//  RENAME MODAL
// ════════════════════════════════════════════════════

function openRenameModal(device) {
  renameTarget     = device;
  modalInput.value = device.name;
  modalBackdrop.classList.remove('hidden');
  modalInput.focus();
  modalInput.select();
}

function bindModalControls() {
  document.getElementById('modal-ok').addEventListener('click', confirmRename);

  document.getElementById('modal-cancel').addEventListener('click', () => {
    modalBackdrop.classList.add('hidden');
    renameTarget = null;
  });

  modalInput.addEventListener('keydown', e => {
    if (e.key === 'Enter')  confirmRename();
    if (e.key === 'Escape') {
      modalBackdrop.classList.add('hidden');
      renameTarget = null;
    }
  });

  modalBackdrop.addEventListener('click', e => {
    if (e.target === modalBackdrop) {
      modalBackdrop.classList.add('hidden');
      renameTarget = null;
    }
  });
}

function confirmRename() {
  if (!renameTarget) return;
  const newName = modalInput.value.trim();
  if (newName) {
    CanvasManager.renameDevice(renameTarget.id, newName);
    log(`Renamed "${renameTarget.name}" → "${newName}"`, 'step');
  }
  modalBackdrop.classList.add('hidden');
  renameTarget = null;
}

// ════════════════════════════════════════════════════
//  SIMULATION
// ════════════════════════════════════════════════════

function bindSimButtons() {
  document.getElementById('btn-simulate').addEventListener('click', () => {
    const srcId = simSrc.value;
    const dstId = simDst.value;
    if (!srcId || !dstId) { log('Please select both a source and destination device.', 'error'); return; }
    if (srcId === dstId)  { log('Source and destination must be different devices.', 'error'); return; }
    _runSimulationBetween(srcId, dstId);
  });

  document.getElementById('btn-clear-sim').addEventListener('click', () => {
    CanvasManager.clearHighlights();
    log('Highlights cleared.', 'step');
  });
}

/**
 * Core simulation routine — called by both the dropdown button and the Simulate tool.
 * Finds the shortest path using BFS, highlights it, and animates a packet.
 * Uses plain language suitable for Year 7–8 students.
 *
 * @param {string} srcId  - source device id
 * @param {string} dstId  - destination device id
 */
async function _runSimulationBetween(srcId, dstId) {
  if (simRunning) {
    log('A packet is already travelling — please wait for it to arrive!', 'warn');
    return;
  }

  const src = CanvasManager.getDevice(srcId);
  const dst = CanvasManager.getDevice(dstId);

  log('──────────────────────────────', 'step');
  log(`📦 Sending packet: ${src.name} → ${dst.name}`, 'info');

  const result = Simulation.findPath(srcId, dstId);

  if (!result) {
    log(`❌ No path found! ${src.name} and ${dst.name} are not connected.`, 'error');
    setStatus(`Can't reach ${dst.name} from ${src.name} — check your cables!`);
    return;
  }

  const { devicePath, connPath } = result;
  const names = devicePath.map(id => CanvasManager.getDevice(id)?.name ?? id);
  const hops  = devicePath.length - 1;

  // Simple, student-friendly log output
  log(`🗺️  Path found! ${hops} hop${hops !== 1 ? 's' : ''}: ${names.join(' → ')}`, 'success');
  names.forEach((name, i) => {
    if (i === 0)                      log(`  ▶ Leaving  ${name}`, 'step');
    else if (i === names.length - 1)  log(`  ✓ Arrived at ${name}`, 'step');
    else                              log(`  ↪ Through  ${name}`, 'step');
  });

  // Highlight path on canvas
  CanvasManager.clearHighlights();
  CanvasManager.highlightPath(devicePath, connPath);

  // Animate packet
  simRunning = true;
  document.getElementById('btn-simulate').disabled = true;
  try {
    await Simulation.animatePacket(devicePath);
    log(`✅ Packet delivered to ${dst.name}!`, 'success');
    setStatus(`✅ Delivered to ${dst.name} in ${hops} hop${hops !== 1 ? 's' : ''}!`);
  } finally {
    simRunning = false;
    document.getElementById('btn-simulate').disabled = false;
  }
}

// ════════════════════════════════════════════════════
//  IMPORT / EXPORT
// ════════════════════════════════════════════════════

function bindImportExport() {

  // ── Export ────────────────────────────────────
  document.getElementById('btn-export').addEventListener('click', () => {
    const data     = CanvasManager.exportData();
    const devices  = data.devices.length;
    const conns    = data.connections.length;

    if (devices === 0) {
      log('Nothing to export — add some devices first.', 'warn');
      return;
    }

    const json     = JSON.stringify(data, null, 2);
    const blob     = new Blob([json], { type: 'application/json' });
    const url      = URL.createObjectURL(blob);
    const filename = `connectcraft-${_dateStamp()}.json`;

    const a = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    log(`Exported: ${devices} device${devices !== 1 ? 's' : ''}, ${conns} connection${conns !== 1 ? 's' : ''} → ${filename}`, 'success');
  });

  // ── Import — open file picker ─────────────────
  document.getElementById('btn-import').addEventListener('click', () => {
    importInput.value = ''; // reset so same file can be re-imported
    importInput.click();
  });

  importInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result);
        _applyImport(data);
      } catch (err) {
        log(`Import failed: invalid JSON — ${err.message}`, 'error');
        setStatus('Import failed. Please check the file is a valid ConnectCraft JSON export.');
      }
    };
    reader.readAsText(file);
  });
}

/**
 * Validate and apply imported JSON data.
 * @param {Object} data
 */
function _applyImport(data) {
  // Basic validation
  if (!data || typeof data !== 'object') {
    log('Import failed: file does not contain a valid project.', 'error');
    return;
  }
  if (!Array.isArray(data.devices)) {
    log('Import failed: missing "devices" array.', 'error');
    return;
  }

  const devices = CanvasManager.importData(data);

  // Attach event listeners to every restored device
  devices.forEach(d => attachDeviceListeners(d));

  const d = devices.length;
  const c = (data.connections || []).length;
  log('──────────────────────────────', 'step');
  log(`Imported: ${d} device${d !== 1 ? 's' : ''}, ${c} connection${c !== 1 ? 's' : ''}`, 'success');
  setStatus(`Loaded project: ${d} device${d !== 1 ? 's' : ''} and ${c} connection${c !== 1 ? 's' : ''}.`);

  connectSource = null;
  dragState     = null;
}

/** Generate a YYYYMMDD-HHMM timestamp for export filenames. */
function _dateStamp() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
    + `-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

// ════════════════════════════════════════════════════
//  STATE CHANGE CALLBACK
// ════════════════════════════════════════════════════

/** Called by CanvasManager whenever devices / connections change. */
function onStateChange() {
  updateCounter();
  updateSimSelects();
  updateEmptyHint();
}

function updateCounter() {
  const d = CanvasManager.getDevices().length;
  const c = CanvasManager.getConnections().length;
  counterText.textContent = `${d} device${d !== 1 ? 's' : ''} · ${c} connection${c !== 1 ? 's' : ''}`;
}

function updateSimSelects() {
  const devices = CanvasManager.getDevices();
  const prevSrc = simSrc.value;
  const prevDst = simDst.value;

  [simSrc, simDst].forEach(sel => {
    sel.innerHTML = '<option value="">— select —</option>';
    devices.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.text  = `${DEVICE_TYPES[d.type].icon} ${d.name}`;
      sel.appendChild(opt);
    });
  });

  if (devices.find(d => d.id === prevSrc)) simSrc.value = prevSrc;
  if (devices.find(d => d.id === prevDst)) simDst.value = prevDst;
}

function updateEmptyHint() {
  emptyHint.classList.toggle('hidden', CanvasManager.getDevices().length > 0);
}

// ════════════════════════════════════════════════════
//  LOG PANEL
// ════════════════════════════════════════════════════

let _logStart = Date.now();

/**
 * Add a timestamped entry to the log panel.
 * @param {string} msg
 * @param {'info'|'success'|'warn'|'error'|'step'} type
 */
function log(msg, type = 'step') {
  const elapsed = ((Date.now() - _logStart) / 1000).toFixed(1);
  const entry   = document.createElement('div');
  entry.className   = `log-entry log-${type}`;
  entry.innerHTML   = `
    <span class="log-time">[${elapsed}s]</span>
    <span class="log-msg">${msg}</span>
  `;
  logBody.appendChild(entry);
  logBody.scrollTop = logBody.scrollHeight;
}

function bindLogControls() {
  document.getElementById('btn-clear-log').addEventListener('click', () => {
    logBody.innerHTML = '';
    _logStart = Date.now();
  });
}

// ════════════════════════════════════════════════════
//  CLEAR CANVAS
// ════════════════════════════════════════════════════

function bindClearCanvas() {
  document.getElementById('btn-clear-canvas').addEventListener('click', () => {
    const d = CanvasManager.getDevices().length;
    if (d === 0) return;
    if (!confirm(`Remove all ${d} device${d !== 1 ? 's' : ''} and their connections?`)) return;
    CanvasManager.clearAll();
    connectSource = null;
    dragState     = null;
    log('Canvas cleared.', 'info');
    setStatus('Canvas cleared. Drag a device to start a new network!');
  });
}

// ════════════════════════════════════════════════════
//  THEME TOGGLE (light / dark)
// ════════════════════════════════════════════════════

function bindThemeToggle() {
  const btn  = document.getElementById('btn-theme');
  const html = document.documentElement;

  function applyTheme(theme) {
    html.dataset.theme    = theme;
    btn.textContent       = theme === 'light' ? '🌙' : '☀️';
    btn.title             = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  }

  // Restore saved preference, defaulting to dark
  const saved = localStorage.getItem('cc-theme') || 'dark';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const next = html.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('cc-theme', next);
    log(`Switched to ${next} mode.`, 'step');
  });
}



function setStatus(msg) {
  statusText.textContent = msg;
}
