import prisma from "../lib/prisma.js";



export const changeStatus = async (req, res) => {
    const {idPost, status} = req.body;
    console.log(idPost, status);
    if (!idPost || !status) {
        return res.status(400).json({
            success: false,
            message: "You need ID and the status to continue;"
        })
    }
    const card = await prisma.community_card.update({
        where: {id: idPost},
        data: {
            id: idPost,
            status,
        }
    })
    console.log(card);
    res.status(200).json({
        success: true,
        message: "Status updated successfully!"
    })
}
export const changePriority = async (req, res) => {
    const {idPost, priority} = req.body;
    console.log(idPost, priority);
    if (!idPost || !priority) {
        return res.status(400).json({
            success: false,
            message: "You need ID and the priority to continue;"
        })
    }
    const card = await prisma.community_card.update({
        where: {id: idPost},
        data: {
            id: idPost,
            priority,
        }
    })
    console.log(card);
    res.status(200).json({
        success: true,
        message: "Status updated successfully!"
    })
}
export const community_cardImportFunc = async (req, res) => {
    try {
        const {title, description, content, priority, stringedTags} = req.body;

        const {id} = req.user;
        if (!title || !content) {
            res.status(400).json({
                success: false,
                message: "Title and content is required."
            })
        }
        const newPost = await prisma.community_card.create({
            data: {
                title,
                description: description || " ",
                content,
                userID: id,
                priority: Number(priority),
                status: "under_review",
                tags: stringedTags,
                
            },
            select: {
                id: true,
                title: true,
                description: true,
                content: true,
                userID: true,
                createdAt: true,
                updatedAt: true,
                tags: true,
            }
        })
        console.log(newPost);
        res.status(200).json({
            success: true,
            message: "New post has been created! It is currently under review.",
            data: newPost,
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
export const community_cardGetAllOfUser = async (req, res) => {
    try {
        const {id} = req.user;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "No token provided. Please try again with a valid token."
            })
        }
        const allCards = await prisma.community_card.findMany({
            where: {userID: id}
        });
        

        res.status(200).json({
            success: true,
            message: "All cards provided! Here they are.",
            data: dataCards,
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: `Error when finding the cards: ${error}`
        })
    }
}
export const community_cardGetAll = async (req, res) => {
    try {
        const {id} = req.user;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "No token provided. Please try again with a valid token."
            })
        }
        const allCards = await prisma.community_card.findMany({});
        const allTags = new Set([]);
        for (let i = 0; i < allCards.length; i++) {
            const user = await prisma.user.findUnique({
            where: {
                id: allCards[i].userID,
            },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                role: true,
            }
        })
        allCards[i].user = user;
        allCards[i].isUserPost = allCards[i].userID === id;
        const arrayedTags = allCards[i].tags.split(",");
        console.log(arrayedTags);
        for (let j = 0; j < arrayedTags.length; j++) {
            allTags.add(arrayedTags[j].trim());
        }
        console.log(allTags);
        console.log(allCards[i]);
        console.log(user, allCards[i]);
        }

        res.status(200).json({
            success: true,
            message: "All cards provided! Here they are.",
            data: {
                cards: allCards,
                tags: Array.from(allTags),
            }
        })
        
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: `Error when finding the cards: ${error}`
        })
    }
}

export const editCard = async (req, res) => {
    try {
    const {id} = req.user; 
    const {title, description, content, priority, status, idPost, stringedTags} = req.body;
    const card = await prisma.community_card.update({
        where: {id: idPost},
        data: {
            id: idPost,
            title,
            description,
            content,
            priority,
            status,
            tags: stringedTags,
        }
    })
    console.log(card, priority, status, idPost, stringedTags);
    const allCards = await prisma.community_card.findMany({
    })
    console.log(allCards)
    for (let i = 0; i < allCards.length; i++) {
            const user = await prisma.user.findUnique({
            where: {
                id: allCards[i].userID,
            },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                role: true,
            }
        })
        allCards[i].user = user;
        allCards[i].isUserPost = allCards[i].userID === id;
        console.log(user, allCards[i]);
        }
    res.status(200).json({
        success: true,
        message: `Post with ID ${idPost} has been successfully edited!`,
        data: allCards,
    })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:`Editing this post failed: ${error}`,
        })
    }
    
}
export const deleteCard = async (req, res) => {
    try {
    const {id} = req.body;
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "No ID provided."
        })
    }
    console.log(id);
    const deletedCard = await prisma.community_card.delete({
        where: {id: id}
    })
    res.status(200).json({
        success: true,
        message: "Card deleted successfully!",
        data: deletedCard,
    })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error,
        })
    }
    
    
}
export const deleteAllCards = async (req, res) => {
    await prisma.community_card.deleteMany({});
    return res.status(200).json({
        success: true,
        message: "All cards deleted successfully!",
    })

}