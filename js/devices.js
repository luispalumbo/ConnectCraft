/**
 * devices.js — Device type definitions for ConnectCraft
 *
 * Each device type has:
 *   svg         — Cisco-style inline SVG (64×64 viewBox, uses currentColor)
 *   label       — display name in the palette
 *   description — tooltip shown when hovering a device
 *   color       — accent colour: SVG strokes, icon tint, border
 *   bg          — dark-mode card background (deep tint of the colour)
 *   prefix      — default name prefix  e.g. "PC" → PC1, PC2 …
 *   category    — 'end' | 'network'
 *
 * Devices are listed alphabetically within each category.
 * Icon style: drawn in the spirit of Cisco Network Topology Icons.
 *
 * End devices     : Laptop, PC, Printer, Scanner, Smart Phone, Tablet
 * Network devices : Access Point, Firewall, Internet, Router, Server, Switch, Wireless Router
 */

/* global DEVICE_TYPES */
const DEVICE_TYPES = {

  // ══════════════════════════════════════════════════════════════
  //  END DEVICES  — alphabetical
  // ══════════════════════════════════════════════════════════════

  laptop: {
    label:       'Laptop',
    description: 'Portable computer — an end device on the network.',
    color:       '#81c784',
    bg:          '#081e0c',
    prefix:      'Laptop',
    category:    'end',
    svg: `<rect x="6" y="4" width="52" height="38" rx="2" fill="none" stroke="currentColor" stroke-width="3"/>
<rect x="12" y="10" width="40" height="26" fill="currentColor" fill-opacity="0.18"/>
<line x1="2" y1="44" x2="62" y2="44" stroke="currentColor" stroke-width="3"/>
<rect x="2" y="44" width="60" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="3"/>
<rect x="23" y="48" width="18" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/>`
  },

  pc: {
    label:       'PC',
    description: 'Desktop computer — an end device that sends and receives data.',
    color:       '#4fc3f7',
    bg:          '#081e30',
    prefix:      'PC',
    category:    'end',
    svg: `<rect x="8" y="5" width="48" height="36" rx="2" fill="none" stroke="currentColor" stroke-width="3"/>
<rect x="14" y="10" width="36" height="24" fill="currentColor" fill-opacity="0.18"/>
<rect x="28" y="41" width="8" height="8" fill="none" stroke="currentColor" stroke-width="3"/>
<rect x="20" y="49" width="24" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="3"/>`
  },

  printer: {
    label:       'Printer',
    description: 'Network printer — allows people on the network to print remotely.',
    color:       '#ce93d8',
    bg:          '#160830',
    prefix:      'Printer',
    category:    'end',
    svg: `<rect x="8" y="22" width="48" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="3"/>
<rect x="16" y="10" width="32" height="16" rx="1" fill="none" stroke="currentColor" stroke-width="3"/>
<rect x="18" y="43" width="22" height="13" fill="none" stroke="currentColor" stroke-width="2.5"/>
<circle cx="46" cy="31" r="3" fill="currentColor" fill-opacity="0.7"/>
<circle cx="53" cy="31" r="3" fill="currentColor" fill-opacity="0.7"/>`
  },

  scanner: {
    label:       'Scanner',
    description: 'Flatbed scanner — scans documents and sends them across the network.',
    color:       '#38bdf8',
    bg:          '#071c2e',
    prefix:      'Scanner',
    category:    'end',
    // Flatbed scanner: lid on top, scanning bed below, scan-head line, status LEDs, feet
    svg: `<rect x="5" y="8" width="54" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/>
<line x1="12" y1="15" x2="44" y2="15" stroke="currentColor" stroke-width="1.8" stroke-dasharray="4 3"/>
<rect x="5" y="22" width="54" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="3"/>
<rect x="10" y="27" width="36" height="8" fill="currentColor" fill-opacity="0.18"/>
<line x1="24" y1="27" x2="24" y2="35" stroke="currentColor" stroke-width="2.5"/>
<circle cx="49" cy="29" r="2.5" fill="currentColor" fill-opacity="0.8"/>
<circle cx="49" cy="35" r="2.5" fill="currentColor" fill-opacity="0.8"/>
<line x1="12" y1="40" x2="12" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
<line x1="52" y1="40" x2="52" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
<line x1="8" y1="50" x2="56" y2="50" stroke="currentColor" stroke-width="2.5"/>`
  },

  phone: {
    label:       'Smart Phone',
    description: 'Mobile phone — a wireless end device that connects to the network.',
    color:       '#4db6ac',
    bg:          '#081c1a',
    prefix:      'Phone',
    category:    'end',
    svg: `<rect x="18" y="3" width="28" height="52" rx="4" fill="none" stroke="currentColor" stroke-width="3"/>
<rect x="23" y="11" width="18" height="28" fill="currentColor" fill-opacity="0.18"/>
<line x1="27" y1="7" x2="37" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
<circle cx="32" cy="47" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/>`
  },

  tablet: {
    label:       'Tablet',
    description: 'Tablet device — a portable touchscreen end device, usually connected wirelessly.',
    color:       '#818cf8',
    bg:          '#0e0e28',
    prefix:      'Tablet',
    category:    'end',
    // Portrait tablet: wider than phone, home button at bottom
    svg: `<rect x="14" y="4" width="36" height="56" rx="5" fill="none" stroke="currentColor" stroke-width="3"/>
<rect x="19" y="12" width="26" height="34" fill="currentColor" fill-opacity="0.18" rx="1"/>
<circle cx="32" cy="8.5" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/>
<rect x="27" y="50" width="10" height="6" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/>`
  },

  // ══════════════════════════════════════════════════════════════
  //  NETWORK DEVICES  — alphabetical
  // ══════════════════════════════════════════════════════════════

  access_point: {
    label:       'Access Point',
    description: 'Wireless access point — a ceiling-mounted device that provides Wi-Fi to end devices in a room.',
    color:       '#22d3ee',
    bg:          '#071e24',
    prefix:      'AP',
    category:    'network',
    // Ceiling mount bar at top, dome body hanging down, signals radiating downward
    svg: `<line x1="6" y1="8" x2="58" y2="8" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
<path d="M 16,8 A 18,15 0 0 1 48,8" fill="none" stroke="currentColor" stroke-width="2.5"/>
<line x1="32" y1="23" x2="32" y2="28" stroke="currentColor" stroke-width="2"/>
<circle cx="32" cy="28" r="2.5" fill="currentColor"/>
<path d="M 26,34 A 9,9 0 0 0 38,34"   fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 19,42 A 17,17 0 0 0 45,42" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 12,51 A 25,25 0 0 0 52,51" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`
  },

  firewall: {
    label:       'Firewall',
    description: 'Firewall — monitors and controls network traffic to protect against threats.',
    color:       '#fb923c',
    bg:          '#200e00',
    prefix:      'FW',
    category:    'network',
    // Brick-wall pattern — classic Cisco firewall icon
    svg: `<rect x="4"  y="9"  width="26" height="11" rx="1" fill="none" stroke="currentColor" stroke-width="2.5"/>
<rect x="34" y="9"  width="26" height="11" rx="1" fill="none" stroke="currentColor" stroke-width="2.5"/>
<rect x="4"  y="22" width="12" height="11" rx="1" fill="none" stroke="currentColor" stroke-width="2.5"/>
<rect x="20" y="22" width="24" height="11" rx="1" fill="none" stroke="currentColor" stroke-width="2.5"/>
<rect x="48" y="22" width="12" height="11" rx="1" fill="none" stroke="currentColor" stroke-width="2.5"/>
<rect x="4"  y="35" width="26" height="11" rx="1" fill="none" stroke="currentColor" stroke-width="2.5"/>
<rect x="34" y="35" width="26" height="11" rx="1" fill="none" stroke="currentColor" stroke-width="2.5"/>
<rect x="4"  y="48" width="12" height="9"  rx="1" fill="none" stroke="currentColor" stroke-width="2.5"/>
<rect x="20" y="48" width="24" height="9"  rx="1" fill="none" stroke="currentColor" stroke-width="2.5"/>
<rect x="48" y="48" width="12" height="9"  rx="1" fill="none" stroke="currentColor" stroke-width="2.5"/>`
  },

  internet: {
    label:       'Internet',
    description: 'Represents the Internet — the global network connecting all networks.',
    color:       '#34d399',
    bg:          '#061e14',
    prefix:      'Internet',
    category:    'network',
    svg: `<circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="3"/>
<ellipse cx="32" cy="32" rx="13" ry="26" fill="none" stroke="currentColor" stroke-width="2"/>
<line x1="9"  y1="20" x2="55" y2="20" stroke="currentColor" stroke-width="2"/>
<line x1="6"  y1="32" x2="58" y2="32" stroke="currentColor" stroke-width="2"/>
<line x1="9"  y1="44" x2="55" y2="44" stroke="currentColor" stroke-width="2"/>`
  },

  router: {
    label:       'Router',
    description: 'Connects different networks together and decides the best path for data to travel.',
    color:       '#ef5350',
    bg:          '#2a0606',
    prefix:      'Router',
    category:    'network',
    svg: `<circle cx="32" cy="32" r="13" fill="none" stroke="currentColor" stroke-width="3"/>
<line x1="32" y1="19" x2="32" y2="8"  stroke="currentColor" stroke-width="2.5"/>
<polygon points="32,3 28.5,10 35.5,10" fill="currentColor"/>
<line x1="32" y1="45" x2="32" y2="56" stroke="currentColor" stroke-width="2.5"/>
<polygon points="32,61 28.5,54 35.5,54" fill="currentColor"/>
<line x1="19" y1="32" x2="8"  y2="32" stroke="currentColor" stroke-width="2.5"/>
<polygon points="3,32 10,28.5 10,35.5" fill="currentColor"/>
<line x1="45" y1="32" x2="56" y2="32" stroke="currentColor" stroke-width="2.5"/>
<polygon points="61,32 54,28.5 54,35.5" fill="currentColor"/>`
  },

  server: {
    label:       'Server',
    description: 'Stores data and runs services like websites, email, or file sharing.',
    color:       '#a78bfa',
    bg:          '#120828',
    prefix:      'Server',
    category:    'network',
    svg: `<rect x="14" y="4" width="36" height="56" rx="2" fill="none" stroke="currentColor" stroke-width="3"/>
<line x1="14" y1="18" x2="50" y2="18" stroke="currentColor" stroke-width="1.8"/>
<line x1="14" y1="32" x2="50" y2="32" stroke="currentColor" stroke-width="1.8"/>
<line x1="14" y1="46" x2="50" y2="46" stroke="currentColor" stroke-width="1.8"/>
<circle cx="22" cy="11" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
<circle cx="29" cy="11" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
<circle cx="22" cy="25" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
<circle cx="29" cy="25" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
<circle cx="22" cy="39" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
<circle cx="29" cy="39" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
<circle cx="22" cy="53" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
<circle cx="43" cy="11" r="3"   fill="currentColor" fill-opacity="0.75"/>
<circle cx="43" cy="25" r="3"   fill="currentColor" fill-opacity="0.75"/>
<circle cx="43" cy="39" r="3"   fill="currentColor" fill-opacity="0.75"/>
<circle cx="43" cy="53" r="3"   fill="currentColor" fill-opacity="0.75"/>`
  },

  switch: {
    label:       'Switch',
    description: 'Connects multiple devices in the same network. Sends data only to the right device.',
    color:       '#ffb74d',
    bg:          '#221400',
    prefix:      'SW',
    category:    'network',
    svg: `<rect x="4" y="20" width="56" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="3"/>
<rect x="9"  y="26" width="6" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/>
<rect x="17" y="26" width="6" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/>
<rect x="25" y="26" width="6" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/>
<rect x="33" y="26" width="6" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/>
<rect x="9"  y="33" width="6" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/>
<rect x="17" y="33" width="6" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/>
<rect x="25" y="33" width="6" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/>
<rect x="33" y="33" width="6" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/>
<circle cx="47" cy="29" r="2.5" fill="currentColor" fill-opacity="0.7"/>
<circle cx="54" cy="29" r="2.5" fill="currentColor" fill-opacity="0.7"/>
<circle cx="47" cy="36" r="2.5" fill="currentColor" fill-opacity="0.7"/>
<circle cx="54" cy="36" r="2.5" fill="currentColor" fill-opacity="0.7"/>`
  },

  wireless_router: {
    label:       'Wireless Router',
    description: 'A router with Wi-Fi — connects networks and provides wireless access to devices.',
    color:       '#f06292',
    bg:          '#280818',
    prefix:      'WR',
    category:    'network',
    svg: `<ellipse cx="32" cy="52" rx="20" ry="7" fill="none" stroke="currentColor" stroke-width="2.5"/>
<line x1="32" y1="45" x2="32" y2="40" stroke="currentColor" stroke-width="2.5"/>
<circle cx="32" cy="40" r="2.5" fill="currentColor"/>
<path d="M 25,36 A 9,9 0 0 1 39,36"   fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 18,28 A 16,16 0 0 1 46,28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 11,20 A 23,23 0 0 1 53,20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`
  }

};
