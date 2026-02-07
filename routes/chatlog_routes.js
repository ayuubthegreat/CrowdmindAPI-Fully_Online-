import express from "express";
import { authenticateToken } from "../middleware/auth_middleware.js";
import { send_message, find_chatlog_of_ID, create_new_chatbot, find__all_chatbots, edit_chatbot, delete_chatbot } from "../services/chatlog_services.js";

const router = express.Router();

router.post("/sendMessage", async (req, res) => {
    await send_message(req, res);
});
router.post("/getChatlog", async (req, res) => {
    await find_chatlog_of_ID(req, res);
});
router.post("/createChatbot", async (req, res) => {
    await create_new_chatbot(req, res);
});
router.get("/getAllChatbots", async (req, res) => {
    await find__all_chatbots(req, res);
});
router.post("/editChatbot", async (req, res) => {
    await edit_chatbot(req, res);
});
router.post("/deleteChatbot", async (req, res) => {
    await delete_chatbot(req, res);
});
export default router;