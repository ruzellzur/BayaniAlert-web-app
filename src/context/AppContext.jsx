import { useState, useEffect } from 'react';
import { AppContext, permsFor } from './app-context';
import {
  INITIAL_RESOURCES,
  INITIAL_EVACUATION_CENTERS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_HOUSEHOLDS,
  INITIAL_PUROKS,
  INITIAL_PENDING_OFFICIALS,
} from '../data/seed';


// Read persisted state once, at module scope, so the first render already has
// the restored values (no setState-in-effect flash).
function readPersistedState() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem('bayanialert_state');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Failed to load state:', e);
    return null;
  }
}

const persisted = readPersistedState();

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => persisted?.user ?? null);
  const [myStatus, setMyStatus] = useState(() => persisted?.myStatus ?? null);
  const [resources, setResources] = useState(() => persisted?.resources ?? INITIAL_RESOURCES);
  const [requests, setRequests] = useState(() => persisted?.requests ?? []);
  const [messages, setMessages] = useState(() => persisted?.messages ?? {});
  const [evacCenters, setEvacCenters] = useState(() => persisted?.evacCenters ?? INITIAL_EVACUATION_CENTERS);
  const [announcements, setAnnouncements] = useState(() => persisted?.announcements ?? INITIAL_ANNOUNCEMENTS);
  const [puroks, setPuroks] = useState(() => persisted?.puroks ?? INITIAL_PUROKS);
  const [pendingOfficials, setPendingOfficials] = useState(() => persisted?.pendingOfficials ?? INITIAL_PENDING_OFFICIALS);
  const [households, setHouseholds] = useState(() => persisted?.households ?? INITIAL_HOUSEHOLDS);
  const [theme, setTheme] = useState(() => persisted?.theme ?? 'system');
  const [toast, setToast] = useState(null);

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
