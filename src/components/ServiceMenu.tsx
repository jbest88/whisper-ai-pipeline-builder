
import { useState } from 'react';
import { 
  FaRobot, FaBrain, FaImage, FaVolumeUp, FaPen, FaDatabase, 
  FaTools, FaCode, FaServer, FaClock
} from 'react-icons/fa';
import { Film, Globe, FileJson, Terminal, Mail, Activity } from 'lucide-react';

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
    title: 'AI & ML',
    icon: <FaBrain className="h-6 w-6" />,
    color: 'bg-indigo-500 text-white',
  },
  {
    id: 'voice-audio',
    title: 'Voice & Audio',
    icon: <FaVolumeUp className="h-6 w-6" />,
    color: 'bg-blue-500 text-white',
  },
  {
    id: 'image-generation',
    title: 'Images',
    icon: <FaImage className="h-6 w-6" />,
    color: 'bg-rose-500 text-white',
  },
  {
    id: 'video-generation',
    title: 'Video',
    icon: <Film className="h-6 w-6" />,
    color: 'bg-orange-500 text-white',
  },
  {
    id: 'core-nodes',
    title: 'Core',
    icon: <FaTools className="h-6 w-6" />,
    color: 'bg-slate-600 text-white',
  },
  {
    id: 'development',
    title: 'Development',
    icon: <Terminal className="h-6 w-6" />,
    color: 'bg-slate-800 text-white',
  },
  {
    id: 'communication',
    title: 'Communication',
    icon: <Mail className="h-6 w-6" />,
    color: 'bg-sky-500 text-white',
  },
  {
    id: 'data-transformation',
    title: 'Data',
    icon: <FileJson className="h-6 w-6" />,
    color: 'bg-emerald-500 text-white',
  },
  {
    id: 'flow-control',
    title: 'Flow Control',
    icon: <Activity className="h-6 w-6" />,
    color: 'bg-violet-500 text-white',
  },
  {
    id: 'triggers',
    title: 'Triggers',
    icon: <FaClock className="h-6 w-6" />,
    color: 'bg-amber-500 text-white',
  },
];

const nodesByCategory: Record<string, Node[]> = {
  'language-models': [
    { type: 'openai', name: 'OpenAI', description: 'Text generation, reasoning, and conversation' },
    { type: 'anthropic', name: 'Anthropic Claude', description: 'Long context understanding and analysis' },
    { type: 'perplexity', name: 'Perplexity', description: 'Research and web searching capabilities' },
  ],
  'voice-audio': [
    { type: 'elevenlabs', name: 'ElevenLabs TTS', description: 'Text to realistic speech conversion' },
    { type: 'whisper', name: 'Whisper', description: 'Convert audio to text with high accuracy' },
  ],
  'image-generation': [
    { type: 'dalle', name: 'DALL-E', description: 'Generate images from text descriptions' },
    { type: 'stability', name: 'Stable Diffusion', description: 'Advanced text to image generation' },
    { type: 'midjourney', name: 'Midjourney', description: 'Artistic image creation from prompts' }
  ],
  'video-generation': [
    { type: 'sora', name: 'Sora', description: 'Generate realistic videos from text descriptions' },
    { type: 'runway', name: 'Runway', description: 'Create high-quality videos from prompts' },
    { type: 'pika', name: 'Pika Labs', description: 'Text to video and image to video generation' }
  ],
  'core-nodes': [
    { type: 'input', name: 'Start', description: 'Start workflow with user input' },
    { type: 'output', name: 'Output', description: 'Display results to the user' },
    { type: 'webhook', name: 'Webhook', description: 'Trigger workflow from external source' },
    { type: 'transform', name: 'Set', description: 'Set variables and prepare data' },
    { type: 'merge', name: 'Merge', description: 'Merge data from multiple nodes' },
  ],
  'development': [
    { type: 'code', name: 'Code', description: 'Execute custom JavaScript code' },
    { type: 'function', name: 'Function', description: 'Run pre-built functions' },
    { type: 'http', name: 'HTTP Request', description: 'Make HTTP requests to any API' },
    { type: 'api', name: 'API', description: 'Connect to REST APIs' },
  ],
  'communication': [
    { type: 'email', name: 'Email', description: 'Send and read emails' },
    { type: 'notification', name: 'Notification', description: 'Send various notifications' },
    { type: 'social', name: 'Social Media', description: 'Post to social media platforms' },
  ],
  'data-transformation': [
    { type: 'transform', name: 'Transform', description: 'Modify data structure and format' },
    { type: 'filter', name: 'Filter', description: 'Filter data based on conditions' },
    { type: 'vector-db', name: 'Vector DB', description: 'Store and query vector embeddings' },
    { type: 'memory', name: 'Memory', description: 'Store conversation history and context' },
  ],
  'flow-control': [
    { type: 'switch', name: 'Switch', description: 'Route execution based on conditions' },
    { type: 'filter', name: 'IF', description: 'Conditional execution of workflow branches' },
    { type: 'merge', name: 'Join', description: 'Join multiple branches back together' },
  ],
  'triggers': [
    { type: 'scheduler', name: 'Schedule', description: 'Trigger workflow at specific times' },
    { type: 'webhook', name: 'Webhook', description: 'Trigger from external HTTP requests' },
    { type: 'input', name: 'Manual Trigger', description: 'Manually trigger execution' },
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

  // Add drag start handler for nodes
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string, nodeName: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeName', nodeName);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="p-6 animate-slide-in-bottom">
      <div className="flex flex-col items-center">
        {!selectedCategory && (
          <div className="flex justify-center gap-2 md:gap-4 mb-6 overflow-x-auto py-2 flex-wrap">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="flex flex-col items-center transition-all duration-300 transform hover:scale-110"
                style={{ transitionDelay: `${categories.indexOf(category) * 30}ms` }}
              >
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shadow-lg ${category.color} hover:shadow-xl transition-all duration-300 transform`}
                  aria-label={category.title}
                >
                  {category.icon}
                </button>
                <span className="text-xs mt-2 text-center">{category.title}</span>
              </div>
            ))}
          </div>
        )}

        {selectedCategory && (
          <>
            <div className="mb-4 flex items-center">
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-primary font-medium flex items-center gap-1"
              >
                <span className="text-xl">←</span> Back to categories
              </button>
              <h4 className="text-lg font-medium ml-4">
                {categories.find(cat => cat.id === selectedCategory)?.title}
              </h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-h-64 overflow-y-auto">
              {nodesByCategory[selectedCategory].map((node) => (
                <div
                  key={node.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, node.type, node.name)}
                  onClick={() => handleNodeSelect(node.type, node.name)}
                  className="bg-white/90 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary cursor-grab transition-colors"
                >
                  <h4 className="font-medium">{node.name}</h4>
                  <p className="text-sm text-gray-500">{node.description}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceMenu;
