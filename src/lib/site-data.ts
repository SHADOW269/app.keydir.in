/* ════════════════════════════════════════════════════════════════
   KEYDIR.in — Site Data (single source of truth)
   Mirrors /Keydir.in/assets/js/shared.js
   ════════════════════════════════════════════════════════════════ */

export interface Vendor {
  name: string;
  url: string;
  cats: string[];
  warning?: boolean;
  warning_message?: string;
}

export interface CatMeta {
  id: string;
  label: string;
  icon: string;
  col: string;
  bcls: string;
}

export const CAT_META: CatMeta[] = [
  { id: 'Pre-built', label: 'Pre-built', icon: '⌨', col: 'yellow', bcls: 'b-yellow' },
  { id: 'Barebone', label: 'Barebone', icon: '🗜', col: 'orange', bcls: 'b-orange' },
  { id: 'Low-Profile', label: 'Low-Profile', icon: '📏', col: 'teal', bcls: 'b-teal' },
  { id: 'Split', label: 'Split', icon: '✂', col: 'purple', bcls: 'b-purple' },
  { id: 'Alice', label: 'Alice', icon: '🌀', col: 'pink', bcls: 'b-pink' },
  { id: 'Hall Effect', label: 'Hall Effect', icon: '🧲', col: 'cyan', bcls: 'b-cyan' },
  { id: 'Switches', label: 'Switches', icon: '🔘', col: 'red', bcls: 'b-red' },
  { id: 'Keycaps', label: 'Keycaps', icon: '⬛', col: 'green', bcls: 'b-green' },
  { id: 'Parts/Tools', label: 'Parts/Tools', icon: '🔧', col: 'purple', bcls: 'b-purple' },
  { id: 'Accessories', label: 'Accessories', icon: '🎛', col: 'pink', bcls: 'b-pink' },
  { id: 'Mouse', label: 'Mouse', icon: '🖱', col: 'blue', bcls: 'b-blue' },
  { id: 'Mousepad', label: 'Mousepad', icon: '🔲', col: 'blue', bcls: 'b-blue' },
  { id: 'Deskpad', label: 'Deskpad', icon: '📋', col: 'teal', bcls: 'b-teal' },
  { id: 'Glass-pad', label: 'Glass-pad', icon: '◻️', col: 'teal', bcls: 'b-teal' },
  { id: 'PC Parts', label: 'PC Parts', icon: '💻', col: 'black', bcls: 'b-black' },
];

export const VENDORS: Vendor[] = [
  { name: 'AceKBD', url: 'https://acekbd.com/', cats: ['Barebone', 'Accessories', 'Deskpad'] },
  { name: 'AltF4Gear', url: 'https://altf4gear.com/', cats: ['Pre-built', 'Hall Effect', 'Mouse'] },
  { name: 'Conceptkart', url: 'https://conceptkart.com/pages/keyboard-mouse', cats: ['Pre-built', 'Hall Effect', 'Mouse', 'Accessories'] },
  { name: 'Credkeys', url: 'https://credkeys.com/', cats: ['Pre-built', 'Switches', 'Keycaps', 'Parts/Tools', 'Accessories'] },
  { name: 'CtrlShiftStore', url: 'https://ctrlshiftstore.com/', cats: ['Pre-built', 'Low-Profile', 'Barebone', 'Alice', 'Hall Effect', 'Keycaps', 'Switches', 'Accessories', 'Mouse', 'Mousepad', 'Glass-pad'] },
  { name: 'Curiosity Caps', url: 'https://curiositycaps.in/', cats: ['Keycaps', 'Accessories', 'Mousepad', 'Deskpad', 'Glass-pad', 'PC Parts'] },
  { name: 'Cybeart', url: 'https://cybeart.in/', cats: ['Pre-built', 'Mouse', 'Mousepad'] },
  { name: 'FernTech', url: 'https://ferntechworld.com/products/aula-f75-gasket-wireless-mechanical-keyboard', cats: ['Pre-built', 'Mouse', 'Mousepad', 'Glass-pad'] },
  { name: 'GenesisPC', url: 'https://www.genesispc.in/', cats: ['Pre-built', 'Hall Effect', 'Keycaps', 'Switches', 'Parts/Tools', 'Accessories', 'Mouse', 'Mousepad', 'Deskpad', 'Glass-pad'] },
  { name: 'HardwareCorpus', url: 'https://hardwarecorpus.in/', cats: ['Pre-built', 'Hall Effect', 'Barebone', 'Alice', 'Keycaps', 'Accessories', 'Mouse', 'Deskpad', 'PC Parts'], warning: true, warning_message: 'Community reports mention delays and slow shipping.' },
  { name: 'KeebsMod', url: 'https://www.keebsmod.com/', cats: ['Pre-built', 'Barebone', 'Keycaps', 'Switches', 'Parts/Tools', 'Accessories'] },
  { name: 'Keychron India', url: 'https://keychron.in/', cats: ['Pre-built', 'Barebone', 'Keycaps', 'Switches', 'Parts/Tools', 'Accessories'] },
  { name: 'Keyora', url: 'https://keyora.store/', cats: ['Keycaps', 'Switches', 'Parts/Tools', 'Accessories', 'Deskpad'] },
  { name: 'Loadout', url: 'https://www.loadout.co.in/', cats: ['Pre-built', 'Hall Effect', 'Barebone', 'Keycaps', 'Switches', 'Accessories', 'Mouse', 'Mousepad', 'Deskpad'] },
  { name: 'Meckeys', url: 'https://www.meckeys.com/', cats: ['Pre-built', 'Hall Effect', 'Barebone', 'Keycaps', 'Switches', 'Parts/Tools', 'Accessories', 'Mouse', 'Mousepad', 'Deskpad'] },
  { name: 'Moskeys', url: 'https://moskeys.com/', cats: ['Pre-built', 'Switches', 'Mouse'] },
  { name: 'NeoMacro', url: 'https://neomacro.in/', cats: ['Pre-built', 'Hall Effect', 'Barebone', 'Split', 'Keycaps', 'Switches', 'Parts/Tools', 'Accessories', 'Mouse', 'Deskpad', 'Glass-pad', 'Mousepad'] },
  { name: 'NMPC', url: 'https://nmpc.in/', cats: ['Pre-built', 'Hall Effect', 'Mouse', 'Deskpad'] },
  { name: 'RyuGear', url: 'https://ryugear.in/', cats: ['Pre-built', 'Hall Effect', 'Keycaps', 'Accessories', 'Mouse', 'Mousepad', 'Glass-pad'] },
  { name: 'StacksKB', url: 'https://stackskb.com/', cats: ['Pre-built', 'Barebone', 'Split', 'Keycaps', 'Switches', 'Parts/Tools', 'Accessories'] },
  { name: 'Thock Shop', url: 'https://thethockshop.com/', cats: ['Pre-built', 'Alice', 'Switches', 'Accessories', 'Mouse'] },
  { name: 'URX', url: 'https://urx.co.in/', cats: ['Pre-built', 'Hall Effect', 'Low-Profile', 'Mouse'] },
  { name: 'Waimers', url: 'https://waimers.in/', cats: ['Hall Effect', 'Accessories', 'Switches', 'Mouse', 'Glass-pad'] },
  { name: 'Xtro', url: 'https://xtro.gg/', cats: ['Pre-built', 'Barebone', 'Hall Effect', 'Accessories', 'Mouse', 'PC Parts', 'Glass-pad'] },
];

export const DIY_BUILDERS = [
  { name: 'defaultwiring', url: 'https://www.instagram.com/defaultwiring', icon: '🔌', col: 'var(--text)', desc: 'Handcrafted cables with you having complete creative freedom.', tag: 'CABLES', warning: false, warning_message: '', phone: '', whatsapp: '', discord: '' },
  { name: 'erikaSKOOL', url: 'https://docs.google.com/document/d/1xcAW0eiM7f9JBxXdp6SL5fg15mM-IWZvxRduPwHza0M/edit?tab=t.0', icon: '🛠', col: 'var(--text)', desc: 'Keyboard repairs, soldering, desoldering, 3D design, CAD work, and 3D printing services.', tag: 'Build & Repair', warning: false, warning_message: '', phone: '', whatsapp: '', discord: 'https://discord.com/users/854359832525275206' },
  { name: 'Friction', url: 'https://docs.google.com/document/d/e/2PACX-1vQlbWhsI1WGu0wSb3qZKR7EIvoXzU4ZlMLlk3Xd4xf6R7GtLIC9vGeFDsoyMzWxa2y7p9L-60B5mtpP/pub', icon: '🛠', col: 'var(--orange)', desc: 'Work on PCBs, keyboards, and small electronics projects as a hobby.', tag: 'Build & Repair', warning: false, warning_message: '', phone: '', reddit: 'https://www.reddit.com/user/_FrictioN_/submitted/', discord: 'https://discord.com/users/427375238674644992', telegram: 'https://t.me/squidward_07', github: 'https://github.com/friction07' },
  { name: 'Hawtkeys', url: 'https://hawtkeys.com/', icon: '🔧', col: 'var(--orange)', desc: 'Specialized Macropads components for your workspace with QMK/VIA compatibility.', tag: 'Macropads', warning: false, warning_message: '', phone: '', whatsapp: '', discord: '' },
  { name: 'Keebforge', url: 'https://www.keebforge.in/', icon: '🛠', col: 'var(--text)', desc: 'Electronics Engineer & Custom Keyboard Modder', tag: 'Build & Repair', warning: false, warning_message: '', phone: '', whatsapp: '', discord: '' },
  { name: 'LVL3', url: 'https://lvl3.diy/', icon: '⚗', col: 'var(--blue)', desc: 'split|58-columnar-key|wireless|made-to-order|preassembled keyboard kit.', tag: 'SPLIT-BOARD', warning: false, warning_message: 'Currently not taking orders', phone: '', whatsapp: '', discord: '' },
  { name: 'Parix', url: 'https://parix.in/', icon: '⚗', col: 'var(--purple)', desc: 'Hand-assembled split keyboards for developers. Built to order with open source firmware.', tag: 'Split-Keybs', warning: false, warning_message: '', phone: '', whatsapp: '', discord: '' },
  { name: 'MOOn', url: 'https://docs.google.com/document/d/e/2PACX-1vTgzL4WWdAgfIhWp30W5CC2cd7HodrE8Pbhl9rsO7SG3YdN6rYHc-2U0nX4amCVsrrW7sGc3XoDJWWP/pub', icon: '🛠', col: 'var(--green)', desc: 'Hand-assembled split keyboards and build, repair, soldering, and 3D printing services!', tag: 'Build & Repair', warning: false, warning_message: '', phone: '', whatsapp: '9409513496', discord: 'https://discord.com/users/294624472336564226' },
  { name: 'MrSnek', url: 'https://mrsnek.com/', icon: '🌀', col: 'var(--green)', desc: 'Design, prototype, and craft our products in-house, with full creative control and attention to detail.', tag: 'KEYCAPS', warning: false, warning_message: '', phone: '', whatsapp: '', discord: '' },
  { name: 'ThockFactory', url: 'https://thockfactory.com/in', icon: '🌀', col: 'var(--green)', desc: 'Custom keycaps, designed by you and your own custom keycaps using our intuitive online configurator.', tag: 'KEYCAPS', warning: false, warning_message: '', phone: '', whatsapp: '', discord: '' },
];

export const BRANDS = [
  { name: 'Ajazz', url: 'https://www.ajazz.in/', spec: 'Ajazz Official India Store', col: 'var(--purple)', risk: false, warning_message: '' },
  { name: 'Ant Esports', url: 'https://antesports.com/', spec: 'Budget PC Hardware', col: 'var(--green)', risk: false, warning_message: '' },
  { name: 'AULA India', url: 'https://aulaindia.com/', spec: 'Mechanical Boards', col: 'var(--blue)', risk: false, warning_message: '' },
  { name: 'Binepad', url: 'https://www.binepad.in/', spec: 'Macropads & Accessories', col: 'var(--pink)', risk: false, warning_message: '' },
  { name: 'Cosmic Byte', url: 'https://www.thecosmicbyte.com/', spec: 'Entry-level Gear', col: 'var(--cyan)', risk: false, warning_message: '' },
  { name: 'Cybeart', url: 'https://cybeart.in/', spec: 'Mid+ range Gaming Accessories', col: 'var(--green)', risk: false, warning_message: '' },
  { name: 'Dawg', url: 'https://dawgflex.com/', spec: 'Mid+ range Gaming Accessories', col: 'var(--green)', risk: false, warning_message: '' },
  { name: 'EvoFox', url: 'https://www.amkette.com/pages/evofox', spec: 'Gaming Accessories', col: 'var(--orange)', risk: false, warning_message: '' },
  { name: 'Fingers', url: 'https://www.fingers.co.in/', spec: 'Budget tech Accessories', col: 'var(--orange)', risk: false, warning_message: '' },
  { name: 'Kreo Tech', url: 'https://kreo-tech.com/', spec: 'Budget Peripherals', col: 'var(--red)', risk: false, warning_message: '' },
  { name: 'Portronics', url: 'https://www.portronics.com/', spec: 'Portable Tech', col: 'var(--red)', risk: false, warning_message: '' },
  { name: 'Redragon', url: 'https://www.redragon.in/', spec: 'Budget Performance', col: 'var(--red)', risk: false, warning_message: '' },
  { name: 'TVS Electronics', url: 'https://www.tvselectronics.in/', spec: 'Classic Mechanicals', col: 'var(--yellow)', risk: false, warning_message: '' },
  { name: 'UnCtrl', url: 'https://www.gameunctrl.com/', spec: 'Gaming Accessories', col: 'var(--red)', risk: false, warning_message: '' },
  { name: 'Varmilo', url: 'https://varmiloindia.com/', spec: 'Premium Mechanical Keyboards', col: 'var(--purple)', risk: false, warning_message: '' },
  { name: 'Xtro', url: 'https://xtro.gg/', spec: 'Indian Brand That Cares', col: 'var(--purple)', risk: false, warning_message: '' },
];
