import { z } from 'zod';
import { resendService } from '../services/resend.service.js';
import { sendSuccess } from '../utils/response.js';

export const sendEmailSchema = z.object({
  to: z.string().trim().email('Valid recipient email required'),
  subject: z.string().trim().min(1, 'Subject line is required'),
  html: z.string().optional(),
  text: z.string().optional(),
  contactId: z.string().optional(),
  leadId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.html && !data.text) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either html or text content must be provided',
      path: ['text'],
    });
  }
});

export async function sendEmail(req, res, next) {
  try {
    const result = await resendService.sendEmail({
      ...req.body,
      senderUser: req.user,
    });

    return sendSuccess(
      res,
      result,
      result.simulated ? 'Email delivery logged (simulated)' : 'Email sent successfully via Resend',
      200
    );
  } catch (error) {
    next(error);
  }
}
