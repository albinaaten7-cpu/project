import { useEffect } from 'react';
import { touchPresence } from '../lib/friends';
import { supabase } from '../lib/supabase';

export function PresencePing() {
  useEffect(() => {
    const ping = () => void touchPresence().catch(() => undefined);
    ping();
    const timer = window.setInterval(ping, 60000);
    const { data } = supabase.auth.onAuthStateChange(() => ping());
    return () => { window.clearInterval(timer); data.subscription.unsubscribe(); };
  }, []);
  return null;
}
