import prisma from "../lib/prisma.js";


export const fetchAllWikipediaArticles = async() => {
    try {
        const articles = await prisma.wikiPage.findMany({});
        return articles;
    } catch (error) {
        console.error("Error fetching Wikipedia articles:", error);
        throw error;
    }
} 
export const getWikipediaArticles = async (req, res) => {
    try {
        const articles = await fetchAllWikipediaArticles();
        return res.status(200).json({
            success: true,
            data: articles,
        });
    } catch (error) {
        console.error("Error in getWikipediaArticles:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching Wikipedia articles",
            error: error.message,
        });
    }
}
export const createWikipediaArticle = async (req, res) => {
    try {
        const { title, content, infobox } = req.body;
        const { id } = req.user; // Get user ID from authenticated user
        
        if (!title || !content || !infobox) {
            return res.status(400).json({
                success: false,
                message: "Title, content, and infobox are required to create a Wikipedia article."
            });
        }
        
        const newArticle = await prisma.wikiPage.create({
            data: {
                creatorID: id, // Add the required creatorID field
                title,
                content,
                infobox: {
                    create: {
                        title: infobox.title,
                        fields: {
                            create: infobox.fields.map(field => ({
                                label: field.label,
                                value: field.value
                            }))
                        }
                    }
                }
            },
            include: {
                infobox: {
                    include: {
                        fields: true
                    }
                }
            }
        });
        
        const allArticles = await fetchAllWikipediaArticles();
        
        res.status(201).json({
            success: true,
            message: "Wikipedia article created successfully",
            data: {
                user: req.user,
                newArticle: newArticle,
                articles: allArticles
            }
        });
    } catch (error) {
        console.error("Error in createWikipediaArticle:", error);
        res.status(500).json({
            success: false,
            message: "Error creating Wikipedia article",
            error: error.message,
        });
    }
}
