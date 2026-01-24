import express from "express";
import { authenticateToken } from "../middleware/auth_middleware.js";
import { createWikipediaArticle, getWikipediaArticles } from "../services/wikipedia_articles_services.js";


const router = express.Router();

router.get("/getArticles", authenticateToken, async (req, res) => {
    await getWikipediaArticles(req, res);
})
router.post("/createArticle", authenticateToken, async (req, res) => {
    await createWikipediaArticle(req, res);
})

export default router;