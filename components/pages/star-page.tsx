'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Star, ArrowLeft } from 'lucide-react';
import { Input } from '../ui/input';
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';

interface StarredMessage {
  id: string;
  userMessage: string;
  systemMessage: string;
  starred: boolean;
}

export default function StarPage() {
  const [starredMessages, setStarredMessages] = useState<StarredMessage[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchStarredMessages();
  }, []);

  const fetchStarredMessages = async () => {
    try {
      const response = await fetch('/api/starredmessage');
      if (!response.ok) throw new Error('Failed to fetch starred messages');
      const data = await response.json();
      setStarredMessages(data);
    } catch (error) {
      console.error('Error fetching starred messages:', error);
    }
  };

  const toggleStar = async (id: string) => {
    try {
      const response = await fetch('/api/star', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, isStarred: false }),
      });

      if (!response.ok) throw new Error('Failed to update starred status');

      // Remove un-starred message from the list
      setStarredMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error('Error updating starred status:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[100dvh] flex flex-col justify-center items-center space-y-6">
      {/* Header */}
      <div className="w-full flex justify-between items-center p-4 border-b">
        <Button variant="secondary" onClick={() => router.push('/')}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <h1 className="font-bold text-xl">Starred Messages</h1>
      </div>

      {/* Messages List */}
      <div className="relative max-w-xl w-full p-4 border rounded-md flex flex-col h-96 overflow-y-auto">
        {starredMessages.length === 0 ? (
          <p className="text-center text-gray-500">No starred messages found.</p>
        ) : (
          starredMessages.map((msg) => (
            <div key={msg.id} className="my-4">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="p-3 bg-blue-500 text-white rounded-lg max-w-[80%]">
                  <Markdown className="text-white prose dark:prose-invert prose-h1:text-xl prose-sm" remarkPlugins={[remarkGfm]}>
                    {msg.userMessage}
                  </Markdown>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start mt-2 relative">
                <div className="p-3 bg-gray-300 text-black rounded-lg max-w-[80%]">
                  <Markdown className="text-black prose dark:prose-invert prose-h1:text-xl prose-sm" remarkPlugins={[remarkGfm]}>
                    {msg.systemMessage}
                  </Markdown>
                  <button className="absolute top-2 right-2" onClick={() => toggleStar(msg.id)}>
                    <Star className="w-4 h-4 text-yellow-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
