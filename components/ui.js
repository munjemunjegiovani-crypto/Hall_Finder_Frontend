'use client';
import { useEffect } from 'react';
import { AlertTriangle, Inbox, Loader2, X } from 'lucide-react';
import { LostKid } from '@/components/art/Scenes';

export const Skeleton = ({ className = '' }) => <div className={`skeleton ${className}`} aria-hidden="true" />;

export function Spinner({ label = 'Loading' }) {
  return <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted" role="status"><Loader2 className="animate-spin" size={18} />{label}…</div>;
}

export function EmptyState({ title, text, action, icon: Icon = Inbox }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface2 text-muted"><Icon size={24} /></span>
      <h3 className="text-lg font-bold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-bad/10 text-bad"><AlertTriangle size={24} /></span>
      <h3 className="text-lg font-bold">{error?.status === 0 ? 'You appear to be offline' : 'That did not load'}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{error?.message || 'Please try again.'}</p>
      {onRetry && <button className="btn-primary mt-4" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function NotFoundArt({ title = 'We could not find that hall', text = 'Check the code or search by name.', action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      <LostKid className="w-64" />
      <h3 className="mt-2 text-xl font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const STATUS = {
  free: ['bg-ok/15 text-[rgb(var(--ok))]', 'bg-ok'],
  soon: ['bg-warn/15 text-[rgb(var(--warn))]', 'bg-warn'],
  in_use: ['bg-bad/15 text-[rgb(var(--bad))]', 'bg-bad'],
  locked: ['bg-bad/15 text-[rgb(var(--bad))]', 'bg-bad'],
  closed: ['bg-surface2 text-muted', 'bg-muted'],
};
export function StatusPill({ status, className = '' }) {
  if (!status) return null;
  const [tone, dot] = STATUS[status.state] || STATUS.closed;
  return (
    <span className={`chip ${tone} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status.label}
    </span>
  );
}
export const statusColor = (state) => ({ free: '#10B981', soon: '#F59E0B', in_use: '#EF4444', locked: '#EF4444', closed: '#94A3B8' }[state] || '#94A3B8');

export function Modal({ open, onClose, title, children, wide = false, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-[#050A1E]/60 backdrop-blur-[2px]" onClick={onClose} aria-label="Close dialog" tabIndex={-1} />
      <div className={`relative z-10 flex max-h-[92vh] w-full animate-sheet flex-col rounded-t-3xl bg-surface shadow-modal sm:rounded-3xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-surface2" aria-label="Close"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-line px-5 py-3 safe-bottom">{footer}</div>}
      </div>
    </div>
  );
}

export function Segmented({ value, onChange, options, className = '' }) {
  return (
    <div className={`inline-flex rounded-xl bg-surface2 p-1 ${className}`} role="tablist">
      {options.map(([v, label]) => (
        <button key={v} role="tab" aria-selected={value === v} onClick={() => onChange(v)}
          className={`min-h-[38px] rounded-lg px-3.5 text-sm font-semibold transition ${value === v ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span><span className="block text-sm font-medium">{label}</span>{hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}</span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-7 w-12 rounded-full bg-line transition peer-checked:bg-teal peer-focus-visible:ring-2 peer-focus-visible:ring-teal/40" />
        <span className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function PageTitle({ title, sub, right }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>{sub && <p className="mt-1 text-sm text-muted">{sub}</p>}</div>
      {right}
    </div>
  );
}
