import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalHeader } from '@/components/rtm/GlobalHeader';
import { FilterBar } from '@/components/rtm/FilterBar';
import { RTMTreeTable } from '@/components/rtm/RTMTreeTable';
import { navigationData, requirementsData } from '@/data/mockData';
import { Eye, ChevronDown, RefreshCw, Filter as FilterIcon, Download, Maximize, Search, Plus, Save, ArrowLeft, FolderPlus, Upload, FileText, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import RequirementDetail from "./pages/RequirementDetail";
import NewRequirement from "./pages/NewRequirement";
import NotFound from "./pages/NotFound";
import { ImportFromSDDDrawer } from '@/components/drawers/ImportFromSDDDrawer';
import { AddFolderDialog } from '@/components/dialogs/AddFolderDialog';
import kternLogo from '@/assets/kternlogo.png';
import { cn } from '@/lib/utils';


const queryClient = new QueryClient();

function MainLayout() {
  const navigate = useNavigate();
  const [showImportDrawer, setShowImportDrawer] = useState(false);
  const [showAddFolderDialog, setShowAddFolderDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [tableView, setTableView] = useState<'explorer' | 'trace'>('trace');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "Req ID", "Req Title", "Source", "Priority", "Status", "Tags",
    "Task", "Test Cases", "Issues", "Sign-offs", "CTA", "Meetings"
  ]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [currentFolderData, setCurrentFolderData] = useState(navigationData[0]?.children || []);
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>(['MDLP FY25', 'RTM']);
  const [navigationStack, setNavigationStack] = useState<{data: any[], path: string[]}[]>([]);


  const getVisibleItemsCount = () => {
    const countItems = (nodes: any[]): number => {
      let count = 0;
      nodes.forEach(node => {
        count += 1;
        if (node.children && expanded[node.id]) {
          count += countItems(node.children);
        }
      });
      return count;
    };
    return countItems(currentFolderData);
  };

  const handleViewChange = (view: string) => {
    console.log('View changed:', view);
  };

  const handleColumnToggle = (column: string) => {
    setVisibleColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleRequirementSelect = (node: any) => {
    navigate(`/requirement/${node.reqId || node.id}`);
  };

  const handleFolderFocus = (node: any) => {
    if (node.children) {
      // Push current state to stack
      setNavigationStack(prev => [...prev, { data: currentFolderData, path: breadcrumbPath }]);
      // Include the parent node along with its children
      setCurrentFolderData([node]);
      setBreadcrumbPath([...breadcrumbPath, node.name]);
    }
  };

  const handleBackNavigation = () => {
    if (navigationStack.length > 0) {
      const previousState = navigationStack[navigationStack.length - 1];
      setCurrentFolderData(previousState.data);
      setBreadcrumbPath(previousState.path);
      setNavigationStack(prev => prev.slice(0, -1));
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === breadcrumbPath.length - 1) return;
    
    if (index <= 1) {
      setCurrentFolderData(navigationData[0]?.children || []);
      setBreadcrumbPath(['MDLP FY25', 'RTM']);
      setNavigationStack([]);
    }
  };

  const getAllFolders = (nodes: any[], level = 0, path = ''): { id: string; name: string; level: number; path: string }[] => {
    let folders: { id: string; name: string; level: number; path: string }[] = [];
    
    nodes.forEach(node => {
      if (node.children) {
        const currentPath = path ? `${path} > ${node.name}` : node.name;
        folders.push({
          id: node.id,
          name: node.name,
          level,
          path: currentPath
        });
        folders = folders.concat(getAllFolders(node.children, level + 1, currentPath));
      }
    });
    
    return folders;
  };

  const availableFolders = getAllFolders(navigationData[0]?.children || []);

  const getBreadcrumb = () => {
    return breadcrumbPath;
  };

  return (
    <div className={cn("h-screen w-screen bg-background flex flex-col overflow-hidden", isFullscreen && "fixed inset-0 z-50")}>
      {/* Global Header with KTERN Logo */}
      <div className="sticky top-0 z-50">
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-4">
          {/* Left: KTERN Logo + Breadcrumb */}
          <div className="flex items-center gap-6">
            <img src={kternLogo} alt="KTERN" className="h-5 w-auto object-contain" />
            <nav className="flex items-center text-sm">
              {getBreadcrumb().map((item, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && <span className="breadcrumb-separator">/</span>}
                  <span 
                    className={cn(
                      index === getBreadcrumb().length - 1 
                        ? 'text-foreground font-medium' 
                        : 'breadcrumb-item cursor-pointer hover:text-blue-600'
                    )}
                    onClick={() => handleBreadcrumbClick(index)}
                  >
                    {item}
                  </span>
                </span>
              ))}
            </nav>
          </div>

          {/* Center: Empty space */}
          <div className="flex-1 max-w-lg mx-8 hidden lg:block" />

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
            {/* <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
              </svg>
            </Button> */}
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground relative">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <div className="ml-2 pl-4 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center cursor-pointer">
                KA
              </div>
            </div>
          </div>
        </header>
        <div className="accent-bar" />
      </div>

      {/* Filter Bar */}
      <FilterBar 
        onViewChange={handleViewChange}
        onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
        tableView="trace"
        onTableViewChange={() => {}}
        availableFolders={availableFolders}
        onFolderFilter={(folders) => console.log('Selected folders:', folders)}
      />
      
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-background border-b border-border px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left: User Created Views */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 border border-muted-foreground/20 hover:border-muted-foreground/40">
                  <Eye className="h-4 w-4" />
                  Admin View
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem>Admin View</DropdownMenuItem>
                <DropdownMenuItem>Tester View</DropdownMenuItem>
                <DropdownMenuItem>Business View</DropdownMenuItem>
                <DropdownMenuItem>Filtered View</DropdownMenuItem>
                <DropdownMenuItem>Sorted View</DropdownMenuItem>
                <div className="border-t border-border mt-1 pt-1">
                      <div className="flex items-center gap-1">
                        <DropdownMenuItem className="text-primary flex-1">
                          <Plus className="h-3 w-3 mr-2" />
                          Add View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-primary flex-1">
                          <Save className="h-3 w-3 mr-2" />
                          Save As
                        </DropdownMenuItem>
                      </div>
                    </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center: Empty space */}
          <div className="flex items-center">
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20" title="Filter">
              <FilterIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20" title="Export">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20" title="Fullscreen" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20" title="Add">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-1">  
              <DropdownMenuItem className="rounded-md px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setShowAddFolderDialog(true)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add Folder
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-md px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setShowImportDrawer(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import from SDD
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-md px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate('/requirements/new')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Add Requirement
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <RTMTreeTable 
          data={currentFolderData}
          onRequirementSelect={handleRequirementSelect}
          onFolderFocus={handleFolderFocus}
          onBackNavigation={handleBackNavigation}
          showBackButton={navigationStack.length > 0}
          tableView={tableView}
          onTableViewChange={setTableView}
          onExpandedChange={setExpanded}
          visibleItemsCount={getVisibleItemsCount()}
          isFullscreen={isFullscreen}
          onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          availableFolders={availableFolders}
        />
      </div>
      
      <ImportFromSDDDrawer
        open={showImportDrawer}
        onOpenChange={setShowImportDrawer}
        data={navigationData[0]?.children || []}
        onSubmit={(data) => {
          console.log('Import SDD data:', data);
        }}
      />
      
      <AddFolderDialog
        open={showAddFolderDialog}
        onOpenChange={setShowAddFolderDialog}
        data={navigationData[0]?.children || []}
        onSubmit={(data) => {
          console.log('Add folder data:', data);
        }}
      />

    </div>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/requirement/:id" element={<RequirementDetail />} />
            <Route path="/requirements/new" element={<NewRequirement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
