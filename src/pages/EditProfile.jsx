import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { supabase } from '../config/apiConfig';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { showToast } = useApp();

  const [name, setName] = useState(user?.name ?? '');
  const [purokId, setPurokId] = useState(user?.purokId ?? '');
  const [puroks, setPuroks] = useState([]);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isOfficial = user?.role === 'official';

  // Load the puroks of the user's barangay (admins have none)
  useEffect(() => {
    if (!user?.barangayId) return;
    let cancelled = false;
    supabase
      .from('puroks')
      .select('id, name')
      .eq('barangay_id', user.barangayId)
      .order('name')
      .then(({ data, error }) => {
        if (!cancelled && !error) setPuroks(data || []);
      });
    return () => { cancelled = true; };
  }, [user?.barangayId]);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return showToast('Enter your full name');

    const newPurok = purokId || null;
    const nameChanged = trimmed !== user.name;
    const purokChanged = !isAdmin && newPurok !== (user.purokId ?? null);

    if (!nameChanged && !purokChanged) {
      navigate('/profile');
      return;
    }

    const updates = {};
    if (nameChanged) updates.full_name = trimmed;
    if (purokChanged) updates.purok_id = newPurok;

    setSaving(true);
    try {
      // .select() surfaces a silent RLS/grant block (0 rows, no error)
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select('id');
      if (error || !data?.length) throw new Error(error?.message || 'Could not update your profile.');

      // Keep the household's purok in sync with the profile's
      if (purokChanged && user.household) {
        const { error: hErr } = await supabase
          .from('households')
          .update({ purok_id: newPurok })
          .eq('owner_id', user.id);
        if (hErr) throw new Error(hErr.message);
      }

      await refreshUser();
      showToast('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      showToast(err.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/profile')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Edit profile</h2>
        </div>
      </div>

      <div className="form-grid">
        <div className="field full">
          <label>Full name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Dela Cruz" />
        </div>

        {!isAdmin && (
          <div className="field full">
            <label>{isOfficial ? 'Assigned zone' : 'Purok'}</label>
            <select value={purokId} onChange={(e) => setPurokId(e.target.value)}>
              <option value="">{isOfficial ? 'All puroks' : 'Not set'}</option>
              {puroks.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <button className="btn btn-accent btn-block" style={{ marginTop: 18 }} onClick={handleSubmit} disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
        }
        @media (min-width: 900px) {
          .mobile-back { display: none; }
        }
      `}</style>
    </div>
  );
}