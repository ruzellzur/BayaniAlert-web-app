import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../config/apiConfig';
import { useAuth } from './AuthContext';

const MessagesContext = createContext(null);

// listing id used in URLs for threads that have no listing attached
export const DIRECT = 'direct';
export const toListingId = (param) => (param === DIRECT || !param ? null : param);
export const threadPath = (listingId, otherId) =>
  `/thread/${listingId ?? DIRECT}${otherId ? `?with=${otherId}` : ''}`;

export function MessagesProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const listeners = useRef(new Set()); // open thread pages subscribe here
  const refreshTimer = useRef(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('last_at', { ascending: false });
    if (!error) setConversations(data ?? []);
    setLoading(false);
  }, [user]);

  // Several realtime events can land together (e.g. mark-as-read of a whole
  // thread), so coalesce them into one refetch.
  const scheduleRefresh = useCallback(() => {
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(refresh, 250);
  }, [refresh]);

  // Load + live updates for the signed-in user.
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return undefined;
    }
    setLoading(true);
    refresh();

    // RLS limits which rows this user is sent; no filter needed.
    const channel = supabase
      .channel(`messages:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        listeners.current.forEach((fn) => fn(payload.new));
        scheduleRefresh();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, scheduleRefresh)
      .subscribe();

    // Catch up on anything missed while the tab was in the background.
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearTimeout(refreshTimer.current);
      supabase.removeChannel(channel);
    };
  }, [user, refresh, scheduleRefresh]);

  const unreadCount = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    [conversations]
  );

  // Every message between me and `otherId`, across all listings.
  const fetchThread = useCallback(async (otherId) => {
    if (!user) return { data: [], error: new Error('Not signed in') };
    return supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),` +
        `and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true })
      .limit(500);
  }, [user]);

  // Full-text-ish search over message bodies. Returns Map(otherId -> newest matching body).
  const searchMessages = useCallback(async (term) => {
    const q = term.trim().replace(/[%_\\,()]/g, ' ').trim();
    if (!user || !q) return new Map();
    const { data, error } = await supabase
      .from('messages')
      .select('sender_id, recipient_id, body, created_at')
      .ilike('body', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(300);
    if (error) return new Map();
    const byPerson = new Map();
    for (const m of data ?? []) {
      const otherId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
      if (!byPerson.has(otherId)) byPerson.set(otherId, m.body); // first = newest
    }
    return byPerson;
  }, [user]);

  const sendMessage = useCallback(async ({ listingId, recipientId, body }) => {
    const text = body.trim();
    if (!text) return { error: new Error('Empty message') };
    const { data, error } = await supabase
      .from('messages')
      .insert({
        listing_id: listingId ?? null,
        sender_id: user.id,
        recipient_id: recipientId,
        body: text,
      })
      .select()
      .single();
    if (!error) scheduleRefresh();
    return { data, error };
  }, [user, scheduleRefresh]);

  const markThreadRead = useCallback(async (otherId) => {
    const { data, error } = await supabase.rpc('mark_thread_read', { p_other: otherId });
    if (!error && data > 0) {
      // Update the badge right away; the realtime refresh confirms it.
      setConversations((prev) =>
        prev.map((c) => (c.other_id === otherId ? { ...c, unread_count: 0 } : c))
      );
    }
    return { error };
  }, []);

  // Open threads call this to receive new rows as they arrive.
  const subscribeToMessages = useCallback((fn) => {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn);
  }, []);

  const value = {
    conversations,
    unreadCount,
    loading,
    refresh,
    fetchThread,
    searchMessages,
    sendMessage,
    markThreadRead,
    subscribeToMessages,
  };

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error('useMessages must be used within MessagesProvider');
  return ctx;
}