
import mongoose, { model, Schema, Types } from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI environment variable is required!");
    console.error("Please set your MongoDB connection string in Railway environment variables.");
    process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;

console.log("🔄 Connecting to MongoDB...");
mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
}).then(() => {
    console.log("✅ Connected to MongoDB successfully");
}).catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("Full error:", error);
    process.exit(1);
});

const UserSchema=new Schema({
    username:{type:String,unique:true},
    password:String,
})

const ContentSchema=new Schema({
    title:String,
    link:String,
    tags:[{type:mongoose.Types.ObjectId,ref:'Tag'}],
    type:String,
    userId:{type:mongoose.Types.ObjectId,ref:'User',required:true},
    // authorId:{type:mongoose.Types.ObjectId,ref:'User',required:true}
})

const LinkSchema=new Schema({
    hash:String,
    userId:{type:mongoose.Types.ObjectId,ref:'User',required:true,unique:true}
})

export const LinkModel=model("Link",LinkSchema);

export const UserModel=model("User",UserSchema);

export const ContentModel=model("Content",ContentSchema);

