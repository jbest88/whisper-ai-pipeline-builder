
import React from 'react';
import { FaBrain, FaImage, FaVolumeUp, FaDatabase, FaFileAlt, FaCode, FaServer, FaEnvelope } from 'react-icons/fa';
import { BsChatText, BsCodeSlash, BsGear } from 'react-icons/bs';
import { FiSend, FiUsers, FiFilter, FiEdit, FiMap, FiCalendar } from 'react-icons/fi';
import { MdWebhook, MdSchedule, MdCloudUpload, MdNotifications } from 'react-icons/md';
import { Film, Calendar, UserCircle2, Mail, FileText, Globe, FileJson, Terminal } from 'lucide-react';

export const getNodeIcon = (type: string) => {
  switch (type) {
    // AI Models
    case 'openai':
      return <FaBrain />;
    case 'anthropic':
      return <FaBrain />;
    case 'perplexity':
      return <FaBrain />;
      
    // Audio nodes
    case 'elevenlabs':
      return <FaVolumeUp />;
    case 'whisper':
      return <FaVolumeUp />;
      
    // Image nodes
    case 'dalle':
      return <FaImage />;
    case 'gemini':
      return <FaImage />;
    case 'stability':
      return <FaImage />;
    case 'midjourney':
      return <FaImage />;
      
    // Video nodes
    case 'sora':
      return <Film />;
    case 'runway':
      return <Film />;
    case 'pika':
      return <Film />;
      
    // Content nodes  
    case 'blog':
      return <FileText />;
    case 'social':
      return <FiUsers />;
      
    // Storage nodes
    case 'vector-db':
      return <FaDatabase />;
    case 'memory':
      return <FaDatabase />;
      
    // Basic nodes
    case 'input':
      return <BsChatText />;
    case 'output':
      return <FiSend />;
    case 'webhook':
      return <MdWebhook />;
      
    // n8n specific nodes
    case 'code':
      return <BsCodeSlash />;
    case 'function':
      return <Terminal />;
    case 'http':
      return <Globe />;
    case 'api':
      return <FaServer />;
    case 'email':
      return <Mail />;
    case 'scheduler':
      return <Calendar />;
    case 'transform':
      return <FiMap />;
    case 'filter':
      return <FiFilter />;
    case 'switch':
      return <BsGear />;
    case 'merge':
      return <FileJson />;
    case 'notification':
      return <MdNotifications />;
      
    default:
      return <FaBrain />;
  }
};

export const getNodeColor = (type: string): string => {
  switch (type) {
    // AI Model nodes
    case 'openai':
    case 'anthropic':
    case 'perplexity':
      return '#6366f1'; // indigo-500
      
    // Audio nodes  
    case 'elevenlabs':
    case 'whisper':
      return '#2563eb'; // blue-600
      
    // Image nodes
    case 'dalle':
      return '#be123c'; // rose-700
    case 'gemini':
      return '#9333ea'; // purple-600
    case 'stability':
      return '#be123c'; // rose-700
    case 'midjourney':
      return '#be123c'; // rose-700
      
    // Video nodes
    case 'sora':
    case 'runway':
    case 'pika':
      return '#ea580c'; // orange-600
      
    // Content nodes
    case 'blog':
    case 'social':
      return '#0891b2'; // cyan-600
      
    // Storage nodes
    case 'vector-db':
    case 'memory':
      return '#16a34a'; // green-600
      
    // Basic nodes
    case 'input':
    case 'output':
      return '#4f46e5'; // indigo-600
    case 'webhook':
      return '#9333ea'; // purple-600
      
    // n8n specific nodes
    case 'code':
    case 'function':
      return '#475569'; // slate-600
    case 'http':
    case 'api':
      return '#0369a1'; // sky-700
    case 'email':
      return '#0284c7'; // sky-600
    case 'scheduler':
      return '#7c3aed'; // violet-600
    case 'transform':
      return '#d97706'; // amber-600
    case 'filter':
    case 'switch':
      return '#a855f7'; // purple-500
    case 'merge':
      return '#059669'; // emerald-600
    case 'notification':
      return '#f97316'; // orange-500
      
    default:
      return '#6d28d9'; // purple-700
  }
};

export const getNodeDescription = (type: string): string => {
  switch (type) {
    // AI Models
    case 'openai':
      return 'Generate text with OpenAI models';
    case 'anthropic':
      return 'Process with Claude for analysis';
    case 'perplexity':
      return 'Research and web search';
      
    // Audio nodes
    case 'elevenlabs':
      return 'Convert text to realistic speech';
    case 'whisper':
      return 'Transcribe audio to text';
      
    // Image nodes
    case 'dalle':
      return 'Generate images with DALL-E';
    case 'gemini':
      return 'Generate images with Google Gemini';
    case 'stability':
      return 'Create detailed AI images';
    case 'midjourney':
      return 'Create artistic images';
      
    // Video nodes
    case 'sora':
      return 'Generate realistic videos from text';
    case 'runway':
      return 'Create AI videos with Gen-2';
    case 'pika':
      return 'Convert text or images to video';
      
    // Content nodes
    case 'blog':
      return 'Generate blog post content';
    case 'social':
      return 'Create social media posts';
      
    // Storage nodes
    case 'vector-db':
      return 'Store and query vectors';
    case 'memory':
      return 'Store context for conversation';
      
    // Basic nodes
    case 'input':
      return 'Start workflow with user input';
    case 'output':
      return 'Display results to user';
    case 'webhook':
      return 'Trigger from external source';
      
    // n8n specific nodes
    case 'code':
      return 'Execute custom JavaScript code';
    case 'function':
      return 'Run a custom function';
    case 'http':
      return 'Make HTTP requests';
    case 'api':
      return 'Connect to external APIs';
    case 'email':
      return 'Send or read emails';
    case 'scheduler':
      return 'Schedule workflow execution';
    case 'transform':
      return 'Transform data between nodes';
    case 'filter':
      return 'Filter data based on conditions';
    case 'switch':
      return 'Route workflow based on conditions';
    case 'merge':
      return 'Merge data from multiple nodes';
    case 'notification':
      return 'Send notifications';
      
    default:
      return 'Configure this node';
  }
};
