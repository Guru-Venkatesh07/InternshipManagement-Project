import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import prisma from '../config/db.js';
import { AppError } from './errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist safely without throwing on read-only serverless filesystems
const resumesDir = path.resolve(__dirname, '../../uploads/resumes');
const logosDir = path.resolve(__dirname, '../../uploads/logos');

try {
  if (!fs.existsSync(resumesDir)) {
    fs.mkdirSync(resumesDir, { recursive: true });
  }
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }
} catch {
  // Read-only filesystem in serverless environments (e.g. Vercel)
}

/**
 * Custom dual-storage engine:
 * 1. Writes to local disk (when running locally)
 * 2. Writes to /tmp (when running on serverless)
 * 3. Saves base64 to PostgreSQL StoredFile table for permanent serverless file persistence
 */
class DualStorage {
  constructor(folderPrefix, subFolder) {
    this.folderPrefix = folderPrefix;
    this.subFolder = subFolder;
  }

  _handleFile(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueId = crypto.randomUUID();
    const filename = `${this.folderPrefix}-${uniqueId}${ext}`;

    const chunks = [];
    file.stream.on('data', (chunk) => chunks.push(chunk));
    file.stream.on('error', (err) => cb(err));
    file.stream.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);

        // 1. Local disk persistence
        try {
          const localDir = path.resolve(__dirname, `../../uploads/${this.subFolder}`);
          if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir, { recursive: true });
          }
          fs.writeFileSync(path.join(localDir, filename), buffer);
        } catch {
          // Ignore read-only errors on serverless
        }

        // 2. Serverless /tmp cache
        try {
          const tmpDir = path.resolve('/tmp', this.subFolder);
          if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
          }
          fs.writeFileSync(path.join(tmpDir, filename), buffer);
        } catch {
          // Ignore if /tmp not accessible
        }

        // 3. Supabase / PostgreSQL StoredFile persistence
        try {
          await prisma.storedFile.upsert({
            where: { filename },
            update: {
              mimetype: file.mimetype,
              data: buffer.toString('base64'),
            },
            create: {
              filename,
              mimetype: file.mimetype,
              data: buffer.toString('base64'),
            },
          });
        } catch (dbErr) {
          console.warn('Database file storage notice:', dbErr.message);
        }

        cb(null, {
          filename,
          size: buffer.length,
          mimetype: file.mimetype,
        });
      } catch (err) {
        cb(err);
      }
    });
  }

  _removeFile(req, file, cb) {
    cb(null);
  }
}

const resumeFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx'];
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only PDF and DOCX files are allowed for resumes.', 400), false);
  }
};

export const uploadResume = multer({
  storage: new DualStorage('resume', 'resumes'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: resumeFileFilter,
});

const logoFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
  const allowedMimes = ['image/png', 'image/jpeg', 'image/webp'];

  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only PNG, JPG, JPEG, and WEBP image files are allowed for logos.', 400), false);
  }
};

export const uploadLogo = multer({
  storage: new DualStorage('logo', 'logos'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: logoFileFilter,
});
