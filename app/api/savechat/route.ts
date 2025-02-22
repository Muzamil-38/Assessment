import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userMessage, systemMessage } = await req.json();

    // Save chat history to the database
    const chatHistory = await prisma.chatHistory.create({
      data: {
        userMessage,
        systemMessage,
      },
    });

    return new Response(JSON.stringify(chatHistory), { status: 200 });
  } catch (error) {
    console.error('Error saving chat history:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save chat history' }),
      { status: 500 }
    );
  }
}