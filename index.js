import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./Database/config.js";
import UserRouter from "./Routers/userRouter.js";
import SurveyRouter from "./Routers/surveyRouter.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
connectDb();

app.get("/", (req, res) => {
  res.send("Api Running...");
});

//api routes

app.use("/api/users", UserRouter);
app.use("/api/survey", SurveyRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
