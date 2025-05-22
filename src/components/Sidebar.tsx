
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
