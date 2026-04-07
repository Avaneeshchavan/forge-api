import React, { useState, useEffect } from 'react';

const sectionStyles = {
    heading: { color: '#ffffff', fontSize: '20px', fontWeight: '600', marginBottom: '8px', borderBottom: '1px solid #1e1e1e', paddingBottom: '12px' },
    body: { color: '#888888', fontSize: '15px', lineHeight: 1.8, margin: '16px 0' },
    code: { backgroundColor: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: '#e2e8f0', margin: '16px 0', whiteSpace: 'pre-wrap' },
    info: { backgroundColor: '#0d1020', borderLeft: '3px solid #6366f1', padding: '12px 16px', borderRadius: '0 8px 8px 0', color: '#888888', fontSize: '13px', margin: '12px 0' }
};

const DocsPage = () => {
    const [activeSection, setActiveSection] = useState('getting-started');

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('section[id]');
            let current = 'getting-started';
            
            sections.forEach(sec => {
                // Use window.scrollY instead of a specific div's scrollTop
                if (window.scrollY >= sec.offsetTop - 100) {
                    current = sec.getAttribute('id');
                }
            });
            setActiveSection(current);
        };

        // Listen to the whole window scrolling
        window.addEventListener('scroll', handleScroll);
        // Run once on mount to set initial state
        handleScroll(); 
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        
        // scrollIntoView is a native browser feature that automatically respects 
        // the 'scrollMarginTop: 60px' you already brilliantly added to your sections!
        el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div style={{ display: 'flex', gap: '48px', width: '100%', maxWidth: '960px', margin: '0 auto', padding: '40px 48px', boxSizing: 'border-box', overflowX: 'hidden', fontFamily: 'system-ui, sans-serif' }}>

            {/* Left Nav */}
            <div style={{ position: 'sticky', top: '40px', alignSelf: 'flex-start', width: '180px', flexShrink: 0 }}>
                <div style={{ color: '#444444', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', fontWeight: '600' }}>ON THIS PAGE</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {[
                        { id: 'getting-started', label: 'Getting Started' },
                        { id: 'connecting-a-database', label: 'Connecting a Database' },
                        { id: 'demo-mode', label: 'Demo Mode' },
                        { id: 'templates', label: 'Templates' },
                        { id: 'authentication', label: 'Authentication' },
                        { id: 'generated-file-structure', label: 'Generated File Structure' },
                        { id: 'playground', label: 'Playground' },
                        { id: 'compare-tool', label: 'Compare Tool' },
                        { id: 'changelog', label: 'Changelog' }
                    ].map(link => (
                        <a
                            key={link.id} href={`#${link.id}`} onClick={e => { e.preventDefault(); scrollTo(link.id); }}
                            style={{ color: activeSection === link.id ? '#6366f1' : '#888888', fontSize: '13px', textDecoration: 'none', padding: '6px 0', display: 'block', transition: 'color 150ms' }}
                            onMouseOver={e => { if (activeSection !== link.id) e.currentTarget.style.color = '#ffffff' }}
                            onMouseOut={e => { if (activeSection !== link.id) e.currentTarget.style.color = '#888888' }}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* Right Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '64px', animation: 'fadeInUp 400ms ease-out' }}>
                <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

                <section id="getting-started" style={{ scrollMarginTop: '60px' }}>
                    <h2 style={sectionStyles.heading}>Getting Started</h2>
                    <p style={sectionStyles.body}>ForgeAPI generates a production-ready Express REST API from any PostgreSQL database in seconds. No configuration required.</p>
                    <div style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '24px', height: '24px', backgroundColor: '#6366f1', color: '#fff', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>1</div><span style={{ color: '#e2e8f0', fontSize: '14px' }}>Paste your database URI or pick a template</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '24px', height: '24px', backgroundColor: '#6366f1', color: '#fff', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>2</div><span style={{ color: '#e2e8f0', fontSize: '14px' }}>Preview and select tables</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '24px', height: '24px', backgroundColor: '#6366f1', color: '#fff', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>3</div><span style={{ color: '#e2e8f0', fontSize: '14px' }}>Choose an auth strategy</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '24px', height: '24px', backgroundColor: '#6366f1', color: '#fff', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>4</div><span style={{ color: '#e2e8f0', fontSize: '14px' }}>Click Generate and download your ZIP</span></div>
                    </div>
                </section>

                <section id="connecting-a-database" style={{ scrollMarginTop: '60px' }}>
                    <h2 style={sectionStyles.heading}>Connecting a Database</h2>
                    <p style={sectionStyles.body}>Your connection URI follows this format:</p>
                    <div style={sectionStyles.code}>postgres://username:password@hostname:5432/database_name</div>
                    <div style={sectionStyles.info}>Your credentials are never stored. The URI is used only to scan the schema and is discarded immediately.</div>
                </section>

                <section id="demo-mode" style={{ scrollMarginTop: '60px' }}>
                    <h2 style={sectionStyles.heading}>Demo Mode</h2>
                    <p style={sectionStyles.body}>Don't have a database handy? Use one of three built-in demo schemas allowing you to bypass the SQL parsing check entirely.</p>
                    <ul style={{ color: '#888888', fontSize: '14px', lineHeight: 1.8, margin: 0, paddingLeft: '24px' }}>
                        <li><strong style={{ color: '#ffffff' }}>E-commerce</strong> (4 tables)</li>
                        <li><strong style={{ color: '#ffffff' }}>SaaS</strong> (5 tables)</li>
                        <li><strong style={{ color: '#ffffff' }}>Blog</strong> (4 tables)</li>
                    </ul>
                </section>

                <section id="templates" style={{ scrollMarginTop: '60px' }}>
                    <h2 style={sectionStyles.heading}>Templates</h2>
                    <p style={sectionStyles.body}>The Templates page offers 6 production-grade schemas instantly ready to generate API layers corresponding to complex industry data structures.</p>
                    <ul style={{ color: '#888888', fontSize: '14px', lineHeight: 1.8, margin: 0, paddingLeft: '24px' }}>
                        <li><strong style={{ color: '#ffffff' }}>E-commerce Store</strong> (6 tables)</li>
                        <li><strong style={{ color: '#ffffff' }}>SaaS Platform</strong> (5 tables)</li>
                        <li><strong style={{ color: '#ffffff' }}>Blog / CMS</strong> (5 tables)</li>
                        <li><strong style={{ color: '#ffffff' }}>Social Network</strong> (6 tables)</li>
                        <li><strong style={{ color: '#ffffff' }}>Healthcare</strong> (5 tables)</li>
                        <li><strong style={{ color: '#ffffff' }}>Learning Platform</strong> (5 tables)</li>
                    </ul>
                </section>

                <section id="authentication" style={{ scrollMarginTop: '60px' }}>
                    <h2 style={sectionStyles.heading}>Authentication</h2>
                    <p style={sectionStyles.body}>We automatically bootstrap security layers and dependency wrappers surrounding generated router paths directly mapping to these 3 strategies:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, auto) 1fr', gap: '16px', backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ color: '#ffffff', fontWeight: '500', fontSize: '14px' }}>None</div>
                        <div style={{ color: '#888888', fontSize: '13px', lineHeight: 1.6 }}>Core Express routing generation without middleware layers. All REST endpoints globally exposed.</div>
                        <div style={{ color: '#ffffff', fontWeight: '500', fontSize: '14px' }}>API Key</div>
                        <div style={{ color: '#888888', fontSize: '13px', lineHeight: 1.6 }}>`auth.js` middleware interceptor bound to req.headers['x-api-key'] dynamically comparing `.env` values.</div>
                        <div style={{ color: '#ffffff', fontWeight: '500', fontSize: '14px' }}>JWT</div>
                        <div style={{ color: '#888888', fontSize: '13px', lineHeight: 1.6 }}>`jsonwebtoken` package injections parsing `Bearer` header signatures validating against `JWT_SECRET`.</div>
                    </div>
                </section>

                <section id="generated-file-structure" style={{ scrollMarginTop: '60px' }}>
                    <h2 style={sectionStyles.heading}>Generated File Structure</h2>
                    <div style={sectionStyles.code}>
                        {`your-api/
├── src/
│   ├── routes/
│   │   ├── users.js
│   │   └── products.js
│   └── middleware/
│       └── auth.js
├── index.js
├── .env.example
└── package.json`}
                    </div>
                </section>

                <section id="playground" style={{ scrollMarginTop: '60px' }}>
                    <h2 style={sectionStyles.heading}>Playground</h2>
                    <p style={sectionStyles.body}>The Playground lets you test your running API without leaving ForgeAPI. Instead of shifting directly into Postman, our playground parses generation histories matching localhost endpoints for seamless HTTP fetch tests.</p>
                </section>

                <section id="compare-tool" style={{ scrollMarginTop: '60px' }}>
                    <h2 style={sectionStyles.heading}>Compare Tool</h2>
                    <p style={sectionStyles.body}>Load two different schemas to diff them side by side tracking structural disparities spanning multiple microservices without requiring external GUI editors. Perfect for tracking migrations or comparing environments.</p>
                </section>

                <section id="changelog" style={{ scrollMarginTop: '60px' }}>
                    <h2 style={sectionStyles.heading}>Changelog</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', paddingLeft: '24px', marginTop: '16px' }}>
                        <div style={{ position: 'absolute', top: '8px', bottom: 0, left: '6px', width: '2px', backgroundColor: '#1e1e1e' }} />

                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '-22px', top: '5px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#6366f1', boxShadow: '0 0 0 4px #0a0a0a' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <span style={{ color: '#6366f1', fontFamily: 'monospace', fontWeight: '600', fontSize: '14px' }}>v1.0.0</span>
                                <span style={{ color: '#444444', fontSize: '13px' }}>Current</span>
                            </div>
                            <ul style={{ color: '#888888', fontSize: '14px', lineHeight: 2, margin: 0, paddingLeft: '16px' }}>
                                <li>• PostgreSQL schema scanning</li>
                                <li>• Full REST API generation</li>
                                <li>• JWT, API Key, and None auth strategies</li>
                                <li>• Demo mode with 3 sample schemas</li>
                                <li>• Generation history with re-download</li>
                                <li>• Schema diff / compare tool</li>
                                <li>• API Playground</li>
                                <li>• Templates library</li>
                                <li>• Shareable schema links</li>
                            </ul>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default DocsPage;
