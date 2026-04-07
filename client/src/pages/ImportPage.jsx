import React, { useState, useRef } from 'react';
import { Upload, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const borderColors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];
const dataTypes = ['integer', 'numeric', 'character varying', 'text', 'boolean', 'timestamp', 'date'];

const inferType = (values) => {
    let counts = { num: 0, bool: 0, date: 0, str: 0 };
    let nCount = 0;
    
    for (let v of values) {
        if (v === null || v === undefined || v === '') continue;
        nCount++;
        let s = String(v).trim();
        
        if (s.toLowerCase() === 'true' || s.toLowerCase() === 'false') { counts.bool++; continue; }
        if (!isNaN(Number(s)) && s !== '') { counts.num++; continue; }
        if (!isNaN(Date.parse(s)) && (s.includes('-') || s.includes('/')) && /[a-zA-Z0-9]/.test(s)) {
            if (/^\d{4}-\d{2}-\d{2}/.test(s) || /^\d{2}\/\d{2}\/\d{4}/.test(s) || /^\d{4}-\d{2}-\d{2}T/.test(s)) {
                counts.date++; continue; 
            }
        }
        counts.str++;
    }

    if (nCount === 0) return 'character varying';
    if (counts.str > 0) return 'character varying';
    if (counts.date === nCount) return 'timestamp';
    if (counts.bool === nCount) return 'boolean';
    if (counts.num === nCount) {
        for (let v of values) {
             if (String(v).includes('.')) return 'numeric';
        }
        return 'integer';
    }
    return 'character varying';
};

const isNullable = (values) => values.some(v => v === null || v === undefined || v === '') ? 'YES' : 'NO';

const sanitizeTableName = (filename) => {
    let base = filename.replace(/\.(csv|json)$/i, '');
    return base.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};

const ImportPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [tables, setTables] = useState([]);
    const [errors, setErrors] = useState([]);
    const [expandedTables, setExpandedTables] = useState({});
    const [openDropdown, setOpenDropdown] = useState(null); // { tableIdx, colIdx }

    const parseCSV = (content) => {
        const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length < 2) throw new Error("CSV requires at least a header and 1 data row");
        
        // Very basic comma split supporting simple unquoted CSVs
        const splitRow = (line) => {
            let result = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                if (line[i] === '"') inQuotes = !inQuotes;
                else if (line[i] === ',' && !inQuotes) { result.push(current); current = ''; }
                else current += line[i];
            }
            result.push(current);
            return result.map(s => s.trim());
        };

        const headers = splitRow(lines[0]);
        const dataRows = lines.slice(1, 11).map(splitRow);
        
        return headers.map((h, i) => {
            const colValues = dataRows.map(row => row[i]);
            return {
                column_name: h || `col_${i+1}`,
                data_type: inferType(colValues),
                is_nullable: isNullable(colValues)
            };
        });
    };

    const parseJSON = (content, filename) => {
        let parsed;
        try { parsed = JSON.parse(content); } catch(e) { throw new Error("Invalid JSON format"); }
        
        if (Array.isArray(parsed)) {
            if (parsed.length === 0) throw new Error("Empty JSON Array");
            const headers = Object.keys(parsed[0]);
            const sample = parsed.slice(0, 10);
            const columns = headers.map(h => {
                 const colValues = sample.map(row => row[h]);
                 return { column_name: h, data_type: inferType(colValues), is_nullable: isNullable(colValues) };
            });
            return [{ name: sanitizeTableName(filename), columns, source: filename }];
        } else if (typeof parsed === 'object') {
            const out = [];
            for (const key of Object.keys(parsed)) {
                 const val = parsed[key];
                 if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
                     const headers = Object.keys(val[0]);
                     const sample = val.slice(0, 10);
                     const columns = headers.map(h => {
                         const colValues = sample.map(row => row[h]);
                         return { column_name: h, data_type: inferType(colValues), is_nullable: isNullable(colValues) };
                     });
                     out.push({ name: key, columns, source: `${filename} (${key})` });
                 }
            }
            if (out.length === 0) throw new Error("JSON Object does not contain array of objects");
            return out;
        }
        
        throw new Error("JSON root must be an array or object of arrays");
    };

    const processFile = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    if (file.name.toLowerCase().endsWith('.csv')) {
                        const columns = parseCSV(content);
                        resolve([{ name: sanitizeTableName(file.name), columns, source: file.name }]);
                    } else if (file.name.toLowerCase().endsWith('.json')) {
                        resolve(parseJSON(content, file.name));
                    } else {
                        reject(new Error("Unsupported file type"));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error("File read error"));
            reader.readAsText(file);
        });
    };

    const handleFiles = async (files) => {
        setErrors([]);
        const newTables = [...tables];
        let eMap = { ...expandedTables };

        for (const file of Array.from(files)) {
            try {
                const parsedTbls = await processFile(file);
                parsedTbls.forEach(t => {
                    newTables.push(t);
                    eMap[t.name] = true;
                });
            } catch (err) {
                setErrors(prev => [...prev, { filename: file.name, message: err.message }]);
            }
        }
        setTables(newTables);
        setExpandedTables(eMap);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const toggleTableExpand = (name) => {
        setExpandedTables(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const updateDataType = (tIdx, cIdx, type) => {
        const cloned = [...tables];
        cloned[tIdx].columns[cIdx].data_type = type;
        setTables(cloned);
        setOpenDropdown(null);
    };

    const deleteTable = (tIdx) => {
        setTables(prev => prev.filter((_, idx) => idx !== tIdx));
    };

    const saveAndUseSchema = () => {
        const payload = {
            tables: tables.map(t => ({
                name: t.name,
                columns: t.columns.map(c => ({
                    column_name: c.column_name,
                    data_type: c.data_type,
                    is_nullable: c.is_nullable
                }))
            }))
        };
        sessionStorage.setItem('forge_import_schema', JSON.stringify(payload));
        navigate('/');
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 48px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Upload size={20} color="#6366f1" />
                <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>Import Dataset</h1>
            </div>
            <p style={{ color: '#888888', fontSize: '14px', marginTop: 0, marginBottom: '40px' }}>Upload CSV or JSON files to generate a schema and API automatically</p>

            <div 
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                    border: `2px dashed ${dragActive ? '#6366f1' : '#1e1e1e'}`, 
                    borderRadius: '16px', 
                    padding: '60px 40px', 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    backgroundColor: dragActive ? 'rgba(99,102,241,0.05)' : '#080808',
                    transition: 'all 150ms ease',
                    marginBottom: '48px'
                }}
            >
                <Upload size={32} color={dragActive ? '#6366f1' : '#444444'} style={{ transition: 'color 150ms' }} />
                <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '500', marginTop: '16px' }}>Drop CSV or JSON files here</div>
                <div style={{ color: '#888888', fontSize: '13px', marginTop: '4px' }}>or click to browse</div>
                <div style={{ color: '#444444', fontSize: '11px', marginTop: '8px' }}>Supports .csv and .json · Multiple files allowed</div>
                <input 
                    type="file" 
                    accept=".csv,.json" 
                    multiple 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={e => handleFiles(e.target.files)} 
                />
            </div>

            {errors.map((err, i) => (
                <div key={i} style={{ backgroundColor: '#111111', border: '1px solid #ef4444', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', animation: 'fadeInUp 300ms ease-out' }}>
                    <div style={{ color: '#ef4444', fontWeight: '500', fontSize: '13px' }}>{err.filename}</div>
                    <div style={{ color: '#888888', fontSize: '13px' }}>Could not parse — make sure it is valid CSV or JSON</div>
                    <button onClick={() => setErrors(e => e.filter((_, x) => x !== i))} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}><X size={14}/></button>
                </div>
            ))}

            {tables.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #1e1e1e' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600' }}>Detected Schema</span>
                            <span style={{ backgroundColor: '#111111', border: '1px solid #2e2e2e', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', color: '#888' }}>{tables.length} tables</span>
                        </div>
                        <button onClick={saveAndUseSchema} style={{ backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: '150ms' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#4f46e5'} onMouseOut={e=>e.currentTarget.style.backgroundColor='#6366f1'}>
                            Use This Schema →
                        </button>
                    </div>

                    {tables.map((table, tIdx) => {
                        const isExpanded = expandedTables[table.name];
                        const colBorder = borderColors[tIdx % borderColors.length];
                        
                        return (
                            <div key={tIdx} style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderLeft: `3px solid ${colBorder}`, borderRadius: '12px', overflow: 'visible', animation: 'fadeInUp 300ms ease-out' }}>
                                <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', cursor: 'pointer', position: 'relative' }} onClick={() => toggleTableExpand(table.name)}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>{table.name}</span>
                                        <span style={{ backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', color: '#888' }}>{table.columns.length} cols</span>
                                        <span style={{ fontStyle: 'italic', fontSize: '12px', color: '#444' }}>{table.source}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        {isExpanded ? <ChevronUp size={18} color="#888" /> : <ChevronDown size={18} color="#888" />}
                                        <button onClick={(e) => { e.stopPropagation(); deleteTable(tIdx); }} style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', padding: 0 }} onMouseOver={e=>e.currentTarget.style.color='#ef4444'} onMouseOut={e=>e.currentTarget.style.color='#444'}><X size={16} /></button>
                                    </div>
                                </div>
                                
                                {isExpanded && (
                                    <div style={{ padding: '0 16px 14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {table.columns.map((col, cIdx) => (
                                            <div key={cIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1e1e1e', paddingTop: '8px' }}>
                                                <span style={{ color: '#ffffff', fontSize: '13px' }}>{col.column_name}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                                                    
                                                    <div 
                                                        onClick={() => setOpenDropdown(openDropdown?.tIdx === tIdx && openDropdown?.cIdx === cIdx ? null : { tIdx, cIdx })}
                                                        style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6366f1', backgroundColor: '#1a1a1a', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #2e2e2e' }}
                                                    >
                                                        {col.data_type} <ChevronDown size={10} />
                                                    </div>
                                                    
                                                    {openDropdown?.tIdx === tIdx && openDropdown?.cIdx === cIdx && (
                                                        <div style={{ position: 'absolute', top: '24px', right: '60px', backgroundColor: '#111', border: '1px solid #2e2e2e', borderRadius: '8px', zIndex: 50, padding: '4px', width: '160px', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
                                                            {dataTypes.map(typ => (
                                                                <div 
                                                                    key={typ} 
                                                                    onClick={() => updateDataType(tIdx, cIdx, typ)}
                                                                    style={{ padding: '6px 12px', fontSize: '11px', fontFamily: 'monospace', color: typ === col.data_type ? '#6366f1' : '#888', cursor: 'pointer', borderRadius: '4px' }}
                                                                    onMouseOver={e=>e.currentTarget.style.backgroundColor='#1a1a1a'}
                                                                    onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}
                                                                >
                                                                    {typ}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <span style={{ fontSize: '11px', color: '#444444', backgroundColor: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' }}>{col.isNullable === 'YES' ? 'NULL' : 'NOT NULL'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ImportPage;
