import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";


const JWT_SECRET = process.env.JWT_SECRET || "GITS3";
// Middleware
export const authenticateToken = async (req, res, next) => {
    try {
        const token = req.headers["authorization"]?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token was provided. Please try again with a token."
            })
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: {id: decoded.userID},
            select: {
                id: true,
                websiteID: true,
                name: true,
                email: true,
                role: true,
            }
        })
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "No member found. Register first, please."
            })
        }
        req.user = user;
        console.log(req.user);
        next();
    } catch (error) {
        console.error("Authentication error:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message
    });
    }
}
