import express from "express"
import prisma from "prisma";
import { authenticateToken } from "../middleware/auth_middleware.js";
import { registerFunc, loginFunc, token } from "../services/authServices.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "GITS3"

router.post("/register", async(req, res) => {
    await registerFunc(req, res);
});
router.post("/login", async(req, res) => {
    await loginFunc(req, res);
});
router.get("/me", authenticateToken, async(req, res) => {
    try {
        const {email} = req.user; 
        console.log(email);
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Must provide email and password."
            })
        }
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                role: true,
            }
        })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No user could be located. Please register first."
            })
        }
        const tok = token({
            id: user.id,
            JWT_SECRET: JWT_SECRET,
            expiresIn: "48h",
        });
        console.log(tok);
        return res.status(200).json({
            success: true,
            message: "User has been verified. Welcome to the CrowdMind API!",
            data: {
                user,
                token: tok,
            }
        })

    } catch (error) {
        console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
    }
});

export default router;
