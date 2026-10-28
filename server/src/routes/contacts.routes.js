import { Router } from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
} from '../controllers/contacts.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createContactSchema, updateContactSchema } from '../schemas/contact.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', getContacts);
router.post('/', validate(createContactSchema), createContact);
router.get('/:id', getContactById);
router.put('/:id', validate(updateContactSchema), updateContact);

export default router;
