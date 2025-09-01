'use client';

import { useState } from 'react';

export default function TriggerButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrigger = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/admin/trigger-fetch', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Trigger failed');
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleTrigger}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Running...' : 'Run fetch-arxiv now'}
      </button>
      
      {result && (
        <div className="p-3 bg-green-100 border border-green-300 rounded text-green-800">
          ✅ Success! {result.upserted ? `Upserted ${result.upserted} articles` : 'Function completed'}
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800">
          ❌ Error: {error}
        </div>
      )}
    </div>
  );
} 