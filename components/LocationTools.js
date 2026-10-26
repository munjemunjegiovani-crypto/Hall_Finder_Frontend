'use client';
import { useEffect, useRef, useState } from 'react';
import { Camera, MapPin, QrCode, Search } from 'lucide-react';
import { Modal } from '@/components/ui';
import SearchBox from '@/components/SearchBox';
import { api } from '@/lib/api';
import { useLocationCtx, useToast } from '@/components/Providers';

const cache = new Map();
/** Human name for a location code, cached. */
export function useLocationName(code) {
  const [name, setName] = useState(() => cache.get(code) || null);
  useEffect(() => {
    if (!code) return;
    if (cache.has(code)) { setName(cache.get(code)); return; }
    const fixed = { GATE: 'Main Gate', PLAZA: 'Campus Plaza' };
    if (fixed[code]) { cache.set(code, fixed[code]); setName(fixed[code]); return; }
    if (code.startsWith('entrance:')) { const n = `Building ${code.split(':')[1]} entrance`; cache.set(code, n); setName(n); return; }
    api(`/halls/${code}`).then((d) => { cache.set(code, d.hall.name); setName(d.hall.name); }).catch(() => setName(code));
  }, [code]);
  return name || code;
}

export function parseCode(text) {
  const m = /\/l\/([A-Za-z0-9-]+)/.exec(text);
  return (m ? m[1] : text).trim().toUpperCase();
}

export function LocationPicker({ open, onClose, onScan }) {
  const { loc, setLoc } = useLocationCtx();
  const { toast } = useToast();
  const [spots, setSpots] = useState([]);
  useEffect(() => { if (open) api('/locations').then((d) => setSpots(d.locations)).catch(() => {}); }, [open]);
  const choose = (code, name) => { setLoc(code); toast(`Location set to ${name}.`, 'success'); onClose(); };
  return (
    <Modal open={open} onClose={onClose} title="Where are you?">
      <p className="mb-3 text-sm text-muted">HallFinder uses this as the start of every route. Scan the QR code on a door for the most exact position.</p>
      <button className="btn-teal mb-4 w-full" onClick={() => { onClose(); onScan(); }}><QrCode size={18} />Scan a door QR code</button>
      <div className="mb-2 text-sm font-semibold">Search for the hall you are in</div>
      <SearchBox placeholder="Hall code or name" onPickHall={async (code) => { const d = await api(`/halls/${code}`); choose(code, d.hall.name); }} />
      <div className="mb-2 mt-5 text-sm font-semibold">Campus spots</div>
      <div className="grid gap-2">
        {spots.map((s) => (
          <button key={s.code} onClick={() => choose(s.code, s.name)} className={`flex min-h-[48px] items-center gap-3 rounded-xl border px-3 text-left text-sm font-medium ${loc === s.code ? 'border-teal bg-teal-soft text-teal-ink' : 'border-line hover:bg-surface2'}`}>
            <MapPin size={18} />{s.name}
          </button>
        ))}
      </div>
    </Modal>
  );
}

export function QrScanner({ open, onClose, onLocated }) {
  const { setLoc } = useLocationCtx();
  const { toast } = useToast();
  const video = useRef(null);
  const [manual, setManual] = useState('');
  const [err, setErr] = useState('');
  const [camOk, setCamOk] = useState(false);

  const apply = async (raw) => {
    const code = parseCode(raw);
    try {
      const d = await api(`/halls/${code}`);
      setLoc(d.hall.code);
      toast(`Location set to ${d.hall.name} (${d.hall.code}).`, 'success');
      onLocated?.(d.hall.code);
      onClose();
    } catch {
      setErr(`“${raw}” is not a HallFinder door code.`);
    }
  };

  useEffect(() => {
    if (!open) return undefined;
    setErr(''); setManual(''); setCamOk(false);
    let stream; let timer; let stopped = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        setCamOk(true);
        if (video.current) { video.current.srcObject = stream; await video.current.play().catch(() => {}); }
        if ('BarcodeDetector' in window) {
          const det = new window.BarcodeDetector({ formats: ['qr_code'] });
          timer = setInterval(async () => {
            try {
              const codes = await det.detect(video.current);
              if (codes[0]) { clearInterval(timer); apply(codes[0].rawValue); }
            } catch {}
          }, 350);
        } else setErr('This browser cannot read QR codes automatically. Type the code printed under the QR instead.');
      } catch { setErr('Camera access is off. Type the code printed under the QR instead.'); }
    })();
    return () => { stopped = true; clearInterval(timer); stream?.getTracks().forEach((t) => t.stop()); };
  }, [open]); // eslint-disable-line

  return (
    <Modal open={open} onClose={onClose} title="Scan a door QR code">
      <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl bg-[#0A1230]">
        <video ref={video} className={`h-full w-full object-cover ${camOk ? '' : 'hidden'}`} muted playsInline />
        {!camOk && <div className="flex h-full flex-col items-center justify-center gap-2 text-white/70"><Camera size={36} /><span className="text-sm">Camera not available</span></div>}
        {camOk && <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-teal/90 shadow-[0_0_0_999px_rgba(5,10,30,.45)]" />}
      </div>
      {err && <p className="mb-3 rounded-xl bg-warn/10 px-3 py-2 text-sm text-ink" role="alert">{err}</p>}
      <label className="label" htmlFor="qr-manual">Or type the hall code</label>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (manual.trim()) apply(manual); }}>
        <input id="qr-manual" className="input mono uppercase" placeholder="B204" value={manual} onChange={(e) => setManual(e.target.value)} />
        <button className="btn-primary shrink-0" type="submit"><Search size={18} />Use</button>
      </form>
    </Modal>
  );
}
