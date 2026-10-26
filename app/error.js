'use client';
export default function Error({ reset }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-extrabold">Something went wrong</h1>
      <p className="max-w-sm text-muted">The page hit an unexpected problem. Reloading usually fixes it.</p>
      <button className="btn-primary" onClick={reset}>Reload</button>
    </div>
  );
}
