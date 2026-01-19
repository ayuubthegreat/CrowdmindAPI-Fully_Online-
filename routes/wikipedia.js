import express from "express"
import { createNewProject, fetchProjectData, updateProject } from "../services/wikipedia_services";




const router = express.Router();

router.post("/createProject", async (req, res) => {
    await createNewProject(req, res);
});

router.get("/getProjects", async (req, res) => {
    await fetchProjectData(req, res);
});

router.get("/updateProject", async (req, res) => {
    await updateProject(req, res);
});



export default router;