import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // Firebase
  firebase: {
    serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || './serviceAccountKey.json',
    serviceAccountBase64: process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || '',
  },

  // Gemini AI
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },

  // Resend Email
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  },

  // n8n Webhook Automations
  n8n: {
    webhookUrl: process.env.N8N_WEBHOOK_URL || '',
    inboundSecret: process.env.N8N_INBOUND_SECRET || 'dev_secret_crm_webhook',
  },
};

