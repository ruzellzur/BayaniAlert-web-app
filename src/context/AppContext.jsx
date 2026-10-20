import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

// Position permissions from prototype
const POSITION_PERMS = {
  'Barangay Captain': { announce: true, evac: true, rescue: false },
  'Kagawad': { announce: true, evac: true, rescue: false },
  'SK Chairperson': { announce: true, evac: false, rescue: false },
  'Barangay Tanod': { announce: false, evac: false, rescue: true },
  'BDRRM Officer': { announce: true, evac: true, rescue: true },
  'Rescue/Response Team': { announce: false, evac: false, rescue: true },
};

function permsFor(position) {
  return POSITION_PERMS[position] || { announce: true, evac: true, rescue: false };
}

// Initial data from prototype
const INITIAL_RESOURCES = [
  { id: 0, name: 'Gasoline-powered generator', owner: 'Mang Tonio · Purok 3', cat: 'power', dist: '120m', desc: '2000W gasoline generator, good for a few lights, a fan, and charging phones during an outage. Bring your own extension cord if you need more reach.' },
  { id: 1, name: '5-gallon drinking water', owner: 'Aling Nena · Purok 1', cat: 'water', dist: '240m', desc: 'Sealed 5-gallon container, refilled weekly. Can lend the container or just fill yours — just return it clean.' },
  { id: 2, name: 'Extension cord & power strip', owner: 'Kuya Jomar · Purok 3', cat: 'power', dist: '300m', desc: '10-meter heavy-duty extension cord with a 4-outlet power strip. Good for sharing one generator across two households.' },
  { id: 3, name: 'First aid kit (family size)', owner: 'Nurse Bel · Purok 2', cat: 'firstaid', dist: '410m', desc: 'Stocked kit with bandages, antiseptic, paracetamol, and a thermometer. Please let Nurse Bel know what you use so she can restock.' },
  { id: 4, name: 'Steel bolo & rope', owner: 'Mang Tonio · Purok 3', cat: 'tools', dist: '120m', desc: 'Useful for clearing fallen branches or securing loose roofing before a storm. Handle with care and return promptly.' },
  { id: 5, name: 'Multicab for evacuation trips', owner: 'Kap. Lira · Purok 1', cat: 'transport', dist: '500m', desc: 'Can help ferry elderly or families with small children to the evacuation center. Best to request a few hours before the storm peaks.' },
  { id: 6, name: 'Rechargeable flashlights (x3)', owner: 'Aling Nena · Purok 1', cat: 'power', dist: '240m', desc: 'Three USB-rechargeable flashlights, fully charged. Good for a family during a brownout.' },
  { id: 7, name: 'Water container drums', owner: 'Mang Ador · Purok 4', cat: 'water', dist: '650m', desc: 'Two empty 20-liter drums for stocking up on water before the storm arrives.' },
];

const INITIAL_EVACUATION_CENTERS = [
  { name: 'San Isidro Elementary School', addr: '0.6 km away · Purok 2', distLabel: '0.6 km', cap: 210, max: 400, amenities: [{ name: 'Drinking water station', status: 'Available' }, { name: 'First aid / medical', status: 'Available' }, { name: 'Generator power', status: 'Available' }] },
  { name: 'Purok 4 Covered Court', addr: '1.2 km away · Purok 4', distLabel: '1.2 km', cap: 90, max: 150, amenities: [{ name: 'Drinking water station', status: 'Available' }, { name: 'First aid / medical', status: 'Limited' }, { name: 'Generator power', status: 'Unavailable' }] },
];

const INITIAL_ANNOUNCEMENTS = [
  { who: 'Kagawad Reyes', time: '25 min ago', text: 'Evacuation center at San Isidro Elementary is now open. Bring your family ID and essentials.', color: 'danger' },
  { who: 'Brgy. Captain Lira', time: '2 hr ago', text: 'Free rubber boots and candles available at the covered court while supplies last.', color: 'accent' },
  { who: 'Kagawad Reyes', time: 'Yesterday', text: 'Please clear drainage canals near your homes before Friday. Bagyo is expected to strengthen over the weekend.', color: 'safe' },
];

const INITIAL_HOUSEHOLDS = [
  'MD', 'TN', 'JR', 'AB', 'CP', 'LM', 'FS', 'GV', 'KP', 'RD', 'VN', 'ES', 'WQ', 'HY', 'ZL', 'OC'
].map((h, i) => ({ initials: h, id: 140 + i, status: (i === 3 || i === 9) ? 'help' : 'safe' }));

const INITIAL_PUROKS = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4'];

const INITIAL_PENDING_OFFICIALS = [
  { id: 'p1', name: 'Ador Santos', position: 'Barangay Tanod', purok: 'Purok 4', status: 'pending' },
  { id: 'p2', name: 'Liza Cruz', position: 'SK Chairperson', purok: 'Purok 2', status: 'pending' },
];

const INITIAL_REQUESTS = [
  { item: 'Gasoline-powered generator', owner: 'Mang Tonio · Purok 3', status: 'pending' },
  { item: 'First aid kit (family size)', owner: 'Nurse Bel · Purok 2', status: 'accepted' },
  { item: 'Multicab for evacuation trips', owner: 'Kap. Lira · Purok 1', status: 'declined' },
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [myStatus, setMyStatus] = useState(null);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [messages, setMessages] = useState({});
  const [evacCenters, setEvacCenters] = useState(INITIAL_EVACUATION_CENTERS);
  const [announcements, setAnnouncements] = useState([]);
  const [puroks, setPuroks] = useState(INITIAL_PUROKS);
  const [pendingOfficials, setPendingOfficials] = useState(INITIAL_PENDING_OFFICIALS);
  const [households, setHouseholds] = useState(INITIAL_HOUSEHOLDS);
  const [theme, setTheme] = useState('system');
  const [toast, setToast] = useState(null);

  // Load state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bayanialert_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) setUser(parsed.user);
        if (parsed.myStatus) setMyStatus(parsed.myStatus);
        if (parsed.resources) setResources(parsed.resources);
        if (parsed.requests) setRequests(parsed.requests);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.evacCenters) setEvacCenters(parsed.evacCenters);
        if (parsed.announcements) setAnnouncements(parsed.announcements);
        if (parsed.puroks) setPuroks(parsed.puroks);
        if (parsed.pendingOfficials) setPendingOfficials(parsed.pendingOfficials);
        if (parsed.households) setHouseholds(parsed.households);
        if (parsed.theme) setTheme(parsed.theme);
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bayanialert_state', JSON.stringify({
        user,
        myStatus,
        resources,
        requests,
        messages,
        evacCenters,
        announcements,
        puroks,
        pendingOfficials,
        households,
        theme,
      }));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [user, myStatus, resources, requests, messages, evacCenters, announcements, puroks, pendingOfficials, households, theme]);

  // Apply theme
  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const login = (userData) => {
    const user = {
      ...userData,
      permissions: userData.role === 'official' ? permsFor(userData.position) : null,
    };
    setUser(user);
    showToast(`Logged in as ${userData.role === 'official' ? userData.position : 'Resident'}`);
  };

  const logout = () => {
    setUser(null);
    setMyStatus(null);
    showToast('Logged out');
  };

  const setStatus = (status) => {
    setMyStatus(status);
    if (status === 'safe') {
      showToast("Thanks — you're marked safe");
    } else {
      showToast('Officials have been notified');
    }
  };

  const addResource = (resource) => {
    const newResource = {
      ...resource,
      id: 1000 + resources.length,
      dist: 'You',
    };
    setResources(prev => [...prev, newResource]);
    showToast('Item listed on the resource board');
  };

  const requestItem = (resourceId) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;
    const ownerName = resource.owner.split(' · ')[0];
    if (!requests.some(r => r.item === resource.name && r.owner === ownerName)) {
      setRequests(prev => [{
        item: resource.name,
        owner: resource.owner,
        status: 'pending',
      }, ...prev]);
    }
    showToast('Request sent to ' + ownerName);
  };

  const addAnnouncement = (text) => {
    const newAnnouncement = {
      who: user?.officialName || user?.name,
      time: 'Just now',
      text,
      color: 'accent',
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    showToast('Announcement posted');
  };

  const deleteAnnouncement = (index) => {
    setAnnouncements(prev => prev.filter((_, i) => i !== index));
    showToast('Announcement removed');
  };

  const updateEvacCenter = (index, updates) => {
    setEvacCenters(prev => prev.map((center, i) =>
      i === index ? { ...center, ...updates } : center
    ));
  };

  const approveOfficial = (id) => {
    setPendingOfficials(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'approved' } : p
    ));
    const official = pendingOfficials.find(p => p.id === id);
    showToast(official?.name + ' approved as official');
  };

  const declineOfficial = (id) => {
    setPendingOfficials(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'rejected' } : p
    ));
    const official = pendingOfficials.find(p => p.id === id);
    showToast(official?.name + ' rejected');
  };

  const addPurok = (name) => {
    if (!puroks.includes(name)) {
      setPuroks(prev => [...prev, name]);
      showToast(name + ' added');
    }
  };

  const removePurok = (index) => {
    const name = puroks[index];
    setPuroks(prev => prev.filter((_, i) => i !== index));
    showToast(name + ' removed');
  };

  const updateHouseholdStatus = (index, status) => {
    setHouseholds(prev => prev.map((h, i) =>
      i === index ? { ...h, status } : h
    ));
    showToast('Hh. ' + households[index].id + ' marked ' + (status === 'none' ? 'no response' : status));
  };

  const cycleTheme = () => {
    const themes = ['system', 'light', 'dark'];
    const labels = { system: 'System', light: 'Light', dark: 'Dark' };
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    showToast('Appearance: ' + labels[nextTheme]);
  };

  const sendMessage = (ownerName, text) => {
    setMessages(prev => ({
      ...prev,
      [ownerName]: [...(prev[ownerName] || []), { from: 'me', text }],
    }));
    // Auto-reply after 700ms
    const stockReplies = [
      "Sure, what time works for you?",
      "Still available — let's meet at the chapel.",
      "Noted, I'll set it aside for you.",
      "Yes, just knock when you arrive.",
    ];
    setTimeout(() => {
      const reply = stockReplies[Math.floor(Math.random() * stockReplies.length)];
      setMessages(prev => ({
        ...prev,
        [ownerName]: [...(prev[ownerName] || []), { from: 'them', text: reply }],
      }));
    }, 700);
  };

  const value = {
    // State
    user,
    myStatus,
    resources,
    requests,
    messages,
    evacCenters,
    announcements,
    puroks,
    pendingOfficials,
    households,
    theme,
    toast,

    // Actions
    login,
    logout,
    setStatus,
    addResource,
    requestItem,
    addAnnouncement,
    deleteAnnouncement,
    updateEvacCenter,
    approveOfficial,
    declineOfficial,
    addPurok,
    removePurok,
    updateHouseholdStatus,
    cycleTheme,
    sendMessage,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export { POSITION_PERMS };
