import express from 'express';
import { authenticateToken } from '../middleware/auth_middleware.js';
import { food_form_machine, get_food_form_entries } from '../services/foodServices.js';

const router = express.Router();

router.post('/form', async (req, res) => {
    await food_form_machine(req, res);
})

router.post('/entries', authenticateToken, async (req, res) => {
    await get_food_form_entries(req, res);
});
export default router;
