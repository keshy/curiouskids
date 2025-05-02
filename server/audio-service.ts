import { db } from './db';
import { audioFiles, InsertAudioFile } from '@shared/schema';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

// Directory for temporary audio storage if needed
const audioDir = path.join(process.cwd(), "public", "audio");
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

/**
 * Save audio content to the database
 * @param buffer The audio file buffer
 * @param mimeType The mime type (default: audio/mpeg)
 * @returns The URL path for accessing the audio file
 */
export async function saveAudioToDatabase(
  buffer: Buffer, 
  mimeType: string = 'audio/mpeg'
): Promise<string> {
  try {
    // Generate a unique filename for the audio
    const filename = `answer_${uuidv4()}.mp3`;
    
    // Convert buffer to base64 string for storage
    const base64Content = buffer.toString('base64');
    
    // Insert the audio file into the database
    const [audio] = await db.insert(audioFiles)
      .values({
        filename,
        content: base64Content,
        mimeType,
      })
      .returning();
    
    // Return the URL path that will be handled by our routes
    return `/api/audio/${filename}`;
  } catch (error) {
    console.error('Error saving audio to database:', error);
    throw error;
  }
}

/**
 * Retrieve audio content from the database
 * @param filename The audio filename
 * @returns The audio file data including content and mime type
 */
export async function getAudioFromDatabase(filename: string): Promise<{ content: Buffer, mimeType: string } | null> {
  try {
    // Query the database for the audio file
    const [audio] = await db.select()
      .from(audioFiles)
      .where(eq(audioFiles.filename, filename));
    
    if (!audio) {
      return null;
    }
    
    // Convert base64 string back to Buffer
    const buffer = Buffer.from(audio.content, 'base64');
    
    return {
      content: buffer,
      mimeType: audio.mimeType,
    };
  } catch (error) {
    console.error('Error retrieving audio from database:', error);
    return null;
  }
}

/**
 * Fallback method to save audio to the filesystem
 * This is used when the database method fails
 */
export function saveAudioToFilesystem(buffer: Buffer): string {
  const filename = `answer_${uuidv4()}.mp3`;
  const filepath = path.join(audioDir, filename);
  fs.writeFileSync(filepath, buffer);
  return `/audio/${filename}`;
}