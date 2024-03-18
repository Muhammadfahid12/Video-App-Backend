import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () =>{


    try {

       const connectinInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`MongoDB connected !! DB HOST: ${connectinInstance.connection.host} `)
    } catch (error) {
        console.error("MONGFB Connection Error", error)
        process.exit(1) // will stop running process with status code 1 
    }
}

export default connectDB;