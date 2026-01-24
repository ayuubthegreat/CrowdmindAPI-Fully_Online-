import express from "express"
import prisma from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth_middleware.js";
import { registerFunc, loginFunc, token, retrieveUserInfo, findUserByID } from "../services/authServices.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "GITS3"

router.post("/register", async(req, res) => {
    await registerFunc(req, res);
});
router.post("/login", async(req, res) => {
    await loginFunc(req, res);
});
router.get("/me", authenticateToken, async(req, res) => {
    await retrieveUserInfo(req, res);
});
router.post("/findUserByID", authenticateToken, async(req, res) => {
    await findUserByID(req, res);
});

export default router;
