
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Home,
  UserRound,
  Share2,
  FolderOpen,
  CloudCog,
  LayoutTemplate,
  Variable,
  BarChart3,
  HelpCircle,
  ChevronDown,
  Plus
} from 'lucide-react';

// Import Shadcn sidebar components
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';

const Sidebar = () => {
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [helpExpanded, setHelpExpanded] = useState(false);
  
  const toggleProjects = () => {
    setProjectsExpanded(!projectsExpanded);
  };
  
  const toggleHelp = () => {
    setHelpExpanded(!helpExpanded);
  };

  return (
    <ShadcnSidebar variant="inset" className="bg-[#2b2b2b] text-gray-300 border-r border-gray-700">
      <SidebarContent>
        {/* N8n Logo */}
        <div className="px-4 py-4 flex items-center">
          <svg viewBox="0 0 284 82" height="28" width="96" className="text-red-500">
            <path fill="currentColor" d="M41.17 0H24.7c-6.27 0-11.04 1.98-14.03 5.88l-.03.04-8.5 11.45-.72.94c-1.9 2.64-1.94 5.7-.25 8.4l.22.34.28.3L41.32 70.56c3.73 3.91 8.7 5.45 15.7 5.13l.45-.03h16.05c6.22 0 11.13-1.98 14.12-5.95l.03-.04 8.39-11.3.85-1.1c1.86-2.63 1.9-5.67.23-8.32l-.22-.35-.28-.3L58.07 5.15C54.3 1.22 49.27-.14 42.23.15l-.45.02-.62-.17ZM218.4 1.5c-9.5 0-17.3 2.3-23.3 6.8-5.8 4.4-10.1 10.6-12.6 18.4-2.3 7.4-2.5 14.9-.4 22.1 2 7 6.2 12.9 12.2 16.9 6.1 4.2 14 6.3 23.6 6.3 5.4 0 10.3-.7 14.6-2.2 4.1-1.4 7.7-3.5 10.7-6.3 3-2.7 5.2-6.2 6.7-10.3l.3-.8h-18.2c-.8 1.2-1.8 2.2-3 3-.2.2-.4.3-.6.4-.7.5-1.5.9-2.3 1.3-2.2 1-4.7 1.4-7.5 1.4-4.5 0-8.2-1.2-10.9-3.5-2.2-1.8-3.7-4.3-4.5-7.3h48.9l.1-2.1c.1-1.9.1-3.6.1-5.1 0-8-1.7-14.9-5.1-20.5-3.4-5.6-8.2-9.8-14.3-12.6-6-2.7-13.2-4-21.4-4Zm-94.4 2.1H105v67.8h19V3.6ZM141 3.6h-18.9v11.2h18.2c4.7 0 8.2.7 10.6 2.1 2.3 1.4 3.5 3.6 3.5 6.5 0 3-.9 5.3-2.8 6.7-2.1 1.6-5.3 2.3-9.9 2.3h-8.4c-7.2 0-12.9 1.6-17 4.8-4.2 3.2-6.3 8.2-6.3 15 0 6.5 1.9 11.6 5.6 15 3.8 3.5 9.1 5.2 16 5.2h37.2V28.1c0-8.1-2-14.2-6.1-18.3-4-4-10-6.2-17.6-6.2Zm97.6 16.7c3.9 0 7.2 1 9.7 3.1 2.5 2 4.2 4.9 5.1 8.7h-29.8c.9-3.7 2.6-6.7 5.1-8.7 2.6-2.1 5.9-3.1 9.9-3.1ZM141 51.8h-7.8c-1.7 0-3.1-.4-4-1.3-.9-.9-1.4-2.2-1.4-3.7 0-1.8.4-3.1 1.3-4.1.9-1 2.2-1.4 4.1-1.4h7.8v10.5ZM274.5 3.6h-19v67.8h19V44.2h4.1c7.4 0 13.2-1.8 17.2-5.5 4-3.6 6-8.7 6-15.3 0-6.5-2-11.5-6-15-4-3.2-9.8-4.9-17.3-4.9Zm-82 2.1h-19v13h-8.2v15.4h8.2v19.9c0 5.9 1.4 10.4 4.3 13.4 2.8 3 7.2 4.5 13.1 4.5 2.5 0 5.1-.3 7.9-.9 2.3-.5 4.4-1.2 6.3-2l.2-.1v-15l-.5.2c-1.2.5-2.4.8-3.7 1-.9.2-1.8.3-2.7.3-1.8 0-3-.5-3.8-1.6-.7-1.1-1.1-2.9-1.1-5.5V34.1h11.8V18.7h-11.8V5.7ZM274.4 20c2.5 0 4.4.6 5.4 1.8.9 1.1 1.4 2.7 1.4 4.9 0 2.3-.5 4-1.5 5.1-1 1.2-2.9 1.8-5.4 1.8h-4v-13.7h4.1Z"></path>
          </svg>
        </div>
        
        {/* Main Navigation */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-md">
                <Home size={18} />
                <span>Overview</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#" className="flex items-center gap-3 px-4 py-2 bg-gray-700 rounded-md">
                <UserRound size={18} />
                <span>Personal</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-md">
                <Share2 size={18} />
                <span>Shared with you</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {/* Projects Section */}
        <div className="mt-6 px-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <button 
              className="flex items-center gap-1 text-gray-300 hover:text-gray-100" 
              onClick={toggleProjects}
            >
              <span>Projects</span>
              <ChevronDown size={16} className={cn("transition-transform", projectsExpanded ? "transform rotate-180" : "")} />
            </button>
            <button className="text-gray-300 hover:text-gray-100">
              <Plus size={16} />
            </button>
          </div>
          
          {projectsExpanded && (
            <div className="pl-1">
              {/* Project list would go here */}
            </div>
          )}
          
          <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
            <Plus size={16} className="mr-1" /> Add project
          </Button>
        </div>
        
        {/* Bottom Navigation */}
        <div className="mt-auto pt-6">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-md">
                  <CloudCog size={18} />
                  <span>Admin Panel</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-md">
                  <LayoutTemplate size={18} />
                  <span>Templates</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-md">
                  <Variable size={18} />
                  <span>Variables</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-md">
                  <BarChart3 size={18} />
                  <span>Insights</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button 
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-md w-full justify-between"
                  onClick={toggleHelp}
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle size={18} />
                    <span>Help</span>
                  </span>
                  <ChevronDown size={16} className={cn("transition-transform", helpExpanded ? "transform rotate-180" : "")} />
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
      
      {/* User Profile */}
      <SidebarFooter className="border-t border-gray-700 py-2 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
            JB
          </div>
          <div className="text-sm">Joshua Best</div>
          <button className="ml-auto text-gray-400 hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};

export default Sidebar;
