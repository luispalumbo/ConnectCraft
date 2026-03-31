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
   * BFS is a great algorithm to teach Year 7–8 students:
   * it explores the network level by level, guaranteeing
   * the shortest path (fewest hops) is found first.
   *
   * @param {string} srcId  - starting device id
   * @param {string} dstId  - destination device id
   * @returns {{ devicePath: string[], connPath: string[] } | null}
   *          Arrays of device and connection ids on the path,
   *          or null if no path exists.
   */
  function findPath(srcId, dstId) {
    if (srcId === dstId) {
      return { devicePath: [srcId], connPath: [] };
    }

    const connections = CanvasManager.getConnections();

    // Build an adjacency list:  deviceId → [ { neighbor, connId }, … ]
    const adj = {};
    connections.forEach(c => {
      if (!adj[c.src]) adj[c.src] = [];
      if (!adj[c.dst]) adj[c.dst] = [];
      adj[c.src].push({ neighbor: c.dst, connId: c.id });
      adj[c.dst].push({ neighbor: c.src, connId: c.id });
    });

    // BFS queue: each item tracks the path taken to reach here
    const queue = [{
      id:         srcId,
      devicePath: [srcId],
      connPath:   []
    }];

    const visited = new Set([srcId]);

    while (queue.length > 0) {
      const { id, devicePath, connPath } = queue.shift();

      const neighbours = adj[id] || [];
      for (const { neighbor, connId } of neighbours) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);

        const newDevicePath = [...devicePath, neighbor];
        const newConnPath   = [...connPath,   connId];

        if (neighbor === dstId) {
          // Found it — return the complete path
          return { devicePath: newDevicePath, connPath: newConnPath };
        }

        queue.push({ id: neighbor, devicePath: newDevicePath, connPath: newConnPath });
      }
    }

    return null; // No path exists
  }

  // ── Packet animation ─────────────────────────────

  /**
   * Animate a packet (glowing dot) travelling along a device path.
   *
   * @param {string[]} devicePath - ordered array of device ids
   * @returns {Promise<void>} resolves when animation is complete
   */
  async function animatePacket(devicePath) {
    if (devicePath.length < 2) return;

    // Create the packet element
    const packet = document.createElement('div');
    packet.className = 'packet';
    _packetLayer.appendChild(packet);

    // Place at starting device
    const start = CanvasManager.getDevice(devicePath[0]);
    packet.style.left = `${start.x}px`;
    packet.style.top  = `${start.y}px`;

    // Force reflow so transition starts cleanly
    packet.getBoundingClientRect();

    // Move segment by segment
    for (let i = 0; i < devicePath.length - 1; i++) {
      const from = CanvasManager.getDevice(devicePath[i]);
      const to   = CanvasManager.getDevice(devicePath[i + 1]);
      if (!from || !to) continue;

      await _movePacket(packet, from.x, from.y, to.x, to.y);
    }

    // Burst animation at destination
    packet.style.animation = 'packet-arrive 0.45s ease forwards';
    await _delay(500);

    packet.remove();
  }

  /**
   * Smoothly move the packet element from one point to another.
   * Speed scales with distance (roughly 220 px/s).
   *
   * @param {HTMLElement} el
   * @param {number} x1 @param {number} y1
   * @param {number} x2 @param {number} y2
   * @returns {Promise<void>}
   */
  function _movePacket(el, x1, y1, x2, y2) {
    return new Promise(resolve => {
      const dist     = Math.hypot(x2 - x1, y2 - y1);
      const duration = Math.max(280, Math.min(1400, dist * 4.5)); // ms

      el.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
      el.style.left = `${x2}px`;
      el.style.top  = `${y2}px`;

      setTimeout(resolve, duration);
    });
  }

  /** Simple delay helper. */
  function _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ── Public API ───────────────────────────────────
  return { init, findPath, animatePacket };

})();
