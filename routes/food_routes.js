import express from 'express';
import { authenticateToken } from '../middleware/auth_middleware.js';
import { food_form_machine } from '../services/foodServices.js';

const router = express.Router();

router.post('/form', async (req, res) => {
    await food_form_machine(req, res);
})
export default router;
