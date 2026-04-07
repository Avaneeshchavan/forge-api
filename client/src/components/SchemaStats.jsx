import React, { useState, useEffect } from 'react';

const AnimatedNumber = ({ target }) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 600;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(easeOut * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    setVal(0);
    window.requestAnimationFrame(step);
  }, [target]);

  return <>{val}</>;
};

const SchemaStats = ({ schema, authStrategy }) => {
    if (!schema || schema.length === 0) return null;

    const tablesCount = schema.length;
    const endpointsCount = schema.length * 5;
    let columnsCount = 0;
    let foreignKeysCount = 0;
    let hasLargeTable = false;

    schema.forEach(t => {
        columnsCount += t.columns.length;
        if (t.columns.length > 5) hasLargeTable = true;
        t.columns.forEach(c => {
            if (c.name.toLowerCase().endsWith('_id')) foreignKeysCount += 1;
        });
    });

    let score = Math.min(tablesCount * 10, 40);
    score += foreignKeysCount * 5;
    if (authStrategy === 'JWT') score += 10;
    else if (authStrategy === 'API Key') score += 5;
    if (hasLargeTable) score += 5;
    
    score = Math.min(score, 100);

    let badgeText = "Simple";
    let badgeColor = "#22c55e"; // green
    if (score > 40 && score <= 70) {
        badgeText = "Moderate";
        badgeColor = "#f59e0b"; // amber
    } else if (score > 70) {
        badgeText = "Complex";
        badgeColor = "#ef4444"; // red
    }

    const cardColors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];                                                                                                                              

    const StatCard = ({ title, value, addon, index }) => (                                                                                                                                     
        <div style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderTop: `2px solid ${cardColors[index % cardColors.length]}`, borderRadius: '12px', padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>                                                                                                              
                  <span style={{ fontSize: '28px', color: '#ffffff', fontWeight: '600' }}><AnimatedNumber target={value} /></span>                                                             
                  {addon}                                                                                                                                                                      
             </div>                                                                                                                                                                            
             <span style={{ color: '#888888', fontSize: '12px' }}>{title}</span>                                                                                                               
        </div>                                                                                                                                                                                 
    );                                                                                                                                                                                         

    return (                                                                                                                                                                                   
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', width: '100%' }}>                                                                                
            <StatCard index={0} title="Tables" value={tablesCount} />                                                                                                                          
            <StatCard index={1} title="Endpoints" value={endpointsCount} />                                                                                                                    
            <StatCard index={2} title="Columns" value={columnsCount} />                                                                                                                        
            <StatCard                                                                                                                                                                          
                index={3}                                                                                                                                                                      
                title="Complexity Score"                                                                                                                                                       
                value={score}                                                                                                                                                                  
                addon={                                                                                                                                                                        
                    <span style={{ backgroundColor: `${badgeColor}20`, color: badgeColor, fontSize: '11px', padding: '2px 8px', borderRadius: '12px', border: `1px solid ${badgeColor}40`, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {badgeText}                                                                                                                                                            
                    </span>                                                                                                                                                                    
                }                                                                                                                                                                              
            />                                                                                                                                                                                 
        </div>                                                                                                                                                                                 
    );                                                                                                                                                                                         
};

export default SchemaStats;
