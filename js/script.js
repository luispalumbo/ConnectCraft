// System State
const canvas = document.getElementById('canvas-container');
const svgLayer = document.getElementById('links-layer');
const statusBox = document.getElementById('status-box');
const fileInput = document.getElementById('file-input');
const consoleLog = document.getElementById('console-log');
const deviceCountEl = document.getElementById('device-count');
const linkCountEl = document.getElementById('link-count');

let nodes = {};
let links = [];
let nodeIdCounter = 1;
let mode = 'move'; // Modes: 'move', 'link', 'ping'
let currentCableType = 'ethernet'; // Tracks 'ethernet' or 'wireless'
let selectedNodeId = null; 

// Update type map
const typeMap = {
  laptop: "💻", pc: "🖥️", printer: "🖨️", tv: "📺", phone: "📱", tablet: "📱", server: "🗄️",
  ap: "📡", firewall: "🔥", internet: "☁️", router: "🌐", switch: "🔀", wireless_router: "🛜"
};

const labelMap = {
  laptop: "Laptop", pc: "PC", printer: "Printer", tv: "Smart TV", phone: "Smart Phone", tablet: "Tablet", server: "Server",
  ap: "Access Point", firewall: "Firewall", internet: "Internet", router: "Router", switch: "Switch", wireless_router: "Wireless Router"
};

// Drag & Drop
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
    const sidebarWidth = document.getElementById('sidebar').offsetWidth;
    const topBarHeight = document.getElementById('top-bar').offsetHeight;
    addNode(type, e.clientX - sidebarWidth, e.clientY - topBarHeight);
  }
});

function addNode(type, x, y) {
  const id = 'node_' + nodeIdCounter++;
  
  const container = document.createElement('div');
  container.className = `node-container ${type}`;
  container.style.left = `${x}px`;
  container.style.top = `${y}px`;
  
  const nodeEl = document.createElement('div');
  nodeEl.className = 'node';
  nodeEl.innerText = typeMap[type] || '❓';
  container.appendChild(nodeEl);
  
  const defaultLabel = labelMap[type] || type.toUpperCase();
  const labelEl = document.createElement('div');
  labelEl.className = 'node-label';
  labelEl.innerText = defaultLabel;
  container.appendChild(labelEl);
  
  canvas.appendChild(container);
  
  nodes[id] = { id, type, x, y, containerEl: container, nodeEl: nodeEl, labelEl: labelEl, label: defaultLabel };
  updateCounts();

  let isDragging = false;
  
  nodeEl.addEventListener('mousedown', e => {
    e.stopPropagation();
    selectNode(id);
    
    if (mode === 'move') {
      isDragging = true;
    } else {
      handleNodeAction(id);
    }
  });

  nodeEl.addEventListener('dblclick', e => {
    e.stopPropagation();
    const newName = prompt("Enter a new name for this device:", nodes[id].label);
    if (newName !== null && newName.trim() !== "") {
      nodes[id].label = newName.trim();
      nodes[id].labelEl.innerText = nodes[id].label;
    }
  });
  
  window.addEventListener('mousemove', e => {
    if (isDragging && mode === 'move') {
      const sidebarWidth = document.getElementById('sidebar').offsetWidth;
      const topBarHeight = document.getElementById('top-bar').offsetHeight;
      const newX = e.clientX - sidebarWidth;
      const newY = e.clientY - topBarHeight;
      nodes[id].x = newX;
      nodes[id].y = newY;
      nodes[id].containerEl.style.left = `${newX}px`;
      nodes[id].containerEl.style.top = `${newY}px`;
      drawLinks(); 
    }
  });
  
  window.addEventListener('mouseup', () => isDragging = false);
}

function selectNode(id) {
  clearSelection();
  selectedNodeId = id;
  nodes[id].containerEl.classList.add('selected');
}

function clearSelection() {
  Object.values(nodes).forEach(n => n.containerEl.classList.remove('selected'));
  selectedNodeId = null;
}

// UI Mode Switching
document.getElementById('btn-move').onclick = (e) => setMode('move', e.target, 'Drag items from the menu, or click and drag them on the canvas.');
document.getElementById('btn-ping').onclick = (e) => setMode('ping', e.target, 'Click a source node, then click a destination node to send a packet.');

// Cable Type Buttons
document.getElementById('btn-connect-eth').onclick = (e) => {
  currentCableType = 'ethernet';
  setMode('link', e.target, 'Click a node, then click a second node to connect them via Ethernet.');
};

document.getElementById('btn-connect-wifi').onclick = (e) => {
  currentCableType = 'wireless';
  setMode('link', e.target, 'Click a node, then click a second node to connect them via Wireless link.');
};

function setMode(newMode, buttonElement, statusText) {
  mode = newMode;
  selectedNodeId = null; 
  window.actionSourceId = null; 
  clearSelection();
  
  document.querySelectorAll('#sidebar button').forEach(b => b.classList.remove('active'));
  buttonElement.classList.add('active');
  statusBox.innerText = `Mode: ${newMode.charAt(0).toUpperCase() + newMode.slice(1)}. ${statusText}`;
}

function handleNodeAction(id) {
  if (!window.actionSourceId) {
    window.actionSourceId = id;
    nodes[id].containerEl.classList.add('selected');
  } else {
    if (nodes[window.actionSourceId] && window.actionSourceId !== id) {
      if (mode === 'link') {
        // Prevent duplicate links
        const linkExists = links.some(l => 
          (l.source === window.actionSourceId && l.target === id) || 
          (l.source === id && l.target === window.actionSourceId)
        );
        
        if(!linkExists) {
          links.push({ source: window.actionSourceId, target: id, type: currentCableType });
          drawLinks();
          logMsg(`Connected ${nodes[window.actionSourceId].label} and ${nodes[id].label} (${currentCableType}).`);
        }
      } else if (mode === 'ping') {
        sendPing(window.actionSourceId, id);
      }
    }
    window.actionSourceId = null;
    clearSelection();
  }
}

// Deletion Logic
window.addEventListener('keydown', e => {
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
    removeNode(selectedNodeId);
  }
});

function removeNode(id) {
  if (!nodes[id]) return;
  if (window.actionSourceId === id) { window.actionSourceId = null; }
  logMsg(`Removed ${nodes[id].label} and associated connections.`);
  nodes[id].containerEl.remove();
  links = links.filter(link => link.source !== id && link.target !== id);
  delete nodes[id];
  selectedNodeId = null;
  drawLinks();
  updateCounts();
}

// Clear Canvas Logic
document.getElementById('btn-clear-canvas').onclick = () => {
  if(confirm("Are you sure you want to clear the entire canvas? This cannot be undone.")) {
    Object.values(nodes).forEach(n => n.containerEl.remove());
    nodes = {};
    links = [];
    nodeIdCounter = 1;
    svgLayer.innerHTML = '';
    updateCounts();
    logMsg("Canvas cleared.");
  }
};

// Render Cables
function drawLinks() {
  svgLayer.innerHTML = ''; 
  links.forEach(link => {
    const s = nodes[link.source];
    const t = nodes[link.target];
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', s.x);
    line.setAttribute('y1', s.y);
    line.setAttribute('x2', t.x);
    line.setAttribute('y2', t.y);
    
    if(link.type === 'wireless') {
      line.classList.add('wireless');
    }
    
    svgLayer.appendChild(line);
  });
  updateCounts();
}

// Packet Animation (Unchanged Logic)
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
  
  const hopDuration = 1000;
  let currentHop = 0;
  let startTime = performance.now();

  function animate(time) {
    if (currentHop >= path.length - 1) {
      circle.remove();
      const pathNames = path.map(id => nodes[id].label).join(' ➔ ');
      logMsg(`SUCCESS: Packet reached ${dstName}. Path: ${pathNames}`);
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
      logMsg(`... passing through ${nodes[path[currentHop + 1]].label}`);
      currentHop++;
      startTime = time;
      requestAnimationFrame(animate);
    }
  }
  requestAnimationFrame(animate);
}

// Console Logic
function logMsg(text, isError = false) {
  const entry = document.createElement('div');
  entry.className = isError ? 'log-entry log-error' : 'log-entry';
  const timestamp = new Date().toLocaleTimeString([], { hour12: false });
  entry.innerText = `[${timestamp}] ${text}`;
  consoleLog.appendChild(entry);
  consoleLog.scrollTop = consoleLog.scrollHeight; 
}

document.getElementById('btn-clear-log').onclick = () => {
  consoleLog.innerHTML = '';
  logMsg("Log cleared.");
};

// Top Bar Counts
function updateCounts() {
  const nodeCount = Object.keys(nodes).length;
  const linkCount = links.length;
  deviceCountEl.innerText = `${nodeCount} devices`;
  linkCountEl.innerText = `${linkCount} connections`;
}

// JSON Data handling 
document.getElementById('btn-export').onclick = () => {
  const networkData = {
    nodes: Object.values(nodes).map(n => ({ id: n.id, type: n.type, label: n.label, x: Math.round(n.x), y: Math.round(n.y) })),
    links: links
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(networkData, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "connectcraft_topology.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  logMsg("Topology exported successfully.");
};

document.getElementById('btn-import').onclick = () => fileInput.click();

fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try { loadNetwork(JSON.parse(event.target.result)); }
    catch (err) { alert("Invalid JSON file."); logMsg("Error: Import failed due to invalid JSON.", true); }
    fileInput.value = ''; 
  };
  reader.readAsText(file);
};

function loadNetwork(data) {
  Object.values(nodes).forEach(n => n.containerEl.remove());
  nodes = {}; links = []; svgLayer.innerHTML = '';
  
  let maxId = 0;
  data.nodes.forEach(n => {
    addNode(n.type, n.x, n.y); 
    const internalId = 'node_' + (nodeIdCounter - 1); 
    nodes[internalId].label = n.label || labelMap[n.type]; 
    nodes[internalId].labelEl.innerText = nodes[internalId].label;
    n.tempId = internalId; 
    const currentIdNum = parseInt(n.id.split('_')[1]);
    if (currentIdNum > maxId) maxId = currentIdNum;
  });
  nodeIdCounter = maxId + 1;

  data.links.forEach(link => {
    const sourceNode = data.nodes.find(n => n.id === link.source);
    const targetNode = data.nodes.find(n => n.id === link.target);
    // Support older JSON files that might not have a cable 'type' saved
    const linkType = link.type || 'ethernet'; 
    if (sourceNode && targetNode) {
      links.push({ source: sourceNode.tempId, target: targetNode.tempId, type: linkType });
    }
  });

  drawLinks();
  updateCounts();
  logMsg("Network topology imported successfully.");
}