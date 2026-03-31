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
 * Icon style: drawn in the spirit of Cisco Network Topology Icons —
 * simple stroke-based line drawings. Cisco icons are freely usable.
 *
 * Device list
 *   End devices     : PC, Laptop, Smart Phone, Printer
 *   Network devices : Switch, Wireless Router, Router, Server, Internet
 */

/* global DEVICE_TYPES */
const DEVICE_TYPES = {

  // ── End Devices ──────────────────────────────────────────────
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

  laptop: {
    label:       'Laptop',
    description: 'Portable computer — another end device on the network.',
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

  // ── Network Devices ──────────────────────────────────────────
  switch: {
    label:       'Switch',
    description: 'Connects multiple devices in the same network. Smarter than a hub — sends data only to the right device.',
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
  }

};
