import React, { useState } from 'react';
import { Sparkles, Key, Eye, EyeOff, Loader2, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../lib/api';

const borderColors = ['#a855f7', '#6366f1', '#22c55e', '#f59e0b', '#ef4444'];
const examplePrompts = [
    "Food delivery app",
    "Hospital management system",
    "Online learning platform",
    "Real estate listings",
    "Project management tool"
];

const AISchemaPage = () => {
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [schema, setSchema] = useState(null); // the parsed JSON object { tables: [...] }
    const [expandedTables, setExpandedTables] = useState({});

    const handleGenerate = async () => {
    if (!prompt || !apiKey) return;
    setLoading(true);
    setError('');
    setSchema(null);
    setExpandedTables({});

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: `Generate a PostgreSQL database schema for: ${prompt}

Respond with ONLY a valid JSON object in this exact format, no explanation, no markdown:
{
  "tables": [
    {
      "name": "table_name",
      "columns": [
        { "column_name": "id", "data_type": "integer", "is_nullable": "NO" },
        { "column_name": "example_col", "data_type": "character varying", "is_nullable": "YES" }
      ]
    }
  ]
}`
                }]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Claude API error');

        const text = data.content?.[0]?.text || '';
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);

        if (!parsed.tables || !Array.isArray(parsed.tables)) {
            throw new Error('Invalid schema structure returned from AI');
        }

        setSchema(parsed);
        const expandAll = {};
        parsed.tables.forEach(t => expandAll[t.name] = true);
        setExpandedTables(expandAll);

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

    const toggleExpand = (name) => {
        setExpandedTables(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleUseSchema = () => {
        if (!schema) return;
        const payload = {
            is_ai: true,
            tables: schema.tables
        };
        sessionStorage.setItem('forge_import_schema', JSON.stringify(payload));
        navigate('/');
    };

    return (
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 48px', boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Sparkles size={20} color="#6366f1" />
                <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>AI Schema Generator</h1>
            </div>
            <p style={{ color: '#888888', fontSize: '14px', marginTop: 0, marginBottom: '24px' }}>Describe your app in plain English and get a complete database schema instantly</p>

            {/* API Key Section */}
            <div style={{ background: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Key size={14} color="#444444" />
                        <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>Anthropic API Key</span>

                    </div>
                    <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" style={{ color: '#6366f1', fontSize: '12px', textDecoration: 'none' }}>Get a key →</a>
                </div>
                <div style={{ position: 'relative' }}>
                    <input 
                        type={showKey ? "text" : "password"} 
                        value={apiKey} 
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-ant-..."
                        style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '10px 40px 10px 12px', color: '#ffffff', fontSize: '14px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 150ms' }}
                        onFocus={e => e.currentTarget.style.borderColor='#6366f1'}
                        onBlur={e => e.currentTarget.style.borderColor='#1e1e1e'}
                    />
                    <button type="button" onClick={() => setShowKey(!showKey)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                <div style={{ color: '#444444', fontSize: '11px', marginTop: '8px' }}>Your key is never sent to our servers. It goes directly to Anthropic from your browser.</div>
            </div>

            {/* Prompt Section */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Describe your application</div>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value.substring(0, 500))}
                    placeholder="e.g. A food delivery app with restaurants, menu items, customers, orders and delivery drivers. Customers can place orders, track delivery status and leave reviews."
                    style={{ width: '100%', height: '140px', resize: 'vertical', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '10px', color: '#ffffff', padding: '14px 16px', fontSize: '14px', lineHeight: 1.6, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', transition: 'all 150ms' }}
                    onFocus={e => { e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor='#1e1e1e'; e.currentTarget.style.boxShadow='none'; }}
                />
                <div style={{ textAlign: 'right', color: '#444444', fontSize: '11px', marginTop: '4px' }}>{prompt.length} / 500</div>
            </div>

            {/* Example Prompts Row */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                <span style={{ color: '#444444', fontSize: '12px' }}>Try an example:</span>
                {examplePrompts.map((ex, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleExample(ex)} 
                        style={{ background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: '#888888', cursor: 'pointer', transition: 'all 150ms' }}
                        onMouseOver={e=> { e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.color='#6366f1'; e.currentTarget.style.background='rgba(99,102,241,0.08)'; }}
                        onMouseOut={e=> { e.currentTarget.style.borderColor='#1e1e1e'; e.currentTarget.style.color='#888888'; e.currentTarget.style.background='transparent'; }}
                    >
                        {ex}
                    </button>
                ))}
            </div>

            {/* Generate Button */}
            <button 
                onClick={handleGenerate} 
                disabled={loading || !prompt.trim() || !apiKey.trim()} 
                style={{ width: '100%', background: '#6366f1', color: '#ffffff', height: '48px', fontSize: '15px', fontWeight: '600', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: (loading || !prompt.trim() || !apiKey.trim()) ? 'not-allowed' : 'pointer', opacity: (loading || !prompt.trim() || !apiKey.trim()) ? 0.6 : 1, transition: 'all 150ms' }}
                onMouseOver={e=> { if(!loading && prompt.trim() && apiKey.trim()) e.currentTarget.style.background='#4f46e5'; }}
                onMouseOut={e=> { if(!loading && prompt.trim() && apiKey.trim()) e.currentTarget.style.background='#6366f1'; }}
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? "Generating schema with AI..." : "Generate Schema with AI"}
            </button>

            {/* Error State */}
            {error && (
                <div style={{ marginTop: '24px', background: '#111111', border: '1px solid #ef4444', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', animation: 'fadeInUp 300ms ease-out' }}>
                    <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: '500' }}>Generation Failed</span>
                        <span style={{ color: '#888888', fontSize: '13px', lineHeight: 1.5 }}>{error}</span>
                        <div style={{ color: '#444444', fontSize: '12px', marginTop: '4px' }}>Suggestions: Check your API key is valid • Try a shorter or simpler description</div>
                    </div>
                </div>
            )}

            {/* Result Section */}
            {schema && !loading && !error && (
                <div style={{ marginTop: '32px', animation: 'fadeInUp 400ms ease-out' }}>
                    <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CheckCircle2 size={20} color="#22c55e" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>Schema generated successfully!</span>
                                <span style={{ color: '#888888', fontSize: '12px' }}>{schema.tables.length} tables created</span>
                            </div>
                        </div>
                        <button onClick={handleUseSchema} style={{ background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: '150ms' }} onMouseOver={e=>e.currentTarget.style.background='#4f46e5'} onMouseOut={e=>e.currentTarget.style.background='#6366f1'}>
                            Use This Schema →
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {schema.tables.map((table, i) => {
                            const isExpanded = expandedTables[table.name];
                            const borderColor = borderColors[i % borderColors.length];
                            
                            return (
                                <div key={i} style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderLeft: `3px solid ${borderColor}`, borderRadius: '12px', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }} onClick={() => toggleExpand(table.name)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>{table.name}</span>
                                            <span style={{ backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', color: '#888888' }}>{table.columns.length} cols</span>
                                        </div>
                                        <div>
                                            {isExpanded ? <ChevronUp size={18} color="#888888" /> : <ChevronDown size={18} color="#888888" />}
                                        </div>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div style={{ padding: '0 16px 14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {table.columns.map((col, cIdx) => (
                                                <div key={cIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1e1e1e', paddingTop: '8px' }}>
                                                    <span style={{ color: '#ffffff', fontSize: '13px' }}>{col.column_name}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6366f1', backgroundColor: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' }}>{col.data_type}</span>
                                                        <span style={{ fontSize: '11px', color: '#444444', backgroundColor: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' }}>{col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AISchemaPage;
