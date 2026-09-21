'use client';

import { useState } from 'react';

function UploadIcon2() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M7 9l5-5 5 5" /><path d="M12 4v12" /></svg>
  );
}

const STEPS = ['Unggah Dokumen', 'Pilih Regulasi', 'Hasil Review'];

export default function DemoSimulation() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [checked, setChecked] = useState(['uu-pdp', 'internal-sop']);

  const toggle = (id: string) => setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const run = () => {
    setRunning(true);
    setTimeout(() => { setRunning(false); setStep(2); }, 1600);
  };

  return (
    <div className="demo-frame">
      <div className="demo-topbar">
        <span className="dot" style={{ background: '#ff5f57' }} />
        <span className="dot" style={{ background: '#febc2e' }} />
        <span className="dot" style={{ background: '#28c840' }} />
        <div className="demo-url">app.policyreview.id/reviews/new</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Stepper */}
        <div className="demo-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`demo-step ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`} onClick={() => i <= step && setStep(i)}>
              <span className="demo-step-num">{i < step ? '✓' : i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="demo-body">
          {step === 0 && (
            <div className="demo-drop">
              <UploadIcon2 />
              <div style={{ fontWeight: 800, marginTop: 8 }}>Seret & letakkan dokumen</div>
              <div style={{ color: '#8494A8', fontSize: 12 }}>PDF / DOCX / TXT · maks 10 MB</div>
              <button className="btn btn-primary btn-sm" onClick={() => setStep(1)}>Pilih dokumen contoh</button>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 13 }}>Pilih regulasi yang berlaku:</div>
              {[
                { id: 'uu-pdp', t: 'UU No. 27/2022 — PDP', s: 'Eksternal · 12 checklist' },
                { id: 'internal-sop', t: 'SOP Penanganan Data', s: 'Internal · 8 checklist' },
                { id: 'iso', t: 'ISO/IEC 27001', s: 'Eksternal · 20 checklist' },
              ].map((r) => (
                <label key={r.id} className={`demo-check ${checked.includes(r.id) ? 'sel' : ''}`}>
                  <input type="checkbox" checked={checked.includes(r.id)} onChange={() => toggle(r.id)} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.t}</div>
                    <div style={{ fontSize: 11, color: '#8494A8' }}>{r.s}</div>
                  </div>
                </label>
              ))}
              <button className="btn btn-primary" style={{ marginTop: 6 }} onClick={run} disabled={running}>
                {running ? 'Menganalisis…' : 'Jalankan Review AI'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="demo-result">
              <div className="demo-score">
                <div className="ring"><span>86</span></div>
                <div className="demo-score-labels">
                  <div><b style={{ color: '#34D399' }}>12</b> Patuh</div>
                  <div><b style={{ color: '#f59e0b' }}>3</b> Sebagian</div>
                  <div><b style={{ color: '#ef4444' }}>1</b> Kesenjangan</div>
                </div>
              </div>
              <div className="demo-rows">
                {[
                  ['Dasar hukum pemrosesan', 'Patuh', '#34D399'],
                  ['Masa retensi data', 'Sebagian', '#f59e0b'],
                  ['Hak subjek data', 'Patuh', '#34D399'],
                  ['Pemberitahuan insiden', 'Kesenjangan', '#ef4444'],
                ].map(([t, s, c]) => (
                  <div key={t as string} className="demo-row">
                    <span>{t}</span>
                    <span style={{ color: c, fontWeight: 700 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .demo-frame { height: 440px; border-radius: 18px; overflow: hidden; background: #0b1220; color: #E9EEF4; display: flex; flex-direction: column; }
        .demo-topbar { display: flex; align-items: center; gap: 7px; padding: 13px 16px; background: #111b2b; border-bottom: 1px solid #1b2a3e; }
        .dot { width: 11px; height: 11px; border-radius: 50%; }
        .demo-url { margin-left: 10px; font-size: 11px; color: #64748B; background:#0f1a29; padding: 4px 12px; border-radius: 6px; }
        .demo-steps { display: flex; gap: 8px; padding: 14px 16px; border-bottom: 1px solid #16243a; }
        .demo-step { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748B; cursor: pointer; }
        .demo-step .demo-step-num { width: 20px; height: 20px; border-radius: 50%; border: 1px solid #2a3b52; display: flex; align-items: center; justify-content: center; font-size: 11px; }
        .demo-step.on { color: #fff; font-weight: 700; }
        .demo-step.on .demo-step-num { background: #34D399; border-color: #34D399; color: #fff; }
        .demo-step.done .demo-step-num { background: rgba(52,211,153,0.14); border-color: #34D399; color: #34D399; }
        .demo-body { flex: 1; padding: 20px; overflow: auto; }
        .demo-drop { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; border: 1.5px dashed #2a3b52; border-radius: 14px; color: #8494A8; }
        .demo-check { display: flex; gap: 10px; align-items: flex-start; padding: 12px; border: 1px solid #22324a; border-radius: 10px; cursor: pointer; }
        .demo-check.sel { border-color: #34D399; background: rgba(52,211,153,0.08); }
        .demo-result { display: flex; gap: 18px; }
        .demo-score { display: flex; align-items: center; gap: 16px; }
        .ring { width: 74px; height: 74px; border-radius: 50%; border: 4px solid #34D399; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 900; color: #34D399; }
        .demo-score-labels { display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
        .demo-rows { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .demo-row { display: flex; justify-content: space-between; font-size: 12px; padding: 8px 12px; background: #131c2c; border-radius: 8px; color: #CBD5E1; }
      `}</style>
    </div>
  );
}
