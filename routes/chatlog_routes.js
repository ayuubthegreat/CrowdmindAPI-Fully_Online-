import express from "express";
import { authenticateToken } from "../middleware/auth_middleware.js";
import { send_message, find_chatlog_of_ID, create_new_chatbot } from "../services/chatlog_services.js";

const router = express.Router();

router.post("/sendMessage", async (req, res) => {
    await send_message(req, res);
})
router.post("/getChatlog", async (req, res) => {
    await find_chatlog_of_ID(req, res);
});
router.post("/createChatbot", async (req, res) => {
    await create_new_chatbot(req, res);
});
export default router;