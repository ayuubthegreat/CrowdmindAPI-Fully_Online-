import express from "express";
import { authenticateToken } from "../middleware/auth_middleware.js";
import { createWikipediaArticle, deleteWikipediaArticle, getWikipediaArticles, updateWikipediaArticle } from "../services/wikipedia_articles_services.js";


const router = express.Router();

router.get("/getArticles", authenticateToken, async (req, res) => {
    await getWikipediaArticles(req, res);
});
router.post("/createArticle", authenticateToken, async (req, res) => {
    await createWikipediaArticle(req, res);
});
router.post("/editArticle", authenticateToken, async (req, res) => {
    await updateWikipediaArticle(req, res);
});
router.post("/deleteArticle", authenticateToken, async (req, res) => {
    await deleteWikipediaArticle(req, res);
});

export default router;