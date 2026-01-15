'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface UrlFormProps {
  onSubmit: (urls: string[]) => void;
  loading?: boolean;
}

export default function UrlForm({ onSubmit, loading = false }: UrlFormProps) {
  const [urlText, setUrlText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urls = urlText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      alert('Please enter at least one URL');
      return;
    }

    onSubmit(urls);
    setUrlText('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="urls" className="block text-sm font-medium text-gray-700 mb-2">
          Enter URLs (one per line)
        </label>
        <textarea
          id="urls"
          value={urlText}
          onChange={e => setUrlText(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com&#10;https://example2.com&#10;https://example3.com"
        />
      </div>
      <Button type="submit" disabled={loading} fullWidth>
        {loading ? 'Submitting...' : 'Start Scraping'}
      </Button>
    </form>
  );
}
