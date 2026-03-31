# ◈ ConnectCraft — Network Simulator

A browser-based, interactive network topology builder and packet simulator designed for **Year 7–8 Digital Technologies** students.

Students drag network devices onto a canvas, cable them together using Ethernet or wireless connections, and watch a packet travel through the network — learning how data finds its path using a Breadth-First Search (BFS) algorithm. Projects can be saved and shared as JSON files.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Drag & Drop** | Drag devices from the sidebar onto the canvas to build a topology |
| **Two Palette Sections** | Devices are organised into **End Devices** and **Network Devices** |
| **Connect Tool** | Draw cables between any two devices |
| **Cable Types** | Choose **Ethernet** (solid cyan line) or **Wireless** (dashed violet line) before connecting |
| **Delete Tool** | Click any device (removes it **and** all its cables) or click any cable to remove it |
| **Rename** | Double-click any device to give it a custom name |
| **Packet Simulation** | Choose a source and destination — a glowing packet animates along the shortest route |
| **BFS Pathfinding** | Breadth-First Search finds the shortest path (fewest hops) through the network |
| **Packet Trace Log** | Timestamped log shows every hop the packet takes |
| **Path Highlighting** | Devices and cables on the path glow green during simulation |
| **Export JSON** | Save your topology to a `.json` file to submit or share |
| **Import JSON** | Load a previously saved topology back into ConnectCraft |

---

## 🖥️ Devices Available

### End Devices
Devices that people use to communicate — sources and destinations of data.

| Icon | Device | Teaching Point |
|---|---|---|
| 🖥️ | **PC** | Desktop computer — sends and receives data |
| 💻 | **Laptop** | Portable computer — another end device |
| 📱 | **Smart Phone** | Mobile device — usually connects wirelessly |
| 🖨️ | **Printer** | Network printer — allows remote printing |

### Network Devices
Infrastructure that connects and routes data between end devices.

| Icon | Device | Teaching Point |
|---|---|---|
| ⚡ | **Switch** | Connects devices in one network; sends data only to the correct device |
| 📡 | **Router** | Connects different networks; decides the best path for data |
| 🗄️ | **Server** | Stores data or runs services (websites, email, etc.) |
| 🔌 | **Hub** | Simple connector — broadcasts data to *all* devices (less efficient than a switch) |

---

## 🚀 How to Run

No server, build tools, or installation required.

1. **Clone or download** this repository
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari)

```bash
git clone https://github.com/<your-username>/connectcraft.git
cd connectcraft
# Open index.html in your browser
```

> **Tip for teachers:** Enable GitHub Pages (Settings → Pages → Deploy from branch `main`) to get a shareable URL students can open on any school device — no installation needed.

---

## 🎓 How to Use

### Building a Network

1. Make sure the **Select & Move** tool is active (default)
2. **Drag** a device from either palette section onto the canvas
3. Switch to the **Connect** tool
4. Choose a **Cable Type** — Ethernet or Wireless
5. Click one device, then click another to draw a cable
6. Repeat until your topology is complete

### Running a Simulation

1. In the **Send a Packet** panel, choose a **From** and **To** device
2. Click **▶ Send Packet**
3. Watch the packet travel — the route is highlighted green and every hop is logged below

### Saving & Sharing Work

- Click **📤 Export JSON** to download your topology as a `.json` file
- Click **📥 Import JSON** to load a `.json` file back into the canvas
- JSON files can be submitted as student work, shared between peers, or reloaded later

### Other Actions

- **Double-click** a device → rename it
- **Delete tool + click device** → removes the device and all its cables
- **Delete tool + click cable** → removes just that cable
- **Reset Highlights** → clears the green path after a simulation
- **Clear Canvas** → remove everything and start fresh

---

## 📁 File Structure

```
connectcraft/
├── index.html          # App shell — layout, sidebar, modals
├── css/
│   └── style.css       # All styling (dark-tech theme)
└── js/
    ├── devices.js      # Device type definitions (icons, colours, categories)
    ├── canvas.js       # CanvasManager — state, DOM, SVG lines, import/export
    ├── simulation.js   # BFS pathfinding + packet animation
    └── app.js          # Entry point — event wiring and UI logic
```

Every file is thoroughly commented and designed to be readable by students learning JavaScript.

---

## 💾 JSON Export Format

Exported files use a simple, human-readable format. Students and teachers can inspect them directly.

```json
{
  "version": 1,
  "devices": [
    { "id": "d1", "type": "pc",     "name": "Alice's PC", "x": 200, "y": 150 },
    { "id": "d2", "type": "switch", "name": "SW1",         "x": 450, "y": 150 },
    { "id": "d3", "type": "laptop", "name": "Bob's Laptop","x": 700, "y": 150 }
  ],
  "connections": [
    { "id": "c1", "src": "d1", "dst": "d2", "cableType": "ethernet" },
    { "id": "c2", "src": "d2", "dst": "d3", "cableType": "wireless" }
  ]
}
```

---

## 🔗 Australian Curriculum Links

| Strand | Content Description |
|---|---|
| **Digital Technologies** (Years 7–8) | Investigate how data is transmitted and shared in networks (AC9TDI8K04) |
| **Digital Technologies** (Years 7–8) | Implement and modify programs that use algorithms including sequence, selection and iteration (AC9TDI8P04) |
| **Mathematics** (Years 7–8) | Graph theory / algorithms connection — BFS explores all paths level-by-level |

---

## 🛠️ Ideas for Extension

| Extension | Skill Level |
|---|---|
| Add **IP address fields** to each device and show them in the label | Year 9–10 |
| Add a **subnet check** — only route between networks if a router is present | Year 10–11 |
| Add **packet types** (ICMP ping, HTTP, DNS) shown with different colours | Year 9–10 |
| Show the **routing table** built up as packets travel the network | Year 11–12 |
| Add **link latency** — make wireless links slower than ethernet | Year 9–10 |
| Add a **legend** overlay showing cable type meanings | Year 7–8 |

---

## 📄 Licence

MIT — free to use, modify, and share in educational settings.

---

*Built for Western Australian Digital Technologies classrooms.*
