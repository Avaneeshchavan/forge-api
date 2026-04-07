import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, History, GitCompare, Play, LayoutTemplate, LayoutDashboard, BookOpen, Upload, Sparkles } from 'lucide-react';

const globalKeyframes = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulseDot {
    0% { box-shadow: 0 0 0px #6366f1; }
    50% { box-shadow: 0 0 12px #6366f1; }
    100% { box-shadow: 0 0 0px #6366f1; }
  }
  @keyframes rotateIn {
    from { transform: rotate(-90deg) scale(0.5); opacity: 0; }
    to { transform: rotate(0) scale(1); opacity: 1; }
  }
`;

const Layout = () => {
    const { user, loading, signInWithGoogle, signOut } = useAuth();
    const navigate = useNavigate();

    return (
        <div style={{
            display: "flex",
            width: "100vw",
            minHeight: "100vh",
            backgroundColor: "#0a0a0a",
            overflow: "hidden",
            boxSizing: "border-box",
            position: "relative",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "left"
        }}>
            <style>{globalKeyframes}</style>
            
            {/* Sidebar */}
            <div style={{
                width: "220px",
                minWidth: "220px",
                maxWidth: "220px",
                height: "100vh",
                position: "fixed",
                top: 0,
                left: 0,
                backgroundColor: "#0a0a0a",
                borderRight: "1px solid #1e1e1e",
                display: "flex",
                flexDirection: "column",
                zIndex: 100,
                boxSizing: "border-box"
            }}>
                {/* Thin indigo line at top */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, #6366f1, transparent)' }} />

                {/* Logo Area */}
                <Link to="/" style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }} onMouseOver={e=>e.currentTarget.querySelector('svg').style.color='#6366f1'} onMouseOut={e=>e.currentTarget.querySelector('svg').style.color='#ffffff'}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#6366f1', borderRadius: '50%', animation: 'pulseDot 2s infinite ease-in-out' }} />
                    <Zap size={18} color="#ffffff" style={{ transition: 'color 150ms' }} />
                    <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', letterSpacing: '-0.02em' }}>ForgeAPI</span>
                </Link>

                {/* Nav Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px', flex: 1 }}>
                    {user && (
                        <NavLink to="/dashboard" style={({ isActive }) => ({
                            display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', width: '100%',
                            padding: '10px 16px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none',
                            background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)' : 'transparent',
                            color: isActive ? '#ffffff' : '#888888',
                            borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                            boxSizing: 'border-box', fontWeight: '500', transition: 'all 150ms ease'
                        })} onMouseOver={e => { if (e.currentTarget.style.background === 'transparent') { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#ffffff'; } }} onMouseOut={e => { if (e.currentTarget.style.background === 'rgb(17, 17, 17)' || e.currentTarget.style.backgroundColor === 'rgb(17, 17, 17)') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888888'; } }}>
                            <LayoutDashboard size={16} />
                            <span>Dashboard</span>
                        </NavLink>
                    )}

                    <NavLink to="/" end style={({ isActive }) => ({
                        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', width: '100%',
                        padding: '10px 16px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none',
                        background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)' : 'transparent',
                        color: isActive ? '#ffffff' : '#888888',
                        borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                        boxSizing: 'border-box', fontWeight: '500', transition: 'all 150ms ease'
                    })} onMouseOver={e => { if (e.currentTarget.style.background === 'transparent') { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#ffffff'; } }} onMouseOut={e => { if (e.currentTarget.style.background === 'rgb(17, 17, 17)' || e.currentTarget.style.backgroundColor === 'rgb(17, 17, 17)') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888888'; } }}>
                        <Zap size={16} />
                        <span>Generate</span>
                    </NavLink>
                    
                    <NavLink to="/history" style={({ isActive }) => ({
                        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', width: '100%',
                        padding: '10px 16px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none',
                        background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)' : 'transparent',
                        color: isActive ? '#ffffff' : '#888888',
                        borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                        boxSizing: 'border-box', fontWeight: '500', transition: 'all 150ms ease'
                    })} onMouseOver={e => { if (e.currentTarget.style.background === 'transparent') { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#ffffff'; } }} onMouseOut={e => { if (e.currentTarget.style.background === 'rgb(17, 17, 17)' || e.currentTarget.style.backgroundColor === 'rgb(17, 17, 17)') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888888'; } }}>
                        <History size={16} />
                        <span>History</span>
                    </NavLink>

                    <NavLink to="/compare" style={({ isActive }) => ({
                        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', width: '100%',
                        padding: '10px 16px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none',
                        background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)' : 'transparent',
                        color: isActive ? '#ffffff' : '#888888',
                        borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                        boxSizing: 'border-box', fontWeight: '500', transition: 'all 150ms ease'
                    })} onMouseOver={e => { if (e.currentTarget.style.background === 'transparent') { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#ffffff'; } }} onMouseOut={e => { if (e.currentTarget.style.background === 'rgb(17, 17, 17)' || e.currentTarget.style.backgroundColor === 'rgb(17, 17, 17)') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888888'; } }}>
                        <GitCompare size={16} />
                        <span>Compare</span>
                    </NavLink>

                    <NavLink to="/ai" style={({ isActive }) => ({
                        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', width: '100%',
                        padding: '10px 16px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none',
                        background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)' : 'transparent',
                        color: isActive ? '#ffffff' : '#888888',
                        borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                        boxSizing: 'border-box', fontWeight: '500', transition: 'all 150ms ease'
                    })} onMouseOver={e => { if (e.currentTarget.style.background === 'transparent') { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#ffffff'; } }} onMouseOut={e => { if (e.currentTarget.style.background === 'rgb(17, 17, 17)' || e.currentTarget.style.backgroundColor === 'rgb(17, 17, 17)') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888888'; } }}>
                        <Sparkles size={16} />
                        <span>AI Schema</span>
                    </NavLink>

                    <NavLink to="/import" style={({ isActive }) => ({
                        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', width: '100%',
                        padding: '10px 16px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none',
                        background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)' : 'transparent',
                        color: isActive ? '#ffffff' : '#888888',
                        borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                        boxSizing: 'border-box', fontWeight: '500', transition: 'all 150ms ease'
                    })} onMouseOver={e => { if (e.currentTarget.style.background === 'transparent') { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#ffffff'; } }} onMouseOut={e => { if (e.currentTarget.style.background === 'rgb(17, 17, 17)' || e.currentTarget.style.backgroundColor === 'rgb(17, 17, 17)') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888888'; } }}>
                        <Upload size={16} />
                        <span>Import</span>
                    </NavLink>

                    <NavLink to="/templates" style={({ isActive }) => ({
                        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', width: '100%',
                        padding: '10px 16px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none',
                        background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)' : 'transparent',
                        color: isActive ? '#ffffff' : '#888888',
                        borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                        boxSizing: 'border-box', fontWeight: '500', transition: 'all 150ms ease'
                    })} onMouseOver={e => { if (e.currentTarget.style.background === 'transparent') { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#ffffff'; } }} onMouseOut={e => { if (e.currentTarget.style.background === 'rgb(17, 17, 17)' || e.currentTarget.style.backgroundColor === 'rgb(17, 17, 17)') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888888'; } }}>
                        <LayoutTemplate size={16} />
                        <span>Templates</span>
                    </NavLink>

                    <NavLink to="/playground" style={({ isActive }) => ({
                        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', width: '100%',
                        padding: '10px 16px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none',
                        background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)' : 'transparent',
                        color: isActive ? '#ffffff' : '#888888',
                        borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                        boxSizing: 'border-box', fontWeight: '500', transition: 'all 150ms ease'
                    })} onMouseOver={e => { if (e.currentTarget.style.background === 'transparent') { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#ffffff'; } }} onMouseOut={e => { if (e.currentTarget.style.background === 'rgb(17, 17, 17)' || e.currentTarget.style.backgroundColor === 'rgb(17, 17, 17)') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888888'; } }}>
                        <Play size={16} />
                        <span>Playground</span>
                    </NavLink>

                    <div style={{ padding: '0 16px', margin: '8px 0' }}>
                        <div style={{ height: '1px', backgroundColor: '#1e1e1e', width: '100%' }} />
                    </div>

                    <NavLink to="/docs" style={({ isActive }) => ({
                        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', width: '100%',
                        padding: '10px 16px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none',
                        background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)' : 'transparent',
                        color: isActive ? '#ffffff' : '#888888',
                        borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                        boxSizing: 'border-box', fontWeight: '500', transition: 'all 150ms ease'
                    })} onMouseOver={e => { if (e.currentTarget.style.background === 'transparent') { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#ffffff'; } }} onMouseOut={e => { if (e.currentTarget.style.background === 'rgb(17, 17, 17)' || e.currentTarget.style.backgroundColor === 'rgb(17, 17, 17)') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888888'; } }}>
                        <BookOpen size={16} />
                        <span>Docs</span>
                    </NavLink>
                </div>

                {/* User Section */}
                {!loading && (
                    <div style={{ paddingBottom: '16px' }}>
                        {user ? (
                            <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '12px', margin: '0 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', color: '#ffffff', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {user.email ? user.email[0].toUpperCase() : 'U'}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                                            {user.email}
                                        </span>
                                        <button onClick={signOut} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '11px', padding: 0, textAlign: 'left', cursor: 'pointer', transition: 'color 150ms', marginTop: '2px' }} onMouseOver={e=>e.currentTarget.style.color='#ef4444'} onMouseOut={e=>e.currentTarget.style.color='#888'}>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => navigate('/login')} style={{ width: 'calc(100% - 32px)', margin: '0 16px', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '10px', fontSize: '13px', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 150ms' }} onMouseOver={e=>{e.currentTarget.style.borderColor='#2e2e2e'; e.currentTarget.style.color='#ffffff'; e.currentTarget.style.background='#111';}} onMouseOut={e=>{e.currentTarget.style.borderColor='#1e1e1e'; e.currentTarget.style.color='#888'; e.currentTarget.style.background='transparent';}}>
                                <svg width="14" height="14" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Sign in with Google
                            </button>
                        )}
                    </div>
                )}

                {/* Footer Section */}
                <div style={{ padding: '0 24px 24px 24px', fontSize: '12px', color: '#444444', fontWeight: '500' }}>
                    v1.0.0
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{
                marginLeft: "220px",
                width: "calc(100vw - 220px)",
                maxWidth: "calc(100vw - 220px)",
                minHeight: "100vh",
                backgroundColor: "#0a0a0a",
                overflowX: "hidden",
                overflowY: "auto",
                boxSizing: "border-box"
            }}>
                <Outlet />
            </div>
        </div>
    );
};
export default Layout;
