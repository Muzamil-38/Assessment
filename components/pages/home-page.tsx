'use client';
import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { ModeToggle } from '../elements/toggle-mode';
import { getOpenaiResponseStream } from '@/model/models'; // Replace with streaming function
import { CircleSlash, RotateCcw, Star } from 'lucide-react';
import { Input } from '../ui/input';
import { ModelOptions } from '../elements/model-options';
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { useLLMStore } from '@/store/llm-store';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  starred?: boolean;
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const streamingOptions = useRef<{ stop: boolean }>({ stop: false });

  const model = useLLMStore().selectedModel;

  const saveChat = async (user: string, system: string) => {
    try {
      const response = await fetch('/api/savechat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: user,
          systemMessage: system,
        }),
      });
  
      const data = await response.json();
      console.log("data -->",data)
      if (response.ok) {
        setMessages((prev) => [...prev, { text: data.systemMessage, sender: 'ai',starred: false, id: data.id }]);
      } else {
        console.error('Failed to save chat history:', data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSendMessage = async () => {
    if (!input.trim()) return;
  
    const userMessage: Message = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
  
    setLoading(true);
    setInput('');
    streamingOptions.current.stop = false;
  
    try {
      let aiMessage = '';
      let aiMessageAdded = false; // Flag to track if AI message is already added
  
      // Streaming AI response
      await getOpenaiResponseStream(input, (chunk: string) => {
        if (streamingOptions.current.stop) return;
  
        aiMessage += chunk;
  
        setMessages((prev) => {
          // Only add new message if we haven't already added the AI message
          const updatedMessages = [...prev];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
  
          if (lastMessage?.sender === 'ai' && aiMessageAdded) {
            // If the last message is AI and it's already updated, don't add it again
            return updatedMessages;
          }
  
          if (!aiMessageAdded) {
            // Add a new AI message during streaming only once
            updatedMessages.push({ text: aiMessage, sender: 'ai' });
            aiMessageAdded = true;
          }
  
          return updatedMessages;
        });
      });
  
      // After streaming, save chat history
      await saveChat(input, aiMessage);
  
    } catch (error) {
      console.error('Error streaming AI response:', error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleStop = () => {
    streamingOptions.current.stop = true;
    setLoading(false);
  };

  const handleRefresh = () => {
    setMessages([]);
    setInput('');
    streamingOptions.current.stop = false;
  };

  const toggleStar = async (index: number) => {
    const updatedMessages = [...messages];
    const message = updatedMessages[index];
  
    try {
      const response = await fetch('/api/star', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: message.id, // Ensure you store and use the message ID
          isStarred: !message.starred,
        }),
      });
  
      if (!response.ok) throw new Error('Failed to update starred status');
  
      // Update UI only if the API call succeeds
      message.starred = !message.starred;
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error updating starred status:', error);
    }
  };
  

  return (
    <div className="max-w-7xl relative mx-auto h-[100dvh] flex flex-col justify-center items-center space-y-12">
      <div className="absolute top-4 right-4 flex space-x-6">
        <Button variant="destructive" onClick={handleStop} disabled={!loading}>
          <CircleSlash className="w-4 h-4" /> Stop
        </Button>
        <Button variant="secondary" onClick={handleRefresh}>
          <RotateCcw className="w-4 h-4" /> Refresh
        </Button>
        <ModeToggle />
      </div>

      <h1 className="font-bold text-2xl">{model.length ? model : 'Chat with me'}</h1>

      <div className="relative max-w-xl w-full p-4 border rounded-md flex flex-col h-96 overflow-y-auto">
      {messages.map((msg, index) => (
  <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} my-2 relative`}>
    <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
      <Markdown className={`${msg.sender === 'user' ? 'text-white' : 'text-black'} prose dark:prose-invert prose-h1:text-xl prose-sm`} remarkPlugins={[remarkGfm]}>
        {msg.text}
      </Markdown>

      {/* Star Button */}
      <button 
        className="absolute top-2 right-2"
        onClick={() => toggleStar(index)}
      >
        <Star className={`w-4 h-4 ${msg.starred ? 'text-yellow-500' : 'text-gray-400'}`} />
      </button>
    </div>
  </div>
))}

      </div>

      <div className="max-w-xl w-full fixed bottom-5">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex flex-row w-full items-end gap-2">
          <ModelOptions />
          <Input
            placeholder="Type your message here."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type='submit' disabled={loading || !input.length}>
            {loading ? 'Generating...' : 'Send'}
          </Button>
          
        </form>
      </div>
    </div>
  );
}
