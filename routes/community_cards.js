import express from "express";
import { authenticateToken } from "../middleware/auth_middleware.js";
import { changePriority, changeStatus, community_cardGetAll, community_cardGetAllOfUser, community_cardImportFunc, deleteAllCards, deleteCard, editCard } from "../services/community_cardsServices.js";


const router = express.Router();

router.post("/newPost", authenticateToken, async (req, res) => {
    await community_cardImportFunc(req, res)
})
router.get("/getUserPosts", authenticateToken, async (req, res) => {
    await community_cardGetAll(req, res);
})
router.get("/getAllPosts", authenticateToken, async (req, res) => {
    await community_cardGetAll(req, res);
})
router.post("/editPost", authenticateToken, async (req, res) => {
    await editCard(req, res);
})
router.post("/deletePost", authenticateToken, async (req, res) => {
    await deleteCard(req, res);
})
router.get("/deleteAllPosts", authenticateToken, async (req, res) => {
    await deleteAllCards(req, res);
})
router.post("/editStatus", authenticateToken, async (req, res) => {
    await changeStatus(req, res);
})
router.post("/editPriority", authenticateToken, async (req, res) => {
    await changePriority(req, res);
})
export default router;

