import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import mistralRoutes from './routes/mistral';

export async function registerRoutes(app: Express): Promise<Server> {
  // Register Mistral API routes
  app.use('/api/mistral', mistralRoutes);

  const httpServer = createServer(app);

  return httpServer;
}