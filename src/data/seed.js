// Initial data from prototype
export const INITIAL_RESOURCES = [
  { id: 0, name: 'Gasoline-powered generator', owner: 'Mang Tonio · Purok 3', cat: 'power', dist: '120m', desc: '2000W gasoline generator, good for a few lights, a fan, and charging phones during an outage. Bring your own extension cord if you need more reach.' },
  { id: 1, name: '5-gallon drinking water', owner: 'Aling Nena · Purok 1', cat: 'water', dist: '240m', desc: 'Sealed 5-gallon container, refilled weekly. Can lend the container or just fill yours — just return it clean.' },
  { id: 2, name: 'Extension cord & power strip', owner: 'Kuya Jomar · Purok 3', cat: 'power', dist: '300m', desc: '10-meter heavy-duty extension cord with a 4-outlet power strip. Good for sharing one generator across two households.' },
  { id: 3, name: 'First aid kit (family size)', owner: 'Nurse Bel · Purok 2', cat: 'firstaid', dist: '410m', desc: 'Stocked kit with bandages, antiseptic, paracetamol, and a thermometer. Please let Nurse Bel know what you use so she can restock.' },
  { id: 4, name: 'Steel bolo & rope', owner: 'Mang Tonio · Purok 3', cat: 'tools', dist: '120m', desc: 'Useful for clearing fallen branches or securing loose roofing before a storm. Handle with care and return promptly.' },
  { id: 5, name: 'Multicab for evacuation trips', owner: 'Kap. Lira · Purok 1', cat: 'transport', dist: '500m', desc: 'Can help ferry elderly or families with small children to the evacuation center. Best to request a few hours before the storm peaks.' },
  { id: 6, name: 'Rechargeable flashlights (x3)', owner: 'Aling Nena · Purok 1', cat: 'power', dist: '240m', desc: 'Three USB-rechargeable flashlights, fully charged. Good for a family during a brownout.' },
  { id: 7, name: 'Water container drums', owner: 'Mang Ador · Purok 4', cat: 'water', dist: '650m', desc: 'Two empty 20-liter drums for stocking up on water before the storm arrives.' },
];

export const INITIAL_EVACUATION_CENTERS = [
  { name: 'San Isidro Elementary School', addr: '0.6 km away · Purok 2', distLabel: '0.6 km', cap: 210, max: 400, amenities: [{ name: 'Drinking water station', status: 'Available' }, { name: 'First aid / medical', status: 'Available' }, { name: 'Generator power', status: 'Available' }] },
  { name: 'Purok 4 Covered Court', addr: '1.2 km away · Purok 4', distLabel: '1.2 km', cap: 90, max: 150, amenities: [{ name: 'Drinking water station', status: 'Available' }, { name: 'First aid / medical', status: 'Limited' }, { name: 'Generator power', status: 'Unavailable' }] },
];

// Seed announcements shown to every household alongside locally posted ones.
export const INITIAL_ANNOUNCEMENTS = [
  { who: 'Kagawad Reyes', time: '25 min ago', text: 'Evacuation center at San Isidro Elementary is now open. Bring your family ID and essentials.', color: 'danger' },
  { who: 'Brgy. Captain Lira', time: '2 hr ago', text: 'Free rubber boots and candles available at the covered court while supplies last.', color: 'accent' },
  { who: 'Kagawad Reyes', time: 'Yesterday', text: 'Please clear drainage canals near your homes before Friday. Bagyo is expected to strengthen over the weekend.', color: 'safe' },
];

export const INITIAL_HOUSEHOLDS = [
  'MD', 'TN', 'JR', 'AB', 'CP', 'LM', 'FS', 'GV', 'KP', 'RD', 'VN', 'ES', 'WQ', 'HY', 'ZL', 'OC'
].map((h, i) => ({ initials: h, id: 140 + i, status: (i === 3 || i === 9) ? 'help' : 'safe' }));

export const INITIAL_PUROKS = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4'];

export const INITIAL_PENDING_OFFICIALS = [
  { id: 'p1', name: 'Ador Santos', position: 'Barangay Tanod', purok: 'Purok 4', status: 'pending' },
  { id: 'p2', name: 'Liza Cruz', position: 'SK Chairperson', purok: 'Purok 2', status: 'pending' },
];
