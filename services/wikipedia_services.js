import prisma from "../lib/prisma"
// Projects made by GitSpedia

export const fetchProjectData = async (req, res) => {
    try {
        const allProjects = await prisma.project.findMany({});
        res.status(200).json({
            success: true,
            data: allProjects
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

export default createNewProject = async (req, res) => {
    try {
        const {id} = req.user;
        const {title, description, objectives} = req.body;
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required."
            })
        }
        const newProject = await prisma.project.create({
            data: {
                userID: id,
                title,
                description,
            },
            select: {
                id: true,
                userID: true,
                title: true,
                description: true,
                
            }
        })
        for (const i = 0; i < objectives.length; i++) {
            await prisma.project_objective.create({
                data: {
                    projectID: newProject.id,
                    title: objectives[i].title,
                    description: objectives[i].description,
                    completed: false,
                }
            })
        }
        
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({
            success: false,
            message: "Error creating project",
            error: error.message
        });
    }
}