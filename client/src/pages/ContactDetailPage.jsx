import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  DollarSign, 
  Sparkles,
  PhoneCall,
  Send
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge, { StageBadge, PriorityBadge } from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ActivityStream from '../components/timeline/ActivityStream';
import LogActivityModal from '../components/timeline/LogActivityModal';
import AISummaryCard from '../components/ai/AISummaryCard';
import AIDraftEmailModal from '../components/ai/AIDraftEmailModal';
import Modal from '../components/common/Modal';
import { Input, Select } from '../components/common/Input';
import { contactsApi } from '../api/contacts.api.js';
import { tasksApi } from '../api/tasks.api.js';

export default function ContactDetailPage({ contactId, onBack }) {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  // Task Form State
  const [taskData, setTaskData] = useState({
    title: '',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    priority: 'medium',
  });
  const [taskLoading, setTaskLoading] = useState(false);

  const fetchContactDetails = async () => {
    setLoading(true);
    try {
      const res = await contactsApi.getById(contactId);
      setContact(res.data);
    } catch (err) {
      console.error('Failed to load contact details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contactId) fetchContactDetails();
  }, [contactId]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setTaskLoading(true);
    try {
      await tasksApi.create({
        ...taskData,
        entityType: 'contact',
        entityId: contactId,
        entityTitle: `${contact.firstName} ${contact.lastName}`,
      });
      setIsTaskOpen(false);
      setTaskData({
        title: '',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        priority: 'medium',
      });
      fetchContactDetails();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setTaskLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await tasksApi.complete(taskId);
      fetchContactDetails();
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading contact profile..." />;
  if (!contact) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-ove-error">Contact not found.</p>
        <Button variant="secondary" onClick={onBack} className="mt-4">
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-ove-muted hover:text-ove-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contacts</span>
        </button>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="secondary"
            icon={Mail}
            onClick={() => setIsEmailOpen(true)}
          >
            Send Email (Resend)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={Calendar}
            onClick={() => setIsTaskOpen(true)}
          >
            Add Task
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={PhoneCall}
            onClick={() => setIsLogOpen(true)}
          >
            Log Activity
          </Button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="!p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-ove-forest text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {contact.firstName?.charAt(0)}
              {contact.lastName?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-ove-text">
                  {contact.firstName} {contact.lastName}
                </h2>
                {contact.isPrimary && <Badge variant="olive">Primary Contact</Badge>}
              </div>
              <p className="text-xs text-ove-muted font-medium mt-0.5">
                {contact.jobTitle || 'Key Stakeholder'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-ove-muted bg-ove-soft/80 p-3 rounded-lg border border-ove-border">
            <div className="flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-ove-forest" />
              <span className="font-semibold text-ove-text">{contact.companyName || 'Individual'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Mail className="w-4 h-4 text-ove-primary" />
              <span>{contact.email}</span>
            </div>
            {contact.phone && (
              <div className="flex items-center space-x-1.5">
                <Phone className="w-4 h-4 text-ove-muted" />
                <span>{contact.phone}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Associated Deals & Tasks */}
        <div className="space-y-6">
          {/* Associated Deals */}
          <Card title="Associated Deals" subtitle={`${(contact.deals || []).length} active deal(s)`}>
            {(!contact.deals || contact.deals.length === 0) ? (
              <p className="text-xs text-ove-muted py-2">No active deals linked yet.</p>
            ) : (
              <div className="space-y-3">
                {contact.deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-3 rounded-lg border border-ove-border bg-ove-soft/30 hover:border-ove-forest/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <h5 className="font-semibold text-xs text-ove-text">{deal.title}</h5>
                      <StageBadge stage={deal.stage} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-ove-forest">
                        ${(deal.amount || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-ove-muted">{deal.probability}% probability</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending Tasks */}
          <Card
            title="Follow-ups & Tasks"
            subtitle={`${(contact.tasks || []).filter((t) => t.status === 'pending').length} pending`}
          >
            {(!contact.tasks || contact.tasks.length === 0) ? (
              <p className="text-xs text-ove-muted py-2">No upcoming tasks scheduled.</p>
            ) : (
              <div className="space-y-2">
                {contact.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg border border-ove-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-start space-x-2">
                      <button
                        type="button"
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={task.status === 'completed'}
                        className={`mt-0.5 ${
                          task.status === 'completed'
                            ? 'text-ove-success cursor-default'
                            : 'text-ove-muted hover:text-ove-success'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div>
                        <p
                          className={`font-medium ${
                            task.status === 'completed'
                              ? 'line-through text-ove-muted'
                              : 'text-ove-text'
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-[10px] text-ove-muted">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: AI Assistant & Unified Chronological Activity Stream */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gemini AI Summary Assistant */}
          <AISummaryCard
            contactName={`${contact.firstName} ${contact.lastName}`}
            entityType="contact"
            entityId={contactId}
            activities={contact.activities || []}
          />

          {/* Activity Stream */}
          <Card
            title="Unified Interaction History"
            subtitle="Chronological feed of phone calls, meetings, notes, and emails"
            action={
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => setIsLogOpen(true)}
              >
                Log Interaction
              </Button>
            }
          >
            <ActivityStream activities={contact.activities || []} />
          </Card>
        </div>
      </div>

      {/* Log Activity Modal */}
      <LogActivityModal
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        entityType="contact"
        entityId={contactId}
        onSuccess={fetchContactDetails}
      />

      {/* AI Draft & Resend Email Modal */}
      <AIDraftEmailModal
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
        contact={contact}
        onEmailSent={fetchContactDetails}
      />

      {/* Add Task Modal */}
      <Modal
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        title="Schedule Follow-up Task"
        subtitle={`Assign task for ${contact.firstName} ${contact.lastName}`}
      >
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <Input
            label="Task Description"
            placeholder="e.g. Call to review revised pricing proposal"
            value={taskData.title}
            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Due Date"
              type="date"
              value={taskData.dueDate}
              onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
              required
            />
            <Select
              label="Priority Level"
              value={taskData.priority}
              onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
              options={[
                { value: 'low', label: 'Low Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'high', label: 'High Priority' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </div>

          <div className="pt-3 border-t border-ove-border flex items-center justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsTaskOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={taskLoading}>
              Schedule Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
