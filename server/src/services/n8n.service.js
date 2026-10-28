import { env } from '../config/env.js';

export const n8nService = {
  /**
   * Dispatches an event payload to the configured n8n webhook URL
   * Executes asynchronously so user API latency is not blocked.
   */
  async dispatch(eventType, payload) {
    if (!env.n8n.webhookUrl || env.n8n.webhookUrl.includes('localhost:5678/webhook/crm-events')) {
      // In development when n8n isn't actively running, log event silently
      if (env.nodeEnv !== 'test') {
        console.log(`[n8n Webhook Outbound (Simulated)] Event: ${eventType}`, {
          event: eventType,
          timestamp: new Date().toISOString(),
          data: payload,
        });
      }
      return { dispatched: true, simulated: true };
    }

    try {
      const response = await fetch(env.n8n.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CRM-Source': 'OVE-Solutions-CRM',
          'X-CRM-Secret': env.n8n.inboundSecret,
        },
        body: JSON.stringify({
          event: eventType,
          timestamp: new Date().toISOString(),
          payload,
        }),
      });

      return {
        dispatched: true,
        status: response.status,
      };
    } catch (err) {
      console.warn(`[n8n Dispatch Error for ${eventType}]:`, err.message);
      return { dispatched: false, error: err.message };
    }
  },
};
