'use client';
import { useEffect, useState } from 'react';

export default function AdminHealth() {
  const [data, setData] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [digestRunning, setDigestRunning] = useState(false);
  const [digestResult, setDigestResult] = useState<any>(null);

  async function load() {
    const r = await fetch('/api/admin/health'); setData(await r.json());
  }
  async function run() {
    setRunning(true); setResult(null);
    const r = await fetch('/api/admin/trigger-fetch', { method: 'POST' });
    setResult(await r.json()); setRunning(false); load();
  }
  async function buildDigest() {
    setDigestRunning(true); setDigestResult(null);
    const r = await fetch('/api/admin/build-digest', { method: 'POST' });
    setDigestResult(await r.json()); setDigestRunning(false); load();
  }

  useEffect(() => { load(); }, []);

  if (process.env.NODE_ENV !== 'development') {
    return <div className="p-6 text-sm text-neutral-500">Admin only (dev view)</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">ResDex Pipeline Health (dev)</h1>
      <pre className="p-3 bg-neutral-100 rounded">{JSON.stringify(data, null, 2)}</pre>
      
      <div className="flex gap-4">
        <button onClick={run} disabled={running}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
          {running ? 'Running…' : 'Run fetch-arxiv now'}
        </button>
        
        <button onClick={buildDigest} disabled={digestRunning}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
          {digestRunning ? 'Building…' : 'Build digest now'}
        </button>
      </div>
      
      {result && <pre className="p-3 bg-neutral-100 rounded">{JSON.stringify(result, null, 2)}</pre>}
      {digestResult && <pre className="p-3 bg-blue-50 rounded">{JSON.stringify(digestResult, null, 2)}</pre>}
    </div>
  );
} 