'use client';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Loader2, Plus, Printer, Trash2, X } from 'lucide-react';
import QRCode from 'qrcode';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/hooks';
import { DAYS, DAYS_SHORT } from '@/lib/format';
import { EmptyState, ErrorState, Modal, PageTitle, Segmented, Skeleton } from '@/components/ui';
import { useToast } from '@/components/Providers';

const TABS = [['overview', 'Overview'], ['timetable', 'Timetable'], ['halls', 'Halls'], ['requests', 'Requests'], ['news', 'Announcements'], ['users', 'Users'], ['qr', 'QR codes']];

export default function AdminConsole() {
  const [tab, setTab] = useState('overview');
  return (
    <div>
      <PageTitle title="Campus admin" sub="Manage halls, timetables and announcements." />
      <div className="scroll-hide -mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0"><Segmented value={tab} onChange={setTab} options={TABS} /></div>
      {tab === 'overview' && <Overview go={setTab} />}
      {tab === 'timetable' && <TimetableAdmin />}
      {tab === 'halls' && <HallsAdmin />}
      {tab === 'requests' && <Requests />}
      {tab === 'news' && <News />}
      {tab === 'users' && <Users />}
      {tab === 'qr' && <QrSheet />}
    </div>
  );
}

function Overview({ go }) {
  const { data, error, loading, reload } = useFetch('/admin/stats');
  const fb = useFetch('/admin/feedback');
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading) return <Skeleton className="h-40" />;
  const tiles = [['Halls and rooms', data.halls], ['Buildings', data.buildings], ['Students', data.students], ['Teachers', data.teachers], ['Classes per week', data.classesPerWeek], ['Open issues', data.openIssues, 'requests'], ['Pending requests', data.pendingRequests, 'requests'], ['Timetable clashes', data.conflicts, 'timetable']];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map(([l, v, to]) => (
          <button key={l} disabled={!to} onClick={() => to && go(to)} className={`card p-4 text-left ${to ? 'hover:bg-surface2' : ''}`}>
            <div className={`mono text-3xl font-bold ${to && v > 0 ? 'text-[rgb(var(--bad))]' : ''}`}>{v}</div><div className="mt-1 text-sm text-muted">{l}</div>
          </button>
        ))}
      </div>
      <section className="card card-pad"><h2 className="text-lg font-bold">Recent feedback</h2>
        {fb.data?.feedback.length ? <ul className="mt-3 divide-y divide-line">{fb.data.feedback.slice(0, 6).map((f) => <li key={f.id} className="py-2.5 text-sm"><span className="text-warn">{'★'.repeat(f.rating || 0)}</span> {f.message}<div className="text-xs text-muted">{f.name || 'Anonymous'}</div></li>)}</ul> : <p className="mt-2 text-sm text-muted">No feedback yet.</p>}
      </section>
    </div>
  );
}

function TimetableAdmin() {
  const { data, error, loading, reload } = useFetch('/admin/timetable');
  const courses = useFetch('/admin/courses');
  const halls = useFetch('/halls');
  const { toast } = useToast();
  const [edit, setEdit] = useState(null); // null | {} (new) | entry
  const [day, setDay] = useState(1);
  const bad = useMemo(() => new Set((data?.conflicts || []).flatMap((c) => [c.a?.id, c.b?.id, c.entryId])), [data]);
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading || !data) return <Skeleton className="h-60" />;
  const list = data.entries.filter((e) => e.day === day);
  const cancel = async (e) => { await api(`/admin/timetable/${e.id}/cancel`, { method: 'POST', body: { cancelled: e.status !== 'cancelled' } }); toast(e.status === 'cancelled' ? 'Class restored. Everyone affected was notified.' : 'Class cancelled. Everyone affected was notified.', 'success'); reload(); };
  const remove = async (e) => { if (!confirm(`Delete ${e.courseCode} on ${DAYS[e.day]}?`)) return; await api(`/admin/timetable/${e.id}`, { method: 'DELETE' }); toast('Deleted.', 'success'); reload(); };
  return (
    <div>
      {data.conflicts.length > 0 && <div className="mb-4 flex items-start gap-2 rounded-xl bg-bad/10 p-3 text-sm"><AlertTriangle size={18} className="mt-0.5 shrink-0 text-[rgb(var(--bad))]" />{data.conflicts.length} clash{data.conflicts.length > 1 ? 'es' : ''} in the timetable. Highlighted rows overlap.</div>}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented value={String(day)} onChange={(v) => setDay(Number(v))} options={[1, 2, 3, 4, 5, 6].map((d) => [String(d), DAYS_SHORT[d]])} />
        <button className="btn-primary" onClick={() => setEdit({})}><Plus size={18} />Add class</button>
      </div>
      {list.length === 0 ? <EmptyState title="No classes on this day" text="Add the first class for this day." /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm"><thead className="text-xs text-muted"><tr><th className="p-3">Time</th><th>Course</th><th>Teacher</th><th>Hall</th><th /></tr></thead>
            <tbody className="divide-y divide-line">{list.map((e) => (
              <tr key={e.id} className={bad.has(e.id) ? 'bg-bad/10' : ''}>
                <td className="mono p-3 whitespace-nowrap">{e.start} to {e.end}</td>
                <td className={e.status === 'cancelled' ? 'line-through opacity-60' : ''}><b>{e.courseCode}</b> {e.courseTitle}</td><td>{e.teacherName}</td><td className="mono">{e.hallCode}</td>
                <td className="whitespace-nowrap p-2 text-right"><button className="btn-ghost !min-h-[36px] !px-3 text-xs" onClick={() => setEdit(e)}>Edit</button> <button className="btn-ghost !min-h-[36px] !px-3 text-xs" onClick={() => cancel(e)}>{e.status === 'cancelled' ? 'Restore' : 'Cancel'}</button> <button className="rounded-lg p-2 text-bad hover:bg-surface2" aria-label="Delete" onClick={() => remove(e)}><Trash2 size={16} /></button></td>
              </tr>))}</tbody></table>
        </div>
      )}
      {edit && <EntryForm entry={edit} day={day} courses={courses.data?.courses || []} halls={halls.data?.halls.filter((h) => ['lecture', 'lab', 'seminar'].includes(h.type)) || []} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); reload(); }} />}
    </div>
  );
}

function EntryForm({ entry, day, courses, halls, onClose, onSaved }) {
  const { toast } = useToast();
  const isNew = !entry.id;
  const [f, setF] = useState({ courseId: entry.courseId || '', hallCode: entry.hallCode || '', day: entry.day || day, start: entry.start || '08:30', end: entry.end || '10:00', kind: entry.kind || 'Lecture' });
  const [busy, setBusy] = useState(false);
  const [conf, setConf] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (force) => {
    setBusy(true);
    try {
      await api(isNew ? '/admin/timetable' : `/admin/timetable/${entry.id}`, { method: isNew ? 'POST' : 'PUT', body: { ...f, courseId: Number(f.courseId), day: Number(f.day), force } });
      toast('Saved. Affected students and teachers were notified.', 'success'); onSaved();
    } catch (e) { if (e.status === 409) setConf(e.data?.conflicts || []); else toast(e.message, 'error'); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={isNew ? 'Add class' : 'Edit class'} footer={conf ? (
      <div className="grid grid-cols-2 gap-3"><button className="btn-ghost" onClick={() => setConf(null)}>Go back</button><button className="btn-primary" disabled={busy} onClick={() => save(true)}>Add anyway</button></div>
    ) : <button className="btn-primary w-full" disabled={busy || !f.courseId || !f.hallCode} onClick={() => save(false)}>{busy && <Loader2 size={16} className="animate-spin" />}Save class</button>}>
      {conf ? (
        <div><div className="flex items-start gap-2 rounded-xl bg-bad/10 p-3 text-sm"><AlertTriangle size={18} className="mt-0.5 shrink-0 text-[rgb(var(--bad))]" />This overlaps with another class:</div>
          <ul className="mt-3 space-y-2 text-sm">{conf.map((c, i) => <li key={i} className="rounded-xl bg-surface2 p-3">{c.message}</li>)}</ul></div>
      ) : (
        <div className="space-y-4">
          <div><label className="label" htmlFor="ef-c">Course</label><select id="ef-c" className="input" value={f.courseId} onChange={set('courseId')} disabled={!isNew}><option value="">Choose a course</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.code}, {c.title}</option>)}</select></div>
          <div><label className="label" htmlFor="ef-h">Hall</label><select id="ef-h" className="input" value={f.hallCode} onChange={set('hallCode')}><option value="">Choose a hall</option>{halls.map((h) => <option key={h.code} value={h.code}>{h.code}, {h.name} ({h.capacity} seats)</option>)}</select></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="label" htmlFor="ef-d">Day</label><select id="ef-d" className="input" value={f.day} onChange={set('day')}>{[1, 2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{DAYS[d]}</option>)}</select></div>
            <div><label className="label" htmlFor="ef-s">Start</label><input id="ef-s" type="time" className="input" value={f.start} onChange={set('start')} /></div>
            <div><label className="label" htmlFor="ef-e">End</label><input id="ef-e" type="time" className="input" value={f.end} onChange={set('end')} /></div>
          </div>
          <div><label className="label" htmlFor="ef-k">Type</label><select id="ef-k" className="input" value={f.kind} onChange={set('kind')}>{['Lecture', 'Lab', 'Tutorial', 'Seminar', 'Exam'].map((k) => <option key={k}>{k}</option>)}</select></div>
        </div>
      )}
    </Modal>
  );
}

function HallsAdmin() {
  const { data, error, loading, reload } = useFetch('/halls');
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [ed, setEd] = useState(null);
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading || !data) return <Skeleton className="h-60" />;
  const rows = data.halls.filter((h) => !q || `${h.code} ${h.name}`.toLowerCase().includes(q.toLowerCase()));
  const save = async () => {
    try { await api(`/admin/halls/${ed.code}`, { method: 'PATCH', body: { name: ed.name, capacity: Number(ed.capacity), description: ed.description, equipment: String(ed.equipmentText).split(',').map((s) => s.trim()).filter(Boolean) } }); toast('Hall updated.', 'success'); setEd(null); reload(); } catch (e) { toast(e.message, 'error'); }
  };
  return (
    <div>
      <input className="input mb-4 max-w-sm" placeholder="Filter by code or name" aria-label="Filter halls" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="card overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="text-xs text-muted"><tr><th className="p-3">Code</th><th>Name</th><th>Seats</th><th /></tr></thead>
        <tbody className="divide-y divide-line">{rows.map((h) => <tr key={h.code}><td className="mono p-3 font-bold">{h.code}</td><td>{h.name}</td><td className="mono">{h.capacity || '-'}</td><td className="p-2 text-right"><button className="btn-ghost !min-h-[36px] !px-3 text-xs" onClick={() => setEd({ ...h, equipmentText: (h.equipment || []).join(', ') })}>Edit</button></td></tr>)}</tbody></table></div>
      <Modal open={!!ed} onClose={() => setEd(null)} title={ed ? `Edit ${ed.code}` : ''} footer={<button className="btn-primary w-full" onClick={save}>Save changes</button>}>
        {ed && <div className="space-y-4">
          <div><label className="label" htmlFor="eh-n">Name</label><input id="eh-n" className="input" value={ed.name} onChange={(e) => setEd({ ...ed, name: e.target.value })} /></div>
          <div><label className="label" htmlFor="eh-c">Seats</label><input id="eh-c" type="number" min="0" className="input" value={ed.capacity} onChange={(e) => setEd({ ...ed, capacity: e.target.value })} /></div>
          <div><label className="label" htmlFor="eh-e">Equipment (comma separated)</label><input id="eh-e" className="input" value={ed.equipmentText} onChange={(e) => setEd({ ...ed, equipmentText: e.target.value })} /></div>
          <div><label className="label" htmlFor="eh-d">Description</label><textarea id="eh-d" rows={3} className="input !py-3" value={ed.description || ''} onChange={(e) => setEd({ ...ed, description: e.target.value })} /></div>
        </div>}
      </Modal>
    </div>
  );
}

function Requests() {
  const iss = useFetch('/admin/issues');
  const req = useFetch('/admin/change-requests');
  const { toast } = useToast();
  const decide = async (id, approve) => { try { await api(`/admin/change-requests/${id}/decide`, { method: 'POST', body: { approve } }); toast(approve ? 'Approved. The class has moved.' : 'Declined.', 'success'); } catch (e) { toast(e.message, 'error'); } req.reload(); };
  const resolve = async (id) => { await api(`/admin/issues/${id}/resolve`, { method: 'POST' }); iss.reload(); toast('Marked as resolved.', 'success'); };
  return (
    <div className="space-y-6">
      <section><h2 className="mb-3 text-lg font-bold">Hall change requests</h2>
        {!req.data?.requests.length ? <EmptyState title="No requests" text="Teachers can ask for a different hall from a hall page." /> : (
          <ul className="space-y-2.5">{req.data.requests.map((r) => (
            <li key={r.id} className="card flex flex-wrap items-center gap-3 p-4"><div className="min-w-0 flex-1"><div className="font-semibold">{r.teacherName}: {r.courseCode}</div><div className="text-sm text-muted">{DAYS_SHORT[r.day]} <span className="mono">{r.fromHall}</span> to <span className="mono">{r.toHall}</span>{r.reason ? `. ${r.reason}` : ''}</div></div>
              {r.status === 'pending' ? <div className="flex gap-2"><button className="btn-primary !min-h-[40px]" onClick={() => decide(r.id, true)}><Check size={16} />Approve</button><button className="btn-ghost !min-h-[40px]" onClick={() => decide(r.id, false)}><X size={16} />Decline</button></div> : <span className="chip bg-surface2 capitalize">{r.status}</span>}</li>))}</ul>)}
      </section>
      <section><h2 className="mb-3 text-lg font-bold">Reported issues</h2>
        {!iss.data?.issues.length ? <EmptyState title="No reports" text="Hall problems reported by staff will appear here." /> : (
          <ul className="space-y-2.5">{iss.data.issues.map((i) => (
            <li key={i.id} className="card flex flex-wrap items-center gap-3 p-4"><div className="min-w-0 flex-1"><div className="font-semibold"><span className="mono">{i.hallCode}</span> {i.kind}</div><div className="text-sm text-muted">{i.details || 'No details'} {i.reporter && `(${i.reporter})`}</div></div>
              {i.status === 'open' ? <button className="btn-soft !min-h-[40px]" onClick={() => resolve(i.id)}>Mark resolved</button> : <span className="chip bg-surface2">Resolved</span>}</li>))}</ul>)}
      </section>
    </div>
  );
}

function News() {
  const { data, error, reload } = useFetch('/admin/announcements');
  const { toast } = useToast();
  const [f, setF] = useState({ title: '', body: '', level: 'info' });
  const post = async () => { try { await api('/admin/announcements', { method: 'POST', body: f }); setF({ title: '', body: '', level: 'info' }); toast('Published and sent to everyone.', 'success'); reload(); } catch (e) { toast(e.message, 'error'); } };
  const del = async (id) => { await api(`/admin/announcements/${id}`, { method: 'DELETE' }); reload(); };
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card card-pad space-y-4"><h2 className="text-lg font-bold">New announcement</h2>
        <div><label className="label" htmlFor="an-t">Title</label><input id="an-t" className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
        <div><label className="label" htmlFor="an-b">Message</label><textarea id="an-b" rows={3} className="input !py-3" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></div>
        <Segmented value={f.level} onChange={(v) => setF({ ...f, level: v })} options={[['info', 'Info'], ['warning', 'Warning'], ['urgent', 'Urgent']]} />
        <button className="btn-primary w-full" disabled={f.title.trim().length < 3} onClick={post}>Publish</button></section>
      <section><h2 className="mb-3 text-lg font-bold">Published</h2>
        <ul className="space-y-2.5">{(data?.announcements || []).filter((a) => a.active).map((a) => <li key={a.id} className="card flex items-start gap-3 p-4"><div className="min-w-0 flex-1"><div className="font-semibold">{a.title}</div><div className="text-sm text-muted">{a.body}</div></div><button className="rounded-lg p-2 text-bad hover:bg-surface2" aria-label="Remove" onClick={() => del(a.id)}><Trash2 size={16} /></button></li>)}</ul></section>
    </div>
  );
}

function Users() {
  const { data, error, reload } = useFetch('/admin/users');
  const { toast } = useToast();
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data) return <Skeleton className="h-60" />;
  const role = async (id, r) => { try { await api(`/admin/users/${id}/role`, { method: 'PATCH', body: { role: r } }); toast('Role updated.', 'success'); reload(); } catch (e) { toast(e.message, 'error'); } };
  const del = async (u) => { if (!confirm(`Delete ${u.name}?`)) return; try { await api(`/admin/users/${u.id}`, { method: 'DELETE' }); reload(); } catch (e) { toast(e.message, 'error'); } };
  return (
    <div className="card overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="text-xs text-muted"><tr><th className="p-3">Name</th><th>Email</th><th>Group</th><th>Role</th><th /></tr></thead>
      <tbody className="divide-y divide-line">{data.users.map((u) => <tr key={u.id}><td className="p-3 font-semibold">{u.name}</td><td className="text-muted">{u.email}</td><td>{u.department}{u.role === 'student' ? ` L${u.level}` : ''}</td>
        <td><select className="input !min-h-[36px] !py-1" aria-label={`Role for ${u.name}`} value={u.role} onChange={(e) => role(u.id, e.target.value)}>{['student', 'teacher', 'admin'].map((r) => <option key={r}>{r}</option>)}</select></td>
        <td className="p-2 text-right"><button className="rounded-lg p-2 text-bad hover:bg-surface2" aria-label={`Delete ${u.name}`} onClick={() => del(u)}><Trash2 size={16} /></button></td></tr>)}</tbody></table></div>
  );
}

function QrSheet() {
  const { data } = useFetch('/halls');
  const [imgs, setImgs] = useState({});
  const rooms = (data?.halls || []).filter((h) => !['restroom'].includes(h.type));
  useEffect(() => {
    let live = true;
    (async () => { const out = {}; for (const h of rooms) out[h.code] = await QRCode.toDataURL(`${window.location.origin}/l/${h.code}`, { width: 220, margin: 1, color: { dark: '#0A1A4F', light: '#FFFFFF' } }); if (live) setImgs(out); })();
    return () => { live = false; };
  }, [data]); // eslint-disable-line
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden"><p className="max-w-xl text-sm text-muted">Print these and stick one beside each door. Scanning sets the visitor’s “You are here” location, which is how indoor directions work without GPS.</p><button className="btn-primary" onClick={() => window.print()}><Printer size={18} />Print sheet</button></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-4">
        {rooms.map((h) => <div key={h.code} className="card break-inside-avoid p-3 text-center">{imgs[h.code] ? <img src={imgs[h.code]} alt={`QR for ${h.code}`} className="mx-auto h-[140px] w-[140px] rounded bg-white" /> : <div className="mx-auto h-[140px] w-[140px]" />}<div className="mono mt-2 text-lg font-bold">{h.code}</div><div className="truncate text-xs text-muted">{h.name}</div></div>)}
      </div>
    </div>
  );
}
