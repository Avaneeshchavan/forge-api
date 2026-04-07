import React, { useState, useEffect, useRef } from 'react';
import { GitCompare, Loader2, CheckCircle2 } from 'lucide-react';
import SchemaDiff from '../components/SchemaDiff';
import { fetchWithAuth } from '../lib/api';

const demoEcommerce = { "tables": [ { "name": "users", "columns": [ { "column_name": "id", "data_type": "integer", "is_nullable": "NO" }, { "column_name": "email", "data_type": "character varying", "is_nullable": "NO" }, { "column_name": "full_name", "data_type": "character varying", "is_nullable": "YES" } ]}, { "name": "products", "columns": [ { "column_name": "id", "data_type": "integer", "is_nullable": "NO" }, { "column_name": "name", "data_type": "character varying", "is_nullable": "NO" }, { "column_name": "price", "data_type": "numeric", "is_nullable": "NO" } ]} ] };
const demoSaas = { "tables": [ { "name": "organizations", "columns": [ { "column_name": "id", "data_type": "integer", "is_nullable": "NO" }, { "column_name": "name", "data_type": "character varying", "is_nullable": "NO" } ]}, { "name": "members", "columns": [ { "column_name": "id", "data_type": "integer", "is_nullable": "NO" }, { "column_name": "org_id", "data_type": "integer", "is_nullable": "NO" } ]} ] };
const demoBlog = { "tables": [ { "name": "authors", "columns": [ { "column_name": "id", "data_type": "integer", "is_nullable": "NO" } ]}, { "name": "posts", "columns": [ { "column_name": "id", "data_type": "integer", "is_nullable": "NO" } ]} ] };

const demoSamples = [ { id: 'ecommerce', label: 'E-commerce', data: demoEcommerce }, { id: 'saas', label: 'SaaS', data: demoSaas }, { id: 'blog', label: 'Blog', data: demoBlog } ];

const mapDemoToSchema = (sampleData) => {
    return sampleData.tables.map(table => ({
        tableName: table.name,
        columns: table.columns.map(c => ({
            name: c.column_name,
            type: c.data_type,
            isNullable: c.is_nullable === 'YES'
        }))
    }));
};

const ComparePage = () => {
    const [schemaA, setSchemaA] = useState(null);
    const [schemaB, setSchemaB] = useState(null);
    
    const [uriA, setUriA] = useState('');
    const [uriB, setUriB] = useState('');
    
    const [loadingA, setLoadingA] = useState(false);
    const [loadingB, setLoadingB] = useState(false);
    
    const [errorA, setErrorA] = useState('');
    const [errorB, setErrorB] = useState('');
    
    const [showDiff, setShowDiff] = useState(false);

    const diffRef = useRef(null);

    useEffect(() => {
        const historicalA = sessionStorage.getItem('forge_compare_a');
        if (historicalA) {
            try {
                setSchemaA(JSON.parse(historicalA));
                sessionStorage.removeItem('forge_compare_a');
                sessionStorage.removeItem('forge_compare_a_name');
            } catch(e) {}
        }
    }, []);

    const loadSchema = async (side) => {
        const isA = side === 'a';
        const uri = isA ? uriA : uriB;
        if (!uri.trim()) return;

        const setLoading = isA ? setLoadingA : setLoadingB;
        const setError = isA ? setErrorA : setErrorB;
        const setSchema = isA ? setSchemaA : setSchemaB;

        setLoading(true);
        setError('');
        setShowDiff(false);

        try {
            const res = await fetchWithAuth("http://localhost:3000/api/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dbUrl: uri })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load schema");
            
            // Expected backend returned format: { schema: [{tableName: "...", columns: [...]}] }
            setSchema(data.schema);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadDemo = (side, demoId) => {
        const isA = side === 'a';
        const setSchema = isA ? setSchemaA : setSchemaB;
        const setUri = isA ? setUriA : setUriB;
        const setError = isA ? setErrorA : setErrorB;

        const sample = demoSamples.find(d => d.id === demoId);
        if (sample) {
            setSchema(mapDemoToSchema(sample.data));
            setUri('');
            setError('');
            setShowDiff(false);
        }
    };

    const handleCompare = () => {
        setShowDiff(true);
        setTimeout(() => {
            if (diffRef.current) diffRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    const getStats = (schemaArray) => {
        if (!schemaArray) return null;
        const tablesCount = schemaArray.length;
        const colsCount = schemaArray.reduce((acc, t) => acc + (t.columns?.length || 0), 0);
        return `${tablesCount} tables · ${colsCount} columns`;
    };

    // We identify if they are perfectly identical by letting SchemaDiff handle it. 
    // However, if we need to show identical state natively:
    // SchemaDiff handles "No structural changes detected" currently, but we can hook in 
    // or let it render gracefully. I'll pass it to SchemaDiff. 
    // Usually, SchemaDiff evaluates diff.added.length === 0, etc.

    return (
        <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '40px', boxSizing: 'border-box', overflowX: 'hidden', color: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px', gap: '8px', animation: 'fadeInUp 400ms ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <GitCompare size={24} color="#6366f1" />
                    <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-0.02em' }}>Schema Compare</h1>
                </div>
                <p style={{ color: '#888888', fontSize: '14px', margin: 0 }}>Load two schemas to diff tables, columns and types</p>
            </div>

            {/* Two panel grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', animation: 'fadeInUp 400ms ease-out forwards', opacity: 0, animationDelay: '100ms' }}>
                
                {/* Panel A Left */}
                <div style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
                        <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#ffffff' }}>Schema A</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input 
                            type="text" 
                            value={uriA} 
                            onChange={(e) => setUriA(e.target.value)} 
                            disabled={loadingA}
                            placeholder="postgres://user:pass@host/db"
                            style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#ffffff', padding: '10px 14px', fontSize: '13px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 150ms' }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'} 
                            onBlur={(e) => e.currentTarget.style.borderColor = '#1e1e1e'}
                        />
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#888888', fontSize: '12px' }}>or use demo:</span>
                            {demoSamples.map((s) => (
                                <button 
                                    key={`A-${s.id}`} 
                                    onClick={() => loadDemo('a', s.id)} 
                                    disabled={loadingA}
                                    style={{ background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: '#888888', cursor: loadingA ? 'not-allowed' : 'pointer', transition: '150ms' }}
                                    onMouseOver={e=>!loadingA && (e.currentTarget.style.borderColor='#6366f1', e.currentTarget.style.color='#6366f1')} 
                                    onMouseOut={e=>!loadingA && (e.currentTarget.style.borderColor='#1e1e1e', e.currentTarget.style.color='#888888')}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => loadSchema('a')} 
                        disabled={loadingA || !uriA.trim()} 
                        style={{ marginTop: '12px', width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '8px', padding: '10px', color: '#ffffff', fontSize: '13px', fontWeight: '500', cursor: (loadingA || !uriA.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '150ms' }}
                        onMouseOver={e=>!(loadingA || !uriA.trim()) && (e.currentTarget.style.backgroundColor='#2e2e2e')} 
                        onMouseOut={e=>!(loadingA || !uriA.trim()) && (e.currentTarget.style.backgroundColor='#1a1a1a')}
                    >
                        {loadingA ? <Loader2 size={14} className="animate-spin" /> : 'Load Schema A'}
                    </button>

                    {errorA && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errorA}</div>}
                    
                    {schemaA && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontSize: '13px', marginTop: '4px' }}>
                            <CheckCircle2 size={16} /> {getStats(schemaA)} loaded
                        </div>
                    )}
                </div>

                {/* Panel B Right */}
                <div style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#14b8a6' }} />
                        <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#ffffff' }}>Schema B</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input 
                            type="text" 
                            value={uriB} 
                            onChange={(e) => setUriB(e.target.value)} 
                            disabled={loadingB}
                            placeholder="postgres://user:pass@host/db"
                            style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#ffffff', padding: '10px 14px', fontSize: '13px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 150ms' }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#14b8a6'} 
                            onBlur={(e) => e.currentTarget.style.borderColor = '#1e1e1e'}
                        />
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#888888', fontSize: '12px' }}>or use demo:</span>
                            {demoSamples.map((s) => (
                                <button 
                                    key={`B-${s.id}`} 
                                    onClick={() => loadDemo('b', s.id)} 
                                    disabled={loadingB}
                                    style={{ background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: '#888888', cursor: loadingB ? 'not-allowed' : 'pointer', transition: '150ms' }}
                                    onMouseOver={e=>!loadingB && (e.currentTarget.style.borderColor='#14b8a6', e.currentTarget.style.color='#14b8a6')} 
                                    onMouseOut={e=>!loadingB && (e.currentTarget.style.borderColor='#1e1e1e', e.currentTarget.style.color='#888888')}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => loadSchema('b')} 
                        disabled={loadingB || !uriB.trim()} 
                        style={{ marginTop: '12px', width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '8px', padding: '10px', color: '#ffffff', fontSize: '13px', fontWeight: '500', cursor: (loadingB || !uriB.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '150ms' }}
                        onMouseOver={e=>!(loadingB || !uriB.trim()) && (e.currentTarget.style.backgroundColor='#2e2e2e')} 
                        onMouseOut={e=>!(loadingB || !uriB.trim()) && (e.currentTarget.style.backgroundColor='#1a1a1a')}
                    >
                        {loadingB ? <Loader2 size={14} className="animate-spin" /> : 'Load Schema B'}
                    </button>

                    {errorB && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errorB}</div>}
                    
                    {schemaB && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14b8a6', fontSize: '13px', marginTop: '4px' }}>
                            <CheckCircle2 size={16} /> {getStats(schemaB)} loaded
                        </div>
                    )}
                </div>
            </div>

            {/* Compare button row */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0 24px 0', animation: 'fadeInUp 400ms ease-out forwards', opacity: 0, animationDelay: '200ms' }}>
                <button 
                  onClick={handleCompare} 
                  disabled={!schemaA || !schemaB} 
                  style={{ backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '12px 32px', fontSize: '15px', fontWeight: '500', cursor: (!schemaA || !schemaB) ? 'not-allowed' : 'pointer', opacity: (!schemaA || !schemaB) ? 0.4 : 1, transition: 'all 150ms ease' }}
                  onMouseOver={e=>!(!schemaA || !schemaB) && (e.currentTarget.style.backgroundColor='#4f46e5')} 
                  onMouseOut={e=>!(!schemaA || !schemaB) && (e.currentTarget.style.backgroundColor='#6366f1')}
                >
                    Compare Schemas
                </button>
            </div>

            {/* Bottom section */}
            <div ref={diffRef}>
                {showDiff ? (
                    <div style={{ animation: 'fadeInUp 400ms ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 32px 0' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#1e1e1e' }} />
                            <span style={{ padding: '0 16px', color: '#888888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diff Results</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#1e1e1e' }} />
                        </div>
                        <SchemaDiff before={schemaA} after={schemaB} />
                        
                        {/* Identical Schemas Graceful Catch */}
                        {JSON.stringify(schemaA) === JSON.stringify(schemaB) && (
                            <div style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                <CheckCircle2 size={32} color="#22c55e" />
                                <div style={{ color: '#22c55e', fontSize: '16px', fontWeight: '500' }}>Schemas are identical</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', marginTop: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.8, animation: 'fadeInUp 400ms ease-out forwards', animationDelay: '300ms' }}>
                        <GitCompare size={48} color="#1e1e1e" style={{ marginBottom: '16px' }} />
                        <div style={{ color: '#444444', fontSize: '14px' }}>Load two schemas above to see differences</div>
                    </div>
                )}
            </div>

        </div>
    );
};
export default ComparePage;
