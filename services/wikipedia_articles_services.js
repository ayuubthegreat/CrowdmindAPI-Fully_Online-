import { ar } from "zod/locales";
import prisma from "../lib/prisma.js";


export const fetchAllWikipediaArticles = async() => {
    try {
        const articles = await prisma.wikiPage.findMany({
            include: {
                infobox: {
                    include: {
                        fields: true
                    }
                },
                sections: {
                    orderBy: {
                        order: 'asc'
                    }
                },
                references: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });
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
            data: {
                articles: articles,
                user: req.user,
            }
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
        const { title, search_blurb, intro_paragraph, sections, infobox, references } = req.body;
        console.log(req.body);
        const { id } = req.user; // Get user ID from authenticated user
        
        if (!title || !intro_paragraph) {
            return res.status(400).json({
                success: false,
                message: "Title and intro paragraph are required to create a Wikipedia article."
            });
        }
        
        const newArticle = await prisma.wikiPage.create({
            data: {
                creatorID: id,
                title,
                search_blurb: search_blurb || title.substring(0, 50), // Default to truncated title
                intro_paragraph,
                // Create infobox if provided
                ...(infobox && {
                    infobox: {
                        create: {
                            title: infobox.title,
                            image: infobox.image,
                            fields: {
                                create: infobox.fields?.map(field => ({
                                    heading: field.heading,
                                    content: field.content
                                })) || []
                            }
                        }
                    }
                }),
                // Create sections if provided
                sections: {
                    create: sections?.map((section, index) => ({
                        heading: section.heading,
                        content: section.content,
                        order: index
                    })) || []
                },
                // Create references if provided
                references: {
                    create: references?.map((ref, index) => ({
                        title: ref.title,
                        url: ref.url,
                        order: index
                    })) || []
                }
            },
            include: {
                infobox: {
                    include: {
                        fields: true
                    }
                },
                sections: {
                    orderBy: {
                        order: 'asc'
                    }
                },
                references: {
                    orderBy: {
                        order: 'asc'
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
export const updateWikipediaArticle = async (req, res) => {
    try {
        const { articleID, title, search_blurb, intro_paragraph, sections, infobox, references } = req.body;
        const {id} = req.user;
        console.log(req.body);
        if (!articleID || !title || !intro_paragraph) {
            return res.status(400).json({
                success: false,
                message: "Article ID, title, and intro paragraph are required to update an article."
            });
        }
        
        // Delete existing related data before updating
        await prisma.wikiSection.deleteMany({
            where: { pageId: articleID }
        });
        await prisma.wikiReference.deleteMany({
            where: { pageId: articleID }
        });
        
        // Delete existing infobox and its fields (cascade will handle fields)
        await prisma.wikiInfobox.deleteMany({
            where: { pageId: articleID }
        });
        
        const updatedArticle = await prisma.wikiPage.update({
            where: { id: articleID },
            data: {
                title,
                search_blurb: search_blurb || title.substring(0, 50),
                intro_paragraph,
                creatorID: id,
                // Recreate infobox if provided
                ...(infobox && {
                    infobox: {
                        create: {
                            title: infobox.title,
                            image: infobox.image,
                            fields: {
                                create: infobox.fields?.map(field => ({
                                    heading: field.heading,
                                    content: field.content
                                })) || []
                            }
                        }
                    }
                }),
                // Recreate sections if provided
                sections: {
                    create: sections?.map((section, index) => ({
                        heading: section.heading,
                        content: section.content,
                        order: index
                    })) || []
                },
                // Recreate references if provided
                references: {
                    create: references?.map((ref, index) => ({
                        title: ref.title,
                        url: ref.url,
                        order: index
                    })) || []
                }
            },
            include: {
                infobox: {
                    include: {
                        fields: true
                    }
                },
                sections: {
                    orderBy: {
                        order: 'asc'
                    }
                },
                references: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });
        
        const allArticles = await fetchAllWikipediaArticles();
        
        res.status(200).json({
            success: true,
            message: "Wikipedia article updated successfully",
            data: {
                user: req.user,
                updatedArticle: updatedArticle,
                articles: allArticles
            }
        });

    } catch (error) {
        console.error("Error in updateWikipediaArticle:", error);
        res.status(500).json({
            success: false,
            message: "Error updating Wikipedia article",
            error: error.message,
        });
    }
}
export const deleteWikipediaArticle = async (req, res) => {
    try {
        const { articleID } = req.body;
        if (!articleID) {
            return res.status(400).json({
                success: false,
                message: "Article ID is required to delete an article."
            });
        }
        await prisma.wikiPage.delete({
            where: { id: articleID }
        });
        const allArticles = await fetchAllWikipediaArticles();
        res.status(200).json({
            success: true,
            message: "Wikipedia article deleted successfully.",
            data: {
                user: req.user,
                articles: allArticles,
            }
        });
    } catch (error) {
        console.error("Error in deleteWikipediaArticle:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting Wikipedia article",
            error: error.message,
        });
    }
}
