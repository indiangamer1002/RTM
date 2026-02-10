import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FocusDrillSidebar } from '@/components/navigation/FocusDrillSidebar';
import { RTMTreeTable } from '@/components/rtm/RTMTreeTable';
import { FilterBar } from '@/components/rtm/FilterBar';
import { NavigationNode } from '@/types/rtm';

// Mock data - replace with your actual data
const mockNavigationData: NavigationNode[] = [
  {
    id: 'otc',
    name: 'Order to Cash',
    type: 'process',
    status: 'in-scope',
    children: [
      {
        id: 'sales-order',
        name: 'Sales Order Management',
        type: 'process',
        status: 'in-scope',
        children: [
          {
            id: 'req-001',
            name: 'Sales Order Creation Workflow',
            type: 'requirement',
            status: 'in-scope',
            requirementStatus: 'Active',
            priority: 'High',
            createdBy: 'John Smith',
            createdOn: '2024-01-15',
            phase: 'build',
            coverage: 'full',
            tasks: [
              { id: 't1', title: 'Design order form UI', status: 'Completed', dueDate: '2024-02-01' },
              { id: 't2', title: 'Implement validation logic', status: 'Active', dueDate: '2024-02-15' },
              { id: 't3', title: 'Setup approval workflow', status: 'New', dueDate: '2024-02-20' },
              { id: 't4', title: 'Integrate with ERP', status: 'Active', dueDate: '2024-03-01' }
            ],
            testCases: [
              { id: 'tc1', title: 'Verify order creation with valid data', status: 'performed', dueDate: '2024-02-10' },
              { id: 'tc2', title: 'Test validation error handling', status: 'approved', dueDate: '2024-02-12' },
              { id: 'tc3', title: 'Verify approval notification', status: 'Active', dueDate: '2024-02-18' },
              { id: 'tc4', title: 'Check ERP sync', status: 'New', dueDate: '2024-02-25' },
              { id: 'tc5', title: 'Load testing for peak volume', status: 'New', dueDate: '2024-03-05' }
            ],
            issues: [
              { id: 'i1', title: 'Date picker not showing correct format', status: 'Active', dueDate: '2024-02-05' },
              { id: 'i2', title: 'Form validation message unclear', status: 'Resolved', dueDate: '2024-02-08' },
              { id: 'i3', title: 'API timeout on large datasets', status: 'New', dueDate: '2024-02-22' },
              { id: 'i4', title: 'Mobile view alignment', status: 'Approved', dueDate: '2024-02-02' }
            ],
            signOffs: [
              { id: 'so1', role: 'Business Blueprint Sign-off', stakeholder: 'Emily Davis', status: 'Approved', dueDate: '2024-01-30' },
              { id: 'so2', role: 'Technical Design Sign-off', stakeholder: 'Alex Kumar', status: 'Active', dueDate: '2024-02-20' },
              { id: 'so3', role: 'Integration Scenario Approval', stakeholder: 'Mike Chen', status: 'New', dueDate: '2024-02-25' },
              { id: 'so4', role: 'Phase Gate Approval', stakeholder: 'Sarah Jones', status: 'New', dueDate: '2024-02-28' },
              { id: 'so5', role: 'UAT Sign-off', stakeholder: 'David Wilson', status: 'New', dueDate: '2024-03-01' }
            ],
            meetings: [
              { id: 'm1', title: 'Design Review', status: 'Completed', dueDate: '2024-01-25' },
              { id: 'm2', title: 'Sprint Planning', status: 'Scheduled', dueDate: '2024-02-05' },
              { id: 'm3', title: 'UAT Kickoff', status: 'Pending', dueDate: '2024-02-28' }
            ]
          },
          {
            id: 'req-002',
            name: 'Customer Credit Check Integration',
            type: 'requirement',
            status: 'in-scope',
            requirementStatus: 'New',
            priority: 'Medium',
            createdBy: 'Sarah Johnson',
            createdOn: '2024-01-20',
            phase: 'analyze',
            coverage: 'partial',
            tasks: [
              { id: 't5', title: 'Define credit check rules', status: 'Completed', dueDate: '2024-01-28' },
              { id: 't6', title: 'API Specification', status: 'Active', dueDate: '2024-02-10' }
            ],
            testCases: [
              { id: 'tc6', title: 'Test credit limit exceeded', status: 'New', dueDate: '2024-02-15' }
            ],
            issues: [],
            signOffs: [
              { id: 'so6', role: 'G/L Account Mapping Approval', stakeholder: 'Robert Brown', status: 'Approved', dueDate: '2024-02-01' }
            ],
            meetings: [
              { id: 'm4', title: 'Requirement Gathering', status: 'Completed', dueDate: '2024-01-18' }
            ]
          }
        ]
      },
      {
        id: 'order-fulfillment',
        name: 'Order Fulfillment',
        type: 'process',
        status: 'in-scope',
        children: [
          {
            id: 'req-003',
            name: 'Order Status Tracking Dashboard',
            type: 'requirement',
            status: 'in-scope',
            requirementStatus: 'Completed',
            priority: 'Low',
            createdBy: 'Mike Davis',
            createdOn: '2024-01-10',
            phase: 'test',
            coverage: 'full',
            tasks: [
              { id: 't7', title: 'Dashboard layout design', status: 'Completed', dueDate: '2024-01-15' },
              { id: 't8', title: 'Implement charts', status: 'Completed', dueDate: '2024-01-25' },
              { id: 't9', title: 'Data binding', status: 'Completed', dueDate: '2024-01-30' }
            ],
            testCases: [
              { id: 'tc7', title: 'Verify chart data accuracy', status: 'performed', dueDate: '2024-02-02' },
              { id: 'tc8', title: 'Check filter functionality', status: 'approved', dueDate: '2024-02-03' }
            ],
            issues: [
              { id: 'i5', title: 'Performance lag on load', status: 'Resolved', dueDate: '2024-02-01' }
            ],
            signOffs: [
              { id: 'so7', role: 'Functional Spec Sign-off', stakeholder: 'Lisa Wang', status: 'Completed', dueDate: '2024-02-05' },
              { id: 'so8', role: 'Fiori/UI Guidelines Approval', stakeholder: 'Tom Harris', status: 'Completed', dueDate: '2024-02-04' }
            ],
            meetings: []
          }
        ]
      }
    ]
  },
  {
    id: 'ptp',
    name: 'Plan to Produce',
    type: 'process',
    status: 'in-scope',
    children: [
      {
        id: 'req-004',
        name: 'Production Planning Module',
        type: 'requirement',
        status: 'in-scope',
        requirementStatus: 'Active',
        priority: 'High',
        createdBy: 'Lisa Wilson',
        createdOn: '2024-01-25',
        phase: 'design',
        coverage: 'partial'
      }
    ]
  },
  {
    id: 'rtr',
    name: 'Record to Report',
    type: 'process',
    status: 'in-scope',
    children: [
      {
        id: 'req-005',
        name: 'Financial Reporting Dashboard',
        type: 'requirement',
        status: 'in-scope',
        requirementStatus: 'Approved',
        priority: 'Medium',
        createdBy: 'Emily Davis',
        createdOn: '2024-01-18',
        phase: 'release',
        coverage: 'full'
      }
    ]
  },
  {
    id: 'htr',
    name: 'Hire to Retire',
    type: 'process',
    status: 'in-scope',
    children: [
      {
        id: 'req-006',
        name: 'Employee Onboarding System',
        type: 'requirement',
        status: 'in-scope',
        requirementStatus: 'New',
        priority: 'Low',
        createdBy: 'Tom Brown',
        createdOn: '2024-01-30',
        phase: 'identify',
        coverage: 'none'
      }
    ]
  }
];

export default function RTMPage() {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<NavigationNode | null>(null);
  const [currentPath, setCurrentPath] = useState<NavigationNode[]>([]);
  const [tableData, setTableData] = useState<NavigationNode[]>(mockNavigationData);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'Req ID', 'Req Title', 'Type', 'Source Owner', 'Priority', 'Status'
  ]);

  // Get data to display in table based on selected folder
  const getTableDataForPath = (path: NavigationNode[]): NavigationNode[] => {
    if (path.length === 0) {
      return mockNavigationData;
    }

    let currentData = mockNavigationData;
    for (const pathNode of path) {
      const foundNode = currentData.find(node => node.id === pathNode.id);
      if (foundNode && foundNode.children) {
        currentData = foundNode.children;
      } else {
        return [];
      }
    }
    return currentData;
  };

  // Handle sidebar selection (both folders and files)
  const handleSidebarSelect = (node: NavigationNode) => {
    setSelectedNode(node);

    // If it's a folder, update table to show its children
    if (node.children) {
      // Build path to this node
      const buildPath = (targetNode: NavigationNode, nodes: NavigationNode[], path: NavigationNode[] = []): NavigationNode[] | null => {
        for (const currentNode of nodes) {
          const newPath = [...path, currentNode];
          if (currentNode.id === targetNode.id) {
            return newPath;
          }
          if (currentNode.children) {
            const result = buildPath(targetNode, currentNode.children, newPath);
            if (result) return result;
          }
        }
        return null;
      };

      const path = buildPath(node, mockNavigationData) || [];
      setCurrentPath(path);
      setTableData(node.children);
    } else {
      // If it's a file (no children), navigate to requirement detail
      navigate(`/requirement/${node.id}`);
    }
  };

  // Handle context change from sidebar (folder drilling)
  const handleContextChange = (context: NavigationNode | null) => {
    if (context) {
      // Build path to the context node
      const buildPath = (targetNode: NavigationNode, nodes: NavigationNode[], path: NavigationNode[] = []): NavigationNode[] | null => {
        for (const node of nodes) {
          const newPath = [...path, node];
          if (node.id === targetNode.id) {
            return newPath;
          }
          if (node.children) {
            const result = buildPath(targetNode, node.children, newPath);
            if (result) return result;
          }
        }
        return null;
      };

      const path = buildPath(context, mockNavigationData) || [];
      setCurrentPath(path);
      setTableData(getTableDataForPath(path));
    } else {
      setCurrentPath([]);
      setTableData(mockNavigationData);
    }
  };

  // Handle requirement selection from table
  const handleRequirementSelect = (node: NavigationNode) => {
    navigate(`/requirement/${node.id}`);
  };

  const handleViewChange = (view: string) => {
    console.log('View changed to:', view);
  };

  const handleColumnToggle = (column: string) => {
    setVisibleColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border">
        <FocusDrillSidebar
          data={mockNavigationData}
          onSelect={handleSidebarSelect}
          onOpenFinder={() => console.log('Open finder')}
          selectedId={selectedNode?.id || null}
          onContextChange={handleContextChange}
          externalPath={currentPath}
          onAddFolder={(data) => console.log('Add folder:', data)}
          onAddRequirement={(data) => console.log('Add requirement:', data)}
          onDataUpdate={(newData) => console.log('Data updated:', newData)}
          onNavigateToNewRequirement={() => navigate('/requirement/new')}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Filter Bar */}
        <FilterBar
          onViewChange={handleViewChange}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />

        {/* Table Content */}
        <div className="flex-1 p-4 overflow-auto">
          <RTMTreeTable
            data={tableData}
            onRequirementSelect={handleRequirementSelect}
          />
        </div>
      </div>
    </div>
  );
}