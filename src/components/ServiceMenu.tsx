
import { useState } from 'react';
import { FaRobot, FaBrain, FaImage, FaVolumeUp, FaPen, FaDatabase } from 'react-icons/fa';
import { Film } from 'lucide-react';

type Category = {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
};

type Node = {
  type: string;
  name: string;
  description: string;
};

const categories: Category[] = [
  {
    id: 'language-models',
    title: 'Language Models',
    icon: <FaBrain className="h-6 w-6" />,
    color: 'bg-purple-500 text-white',
  },
  {
    id: 'voice-audio',
    title: 'Voice & Audio',
    icon: <FaVolumeUp className="h-6 w-6" />,
    color: 'bg-blue-500 text-white',
  },
  {
    id: 'image-generation',
    title: 'Image Generation',
    icon: <FaImage className="h-6 w-6" />,
    color: 'bg-rose-500 text-white',
  },
  {
    id: 'video-generation',
    title: 'Video Generation',
    icon: <Film className="h-6 w-6" />,
    color: 'bg-amber-500 text-white',
  },
  {
    id: 'content-creation',
    title: 'Content Creation',
    icon: <FaPen className="h-6 w-6" />,
    color: 'bg-cyan-500 text-white',
  },
  {
    id: 'data-storage',
    title: 'Data & Storage',
    icon: <FaDatabase className="h-6 w-6" />,
    color: 'bg-green-500 text-white',
  },
  {
    id: 'io-triggers',
    title: 'I/O & Triggers',
    icon: <FaRobot className="h-6 w-6" />,
    color: 'bg-indigo-500 text-white',
  },
];

const nodesByCategory: Record<string, Node[]> = {
  'language-models': [
    { type: 'openai', name: 'OpenAI GPT-4o', description: 'Text generation, reasoning, and conversation' },
    { type: 'anthropic', name: 'Anthropic Claude', description: 'Long context understanding and analysis' },
    { type: 'perplexity', name: 'Perplexity', description: 'Research and web searching capabilities' },
  ],
  'voice-audio': [
    { type: 'elevenlabs', name: 'ElevenLabs TTS', description: 'Text to realistic speech conversion' },
    { type: 'whisper', name: 'Whisper Transcription', description: 'Convert audio to text with high accuracy' },
    { type: 'suno', name: 'Suno', description: 'Music integration and creation' },
  ],
  'image-generation': [
    { type: 'dalle', name: 'DALL-E 3', description: 'Generate images from text descriptions' },
    { type: 'stability', name: 'Stable Diffusion', description: 'Advanced text to image generation' },
    { type: 'midjourney', name: 'Midjourney', description: 'Artistic image creation from prompts' }
  ],
  'video-generation': [
    { type: 'sora', name: 'OpenAI Sora', description: 'Generate realistic videos from text descriptions' },
    { type: 'runway', name: 'Runway Gen-2', description: 'Create high-quality videos from prompts' },
    { type: 'pika', name: 'Pika Labs', description: 'Text to video and image to video generation' }
  ],
  'content-creation': [
    { type: 'blog', name: 'Blog Post Generator', description: 'Create complete blog posts with structure' },
    { type: 'social', name: 'Social Media Content', description: 'Generate platform-specific content' }
  ],
  'data-storage': [
    { type: 'vector-db', name: 'Vector Database', description: 'Store and query embeddings' },
    { type: 'memory', name: 'Persistent Memory', description: 'Store conversation history and context' }
  ],
  'io-triggers': [
    { type: 'input', name: 'User Input', description: 'Start workflow with user text or file input' },
    { type: 'output', name: 'Response', description: 'Display results to the user' },
    { type: 'webhook', name: 'Webhook', description: 'Trigger workflow from external source' }
  ]
};

interface ServiceMenuProps {
  onSelectNode: (type: string, name: string) => void;
  onClose: () => void;
}

const ServiceMenu: React.FC<ServiceMenuProps> = ({ onSelectNode, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleNodeSelect = (type: string, name: string) => {
    onSelectNode(type, name);
    onClose();
  };

  return (
    <div className="p-4">
      <div className="flex flex-col">
        <h3 className="text-lg font-medium mb-4">Add Service to Workflow</h3>
        
        <div className="flex flex-wrap gap-4 mb-4">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col items-center">
              <button
                onClick={() => handleCategoryClick(category.id)}
                className={`rounded-full w-16 h-16 flex items-center justify-center shadow-md transition-all ${
                  selectedCategory === category.id
                    ? `${category.color} ring-4 ring-offset-2 ring-primary/50`
                    : `${category.color} hover:scale-110`
                }`}
              >
                {category.icon}
              </button>
              <span className="text-xs mt-2 text-center">{category.title}</span>
            </div>
          ))}
        </div>

        {selectedCategory && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {nodesByCategory[selectedCategory].map((node) => (
              <div
                key={node.type}
                onClick={() => handleNodeSelect(node.type, node.name)}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary cursor-pointer transition-colors"
              >
                <h4 className="font-medium">{node.name}</h4>
                <p className="text-sm text-gray-500">{node.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceMenu;
