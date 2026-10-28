import React, { useState } from 'react';
import { Sparkles, Send, RefreshCw, Mail } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Input, Textarea } from '../common/Input';
import { aiApi, emailApi } from '../../api/integrations.api.js';

export default function AIDraftEmailModal({
  isOpen,
  onClose,
  contact,
  onEmailSent,
}) {
  const [instructions, setInstructions] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await aiApi.draftEmail({
        contactName: `${contact?.firstName || ''} ${contact?.lastName || ''}`.trim() || 'Valued Client',
        companyName: contact?.companyName || 'your organization',
        userInstructions: instructions || 'Follow up on our proposal and request a convenient sync time',
        activities: contact?.activities || [],
      });
      setSubject(res.data?.subject || '');
      setBody(res.data?.body || '');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate draft');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      setError('Subject and message body are required before sending');
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      const res = await emailApi.send({
        to: contact.email,
        subject,
        text: body,
        contactId: contact.id,
      });

      setSuccessMessage(res.message || 'Email sent successfully via Resend');
      if (onEmailSent) onEmailSent();
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compose Email with Gemini & Resend"
      subtitle={`Recipient: ${contact?.firstName} ${contact?.lastName} (${contact?.email})`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-ove-error/10 text-ove-error border border-ove-error/20 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 text-xs bg-ove-success/10 text-ove-success border border-ove-success/20 rounded-lg font-medium">
            ✓ {successMessage}
          </div>
        )}

        {/* AI Drafting Prompt Bar */}
        <div className="bg-ove-soft/80 border border-ove-border rounded-xl p-3.5 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-ove-forest">
            <Sparkles className="w-4 h-4 text-ove-primary" />
            <span>Gemini AI Drafting Assistant</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="e.g. Inquire about legal feedback and suggest a call this Thursday at 2 PM..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="flex-1 bg-white border border-ove-border rounded-lg px-3 py-1.5 text-xs text-ove-text placeholder-ove-muted/70 focus:outline-none focus:ring-2 focus:ring-ove-primary/50"
            />
            <Button
              size="sm"
              variant="olive"
              icon={Sparkles}
              isLoading={isGenerating}
              onClick={handleGenerateDraft}
            >
              Generate Draft
            </Button>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSendEmail} className="space-y-3.5">
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Proposal follow-up..."
            required
          />

          <Textarea
            label="Email Message (Editable)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder="Click 'Generate Draft' above or type your email directly..."
            required
          />

          <div className="pt-3 border-t border-ove-border flex items-center justify-between">
            <span className="text-[11px] text-ove-muted">
              Sends securely through backend Resend API
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="secondary" onClick={onClose} disabled={isSending}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                icon={Send}
                isLoading={isSending}
                disabled={!subject || !body}
              >
                Send via Resend
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

