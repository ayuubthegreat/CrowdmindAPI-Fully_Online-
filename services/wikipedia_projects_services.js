import { success } from "zod";
import prisma from "../lib/prisma.js"
// Projects made by GitSpedia
export const findObjectivesByProjectID = async (projectID) => {
    try {
        const objectives = await prisma.objective.findMany({
            where: {projectID: projectID}
        })
        return objectives;
    } catch (error) {
        console.error("Error finding objectives by project ID:", error);
        throw error;
    }
}
export const attachObjectivesToProjects = async (originalProjects = []) => {
    try {
        for (let i = 0; i < originalProjects.length; i++) {
            const objectives = await findObjectivesByProjectID(originalProjects[i].id);
            originalProjects[i].objectives = objectives;
        }
        return originalProjects;
     } catch (error) {
        console.error(error);
     }
}
export const fetchProjectData = async (req, res) => {
    try {
        const allProjects = await prisma.project.findMany({});
        for (let i = 0; i < allProjects.length; i++) {
            const objectives = await findObjectivesByProjectID(allProjects[i].id);
            allProjects[i].objectives = objectives;
            console.log("Objectives for project", allProjects[i].id, ":", objectives);
        }
        console.log("Fetched projects:", allProjects);
        return res.status(200).json({
            success: true,
            data: {
                user: req.user,
                projects: allProjects,
            }
        })
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching projects",
            error: error.message
        });
    }
}

export const createNewProject = async (req, res) => {
    try {
        const {id} = req.user;
        const {title, description, tags, objectives, release_date, content, websiteID} = req.body;
        console.log(title, description, tags, objectives, release_date, content, websiteID);
        if (!title || !description || !objectives || !release_date) {
            return res.status(400).json({
                success: false,
                message: "Title, description, objectives, and release_date are required."
            })
        }
        const newProject = await prisma.project.create({
            data: {
                userID: id,
                websiteID: websiteID,
                title,
                description,
                tags, 
                content,
                release_date,
                objectives: {
                    create: objectives.map(obj => ({
                        userID: id,
                        title: obj.title,
                        description: obj.description,
                        step: obj.step,
                        completed: false
                    }))
                }
            },
            select: {
                id: true,
                userID: true,
                title: true,
                description: true,
                tags: true,
                content: true,
                release_date: true,
                objectives: true
            }
        })
        res.status(201).json({
            success: true,
            message: "A new project has been created!",
            data: {
                user: req.user,
                createdProject: newProject,
                projects: await prisma.project.findMany({})
            }
        })
        
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({
            success: false,
            message: "Error creating project",
            error: error.message
        });
    }
}
export const updateProject = async (req, res) => {
    try {
        const {projectID, title, description, tags, release_date, content} = req.body;
        if (!projectID || !title || !description || !release_date) {
            return res.status(400).json({
                success: false,
                message: "Project ID, title, description, tags, content, and release_date are required."
            })
        }
        const updatedProject = await prisma.project.update({
            where: {id: projectID},
            data: {
                title,
                description,
                tags,
                content,
                release_date,
            },
            select: {
                id: true,
                userID: true,
                title: true,
                description: true,
                tags: true,
                content: true,
                release_date: true,
                objectives: true,
            }
        })
        const allProjects = await prisma.project.findMany({});
        res.status(200).json({
            success: true,
            message: "Project updated successfully.",
            data: {
                user: req.user,
                updatedProject: updatedProject,
                projects: attachObjectivesToProjects(allProjects),
            }
        })
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({
            success: false,
            message: "Error updating project",
            error: error.message
        });
    }
}
export const deleteProject = async (req, res) => {
    try {
        const {projectID, websiteID} = req.body;
        if (!projectID) {
            return res.status(400).json({
                success: false,
                message: "Project ID is required."
            })
        }
        // Delete all objectives associated with the project first
        await prisma.objective.deleteMany({
            where: {projectID: projectID}
        });
        
        // Then delete the project
        await prisma.project.delete({
            where: {id: projectID, websiteID: websiteID}
        });
        const allProjects = await prisma.project.findMany({});
        res.status(200).json({
            success: true,
            message: "Project deleted successfully.",
            data: {
                user: req.user,
                projects: allProjects,
            }
        })
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting project",
            error: error.message
        })
    }
}
export const createObjective = async (req, res) => {
    try {
        const {projectID, title, description} = req.body;
        const {id} = req.user;
        if (!projectID || !title || !description) {
            return res.status(400).json({
                success: false,
                message: "Project ID, title, and description are required."
            })
        }
        const newObjective = await prisma.objective.create({
            data: {
                projectID: projectID,
                userID: id,
                title,
                description,
                completed: false,
            }
        })
        const allObjectives = await findObjectivesByProjectID(projectID);
        const allProjects = await fetchProjectData(req, res);
        res.status(201).json({
            success: true,
            message: "New objective created successfully.",
            data: {
                user: req.user,
                newObjective: newObjective,
                objectives: allObjectives,
                projects: allProjects.data.projects,
            }
        })
    } catch (error) {
        console.error("Error creating objective:", error);
        res.status(500).json({
            success: false,
            message: "Error creating objective",
            error: error.message
        })
    }
}
export const editObjective = async (req, res) => {
    try {
        const {objectiveID, title, description, completed, projectID} = req.body;
        if (!objectiveID || !title || !description || completed === undefined) {
            return res.status(400).json({
                success: false,
                message: "Objective ID, title, description, and completed status are required."
            })
        }
        const updatedObjective = await prisma.objective.update({
            where: {id: objectiveID, projectID: projectID},
            data: {
                title,
                description,
                completed,
            },
            select: {
                id: true,
                projectID: true,
                title: true,
                description: true,
                completed: true,
            }
        })
        const allObjectives = await findObjectivesByProjectID(updatedObjective.projectID);
        res.status(200).json({
            success: true,
            message: "Objective updated successfully.",
            data: {
                user: req.user,
                updatedObjective: updatedObjective,
                objectives: allObjectives,
            }
        })
    } catch (error) {
        console.error("Error updating objective: ", error);
        res.status(500).json({
            success: false,
            message: "Error updating objective",
            error: error.message
        })
    }
}
