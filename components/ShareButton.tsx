'use client';

import { shareToWhatsApp } from '@/lib/share';

interface ShareButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

export default function ShareButton({ text, label = 'Share on WhatsApp', size = 'md', iconOnly = false }: ShareButtonProps) {
  
  const handleShare = async () => {
    // Fire analytics event
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'share_whatsapp',
          metadata: { textLength: text.length }
        })
      });
    } catch (e) {
      console.error('Failed to track share event', e);
    }
    
    // Perform share
    shareToWhatsApp(text);
  };

  const getPadding = () => {
    if (iconOnly) return '8px';
    if (size === 'sm') return '6px 12px';
    if (size === 'lg') return '12px 24px';
    return '10px 18px'; // md
  };

  const getFontSize = () => {
    if (size === 'sm') return '.8rem';
    if (size === 'lg') return '1.05rem';
    return '.9rem'; // md
  };

  return (
    <button 
      onClick={handleShare}
      title={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: '#25D366',
        color: '#fff',
        border: 'none',
        borderRadius: 'var(--r)',
        padding: getPadding(),
        fontSize: getFontSize(),
        fontWeight: 700,
        fontFamily: 'Plus Jakarta Sans,sans-serif',
        cursor: 'pointer',
        boxShadow: 'var(--sh1)',
        transition: 'transform 0.1s'
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={iconOnly ? 20 : 18} height={iconOnly ? 20 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
      {!iconOnly && label}
    </button>
  );
}
