import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

let genAI = null;
if (env.gemini.apiKey && !env.gemini.apiKey.includes('your_gemini_api_key')) {
  try {
    genAI = new GoogleGenerativeAI(env.gemini.apiKey);
  } catch (err) {
    console.warn('[Gemini AI] Failed to initialize GoogleGenerativeAI client:', err.message);
  }
}

export const geminiService = {
  /**
   * Summarizes chronological customer interactions into actionable takeaways
   */
  async summarizeInteractions(activities = [], contactName = 'Customer') {
    if (!activities.length) {
      return {
        summary: 'No previous interactions logged for this contact yet. Ready for initial outreach.',
        model: 'baseline',
      };
    }

    const activityContext = activities
      .slice(0, 10)
      .map(
        (a) =>
          `[${new Date(a.createdAt).toLocaleDateString()} - ${a.type.toUpperCase()}]: ${a.title}. Details: ${a.content || 'None'}`
      )
      .join('\n');

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are an executive CRM sales assistant for OVE Solutions (Tagline: People • Process • Progress).
Below is the interaction history with ${contactName}:
${activityContext}

Provide a concise, executive 3-bullet summary:
1. Current Customer Status & Core Needs
2. Key Discussion Points / Potential Roadblocks
3. Recommended Immediate Next Action

Keep it under 120 words. Professional SaaS tone.`;

        const result = await model.generateContent(prompt);
        return {
          summary: result.response.text(),
          model: 'gemini-1.5-flash',
        };
      } catch (err) {
        console.warn('[Gemini AI Summarize Error, using fallback]:', err.message);
      }
    }

    // High quality contextual fallback summary
    const latest = activities[0];
    const totalCalls = activities.filter((a) => a.type === 'call').length;
    const totalMeetings = activities.filter((a) => a.type === 'meeting').length;

    const fallbackSummary = `• Status Overview: Active prospect with ${activities.length} total logged interaction(s) (${totalCalls} call(s), ${totalMeetings} meeting(s)).\n• Recent Engagement: Last touchpoint on ${new Date(latest.createdAt).toLocaleDateString()} regarding "${latest.title}".\n• Recommended Next Action: Schedule follow-up to review outstanding proposals and confirm technical implementation timeline.`;

    return {
      summary: fallbackSummary,
      model: 'smart-heuristic-fallback',
    };
  },

  /**
   * Generates a context-aware follow-up email draft based on history and user instructions
   */
  async generateFollowUpDraft({
    contactName = 'Client',
    companyName = 'your company',
    activities = [],
    userInstructions = '',
    repName = 'Sales Representative',
  }) {
    const contextSnippet = activities
      .slice(0, 5)
      .map((a) => `${a.type}: ${a.title}`)
      .join('; ');

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are writing a personalized follow-up email on behalf of ${repName} from OVE Solutions (People • Process • Progress) to ${contactName} at ${companyName}.
Recent CRM History: ${contextSnippet || 'Initial contact'}
Specific Rep Instructions: ${userInstructions || 'Check in regarding our proposal and schedule next discussion'}

Respond strictly with a JSON object in this format:
{
  "subject": "Clear, professional email subject line",
  "body": "Formatted email body with greeting and sign-off."
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return { ...parsed, model: 'gemini-1.5-flash' };
        }
      } catch (err) {
        console.warn('[Gemini AI Draft Error, using fallback]:', err.message);
      }
    }

    // Contextual fallback draft
    return {
      subject: `Following up on our discussion — OVE Solutions & ${companyName}`,
      body: `Hi ${contactName},\n\nI hope you're having a productive week.\n\nFollowing up on our recent conversation regarding your technical requirements at ${companyName}, I wanted to see if you had any questions on the details we discussed.\n\n${userInstructions ? `Specifically regarding your note: "${userInstructions}".\n\n` : ''}Let me know if you would like to schedule a quick 15-minute sync later this week to finalize the next steps.\n\nBest regards,\n\n${repName}\nOVE Solutions | People • Process • Progress`,
      model: 'smart-heuristic-fallback',
    };
  },

  /**
   * Extracts structured lead entities from unstructured customer inquiry text
   */
  async extractLeadFromText(inquiryText = '') {
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Extract CRM lead fields from this inquiry message:
"""
${inquiryText}
"""

Return strictly a JSON object:
{
  "firstName": "string",
  "lastName": "string",
  "email": "string or empty",
  "phone": "string or empty",
  "companyName": "string or empty",
  "requirementsSummary": "concise 1-sentence summary of needs",
  "suggestedPriority": "low" | "medium" | "high" | "urgent"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          return { ...JSON.parse(match[0]), model: 'gemini-1.5-flash' };
        }
      } catch (err) {
        console.warn('[Gemini AI Extract Error, using heuristic]:', err.message);
      }
    }

    // Heuristic entity extraction fallback
    const emailMatch = inquiryText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = inquiryText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

    return {
      firstName: 'Prospect',
      lastName: '',
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      companyName: 'Prospective Enterprise',
      requirementsSummary: inquiryText.slice(0, 150),
      suggestedPriority: inquiryText.toLowerCase().includes('urgent') || inquiryText.toLowerCase().includes('immediately') ? 'high' : 'medium',
      model: 'regex-heuristic-fallback',
    };
  },
};
