import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Eye, EyeOff, Loader2, CheckCircle, Check } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const redirectTo = new URLSearchParams(window.location.search).get('redirectTo') || '/';
    const [tab, setTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [signupEmail, setSignupEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);

    useEffect(() => {
        if (user && !authLoading) {
            navigate(redirectTo, { replace: true });
        }
    }, [user, authLoading, navigate, redirectTo]);

    const getPasswordStrength = (pw) => {
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        const levels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['#ef4444', '#ef4444', '#f59e0b', '#22c55e', '#6366f1'];
        return { label: levels[score], color: colors[score], pct: (score / 4) * 100 };
    };

    const handleSignIn = async () => {
        if (!email || !password) { setError('Please fill in all fields.'); return; }
        setLoading(true); setError('');
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (err) setError(err.message);
        else navigate(redirectTo, { replace: true });
    };

    const handleSignUp = async () => {
        if (!name || !email || !password || !confirmPassword) { setError('Please fill in all fields.'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (!agreed) { setError('Please agree to the Terms of Service.'); return; }
        setLoading(true); setError('');
        const { error: err } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: name } }
        });
        setLoading(false);
        if (err) setError(err.message);
        else { setSignupSuccess(true); setSignupEmail(email); }
    };

    const handleGoogle = async () => {
        try {
            setLoading(true);
            setError('');
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { 
                    redirectTo: window.location.origin + '/auth/callback',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) { setError('Enter your email first, then click forgot password.'); return; }
        setError('');
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password'
        });
        setResetSent(true);
        setTimeout(() => setResetSent(false), 4000);
    };

    const handleResend = async () => {
        await supabase.auth.resend({ type: 'signup', email: signupEmail });
    };

    if (authLoading) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={24} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const strength = getPasswordStrength(password);

    // Signup success state
    if (signupSuccess) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 24px' }}>
                    <CheckCircle size={32} color="#22c55e" style={{ marginBottom: '20px' }} />
                    <h1 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>Check your email!</h1>
                    <p style={{ color: '#888', fontSize: '14px', margin: '0 0 24px 0', lineHeight: 1.6 }}>We sent a confirmation link to <span style={{ color: '#ffffff' }}>{signupEmail}</span></p>
                    <button onClick={handleResend} style={{ background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '10px 20px', color: '#888', fontSize: '13px', cursor: 'pointer', transition: 'all 150ms' }} onMouseOver={e=>{e.currentTarget.style.borderColor='#2e2e2e'; e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.borderColor='#1e1e1e'; e.currentTarget.style.color='#888';}}>
                        Resend email
                    </button>
                </div>
            </div>
        );
    }

    const inputStyle = (focused) => ({
        width: '100%', height: '44px', background: '#0d0d0d', border: '1px solid #1e1e1e',
        borderRadius: '8px', color: '#ffffff', padding: '0 14px', fontSize: '14px',
        boxSizing: 'border-box', outline: 'none', transition: 'border-color 150ms, box-shadow 150ms',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    });

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', display: 'flex', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulseDot { 0% { box-shadow: 0 0 0px #6366f1; } 50% { box-shadow: 0 0 12px #6366f1; } 100% { box-shadow: 0 0 0px #6366f1; } }
            `}</style>

            {/* LEFT PANEL */}
            <div style={{ width: '45%', background: '#111', borderRight: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                <div style={{ maxWidth: '360px', padding: '0 32px' }}>
                    <Zap size={48} color="#6366f1" style={{ filter: 'drop-shadow(0 0 24px rgba(99,102,241,0.6))' }} />
                    <h1 style={{ fontSize: '42px', fontWeight: '700', letterSpacing: '-0.03em', color: '#ffffff', margin: '16px 0 0 0' }}>ForgeAPI</h1>
                    <p style={{ color: '#888', fontSize: '16px', lineHeight: 1.7, maxWidth: '320px', margin: '12px 0 0 0' }}>Turn any PostgreSQL database into a production-ready REST API in seconds.</p>

                    <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            'Full CRUD REST API generated instantly',
                            'JWT, API Key, or No auth — your choice',
                            'SQL injection protection by default',
                            'Download and deploy in under 5 minutes',
                        ].map(f => (
                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Check size={16} color="#22c55e" style={{ flexShrink: 0 }} />
                                <span style={{ color: '#888', fontSize: '14px' }}>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ position: 'absolute', bottom: '32px', left: '32px', color: '#333', fontSize: '12px' }}>v1.0.0</div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>
                <div style={{ width: '100%', maxWidth: '400px', animation: 'fadeInUp 400ms ease-out' }}>

                    {/* redirectTo hint banner */}
                    {redirectTo !== '/' && (
                        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', color: '#888', fontSize: '13px', textAlign: 'center' }}>
                            Sign in to continue
                        </div>
                    )}

                    {/* Tab Switcher */}
                    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '4px', display: 'flex', marginBottom: '32px' }}>
                        <div onClick={() => { setTab('login'); setError(''); }} style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: '14px', fontWeight: '500', cursor: 'pointer', borderRadius: '8px', transition: 'all 150ms', background: tab === 'login' ? '#1e1e1e' : 'transparent', color: tab === 'login' ? '#ffffff' : '#888' }}>Login</div>
                        <div onClick={() => { setTab('signup'); setError(''); }} style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: '14px', fontWeight: '500', cursor: 'pointer', borderRadius: '8px', transition: 'all 150ms', background: tab === 'signup' ? '#1e1e1e' : 'transparent', color: tab === 'signup' ? '#ffffff' : '#888' }}>Sign Up</div>
                    </div>

                    {/* Google Button */}
                    <button onClick={handleGoogle} style={{ width: '100%', height: '48px', background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#ffffff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 150ms', boxSizing: 'border-box' }} onMouseOver={e=>{e.currentTarget.style.background='#1a1a1a'; e.currentTarget.style.borderColor='#2e2e2e';}} onMouseOut={e=>{e.currentTarget.style.background='#111'; e.currentTarget.style.borderColor='#1e1e1e';}}>
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '1px', background: '#1e1e1e' }} />
                        <span style={{ color: '#444', fontSize: '12px' }}>or</span>
                        <div style={{ flex: 1, height: '1px', background: '#1e1e1e' }} />
                    </div>

                    {/* Reset sent toast */}
                    {resetSent && (
                        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#22c55e', fontSize: '13px', textAlign: 'center' }}>
                            Password reset email sent!
                        </div>
                    )}

                    {/* LOGIN FORM */}
                    {tab === 'login' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Email */}
                            <div>
                                <label style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle()}
                                    onFocus={e=>{e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)';}}
                                    onBlur={e=>{e.currentTarget.style.borderColor='#1e1e1e'; e.currentTarget.style.boxShadow='none';}}
                                    onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                                />
                            </div>
                            {/* Password */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <label style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500' }}>Password</label>
                                    <span onClick={handleForgotPassword} style={{ color: '#6366f1', fontSize: '12px', cursor: 'pointer', transition: 'color 150ms' }} onMouseOver={e=>e.currentTarget.style.color='#818cf8'} onMouseOut={e=>e.currentTarget.style.color='#6366f1'}>Forgot password?</span>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle(), paddingRight: '42px' }}
                                        onFocus={e=>{e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)';}}
                                        onBlur={e=>{e.currentTarget.style.borderColor='#1e1e1e'; e.currentTarget.style.boxShadow='none';}}
                                        onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                                    />
                                    <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            {/* Error */}
                            {error && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '-4px' }}>{error}</div>}
                            {/* Submit */}
                            <button onClick={handleSignIn} disabled={loading} style={{ width: '100%', height: '48px', background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 150ms', opacity: loading ? 0.7 : 1 }} onMouseOver={e=>!loading&&(e.currentTarget.style.background='#4f46e5')} onMouseOut={e=>!loading&&(e.currentTarget.style.background='#6366f1')}>
                                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</> : 'Sign In'}
                            </button>
                            {/* Bottom link */}
                            <div style={{ textAlign: 'center', marginTop: '8px', color: '#888', fontSize: '13px' }}>
                                Don't have an account?{' '}
                                <span onClick={() => { setTab('signup'); setError(''); }} style={{ color: '#6366f1', cursor: 'pointer', transition: 'color 150ms' }} onMouseOver={e=>e.currentTarget.style.color='#818cf8'} onMouseOut={e=>e.currentTarget.style.color='#6366f1'}>Sign up</span>
                            </div>
                        </div>
                    )}

                    {/* SIGNUP FORM */}
                    {tab === 'signup' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Full Name */}
                            <div>
                                <label style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle()}
                                    onFocus={e=>{e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)';}}
                                    onBlur={e=>{e.currentTarget.style.borderColor='#1e1e1e'; e.currentTarget.style.boxShadow='none';}}
                                />
                            </div>
                            {/* Email */}
                            <div>
                                <label style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle()}
                                    onFocus={e=>{e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)';}}
                                    onBlur={e=>{e.currentTarget.style.borderColor='#1e1e1e'; e.currentTarget.style.boxShadow='none';}}
                                />
                            </div>
                            {/* Password */}
                            <div>
                                <label style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" style={{ ...inputStyle(), paddingRight: '42px' }}
                                        onFocus={e=>{e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)';}}
                                        onBlur={e=>{e.currentTarget.style.borderColor='#1e1e1e'; e.currentTarget.style.boxShadow='none';}}
                                    />
                                    <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {/* Strength indicator */}
                                {password.length > 0 && (
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: '#1e1e1e', overflow: 'hidden' }}>
                                            <div style={{ width: `${strength.pct}%`, height: '100%', borderRadius: '2px', background: strength.color, transition: 'width 300ms ease, background 300ms ease' }} />
                                        </div>
                                        <span style={{ color: strength.color, fontSize: '11px', marginTop: '4px', display: 'block' }}>{strength.label}</span>
                                    </div>
                                )}
                            </div>
                            {/* Confirm Password */}
                            <div>
                                <label style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" style={{ ...inputStyle(), paddingRight: '42px' }}
                                        onFocus={e=>{e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)';}}
                                        onBlur={e=>{e.currentTarget.style.borderColor='#1e1e1e'; e.currentTarget.style.boxShadow='none';}}
                                        onKeyDown={e => e.key === 'Enter' && handleSignUp()}
                                    />
                                    <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>Passwords don't match</span>
                                )}
                            </div>
                            {/* Terms checkbox */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '4px' }}>
                                <div onClick={() => setAgreed(!agreed)} style={{ width: '18px', height: '18px', borderRadius: '4px', border: `1px solid ${agreed ? '#6366f1' : '#1e1e1e'}`, background: agreed ? '#6366f1' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'all 150ms' }}>
                                    {agreed && <Check size={12} color="#fff" />}
                                </div>
                                <span style={{ color: '#888', fontSize: '12px', lineHeight: 1.5 }}>I agree to the Terms of Service and Privacy Policy</span>
                            </div>
                            {/* Error */}
                            {error && <div style={{ color: '#ef4444', fontSize: '13px' }}>{error}</div>}
                            {/* Submit */}
                            <button onClick={handleSignUp} disabled={loading} style={{ width: '100%', height: '48px', background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 150ms', opacity: loading ? 0.7 : 1 }} onMouseOver={e=>!loading&&(e.currentTarget.style.background='#4f46e5')} onMouseOut={e=>!loading&&(e.currentTarget.style.background='#6366f1')}>
                                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating account...</> : 'Create Account'}
                            </button>
                            {/* Bottom link */}
                            <div style={{ textAlign: 'center', marginTop: '8px', color: '#888', fontSize: '13px' }}>
                                Already have an account?{' '}
                                <span onClick={() => { setTab('login'); setError(''); }} style={{ color: '#6366f1', cursor: 'pointer', transition: 'color 150ms' }} onMouseOver={e=>e.currentTarget.style.color='#818cf8'} onMouseOut={e=>e.currentTarget.style.color='#6366f1'}>Sign in</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
