
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
  } catch (error) {
    console.error("Error generating answer from OpenAI:", error);
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

    const suggestions = response.choices[0].message.content?.split('\n')
      .filter(q => q.trim())
      .map(q => q.replace(/^\d+\.\s*/, ''))  // Remove leading numbers if present
      .slice(0, 3);
    return suggestions;
  } catch (error) {
    console.error("Error generating contextual questions:", error);
    return [
      "What else would you like to know?",
      "Can you tell me more about what interests you?",
      "Would you like to learn about something else?"
    ];
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
  } catch (error) {
    console.error("Error generating image from OpenAI:", error);
    return "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=600&auto=format&fit=crop&q=80";
  }
}

export async function generateAudio(text: string): Promise<string> {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1-hd", // Use the higher quality model
      voice: "shimmer", // Use the 'shimmer' voice which has an Indian English accent
      input: text,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = `answer_${uuidv4()}.mp3`;
    const filepath = path.join(audioDir, filename);
    fs.writeFileSync(filepath, buffer);
    return `/audio/${filename}`;
  } catch (error) {
    console.error("Error generating audio from OpenAI:", error);
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
    const answer = await generateAnswer(question, contentFilter);
    
    let imageUrl = "";
    if (generateImg) {
      const imagePrompt = `${question} - ${answer.substring(0, 100)}`;
      imageUrl = await generateImage(imagePrompt);
    }

    let audioUrl = "";
    if (generateAud) {
      audioUrl = await generateAudio(answer);
    }
    
    const suggestedQuestions = await generateContextualQuestions(question, answer);
    
    return {
      text: answer,
      imageUrl: imageUrl,
      audioUrl: audioUrl,
      suggestedQuestions: suggestedQuestions
    };
  } catch (error) {
    console.error("Error processing question:", error);
    return {
      text: "I'm sorry, I couldn't understand that question. Can you ask me something else?",
      imageUrl: "",
      audioUrl: "",
      suggestedQuestions: []
    };
  }
}
