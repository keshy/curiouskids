
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Buffer } from "buffer";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder" 
});

const audioDir = path.join(process.cwd(), "public", "audio");
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

export async function generateAnswer(question: string, contentFilter: string): Promise<string> {
  try {
    const systemPrompt = `You are a friendly assistant for 5-year-old children. 
    Provide clear, simple, and engaging answers that are appropriate for kindergarten-age children. 
    Use short sentences, basic vocabulary, and friendly language.
    Never use complex terminology without explaining it in very simple terms.
    Keep your answers educational, fun, and appropriate for young children.
    Never include scary, violent, or inappropriate content in your responses.
    Content filter level: ${contentFilter}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm not sure about that. Ask me something else!";
  } catch (error: any) {
    console.error("Error generating answer from OpenAI:", error);
    
    // Check if the error is due to API quota limits
    if (error.status === 429 || (error.error?.code === 'insufficient_quota')) {
      return "Our AI brain needs a little rest! The service is very busy right now. Please try again in a few minutes or ask a different question!";
    }
    
    return "I'm having trouble thinking right now. Let's try another question!";
  }
}

async function generateContextualQuestions(question: string, answer: string): Promise<string[]> {
  try {
    const prompt = `Based on this child's question: "${question}" and the answer: "${answer}", 
    suggest 3 follow-up questions that would help a 5-year-old learn more about this topic. 
    The questions should build upon their curiosity and understanding progressively. 
    Keep questions simple, engaging, and age-appropriate. Return only the questions, one per line.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are designing questions for 5-year-old children." },
        { role: "user", content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || '';
    const suggestions = content.split('\n')
      .filter(q => q.trim())
      .map(q => q.replace(/^\d+\.\s*/, ''))  // Remove leading numbers if present
      .slice(0, 3);
    return suggestions;
  } catch (error: any) {
    console.error("Error generating contextual questions:", error);
    
    // Default suggestions for all error cases
    const defaultSuggestions = [
      "What else would you like to know?",
      "Can you tell me more about what interests you?",
      "Would you like to learn about something else?"
    ];
    
    return defaultSuggestions;
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const imagePrompt = `A child-friendly, colorful illustration of ${prompt}. Make it educational, bright, and suitable for 5-year-olds. No text.`;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data[0].url || "";
  } catch (error: any) {
    console.error("Error generating image from OpenAI:", error);
    
    // Different fallback images based on error type
    if (error.status === 429 || (error.error?.code === 'insufficient_quota')) {
      // For rate limit errors, use a specific fallback image that indicates the service is busy
      return "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=600&auto=format&fit=crop&q=80";
    }
    
    // For all other errors, use a generic educational image
    return "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80";
  }
}

export async function generateAudio(text: string): Promise<string> {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1-hd", // Use the higher quality model
      voice: "shimmer", // Use the 'shimmer' voice which has an Indian English accent
      input: text,
    });

    // Get the audio content as a buffer
    const buffer = Buffer.from(await response.arrayBuffer());
    
    try {
      // First try to save to database for persistence
      const { saveAudioToDatabase } = await import('./audio-service');
      return await saveAudioToDatabase(buffer, 'audio/mpeg');
    } catch (dbError) {
      console.error("Error saving audio to database, falling back to filesystem:", dbError);
      
      // Fall back to file system if database storage fails
      const { saveAudioToFilesystem } = await import('./audio-service');
      return saveAudioToFilesystem(buffer);
    }
    
  } catch (error: any) {
    console.error("Error generating audio from OpenAI:", error);
    
    // Special handling for rate limit errors
    if (error.status === 429 || (error.error?.code === 'insufficient_quota')) {
      console.warn("Rate limit reached for audio generation. Falling back to browser TTS.");
    }
    
    // Return empty string to allow fallback to browser's TTS
    return "";
  }
}

export async function processQuestion(
  question: string, 
  contentFilter: string = "strict",
  generateImg: boolean = true,
  generateAud: boolean = true
): Promise<{ text: string; imageUrl: string; audioUrl?: string; suggestedQuestions?: string[] }> {
  try {
    // Generate the answer text first
    const answer = await generateAnswer(question, contentFilter);
    
    // Generate image if requested
    let imageUrl = "";
    if (generateImg) {
      const imagePrompt = `${question} - ${answer.substring(0, 100)}`;
      imageUrl = await generateImage(imagePrompt);
    }

    // Generate audio if requested
    let audioUrl = "";
    if (generateAud) {
      audioUrl = await generateAudio(answer);
    }
    
    // Generate follow-up questions
    const suggestedQuestions = await generateContextualQuestions(question, answer);
    
    return {
      text: answer,
      imageUrl: imageUrl,
      audioUrl: audioUrl,
      suggestedQuestions: suggestedQuestions
    };
  } catch (error: any) {
    console.error("Error processing question:", error);
    
    // Customized error response based on the error type
    let errorMessage = "I'm sorry, I couldn't understand that question. Can you ask me something else?";
    
    // If it's a rate limit or quota exceeded error
    if (error.status === 429 || (error.error?.code === 'insufficient_quota')) {
      errorMessage = "Our AI brain is a bit tired right now! The service is very busy. Please try again in a few minutes or ask a different question!";
    }
    
    return {
      text: errorMessage,
      imageUrl: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=600&auto=format&fit=crop&q=80",
      audioUrl: "",
      suggestedQuestions: [
        "What else would you like to know?",
        "Can you tell me more about what interests you?",
        "Would you like to learn about something else?"
      ]
    };
  }
}
