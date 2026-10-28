import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import Button from '../common/Button';
import { aiApi } from '../../api/integrations.api.js';

export default function AISummaryCard({ contactName, entityType = 'contact', entityId, activities = [] }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState('');

  const generateSummary = async () => {
    setLoading(true);
    try {
      const res = await aiApi.summarize({
        contactName,
        entityType,
        entityId,
        activities,
      });
      setSummary(res.data?.summary || '');
      setModelUsed(res.data?.model || '');
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contactName) {
      generateSummary();
    }
  }, [contactName, entityId]);

  return (
    <div className="bg-gradient-to-br from-ove-soft via-white to-[#f2f4ec] border border-ove-primary/30 rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-ove-border/80">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-ove-primary/10 text-ove-forest">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ove-forest">Gemini Interaction Assistant</h4>
            <span className="text-[10px] text-ove-muted">
              AI-synthesized key takeaways & next step recommendations
            </span>
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          icon={RefreshCw}
          isLoading={loading}
          onClick={generateSummary}
          title="Regenerate with Gemini"
          className="text-ove-forest hover:bg-white"
        >
          Refresh
        </Button>
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="py-4 flex items-center justify-center space-x-2 text-xs text-ove-muted">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-ove-primary" />
            <span>Analyzing interaction timeline with Gemini...</span>
          </div>
        ) : (
          <div className="text-xs text-ove-text leading-relaxed whitespace-pre-wrap font-sans">
            {summary || 'Click refresh to analyze customer interaction history.'}
          </div>
        )}
      </div>

      {modelUsed && (
        <div className="mt-3 pt-2 border-t border-ove-border/40 flex items-center justify-between text-[10px] text-ove-muted">
          <span>Human-in-the-loop review required</span>
          <span className="uppercase tracking-wider font-semibold text-ove-primary">
            Powered by {modelUsed.replace(/-/g, ' ')}
          </span>
        </div>
      )}
    </div>
  );
}
