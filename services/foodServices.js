import prisma from "../lib/prisma";




export const food_form_machine = async (req, res) => {
    const {name, email, phone_number, address} = req.body;
    console.log("Food Form Data Received:", {name, email, phone_number, address});
    // Here you can add logic to process the form data, e.g., save to database
    const new_food_form_entry = await prisma.foodForm.create({
        data: {
            name,
            email,
            phone_number,
            address
        },
        select: {
            id : true,
            name: true,
            email: true,
            phone_number: true,
            address: true
        }
    })
    res.status(200).json({ message: "Food form submitted successfully!", data: new_food_form_entry });
}