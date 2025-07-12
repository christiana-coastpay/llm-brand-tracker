import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic middleware for logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "API is working", 
    timestamp: new Date().toISOString() 
  });
});

// Brand analysis endpoint - the working version!
app.post("/api/analyze-brand", async (req, res) => {
  console.log("=== ANALYZE BRAND ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  
  try {
    const { url } = req.body;
    
    console.log("URL from request:", url);
    
    if (!url) {
      console.log("No URL provided, returning error");
      return res.status(400).json({ error: "URL is required" });
    }

    console.log(`[${new Date().toISOString()}] Analyzing brand URL: ${url}`);
    console.log("About to attempt import...");

    // Test the import
    const openaiService = await import("./services/openai");
    console.log("Import successful!");
    console.log("Available functions:", Object.keys(openaiService));

    // Return success for now
    res.json({ 
      success: true, 
      message: "Made it past import!",
      url: url,
      availableFunctions: Object.keys(openaiService)
    });

  } catch (error) {
    console.error("=== ERROR IN ANALYZE BRAND ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    res.status(500).json({ 
      error: "Failed to analyze brand",
      details: error.message,
      type: error.constructor.name
    });
  }
});

// Mock endpoints to prevent 404s
app.get("/api/metrics", (req, res) => {
  res.json({ totalPrompts: 0, totalResponses: 0, brandMentions: 0 });
});

app.get("/api/topics", (req, res) => {
  res.json([]);
});

app.get("/api/responses", (req, res) => {
  res.json([]);
});

app.get("/api/analysis/progress", (req, res) => {
  res.json({ status: "idle", progress: 0 });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;