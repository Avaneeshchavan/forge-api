import React, { useMemo } from 'react';
import { CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';

const compareSchemas = (beforeList, afterList) => {
    const beforeMap = {};
    const afterMap = {};
    (beforeList || []).forEach(t => beforeMap[t.tableName] = t);
    (afterList || []).forEach(t => afterMap[t.tableName] = t);

    const diffs = {
        added: [],
        removed: [],
        changed: []
    };

    for (const tName in afterMap) {
        if (!beforeMap[tName]) {
            diffs.added.push(afterMap[tName]);
        } else {
            const beforeCols = beforeMap[tName].columns || [];
            const afterCols = afterMap[tName].columns || [];
            const bColMap = {}; const aColMap = {};
            beforeCols.forEach(c => bColMap[c.name] = c);
            afterCols.forEach(c => aColMap[c.name] = c);

            const colDiffs = { added: [], removed: [], changed: [] };
            for (const cName in aColMap) {
                if (!bColMap[cName]) colDiffs.added.push(aColMap[cName]);
                else {
                    const bc = bColMap[cName]; const ac = aColMap[cName];
                    if (bc.type !== ac.type || bc.isNullable !== ac.isNullable) {
                        colDiffs.changed.push({ before: bc, after: ac });
                    }
                }
            }
            for (const cName in bColMap) {
                if (!aColMap[cName]) colDiffs.removed.push(bColMap[cName]);
            }

            if (colDiffs.added.length > 0 || colDiffs.removed.length > 0 || colDiffs.changed.length > 0) {
                diffs.changed.push({ tableName: tName, columnsAdded: colDiffs.added, columnsRemoved: colDiffs.removed, columnsChanged: colDiffs.changed });
            }
        }
    }

    for (const tName in beforeMap) {
        if (!afterMap[tName]) {
            diffs.removed.push(beforeMap[tName]);
        }
    }

    return diffs;
};

const SchemaDiff = ({ before, after }) => {
    const diff = useMemo(() => compareSchemas(before, after), [before, after]);

    if (!before || !after) return null;

    const noChanges = diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0;
    
    let changedColsTotal = 0;
    diff.changed.forEach(t => {
        changedColsTotal += t.columnsAdded.length + t.columnsRemoved.length + t.columnsChanged.length;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', fontSize: '13px', fontWeight: '500' }}>
                <span style={{ color: '#22c55e' }}>{diff.added.length} tables added</span>
                <span style={{ color: '#444444' }}>•</span>
                <span style={{ color: '#ef4444' }}>{diff.removed.length} tables removed</span>
                <span style={{ color: '#444444' }}>•</span>
                <span style={{ color: '#f59e0b' }}>{changedColsTotal} columns changed</span>
            </div>

            {noChanges ? (
                <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', color: '#888888', fontSize: '14px' }}>
                    No structural changes detected between schemas.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Added Tables */}
                    {diff.added.map((table, i) => (
                        <div key={`added-${table.tableName}`} style={{ backgroundColor: '#0d1f14', border: '1px solid #1a3824', borderRadius: '12px', overflow: 'hidden', animation: 'fadeInUp 300ms ease-out both', animationDelay: `${i * 50}ms` }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid #1a3824', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CheckCircle2 size={18} color="#22c55e" style={{ animation: 'rotateIn 400ms ease-out forwards' }} />
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#4ade80' }}>{table.tableName}</span>
                                <span style={{ fontSize: '12px', color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>New Table</span>
                            </div>
                            <div style={{ padding: '12px 16px 16px 46px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {table.columns.map(col => (
                                    <div key={col.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#4ade80', fontSize: '13px' }}>
                                        <span>+ {col.name}</span>
                                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontFamily: 'monospace' }}>
                                            <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>{col.type}</span>
                                            <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>{col.isNullable ? 'NULL' : 'NOT NULL'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Removed Tables */}
                    {diff.removed.map((table, i) => (
                        <div key={`removed-${table.tableName}`} style={{ backgroundColor: '#1f0d0d', border: '1px solid #381a1a', borderRadius: '12px', overflow: 'hidden', animation: 'fadeInUp 300ms ease-out both', animationDelay: `${(diff.added.length + i) * 50}ms` }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid #381a1a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <XCircle size={18} color="#ef4444" style={{ animation: 'rotateIn 400ms ease-out forwards' }} />
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#f87171', textDecoration: 'line-through' }}>{table.tableName}</span>
                                <span style={{ fontSize: '12px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Removed</span>
                            </div>
                            <div style={{ padding: '12px 16px 16px 46px', display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.6 }}>
                                {table.columns.map(col => (
                                    <div key={col.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f87171', fontSize: '13px' }}>
                                        <span>- {col.name}</span>
                                        <span style={{ fontFamily: 'monospace', fontSize: '11px', backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>{col.type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Changed Tables */}
                    {diff.changed.map((table, i) => (
                        <div key={`changed-${table.tableName}`} style={{ backgroundColor: '#1f1a0d', border: '1px solid #382e1a', borderRadius: '12px', overflow: 'hidden', animation: 'fadeInUp 300ms ease-out both', animationDelay: `${(diff.added.length + diff.removed.length + i) * 50}ms` }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid #382e1a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <RefreshCcw size={18} color="#f59e0b" style={{ animation: 'rotateIn 400ms ease-out forwards' }} />
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#fbbf24' }}>{table.tableName}</span>
                                <span style={{ fontSize: '12px', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Modified</span>
                            </div>
                            <div style={{ padding: '12px 16px 16px 46px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {table.columnsAdded.map(col => (
                                    <div key={`add-${col.name}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#4ade80', fontSize: '13px', backgroundColor: 'rgba(34, 197, 94, 0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                                        <span>+ {col.name}</span>
                                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontFamily: 'monospace' }}>
                                            <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>{col.type}</span>
                                        </div>
                                    </div>
                                ))}
                                {table.columnsRemoved.map(col => (
                                    <div key={`rem-${col.name}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f87171', fontSize: '13px', backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                                        <span style={{ textDecoration: 'line-through' }}>- {col.name}</span>
                                    </div>
                                ))}
                                {table.columnsChanged.map(col => (
                                    <div key={`chg-${col.before.name}`} style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#fbbf24', fontSize: '13px', backgroundColor: 'rgba(245, 158, 11, 0.05)', padding: '8px 10px', borderRadius: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>~ {col.before.name}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'monospace' }}>
                                                {col.before.type !== col.after.type && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{col.before.type}</span>
                                                        <span style={{ color: '#888' }}>→</span>
                                                        <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>{col.after.type}</span>
                                                    </div>
                                                )}
                                                {col.before.isNullable !== col.after.isNullable && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{col.before.isNullable ? 'NULL' : 'NOT NULL'}</span>
                                                        <span style={{ color: '#888' }}>→</span>
                                                        <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>{col.after.isNullable ? 'NULL' : 'NOT NULL'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SchemaDiff;
