import { Router } from 'express';
import {
  getTasks,
  createTask,
  completeTask,
} from '../controllers/tasks.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createTaskSchema } from '../schemas/task.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', validate(createTaskSchema), createTask);
router.patch('/:id/complete', completeTask);

export default router;

