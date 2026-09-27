import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import prisma from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import internshipRoutes from './routes/internshipRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import placementRoutes from './routes/placementRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import { errorHandler, AppError } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security HTTP headers with cross-origin resource policy enabled for uploads
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded files (resumes, logos) from local disk, /tmp, or Supabase DB fallback
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.get('/uploads/:folder/:filename', async (req, res) => {
  const { folder, filename } = req.params;

  // 1. Try local disk
  const localPath = path.resolve(__dirname, `../uploads/${folder}/${filename}`);
  if (fs.existsSync(localPath)) {
    return res.sendFile(localPath);
  }

  // 2. Try serverless /tmp
  const tmpPath = path.resolve('/tmp', folder, filename);
  if (fs.existsSync(tmpPath)) {
    return res.sendFile(tmpPath);
  }

  // 3. Fallback to Supabase database StoredFile (for Vercel serverless)
  try {
    const stored = await prisma.storedFile.findUnique({
      where: { filename },
    });
    if (stored) {
      const buffer = Buffer.from(stored.data, 'base64');
      res.setHeader('Content-Type', stored.mimetype || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.send(buffer);
    }
  } catch (err) {
    console.error('Error fetching file from database:', err.message);
  }

  return res.status(404).json({ success: false, message: 'File not found' });
});

// API Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Internship Management System API',
    version: '1.0.0',
  });
});

// Mount Domain API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/internships', internshipRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/placements', placementRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/employer', employerRoutes);
app.use('/api/v1/faculty', facultyRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Catch-all route for undefined API endpoints
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server.`, 404));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
