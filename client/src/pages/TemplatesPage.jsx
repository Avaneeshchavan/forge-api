import React, { useState } from 'react';
import { LayoutTemplate, Search, X, ShoppingCart, Building2, FileText, Users, Heart, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const templatesData = [
  {
    id: "ecommerce",
    name: "E-commerce Store",
    description: "Products, orders, users, categories and cart management",
    category: "Commerce",
    tables: 6,
    endpoints: 30,
    icon: ShoppingCart,
    color: "#6366f1",
    schema: { tables: [
      { name: "users", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"email",data_type:"character varying",is_nullable:"NO"},
        {column_name:"full_name",data_type:"character varying",is_nullable:"YES"},
        {column_name:"created_at",data_type:"timestamp",is_nullable:"YES"}
      ]},
      { name: "products", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"name",data_type:"character varying",is_nullable:"NO"},
        {column_name:"price",data_type:"numeric",is_nullable:"NO"},
        {column_name:"stock",data_type:"integer",is_nullable:"YES"},
        {column_name:"category_id",data_type:"integer",is_nullable:"YES"}
      ]},
      { name: "orders", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"user_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"total",data_type:"numeric",is_nullable:"NO"},
        {column_name:"status",data_type:"character varying",is_nullable:"YES"},
        {column_name:"created_at",data_type:"timestamp",is_nullable:"YES"}
      ]},
      { name: "categories", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"name",data_type:"character varying",is_nullable:"NO"}
      ]},
      { name: "cart_items", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"user_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"product_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"quantity",data_type:"integer",is_nullable:"NO"}
      ]},
      { name: "reviews", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"user_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"product_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"rating",data_type:"integer",is_nullable:"NO"},
        {column_name:"body",data_type:"text",is_nullable:"YES"}
      ]}
    ]}
  },
  {
    id: "saas",
    name: "SaaS Platform",
    description: "Organizations, members, projects, billing and audit logs",
    category: "Business",
    tables: 5,
    endpoints: 25,
    icon: Building2,
    color: "#14b8a6",
    schema: { tables: [
      { name: "organizations", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"name",data_type:"character varying",is_nullable:"NO"},
        {column_name:"plan",data_type:"character varying",is_nullable:"YES"},
        {column_name:"created_at",data_type:"timestamp",is_nullable:"YES"}
      ]},
      { name: "members", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"org_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"email",data_type:"character varying",is_nullable:"NO"},
        {column_name:"role",data_type:"character varying",is_nullable:"YES"}
      ]},
      { name: "projects", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"org_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"title",data_type:"character varying",is_nullable:"NO"},
        {column_name:"status",data_type:"character varying",is_nullable:"YES"},
        {column_name:"due_date",data_type:"timestamp",is_nullable:"YES"}
      ]},
      { name: "invoices", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"org_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"amount",data_type:"numeric",is_nullable:"NO"},
        {column_name:"paid",data_type:"boolean",is_nullable:"YES"},
        {column_name:"due_date",data_type:"timestamp",is_nullable:"YES"}
      ]},
      { name: "audit_logs", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"org_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"action",data_type:"character varying",is_nullable:"NO"},
        {column_name:"performed_by",data_type:"integer",is_nullable:"YES"},
        {column_name:"created_at",data_type:"timestamp",is_nullable:"YES"}
      ]}
    ]}
  },
  {
    id: "blog",
    name: "Blog / CMS",
    description: "Authors, posts, comments, tags and media management",
    category: "Content",
    tables: 5,
    endpoints: 25,
    icon: FileText,
    color: "#f59e0b",
    schema: { tables: [
      { name: "authors", columns: [
        { column_name: "id", data_type: "integer", is_nullable: "NO" },
        { column_name: "role", data_type: "character varying", is_nullable: "YES" }
      ]}, 
      { name: "posts", columns: [
        { column_name: "id", data_type: "integer", is_nullable: "NO" },
        { column_name: "title", data_type: "character varying", is_nullable: "NO" },
        { column_name: "slug", data_type: "character varying", is_nullable: "NO" }
      ]},
      { name: "comments", columns: [
        { column_name: "id", data_type: "integer", is_nullable: "NO" },
        { column_name: "post_id", data_type: "integer", is_nullable: "NO" },
        { column_name: "body", data_type: "text", is_nullable: "NO" }
      ]},
      { name: "tags", columns: [
        { column_name: "id", data_type: "integer", is_nullable: "NO" },
        { column_name: "name", data_type: "character varying", is_nullable: "NO" }
      ]},
      { name: "media", columns: [
        { column_name: "id", data_type: "integer", is_nullable: "NO" },
        { column_name: "url", data_type: "character varying", is_nullable: "NO" }
      ]}
    ]}
  },
  {
    id: "social",
    name: "Social Network",
    description: "Users, posts, follows, likes, messages and notifications",
    category: "Social",
    tables: 6,
    endpoints: 30,
    icon: Users,
    color: "#ec4899",
    schema: { tables: [
      { name: "users", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"username",data_type:"character varying",is_nullable:"NO"},
        {column_name:"bio",data_type:"text",is_nullable:"YES"},
        {column_name:"avatar_url",data_type:"character varying",is_nullable:"YES"}
      ]},
      { name: "posts", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"user_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"body",data_type:"text",is_nullable:"NO"},
        {column_name:"created_at",data_type:"timestamp",is_nullable:"YES"}
      ]},
      { name: "follows", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"follower_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"following_id",data_type:"integer",is_nullable:"NO"}
      ]},
      { name: "likes", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"user_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"post_id",data_type:"integer",is_nullable:"NO"}
      ]},
      { name: "messages", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"sender_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"receiver_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"body",data_type:"text",is_nullable:"NO"},
        {column_name:"read_at",data_type:"timestamp",is_nullable:"YES"}
      ]},
      { name: "notifications", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"user_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"type",data_type:"character varying",is_nullable:"NO"},
        {column_name:"read",data_type:"boolean",is_nullable:"YES"},
        {column_name:"created_at",data_type:"timestamp",is_nullable:"YES"}
      ]}
    ]}
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Patients, doctors, appointments, prescriptions and records",
    category: "Healthcare",
    tables: 5,
    endpoints: 25,
    icon: Heart,
    color: "#ef4444",
    schema: { tables: [
      { name: "patients", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"full_name",data_type:"character varying",is_nullable:"NO"},
        {column_name:"dob",data_type:"date",is_nullable:"YES"},
        {column_name:"email",data_type:"character varying",is_nullable:"YES"}
      ]},
      { name: "doctors", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"full_name",data_type:"character varying",is_nullable:"NO"},
        {column_name:"specialty",data_type:"character varying",is_nullable:"YES"}
      ]},
      { name: "appointments", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"patient_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"doctor_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"scheduled_at",data_type:"timestamp",is_nullable:"NO"},
        {column_name:"status",data_type:"character varying",is_nullable:"YES"}
      ]},
      { name: "prescriptions", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"patient_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"doctor_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"medication",data_type:"character varying",is_nullable:"NO"},
        {column_name:"dosage",data_type:"character varying",is_nullable:"YES"}
      ]},
      { name: "medical_records", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"patient_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"notes",data_type:"text",is_nullable:"YES"},
        {column_name:"created_at",data_type:"timestamp",is_nullable:"YES"}
      ]}
    ]}
  },
  {
    id: "lms",
    name: "Learning Platform",
    description: "Students, courses, lessons, enrollments and progress tracking",
    category: "Education",
    tables: 5,
    endpoints: 25,
    icon: GraduationCap,
    color: "#22c55e",
    schema: { tables: [
      { name: "students", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"full_name",data_type:"character varying",is_nullable:"NO"},
        {column_name:"email",data_type:"character varying",is_nullable:"NO"}
      ]},
      { name: "courses", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"title",data_type:"character varying",is_nullable:"NO"},
        {column_name:"description",data_type:"text",is_nullable:"YES"},
        {column_name:"instructor_id",data_type:"integer",is_nullable:"YES"}
      ]},
      { name: "lessons", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"course_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"title",data_type:"character varying",is_nullable:"NO"},
        {column_name:"content_url",data_type:"character varying",is_nullable:"YES"},
        {column_name:"order",data_type:"integer",is_nullable:"YES"}
      ]},
      { name: "enrollments", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"student_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"course_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"enrolled_at",data_type:"timestamp",is_nullable:"YES"}
      ]},
      { name: "progress", columns: [
        {column_name:"id",data_type:"integer",is_nullable:"NO"},
        {column_name:"student_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"lesson_id",data_type:"integer",is_nullable:"NO"},
        {column_name:"completed",data_type:"boolean",is_nullable:"YES"},
        {column_name:"completed_at",data_type:"timestamp",is_nullable:"YES"}
      ]}
    ]}
  }
];

const categories = ['All', 'Commerce', 'Business', 'Content', 'Social', 'Healthcare', 'Education'];

const PreviewModal = ({ template, onClose }) => {
    const navigate = useNavigate();

    if (!template) return null;

    const handleUseTemplate = () => {
        const schemaPayload = template.schema.tables.map(t => ({
            tableName: t.name,
            columns: t.columns.map(c => ({
                name: c.column_name,
                type: c.data_type,
                isNullable: c.is_nullable !== 'NO'
            }))
        }));
        sessionStorage.setItem('forge_template_schema', JSON.stringify({ name: template.name, schema: schemaPayload }));
        navigate('/');
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', animation: 'fadeIn 200ms ease-out' }}>
            <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '16px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', animation: 'fadeInUp 300ms ease-out' }}>
                
                {/* Modal Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid #1e1e1e' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ backgroundColor: `${template.color}20`, padding: '10px', borderRadius: '10px', color: template.color, display: 'flex' }}>
                            <template.icon size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>{template.name}</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#888888' }}>{template.description}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888888', cursor: 'pointer', padding: '4px' }} onMouseOver={e=>e.currentTarget.style.color='#ffffff'} onMouseOut={e=>e.currentTarget.style.color='#888888'}>
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {template.schema.tables.map((table, idx) => (
                        <div key={idx} style={{ border: '1px solid #1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ backgroundColor: '#111111', padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>{table.name}</span>
                                <span style={{ fontSize: '12px', color: '#888888', fontWeight: '500' }}>{table.columns.length} columns</span>
                            </div>
                            <div style={{ backgroundColor: '#0a0a0a', padding: '0 16px' }}>
                                {table.columns.map((c, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i !== table.columns.length - 1 ? '1px solid #1e1e1e' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' }}>{c.column_name}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '12px', color: '#6366f1', fontFamily: 'monospace', backgroundColor: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{c.data_type}</span>
                                            {c.is_nullable === 'YES' && <span style={{ fontSize: '11px', color: '#888888', border: '1px solid #2e2e2e', padding: '1px 6px', borderRadius: '10px' }}>null</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal Footer */}
                <div style={{ padding: '24px', borderTop: '1px solid #1e1e1e', backgroundColor: '#111111', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                    <button onClick={handleUseTemplate} style={{ width: '100%', backgroundColor: template.color, color: '#ffffff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 150ms' }} onMouseOver={e=>e.currentTarget.style.opacity=0.9} onMouseOut={e=>e.currentTarget.style.opacity=1}>
                        Use This Template →
                    </button>
                </div>
            </div>
        </div>
    );
};

const TemplatesPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const navigate = useNavigate();

    const filteredTemplates = templatesData.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || template.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleUseTemplate = (template) => {
        const schemaPayload = template.schema.tables.map(t => ({
            tableName: t.name,
            columns: t.columns.map(c => ({
                name: c.column_name,
                type: c.data_type,
                isNullable: c.is_nullable !== 'NO'
            }))
        }));
        sessionStorage.setItem('forge_template_schema', JSON.stringify({ name: template.name, schema: schemaPayload }));
        navigate('/');
    };

    return (
        <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '40px 48px', boxSizing: 'border-box', overflowX: 'hidden', color: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
            
            {/* Header Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px', animation: 'fadeInUp 400ms ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <LayoutTemplate size={20} color="#6366f1" />
                            <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>Templates</h1>
                        </div>
                        <p style={{ margin: 0, color: '#888888', fontSize: '14px' }}>Browse pre-built schemas and generate an API instantly</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-end', flex: 1, minWidth: '280px' }}>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
                            <Search size={16} color="#888888" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input 
                                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search templates..."
                                style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#ffffff', padding: '10px 16px 10px 42px', fontSize: '13px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 150ms' }}
                                onFocus={e => e.currentTarget.style.borderColor = '#6366f1'} onBlur={e => e.currentTarget.style.borderColor = '#1e1e1e'}
                            />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button 
                            key={cat} onClick={() => setSelectedCategory(cat)}
                            style={{ background: cat === selectedCategory ? '#1a1a1a' : 'transparent', border: '1px solid', borderColor: cat === selectedCategory ? '#6366f1' : '#1e1e1e', color: cat === selectedCategory ? '#ffffff' : '#888888', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', transition: 'all 150ms' }}
                            onMouseOver={e=>cat !== selectedCategory && (e.currentTarget.style.borderColor='#6366f1', e.currentTarget.style.color='#ffffff')} onMouseOut={e=>cat !== selectedCategory && (e.currentTarget.style.borderColor='#1e1e1e', e.currentTarget.style.color='#888888')}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', animation: 'fadeInUp 400ms ease-out forwards', opacity: 0, animationDelay: '100ms' }}>
                {filteredTemplates.map(template => {
                    const TIcon = template.icon;
                    return (
                        <div key={template.id} style={{ backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', transition: 'all 200ms ease', cursor: 'default' }} onMouseOver={e=>{e.currentTarget.style.borderColor=template.color; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 30px ${template.color}15`;}} onMouseOut={e=>{e.currentTarget.style.borderColor='#1e1e1e'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none';}}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <TIcon size={20} color={template.color} />
                                <span style={{ color: template.color, border: `1px solid ${template.color}40`, backgroundColor: `${template.color}10`, fontSize: '11px', fontWeight: '500', padding: '2px 10px', borderRadius: '20px' }}>{template.category}</span>
                            </div>
                            
                            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', margin: '16px 0 0 0' }}>{template.name}</h2>
                            <p style={{ fontSize: '13px', color: '#888888', margin: '6px 0 0 0', lineHeight: 1.5, flex: 1 }}>{template.description}</p>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '16px 0 0 0', color: '#555555', fontSize: '12px', fontWeight: '500' }}>
                                <span>{template.tables} tables</span>
                                <span>·</span>
                                <span>{template.endpoints} endpoints</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1e1e1e' }}>
                                <button onClick={() => setPreviewTemplate(template)} style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid #2e2e2e', color: '#ffffff', borderRadius: '8px', padding: '10px 0', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: '150ms' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#1a1a1a'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>
                                    Preview
                                </button>
                                <button onClick={() => handleUseTemplate(template)} style={{ flex: 1, backgroundColor: template.color, border: 'none', color: '#ffffff', borderRadius: '8px', padding: '10px 0', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'opacity 150ms' }} onMouseOver={e=>e.currentTarget.style.opacity=0.9} onMouseOut={e=>e.currentTarget.style.opacity=1}>
                                    Use Template →
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredTemplates.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888888', fontSize: '14px', backgroundColor: '#111111', borderRadius: '12px', border: '1px dashed #2e2e2e' }}>
                    No templates found matching your search.
                </div>
            )}

            {previewTemplate && <PreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} />}

        </div>
    );
};

export default TemplatesPage;
