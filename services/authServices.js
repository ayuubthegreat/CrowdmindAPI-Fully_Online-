import express from "express"
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { checkIfPersonIsAdmin } from "../authorizedPeople.js";




const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "GITS3"



export const token = function(obj) {
    const token = jwt.sign(
        { userID: obj.id },
        obj.JWT_SECRET,
        { expiresIn: `${obj.expiresIn}` }
    )
    console.log(token);
    return token;
}

export const registerFunc = async (req,
res) => {
    try {
        const {name, email, password, websiteID} = req.body;
        console.log(email, password, websiteID);
        if (!websiteID || !name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Must provide name, email, password and Website ID."
            })
        }
        const user = await prisma.user.findUnique({
            where: {
                email: email,
                websiteID: websiteID,
            }
        })
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exists in the database. Please try again with a new user."
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                websiteID,
                name, 
                email,
                password: hashedPassword,
                role: checkIfPersonIsAdmin(email) ? "supa_admin" : "user",
            },
            select: {
                id: true,
                websiteID: true,
                name: true,
                email: true,
                role: true,
            }
        })
        const tok = token({
            id: newUser.id,
            JWT_SECRET: JWT_SECRET,
            expiresIn: "48h"
        });
        console.log(tok);
        return res.status(201).json({
            success: true,
            message: "User has been created.",
            data: {
                user: newUser,
                token: tok
            }
        })
    } catch (error) {
        console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
    }
}
export const loginFunc = async (req, res) => {
    try {
        const {email, password, websiteID} = req.body; 
        console.log(email, password, websiteID);
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Must provide email and password."
            })
        }
        const user = await prisma.user.findUnique({
            where: {
                email: email,
                websiteID: websiteID,
            },
            select: {
                id: true,
                websiteID: true,
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
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password."
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
}
export const retrieveUserInfo = async (req, res) => {
    try {
        const user = req.user;
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
}
export const findUserByID = async (req, res) => {
    try {
        const { userID } = req.body;
        if (!userID) {
            return res.status(400).json({
                success: false,
                message: "User ID is required."
            });
        }
        const user = await prisma.user.findUnique({
            where: { id: userID },
            select: {
                id: true,
                websiteID: true,
                name: true,
                email: true,
                role: true,
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                user,
            }
        });
    } catch (error) {
        console.error("Error finding user by ID:", error);
        res.status(500).json({
            success: false,
            message: "Error finding user by ID",
            error: error.message,
        });
    }
}