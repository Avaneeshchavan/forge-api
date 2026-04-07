import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function OAuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            // Supabase automatically picks up the token from the URL hash/query
            // We just need to wait for it to set the session
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('OAuth callback error:', error);
                navigate('/login', { replace: true });
                return;
            }

            if (session) {
                navigate('/', { replace: true });
            } else {
                // Session not ready yet, listen for it
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN' && session) {
                        subscription.unsubscribe();
                        navigate('/', { replace: true });
                    } else if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
                        subscription.unsubscribe();
                        navigate('/login', { replace: true });
                    }
                });

                // Timeout fallback — don't loop forever
                setTimeout(() => {
                    subscription.unsubscribe();
                    navigate('/login', { replace: true });
                }, 5000);
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <Loader2 size={24} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#888', fontSize: '14px' }}>Signing you in...</span>
        </div>
    );
}