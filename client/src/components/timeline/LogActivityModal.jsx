import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Input, Select, Textarea } from '../common/Input';
import { activitiesApi } from '../../api/tasks.api.js';

export default function LogActivityModal({
  isOpen,
  onClose,
  entityType = 'contact',
  entityId,
  onSuccess,
}) {
  const [type, setType] = useState('call');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await activitiesApi.create({
        entityType,
        entityId,
        type,
        title,
        content,
      });
      setTitle('');
      setContent('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Customer Touchpoint"
      subtitle={`Log an interaction for this ${entityType}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-ove-error/10 text-ove-error border border-ove-error/20 rounded-lg">
            {error}
          </div>
        )}

        <Select
          label="Activity Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: 'call', label: 'Phone Call' },
            { value: 'meeting', label: 'Meeting / Demo' },
            { value: 'note', label: 'Internal Note' },
            { value: 'email_sent', label: 'Manual Email Record' },
          ]}
        />

        <Input
          label="Subject / Summary"
          placeholder="e.g. Discovery call regarding timeline and budget"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Discussion Details & Notes"
          placeholder="Customer requested a 1-month pilot before committing to full contract..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />

        <div className="pt-3 border-t border-ove-border flex items-center justify-end space-x-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            Save Activity
          </Button>
        </div>
      </form>
    </Modal>
  );
}
