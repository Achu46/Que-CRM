import { Resend } from 'resend';
import { env } from '../config/env.js';
import { store } from './store.service.js';

let resendClient = null;
if (env.resend.apiKey && !env.resend.apiKey.includes('your_resend_api_key')) {
  try {
    resendClient = new Resend(env.resend.apiKey);
  } catch (err) {
    console.warn('[Resend Service] Failed to initialize client:', err.message);
  }
}

export const resendService = {
  /**
   * Sends an email via Resend API and logs the interaction
   */
  async sendEmail({
    to,
    subject,
    html,
    text,
    contactId,
    leadId,
    senderUser,
  }) {
    let resendMessageId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let isSimulated = false;

    if (resendClient) {
      try {
        const { data, error } = await resendClient.emails.send({
          from: env.resend.fromEmail || 'onboarding@resend.dev',
          to: [to],
          subject,
          html: html || `<p>${text}</p>`,
          text: text || undefined,
        });

        if (error) {
          throw new Error(error.message);
        }
        resendMessageId = data.id;
      } catch (apiErr) {
        console.warn('[Resend API Error, falling back to simulated log]:', apiErr.message);
        isSimulated = true;
      }
    } else {
      isSimulated = true;
    }

    // Record in emailLogs collection
    const emailLog = await store.create('emailLogs', {
      resendId: resendMessageId,
      recipientEmail: to,
      senderEmail: env.resend.fromEmail,
      subject,
      bodyHtml: html || `<p>${text}</p>`,
      contactId: contactId || null,
      leadId: leadId || null,
      sentBy: senderUser?.uid || 'system',
      status: isSimulated ? 'simulated_delivery' : 'sent',
    });

    // Automatically record interaction activity on the contact/lead
    const targetEntityType = contactId ? 'contact' : leadId ? 'lead' : null;
    const targetEntityId = contactId || leadId;

    if (targetEntityType && targetEntityId) {
      await store.create('activities', {
        entityType: targetEntityType,
        entityId: targetEntityId,
        type: 'email_sent',
        title: `Email Sent: "${subject}"`,
        content: text || subject,
        performedBy: senderUser?.uid || 'system',
        performedByName: senderUser?.name || 'Sales Representative',
        metadata: {
          resendId: resendMessageId,
          recipient: to,
          simulated: isSimulated,
        },
      });
    }

    return {
      messageId: resendMessageId,
      logId: emailLog.id,
      simulated: isSimulated,
      status: isSimulated ? 'simulated_delivery' : 'sent',
    };
  },
};

