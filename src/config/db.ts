import { config } from "dotenv";
import { connect } from "mongoose";

export const connectToMongoDB = async () => {
    config()

    const mongoUrl = process.env.MONGODB_URL;

    if (!mongoUrl) {
      throw new Error("MONGODB_URL environment variable is not defined");
    }
    
    try {
        await connect(mongoUrl);
        console.log("Connected to MongoDB");
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Encerra o processo caso haja erro
      }
}
