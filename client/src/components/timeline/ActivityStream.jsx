import React from 'react';
import { Phone, Calendar, FileText, Mail, ArrowRightCircle, Sparkles } from 'lucide-react';

export default function ActivityStream({ activities = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case 'call':
        return <Phone className="w-3.5 h-3.5 text-ove-forest" />;
      case 'meeting':
        return <Calendar className="w-3.5 h-3.5 text-[#2C5282]" />;
      case 'email_sent':
        return <Mail className="w-3.5 h-3.5 text-ove-primary" />;
      case 'stage_change':
        return <ArrowRightCircle className="w-3.5 h-3.5 text-ove-warning" />;
      case 'ai_summary':
        return <Sparkles className="w-3.5 h-3.5 text-ove-primary" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-ove-muted" />;
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'call':
        return 'bg-ove-forest/10 border-ove-forest/20 text-ove-forest';
      case 'meeting':
        return 'bg-[#F0F5FA] border-[#2C5282]/20 text-[#2C5282]';
      case 'email_sent':
        return 'bg-ove-primary/10 border-ove-primary/20 text-ove-primary';
      case 'stage_change':
        return 'bg-[#FFF9EE] border-ove-warning/20 text-ove-warning';
      default:
        return 'bg-ove-soft border-ove-border text-ove-muted';
    }
  };

  if (!activities.length) {
    return (
      <div className="py-8 text-center text-xs text-ove-muted">
        No activities logged yet. Use the actions above to record the first customer touchpoint.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-ove-border">
      {activities.map((act) => {
        const formattedDate = new Date(act.createdAt).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={act.id} className="relative group">
            {/* Timeline bullet icon */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center bg-white shadow-xs ${getBadgeStyle(
                act.type
              )}`}
            >
              {getIcon(act.type)}
            </div>

            <div className="bg-white border border-ove-border rounded-lg p-3.5 shadow-2xs hover:border-ove-secondary/60 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ove-text">{act.title}</span>
                <span className="text-[11px] text-ove-muted">{formattedDate}</span>
              </div>

              {act.content && (
                <p className="mt-1 text-xs text-ove-muted leading-relaxed whitespace-pre-wrap">
                  {act.content}
                </p>
              )}

              <div className="mt-2 pt-2 border-t border-ove-border/50 flex items-center justify-between text-[10px] text-ove-muted">
                <span>By: {act.performedByName || 'Staff Member'}</span>
                <span className="uppercase tracking-wider font-medium">{act.type.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

