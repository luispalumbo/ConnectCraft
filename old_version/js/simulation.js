/**
 * simulation.js — Simulation module for ConnectCraft
 *
 * Responsibilities:
 *   • findPath(srcId, dstId)  — BFS shortest path through the network graph
 *   • animatePacket(path)     — animate a glowing dot along the path
 *
 * Depends on CanvasManager being available globally.
 */

/* global CanvasManager, Simulation */

const Simulation = (() => {

  let _packetLayer = null;  // DOM element for packet divs

  /**
   * Initialise the module.
   * @param {HTMLElement} packetLayer - the #packet-layer div
   */
  function init(packetLayer) {
    _packetLayer = packetLayer;
  }

  // ── Pathfinding (BFS) ────────────────────────────

  /**
   * Find the shortest path between two devices using
   * Breadth-First Search (BFS).
   *
   * BFS explores the network level by level, guaranteeing
   * the shortest path (fewest hops) is always found first.
   *
   * @param {string} srcId  - starting device id
   * @param {string} dstId  - destination device id
   * @returns {{ devicePath: string[], connPath: string[] } | null}
   */
  function findPath(srcId, dstId) {
    if (srcId === dstId) {
      return { devicePath: [srcId], connPath: [] };
    }

    const connections = CanvasManager.getConnections();

    // Build adjacency list:  deviceId → [ { neighbor, connId }, … ]
    const adj = {};
    connections.forEach(c => {
      if (!adj[c.src]) adj[c.src] = [];
      if (!adj[c.dst]) adj[c.dst] = [];
      adj[c.src].push({ neighbor: c.dst, connId: c.id });
      adj[c.dst].push({ neighbor: c.src, connId: c.id });
    });

    // BFS — each queue item carries its full path so far
    const queue = [{
      id:         srcId,
      devicePath: [srcId],
      connPath:   []
    }];

    const visited = new Set([srcId]);

    while (queue.length > 0) {
      const { id, devicePath, connPath } = queue.shift();

      for (const { neighbor, connId } of (adj[id] || [])) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);

        const newDevicePath = [...devicePath, neighbor];
        const newConnPath   = [...connPath,   connId];

        if (neighbor === dstId) {
          return { devicePath: newDevicePath, connPath: newConnPath };
        }

        queue.push({ id: neighbor, devicePath: newDevicePath, connPath: newConnPath });
      }
    }

    return null; // No path exists
  }

  // ── Packet animation ─────────────────────────────

  /**
   * Animate a glowing packet dot travelling along a device path.
   *
   * Uses requestAnimationFrame so each frame is driven by the browser's
   * render loop — avoids the timing desync that occurs when CSS transitions
   * and setTimeout run independently.
   *
   * @param {string[]} devicePath - ordered array of device ids
   * @returns {Promise<void>} resolves when animation is complete
   */
  async function animatePacket(devicePath) {
    if (devicePath.length < 2) return;

    // Build packet element and place it at the first device immediately
    const packet = document.createElement('div');
    packet.className = 'packet';
    _packetLayer.appendChild(packet);

    const startDevice = CanvasManager.getDevice(devicePath[0]);
    packet.style.left = `${startDevice.x}px`;
    packet.style.top  = `${startDevice.y}px`;

    // Animate one segment at a time
    for (let i = 0; i < devicePath.length - 1; i++) {
      const from = CanvasManager.getDevice(devicePath[i]);
      const to   = CanvasManager.getDevice(devicePath[i + 1]);
      if (!from || !to) continue;
      await _movePacket(packet, from.x, from.y, to.x, to.y);
    }

    // Burst animation at destination, then remove
    packet.style.animation = 'packet-arrive 0.45s ease forwards';
    await _delay(460);
    packet.remove();
  }

  /**
   * Move the packet element from (x1,y1) → (x2,y2) using
   * requestAnimationFrame for frame-perfect linear animation.
   *
   * Speed ≈ 180 px/s, clamped between 300 ms and 1500 ms.
   *
   * @param {HTMLElement} el
   * @param {number} x1  @param {number} y1  start position (px)
   * @param {number} x2  @param {number} y2  end position (px)
   * @returns {Promise<void>}
   */
  function _movePacket(el, x1, y1, x2, y2) {
    return new Promise(resolve => {
      const dist     = Math.hypot(x2 - x1, y2 - y1);
      const duration = Math.max(300, Math.min(1500, dist * 5.5)); // ms
      const startTime = performance.now();

      function step(now) {
        const t = Math.min((now - startTime) / duration, 1); // 0 → 1

        // Linear interpolation along this segment
        el.style.left = `${x1 + (x2 - x1) * t}px`;
        el.style.top  = `${y1 + (y2 - y1) * t}px`;

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }

      requestAnimationFrame(step);
    });
  }

  /** Simple delay helper. */
  function _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ── Public API ───────────────────────────────────
  return { init, findPath, animatePacket };

})();