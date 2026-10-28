import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  DollarSign, 
  AlertTriangle, 
  Building2, 
  User, 
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { Input, Select, Textarea } from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { dealsApi } from '../api/deals.api.js';

const STAGES = [
  { id: '1_new', label: '1. New', color: 'border-t-slate-400' },
  { id: '2_qualified', label: '2. Qualified', color: 'border-t-ove-primary' },
  { id: '3_meeting_scheduled', label: '3. Meeting', color: 'border-t-[#2C5282]' },
  { id: '4_proposal_sent', label: '4. Proposal', color: 'border-t-ove-forest' },
  { id: '5_negotiation', label: '5. Negotiation', color: 'border-t-ove-warning' },
  { id: '6_won', label: '6. Won', color: 'border-t-ove-success' },
  { id: '7_lost', label: '7. Lost', color: 'border-t-ove-error' },
];

export const STAGE_ORDER = STAGES.map((s) => s.id);

export default function DealsKanbanPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ totalPipelineValue: 0, wonValue: 0, total: 0 });

  // Create Deal Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    title: '',
    amount: 25000,
    stage: '1_new',
    companyName: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Lost Reason Modal
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [pendingLostDealId, setPendingLostDealId] = useState(null);
  const [lostReason, setLostReason] = useState('price');
  const [lostNotes, setLostNotes] = useState('');
  const [lostLoading, setLostLoading] = useState(false);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await dealsApi.getAll();
      setDeals(res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      console.error('Failed to fetch deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleStageChange = async (dealId, nextStage) => {
    if (nextStage === '7_lost') {
      setPendingLostDealId(dealId);
      setIsLostModalOpen(true);
      return;
    }

    try {
      await dealsApi.updateStage(dealId, nextStage);
      fetchDeals();
    } catch (err) {
      console.error('Failed to move deal:', err);
    }
  };

  const handleConfirmLost = async (e) => {
    e.preventDefault();
    if (!pendingLostDealId) return;

    setLostLoading(true);
    try {
      await dealsApi.updateStage(pendingLostDealId, '7_lost', lostReason, lostNotes);
      setIsLostModalOpen(false);
      setPendingLostDealId(null);
      setLostNotes('');
      fetchDeals();
    } catch (err) {
      console.error('Failed to update lost deal:', err);
    } finally {
      setLostLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await dealsApi.create(createData);
      setIsCreateOpen(false);
      setCreateData({ title: '', amount: 25000, stage: '1_new', companyName: '' });
      fetchDeals();
    } catch (err) {
      console.error('Failed to create deal:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ove-text tracking-tight">Deals Pipeline</h2>
          <p className="text-xs text-ove-muted mt-0.5">
            Visualize opportunities across 7 pipeline stages and track stage velocity.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-4 bg-white border border-ove-border rounded-lg px-4 py-2 text-xs">
            <div>
              <span className="text-ove-muted block text-[10px] uppercase">Active Pipeline</span>
              <span className="font-bold text-ove-forest text-sm">
                ${(meta.totalPipelineValue || 0).toLocaleString()}
              </span>
            </div>
            <div className="h-6 w-px bg-ove-border" />
            <div>
              <span className="text-ove-muted block text-[10px] uppercase">Closed Won</span>
              <span className="font-bold text-ove-success text-sm">
                ${(meta.wonValue || 0).toLocaleString()}
              </span>
            </div>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateOpen(true)}>
            New Deal
          </Button>
        </div>
      </div>

      {/* 7-Stage Kanban Board */}
      {loading ? (
        <LoadingSpinner message="Loading deals pipeline..." />
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-[1400px]">
            {STAGES.map((stage) => {
              const stageDeals = deals.filter((d) => d.stage === stage.id);
              const stageTotal = stageDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
              const currentIndex = STAGE_ORDER.indexOf(stage.id);

              return (
                <div
                  key={stage.id}
                  className={`flex-1 min-w-[200px] max-w-[240px] bg-white border border-ove-border rounded-xl shadow-2xs flex flex-col border-t-4 ${stage.color}`}
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-ove-border/80 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-ove-text">{stage.label}</h4>
                      <span className="text-[11px] font-semibold text-ove-primary">
                        ${stageTotal.toLocaleString()}
                      </span>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-ove-soft border border-ove-border text-[10px] font-bold text-ove-text flex items-center justify-center">
                      {stageDeals.length}
                    </span>
                  </div>

                  {/* Deals Card List */}
                  <div className="p-2 space-y-2.5 flex-1 min-h-[350px] overflow-y-auto">
                    {stageDeals.length === 0 ? (
                      <div className="h-28 border border-dashed border-ove-border rounded-lg flex items-center justify-center text-[11px] text-ove-muted/60">
                        No deals
                      </div>
                    ) : (
                      stageDeals.map((deal) => {
                        const canMoveBack = currentIndex > 0 && stage.id !== '6_won' && stage.id !== '7_lost';
                        const canMoveForward = currentIndex < STAGE_ORDER.length - 1;

                        return (
                          <div
                            key={deal.id}
                            className="bg-white border border-ove-border rounded-lg p-3 shadow-2xs hover:border-ove-secondary hover:shadow-xs transition-all group"
                          >
                            <div className="flex items-start justify-between">
                              <h5 className="font-semibold text-xs text-ove-text leading-tight group-hover:text-ove-forest">
                                {deal.title}
                              </h5>
                            </div>

                            {deal.companyName && (
                              <div className="flex items-center space-x-1 text-[11px] text-ove-muted mt-1.5">
                                <Building2 className="w-3 h-3 text-ove-muted flex-shrink-0" />
                                <span className="truncate">{deal.companyName}</span>
                              </div>
                            )}

                            {deal.contactName && (
                              <div className="flex items-center space-x-1 text-[10px] text-ove-muted mt-0.5">
                                <User className="w-2.5 h-2.5 text-ove-muted flex-shrink-0" />
                                <span className="truncate">{deal.contactName}</span>
                              </div>
                            )}

                            <div className="mt-2.5 pt-2 border-t border-ove-border/50 flex items-center justify-between">
                              <span className="font-bold text-xs text-ove-forest">
                                ${(deal.amount || 0).toLocaleString()}
                              </span>
                              {deal.probability && (
                                <span className="text-[10px] text-ove-muted font-medium">
                                  {deal.probability}% prob
                                </span>
                              )}
                            </div>

                            {/* Stage progression controls */}
                            <div className="mt-2 pt-1 flex items-center justify-between text-ove-muted">
                              {canMoveBack ? (
                                <button
                                  type="button"
                                  onClick={() => handleStageChange(deal.id, STAGE_ORDER[currentIndex - 1])}
                                  title="Previous Stage"
                                  className="p-1 rounded hover:bg-ove-soft hover:text-ove-text"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <div />
                              )}

                              {canMoveForward && (
                                <button
                                  type="button"
                                  onClick={() => handleStageChange(deal.id, STAGE_ORDER[currentIndex + 1])}
                                  title="Advance Stage"
                                  className="p-1 rounded hover:bg-ove-soft hover:text-ove-forest flex items-center space-x-0.5 text-[10px] font-medium"
                                >
                                  <span>Next</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mandatory Lost Reason Modal */}
      <Modal
        isOpen={isLostModalOpen}
        onClose={() => setIsLostModalOpen(false)}
        title="Record Closed Lost Reason"
        subtitle="Mandatory requirement for pipeline analytics and root-cause analysis"
      >
        <form onSubmit={handleConfirmLost} className="space-y-4">
          <Select
            label="Primary Lost Reason"
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            options={[
              { value: 'price', label: 'Price / Budget Limitation' },
              { value: 'competitor', label: 'Lost to Competitor' },
              { value: 'timing', label: 'Timing / Project Postponed' },
              { value: 'no_budget', label: 'No Formal Budget Approved' },
              { value: 'feature_gap', label: 'Missing Critical Feature' },
              { value: 'other', label: 'Other Reason' },
            ]}
            required
          />

          <Textarea
            label="Loss Analysis Notes"
            placeholder="Details on what tipped the decision and feedback from the prospect..."
            value={lostNotes}
            onChange={(e) => setLostNotes(e.target.value)}
            rows={3}
          />

          <div className="pt-3 border-t border-ove-border flex items-center justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsLostModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" isLoading={lostLoading}>
              Confirm Closed Lost
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Deal Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Sales Opportunity"
        subtitle="Add a deal to the Kanban pipeline"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Deal Title"
            placeholder="e.g. Acme Corp - Cloud Consulting"
            value={createData.title}
            onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Deal Value (USD)"
              type="number"
              min="0"
              value={createData.amount}
              onChange={(e) => setCreateData({ ...createData, amount: Number(e.target.value) })}
              required
            />
            <Select
              label="Initial Stage"
              value={createData.stage}
              onChange={(e) => setCreateData({ ...createData, stage: e.target.value })}
              options={STAGES.map((s) => ({ value: s.id, label: s.label }))}
            />
          </div>

          <Input
            label="Company Name"
            placeholder="e.g. Acme Corporation"
            value={createData.companyName}
            onChange={(e) => setCreateData({ ...createData, companyName: e.target.value })}
          />

          <div className="pt-3 border-t border-ove-border flex items-center justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createLoading}>
              Create Deal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
