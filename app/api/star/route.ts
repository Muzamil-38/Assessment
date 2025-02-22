import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { id, isStarred } = await req.json();

    // Update the starred status in the database
    const updatedChat = await prisma.chatHistory.update({
      where: { id },
      data: { isStarred },
    });

    return new Response(JSON.stringify(updatedChat), { status: 200 });
  } catch (error) {
    console.error('Error updating starred status:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update starred status' }),
      { status: 500 }
    );
  }
}
