import React, { useState, useEffect } from 'react';
import { Play, Plus, Copy, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const getMethodColor = (m) => {
    switch (m) {
        case 'GET': return '#22c55e';
        case 'POST': return '#6366f1';
        case 'PUT': return '#f59e0b';
        case 'DELETE': return '#ef4444';
        default: return '#888888';
    }
};

const SyntaxCode = ({ code }) => {
    if (!code) return null;
    let text = typeof code === 'string' ? code : JSON.stringify(code, null, 2);
    let highlighted = text
        .replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = '#f59e0b';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = '#6366f1';
                } else {
                    cls = '#22c55e';
                }
            } else if (/true|false/.test(match)) {
                cls = '#ef4444';
            } else if (/null/.test(match)) {
                cls = '#ef4444';
            }
            return `<span style="color:${cls}">${match}</span>`;
        });
    return <pre dangerouslySetInnerHTML={{ __html: highlighted }} style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.5, color: '#e2e8f0', whiteSpace: 'pre-wrap' }} />;
};

const getDefaultBody = (path) => {
    // Smart template based on path (e.g. /api/users)
    const tableName = path.split('/').pop() || 'item';
    if (tableName === 'users') {
        return JSON.stringify({ email: "", full_name: "" }, null, 2);
    }
    return JSON.stringify({ name: "", value: "sample" }, null, 2);
};

const PlaygroundPage = () => {
    const [baseUrl, setBaseUrl] = useState('http://localhost:3000');
    const [endpoints, setEndpoints] = useState([]);
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);
    const [requestBody, setRequestBody] = useState('');
    const [authStrategy, setAuthStrategy] = useState('None');
    const [token, setToken] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorState, setErrorState] = useState(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newMethod, setNewMethod] = useState('GET');
    const [newPath, setNewPath] = useState('/api/users');

    const [headersOpen, setHeadersOpen] = useState(false);

    useEffect(() => {
        // One-time migration from old key to new key
        const old = localStorage.getItem('instapi_history');
        if (old) {
            localStorage.setItem('forge_history', old);
            localStorage.removeItem('instapi_history');
        }

        const stored = localStorage.getItem('forge_history');
        if (stored) {
            try {
                const history = JSON.parse(stored).sort((a, b) => b.timestamp - a.timestamp);
                if (history.length > 0) {
                    const latest = history[0];
                    setAuthStrategy(latest.authStrategy || 'None');
                    let loadedEndpoints = [];
                    latest.tables.forEach(t => {
                        loadedEndpoints.push({ method: 'GET', path: `/api/${t.tableName}`, desc: `Fetch all ${t.tableName}` });
                        loadedEndpoints.push({ method: 'GET', path: `/api/${t.tableName}/1`, desc: `Fetch ${t.tableName} by ID` });
                        loadedEndpoints.push({ method: 'POST', path: `/api/${t.tableName}`, desc: `Create a new ${t.tableName}` });
                        loadedEndpoints.push({ method: 'PUT', path: `/api/${t.tableName}/1`, desc: `Update ${t.tableName}` });
                        loadedEndpoints.push({ method: 'DELETE', path: `/api/${t.tableName}/1`, desc: `Delete ${t.tableName}` });
                    });
                    setEndpoints(loadedEndpoints);
                }
            } catch (e) { }
        }
    }, []);

    const handleAddEndpoint = (e) => {
        e.preventDefault();
        const ep = { method: newMethod, path: newPath, desc: 'Custom endpoint' };
        setEndpoints([...endpoints, ep]);
        setShowAddForm(false);
        setNewPath('');
    };

    const handleSelectEndpoint = (ep) => {
        setSelectedEndpoint(ep);
        setResponse(null);
        setErrorState(null);
        if (ep.method === 'POST' || ep.method === 'PUT') {
            setRequestBody(getDefaultBody(ep.path));
        } else {
            setRequestBody('');
        }
    };

    const sendRequest = async () => {
        if (!selectedEndpoint) return;
        setLoading(true);
        setResponse(null);
        setErrorState(null);

        const startTime = Date.now();
        const url = `${baseUrl.replace(/\/$/, '')}${selectedEndpoint.path}`;

        let headers = {
            'Content-Type': 'application/json'
        };

        if (authStrategy === 'JWT' && token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else if (authStrategy === 'API Key' && token) {
            headers['X-API-Key'] = token;
        }

        const options = {
            method: selectedEndpoint.method,
            headers
        };

        if (selectedEndpoint.method !== 'GET' && selectedEndpoint.method !== 'DELETE') {
            try {
                JSON.parse(requestBody || '{}');
                options.body = requestBody || '{}';
            } catch (err) {
                setErrorState('Invalid JSON in request body');
                setLoading(false);
                return;
            }
        }

        try {
            const res = await fetch(url, options);
            let data;
            try { data = await res.json(); } catch (e) { data = await res.text(); }
            const time = Date.now() - startTime;
            setResponse({
                status: res.status,
                ok: res.ok,
                data,
                time
            });
        } catch (err) {
            setErrorState(`Could not connect — is your server running at ${baseUrl}?`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '40px 48px', boxSizing: 'border-box', overflowX: 'hidden', color: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>

            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '32px', animation: 'fadeInUp 400ms ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Play size={24} color="#6366f1" />
                    <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>API Playground</h1>
                </div>
                <p style={{ margin: 0, color: '#888888', fontSize: '14px' }}>Test your generated API endpoints in real time</p>
            </div>

            {/* Base URL */}
            <div style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '20px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeInUp 400ms ease-out forwards', opacity: 0, animationDelay: '100ms' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: '#ffffff' }}>Base URL</label>
                    <input
                        type="text" value={baseUrl} onChange={e => setBaseUrl(e.target.value)}
                        placeholder="http://localhost:3000"
                        style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#ffffff', padding: '10px 14px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 150ms' }}
                        onFocus={e => e.currentTarget.style.borderColor = '#6366f1'} onBlur={e => e.currentTarget.style.borderColor = '#1e1e1e'}
                    />
                    <span style={{ fontSize: '12px', color: '#444444' }}>Point this to your running generated API server</span>
                </div>
            </div>

            {/* Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '24px', animation: 'fadeInUp 400ms ease-out forwards', opacity: 0, animationDelay: '200ms' }}>

                {/* Left Col - Endpoints */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Endpoints</span>
                        <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onMouseOver={e => e.currentTarget.style.color = '#818cf8'} onMouseOut={e => e.currentTarget.style.color = '#6366f1'}>
                            <Plus size={14} /> Add endpoint
                        </button>
                    </div>

                    {showAddForm && (
                        <form onSubmit={handleAddEndpoint} style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#111111', border: '1px solid #1e1e1e', padding: '12px', borderRadius: '8px' }}>
                            <select value={newMethod} onChange={e => setNewMethod(e.target.value)} style={{ backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', color: '#ffffff', borderRadius: '6px', padding: '6px', fontSize: '12px', outline: 'none' }}>
                                <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                            </select>
                            <input value={newPath} onChange={e => setNewPath(e.target.value)} placeholder="/api/users" style={{ backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', color: '#ffffff', borderRadius: '6px', padding: '6px 8px', fontSize: '12px', outline: 'none' }} />
                            <button type="submit" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '6px', color: '#ffffff', padding: '6px', fontSize: '12px', cursor: 'pointer' }}>Add</button>
                        </form>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {endpoints.length === 0 ? (
                            <div style={{ color: '#888', fontSize: '13px', padding: '16px', backgroundColor: '#111', border: '1px dashed #2e2e2e', borderRadius: '8px', textAlign: 'center', lineHeight: 1.5 }}>
                                Generate an API first to auto-load endpoints, or add them manually
                            </div>
                        ) : (
                            endpoints.map((ep, i) => {
                                const isSelected = selectedEndpoint === ep;
                                return (
                                    <div key={i} onClick={() => handleSelectEndpoint(ep)} style={{ backgroundColor: isSelected ? '#1a1a1a' : '#111111', border: '1px solid', borderColor: isSelected ? '#6366f1' : '#1e1e1e', borderRadius: '8px', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 150ms ease' }} onMouseOver={e => !isSelected && (e.currentTarget.style.borderColor = '#2e2e2e')} onMouseOut={e => !isSelected && (e.currentTarget.style.borderColor = '#1e1e1e')}>
                                        <div style={{ backgroundColor: getMethodColor(ep.method), color: '#0a0a0a', fontSize: '10px', fontWeight: '600', fontFamily: 'monospace', borderRadius: '4px', padding: '2px 6px', textAlign: 'center', minWidth: '40px' }}>{ep.method}</div>
                                        <div style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '12px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{ep.path}</div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Col - Request/Response */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {!selectedEndpoint ? (
                        <div style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', opacity: 0.8 }}>
                            <Play size={48} color="#1e1e1e" />
                            <span style={{ color: '#444444', fontSize: '14px' }}>Select an endpoint to get started</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0a0a0a', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1e1e1e' }}>
                                    <div style={{ color: getMethodColor(selectedEndpoint.method), fontSize: '14px', fontWeight: '600', fontFamily: 'monospace' }}>{selectedEndpoint.method}</div>
                                    <div style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '14px', wordBreak: 'break-all' }}>{baseUrl.replace(/\/$/, '')}{selectedEndpoint.path}</div>
                                </div>

                                <div style={{ border: '1px solid #1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div onClick={() => setHeadersOpen(!headersOpen)} style={{ backgroundColor: '#1a1a1a', padding: '10px 16px', fontSize: '13px', fontWeight: '500', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span>Headers</span>
                                        {headersOpen ? <ChevronUp size={14} color="#888" /> : <ChevronDown size={14} color="#888" />}
                                    </div>
                                    {headersOpen && (
                                        <div style={{ padding: '16px', backgroundColor: '#0d0d0d', borderTop: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ color: '#888888', fontSize: '13px', fontFamily: 'monospace', width: '120px' }}>Content-Type</span>
                                                <span style={{ color: '#e2e8f0', fontSize: '13px', fontFamily: 'monospace' }}>application/json</span>
                                            </div>
                                            {authStrategy !== 'None' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ color: '#888888', fontSize: '13px', fontFamily: 'monospace', width: '120px' }}>{authStrategy === 'JWT' ? 'Authorization' : 'X-API-Key'}</span>
                                                    <input type="text" value={token} onChange={e => setToken(e.target.value)} placeholder={`Enter ${authStrategy} token`} style={{ flex: 1, backgroundColor: '#111', border: '1px solid #2e2e2e', color: '#fff', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontFamily: 'monospace', outline: 'none' }} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Body (JSON)</span>
                                        <textarea
                                            value={requestBody} onChange={e => setRequestBody(e.target.value)}
                                            style={{ width: '100%', height: '160px', backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#e2e8f0', padding: '16px', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none', resize: 'vertical', transition: 'border-color 150ms' }}
                                            onFocus={e => e.currentTarget.style.borderColor = '#6366f1'} onBlur={e => e.currentTarget.style.borderColor = '#1e1e1e'}
                                            spellCheck="false"
                                        />
                                    </div>
                                )}

                                <button onClick={sendRequest} disabled={loading} style={{ width: '100%', backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1, transition: 'all 150ms' }} onMouseOver={e => !loading && (e.currentTarget.style.backgroundColor = '#4f46e5')} onMouseOut={e => !loading && (e.currentTarget.style.backgroundColor = '#6366f1')}>
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                                    {loading ? 'Sending...' : 'Send Request'}
                                </button>

                                {errorState && (
                                    <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <XCircle size={16} /> {errorState}
                                    </div>
                                )}
                            </div>

                            {/* Response */}
                            {response && (
                                <div style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden', animation: 'fadeInUp 300ms ease-out' }}>
                                    <div style={{ padding: '12px 16px', backgroundColor: '#1a1a1a', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {response.ok ? <CheckCircle2 size={16} color="#22c55e" /> : <XCircle size={16} color="#ef4444" />}
                                            <span style={{ color: response.ok ? '#22c55e' : '#ef4444', fontWeight: '600', fontSize: '13px' }}>Status {response.status}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ color: '#888888', fontSize: '12px', fontFamily: 'monospace' }}>{response.time}ms</span>
                                            <button onClick={() => navigator.clipboard.writeText(typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2))} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: '#6366f1', fontSize: '12px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = '#818cf8'} onMouseOut={e => e.currentTarget.style.color = '#6366f1'}>
                                                <Copy size={12} /> Copy
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ padding: '16px', backgroundColor: '#0a0a0a', maxHeight: '400px', overflowY: 'auto' }}>
                                        <SyntaxCode code={response.data} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PlaygroundPage;
