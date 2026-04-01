// ---------------------------------------------------------------------------
// Parts Catalog — data types, catalog data, and query helpers
// ---------------------------------------------------------------------------

export type PartCategory =
  | 'drive-motion'
  | 'pneumatics-hydraulics'
  | 'electrical-controls'
  | 'wear-consumables'
  | 'structural-mechanical'
  | 'packaging-specific'

export type MachineType =
  | 'cnc'
  | 'press'
  | 'welding'
  | 'compressor'
  | 'pump'
  | 'generator'
  | 'handling'
  | 'hvac'

export type PartAvailability = 'in-stock' | 'limited' | 'order-only'

export interface SparePart {
  id: string
  slug: string
  partNumber: string
  name: string
  description: string
  category: PartCategory
  machineTypes: MachineType[]
  specs: Record<string, string>
  availability: PartAvailability
  leadTime: string
  tags: string[]
}

// ---------------------------------------------------------------------------
// Display metadata
// ---------------------------------------------------------------------------

export interface PartCategoryMeta {
  label: string
  description: string
  count: string
}

export const PART_CATEGORY_META: Record<PartCategory, PartCategoryMeta> = {
  'drive-motion': {
    label: 'Drive & Motion',
    description: 'Gearboxes, motors, bearings, couplings, chains, sprockets, and drive belts.',
    count: '2,400+ SKUs',
  },
  'pneumatics-hydraulics': {
    label: 'Pneumatics & Hydraulics',
    description: 'Cylinders, valves, manifolds, pumps, hoses, seals, and fittings.',
    count: '1,800+ SKUs',
  },
  'electrical-controls': {
    label: 'Electrical & Controls',
    description: 'PLCs, HMIs, sensors, relays, contactors, drives, and cable assemblies.',
    count: '3,200+ SKUs',
  },
  'wear-consumables': {
    label: 'Wear Parts & Consumables',
    description: 'Cutting tools, seals, filters, gaskets, belts, and contact parts.',
    count: '4,500+ SKUs',
  },
  'structural-mechanical': {
    label: 'Structural & Mechanical',
    description: 'Linear guides, conveyor components, levelling feet, and machine hardware.',
    count: '1,100+ SKUs',
  },
  'packaging-specific': {
    label: 'Packaging-Specific',
    description: 'Change-parts, forming tubes, sealing jaws, filling heads, and format sets.',
    count: '900+ SKUs',
  },
}

export const MACHINE_TYPE_LABELS: Record<MachineType, string> = {
  cnc: 'CNC & Machine Tools',
  press: 'Presses & Stamping',
  welding: 'Welding Equipment',
  compressor: 'Compressors & Air',
  pump: 'Pumps & Fluid',
  generator: 'Generators & Power',
  handling: 'Material Handling',
  hvac: 'HVAC & Cooling',
}

export const AVAILABILITY_LABELS: Record<PartAvailability, string> = {
  'in-stock': 'In Stock',
  limited: 'Limited Stock',
  'order-only': 'Order Only',
}

// ---------------------------------------------------------------------------
// Catalog data
// ---------------------------------------------------------------------------

export const PARTS_CATALOG: SparePart[] = [
  // ── Drive & Motion ────────────────────────────────────────────────────────
  {
    id: '1',
    slug: 'helical-gearbox-hg-750',
    partNumber: 'TRX-DM-001',
    name: 'Helical Inline Gearbox HG-750',
    description:
      'Heavy-duty helical inline gearbox with precision-ground gears for low noise and high efficiency. Suitable for continuous-duty industrial drives.',
    category: 'drive-motion',
    machineTypes: ['cnc', 'handling', 'press'],
    specs: {
      Ratio: '7.5:1',
      'Input Power': 'Up to 22 kW',
      'Output Torque': '750 Nm',
      Mounting: 'Foot / flange',
      'IP Rating': 'IP65',
      Lubrication: 'Synthetic oil',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['gearbox', 'drive', 'motion', 'helical'],
  },
  {
    id: '2',
    slug: 'angular-contact-bearing-7208',
    partNumber: 'TRX-DM-002',
    name: 'Angular Contact Ball Bearing 7208',
    description:
      'Single-row angular contact bearing designed to handle combined radial and axial loads. Precision C3 clearance for high-speed applications.',
    category: 'drive-motion',
    machineTypes: ['cnc', 'pump', 'compressor'],
    specs: {
      Bore: '40 mm',
      OD: '80 mm',
      Width: '18 mm',
      'Dynamic Load': '32 kN',
      'Speed Limit': '12,000 rpm',
      Clearance: 'C3',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['bearing', 'ball bearing', 'angular contact'],
  },
  {
    id: '3',
    slug: 'timing-belt-htd-1400',
    partNumber: 'TRX-DM-003',
    name: 'HTD Timing Belt 1400-8M-30',
    description:
      'High-torque drive timing belt for CNC machine axes and conveyor drives. Fibreglass tension cord for minimal stretch under load.',
    category: 'drive-motion',
    machineTypes: ['cnc', 'handling'],
    specs: {
      Length: '1400 mm',
      Pitch: '8 mm (HTD)',
      Width: '30 mm',
      Teeth: '175',
      Material: 'Neoprene / fibreglass',
      'Temp Range': '-30°C to +80°C',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['timing belt', 'drive belt', 'HTD', 'cnc'],
  },
  {
    id: '4',
    slug: 'shaft-coupling-jaw-60',
    partNumber: 'TRX-DM-004',
    name: 'Jaw Shaft Coupling 60 Nm',
    description:
      'Flexible jaw coupling with polyurethane spider insert. Compensates for angular and parallel misalignment while damping vibration between shafts.',
    category: 'drive-motion',
    machineTypes: ['cnc', 'pump', 'compressor'],
    specs: {
      Torque: '60 Nm',
      'Max Speed': '5,000 rpm',
      'Bore Range': '12–28 mm',
      Spider: '98 Shore A polyurethane',
      Material: 'GG-25 cast iron',
      Misalignment: '±1° angular',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['coupling', 'jaw coupling', 'flexible coupling'],
  },
  {
    id: '5',
    slug: 'taper-roller-bearing-30213',
    partNumber: 'TRX-DM-005',
    name: 'Taper Roller Bearing 30213',
    description:
      'Single-row taper roller bearing for press spindles and industrial gearboxes. High radial and axial load capacity with adjustable preload.',
    category: 'drive-motion',
    machineTypes: ['press', 'cnc', 'handling'],
    specs: {
      Bore: '65 mm',
      OD: '120 mm',
      Width: '23 mm',
      'Dynamic Load': '95 kN',
      'Contact Angle': '13.1°',
      Clearance: 'Standard',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['taper roller bearing', 'bearing', 'press bearing'],
  },
  {
    id: '6',
    slug: 'v-belt-spb-1500',
    partNumber: 'TRX-DM-006',
    name: 'V-Belt SPB 1500',
    description:
      'Narrow-section V-belt for high-power industrial drives. Raw edge fabric construction for maximum efficiency in pump and compressor drives.',
    category: 'drive-motion',
    machineTypes: ['pump', 'compressor', 'generator', 'hvac'],
    specs: {
      Section: 'SPB (17 mm wide)',
      'Length (Lp)': '1500 mm',
      Angle: '40°',
      Construction: 'Raw edge',
      'Temp Range': '-30°C to +70°C',
      Standard: 'ISO 4184',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['v-belt', 'belt', 'SPB', 'drive belt', 'narrow belt'],
  },
  {
    id: '7',
    slug: 'scroll-compressor-hvac-5hp',
    partNumber: 'TRX-DM-007',
    name: 'Scroll Compressor — HVAC 5 HP',
    description:
      'Hermetic scroll compressor for industrial HVAC and refrigeration systems. EVI (enhanced vapour injection) for high heating COP.',
    category: 'drive-motion',
    machineTypes: ['hvac', 'compressor'],
    specs: {
      Power: '5 HP (3.73 kW)',
      Refrigerant: 'R-410A / R-32',
      Displacement: '28.2 cc/rev',
      'Max Discharge': '130 bar',
      Technology: 'EVI scroll',
      Voltage: '208–230V 60 Hz',
    },
    availability: 'order-only',
    leadTime: '5–7 business days',
    tags: ['scroll compressor', 'HVAC', 'refrigeration', 'compressor'],
  },

  // ── Pneumatics & Hydraulics ───────────────────────────────────────────────
  {
    id: '8',
    slug: 'double-acting-cylinder-da-80',
    partNumber: 'TRX-PH-001',
    name: 'Double-Acting Pneumatic Cylinder DA-80/200',
    description:
      'ISO 15552-compliant double-acting cylinder for press and clamping applications. Corrosion-resistant aluminium barrel with hard-chrome piston rod.',
    category: 'pneumatics-hydraulics',
    machineTypes: ['press', 'handling'],
    specs: {
      Bore: '80 mm',
      Stroke: '200 mm',
      'Pressure Range': '0.1–10 bar',
      'Port Size': 'G1/4',
      'Temp Range': '-20°C to +80°C',
      Standard: 'ISO 15552',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['cylinder', 'pneumatic', 'actuator', 'ISO 15552'],
  },
  {
    id: '9',
    slug: 'solenoid-valve-5-2-g14',
    partNumber: 'TRX-PH-002',
    name: '5/2-Way Solenoid Valve G1/4 24V DC',
    description:
      'Single-solenoid spring-return directional control valve. Fast response time and low power consumption for high-cycle pneumatic circuits.',
    category: 'pneumatics-hydraulics',
    machineTypes: ['press', 'cnc', 'handling'],
    specs: {
      Configuration: '5/2-way',
      'Port Size': 'G1/4',
      Voltage: '24V DC',
      Power: '2.0 W',
      'Response Time': '<15 ms',
      'Flow (Cv)': '0.7',
      'IP Rating': 'IP65',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['solenoid valve', 'directional control', 'pneumatic', '5/2'],
  },
  {
    id: '10',
    slug: 'hydraulic-seal-kit-75mm',
    partNumber: 'TRX-PH-003',
    name: 'Hydraulic Cylinder Seal Kit 75 mm Bore',
    description:
      'Complete seal replacement kit for hydraulic cylinders with 75 mm bore. Polyurethane piston seal + wiper + O-ring set rated to 350 bar.',
    category: 'pneumatics-hydraulics',
    machineTypes: ['press', 'handling', 'cnc'],
    specs: {
      Bore: '75 mm',
      'Max Pressure': '350 bar',
      Material: 'Polyurethane / NBR',
      'Temp Range': '-30°C to +100°C',
      Contents: 'Piston seal, rod seal, wiper, backup rings',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['seal kit', 'hydraulic', 'o-ring', 'cylinder seal'],
  },
  {
    id: '11',
    slug: 'filter-regulator-combo-g12',
    partNumber: 'TRX-PH-004',
    name: 'Filter-Regulator Combination G1/2',
    description:
      'Combined compressed-air filter and pressure regulator. 40 μm polycarbonate bowl with manual drain. Supplied with pressure gauge.',
    category: 'pneumatics-hydraulics',
    machineTypes: ['press', 'cnc', 'compressor', 'welding'],
    specs: {
      'Port Size': 'G1/2',
      Filtration: '40 μm',
      'Flow Rate': '3,800 L/min',
      'Pressure Range': '0.5–10 bar',
      'Bowl Material': 'Polycarbonate',
      Drain: 'Manual',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['filter regulator', 'FRL', 'compressed air', 'pneumatic'],
  },

  // ── Electrical & Controls ─────────────────────────────────────────────────
  {
    id: '12',
    slug: 'plc-cpu-s7-1200-1214c',
    partNumber: 'TRX-EC-001',
    name: 'PLC CPU Module S7-1200 1214C DC/DC/DC',
    description:
      'Compact PLC CPU for industrial automation. 14 DI (24V DC), 10 DO, 2 AI. Onboard Profinet IRT communication. Drop-in compatible with Siemens S7-1200 series.',
    category: 'electrical-controls',
    machineTypes: ['cnc', 'press', 'handling', 'pump', 'compressor', 'hvac'],
    specs: {
      DI: '14 × 24V DC',
      DO: '10 × 24V DC',
      AI: '2 × 0–10V',
      'Work Memory': '100 KB',
      Communication: 'Profinet IRT',
      Supply: '24V DC',
      'IP Rating': 'IP20',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['PLC', 'Siemens', 'S7-1200', 'controller', 'CPU'],
  },
  {
    id: '13',
    slug: 'vfd-3phase-7-5kw',
    partNumber: 'TRX-EC-002',
    name: 'Variable Frequency Drive 7.5 kW 3-Phase',
    description:
      'General-purpose VFD for three-phase motors. V/f and sensorless vector control, built-in EMC filter, and brake chopper for pump and fan applications.',
    category: 'electrical-controls',
    machineTypes: ['pump', 'compressor', 'hvac', 'handling', 'cnc'],
    specs: {
      Power: '7.5 kW',
      Supply: '380–480V 3-phase',
      'Output Frequency': '0–400 Hz',
      Control: 'V/f + sensorless vector',
      Comms: 'Modbus RTU',
      'IP Rating': 'IP20',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['VFD', 'inverter', 'variable speed', 'motor drive', 'frequency drive'],
  },
  {
    id: '14',
    slug: 'inductive-proximity-sensor-m18',
    partNumber: 'TRX-EC-003',
    name: 'Inductive Proximity Sensor M18 × 8 mm PNP',
    description:
      'Flush-mount inductive proximity sensor for metal target detection. Shielded face allows flush installation in tight fixture housings.',
    category: 'electrical-controls',
    machineTypes: ['cnc', 'press', 'handling', 'welding'],
    specs: {
      Thread: 'M18',
      'Sensing Distance': '8 mm',
      Output: 'PNP NO',
      Supply: '10–30V DC',
      Current: '200 mA max',
      'IP Rating': 'IP67',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['proximity sensor', 'inductive', 'sensor', 'M18'],
  },
  {
    id: '15',
    slug: 'safety-relay-24v-2no',
    partNumber: 'TRX-EC-004',
    name: 'Safety Relay Module 24V DC — PLd / SIL 2',
    description:
      'Certified safety relay for emergency-stop and light-curtain circuits. PLd / Category 3 rated with manual monitored reset.',
    category: 'electrical-controls',
    machineTypes: ['cnc', 'press', 'welding', 'handling'],
    specs: {
      Supply: '24V DC',
      Contacts: '2 × NO + 1 × NC',
      'Safety Level': 'PLd / Category 3',
      Standard: 'IEC 62061 SIL 2',
      'Response Time': '<20 ms',
      Mounting: 'DIN rail',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['safety relay', 'emergency stop', 'safety circuit', 'PLd'],
  },
  {
    id: '16',
    slug: 'servo-motor-400w-ethercat',
    partNumber: 'TRX-EC-005',
    name: 'Servo Motor + Drive Set 400 W EtherCAT',
    description:
      'Compact AC servo motor and drive set for CNC axis control. 17-bit absolute encoder, EtherCAT communication, and safe-torque-off (STO) support.',
    category: 'electrical-controls',
    machineTypes: ['cnc'],
    specs: {
      Power: '400 W',
      Torque: '1.27 Nm rated',
      Speed: '3,000 rpm',
      Encoder: '17-bit absolute',
      Communication: 'EtherCAT',
      Safety: 'STO (SIL 2)',
      Flange: '60 mm (IEC)',
    },
    availability: 'limited',
    leadTime: '3–5 business days',
    tags: ['servo motor', 'servo drive', 'EtherCAT', 'CNC axis'],
  },
  {
    id: '17',
    slug: 'rotary-encoder-1024ppr',
    partNumber: 'TRX-EC-006',
    name: 'Incremental Rotary Encoder 1024 PPR',
    description:
      'Solid shaft incremental encoder with push-pull 5–24V output. Suitable for CNC feedback, conveyor speed control, and winding applications.',
    category: 'electrical-controls',
    machineTypes: ['cnc', 'handling', 'press'],
    specs: {
      Resolution: '1024 PPR',
      Shaft: '10 mm solid',
      Supply: '5–24V DC',
      Output: 'Push-pull AB + Z',
      'Max Speed': '6,000 rpm',
      'IP Rating': 'IP65',
      Housing: '58 mm flange',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['encoder', 'rotary encoder', 'incremental encoder', 'feedback'],
  },
  {
    id: '18',
    slug: 'generator-avr-sx460',
    partNumber: 'TRX-EC-007',
    name: 'AVR Module for Generator — SX460',
    description:
      'Automatic voltage regulator for Stamford-type alternators. Maintains output voltage ±1% from no-load to full-load. Direct SX460 replacement.',
    category: 'electrical-controls',
    machineTypes: ['generator'],
    specs: {
      Regulation: '±1% (no load to full load)',
      Input: '110–120V / 220–240V AC',
      Sensing: '190–264V AC',
      Excitation: 'Up to 90V DC / 2A',
      Stability: '<0.5% variation',
      Compatible: 'Stamford type alternators',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['AVR', 'voltage regulator', 'generator', 'alternator', 'SX460'],
  },

  // ── Wear Parts & Consumables ──────────────────────────────────────────────
  {
    id: '19',
    slug: 'carbide-end-mill-10mm-4f',
    partNumber: 'TRX-WC-001',
    name: 'Solid Carbide End Mill 10 mm 4-Flute AlTiN',
    description:
      'AlTiN-coated solid carbide end mill for dry machining of steel and cast iron. Square end geometry for shoulder milling and slotting.',
    category: 'wear-consumables',
    machineTypes: ['cnc'],
    specs: {
      Diameter: '10 mm',
      Shank: '10 mm',
      Flutes: '4',
      'Length (LOC)': '22 mm',
      'Overall Length': '72 mm',
      Coating: 'AlTiN',
      Material: 'Micro-grain carbide',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['end mill', 'cutting tool', 'carbide', 'CNC tooling'],
  },
  {
    id: '20',
    slug: 'mig-contact-tips-10mm-pack10',
    partNumber: 'TRX-WC-002',
    name: 'MIG Contact Tips 1.0 mm MB-15 (Pack of 10)',
    description:
      'Copper alloy contact tips for MB-15 MIG torches. Precision bore ensures consistent wire feed and minimises tip burnback.',
    category: 'wear-consumables',
    machineTypes: ['welding'],
    specs: {
      Torch: 'MB-15',
      'Wire Diameter': '1.0 mm',
      Thread: 'M6',
      Material: 'Electrolytic copper',
      'Pack Size': '10 pcs',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['contact tip', 'MIG', 'welding consumable', 'MB-15'],
  },
  {
    id: '21',
    slug: 'air-filter-element-cf200',
    partNumber: 'TRX-WC-003',
    name: 'Coalescing Filter Element CF-200',
    description:
      'Replacement coalescing filter cartridge for CF-200 air preparation units. 0.01 μm filtration efficiency for oil mist and water aerosols.',
    category: 'wear-consumables',
    machineTypes: ['compressor', 'press', 'cnc', 'welding'],
    specs: {
      Filtration: '0.01 μm',
      Type: 'Coalescing',
      'Max Pressure': '16 bar',
      'Max Temp': '+60°C',
      'Max Flow': '2,000 L/min',
      'Replacement Interval': '2,000 hours',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['filter element', 'air filter', 'coalescing', 'compressor'],
  },
  {
    id: '22',
    slug: 'mechanical-seal-pump-30mm',
    partNumber: 'TRX-WC-004',
    name: 'Mechanical Shaft Seal — Pump 30 mm',
    description:
      'Single spring mechanical seal for centrifugal and process pumps. Carbon/ceramic faces, NBR elastomers. Drop-in for most end-suction pump designs.',
    category: 'wear-consumables',
    machineTypes: ['pump'],
    specs: {
      'Shaft Diameter': '30 mm',
      'Face Material': 'Carbon / Ceramic',
      Elastomers: 'NBR',
      'Max Pressure': '12 bar',
      'Max Speed': '3,500 rpm',
      'Temp Range': '-20°C to +120°C',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['mechanical seal', 'pump seal', 'shaft seal'],
  },
  {
    id: '23',
    slug: 'centrifugal-pump-impeller-150',
    partNumber: 'TRX-WC-005',
    name: 'Centrifugal Pump Impeller — CI 150 mm',
    description:
      'Cast iron closed impeller for end-suction centrifugal pumps. Hydraulically balanced to reduce vibration. Suits 150 mm nominal suction pumps.',
    category: 'wear-consumables',
    machineTypes: ['pump'],
    specs: {
      Diameter: '150 mm',
      Material: 'GG-20 cast iron',
      Bore: '28 mm (H7)',
      Key: '8 × 7 mm',
      Vanes: '5 closed vanes',
      'Max Speed': '2,900 rpm',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['impeller', 'pump impeller', 'centrifugal pump', 'wear part'],
  },
  {
    id: '24',
    slug: 'cooling-tower-fill-media-pvc',
    partNumber: 'TRX-WC-006',
    name: 'Cooling Tower Fill Media — PVC Cross-Flow',
    description:
      'Structured PVC film fill for cross-flow cooling towers. High thermal efficiency design with resistance to algae and scaling.',
    category: 'wear-consumables',
    machineTypes: ['hvac'],
    specs: {
      Dimensions: '300 × 600 × 200 mm',
      Material: 'PVC (UV stabilised)',
      'Cell Spacing': '19 mm',
      'Max Temp': '+60°C',
      'Fire Rating': 'V-0 (UL 94)',
      'Specific Surface': '150 m²/m³',
    },
    availability: 'order-only',
    leadTime: '5–7 business days',
    tags: ['cooling tower fill', 'fill media', 'cooling tower', 'HVAC'],
  },

  // ── Structural & Mechanical ───────────────────────────────────────────────
  {
    id: '25',
    slug: 'steel-conveyor-roller-51x600',
    partNumber: 'TRX-SM-001',
    name: 'Steel Conveyor Roller 51 mm × 600 mm',
    description:
      'Precision-formed steel conveyor roller with sealed bearings for belt and gravity conveyors. Zinc-plated shell for corrosion resistance.',
    category: 'structural-mechanical',
    machineTypes: ['handling'],
    specs: {
      'Shell Diameter': '51 mm',
      Length: '600 mm',
      Shaft: '20 mm fixed',
      Bearing: 'Sealed ball bearings',
      'Load Rating': '200 kg',
      'Shell Material': 'Zinc-plated steel',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['conveyor roller', 'roller', 'conveyor', 'idler roller'],
  },
  {
    id: '26',
    slug: 'linear-guide-rail-hgr20-600mm',
    partNumber: 'TRX-SM-002',
    name: 'Linear Guide Rail HGR20 × 600 mm',
    description:
      'Precision linear guide rail in alloy steel. Suits HGH/HGW carriages. Interchangeable with Hiwin HGR20. Accuracy Grade H.',
    category: 'structural-mechanical',
    machineTypes: ['cnc'],
    specs: {
      Width: '20 mm',
      Length: '600 mm',
      'Accuracy Grade': 'H (±0.030 mm)',
      Preload: 'ZO (no preload)',
      Lubrication: 'Grease',
      Material: 'Alloy steel (HRC 58–64)',
      Mounting: 'Side screw (M5)',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['linear guide', 'guide rail', 'HGR20', 'CNC rail'],
  },
  {
    id: '27',
    slug: 'anti-vibration-levelling-foot-m20',
    partNumber: 'TRX-SM-003',
    name: 'Anti-Vibration Levelling Foot M20',
    description:
      'Adjustable machine levelling foot with anti-vibration rubber pad. Zinc-die housing rated to 2,500 kg per foot for heavy machinery.',
    category: 'structural-mechanical',
    machineTypes: ['cnc', 'press', 'compressor', 'pump'],
    specs: {
      Thread: 'M20 × 1.5',
      'Adjustment Range': '±25 mm',
      'Max Load': '2,500 kg / foot',
      'Pad Material': 'Anti-vibration rubber',
      'Housing Material': 'Zinc-die cast',
      'Base Diameter': '80 mm',
    },
    availability: 'in-stock',
    leadTime: 'Same day',
    tags: ['levelling foot', 'machine foot', 'vibration isolation', 'anti-vibration'],
  },

  // ── Packaging-Specific ────────────────────────────────────────────────────
  {
    id: '28',
    slug: 'sealing-jaw-vffs-250mm',
    partNumber: 'TRX-PS-001',
    name: 'Transverse Sealing Jaw Assembly VFFS 250 mm',
    description:
      'Replacement transverse sealing jaw for VFFS machines with 250 mm film width. Teflon-coated heating jaw with integrated thermocouple.',
    category: 'packaging-specific',
    machineTypes: ['press'],
    specs: {
      'Film Width': '250 mm',
      'Jaw Material': 'Aluminium (anodised)',
      Coating: 'PTFE',
      Heater: '24V × 200W cartridge',
      Sensor: 'K-type thermocouple',
      'Temp Range': 'Up to 230°C',
    },
    availability: 'order-only',
    leadTime: '5–7 business days',
    tags: ['sealing jaw', 'VFFS', 'packaging', 'heat seal'],
  },
  {
    id: '29',
    slug: 'forming-tube-set-60mm-round',
    partNumber: 'TRX-PS-002',
    name: 'Forming Tube Set — 60 mm Round Pillow Pack',
    description:
      'Stainless steel forming tube set for VFFS machines producing 60 mm round pillow packs. Includes collar, tube, and mounting bracket.',
    category: 'packaging-specific',
    machineTypes: ['press'],
    specs: {
      Format: '60 mm round',
      Material: '304 stainless steel',
      'Surface Finish': '0.8 μm Ra (mirror)',
      Compatible: 'Most VFFS platforms',
      Contents: 'Collar, tube, mounting bracket',
    },
    availability: 'order-only',
    leadTime: '5–7 business days',
    tags: ['forming tube', 'change part', 'VFFS', 'format set'],
  },
  {
    id: '30',
    slug: 'auger-filler-head-40mm',
    partNumber: 'TRX-PS-003',
    name: 'Auger Filler Head — 40 mm Diameter',
    description:
      'Stainless steel auger for powder filling heads. High-pitch flight for fast, accurate fill weights of free-flowing powders. Electropolished finish.',
    category: 'packaging-specific',
    machineTypes: ['press'],
    specs: {
      'Auger Diameter': '40 mm',
      Pitch: '25 mm (high)',
      Material: '316L stainless steel',
      Surface: 'Electropolished',
      Product: 'Free-flowing powders',
      Tolerance: 'h6 shaft fit',
    },
    availability: 'order-only',
    leadTime: '7–10 business days',
    tags: ['auger', 'filling', 'packaging', 'auger filler'],
  },
]

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export function getPartBySlug(slug: string): SparePart | undefined {
  return PARTS_CATALOG.find((p) => p.slug === slug)
}

export function getRelatedParts(part: SparePart, limit = 4): SparePart[] {
  return PARTS_CATALOG.filter(
    (p) => p.id !== part.id && p.category === part.category,
  ).slice(0, limit)
}

export function searchParts(
  parts: SparePart[],
  query: string,
  category: PartCategory | 'all',
  machineType: MachineType | 'all',
): SparePart[] {
  let results = parts

  if (category !== 'all') {
    results = results.filter((p) => p.category === category)
  }

  if (machineType !== 'all') {
    results = results.filter((p) => p.machineTypes.includes(machineType as MachineType))
  }

  if (query.trim()) {
    const q = query.toLowerCase()
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }

  return results
}
