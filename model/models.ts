import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

console.log("API Key:", process.env.NEXT_PUBLIC_OPENAI_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // ✅ Use the correct environment variable
  dangerouslyAllowBrowser: true
});

export async function getOpenaiResponseStream(userInput: string, onChunk: (chunk: string) => void) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: userInput }],
    stream: true, // Enable streaming
  });

  for await (const chunk of response) {
    const content = chunk.choices?.[0]?.delta?.content || "";
    if (content) onChunk(content); // Pass each chunk to the callback
  }
}

export async function getOpenaiResponse(userInput: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use the desired model here
      messages: [{ role: "user", content: userInput }],
      stream: false, // No streaming, full response
    });

    // Extract the full content from the response
    const messageContent = response.choices?.[0]?.message?.content || "";
    return messageContent;
  } catch (error) {
    console.error("Error getting full AI response:", error);
    throw new Error("Failed to get full AI response");
  }
}