import React, { useState, useEffect } from 'react';
import { Download, Eye, GitCompare, Trash2, Database, X, Search, Share2, Loader2, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../lib/api';
import EndpointDocs from '../components/EndpointDocs';
import Toast from '../components/Toast';

const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState('');
    const [viewSchemaModal, setViewSchemaModal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [authFilter, setAuthFilter] = useState('All');
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();
    const { user, signInWithGoogle } = useAuth();

    useEffect(() => {
        const uid = user?.id || localStorage.getItem('forge_user_id') || (() => { 
            const id = crypto.randomUUID();
            localStorage.setItem('forge_user_id', id);
            return id;
        })();
        setUserId(uid);

        const pendingRaw = sessionStorage.getItem('forge_history_pending');

        fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/history?userId=${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    const pending = JSON.parse(pendingRaw || '[]');
                    sessionStorage.removeItem('forge_history_pending');
                    const fetched = data.generations || [];
                    const fetchedIds = new Set(fetched.map(g => g.id));
                    const newRecords = pending.filter(g => !fetchedIds.has(g.id));
                    setHistory([...newRecords, ...fetched]);
                }
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [user]);

    const handleDelete = async (id) => {
        try {
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/history/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");
            setHistory(history.filter(h => h.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDownload = async (entry) => {
        try {
            const payload = {
                schema: entry.tables,
                selectedTables: entry.tables.map(t => t.tableName),
                authStrategy: entry.auth_strategy,
                dbUrl: '' 
            };
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Failed to compile API zip.");
            
            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.style.display = 'none'; a.href = downloadUrl; a.download = `forge_${entry.db_name}_${new Date(entry.created_at).getTime()}.zip`;
            document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(downloadUrl); document.body.removeChild(a);
        } catch (err) {
            alert(err.message);
        }
    };

    const sendToCompare = (entry) => {
        sessionStorage.setItem('forge_compare_a', JSON.stringify(entry.tables));
        sessionStorage.setItem('forge_compare_a_name', entry.db_name);
        navigate('/compare');
    };

    const handleShare = (entry) => {
        const payload = { schema: entry.tables || [], selectedTables: (entry.tables || []).map(t => t.tableName), authStrategy: entry.auth_strategy || 'None' };
        const encoded = btoa(JSON.stringify(payload));
        const url = `${window.location.origin}/?schema=${encoded}`;
        navigator.clipboard.writeText(url);
        setShowToast(true);
    };

    const filteredHistory = history.filter(h => {
        const matchesSearch = h.db_name?.toLowerCase().includes(searchTerm.toLowerCase());
        let matchesAuth = true;
        if (authFilter === 'None auth') matchesAuth = !h.auth_strategy || h.auth_strategy === 'None';
        else if (authFilter !== 'All') matchesAuth = h.auth_strategy === authFilter;
        return matchesSearch && matchesAuth;
    });

    const filterPills = ['All', 'None auth', 'API Key', 'JWT'];

    return (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '40px', boxSizing: 'border-box', overflowX: 'hidden', color: '#ffffff' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '600', letterSpacing: '-0.02em', margin: '0 0 4px 0', color: '#ffffff' }}>Generation History</h1>
                {loading ? <p style={{ fontSize: '14px', color: '#888888', margin: 0 }}>Loading...</p> : 
                <p style={{ fontSize: '14px', color: '#888888', margin: 0 }}>{history.length} {history.length === 1 ? 'generation' : 'generations'}</p>}
            </div>

            {error && <div style={{ marginBottom: '24px', padding: '16px', background: '#3f1a1a', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444' }}>{error}</div>}

            {!user && (
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <LogIn size={14} color="#6366f1" />
                        <span style={{ color: '#ffffff', fontSize: '14px', marginLeft: '10px' }}>Sign in with Google to sync history across devices</span>
                    </div>
                    <button onClick={signInWithGoogle} style={{ background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: '150ms' }} onMouseOver={e=>e.currentTarget.style.background='#4f46e5'} onMouseOut={e=>e.currentTarget.style.background='#6366f1'}>
                        Sign In
                    </button>
                </div>
            )}

            {history.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={16} color="#888888" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search databases..."
                            style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#ffffff', padding: '10px 14px 10px 40px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 150ms' }}
                            onFocus={e => e.currentTarget.style.borderColor = '#6366f1'} onBlur={e => e.currentTarget.style.borderColor = '#1e1e1e'}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                        {filterPills.map(filter => (
                            <button
                                key={filter} onClick={() => setAuthFilter(filter)}
                                style={{ backgroundColor: authFilter === filter ? '#1a1a1a' : 'transparent', border: '1px solid', borderColor: authFilter === filter ? '#6366f1' : '#1e1e1e', color: authFilter === filter ? '#ffffff' : '#888888', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer', transition: 'all 150ms ease', whiteSpace: 'nowrap' }}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={32} color="#6366f1" />
                </div>
            ) : filteredHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Database size={48} color="#1e1e1e" style={{ margin: '0 auto 16px auto', display: 'block' }} />
                    <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>{history.length === 0 ? 'No generations yet' : 'No matches found'}</div>
                    <div style={{ color: '#888888', fontSize: '14px', marginBottom: '24px' }}>{history.length === 0 ? 'Head over to Generate to create your first API.' : 'Try adjusting your search or filters.'}</div>
                    {history.length === 0 && <Link to="/" style={{ textDecoration: 'none', backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '14px', fontWeight: '500', display: 'inline-block', transition: 'background-color 150ms' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#4f46e5'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#6366f1'}>Explore Generator</Link>}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredHistory.map((entry, index) => {
                        const date = new Date(entry.created_at);
                        return (
                            <div key={entry.id} style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 150ms, transform 150ms', animation: 'fadeInUp 300ms ease-out forwards', opacity: 0, animationDelay: `${index * 50}ms` }} onMouseOver={e => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.transform = 'translateY(0)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>{entry.db_name}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                                        <span style={{ color: '#888888' }}>{date.toLocaleDateString()} {date.toLocaleTimeString()}</span>
                                        <span style={{ color: '#888888', backgroundColor: '#0a0a0a', padding: '2px 8px', borderRadius: '12px', border: '1px solid #1e1e1e' }}>{entry.tables?.length || 0} Tables</span>
                                        <span style={{ color: '#888888', backgroundColor: '#0a0a0a', padding: '2px 8px', borderRadius: '12px', border: '1px solid #1e1e1e' }}>Auth: {entry.auth_strategy || 'None'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button title="View Schema" onClick={() => setViewSchemaModal(entry.tables)} style={{ cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '8px', color: '#888888', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.color = '#ffffff' }} onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#888888' }}>
                                        <Eye size={16} />
                                    </button>
                                    <button title="Compare" onClick={() => sendToCompare(entry)} style={{ cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '8px', color: '#888888', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.color = '#ffffff' }} onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#888888' }}>
                                        <GitCompare size={16} />
                                    </button>
                                    <button title="Share Schema" onClick={() => handleShare(entry)} style={{ cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '8px', color: '#888888', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1' }} onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#888888' }}>
                                        <Share2 size={16} />
                                    </button>
                                    <button title="Re-download" onClick={() => handleDownload(entry)} style={{ cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '8px', color: '#888888', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.color = '#ffffff' }} onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#888888' }}>
                                        <Download size={16} />
                                    </button>
                                    <button title="Delete" onClick={() => handleDelete(entry.id)} style={{ cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '8px', color: '#ef4444', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ffffff' }} onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#ef4444' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {viewSchemaModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#ffffff' }}>Historical API Schema</h2>
                            <button onClick={() => setViewSchemaModal(null)} style={{ background: 'transparent', border: 'none', color: '#888888', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#888888'}><X size={18} /></button>
                        </div>
                        <div style={{ padding: '24px', overflowY: 'auto' }}>
                            <EndpointDocs schema={viewSchemaModal} />
                        </div>
                    </div>
                </div>
            )}

            <Toast isVisible={showToast} message="Link copied to clipboard!" onClose={() => setShowToast(false)} />
        </div>
    );
};
export default HistoryPage;
