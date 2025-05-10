import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FaRobot, FaBrain, FaImage, FaVolumeUp, FaPen, FaDatabase } from 'react-icons/fa';
import { MdTranslate } from 'react-icons/md';
import { GiCrystalBall } from 'react-icons/gi';
import { Film, PanelLeftClose, PanelRightClose } from 'lucide-react';

type NodeCategory = {
  title: string;
  icon: React.ReactNode;
  color: string;
  nodes: {
    type: string;
    name: string;
    description: string;
  }[];
};

const nodeCategories: NodeCategory[] = [
  {
    title: 'Language Models',
    icon: <FaBrain className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    nodes: [
      { type: 'openai', name: 'OpenAI GPT-4o', description: 'Text generation, reasoning, and conversation' },
      { type: 'anthropic', name: 'Anthropic Claude', description: 'Long context understanding and analysis' },
      { type: 'perplexity', name: 'Perplexity', description: 'Research and web searching capabilities' },
    ]
  },
  {
    title: 'Voice & Audio',
    icon: <FaVolumeUp className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    nodes: [
      { type: 'elevenlabs', name: 'ElevenLabs TTS', description: 'Text to realistic speech conversion' },
      { type: 'whisper', name: 'Whisper Transcription', description: 'Convert audio to text with high accuracy' },
      { type: 'suno', name: 'Suno', description: 'Music integration and creation' },
    ]
  },
  {
    title: 'Image Generation',
    icon: <FaImage className="h-5 w-5" />,
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    nodes: [
      { type: 'dalle', name: 'DALL-E 3', description: 'Generate images from text descriptions' },
      { type: 'stability', name: 'Stable Diffusion', description: 'Advanced text to image generation' },
      { type: 'midjourney', name: 'Midjourney', description: 'Artistic image creation from prompts' }
    ]
  },
  {
    title: 'Video Generation',
    icon: <Film className="h-5 w-5" />,
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    nodes: [
      { type: 'sora', name: 'OpenAI Sora', description: 'Generate realistic videos from text descriptions' },
      { type: 'runway', name: 'Runway Gen-2', description: 'Create high-quality videos from prompts' },
      { type: 'pika', name: 'Pika Labs', description: 'Text to video and image to video generation' }
    ]
  },
  {
    title: 'Content Creation',
    icon: <FaPen className="h-5 w-5" />,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    nodes: [
      { type: 'blog', name: 'Blog Post Generator', description: 'Create complete blog posts with structure' },
      { type: 'social', name: 'Social Media Content', description: 'Generate platform-specific content' }
    ]
  },
  {
    title: 'Data & Storage',
    icon: <FaDatabase className="h-5 w-5" />,
    color: 'bg-green-100 text-green-800 border-green-300',
    nodes: [
      { type: 'vector-db', name: 'Vector Database', description: 'Store and query embeddings' },
      { type: 'memory', name: 'Persistent Memory', description: 'Store conversation history and context' }
    ]
  },
  {
    title: 'I/O & Triggers',
    icon: <FaRobot className="h-5 w-5" />,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    nodes: [
      { type: 'input', name: 'User Input', description: 'Start workflow with user text or file input' },
      { type: 'output', name: 'Response', description: 'Display results to the user' },
      { type: 'webhook', name: 'Webhook', description: 'Trigger workflow from external source' }
    ]
  }
];

const Sidebar = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Language Models']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string, nodeName: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeName', nodeName);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative h-full">
      <div 
        className={cn(
          "h-full border-r border-gray-200 bg-white transition-all duration-300 ease-in-out flex flex-col", 
          isSidebarOpen ? "w-72" : "w-0 overflow-hidden"
        )}
      >
        <div className={cn("flex flex-col h-full", !isSidebarOpen && "opacity-0 pointer-events-none")}>
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FaRobot className="text-primary" /> AI Services
            </h2>
            <p className="text-xs text-gray-500 mt-1">Drag and drop services to the canvas</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {nodeCategories.map((category) => (
              <div key={category.title} className="mb-2">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-left p-3 h-auto"
                  onClick={() => toggleCategory(category.title)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded ${category.color}`}>
                      {category.icon}
                    </span>
                    <span>{category.title}</span>
                  </div>
                  <span className="text-xs">{expandedCategories.includes(category.title) ? '▼' : '►'}</span>
                </Button>

                <div className={cn("pl-4 pr-2 mt-1 space-y-1.5", 
                     !expandedCategories.includes(category.title) && "hidden")}>
                  {category.nodes.map((node) => (
                    <div
                      key={node.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, node.type, node.name)}
                      className="bg-white p-2 rounded border border-gray-200 cursor-grab hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-sm">{node.name}</div>
                      <div className="text-xs text-gray-500">{node.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              Drag nodes to the canvas and connect them to build your workflow
            </div>
          </div>
        </div>
      </div>

      <Button 
        onClick={toggleSidebar} 
        variant="ghost" 
        size="icon" 
        className={cn(
          "absolute top-2 z-10 bg-white border border-gray-200 hover:bg-gray-100 transition-all duration-300 ease-in-out",
          isSidebarOpen 
            ? "left-[calc(18rem-0.625rem-2.5rem)]"
            : "left-2"
        )}
      >
        {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}
      </Button>
    </div>
  );
};

export default Sidebar;
