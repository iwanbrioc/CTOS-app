import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function transcribeAudio(audioBuffer: Buffer, originalFilename: string): Promise<string> {
  let tempFilePath: string | null = null;
  
  try {
    // Create temporary file
    const fileExtension = path.extname(originalFilename) || '.webm';
    tempFilePath = path.join(tmpdir(), `audio_${Date.now()}${fileExtension}`);
    
    // Write buffer to temporary file
    await fs.promises.writeFile(tempFilePath, audioBuffer);

    if (!openai) throw new Error("OpenAI API key not configured");
    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "en",
      response_format: "text",
    });

    return transcription;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio");
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await fs.promises.unlink(tempFilePath);
      } catch (cleanupError) {
        console.error("Failed to clean up temp file:", cleanupError);
      }
    }
  }
}