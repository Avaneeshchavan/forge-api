import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

const getMockValue = (type) => {
  const t = type.toLowerCase();
  if (t.includes('int') || t.includes('numeric') || t.includes('decimal') || t.includes('float')) return 1;
  if (t.includes('bool')) return true;
  if (t.includes('date') || t.includes('time')) return new Date().toISOString();
  if (t.includes('json')) return { key: "value" };
  return "string";
};

const getExampleObject = (columns, excludeId = false) => {
  const obj = {};
  columns.forEach(col => { if (excludeId && col.name.toLowerCase() === 'id') return; obj[col.name] = getMockValue(col.type); });
  return obj;
};

const EndpointRow = ({ method, path, description, requestBody, responseBody }) => {
  const [expanded, setExpanded] = useState(false);
  const getMethodBg = (m) => {
    switch(m) {
      case 'GET': return '#22c55e'; // success
      case 'POST': return '#6366f1'; // accent
      case 'PUT': return '#f59e0b'; // warning
      case 'DELETE': return '#ef4444'; // danger
      default: return '#888888';
    }
  };

  return (
    <div style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', marginBottom: '8px', overflow: 'hidden' }}>
      <div onClick={() => setExpanded(!expanded)} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px', cursor: 'pointer', backgroundColor: expanded ? '#1a1a1a' : 'transparent', transition: 'background-color 150ms' }}>
        <span style={{ backgroundColor: getMethodBg(method), color: '#0a0a0a', fontWeight: '600', fontSize: '11px', borderRadius: '4px', padding: '3px 8px', fontFamily: 'monospace', width: '42px', textAlign: 'center' }}>{method}</span>
        <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#ffffff', flex: 1 }}>{path}</span>
        <span style={{ fontSize: '13px', color: '#888888', display: 'flex', alignItems: 'center', gap: '12px' }}>
           {description}
           {expanded ? <ChevronUp size={16} color="#888888"/> : <ChevronDown size={16} color="#888888"/>}
        </span>
      </div>
      <div style={{ maxHeight: expanded ? '1000px' : '0', overflow: 'hidden', transition: 'max-height 200ms ease-in-out' }}>
        <div style={{ padding: '16px', borderTop: '1px solid #1e1e1e', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requestBody && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#888888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Request Body</div>
              <pre style={{ margin: 0, padding: '12px', backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '8px', fontSize: '12px', color: '#ffffff', overflowX: 'auto', fontFamily: 'monospace' }}>
                {JSON.stringify(requestBody, null, 2)}
              </pre>
            </div>
          )}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#888888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Response (200 OK)</div>
            <pre style={{ margin: 0, padding: '12px', backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '8px', fontSize: '12px', color: '#ffffff', overflowX: 'auto', fontFamily: 'monospace' }}>
              {JSON.stringify(responseBody, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

const EndpointDocs = ({ schema }) => {
  const [copied, setCopied] = useState(false);
  const handleCopyOpenAPI = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  
  if (!schema || schema.length === 0) return <div style={{ color: '#888888', textAlign: 'center', padding: '40px' }}>No schema available</div>;

  return (
    <div style={{ color: '#ffffff', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button onClick={handleCopyOpenAPI} style={{ backgroundColor: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#888888', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'border-color 150ms, color 150ms' }} onMouseOver={e=>{e.currentTarget.style.borderColor='#2e2e2e';e.currentTarget.style.color='#ffffff'}} onMouseOut={e=>{e.currentTarget.style.borderColor='#1e1e1e';e.currentTarget.style.color='#888888'}}>
          {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy OpenAPI JSON'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {schema.map((table) => {
          const tName = table.tableName;
          const itemExample = getExampleObject(table.columns);
          const postExample = getExampleObject(table.columns, true);
          return (
            <div key={tName}>
              <h3 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 12px 0', borderBottom: '1px solid #1e1e1e', paddingBottom: '8px' }}>{tName}</h3>
              <EndpointRow method="GET" path={`/api/${tName}`} description={`Retrieve all ${tName}`} responseBody={[itemExample]} />
              <EndpointRow method="GET" path={`/api/${tName}/:id`} description={`Retrieve a single ${tName}`} responseBody={itemExample} />
              <EndpointRow method="POST" path={`/api/${tName}`} description={`Create new ${tName}`} requestBody={postExample} responseBody={itemExample} />
              <EndpointRow method="DELETE" path={`/api/${tName}/:id`} description={`Delete ${tName}`} responseBody={{ message: "Deleted successfully" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default EndpointDocs;
