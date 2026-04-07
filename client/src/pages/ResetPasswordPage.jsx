import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';

const getPasswordStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ef4444', '#ef4444', '#f59e0b', '#22c55e', '#6366f1'];
    return { label: labels[score], color: colors[score], pct: (score / 4) * 100 };
};

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [showResetForm, setShowResetForm] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setShowResetForm(true);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleUpdatePassword = async () => {
        if (!password || !confirmPassword) { setError('Please fill in all fields.'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (password !== confirmPassword) { setError("Passwords don't match."); return; }

        setLoading(true);
        setError('');
        const { error: err } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (err) {
            setError(err.message);
        } else {
            setSuccess(true);
            setTimeout(() => navigate('/'), 2000);
        }
    };

    const inputStyle = {
        width: '100%', height: '44px', background: '#0d0d0d', border: '1px solid #1e1e1e',
        borderRadius: '8px', color: '#ffffff', padding: '0 42px 0 14px', fontSize: '14px',
        boxSizing: 'border-box', outline: 'none', transition: 'border-color 150ms, box-shadow 150ms',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const strength = getPasswordStrength(password);

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <div style={{ width: '100%', maxWidth: '400px', padding: '0 24px', animation: 'fadeInUp 400ms ease-out' }}>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <CheckCircle size={40} color="#22c55e" style={{ marginBottom: '16px' }} />
                        <h1 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0' }}>Password updated!</h1>
                        <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Redirecting you to the app...</p>
                    </div>
                ) : !showResetForm ? (
                    <div style={{ textAlign: 'center' }}>
                        <Loader2 size={28} color="#6366f1" style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                        <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Checking reset link...</p>
                    </div>
                ) : (
                    <>
                        <h1 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '600', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Set New Password</h1>
                        <p style={{ color: '#888', fontSize: '14px', margin: '0 0 32px 0' }}>Choose a strong password for your account.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* New Password */}
                            <div>
                                <label style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        style={inputStyle}
                                        onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                                        onBlur={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.boxShadow = 'none'; }}
                                    />
                                    <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
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
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat password"
                                        style={inputStyle}
                                        onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                                        onBlur={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.boxShadow = 'none'; }}
                                        onKeyDown={e => e.key === 'Enter' && handleUpdatePassword()}
                                    />
                                    <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>Passwords don't match</span>
                                )}
                            </div>

                            {/* Error */}
                            {error && <div style={{ color: '#ef4444', fontSize: '13px' }}>{error}</div>}

                            {/* Submit */}
                            <button
                                onClick={handleUpdatePassword}
                                disabled={loading}
                                style={{ width: '100%', height: '48px', background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 150ms', opacity: loading ? 0.7 : 1 }}
                                onMouseOver={e => !loading && (e.currentTarget.style.background = '#4f46e5')}
                                onMouseOut={e => !loading && (e.currentTarget.style.background = '#6366f1')}
                            >
                                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : 'Update Password'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
