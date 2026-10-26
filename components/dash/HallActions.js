'use client';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui';
import { api } from '@/lib/api';
import { useToast } from '@/components/Providers';

const ISSUES = [['projector', 'Projector or screen'], ['locked', 'Hall is locked'], ['av', 'Microphone or sound'], ['ac', 'Air conditioning'], ['cleaning', 'Needs cleaning'], ['other', 'Something else']];

export function ReportIssueModal({ open, onClose, hallCode = '', onDone }) {
  const { toast } = useToast();
  const [halls, setHalls] = useState([]);
  const [code, setCode] = useState(hallCode);
  const [kind, setKind] = useState('projector');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setCode(hallCode); api('/halls').then((d) => setHalls(d.halls)).catch(() => {}); } }, [open, hallCode]);
  const submit = async () => {
    setBusy(true);
    try { await api('/issues', { method: 'POST', body: { hallCode: code, kind, details } }); toast('Report sent to campus facilities.', 'success'); setDetails(''); onDone?.(); onClose(); }
    catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Report a hall issue" footer={<button className="btn-primary w-full" disabled={busy || !code} onClick={submit}>{busy && <Loader2 size={16} className="animate-spin" />}Send report</button>}>
      <div className="space-y-4">
        <div><label className="label" htmlFor="ri-hall">Hall</label>
          <select id="ri-hall" className="input" value={code} onChange={(e) => setCode(e.target.value)}><option value="">Choose a hall</option>{halls.map((h) => <option key={h.code} value={h.code}>{h.code}, {h.name}</option>)}</select></div>
        <div><span className="label">What is wrong?</span>
          <div className="flex flex-wrap gap-2">{ISSUES.map(([k, l]) => <button key={k} type="button" onClick={() => setKind(k)} className={`chip !px-3.5 !py-2 text-sm ${kind === k ? 'bg-brand text-on-brand' : 'bg-surface2 text-ink hover:bg-line'}`}>{l}</button>)}</div></div>
        <div><label className="label" htmlFor="ri-d">Details (optional)</label><textarea id="ri-d" rows={3} className="input !py-3" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="For example: the projector flickers after ten minutes" /></div>
      </div>
    </Modal>
  );
}

export function RequestSwapModal({ open, onClose, entries = [], onDone }) {
  const { toast } = useToast();
  const [halls, setHalls] = useState([]);
  const [tt, setTt] = useState('');
  const [code, setCode] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { api('/halls').then((d) => setHalls(d.halls.filter((h) => ['lecture', 'lab', 'seminar', 'auditorium'].includes(h.type)))).catch(() => {}); setTt(String(entries[0]?.id || '')); } }, [open]); // eslint-disable-line
  const submit = async () => {
    setBusy(true);
    try { await api('/change-requests', { method: 'POST', body: { timetableId: Number(tt), hallCode: code, reason } }); toast('Request sent to the school office.', 'success'); setReason(''); onDone?.(); onClose(); }
    catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Request a hall swap" footer={<button className="btn-primary w-full" disabled={busy || !code || !tt} onClick={submit}>{busy && <Loader2 size={16} className="animate-spin" />}Send request</button>}>
      <div className="space-y-4">
        <div><label className="label" htmlFor="sw-c">Which class?</label>
          <select id="sw-c" className="input" value={tt} onChange={(e) => setTt(e.target.value)}>{entries.map((e) => <option key={e.id} value={e.id}>{['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][e.day]} {e.start}, {e.courseCode} in {e.hallCode}</option>)}</select></div>
        <div><label className="label" htmlFor="sw-h">Move it to</label>
          <select id="sw-h" className="input" value={code} onChange={(e) => setCode(e.target.value)}><option value="">Choose a hall</option>{halls.map((h) => <option key={h.code} value={h.code}>{h.code}, {h.name} ({h.capacity} seats)</option>)}</select></div>
        <div><label className="label" htmlFor="sw-r">Reason</label><textarea id="sw-r" rows={3} className="input !py-3" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Projector broken, need more seats…" /></div>
        <p className="text-xs text-muted">The school office checks that the hall is free at that time before approving.</p>
      </div>
    </Modal>
  );
}
