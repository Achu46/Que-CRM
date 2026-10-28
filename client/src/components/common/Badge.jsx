import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) {
  const variants = {
    default: 'bg-ove-soft text-ove-muted border-ove-border',
    forest: 'bg-ove-forest/10 text-ove-forest border-ove-forest/20',
    olive: 'bg-ove-primary/10 text-ove-primary border-ove-primary/20',
    success: 'bg-[#EEF6F0] text-ove-success border-ove-success/30',
    warning: 'bg-[#FFF9EE] text-ove-warning border-ove-warning/30',
    error: 'bg-[#FDF2F2] text-ove-error border-ove-error/30',
    info: 'bg-[#F0F5FA] text-[#2C5282] border-[#2C5282]/20',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  const dotColors = {
    default: 'bg-ove-muted',
    forest: 'bg-ove-forest',
    olive: 'bg-ove-primary',
    success: 'bg-ove-success',
    warning: 'bg-ove-warning',
    error: 'bg-ove-error',
    info: 'bg-[#2C5282]',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0 ${dotColors[variant] || dotColors.default}`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}

/**
 * Convenience helper to render stage badges
 */
export function StageBadge({ stage }) {
  const stageMap = {
    '1_new': { label: 'New', variant: 'default' },
    '2_qualified': { label: 'Qualified', variant: 'olive' },
    '3_meeting_scheduled': { label: 'Meeting', variant: 'info' },
    '4_proposal_sent': { label: 'Proposal', variant: 'forest' },
    '5_negotiation': { label: 'Negotiation', variant: 'warning' },
    '6_won': { label: 'Closed Won', variant: 'success' },
    '7_lost': { label: 'Closed Lost', variant: 'error' },
  };

  const current = stageMap[stage] || { label: stage, variant: 'default' };
  return <Badge variant={current.variant} dot>{current.label}</Badge>;
}

/**
 * Convenience helper to render priority badges
 */
export function PriorityBadge({ priority }) {
  const priorityMap = {
    low: { label: 'Low', variant: 'default' },
    medium: { label: 'Medium', variant: 'olive' },
    high: { label: 'High', variant: 'warning' },
    urgent: { label: 'Urgent', variant: 'error' },
  };

  const current = priorityMap[priority?.toLowerCase()] || { label: priority, variant: 'default' };
  return <Badge variant={current.variant}>{current.label}</Badge>;
}

