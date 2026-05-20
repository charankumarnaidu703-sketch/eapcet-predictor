'use client';

import { useState, useEffect } from 'react';

const REQUIRED_DOCS = [
  { id: 'rank-card', name: 'EAPCET Rank Card', desc: 'Download from the official portal.' },
  { id: 'inter-marks', name: 'Intermediate (12th) Marks Memo', desc: 'Original marks memo required.' },
  { id: 'ssc-marks', name: 'SSC (10th) Pass Certificate', desc: 'Used for Date of Birth verification.' },
  { id: 'dob-cert', name: 'Date of Birth Certificate', desc: 'If SSC is not available.' },
  { id: 'aadhaar', name: 'Aadhaar Card', desc: 'Bring original + photocopies (both sides).' },
  { id: 'caste-cert', name: 'Caste Certificate', desc: 'Required for BC/SC/ST categories (from MRO office).' },
  { id: 'income-cert', name: 'Income Certificate', desc: 'Required for fee reimbursement (valid for current year).' },
  { id: 'residence-cert', name: 'Residence Certificate', desc: 'Proves 10-year residence in AP/Telangana for local status.' },
  { id: 'tc', name: 'Transfer Certificate (TC)', desc: 'From your intermediate college.' },
  { id: 'study-cert', name: 'Study Certificates (Classes 6 to 12)', desc: 'Required to prove local area status.' },
  { id: 'photos', name: 'Passport Size Photos', desc: 'Minimum 10 recent color copies.' },
  { id: 'bank-passbook', name: 'Bank Passbook', desc: 'Front page copy required for fee reimbursement.' },
  { id: 'ph-cert', name: 'PH Certificate', desc: 'If applicable, from district medical board.' },
  { id: 'sports-ncc', name: 'Sports or NCC Certificate', desc: 'If claiming seats under these quotas.' }
];

export default function DocumentChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('doc_checklist');
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse doc_checklist', e);
      }
    }
    setMounted(true);
  }, []);

  const toggleCheck = (id: string) => {
    const newItems = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(newItems);
    localStorage.setItem('doc_checklist', JSON.stringify(newItems));
  };

  const handlePrint = () => {
    window.print();
  };

  if (!mounted) {
    return <div style={{ minHeight: 400, background: '#fff', borderRadius: 'var(--r2)', border: '1px solid var(--line)' }} />;
  }

  const completedCount = REQUIRED_DOCS.filter(d => checkedItems[d.id]).length;
  const progressPercent = Math.round((completedCount / REQUIRED_DOCS.length) * 100);

  return (
    <div 
      className="py-4 px-0 md:p-6 bg-white border border-gray-200 shadow-sm"
      style={{ borderRadius: 'var(--r2)', boxShadow: 'var(--sh1)' }}
    >
      <div className="flex justify-between items-center mb-4 md:mb-5 px-4 md:px-0">
        <h3 className="text-base font-semibold md:text-[1.4rem] md:font-extrabold" style={{ fontFamily: 'Playfair Display,serif', color: 'var(--navy)' }}>
          Document Checklist
        </h3>
        <button onClick={handlePrint} className="no-print" style={{ padding: '8px 12px', background: 'transparent', border: '1px solid var(--line-dk)', borderRadius: 'var(--r)', color: 'var(--text)', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer' }}>
          🖨 Print
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-5 md:mb-6 px-4 md:px-0">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', fontWeight: 700, color: 'var(--subtle)', marginBottom: 8 }}>
          <span className="flex-1">{completedCount} of {REQUIRED_DOCS.length} documents ready</span>
          <span>{progressPercent}%</span>
        </div>
        <div style={{ width: '100%', height: 8, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPercent}%`, background: 'var(--gold)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      <div className="flex flex-col gap-2 md:gap-3 px-4 md:px-0">
        {REQUIRED_DOCS.map(doc => {
          const isChecked = !!checkedItems[doc.id];
          return (
            <label key={doc.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', padding: '12px', borderRadius: 'var(--r)', background: isChecked ? '#f8fafc' : 'transparent', border: '1px solid', borderColor: isChecked ? 'var(--line-dk)' : 'transparent', transition: 'all 0.2s' }}>
              <input 
                type="checkbox" 
                checked={isChecked} 
                onChange={() => toggleCheck(doc.id)} 
                style={{ marginTop: 4, width: 18, height: 18, accentColor: 'var(--gold)' }} 
              />
              <div>
                <p style={{ fontSize: '.95rem', fontWeight: isChecked ? 700 : 600, color: isChecked ? 'var(--navy)' : 'var(--text)', textDecoration: isChecked ? 'line-through' : 'none' }}>
                  {doc.name}
                </p>
                <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 2, display: isChecked ? 'none' : 'block' }}>
                  {doc.desc}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          .container, .container * { visibility: visible; }
        }
      `}} />
    </div>
  );
}
