import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.js"
import community_cardRoutes from "./routes/community_cards.js"


const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use("/api/auth", authRoutes);
app.use("/api/post", community_cardRoutes);
app.listen(port, "0.0.0.0", () => {
    console.log(`Server is now running on the port ${port}`)
});
