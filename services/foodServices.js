import prisma from "../lib/prisma.js";
import fs from "fs";




export const food_form_machine = async (req, res) => {
    const {name, email, phone, address, city, state, zip_code, token} = req.body;
    console.log("Food Form Data Received:", {name, email, phone, address, city, state, zip_code, token});
    const currentDate = new Date().toLocaleString().split(',');
    const new_entry = {name, email, phone, address, city, state, zip_code, token, submittedAt: currentDate};
    let current_entries = [];
    if (await check_for_identical_food_entry(new_entry)) {
        return res.status(400).json({ message: "Identical food form entry already exists." });
    }
    try {
        const data = await fs.promises.readFile('data/food_form_entries.json', 'utf-8');
        current_entries = JSON.parse(data);
    } catch (error) {
        // File doesn't exist yet, use empty array
        current_entries = [];
    }
    current_entries.push(new_entry);
    console.log("Updated Food Form Entries:", current_entries);
    await fs.promises.writeFile('data/food_form_entries.json', JSON.stringify(current_entries, null, 2));
    const db_entry = await prisma.foodFormEntry.create({
        data: {
            name,
            userID: token,
            email,
            phone,
            address,
            city,
            state,
            zip_code,
            submittedAt: new Date()
        }
    });
    res.status(200).json({ message: "Food form submitted successfully!", data: new_entry });
}
export const get_food_form_entries = async (req, res) => {
    const {token} = req.body;
    try {
        const data = await fs.promises.readFile('data/food_form_entries.json', 'utf-8');
        const entries = Array.from(JSON.parse(data)).filter(entry => entry.token === token);
        res.status(200).json({ 
            message: "Food form entries retrieved successfully!", 
            data: entries 
        });
    } catch (error) {
        res.status(500).json({ message: "Error reading food form entries.", error: error.message });
    }
}
export const check_for_identical_food_entry = async (new_entry) => {
    try {
        let identical_entry = false;
        const data = await fs.promises.readFile('data/food_form_entries.json', 'utf-8');
        const entries = Array.from(JSON.parse(data));
        entries.forEach(entry => {
            if (entry.name === new_entry.name && entry.email === new_entry.email) {
                identical_entry = true;
            }
        })
        return identical_entry;
    } catch (error) {
        return false;
    }
}
        