import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

const Toast = ({ isVisible, message, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
            backgroundColor: '#1a1a1a', border: '1px solid #22c55e', borderRadius: '10px',
            padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px',
            transform: isVisible ? 'translateX(0)' : 'translateX(150%)',
            transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
            <CheckCircle2 size={18} color="#22c55e" />
            <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>{message}</span>
        </div>
    );
};

export default Toast;
