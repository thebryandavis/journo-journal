import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/webm',
  'audio/ogg',
  'audio/flac',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function validateAudioFile(
  file: File
): { valid: boolean; error?: string } {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported audio format: ${file.type}. Supported: mp3, wav, m4a, webm, ogg, flac`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum: 100MB`,
    };
  }

  return { valid: true };
}

export async function saveUploadedFile(
  file: File,
  userId: string
): Promise<{ filePath: string; relativePath: string }> {
  const userDir = path.join(UPLOAD_DIR, userId);
  await fs.mkdir(userDir, { recursive: true });

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const fileName = `${timestamp}_${safeName}`;
  const filePath = path.join(userDir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const relativePath = `${userId}/${fileName}`;
  return { filePath, relativePath };
}

export async function readUploadedFile(
  relativePath: string
): Promise<Buffer | null> {
  const filePath = path.join(UPLOAD_DIR, relativePath);
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

export function getContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.webm': 'audio/webm',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
  };
  return mimeMap[ext] || 'application/octet-stream';
}
