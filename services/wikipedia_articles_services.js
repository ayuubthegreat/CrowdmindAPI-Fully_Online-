import { ar } from "zod/locales";
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
                                create: infobox.data?.map(field => ({
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
