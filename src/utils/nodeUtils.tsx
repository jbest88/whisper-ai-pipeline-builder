
import React from 'react';
import { FaBrain, FaImage, FaVolumeUp, FaDatabase, FaFileAlt } from 'react-icons/fa';
import { BsChatText } from 'react-icons/bs';
import { FiSend } from 'react-icons/fi';
import { MdWebhook } from 'react-icons/md';
import { Film } from 'lucide-react';

export const getNodeIcon = (type: string) => {
  switch (type) {
    case 'openai':
    case 'anthropic':
    case 'perplexity':
      return <FaBrain />;
    case 'elevenlabs':
    case 'whisper':
      return <FaVolumeUp />;
    case 'dalle':
    case 'stability':
    case 'midjourney':
      return <FaImage />;
    case 'sora':
    case 'runway':
    case 'pika':
      return <Film />;
    case 'blog':
    case 'social':
      return <FaFileAlt />;
    case 'vector-db':
    case 'memory':
      return <FaDatabase />;
    case 'input':
      return <BsChatText />;
    case 'output':
      return <FiSend />;
    case 'webhook':
      return <MdWebhook />;
    default:
      return <FaBrain />;
  }
};

export const getNodeColor = (type: string): string => {
  switch (type) {
    case 'openai':
    case 'anthropic':
    case 'perplexity':
      return '#6d28d9'; // purple-700
    case 'elevenlabs':
    case 'whisper':
      return '#2563eb'; // blue-600
    case 'dalle':
    case 'stability':
    case 'midjourney':
      return '#be123c'; // rose-700
    case 'sora':
    case 'runway':
    case 'pika':
      return '#d97706'; // amber-600
    case 'blog':
    case 'social':
      return '#0891b2'; // cyan-600
    case 'vector-db':
    case 'memory':
      return '#16a34a'; // green-600
    case 'input':
    case 'output':
    case 'webhook':
      return '#4338ca'; // indigo-700
    default:
      return '#6d28d9'; // purple-700
  }
};

export const getNodeDescription = (type: string): string => {
  switch (type) {
    case 'openai':
      return 'Generate text with OpenAI models';
    case 'anthropic':
      return 'Process with Claude for analysis';
    case 'perplexity':
      return 'Research and web search';
    case 'elevenlabs':
      return 'Convert text to realistic speech';
    case 'whisper':
      return 'Transcribe audio to text';
    case 'dalle':
      return 'Generate images from text';
    case 'stability':
      return 'Create detailed AI images';
    case 'midjourney':
      return 'Create artistic images';
    case 'sora':
      return 'Generate realistic videos from text';
    case 'runway':
      return 'Create AI videos with Gen-2';
    case 'pika':
      return 'Convert text or images to video';
    case 'blog':
      return 'Generate blog post content';
    case 'social':
      return 'Create social media posts';
    case 'vector-db':
      return 'Store and query vectors';
    case 'memory':
      return 'Store context for conversation';
    case 'input':
      return 'Start workflow with user input';
    case 'output':
      return 'Display results to user';
    case 'webhook':
      return 'Trigger from external source';
    default:
      return 'Configure this node';
  }
};
