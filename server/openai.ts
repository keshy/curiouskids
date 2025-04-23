import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder" 
});

// Generate child-friendly answers to questions
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

// Generate an image related to the question and answer
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
    // Return a default image URL for fallback
    return "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=600&auto=format&fit=crop&q=80";
  }
}

// Process the complete answer request
export async function processQuestion(
  question: string, 
  contentFilter: string = "strict",
  generateImg: boolean = true
): Promise<{ text: string; imageUrl: string }> {
  try {
    // Generate text answer
    const answer = await generateAnswer(question, contentFilter);
    
    // Generate image if enabled
    let imageUrl = "";
    if (generateImg) {
      // Use both question and answer to create a better image prompt
      const imagePrompt = `${question} - ${answer.substring(0, 100)}`;
      imageUrl = await generateImage(imagePrompt);
    }
    
    return {
      text: answer,
      imageUrl: imageUrl
    };
  } catch (error) {
    console.error("Error processing question:", error);
    return {
      text: "I'm sorry, I couldn't understand that question. Can you ask me something else?",
      imageUrl: ""
    };
  }
}
