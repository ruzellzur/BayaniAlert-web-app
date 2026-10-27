import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/apiConfig'; 

const AuthContext = createContext(null);

const EMAIL_DOMAIN = 'bayanialert.local';

// position column in db is profiles.official_position
// this perm table mirrors position_can() and should be kept in sync
// Unknown or missing positions get no permissions, same as the database.
const POSITION_PERMS = {
  'Barangay Captain': { announce: true, evac: true, rescue: false },
  'Kagawad': { announce: true, evac: true, rescue: false },
  'SK Chairperson': { announce: true, evac: false, rescue: false },
  'Barangay Tanod': { announce: false, evac: false, rescue: true },
  'BDRRM Officer': { announce: true, evac: true, rescue: true },
  'Rescue/Response Team': { announce: false, evac: false, rescue: true },
};
const NO_PERMS = { announce: false, evac: false, rescue: false };
const ALL_PERMS = { announce: true, evac: true, rescue: true };

const permsFor = (position) => POSITION_PERMS[position] || NO_PERMS;

// ---- identifier helpers ------------------------------------------------

// Normalizes PH mobile numbers to 09XXXXXXXXX (accepts +63..., 63..., 9XXXXXXXXX).
export function normalizePhone(input) {
  let d = String(input || '').replace(/\D/g, '');
  if (d.startsWith('63') && d.length === 12) d = '0' + d.slice(2);
  else if (d.length === 10 && d.startsWith('9')) d = '0' + d;
  return d;
}
export const isValidPhone = (p) => /^09\d{9}$/.test(p);

// Digits => phone login; anything else => admin username.
function toEmail(identifier) {
  const raw = String(identifier || '').trim();
  const isPhone = /^[+\d\s-]+$/.test(raw);
  const key = isPhone ? normalizePhone(raw) : raw.toLowerCase();
  return `${key}@${EMAIL_DOMAIN}`;
}

const initialsOf = (name) =>
  (name || '').trim().split(/\s+/).filter(Boolean)
    .map((w) => w[0]).join('').toUpperCase().slice(0, 2);

// DB row -> the shape the prototype's pages already expect from `user`.
const shapeUser = (p) => ({
  id: p.id,
  role: p.role, // 'resident' | 'official' | 'admin'
  name: p.full_name,
  phone: p.phone,
  username: p.username,
  barangayId: p.barangay_id,
  barangayName: p.barangay?.name ?? null,   
  barangayCenter:
  p.barangay?.center_lat != null && p.barangay?.center_lng != null
    ? [p.barangay.center_lat, p.barangay.center_lng]
    : null,
  purokId: p.purok_id,
  position: p.official_position ?? null,
  officialName: p.role === 'official' && p.official_position ? `${p.official_position} ${p.full_name}` : p.full_name,
  permissions:
    p.role === 'admin' ? ALL_PERMS
    : p.role === 'official' ? permsFor(p.official_position)
    : NO_PERMS,
  initials: initialsOf(p.full_name),
  purokName: p.purok?.name ?? null,
  household: Array.isArray(p.household) ? p.household[0] ?? null : p.household ?? null,
  householdNo: (Array.isArray(p.household) ? p.household[0] : p.household)?.household_no ?? null,
});

// ------------------------------------------------------------------------

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until the saved session is checked

  // Loads the profile for a signed-in auth user. Pending/rejected accounts
  // are signed straight back out and get a message instead of a session.
  const hydrate = useCallback(async (authUser) => {
    const { data: p, error } = await supabase
      .from('profiles')
      .select('*, barangay:barangays(name, center_lat, center_lng), purok:puroks(name), household:households(*, emergency_contacts(*))')      .eq('id', authUser.id)
      .single();

    if (error || !p) {
      await supabase.auth.signOut();
      setUser(null);
      return { error: 'Could not load your profile. Please try again.' };
    }

    if (p.status !== 'approved') {
      await supabase.auth.signOut();
      setUser(null);
      return {
        pending: p.status === 'pending',
        error:
          p.status === 'rejected'
            ? 'Your registration was declined. Please contact your barangay hall.'
            : 'Your account is still waiting for admin approval.',
      };
    }

    const u = shapeUser(p);
    setUser(u);
    return { user: u };
  }, []);

    const refreshUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) await hydrate(data.user);
  };

  // Restore a saved session on page load.
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) await hydrate(data.session.user);
      setLoading(false);
    });

    // Never await Supabase calls inside this callback (can deadlock).
    // Sign-in/sign-up call hydrate() themselves, so only handle sign-out here.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setUser(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [hydrate]);

  // identifier = phone number (resident/official) or username (admin)
  const signIn = async (identifier, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: toEmail(identifier),
      password,
    });
    if (error) return { error: 'Incorrect phone number/username or password.' };
    return hydrate(data.user);
  };

  // role: 'resident' | 'official'. Returns { user } for residents,
  // { pendingApproval: true } for officials, or { error }.
  const signUp = async ({
    role, fullName, phone, password,
    barangayId, purokId, idNumber, position,
  }) => {
    const normalized = normalizePhone(phone);
    if (!isValidPhone(normalized)) {
      return { error: 'Enter a valid mobile number, e.g. 09171234567.' };
    }
    if (!barangayId) return { error: 'Please select your barangay.' };
    if (role === 'official' && !idNumber?.trim()) {
      return { error: 'Your barangay ID number is required.' };
    }
    if (role === 'official' && !POSITION_PERMS[position]) {
      return { error: 'Select your official position.' };
    }

    if (role === 'official' && !POSITION_PERMS[position]) {
      return { error: 'Select your official position.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: toEmail(normalized),
      password,
      options: {
        data: {
          full_name: fullName,
          phone: normalized,
          barangay_id: barangayId,
          purok_id: purokId || '',
          requested_role: role,
          id_number: role === 'official' ? idNumber.trim() : '',
          position: role === 'official' ? position || '' : '', // used after migration 03
        },
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered')) {
        return { error: 'This phone number is already registered.' };
      }
      if (msg.includes('database error')) {
        return { error: 'Registration failed. This phone number or barangay ID may already be in use.' };
      }
      if (msg.includes('password')) {
        return { error: 'Password is too short (minimum 6 characters).' };
      }
      return { error: error.message };
    }

    if (!data.session) {
      return {
        error: 'Account created but no session started. Turn off "Confirm email" in Supabase > Authentication.',
      };
    }

    if (role === 'official') {
      await supabase.auth.signOut(); // officials wait for admin approval
      return { pendingApproval: true };
    }
    return hydrate(data.user);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = { user, loading, signIn, signUp, signOut, refreshUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}