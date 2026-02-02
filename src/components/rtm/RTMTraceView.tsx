import { useMemo } from 'react';
import { RTMTable } from './RTMTable';
import { NavigationNode, Requirement } from '@/types/rtm';
import { requirementsData } from '@/data/mockData';

interface RTMTraceViewProps {
  data: NavigationNode[];
  onRequirementSelect: (node: NavigationNode) => void;
  visibleColumns?: string[];
}

// Helper to flatten all requirements from hierarchical data
function flattenRequirements(nodes: NavigationNode[]): NavigationNode[] {
  const requirements: NavigationNode[] = [];
  
  function traverse(nodeList: NavigationNode[]) {
    for (const node of nodeList) {
      if (node.type === 'requirement') {
        requirements.push(node);
      } else if (node.children) {
        traverse(node.children);
      }
    }
  }
  
  traverse(nodes);
  return requirements;
}

export function RTMTraceView({ data, onRequirementSelect, visibleColumns }: RTMTraceViewProps) {
  // Convert NavigationNode requirements to Requirement format for RTMTable
  const flatRequirements = useMemo(() => {
    const flatNodes = flattenRequirements(data);
    
    return flatNodes.map(node => {
      // Find the full requirement data
      const fullReq = requirementsData.find(req => req.id === node.id);
      if (!fullReq) {
        // Fallback if requirement not found in mock data
        return {
          id: node.id,
          reqId: node.id,
          title: node.name,
          type: 'Business' as const,
          priority: 'Medium' as const,
          status: 'Active' as const,
          sourceOwner: 'Unknown',
          lastUpdatedBy: 'System',
          updatedAt: new Date().toISOString().split('T')[0],
          tasks: [],
          testCases: [],
          issues: [],
          signOffs: [],
          ctas: [],
          meetings: []
        };
      }
      
      return fullReq;
    });
  }, [data]);

  const handleRequirementClick = (req: Requirement, tab?: string) => {
    // Convert back to NavigationNode format for consistency
    const node: NavigationNode = {
      id: req.id,
      name: req.title,
      type: 'requirement',
      status: 'in-scope'
    };
    onRequirementSelect(node);
  };

  return (
    <div className="h-full w-full">
      <RTMTable
        requirements={flatRequirements}
        onRequirementClick={handleRequirementClick}
        visibleColumns={visibleColumns}
      />
    </div>
  );
}