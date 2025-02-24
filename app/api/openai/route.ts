import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

console.log("API Key:", process.env.OPENAI_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json(); // Properly parse JSON body

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userInput }],
      stream: false,
    });

    const messageContent = response.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ message: messageContent }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting full AI response:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get full AI response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
