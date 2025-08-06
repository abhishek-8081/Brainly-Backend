import dotenv from "dotenv";
dotenv.config();

console.log("🚀 Starting Brainly Backend Server...");
console.log("📦 Environment:", process.env.NODE_ENV || "development");
console.log("🔧 Port:", process.env.PORT || 8000);

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET not set, using default (not recommended for production)");
}

import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import "./db"; // Import to establish database connection
import { ContentModel, LinkModel, UserModel } from "./db";
import { userMiddleware, AuthenticatedRequest } from "./middleware";
import { randomString } from "./utils";
import cors from "cors";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret123" ;
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || "development";

const app = express();

// ✅ Only allow your deployed frontend
const allowedOrigins = [
  process.env.FRONTEND_URL_1,
  process.env.FRONTEND_URL_2,
  'https://brainly-frontend.netlify.app',
  'http://localhost:5173', // For local development
  'http://127.0.0.1:5173'  // For local development
].filter(Boolean) as string[]; // Remove undefined values and assert as string array

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true, // Allow all if no origins specified
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
//pk
// ✅ Health check endpoint
app.get("/api/v1/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// ✅ User Signup
app.post("/api/v1/signup", async (req: Request, res: Response) => {
  console.log("Signup body:", req.body);
  const { username, password } = req.body;
  try {
    await UserModel.create({ username, password });
    res.json({ msg: "User Signed Up Sucessfully" });
  } catch (error) {
    res.status(411).json({ msg: "user already exists" });
  }
});

// ✅ User Signin
app.post("/api/v1/signin", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const existingUser = await UserModel.findOne({ username, password });

    if (existingUser) {
      const token = jwt.sign({ id: existingUser._id }, JWT_SECRET);
      res.json({ token });
    } else {
      res.status(403).json({ msg: "Invalid credentials" });
    }
  } catch (error) {
    res.status(403).json({ msg: "signin failed" });
  }
});

// ✅ Create Content
app.post("/api/v1/content", userMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, link } = req.body;
    const newContent = await ContentModel.create({
      title: req.body.title,
      link,
      type,
   
      userId: req.userId,
      tags: []
    });
    res.json({ msg: "Content Created Successfully", content: newContent });
  } catch (error) {
    res.status(500).json({ msg: "Content Creation failed" });
  }
});

// ✅ Get Content
app.get("/api/v1/content", userMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
  
    const userId = req.userId;
    const content = await ContentModel.find({ userId }).populate("userId", "username");
    res.json({ content });
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch content" });
  }
});

// ✅ Delete Content
app.delete("/api/v1/content", userMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const contentId = req.body.contentId;
  await ContentModel.deleteMany({
    _id: contentId,
    
    userId: req.userId
  });
  res.json({ msg: "content deleted successfully" });
});

// ✅ Brain Share
app.post("/api/v1/brain/share", userMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const share = req.body.share;
  if (share) {
    const existLink = await LinkModel.findOne({
 
      userId: req.userId
    });

    if (existLink) {
      return res.json({ hash: existLink.hash });
    }

    const hash = randomString(10);
    await LinkModel.create({

      userId: req.userId,
      hash
    });

    return res.json({ hash });
  } else {
    await LinkModel.deleteOne({
   
      userId: req.userId
    });
    res.json({ msg: "Removed link" });
  }
});

// ✅ Access Shared Brain Link
app.get("/api/v1/brain/:shareLink", async (req: Request, res: Response) => {
  const hash = req.params.shareLink;
  const link = await LinkModel.findOne({ hash });
  if (!link) {
    return res.status(411).json({ msg: "Link not found" });
  }

  const content = await ContentModel.find({ userId: link.userId });
  const user = await UserModel.findOne({ _id: link.userId });

  if (!user) {
    return res.status(411).json({ msg: "user not found" });
  }

  res.json({
    username: user?.username,
    content
  });
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// ✅ Start Server
const server = app.listen(PORT, () => {
  console.log(`✅ Server started successfully on port ${PORT}`);
  console.log(`📱 Environment: ${NODE_ENV}`);
  console.log(`🌐 CORS Origins:`, allowedOrigins.length > 0 ? allowedOrigins : 'All origins allowed');
  console.log(`🏥 Health check: http://localhost:${PORT}/api/v1/health`);
}).on('error', (err: any) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});
