import express from "express"
import { createNewProject, createObjective, deleteProject, editObjective, fetchProjectData, updateProject } from "../services/wikipedia_projects_services.js";
import { authenticateToken } from "../middleware/auth_middleware.js";
import { retrieveUserInfo } from "../services/authServices.js";




const router = express.Router();

router.post("/createProject", authenticateToken, async (req, res) => {
    await createNewProject(req, res);
});

router.get("/getAllProjects", authenticateToken, async (req, res) => {
    await fetchProjectData(req, res);
});

router.post("/updateProject", authenticateToken, async (req, res) => {
    await updateProject(req, res);
});

router.get("/me", authenticateToken, async (req, res) => {
    await retrieveUserInfo(req, res);
});

router.post("/createObjective", authenticateToken, async (req, res) => {
    await createObjective(req, res);
});
router.post("/updateObjective", authenticateToken, async (req, res) => {
    await editObjective(req, res);
})
router.post("/deleteProject", authenticateToken, async (req, res) => {
    await deleteProject(req, res);
})


export default router;