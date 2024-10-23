import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongo_uri = process.env.MONGO_URI;

const connectDb = async (req, res) => {
  try {
    const connection = await mongoose.connect(mongo_uri);
    console.log("Mongo db is connected");
    return connection;
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};

export default connectDb;
