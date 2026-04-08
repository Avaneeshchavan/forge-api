import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { Lock, LogOut, Zap, Sparkles, LayoutTemplate, Download, Loader2 } from 'lucide-react';

// 🔥 THE NUCLEAR OPTION
const apiBaseUrl = 'https://forge-api-drab.vercel.app/api';

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
};

const relativeTime = (dateStr) => {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
    return `${Math.floor(diff / 2592000)} months ago`;
};

const authPillColors = { 'None': '#444', 'API Key': '#f59e0b', 'JWT': '#6366f1', 'none': '#444' };

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
    const [generations, setGenerations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartMounted, setChartMounted] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { setLoading(false); return; }

        // 🔥 FIX 1: Hardcoded URL for fetching dashboard stats
        fetchWithAuth(`${apiBaseUrl}/history?userId=${user.id}`)
            .then(r => r.json())
            .then(data => setGenerations(data.generations || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [user, authLoading]);

    useEffect(() => {
        if (!loading && generations.length > 0) {
            const t = setTimeout(() => setChartMounted(true), 100);
            return () => clearTimeout(t);
        }
    }, [loading, generations]);

    // Unauthenticated state
    if (!authLoading && !user) {
        return (
            <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <div style={{ textAlign: 'center', maxWidth: '360px' }}>
                    <Lock size={40} color="#1e1e1e" style={{ marginBottom: '24px' }} />
                    <h1 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: '#ffffff' }}>Sign in to view your dashboard</h1>
                    <p style={{ color: '#888', fontSize: '14px', margin: '0 0 28px 0', lineHeight: 1.6 }}>Connect your Google account to track generations, view stats, and sync history across devices.</p>
                    <button onClick={signInWithGoogle} style={{ width: '100%', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 150ms' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#111'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent'; }}>
                        <svg width="14" height="14" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>
                </div>
            </div>
        );
    }

    // Compute stats
    const totalGenerations = generations.length;
    const totalEndpoints = generations.reduce((s, g) => s + (g.endpoint_count || 0), 0);
    const totalTables = generations.reduce((s, g) => s + (g.tables?.length || 0), 0);

    const authCounts = {};
    generations.forEach(g => {
        const key = g.auth_strategy || 'None';
        authCounts[key] = (authCounts[key] || 0) + 1;
    });
    const mostUsedAuth = Object.entries(authCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    const topColors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];
    const stats = [
        { label: 'Total Generations', value: totalGenerations },
        { label: 'Most Used Auth', value: mostUsedAuth },
        { label: 'Total Endpoints', value: totalEndpoints },
        { label: 'Tables Processed', value: totalTables },
    ];

    const recentFive = generations.slice(0, 5);

    const authStrategies = ['None', 'API Key', 'JWT'];
    const chartData = authStrategies.map(s => ({
        label: s,
        count: authCounts[s] || 0,
        pct: totalGenerations > 0 ? ((authCounts[s] || 0) / totalGenerations) * 100 : 0,
        color: authPillColors[s],
    }));

    const handleRedownload = async (entry) => {
        try {
            // 🔥 FIX 2: Hardcoded URL for re-downloading from the dashboard
            const res = await fetchWithAuth(`${apiBaseUrl}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    schema: entry.tables,
                    selectedTables: entry.tables.map(t => t.tableName),
                    authStrategy: entry.auth_strategy,
                    dbUrl: ''
                })
            });
            if (!res.ok) throw new Error('Failed to compile API zip.');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.style.display = 'none'; a.href = url; a.download = `forge_${entry.db_name}.zip`;
            document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
        } catch (err) { alert(err.message); }
    };

    // Shimmer placeholder for loading
    const ShimmerBar = ({ w }) => (
        <div style={{ width: w || '100%', height: '24px', borderRadius: '6px', background: 'linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    );

    return (
        <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '40px 48px', boxSizing: 'border-box', overflowX: 'hidden', color: '#ffffff' }}>

            {/* SECTION 1 — Welcome header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.02em', margin: '0 0 4px 0', color: '#ffffff' }}>
                        {getGreeting()}, {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'}
                    </h1>
                    <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>{user?.email}</p>
                </div>
                <button onClick={signOut} style={{ background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '8px 16px', color: '#888', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 150ms' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#888'; }}>
                    <LogOut size={14} /> Sign Out
                </button>
            </div>

            {/* SECTION 2 — Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
                {stats.map((stat, i) => (
                    <div key={stat.label} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '20px 24px', borderTop: `3px solid ${topColors[i]}`, animation: 'fadeInUp 400ms ease-out forwards', opacity: 0, animationDelay: `${i * 80}ms` }}>
                        {loading ? (
                            <>
                                <ShimmerBar w="60px" />
                                <div style={{ marginTop: '8px' }}><ShimmerBar w="100px" /></div>
                            </>
                        ) : (
                            <>
                                <div style={{ color: '#ffffff', fontSize: '32px', fontWeight: '700' }}>{stat.value}</div>
                                <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>{stat.label}</div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* SECTION 3 — Recent activity */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#ffffff' }}>Recent Generations</h2>
                    <Link to="/history" style={{ color: '#6366f1', fontSize: '13px', textDecoration: 'none', transition: 'color 150ms' }} onMouseOver={e => e.currentTarget.style.color = '#818cf8'} onMouseOut={e => e.currentTarget.style.color = '#6366f1'}>View all →</Link>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[0, 1, 2].map(i => <ShimmerBar key={i} />)}
                    </div>
                ) : recentFive.length === 0 ? (
                    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
                        <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>No generations yet. Head to the generator to create your first API.</p>
                    </div>
                ) : (
                    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['DB Name', 'Tables', 'Endpoints', 'Auth', 'Date', ''].map(h => (
                                        <th key={h} style={{ color: '#444', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', padding: '12px 16px', borderBottom: '1px solid #1e1e1e', textAlign: 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recentFive.map((g, idx) => {
                                    const auth = g.auth_strategy || 'None';
                                    const pillColor = authPillColors[auth] || '#444';
                                    return (
                                        <tr key={g.id} style={{ animation: 'fadeInUp 300ms ease-out forwards', opacity: 0, animationDelay: `${idx * 60}ms` }}>
                                            <td style={{ padding: '14px 16px', borderBottom: '1px solid #0d0d0d', color: '#ffffff', fontWeight: '500', fontSize: '13px' }}>{g.db_name}</td>
                                            <td style={{ padding: '14px 16px', borderBottom: '1px solid #0d0d0d', color: '#888', fontSize: '13px' }}>{g.tables?.length || 0}</td>
                                            <td style={{ padding: '14px 16px', borderBottom: '1px solid #0d0d0d', color: '#888', fontSize: '13px' }}>{g.endpoint_count || 0}</td>
                                            <td style={{ padding: '14px 16px', borderBottom: '1px solid #0d0d0d' }}>
                                                <span style={{ background: `${pillColor}20`, color: pillColor, fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '12px', border: `1px solid ${pillColor}40` }}>{auth}</span>
                                            </td>
                                            <td style={{ padding: '14px 16px', borderBottom: '1px solid #0d0d0d', color: '#888', fontSize: '13px', whiteSpace: 'nowrap' }}>{relativeTime(g.created_at)}</td>
                                            <td style={{ padding: '14px 16px', borderBottom: '1px solid #0d0d0d' }}>
                                                <button onClick={() => handleRedownload(g)} title="Re-download" style={{ background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '6px', padding: '6px', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.color = '#fff'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#888'; }}>
                                                    <Download size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* SECTION 4 — Quick actions */}
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 20px 0', color: '#ffffff' }}>Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {[
                        { icon: <Zap size={20} color="#6366f1" />, title: 'New Generation', desc: 'Connect a database or try a demo', btn: 'Go to Generator →', path: '/' },
                        { icon: <Sparkles size={20} color="#6366f1" />, title: 'Generate with AI', desc: 'Describe your app, get a schema', btn: 'Try AI Schema →', path: '/ai' },
                        { icon: <LayoutTemplate size={20} color="#6366f1" />, title: 'Browse Templates', desc: '6 production-ready schemas', btn: 'View Templates →', path: '/templates' },
                    ].map((card, i) => (
                        <div key={card.title} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px', cursor: 'pointer', transition: 'all 200ms', animation: 'fadeInUp 400ms ease-out forwards', opacity: 0, animationDelay: `${i * 80}ms` }} onMouseOver={e => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                            <div style={{ marginBottom: '12px' }}>{card.icon}</div>
                            <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>{card.title}</div>
                            <div style={{ color: '#888', fontSize: '13px', lineHeight: 1.5 }}>{card.desc}</div>
                            <button onClick={() => navigate(card.path)} style={{ width: '100%', marginTop: '16px', background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'background 150ms' }} onMouseOver={e => e.currentTarget.style.background = '#4f46e5'} onMouseOut={e => e.currentTarget.style.background = '#6366f1'}>
                                {card.btn}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECTION 5 — Auth breakdown chart */}
            {totalGenerations > 0 && (
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 20px 0', color: '#ffffff' }}>Generations by Auth Strategy</h2>
                    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {chartData.map(row => (
                                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '80px', color: '#888', fontSize: '13px', flexShrink: 0 }}>{row.label}</div>
                                    <div style={{ flex: 1, maxWidth: '400px' }}>
                                        <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#1e1e1e', overflow: 'hidden' }}>
                                            <div style={{ width: chartMounted ? `${row.pct}%` : '0%', height: '100%', borderRadius: '4px', background: row.color, transition: 'width 800ms ease' }} />
                                        </div>
                                    </div>
                                    <div style={{ color: '#888', fontSize: '13px', width: '32px', textAlign: 'right', flexShrink: 0 }}>{row.count}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;