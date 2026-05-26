// System State
const canvas = document.getElementById('canvas-container');
const svgLayer = document.getElementById('links-layer');
const statusBox = document.getElementById('status-box');

let nodes = {};
let links = [];
let nodeIdCounter = 1;
let mode = 'move'; // Modes: 'move', 'link', 'ping'
let selectedNode = null;

// --- Drag & Drop from Sidebar ---
document.querySelectorAll('.tool').forEach(tool => {
  tool.addEventListener('dragstart', e => {
    e.dataTransfer.setData('type', e.target.dataset.type);
  });
});

canvas.addEventListener('dragover', e => e.preventDefault());
canvas.addEventListener('drop', e => {
  e.preventDefault();
  const type = e.dataTransfer.getData('type');
  if (type) {
    // Adjust X coordinate to account for the sidebar width
    const sidebarWidth = document.getElementById('sidebar').offsetWidth;
    addNode(type, e.clientX - sidebarWidth, e.clientY);
  }
});

// --- Node Creation & Movement ---
function addNode(type, x, y) {
  const id = 'node_' + nodeIdCounter++;
  const el = document.createElement('div');
  el.className = `node ${type}`;
  
  // Create a mapping for default emojis/names
  const typeMap = {
    pc: "🖥️ PC",
    laptop: "💻 LAPTOP",
    phone: "📱 PHONE",
    printer: "🖨️ PRINTER",
    server: "🗄️ SERVER",
    switch: "🔀 SWITCH",
    router: "🌐 ROUTER",
    ap: "📡 AP",
    internet: "☁️ INTERNET"
  };

  // Set default label
  const defaultLabel = typeMap[type] || type.toUpperCase();
  el.innerText = defaultLabel;
 
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  
  canvas.appendChild(el);
  // Add 'label' to our state object
  nodes[id] = { id, type, x, y, el, label: defaultLabel };
  
  let isDragging = false;
  
  /*
  el.addEventListener('mousedown', e => {
    if (mode === 'move') isDragging = true;
    else handleNodeClick(id);
  });
  */
  el.addEventListener('mousedown', e => {
      // Select the node regardless of mode so we can delete it
      selectNode(id);
      
      if (mode === 'move') {
        isDragging = true;
      } else {
        handleNodeAction(id);
      }
    });

  // NEW: Double-click to rename
  el.addEventListener('dblclick', e => {
    e.stopPropagation(); // Prevents the click from triggering other canvas events
    const newName = prompt("Enter a new name for this device:", nodes[id].label);
    
    // Only update if they typed something and didn't hit cancel
    if (newName !== null && newName.trim() !== "") {
      nodes[id].label = newName.trim();
      el.innerText = nodes[id].label;
    }
  });
  
  window.addEventListener('mousemove', e => {
    if (isDragging && mode === 'move') {
      const sidebarWidth = document.getElementById('sidebar').offsetWidth;
      nodes[id].x = e.clientX - sidebarWidth;
      nodes[id].y = e.clientY;
      el.style.left = `${nodes[id].x}px`;
      el.style.top = `${nodes[id].y}px`;
      drawLinks(); // Update cables in real-time
    }
  });
  
  window.addEventListener('mouseup', () => isDragging = false);
}

// Luis added here
// Helper to handle selection visuals
function selectNode(id) {
  clearSelection();
  selectedNode = id;
  nodes[id].el.classList.add('selected');
}

// --- Deletion Logic ---
window.addEventListener('keydown', e => {
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode) {
    // Don't delete if the user is typing in a prompt (though prompts are modal)
    removeNode(selectedNode);
  }
});

function removeNode(id) {
  if (!nodes[id]) return;

  // If the node being deleted was the start of a cable/ping, reset it
  if (window.actionSource === id) {
    window.actionSource = null;
  }

  nodes[id].el.remove();
  links = links.filter(link => link.source !== id && link.target !== id);
  delete nodes[id];

  selectedNode = null;
  drawLinks();
  statusBox.innerText = "Device and associated cables removed.";
}


// --- UI Mode Switching ---
document.getElementById('btn-move').onclick = (e) => setMode('move', e.target, 'Drag items from the menu, or click and drag them on the canvas.');
document.getElementById('btn-connect').onclick = (e) => setMode('link', e.target, 'Click a node, then click a second node to connect them.');
document.getElementById('btn-ping').onclick = (e) => setMode('ping', e.target, 'Click a source node, then click a destination node to send a packet.');

function setMode(newMode, buttonElement, statusText) {
  mode = newMode;
  selectedNode = null;
  window.actionSource = null; // Clear the pending connection source
  clearSelection();
  
  document.querySelectorAll('#sidebar button').forEach(b => b.classList.remove('active'));
  buttonElement.classList.add('active');
  statusBox.innerText = `Mode: ${newMode.charAt(0).toUpperCase() + newMode.slice(1)}. ${statusText}`;
}

// --- Interaction Logic ---
function handleNodeClick(id) {
  if (mode === 'link' || mode === 'ping') {
    if (!selectedNode) {
      selectedNode = id;
      nodes[id].el.classList.add('selected');
    } else if (selectedNode !== id) {
      if (mode === 'link') {
        links.push({ source: selectedNode, target: id });
        drawLinks();
      } else if (mode === 'ping') {
        sendPing(selectedNode, id);
      }
      // Reset selection after action
      clearSelection();
      selectedNode = null;
    }
  }
}

function handleNodeAction(id) {
  // This is only called if mode is 'link' or 'ping'
  // We use a temporary variable to track the "first" node in a pair
  if (!window.actionSource) {
    window.actionSource = id;
    nodes[id].el.classList.add('selected');
  } else {
    // Safety check: ensure the source node still exists in our data
    if (nodes[window.actionSource] && window.actionSource !== id) {
      if (mode === 'link') {
        links.push({ source: window.actionSource, target: id });
        drawLinks();
      } else if (mode === 'ping') {
        sendPing(window.actionSource, id);
      }
    }
    
    // Always reset after the second click
    window.actionSource = null;
    clearSelection();
  }
}

function clearSelection() {
  Object.values(nodes).forEach(n => n.el.classList.remove('selected'));
}

// --- Render Cables ---
function drawLinks() {
  svgLayer.innerHTML = ''; // Clear existing
  links.forEach(link => {
    const s = nodes[link.source];
    const t = nodes[link.target];
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', s.x);
    line.setAttribute('y1', s.y);
    line.setAttribute('x2', t.x);
    line.setAttribute('y2', t.y);
    svgLayer.appendChild(line);
  });
}

// --- Packet Animation ---
function sendPing(srcId, dstId) {
  const graph = {};
  Object.keys(nodes).forEach(id => graph[id] = []);
  links.forEach(link => {
    graph[link.source].push(link.target);
    graph[link.target].push(link.source); 
  });

  const queue = [[srcId]];
  const visited = new Set([srcId]);
  let path = null;

  while (queue.length > 0) {
    const currentPath = queue.shift();
    const currentId = currentPath[currentPath.length - 1];
    if (currentId === dstId) { path = currentPath; break; }
    for (let neighbor of graph[currentId]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...currentPath, neighbor]);
      }
    }
  }

  const srcName = nodes[srcId].label;
  const dstName = nodes[dstId].label;

  if (!path) {
    logMsg(`PING: From ${srcName} to ${dstName} - Request timed out. Destination unreachable.`, true);
    return;
  }

  logMsg(`PING: Starting transmission from ${srcName} to ${dstName}...`);

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('r', 8);
  circle.setAttribute('class', 'packet');
  svgLayer.appendChild(circle);
  
  const hopDuration = 600;
  let currentHop = 0;
  let startTime = performance.now();

  function animate(time) {
    if (currentHop >= path.length - 1) {
      circle.remove();
      logMsg(`SUCCESS: Packet reached ${dstName}. Full path: ${path.map(id => nodes[id].label).join(' ➔ ')}`);
      return;
    }

    const hopSrc = nodes[path[currentHop]];
    const hopDst = nodes[path[currentHop + 1]];
    const progress = (time - startTime) / hopDuration;

    if (progress < 1) {
      const currentX = hopSrc.x + (hopDst.x - hopSrc.x) * progress;
      const currentY = hopSrc.y + (hopDst.y - hopSrc.y) * progress;
      circle.setAttribute('cx', currentX);
      circle.setAttribute('cy', currentY);
      requestAnimationFrame(animate);
    } else {
      // LOG EACH HOP HERE:
      logMsg(`... passing through ${nodes[path[currentHop + 1]].label}`);
      currentHop++;
      startTime = time;
      requestAnimationFrame(animate);
    }
  }
  requestAnimationFrame(animate);
}

// --- JSON Export ---
document.getElementById('btn-export').onclick = () => {
  const networkData = {
    // We added "label: n.label" to the export mapping below:
    nodes: Object.values(nodes).map(n => ({ id: n.id, type: n.type, label: n.label, x: Math.round(n.x), y: Math.round(n.y) })),
    links: links
  };
  
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(networkData, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "network_topology.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

// --- JSON Import ---
const fileInput = document.getElementById('file-input');

// Trigger the hidden file input when the button is clicked
document.getElementById('btn-import').onclick = () => {
  fileInput.click();
};

fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      loadNetwork(data);
    } catch (err) {
      alert("Invalid JSON file. Please make sure it's a valid topology export.");
      console.error(err);
    }
    // Reset the input so you can upload the same file again if needed
    fileInput.value = '';
  };
  reader.readAsText(file);
};

function loadNetwork(data) {
  // 1. Clear current canvas and state
  Object.values(nodes).forEach(n => n.el.remove());
  nodes = {};
  links = [];
  svgLayer.innerHTML = '';
  
  // 2. Reconstruct Nodes
  let maxId = 0;
  data.nodes.forEach(n => {
    // We recreate the node manually here to ensure we keep the saved ID and label
    addNode(n.type, n.x, n.y);
    
    // addNode just created a new ID, let's overwrite it with the saved one
    // and find the highest ID to prevent future collisions
    const currentIdNum = parseInt(n.id.split('_')[1]);
    if (currentIdNum > maxId) maxId = currentIdNum;
    
    // Update the label if it was customized
    const internalId = 'node_' + (nodeIdCounter - 1);
    nodes[internalId].label = n.label || n.type.toUpperCase();
    nodes[internalId].el.innerText = nodes[internalId].label;
    
    // Map the old file ID to our new internal ID (important for links!)
    n.tempId = internalId;
  });

  // Update our global counter so we don't duplicate IDs
  nodeIdCounter = maxId + 1;

  // 3. Reconstruct Links
  // We need to map the file's source/target IDs to our newly generated internal IDs
  data.links.forEach(link => {
    const sourceNode = data.nodes.find(n => n.id === link.source);
    const targetNode = data.nodes.find(n => n.id === link.target);
    
    if (sourceNode && targetNode) {
      links.push({
        source: sourceNode.tempId,
        target: targetNode.tempId
      });
    }
  });

  drawLinks();
  statusBox.innerText = "Network topology loaded successfully!";
}

function logMsg(text, isError = false) {
  const log = document.getElementById('console-log');
  const entry = document.createElement('div');
  entry.className = isError ? 'log-entry log-error' : 'log-entry';
  
  const timestamp = new Date().toLocaleTimeString([], { hour12: false });
  entry.innerText = `[${timestamp}] ${text}`;
  
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight; // Auto-scroll to bottom
}