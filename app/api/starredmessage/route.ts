import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Retrieve all starred chat history records
    const starredMessages = await prisma.chatHistory.findMany({
      where: {
        isStarred: true,
      },
    });

    return new Response(JSON.stringify(starredMessages), { status: 200 });
  } catch (error) {
    console.error('Error retrieving starred messages:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve starred messages' }),
      { status: 500 }
    );
  }
}
