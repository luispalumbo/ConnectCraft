/**
 * canvas.js — CanvasManager for ConnectCraft
 *
 * Manages:
 *   • The list of devices placed on the canvas
 *   • The list of connections (cables) between devices
 *   • Rendering device elements and SVG connection lines
 *   • Moving devices and updating line endpoints
 *   • Highlight / selection states
 *   • Cable types: 'ethernet' (solid) vs 'wireless' (dashed)
 *   • Import / Export (JSON serialisation)
 *
 * All persistent state lives here.
 * app.js wires up user interaction on top.
 */

/* global DEVICE_TYPES, CanvasManager */

const CanvasManager = (() => {

  // ── Private state ────────────────────────────────
  let _devices      = [];   // Array of device objects
  let _connections  = [];   // Array of connection objects
  let _nextId       = 1;    // Auto-increment ID counter
  const _typeCounts = {};   // { pc: 2, switch: 1, … } — for default naming

  // DOM elements (set by init)
  let _canvasEl = null;
  let _svgEl    = null;

  // Callback fired whenever state changes (used to update UI)
  let _onChange = null;

  // ── Init ─────────────────────────────────────────
  /**
   * Must be called once before using CanvasManager.
   * @param {HTMLElement} canvasEl  - the #canvas div
   * @param {SVGElement}  svgEl    - the #svg-layer element
   * @param {Function}    onChange - called after any state change
   */
  function init(canvasEl, svgEl, onChange) {
    _canvasEl = canvasEl;
    _svgEl    = svgEl;
    _onChange = onChange;
  }

  // ── Device management ────────────────────────────

  /**
   * Create and place a device on the canvas (auto-generates id and name).
   * @param {string} type - key from DEVICE_TYPES
   * @param {number} x    - centre X position in px
   * @param {number} y    - centre Y position in px
   * @returns {Object} device
   */
  function addDevice(type, x, y) {
    const def = DEVICE_TYPES[type];
    _typeCounts[type] = (_typeCounts[type] || 0) + 1;
    const name = `${def.prefix}${_typeCounts[type]}`;
    const id   = `d${_nextId++}`;
    return _createDevice(id, type, name, x, y);
  }

  /**
   * Internal: create a device with a specific id and name.
   * Used by addDevice (new) and importData (restore).
   */
  function _createDevice(id, type, name, x, y) {
    const def = DEVICE_TYPES[type];
    const el  = _buildDeviceEl(id, type, name, def);
    el.style.left = `${x}px`;
    el.style.top  = `${y}px`;
    _canvasEl.appendChild(el);

    const device = { id, type, name, x, y, el };
    _devices.push(device);
    return device;
  }

  /** Build the DOM element for a device. */
  function _buildDeviceEl(id, type, name, def) {
    const el = document.createElement('div');
    el.className    = 'device';
    el.dataset.id   = id;
    el.dataset.type = type;
    el.title        = def.description; // tooltip for students

    // --device-color  → SVG stroke via currentColor, border, palette tint
    // --device-bg     → card background in dark mode
    // --device-border → border-color at ~40% opacity for dark mode (hex alpha 66)
    el.innerHTML = `
      <div class="device-card"
           style="--device-color:${def.color}; --device-bg:${def.bg}; --device-border:${def.color}66;">
        <svg class="device-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"
             aria-hidden="true">${def.svg}</svg>
      </div>
      <div class="device-label">${_escapeHtml(name)}</div>
    `;
    return el;
  }

  /**
   * Remove a device and all its connected cables from the canvas.
   * @param {string} id
   */
  function removeDevice(id) {
    // Collect connection ids first (don't mutate array while filtering)
    const connIds = _connections
      .filter(c => c.src === id || c.dst === id)
      .map(c => c.id);

    connIds.forEach(cid => _removeConnectionById(cid));

    const device = getDevice(id);
    if (device) {
      device.el.remove();
      _devices = _devices.filter(d => d.id !== id);
    }
    _notify();
  }

  /**
   * Rename a device.
   * @param {string} id
   * @param {string} name
   */
  function renameDevice(id, name) {
    const device = getDevice(id);
    if (!device) return;
    device.name = name;
    const labelEl = device.el.querySelector('.device-label');
    if (labelEl) labelEl.textContent = name;
    _notify();
  }

  /**
   * Move a device to a new position (updates element and connected lines).
   * @param {string} id
   * @param {number} x
   * @param {number} y
   */
  function moveDevice(id, x, y) {
    const device = getDevice(id);
    if (!device) return;
    device.x = x;
    device.y = y;
    device.el.style.left = `${x}px`;
    device.el.style.top  = `${y}px`;
    _updateLinesForDevice(id);
  }

  /** @returns {Object|undefined} */
  function getDevice(id) {
    return _devices.find(d => d.id === id);
  }

  /** @returns {Object[]} */
  function getDevices() {
    return _devices;
  }

  // ── Connection management ────────────────────────

  /**
   * Add a cable between two devices.
   * Ignores duplicate connections (same pair regardless of direction).
   *
   * @param {string} srcId
   * @param {string} dstId
   * @param {'ethernet'|'wireless'} cableType - visual style of the cable
   * @returns {Object|null} connection, or null if duplicate
   */
  function addConnection(srcId, dstId, cableType = 'ethernet') {
    const duplicate = _connections.some(c =>
      (c.src === srcId && c.dst === dstId) ||
      (c.src === dstId && c.dst === srcId)
    );
    if (duplicate) return null;

    const id   = `c${_nextId++}`;
    const line = _buildSvgLine(id, cableType);
    _svgEl.appendChild(line);

    const conn = { id, src: srcId, dst: dstId, cableType, el: line };
    _connections.push(conn);
    _updateLine(conn);
    _notify();
    return conn;
  }

  /**
   * Internal: create a connection with a specific id (used by importData).
   */
  function _createConnection(id, srcId, dstId, cableType = 'ethernet') {
    const line = _buildSvgLine(id, cableType);
    _svgEl.appendChild(line);
    const conn = { id, src: srcId, dst: dstId, cableType, el: line };
    _connections.push(conn);
    _updateLine(conn);
    return conn;
  }

  /**
   * Build an SVG <line> element for a connection.
   * Ethernet = solid, Wireless = dashed with a different colour class.
   */
  function _buildSvgLine(id, cableType) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.classList.add('connection-line');
    if (cableType === 'wireless') {
      line.classList.add('wireless');
    }
    line.dataset.id         = id;
    line.dataset.cableType  = cableType;
    return line;
  }

  /**
   * Remove a connection by id.
   * @param {string} id
   */
  function removeConnection(id) {
    _removeConnectionById(id);
    _notify();
  }

  function _removeConnectionById(id) {
    const conn = _connections.find(c => c.id === id);
    if (conn) {
      conn.el.remove();
      _connections = _connections.filter(c => c.id !== id);
    }
  }

  /** @returns {Object|undefined} */
  function getConnection(id) {
    return _connections.find(c => c.id === id);
  }

  /** @returns {Object[]} */
  function getConnections() {
    return _connections;
  }

  // ── SVG line update helpers ──────────────────────

  /** Reposition a single SVG line to match its device centres. */
  function _updateLine(conn) {
    const src = getDevice(conn.src);
    const dst = getDevice(conn.dst);
    if (!src || !dst) return;
    conn.el.setAttribute('x1', src.x);
    conn.el.setAttribute('y1', src.y);
    conn.el.setAttribute('x2', dst.x);
    conn.el.setAttribute('y2', dst.y);
  }

  /** Update all lines connected to a given device (called when it moves). */
  function _updateLinesForDevice(deviceId) {
    _connections
      .filter(c => c.src === deviceId || c.dst === deviceId)
      .forEach(_updateLine);
  }

  /** Redraw every line (useful after bulk changes). */
  function updateAllLines() {
    _connections.forEach(_updateLine);
  }

  // ── Highlight / selection ────────────────────────

  /** Remove all highlight / selected / connecting-source classes. */
  function clearHighlights() {
    _devices.forEach(d => {
      d.el.classList.remove('selected', 'highlighted', 'connecting-source');
    });
    _connections.forEach(c => {
      c.el.classList.remove('highlighted', 'selected');
    });
  }

  /**
   * Highlight a set of devices and connections (packet path).
   * @param {string[]} deviceIds
   * @param {string[]} connIds
   */
  function highlightPath(deviceIds, connIds) {
    deviceIds.forEach(id => {
      const d = getDevice(id);
      if (d) d.el.classList.add('highlighted');
    });
    connIds.forEach(id => {
      const c = getConnection(id);
      if (c) c.el.classList.add('highlighted');
    });
  }

  /**
   * Mark a device as the connecting source (pulsing gold ring).
   * @param {string} id
   */
  function setConnectingSource(id) {
    clearHighlights();
    const d = getDevice(id);
    if (d) d.el.classList.add('connecting-source');
  }

  /**
   * Mark a single device as selected (cyan ring).
   * @param {string} id
   */
  function selectDevice(id) {
    clearHighlights();
    const d = getDevice(id);
    if (d) d.el.classList.add('selected');
  }

  // ── Clear all ────────────────────────────────────

  /** Remove every device and connection from the canvas. */
  function clearAll() {
    _devices.forEach(d => d.el.remove());
    _connections.forEach(c => c.el.remove());
    _devices     = [];
    _connections = [];
    Object.keys(_typeCounts).forEach(k => delete _typeCounts[k]);
    _nextId = 1;
    _notify();
  }

  // ── Import / Export ──────────────────────────────

  /**
   * Serialise the current canvas to a plain JSON-safe object.
   * DOM elements (el) are excluded — only data is exported.
   *
   * @returns {{ version: number, devices: Object[], connections: Object[] }}
   */
  function exportData() {
    return {
      version: 1,
      devices: _devices.map(d => ({
        id:   d.id,
        type: d.type,
        name: d.name,
        x:    Math.round(d.x),
        y:    Math.round(d.y)
      })),
      connections: _connections.map(c => ({
        id:        c.id,
        src:       c.src,
        dst:       c.dst,
        cableType: c.cableType || 'ethernet'
      }))
    };
  }

  /**
   * Restore a canvas from a previously exported data object.
   * Clears the canvas first, then recreates all devices and connections.
   * Returns the array of created device objects so app.js can attach listeners.
   *
   * @param {{ version: number, devices: Object[], connections: Object[] }} data
   * @returns {Object[]} newly created device objects
   */
  function importData(data) {
    clearAll();

    const createdDevices = [];

    // Restore devices with their original ids and names
    (data.devices || []).forEach(d => {
      if (!DEVICE_TYPES[d.type]) return; // Skip unknown types
      const device = _createDevice(d.id, d.type, d.name, d.x, d.y);
      // Update type counts so future auto-names don't clash
      _typeCounts[d.type] = (_typeCounts[d.type] || 0) + 1;
      createdDevices.push(device);
    });

    // Restore connections
    (data.connections || []).forEach(c => {
      const srcExists = _devices.some(d => d.id === c.src);
      const dstExists = _devices.some(d => d.id === c.dst);
      if (srcExists && dstExists) {
        _createConnection(c.id, c.src, c.dst, c.cableType || 'ethernet');
      }
    });

    // Advance the id counter past all restored ids
    const allIds  = [
      ...(data.devices     || []).map(d => d.id),
      ...(data.connections || []).map(c => c.id)
    ];
    const maxNum = allIds.reduce((max, id) => {
      const n = parseInt(id.slice(1), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    _nextId = maxNum + 1;

    _notify();
    return createdDevices;
  }

  // ── Helpers ──────────────────────────────────────

  function _notify() {
    if (_onChange) _onChange();
  }

  function _escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ── Public API ───────────────────────────────────
  return {
    init,
    // Devices
    addDevice,
    removeDevice,
    renameDevice,
    moveDevice,
    getDevice,
    getDevices,
    // Connections
    addConnection,
    removeConnection,
    getConnection,
    getConnections,
    updateAllLines,
    // Selection / highlights
    clearHighlights,
    highlightPath,
    setConnectingSource,
    selectDevice,
    // Reset
    clearAll,
    // Import / Export
    exportData,
    importData
  };

})();
