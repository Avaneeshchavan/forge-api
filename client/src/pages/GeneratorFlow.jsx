import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Database, Loader2, CheckSquare, Square, ChevronDown, ChevronUp, Shield, Key, Lock, X, Zap, Folder, FileText, Share2, ArrowLeft, Copy, CheckCircle2, Eye, Download, ClipboardPaste, GitCompare, Upload, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../lib/api';
import SchemaStats from '../components/SchemaStats';
import Toast from '../components/Toast';

const apiBaseUrl = '/api';
const borderColors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];

const demoEcommerce = { "tables": [{ "name": "users", "columns": [{ "column_name": "id", "data_type": "integer", "is_nullable": "NO" }, { "column_name": "email", "data_type": "character varying", "is_nullable": "NO" }, { "column_name": "full_name", "data_type": "character varying", "is_nullable": "YES" }] }, { "name": "products", "columns": [{ "column_name": "id", "data_type": "integer", "is_nullable": "NO" }, { "column_name": "name", "data_type": "character varying", "is_nullable": "NO" }, { "column_name": "price", "data_type": "numeric", "is_nullable": "NO" }] }] };
const demoSaas = { "tables": [{ "name": "organizations", "columns": [{ "column_name": "id", "data_type": "integer", "is_nullable": "NO" }, { "column_name": "name", "data_type": "character varying", "is_nullable": "NO" }] }, { "name": "members", "columns": [{ "column_name": "id", "data_type": "integer", "is_nullable": "NO" }, { "column_name": "org_id", "data_type": "integer", "is_nullable": "NO" }] }] };
const demoBlog = { "tables": [{ "name": "authors", "columns": [{ "column_name": "id", "data_type": "integer", "is_nullable": "NO" }] }, { "name": "posts", "columns": [{ "column_name": "id", "data_type": "integer", "is_nullable": "NO" }] }] };
const demoSamples = [{ id: 'ecommerce', label: 'E-commerce', data: demoEcommerce }, { id: 'saas', label: 'SaaS', data: demoSaas }, { id: 'blog', label: 'Blog', data: demoBlog }];
const mapSampleSchema = (sampleData) => { return sampleData.tables.map(table => ({ tableName: table.name, columns: table.columns.map(c => ({ name: c.column_name, type: c.data_type, isNullable: c.is_nullable === 'YES' })) })); };

const getAuthIcon = (strategy) => {
  if (strategy === 'None') return <Shield size={16} />;
  if (strategy === 'API Key') return <Key size={16} />;
  return <Lock size={16} />;
};

const SyntaxCode = ({ code }) => {
  let highlighted = code
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(const|require|router|app|module\.exports|let|await|async|function)/g, '<span style="color:#6366f1">$1</span>')
    .replace(/(res\.status|res\.json|req\.params|req\.body)/g, '<span style="color:#f59e0b">$1</span>')
    .replace(/('.*?'|".*?"|`.*?`)/g, '<span style="color:#22c55e">$1</span>')
    .replace(/(\/\/[^\n]*)/g, '<span style="color:#444444">$1</span>');
  return <pre dangerouslySetInnerHTML={{ __html: highlighted }} style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.7, color: '#e2e8f0', whiteSpace: 'pre-wrap' }} />;
};

const getMethodBg = (m) => {
  switch (m) {
    case 'GET': return '#22c55e';
    case 'POST': return '#6366f1';
    case 'PUT': return '#f59e0b';
    case 'DELETE': return '#ef4444';
    default: return '#888888';
  }
};

const getMethods = (tName) => [
  { method: 'GET', path: `/api/${tName}`, desc: `Fetch all ${tName}` },
  { method: 'GET', path: `/api/${tName}/:id`, desc: `Fetch ${tName} by ID` },
  { method: 'POST', path: `/api/${tName}`, desc: `Create a new ${tName}` },
  { method: 'PUT', path: `/api/${tName}/:id`, desc: `Update ${tName} by ID` },
  { method: 'DELETE', path: `/api/${tName}/:id`, desc: `Delete ${tName} by ID` },
];

const GeneratorFlow = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [dbUrl, setDbUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [expandedTables, setExpandedTables] = useState({});
  const [error, setError] = useState(null);
  const [authStrategy, setAuthStrategy] = useState('None');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeDemoId, setActiveDemoId] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [isImportedMode, setIsImportedMode] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [demoLabel, setDemoLabel] = useState('DEMO MODE');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState('index.js');
  const previewContentRef = useRef(null);

  useEffect(() => {
    const templateSchema = sessionStorage.getItem('forge_template_schema')
    if (templateSchema) {
      try {
        const parsed = JSON.parse(templateSchema)
        const tables = parsed?.schema ?? parsed?.tables ?? []
        if (!Array.isArray(tables)) throw new Error('Invalid shape')
        const mappedSchema = tables.map(table => ({
          tableName: table.tableName ?? table.name,
          columns: table.columns.map(c => ({
            name: c.name ?? c.column_name,
            type: c.type ?? c.data_type,
            isNullable: c.isNullable ?? c.is_nullable === 'YES'
          }))
        }))
        setSchema(mappedSchema)
        setSelectedTables(mappedSchema.map(t => t.tableName))
        const initExp = {}
        mappedSchema.forEach(t => initExp[t.tableName] = true)
        setExpandedTables(initExp)
        setIsDemoMode(true)
        setDemoLabel('TEMPLATE')
        sessionStorage.removeItem('forge_template_schema')
        setStep(2)
      } catch (e) {
        console.error('Failed to load template schema', e)
        sessionStorage.removeItem('forge_template_schema')
      }
    }
    
    const importSchema = sessionStorage.getItem('forge_import_schema')
    if (importSchema) {
      try {
        const parsed = JSON.parse(importSchema)
        const mappedSchema = parsed.tables.map(table => ({
          tableName: table.name,
          columns: table.columns.map(c => ({ name: c.column_name, type: c.data_type, isNullable: c.is_nullable === 'YES' }))
        }))
        setSchema(mappedSchema)
        setSelectedTables(mappedSchema.map(t => t.tableName))
        const initExp = {}
        mappedSchema.forEach(t => initExp[t.tableName] = true)
        setExpandedTables(initExp)
        setIsDemoMode(true)
        if (parsed.is_ai) setDemoLabel('AI GENERATED');
        else setDemoLabel('IMPORTED');
        sessionStorage.removeItem('forge_import_schema')
        setStep(2)
      } catch (e) {
        console.error('Failed to load import schema', e)
        sessionStorage.removeItem('forge_import_schema')
      }
    }
  }, [])

  useEffect(() => {
    // 1. Check for shared schema in URL
    const searchParams = new URL(window.location.href).searchParams;
    const sharedSchemaStr = searchParams.get('schema');
    if (sharedSchemaStr) {
      try {
        const decoded = JSON.parse(atob(sharedSchemaStr));
        const s = decoded.schema || [];
        setSchema(s);
        setSelectedTables(decoded.selectedTables || []);
        if (decoded.authStrategy) setAuthStrategy(decoded.authStrategy);
        if (s.length > 0) {
          const initExp = {};
          s.forEach(t => initExp[t.tableName] = true);
          setExpandedTables(initExp);
        }
        setStep(2);
      } catch (e) {
        console.error('Failed to parse shared schema', e);
      }
      return; // don't check sessionStorage if URL schema present
    }
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  const handleShare = () => {
    const payload = { schema, selectedTables, authStrategy };
    const encoded = btoa(JSON.stringify(payload));
    const url = `${window.location.origin}/?schema=${encoded}`;
    navigator.clipboard.writeText(url);
    triggerToast('Link copied to clipboard!');
  };

  const copyAllRoutes = (e) => {
    e.stopPropagation();
    const routes = [];
    schema.filter(t => selectedTables.includes(t.tableName)).forEach(t => {
      getMethods(t.tableName).forEach(r => routes.push(`${r.method}\t${r.path}\t${r.desc}`));
    });
    navigator.clipboard.writeText(routes.join('\n'));
    triggerToast('Routes copied!');
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!dbUrl.trim()) { setError('Database URL is required.'); return; }

    // Auth guard — real DB preview requires login
    if (!user) {
      navigate('/login?redirectTo=' + encodeURIComponent('/'));
      return;
    }
    setLoading(true); setError(null); setIsDemoMode(false);
    try {
      const res = await fetchWithAuth(`${apiBaseUrl}/preview`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dbUrl }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to scan schema');
      setSchema(data.schema);
      setSelectedTables(data.schema.map(t => t.tableName));
      if (data.schema.length > 0) {
        const initExp = {};
        data.schema.forEach(t => initExp[t.tableName] = true);
        setExpandedTables(initExp);
      }
      setStep(2);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleDemoClick = (sample) => {
    setActiveDemoId(sample.id);
    setLoading(true);
    setTimeout(() => {
      setIsDemoMode(true);
      setError(null);
      setDbUrl('');
      const mappedSchema = mapSampleSchema(sample.data);
      setSchema(mappedSchema);
      setSelectedTables(mappedSchema.map(t => t.tableName));
      if (mappedSchema.length > 0) {
        const initExp = {};
        mappedSchema.forEach(t => initExp[t.tableName] = true);
        setExpandedTables(initExp);
      }
      setStep(2);
      setLoading(false);
    }, 400);
  };

  const executeDownload = async () => {
    setShowPreviewModal(false);
    setLoading(true); setError(null);
    try {
      const payload = { dbUrl: isDemoMode ? '' : dbUrl, selectedTables, authStrategy };
      if (isDemoMode) payload.schema = schema.filter(t => selectedTables.includes(t.tableName));
      const res = await fetchWithAuth(`${apiBaseUrl}/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'Failed to compile API.'); }
      const blob = await res.blob();
      if (blob.size === 0) throw new Error('Received an empty file from server.');

      // ─── Save to history ───────────────────────────────────────────────
      try {
        const storedId = user?.id || (() => {
          let id = localStorage.getItem('forge_user_id');
          if (!id) { id = crypto.randomUUID(); localStorage.setItem('forge_user_id', id); }
          return id;
        })();

        console.log('[History] User ID source:', user?.id ? 'Supabase Auth' : 'localStorage');
        console.log('[History] User ID:', storedId);

        let dbName = 'Unknown DB';
        if (isDemoMode && !isAiMode && !isImportedMode && !templateName) dbName = 'Demo Schema';
        if (templateName) dbName = templateName;
        if (isImportedMode) dbName = 'Imported Schema';
        if (isAiMode) dbName = 'AI Generated Schema';
        if (!isDemoMode && !isAiMode && !isImportedMode && dbUrl) {
          try { dbName = new URL(dbUrl).pathname.replace('/', '') || 'Unknown DB'; } catch (_) { }
        }

        const historyPayload = {
          userId: storedId,
          dbName,
          tables: schema.filter(t => selectedTables.includes(t.tableName)),
          authStrategy,
          endpointCount: selectedTables.length * 5
        };

        console.log('[History] Sending payload:', { userId: storedId, dbName, authStrategy, tableCount: historyPayload.tables.length });

        const histRes = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(historyPayload)
        });

        console.log('[History] API response status:', histRes.status);

        // Read response text first so we can log it even if JSON parse fails
        const rawText = await histRes.text();
        console.log('[History] API raw response:', rawText);

        if (!histRes.ok) {
          console.error('[History] API returned error status', histRes.status, rawText);
        } else {
          try {
            const parsed = JSON.parse(rawText);
            console.log('[History] Parsed response:', parsed);

            if (parsed.generation) {
              const pending = JSON.parse(sessionStorage.getItem('forge_history_pending') || '[]');
              pending.unshift(parsed.generation);
              sessionStorage.setItem('forge_history_pending', JSON.stringify(pending));
              console.log('[History] Wrote to sessionStorage. Pending count:', pending.length);
            } else {
              console.warn('[History] API succeeded but returned no generation object:', parsed);
            }
          } catch (parseErr) {
            console.error('[History] Failed to parse API response as JSON:', parseErr, rawText);
          }
        }
      } catch (err) {
        console.error('[History] Unexpected error during history save:', err);
      }

      // Trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.style.display = 'none'; a.href = downloadUrl; a.download = 'my-api.zip';
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(downloadUrl); document.body.removeChild(a);

      // Show deploy card instead of resetting to step 1
      setShowDeployCard(true);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const toggleTableSelection = (tableName) => { setSelectedTables(prev => prev.includes(tableName) ? prev.filter(t => t !== tableName) : [...prev, tableName]); };
  const toggleTableExpand = (tableName) => { setExpandedTables(prev => ({ ...prev, [tableName]: !prev[tableName] })); };

  const toggleAllTables = () => {
    if (selectedTables.length === schema.length) setSelectedTables([]);
    else setSelectedTables(schema.map(t => t.tableName));
  };

  const startGenerationFlow = () => {
    setSelectedPreviewFile('index.js');
    setShowPreviewModal(true);
  };

  const previewFiles = useMemo(() => {
    if (!showPreviewModal) return [];
    const files = [];
    files.push({ path: 'package.json', type: 'root', content: `{\n  "name": "forge-generated",\n  "version": "1.0.0",\n  "dependencies": {\n    "express": "^4.18.2",\n    "cors": "^2.8.5",\n    "pg": "^8.11.0"${authStrategy === 'JWT' ? ',\n    "jsonwebtoken": "^9.0.0"' : ''}\n  }\n}` });
    files.push({ path: '.env.example', type: 'root', content: `PORT=3000\nDATABASE_URL=postgres://user:password@localhost:5432/dbname\n${authStrategy === 'JWT' ? 'JWT_SECRET=your_jwt_secret_here\n' : authStrategy === 'API Key' ? 'API_KEY=your_api_key_here\n' : ''}` });
    files.push({ path: 'index.js', type: 'root', content: `const express = require('express');\nconst cors = require('cors');\nconst app = express();\n\napp.use(cors());\napp.use(express.json());\n\n${selectedTables.map(t => `const ${t}Routes = require('./src/routes/${t}');\napp.use('/api/${t}', ${t}Routes);`).join('\n')}\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));` });

    if (authStrategy !== 'None') {
      files.push({ path: 'src/middleware/auth.js', type: 'src/middleware', content: `// Custom Auth Middleware\nconst requireAuth = (req, res, next) => {\n  // Implementation for ${authStrategy}\n  next();\n};\nmodule.exports = requireAuth;` });
    }

    selectedTables.forEach(tName => {
      files.push({ path: `src/routes/${tName}.js`, type: 'src/routes', content: `const express = require('express');\nconst router = express.Router();\n${authStrategy !== 'None' ? "const requireAuth = require('../middleware/auth');\nrouter.use(requireAuth);\n" : ""}\n// GET all ${tName}\nrouter.get('/', async (req, res) => {\n  res.json({ message: 'Fetching all ${tName}' });\n});\n\n// GET ${tName} by id\nrouter.get('/:id', async (req, res) => {\n  res.json({ message: 'Fetching ${tName} ' + req.params.id });\n});\n\n// POST new ${tName}\nrouter.post('/', async (req, res) => {\n  res.json({ message: 'Creating new ${tName}' });\n});\n\n// PUT update ${tName}\nrouter.put('/:id', async (req, res) => {\n  res.json({ message: 'Updating ${tName} ' + req.params.id });\n});\n\n// DELETE ${tName}\nrouter.delete('/:id', async (req, res) => {\n  res.json({ message: 'Deleting ${tName} ' + req.params.id });\n});\n\nmodule.exports = router;` });
    });
    return files;
  }, [showPreviewModal, selectedTables, authStrategy]);

  const FileTreeNode = ({ name, path, icon, isFolder, children }) => {
    const isSelected = selectedPreviewFile === path;
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div onClick={() => !isFolder && setSelectedPreviewFile(path)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', cursor: isFolder ? 'default' : 'pointer', borderRadius: '6px', backgroundColor: isSelected ? '#1a1a1a' : 'transparent', color: isSelected ? '#6366f1' : (isFolder ? '#888888' : '#e2e8f0'), transition: 'all 150ms' }} onMouseEnter={e => { if (!isSelected && !isFolder) { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#ffffff'; } }} onMouseLeave={e => { if (!isSelected && !isFolder) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#e2e8f0'; } }}>
          {icon} {name}
        </div>
        {children && <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column' }}>{children}</div>}
      </div>
    );
  };

  const getAuthInfo = () => {
    if (authStrategy === 'None') return { text: "Routes will be publicly accessible. Good for internal tools.", color: '#2e2e2e', bg: '#0d0d0d' };
    if (authStrategy === 'API Key') return { text: "An X-API-Key header check will be added to all routes. A random key will be pre-filled in .env.example.", color: '#6366f1', bg: '#6366f115' };
    return { text: "A JWT verification middleware will wrap all routes. Add your JWT_SECRET to .env to activate.", color: '#22c55e', bg: '#22c55e15' };
  };

  const authInfo = getAuthInfo();

  return (
    <>
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '960px', margin: '0 auto', padding: '60px 24px', boxSizing: 'border-box', color: '#ffffff', overflowX: 'hidden' }}>
          <style>{`
                @keyframes badgePulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
                @keyframes scrollLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
            `}</style>

          {error && <div style={{ width: '100%', backgroundColor: '#111111', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px 16px', color: '#ef4444', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>{error}</div>}

          {/* BLOCK 2 — Hero heading + subtext */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Zap size={40} color="#6366f1" style={{ filter: 'drop-shadow(0 0 16px rgba(99,102,241,0.5))', marginBottom: '16px' }} />
            <h1 style={{ fontSize: '56px', fontWeight: '700', letterSpacing: '-0.03em', color: '#ffffff', textAlign: 'center', margin: '0 0 12px 0' }}>ForgeAPI</h1>
            <p style={{ fontSize: '17px', color: '#888888', textAlign: 'center', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto 40px' }}>
              Turn any PostgreSQL database into a production-ready REST API in seconds. No config. No boilerplate. Just paste and generate.
            </p>
          </div>

          {/* BLOCK 3 — Input + CTA */}
          <form onSubmit={handlePreview} style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Database size={20} color="#444444" style={{ position: 'absolute', left: '14px' }} />
              <input
                type="text" value={dbUrl} onChange={e => { setDbUrl(e.target.value); setError(null); }} disabled={loading}
                placeholder="postgres://username:password@hostname:5432/database_name"
                style={{ width: '100%', height: '52px', fontSize: '15px', backgroundColor: '#111111', border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : '#1e1e1e'}`, borderRadius: '10px', color: '#ffffff', padding: '0 16px 0 44px', boxSizing: 'border-box', outline: 'none', transition: 'all 150ms' }}
                onFocus={e => { e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.6)' : '#6366f1'; e.currentTarget.style.boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.1)' : '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.4)' : '#1e1e1e'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '12px 16px', marginTop: '8px', color: '#ef4444', fontSize: '13px' }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <span style={{ color: '#444444', fontSize: '13px', marginRight: '10px' }}>or try a demo →</span>
              {demoSamples.map((s) => {
                const isThisActive = activeDemoId === s.id;
                return (
                  <button
                    key={s.id} type="button" onClick={() => handleDemoClick(s)} disabled={loading}
                    style={{ margin: '0 4px', background: isThisActive ? 'rgba(99,102,241,0.08)' : 'transparent', border: '1px solid', borderColor: isThisActive ? '#6366f1' : '#1e1e1e', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', color: isThisActive ? '#6366f1' : '#888888', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 150ms' }}
                    onMouseOver={e => !loading && !isThisActive && (e.currentTarget.style.borderColor = '#6366f1', e.currentTarget.style.color = '#6366f1', e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                    onMouseOut={e => !loading && !isThisActive && (e.currentTarget.style.borderColor = '#1e1e1e', e.currentTarget.style.color = '#888888', e.currentTarget.style.background = 'transparent')}
                  >
                    {(loading && isThisActive) ? <span style={{ display: 'inline-block', marginRight: '6px' }}><Loader2 size={10} className="animate-spin" /></span> : null}
                    {s.label}
                  </button>
                );
              })}
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '16px', height: '52px', fontSize: '15px', fontWeight: '600', background: '#6366f1', border: 'none', borderRadius: '10px', color: '#ffffff', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 150ms' }} onMouseOver={e => !loading && (e.currentTarget.style.background = '#4f46e5', e.currentTarget.style.transform = 'translateY(-1px)', e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.3)')} onMouseOut={e => !loading && (e.currentTarget.style.background = '#6366f1', e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = 'none')}
              onMouseDown={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {(loading && !activeDemoId) ? <><Loader2 size={16} className="animate-spin" /> Connecting to database...</> : 'Preview Schema'}
            </button>
          </form>

          {/* BLOCK A — Animated ticker / marquee */}
          <div style={{ overflow: 'hidden', margin: '48px -24px 0 -24px', borderTop: '1px solid #1e1e1e', borderBottom: '1px solid #1e1e1e', padding: '16px 0', background: '#0a0a0a', width: 'calc(100% + 48px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Row 1 Left */}
              <div style={{ display: 'flex', width: 'max-content', animation: 'scrollLeft 30s linear infinite' }}>
                <div style={{ display: 'flex', gap: '12px', paddingRight: '12px' }}>
                  {['E-commerce API', 'Social Network API', 'Blog CMS API', 'Healthcare API', 'SaaS Platform API', 'Learning Management API', 'Inventory API', 'Booking System API', 'Analytics API', 'CRM API'].map((text, i) => (
                    <div key={i} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: '#888', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {text.replace('API', '')} <span style={{ color: '#6366f1' }}>API</span>
                    </div>
                  ))}
                </div>
                {/* Duplicate for infinite effect */}
                <div style={{ display: 'flex', gap: '12px', paddingRight: '12px' }}>
                  {['E-commerce API', 'Social Network API', 'Blog CMS API', 'Healthcare API', 'SaaS Platform API', 'Learning Management API', 'Inventory API', 'Booking System API', 'Analytics API', 'CRM API'].map((text, i) => (
                    <div key={`dup-${i}`} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: '#888', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {text.replace('API', '')} <span style={{ color: '#6366f1' }}>API</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Row 2 Right */}
              <div style={{ display: 'flex', width: 'max-content', animation: 'scrollRight 30s linear infinite' }}>
                <div style={{ display: 'flex', gap: '12px', paddingRight: '12px' }}>
                  {['JWT Auth Ready', 'SQL Injection Safe', 'Parameterized Queries', 'Express.js Routes', 'Auto-generated', '.env Included', 'package.json Ready', 'REST Standard', 'CRUD Complete', 'Zero Config'].map((text, i) => (
                    <div key={i} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: '#888', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {text.replace(/Auth|Safe/g, m => `<span style="color:#6366f1">${m}</span>`).split('<span').map((part, idx) => part.includes('style=') ? <span key={idx} style={{ color: '#6366f1' }}>{part.replace(' style="color:#6366f1">', '').replace('</span>', '')}</span> : part)}
                    </div>
                  ))}
                </div>
                {/* Duplicate for infinite effect */}
                <div style={{ display: 'flex', gap: '12px', paddingRight: '12px' }}>
                  {['JWT Auth Ready', 'SQL Injection Safe', 'Parameterized Queries', 'Express.js Routes', 'Auto-generated', '.env Included', 'package.json Ready', 'REST Standard', 'CRUD Complete', 'Zero Config'].map((text, i) => (
                    <div key={`dup2-${i}`} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: '#888', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {text.replace(/Auth|Safe/g, m => `<span style="color:#6366f1">${m}</span>`).split('<span').map((part, idx) => part.includes('style=') ? <span key={idx} style={{ color: '#6366f1' }}>{part.replace(' style="color:#6366f1">', '').replace('</span>', '')}</span> : part)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK B — Live stats counter row */}
          <div style={{ marginTop: '48px', paddingTop: '32px', paddingBottom: '32px', borderTop: '1px solid #1e1e1e', borderBottom: '1px solid #1e1e1e', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', textAlign: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ color: '#ffffff', fontSize: '32px', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: 1 }}>50+</div>
              <div style={{ color: '#888888', fontSize: '12px', marginTop: '4px' }}>Templates & Schemas</div>
              <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', height: '40px', width: '1px', backgroundColor: '#1e1e1e' }}></div>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ color: '#ffffff', fontSize: '32px', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: 1 }}>5x</div>
              <div style={{ color: '#888888', fontSize: '12px', marginTop: '4px' }}>Endpoints per Table</div>
              <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', height: '40px', width: '1px', backgroundColor: '#1e1e1e' }}></div>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ color: '#ffffff', fontSize: '32px', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: 1 }}>3</div>
              <div style={{ color: '#888888', fontSize: '12px', marginTop: '4px' }}>Auth Strategies</div>
              <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', height: '40px', width: '1px', backgroundColor: '#1e1e1e' }}></div>
            </div>
            <div>
              <div style={{ color: '#ffffff', fontSize: '32px', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: 1 }}>&lt; 5s</div>
              <div style={{ color: '#888888', fontSize: '12px', marginTop: '4px' }}>Generation Time</div>
            </div>
          </div>

          {/* BLOCK C — Bento grid feature showcase */}
          <div style={{ marginTop: '72px' }}>
            <div style={{ color: '#444444', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '28px' }}>EVERYTHING YOU NEED</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridTemplateRows: 'auto', gap: '12px' }}>

              {/* Card 1 */}
              <div style={{ gridColumn: 'span 4', background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '28px' }}>
                <Zap size={20} color="#6366f1" />
                <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600', marginTop: '12px' }}>Instant API Generation</div>
                <div style={{ color: '#888888', fontSize: '14px', lineHeight: 1.7, marginTop: '8px' }}>Paste a URI. Preview the schema. Download a complete Express REST API in under 5 seconds. Routes, middleware, env config — all included.</div>
                <div style={{ background: '#0d0d0d', borderRadius: '8px', padding: '16px', marginTop: '20px', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.8 }}>
                  <span style={{ color: '#888' }}>// GET /api/users</span><br />
                  <span style={{ color: '#6366f1' }}>router</span>.get(<span style={{ color: '#22c55e' }}>'/'</span>, async (req, res) =&gt; {'{'}<br />
                  &nbsp;&nbsp;const result = await pool.query(<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#22c55e' }}>'SELECT * FROM users'</span><br />
                  &nbsp;&nbsp;);<br />
                  &nbsp;&nbsp;res.json(result.rows);<br />
                  {'}'});
                </div>
              </div>

              {/* Card 2 */}
              <div style={{ gridColumn: 'span 2', background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column' }}>
                <Shield size={20} color="#6366f1" />
                <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginTop: '12px' }}>SQL Safe</div>
                <div style={{ color: '#888888', fontSize: '13px', lineHeight: 1.6, marginTop: '8px', flex: 1 }}>Parameterized queries on every single route. $1, $2 always.</div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', marginTop: '16px' }}>
                  <div style={{ color: '#ef4444', textDecoration: 'line-through', marginBottom: '8px' }}>❌ '...id=' + id</div>
                  <div style={{ color: '#22c55e' }}>✓ '...id=$1'</div>
                </div>
              </div>

              {/* Card 3 */}
              <div style={{ gridColumn: 'span 2', background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column' }}>
                <Key size={20} color="#6366f1" />
                <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginTop: '12px' }}>3 Auth Modes</div>
                <div style={{ color: '#888888', fontSize: '13px', lineHeight: 1.6, marginTop: '8px', flex: 1 }}>None, API Key, or JWT. Pick one and it's wired up automatically.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#888', background: '#1a1a1a', padding: '4px 8px', borderRadius: '12px', width: 'max-content' }}>None</div>
                  <div style={{ fontSize: '11px', color: '#f59e0b', background: '#f59e0b20', padding: '4px 8px', borderRadius: '12px', width: 'max-content' }}>API Key</div>
                  <div style={{ fontSize: '11px', color: '#6366f1', background: '#6366f120', padding: '4px 8px', borderRadius: '12px', width: 'max-content' }}>JWT</div>
                </div>
              </div>

              {/* Card 4 */}
              <div style={{ gridColumn: 'span 2', background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column' }}>
                <Upload size={20} color="#6366f1" />
                <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginTop: '12px' }}>CSV & JSON Import</div>
                <div style={{ color: '#888888', fontSize: '13px', lineHeight: 1.6, marginTop: '8px', flex: 1 }}>Upload any dataset file and we'll infer the schema automatically.</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#fff', background: '#1a1a1a', border: '1px solid #2e2e2e', padding: '4px 8px', borderRadius: '6px' }}>.csv</div>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#fff', background: '#1a1a1a', border: '1px solid #2e2e2e', padding: '4px 8px', borderRadius: '6px' }}>.json</div>
                </div>
              </div>

              {/* Card 5 */}
              <div style={{ gridColumn: 'span 2', background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column' }}>
                <GitCompare size={20} color="#6366f1" />
                <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginTop: '12px' }}>Schema Diff</div>
                <div style={{ color: '#888888', fontSize: '13px', lineHeight: 1.6, marginTop: '8px', flex: 1 }}>Compare two databases side by side. See exactly what changed.</div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', marginTop: '16px' }}>
                  <div style={{ color: '#22c55e', marginBottom: '8px' }}>+ profiles added</div>
                  <div style={{ color: '#ef4444' }}>- auth_logs</div>
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK D — Testimonial / quote bar */}
          <div style={{ marginTop: '72px', textAlign: 'center' }}>
            <div style={{ fontSize: '72px', lineHeight: 1, fontFamily: 'serif', color: '#1e1e1e', marginBottom: '-16px' }}>"</div>
            <div style={{ color: '#ffffff', fontSize: '20px', fontStyle: 'italic', maxWidth: '500px', margin: '0 auto' }}>The fastest way to go from database to running API. Period.</div>
            <div style={{ color: '#444444', fontSize: '13px', marginTop: '12px' }}>— Built for developers who ship fast</div>
          </div>

          {/* BLOCK E — Final CTA strip */}
          <div style={{ marginTop: '72px', borderTop: '1px solid #1e1e1e', paddingTop: '48px', textAlign: 'center' }}>
            <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Ready to generate your API?</div>
            <div style={{ color: '#888888', fontSize: '14px', marginBottom: '24px' }}>No account needed. No credit card. Just your database URI.</div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => handleDemoClick(demoSamples.find(d => d.id === 'ecommerce') || demoSamples[0])}
                style={{ border: '1px solid #1e1e1e', color: '#ffffff', background: 'transparent', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', cursor: 'pointer', transition: 'all 150ms' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Try a Demo
              </button>
              <button
                type="button"
                onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); document.querySelector('input[type="text"]')?.focus(); }}
                style={{ border: 'none', color: '#ffffff', background: '#6366f1', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', cursor: 'pointer', transition: 'all 150ms', fontWeight: '500' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#4f46e5'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#6366f1'}
              >
                Preview Schema →
              </button>
            </div>
          </div>

        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '860px', margin: '0 auto', padding: '40px 48px', boxSizing: 'border-box', minHeight: '100vh', overflowX: 'hidden', color: '#ffffff' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeInUp 400ms ease-out' }}>

            {/* SECTION 1: Page Header */}
            {new URLSearchParams(window.location.search).has('schema') && (
              <div style={{ backgroundColor: '#a855f720', border: '1px solid #a855f740', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '-16px' }}>
                <span style={{ color: '#a855f7', fontSize: '13px', fontWeight: '500' }}>Viewing shared schema</span>
                <button onClick={() => { setStep(1); setSchema([]); window.history.replaceState({}, '', '/'); }} style={{ background: 'transparent', border: 'none', color: '#888888', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>Start fresh</button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '600', letterSpacing: '-0.02em', margin: 0, color: '#ffffff' }}>API Generation</h1>
                <p style={{ fontSize: '15px', color: '#888888', margin: 0, lineHeight: 1.6 }}>Review stats, select tables, and click generate.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {isDemoMode && !isImportedMode && !isAiMode && <div style={{ border: '1px solid #1e1e1e', backgroundColor: '#111111', color: '#888888', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6366f1' }} />{demoLabel}</div>}
                {templateName && <div style={{ border: '1px solid #1e1e1e', backgroundColor: '#111111', color: '#888888', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6366f1' }} />TEMPLATE: {templateName.toUpperCase()}</div>}
                {isImportedMode && <div style={{ border: '1px solid #1e1e1e', backgroundColor: '#111111', color: '#888888', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />IMPORTED</div>}
                {isAiMode && <div style={{ border: '1px solid #1e1e1e', backgroundColor: '#111111', color: '#888888', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={12} color="#a855f7" />AI GENERATED</div>}
                <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#ffffff', padding: '8px 14px', fontSize: '13px', cursor: 'pointer', transition: 'border-color 150ms' }} onMouseOver={e => e.currentTarget.style.borderColor = '#6366f1'} onMouseOut={e => e.currentTarget.style.borderColor = '#1e1e1e'}>
                  <Share2 size={16} color="#6366f1" /> Share Schema
                </button>
                <button onClick={() => { setStep(1); setSchema([]); setIsDemoMode(false); setActiveDemoId(null); setTemplateName(''); setIsSharedMode(false); setIsImportedMode(false); setIsAiMode(false); window.history.replaceState({}, '', '/'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', border: 'none', color: '#888888', padding: '8px 14px', fontSize: '14px', cursor: 'pointer', transition: 'color 150ms' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#888888'}>
                  <ArrowLeft size={16} /> Start Over
                </button>
              </div>
            </div>

            {/* SECTION 2: SchemaStats */}
            <SchemaStats schema={schema} authStrategy={authStrategy} />

            {/* SECTION 3: Endpoint Preview Component */}
            <div style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
              <div onClick={() => setPreviewExpanded(!previewExpanded)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', backgroundColor: previewExpanded ? '#1a1a1a' : 'transparent', borderBottom: previewExpanded ? '1px solid #1e1e1e' : 'none', transition: 'background-color 150ms' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>Endpoint Preview</span>
                  <span style={{ backgroundColor: '#0a0a0a', border: '1px solid #2e2e2e', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', color: '#888888' }}>{selectedTables.length * 5} endpoints</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {previewExpanded && (
                    <button onClick={copyAllRoutes} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#6366f1', fontSize: '13px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = '#818cf8'} onMouseOut={e => e.currentTarget.style.color = '#6366f1'}>
                      <Copy size={14} /> Copy all routes
                    </button>
                  )}
                  {previewExpanded ? <ChevronUp size={18} color="#888" /> : <ChevronDown size={18} color="#888" />}
                </div>
              </div>

              <div ref={previewContentRef} style={{ maxHeight: previewExpanded ? '800px' : '0px', overflowY: 'auto', transition: 'max-height 300ms ease-in-out' }}>
                <div style={{ padding: '0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '16px', padding: '12px 20px', backgroundColor: '#080808', borderBottom: '1px solid #1e1e1e', position: 'sticky', top: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444444', fontWeight: '600' }}>
                    <div>Method</div> <div>Path</div> <div>Description</div>
                  </div>
                  {schema.filter(t => selectedTables.includes(t.tableName)).map((table, tIdx) => {
                    const routes = getMethods(table.tableName);
                    return routes.map((route, rIdx) => {
                      const globalIdx = tIdx * routes.length + rIdx;
                      return (
                        <div key={`${table.tableName}-${route.method}-${route.path}`} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '16px', padding: '12px 20px', backgroundColor: globalIdx % 2 === 0 ? '#0d0d0d' : '#111111', borderBottom: '1px solid #1e1e1e', alignItems: 'center' }}>
                          <div style={{ backgroundColor: getMethodBg(route.method), color: '#0a0a0a', fontSize: '11px', fontWeight: '600', fontFamily: 'monospace', borderRadius: '4px', padding: '3px 0', textAlign: 'center', width: '56px' }}>{route.method}</div>
                          <div style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '13px' }}>{route.path}</div>
                          <div style={{ color: '#888888', fontSize: '13px' }}>{route.desc}</div>
                        </div>
                      );
                    });
                  })}
                  {selectedTables.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: '#888' }}>Select tables below to preview routes.</div>}
                </div>
              </div>
            </div>

            {/* SECTION 4: Select Tables */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#ffffff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  Select Tables
                  {isDemoMode && <span style={{ backgroundColor: '#f59e0b20', color: '#f59e0b', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', border: '1px solid #f59e0b40', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{demoLabel}</span>}
                </h2>
                <button onClick={toggleAllTables} style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '13px', cursor: 'pointer', padding: 0 }} onMouseOver={e => e.currentTarget.style.color = '#818cf8'} onMouseOut={e => e.currentTarget.style.color = '#6366f1'}>
                  {selectedTables.length === schema.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {schema.map((table, index) => {
                const isSelected = selectedTables.includes(table.tableName);
                const isExpanded = expandedTables[table.tableName];
                const tBorderColor = borderColors[index % borderColors.length];
                return (
                  <div key={table.tableName} style={{ backgroundColor: '#111111', border: `1px solid ${isSelected ? '#2e2e2e' : '#1e1e1e'}`, borderLeft: `3px solid ${tBorderColor}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 150ms', animation: 'fadeInUp 300ms ease-out forwards', opacity: 0, animationDelay: `${index * 50}ms` }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', cursor: 'pointer', gap: '12px' }} onClick={() => toggleTableExpand(table.tableName)}>
                      <div onClick={(e) => { e.stopPropagation(); toggleTableSelection(table.tableName); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {isSelected ? <CheckSquare size={18} color="#6366f1" /> : <Square size={18} color="#444444" />}
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>{table.tableName}</span>
                        <span style={{ backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', color: '#888888' }}>{table.columns.length} cols</span>
                      </div>
                      {isExpanded ? <ChevronUp size={18} color="#888888" /> : <ChevronDown size={18} color="#888888" />}
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '0 16px 14px 46px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {table.columns.map(col => (
                          <div key={col.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#ffffff', fontSize: '13px' }}>{col.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6366f1', backgroundColor: '#1a1a1a', padding: '2px 8px', borderRadius: '4px' }}>{col.type}</span>
                              <span style={{ fontSize: '11px', color: '#444444', backgroundColor: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' }}>{col.isNullable ? 'NULL' : 'NOT NULL'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SECTION 5: Authentication Strategy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>Authentication Strategy</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['None', 'API Key', 'JWT'].map((strategy) => (
                  <div key={strategy} onClick={() => setAuthStrategy(strategy)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', backgroundColor: '#111111', border: `1px solid ${authStrategy === strategy ? '#6366f1' : '#1e1e1e'}`, boxShadow: authStrategy === strategy ? '0 0 0 2px #6366f1' : 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', color: authStrategy === strategy ? '#ffffff' : '#888888', fontWeight: '500', transition: 'all 150ms ease' }}>
                    {getAuthIcon(strategy)}
                    {strategy}
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: authInfo.bg, borderLeft: `3px solid ${authInfo.color}`, borderRadius: '0 8px 8px 0', padding: '12px 16px', fontSize: '13px', color: '#888888' }}>
                {authInfo.text}
              </div>
            </div>

            {/* SECTION 6: Action row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px', paddingBottom: '60px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '20px', fontSize: '13px', color: '#888' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} color="#22c55e" /> {selectedTables.length} tables selected</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} color="#22c55e" /> {selectedTables.length * 5} endpoints</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} color="#22c55e" /> Auth: {authStrategy}</div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => setStep(1)} style={{ backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '12px', color: '#888888', padding: '10px 24px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: '150ms' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#2e2e2e'; e.currentTarget.style.color = '#ffffff' }} onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#888888' }}>
                  Back
                </button>
                <button onClick={startGenerationFlow} disabled={loading || selectedTables.length === 0} style={{ flex: 1, height: '54px', background: 'linear-gradient(90deg, #6366f1, #818cf8, #6366f1)', backgroundSize: '200% auto', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: (loading || selectedTables.length === 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: (loading || selectedTables.length === 0) ? 0.7 : 1, transition: 'all 200ms ease' }} onMouseEnter={e => !(loading || selectedTables.length === 0) && (e.currentTarget.style.animation = 'shimmer 2s linear infinite')} onMouseLeave={e => !(loading || selectedTables.length === 0) && (e.currentTarget.style.animation = 'none')}>
                  Review & Generate API
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {showPreviewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '16px', width: '900px', maxWidth: '95vw', height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#ffffff' }}>Code Preview</h2>
                <span style={{ color: '#888888', fontSize: '13px' }}>Reviewing {previewFiles.length} files</span>
              </div>
              <button onClick={() => setShowPreviewModal(false)} disabled={loading} style={{ background: 'transparent', border: 'none', color: '#888888', cursor: 'pointer', padding: '4px' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#888888'}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <div style={{ width: '220px', backgroundColor: '#080808', borderRight: '1px solid #1e1e1e', padding: '16px', fontSize: '13px', overflowY: 'auto' }}>
                <FileTreeNode name="src/" path="root/src" icon={<Folder size={14} color="#888" />} isFolder>
                  <FileTreeNode name="routes/" path="root/src/routes" icon={<Folder size={14} color="#888" />} isFolder>
                    {previewFiles.filter(f => f.type === 'src/routes').map(f => (
                      <FileTreeNode key={f.path} name={f.path.replace('src/routes/', '')} path={f.path} icon={<FileText size={14} />} />
                    ))}
                  </FileTreeNode>
                  {previewFiles.some(f => f.type === 'src/middleware') && (
                    <FileTreeNode name="middleware/" path="root/src/middleware" icon={<Folder size={14} color="#888" />} isFolder>
                      {previewFiles.filter(f => f.type === 'src/middleware').map(f => (
                        <FileTreeNode key={f.path} name={f.path.replace('src/middleware/', '')} path={f.path} icon={<FileText size={14} />} />
                      ))}
                    </FileTreeNode>
                  )}
                </FileTreeNode>
                {previewFiles.filter(f => f.type === 'root').map(f => (
                  <FileTreeNode key={f.path} name={f.path} path={f.path} icon={<FileText size={14} />} />
                ))}
              </div>

              <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#0a0a0a' }}>
                <SyntaxCode code={previewFiles.find(f => f.path === selectedPreviewFile)?.content || '// Error: Cannot read file.'} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #1e1e1e', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowPreviewModal(false)} disabled={loading} style={{ backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#ffffff', padding: '8px 16px', fontSize: '14px', cursor: 'pointer', transition: '150ms' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#2e2e2e' }} onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e1e' }}>
                Cancel
              </button>
              <button onClick={executeDownload} disabled={loading} style={{ backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1, transition: 'background-color 150ms' }} onMouseOver={e => !loading && (e.currentTarget.style.backgroundColor = '#4f46e5')} onMouseOut={e => !loading && (e.currentTarget.style.backgroundColor = '#6366f1')}>
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Compiling...' : 'Download ZIP'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast isVisible={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
    </>
  );
};
export default GeneratorFlow;
