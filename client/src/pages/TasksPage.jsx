import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Search, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge, { PriorityBadge } from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { Input, Select } from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { tasksApi } from '../api/tasks.api.js';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Create Modal
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    priority: 'medium',
    entityType: 'deal',
    entityId: 'deal_1',
    entityTitle: 'Acme Cloud Opportunity',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await tasksApi.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      });
      setTasks(res.data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const handleComplete = async (taskId) => {
    try {
      await tasksApi.complete(taskId);
      fetchTasks();
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await tasksApi.create(formData);
      setIsOpen(false);
      setFormData({
        title: '',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        priority: 'medium',
        entityType: 'deal',
        entityId: 'deal_1',
        entityTitle: '',
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ove-text tracking-tight">Tasks & Follow-ups</h2>
          <p className="text-xs text-ove-muted mt-0.5">
            Never lose a deal to a forgotten follow-up or overdue customer deliverable.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsOpen(true)}>
          Create Task
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="!p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {['pending', 'completed', 'all'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  statusFilter === tab
                    ? 'bg-ove-forest text-white'
                    : 'text-ove-muted hover:text-ove-text hover:bg-ove-soft'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-ove-muted">Priority:</span>
            {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  priorityFilter === p
                    ? 'bg-ove-soft text-ove-forest font-bold border border-ove-border'
                    : 'text-ove-muted hover:text-ove-text'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Task List */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading task queue..." />
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center">
            <CheckSquare className="w-10 h-10 text-ove-muted/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-ove-text">All caught up!</p>
            <p className="text-xs text-ove-muted mt-0.5">No tasks match your current filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-ove-border">
            {tasks.map((task) => {
              const isOverdue =
                task.status === 'pending' &&
                new Date(task.dueDate).getTime() < Date.now() - 86400000;

              return (
                <div
                  key={task.id}
                  className="p-4 flex items-center justify-between hover:bg-ove-soft/30 transition-colors"
                >
                  <div className="flex items-start space-x-3.5">
                    <button
                      type="button"
                      onClick={() => handleComplete(task.id)}
                      disabled={task.status === 'completed'}
                      className={`mt-0.5 transition-colors ${
                        task.status === 'completed'
                          ? 'text-ove-success cursor-default'
                          : 'text-ove-muted hover:text-ove-forest'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div>
                      <h4
                        className={`text-sm font-semibold ${
                          task.status === 'completed'
                            ? 'line-through text-ove-muted'
                            : 'text-ove-text'
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-ove-muted mt-0.5">{task.description}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-3 text-xs text-ove-muted">
                        <span
                          className={`flex items-center space-x-1 font-medium ${
                            isOverdue ? 'text-ove-error' : ''
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] font-bold bg-ove-error/10 text-ove-error px-1.5 py-0.2 rounded">
                              Overdue
                            </span>
                          )}
                        </span>
                        {task.entityTitle && (
                          <span className="text-ove-muted/80">
                            • Linked to: <span className="font-medium text-ove-text">{task.entityTitle}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <PriorityBadge priority={task.priority} />
                    {task.status === 'completed' && (
                      <Badge variant="success">Completed</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Create Task Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Schedule Follow-up Task"
        subtitle="Ensure the next operational step is logged and assigned"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Title / Objective"
            placeholder="e.g. Follow up on custom security audit clause"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </div>

          <div className="pt-3 border-t border-ove-border flex items-center justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitLoading}>
              Save Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

