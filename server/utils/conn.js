import { MongoClient } from "mongodb";
import dotenv from 'dotenv'
import mongoose from "mongoose";
dotenv.config();

const connectionString = process.env.MONGO_URI;
const connect = async () => {
  try {
    await mongoose.connect(connectionString)
    console.log("connected to:",connectionString)
  } catch(error){
    console.log("error while connecting,",error);
    process.exit(1)
  }

}
export default connect;