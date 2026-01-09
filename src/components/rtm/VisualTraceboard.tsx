import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    Connection,
    Edge,
    Node,
    NodeProps,
    Handle,
    Position,
    MarkerType,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Undo, Redo, ZoomIn, ZoomOut, Maximize, Save,
    FileText, CheckSquare, TestTube, CheckCircle, Diamond, StickyNote,
    X, Briefcase, Target, Square, AlertCircle, Trash2,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- Types ---
type NodeType = 'requirement' | 'task' | 'test' | 'signoff' | 'issue' | 'decision' | 'note' | 'businessProcess' | 'scope' | 'empty';

interface TraceNodeData {
    label: string;
    type: NodeType;
    status: string;
    description: string;
    owner: string;
    id: string; // Internal ID for logic, not display
}

// --- Mock Data ---
const initialNodes: Node<TraceNodeData>[] = [];
const initialEdges: Edge[] = [];

let idGenerator = 0;
const getId = () => `dndnode_${idGenerator++}`;

// --- Helper: Status Options ---
const getStatusOptions = (type: NodeType): string[] => {
    const common = ['New', 'Active', 'Completed', 'Approved'];
    switch (type) {
        case 'test': return ['New', 'Active', 'Performed', 'Approved', 'Defect Found'];
        case 'issue': return ['New', 'Active', 'Resolved', 'Approved'];
        case 'signoff': return ['New', 'Active', 'Approved', 'Rejected', 'Completed'];
        default: return common;
    }
};

const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'new') return 'bg-blue-500';
    if (s === 'active') return 'bg-amber-500';
    if (s === 'completed' || s === 'resolved' || s === 'performed') return 'bg-green-500';
    if (s === 'approved') return 'bg-purple-500';
    if (s === 'rejected' || s === 'defect found') return 'bg-red-500';
    return 'bg-gray-300';
};

// --- Custom Node ---
const CustomNode = ({ id, data, selected }: NodeProps<TraceNodeData>) => {
    const { setNodes } = useReactFlow();

    const getBorderColor = (type: NodeType) => {
        switch (type) {
            case 'scope': return 'border-pink-500';
            case 'businessProcess': return 'border-indigo-500';
            case 'requirement': return 'border-blue-500';
            case 'task': return 'border-green-500';
            case 'test': return 'border-purple-500';
            case 'signoff': return 'border-teal-500';
            case 'issue': return 'border-red-500';
            case 'decision': return 'border-orange-500'; // Full border for diamond
            case 'note': return 'border-yellow-400';
            case 'empty': return 'border-gray-400';
            default: return 'border-gray-200';
        }
    };

    const getIcon = (type: NodeType) => {
        switch (type) {
            case 'scope': return <Target className="w-3 h-3 text-pink-500" />;
            case 'businessProcess': return <Briefcase className="w-3 h-3 text-indigo-500" />;
            case 'requirement': return <FileText className="w-3 h-3 text-blue-500" />;
            case 'task': return <CheckSquare className="w-3 h-3 text-green-500" />;
            case 'test': return <TestTube className="w-3 h-3 text-purple-500" />;
            case 'signoff': return <CheckCircle className="w-3 h-3 text-teal-500" />;
            case 'issue': return <AlertCircle className="w-3 h-3 text-red-500" />;
            case 'decision': return <Diamond className="w-3 h-3 text-orange-500" />;
            case 'note': return <StickyNote className="w-3 h-3 text-yellow-500" />;
            case 'empty': return <Square className="w-3 h-3 text-gray-500" />;
            default: return null;
        }
    };

    const isDiamond = data.type === 'decision';
    const isRawNode = data.type === 'empty' || data.type === 'note';

    if (isRawNode) {
        let containerClasses = `relative px-2 py-2 min-w-[150px] min-h-[80px] rounded-md border shadow-sm ${selected ? 'ring-2 ring-primary' : ''}`;

        if (data.type === 'note') {
            containerClasses += ' bg-yellow-100 border border-yellow-300';
        } else {
            containerClasses += ` bg-white border ${getBorderColor(data.type)}`;
        }

        return (
            <div className={containerClasses}>
                <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-muted-foreground" />
                <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-muted-foreground" />

                <div className="flex flex-col h-full w-full">
                    <textarea
                        className="w-full flex-1 bg-transparent resize-none border-none focus:outline-none text-xs text-foreground p-0 leading-tight font-medium"
                        value={data.label}
                        placeholder={data.type === 'note' ? "Type note..." : "Type content..."}
                        onChange={(evt) => {
                            setNodes((nodes) => nodes.map(n => {
                                if (n.id === id) {
                                    return { ...n, data: { ...n.data, label: evt.target.value } };
                                }
                                return n;
                            }));
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div className={`relative group ${isDiamond ? 'w-24 h-24 rotate-45 flex items-center justify-center bg-orange-50 border' : 'px-3 py-2 min-w-[150px] bg-white rounded-md border shadow-sm'} ${getBorderColor(data.type)} ${selected ? 'ring-2 ring-primary' : ''}`}>
                        {/* Handles */}
                        <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-muted-foreground" />
                        <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-muted-foreground" />

                        {/* Content */}
                        <div className={isDiamond ? '-rotate-45 text-center' : 'flex items-center gap-2'}>
                            {!isDiamond && getIcon(data.type)}
                            <div className="flex-1 overflow-hidden">
                                <div className="text-xs font-semibold truncate">{data.label}</div>
                                {/* Removed Item ID Render as requested */}
                            </div>
                        </div>

                        {/* Status Indicator (Dot) */}
                        <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white ${getStatusColor(data.status)}`} />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="w-64 p-0">
                    <div className="p-3 bg-popover rounded-md border border-border shadow-md space-y-2">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <span className="font-semibold text-sm">{data.label}</span>
                            <Badge variant="outline" className="text-[10px] h-5">{data.status}</Badge>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{data.description}</div>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-border mt-2">
                            <span className="text-[10px] uppercase text-muted-foreground">Owner:</span>
                            <span className="text-xs font-medium">{data.owner}</span>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

// --- Components ---

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const draggables: { type: NodeType; label: string; icon: React.ReactNode; color: string }[] = [
        { type: 'scope', label: 'Scope', icon: <Target className="w-4 h-4" />, color: 'bg-pink-100 border-pink-300' },
        { type: 'businessProcess', label: 'Business Process', icon: <Briefcase className="w-4 h-4" />, color: 'bg-indigo-100 border-indigo-300' },
        { type: 'requirement', label: 'Requirement', icon: <FileText className="w-4 h-4" />, color: 'bg-blue-100 border-blue-300' },
        { type: 'task', label: 'Task', icon: <CheckSquare className="w-4 h-4" />, color: 'bg-green-100 border-green-300' },
        { type: 'test', label: 'Test Case', icon: <TestTube className="w-4 h-4" />, color: 'bg-purple-100 border-purple-300' },
        { type: 'signoff', label: 'Signoff', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-teal-100 border-teal-300' },
        { type: 'issue', label: 'Issue', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-red-100 border-red-300' },
        { type: 'decision', label: 'Decision', icon: <Diamond className="w-4 h-4" />, color: 'bg-orange-100 border-orange-300' },
        { type: 'note', label: 'Note', icon: <StickyNote className="w-4 h-4" />, color: 'bg-yellow-100 border-yellow-300' },
        { type: 'empty', label: 'Empty Node', icon: <Square className="w-4 h-4" />, color: 'bg-gray-100 border-gray-300' },
    ];

    if (!isOpen) {
        return (
            <div className="h-full border-r border-border bg-background flex flex-col items-center pt-2 w-10 transition-all duration-300 ease-in-out">
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(true)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Expand Palette</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        )
    }

    return (
        <Card className="w-60 h-full border-r border-border rounded-none shadow-none bg-background flex flex-col relative transition-all duration-300 ease-in-out">
            <div className="absolute right-2 top-2 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </div>

            <div className="p-4 border-b border-border">
                <div className="font-medium text-sm text-foreground">Shape Palette</div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 flex flex-col gap-3">
                    {draggables.map((item) => (
                        <div
                            key={item.type}
                            className={`flex items-center gap-3 p-3 rounded-md border cursor-grab hover:shadow-sm transition-all ${item.color}`}
                            onDragStart={(event) => onDragStart(event, item.type)}
                            draggable
                        >
                            {item.icon}
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t border-border mt-auto">
                <div className="p-3 bg-muted/50 rounded text-xs text-muted-foreground">
                    Tip: Drag shapes to the canvas to start mapping.
                </div>
            </div>
        </Card>
    );
};

interface PropertiesPanelProps {
    node: Node<TraceNodeData> | null;
    onClose: () => void;
    onUpdate: (id: string, data: Partial<TraceNodeData>) => void;
    takeSnapshot: () => void;
}

const PropertiesPanel = ({ node, onClose, onUpdate, takeSnapshot }: PropertiesPanelProps) => {
    if (!node || node.data.type === 'empty' || node.data.type === 'note') return null;

    const handleChange = (field: keyof TraceNodeData, value: string) => {
        takeSnapshot();
        onUpdate(node.id, { [field]: value });
    };

    const statusOptions = getStatusOptions(node.data.type);

    return (
        <Card className="w-80 h-full p-0 border-l border-border rounded-none shadow-none bg-background flex flex-col absolute right-0 top-0 z-10">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-medium text-sm">Properties</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
            <ScrollArea className="flex-1 px-4 pb-4 pt-0 space-y-6">
                <div className="space-y-4">

                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase">Title</label>
                        <Input
                            value={node.data.label}
                            onChange={(e) => handleChange('label', e.target.value)}
                            className="mt-1 h-8"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase">Type</label>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="capitalize">{node.data.type}</Badge>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase">Owner</label>
                        <Input
                            value={node.data.owner}
                            onChange={(e) => handleChange('owner', e.target.value)}
                            className="mt-1 h-8"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase">Description</label>
                        <Textarea
                            value={node.data.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="mt-1 min-h-[100px] text-sm"
                        />
                    </div>
                </div>
            </ScrollArea>
        </Card>
    );
};

const TraceboardContent = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [selectedNode, setSelectedNode] = useState<Node<TraceNodeData> | null>(null);

    // Undo/Redo State
    const [past, setPast] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);
    const [future, setFuture] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);

    // Function to save history snapshot
    const takeSnapshot = useCallback(() => {
        setPast((old) => [...old, { nodes, edges }]);
        setFuture([]);
    }, [nodes, edges]);

    const undo = useCallback(() => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);

        setFuture(old => [{ nodes, edges }, ...old]);
        setPast(newPast);
        setNodes(previous.nodes);
        setEdges(previous.edges);
    }, [past, nodes, edges, setNodes, setEdges]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);

        setPast(old => [...old, { nodes, edges }]);
        setFuture(newFuture);
        setNodes(next.nodes);
        setEdges(next.edges);
    }, [future, nodes, edges, setNodes, setEdges]);

    // Key press for undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                if (e.shiftKey) redo();
                else undo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    const onConnect = useCallback((params: Connection) => {
        takeSnapshot();
        setEdges((eds) => addEdge({ ...params, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } }, eds));
    }, [setEdges, takeSnapshot]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onNodeDragStart = useCallback(() => {
        takeSnapshot(); // Save state before moving
    }, [takeSnapshot]);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            takeSnapshot(); // Save before adding

            if (reactFlowWrapper.current && reactFlowInstance) {
                const type = event.dataTransfer.getData('application/reactflow') as NodeType;
                if (typeof type === 'undefined' || !type) return;

                const position = reactFlowInstance.screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                });

                // Smart Numbering
                const currentCount = nodes.filter(n => n.data.type === type).length;
                const number = currentCount + 1;

                const newNode: Node<TraceNodeData> = {
                    id: getId(),
                    type: 'custom',
                    position,
                    data: {
                        // Label based on type without numbering
                        label: (type === 'empty' || type === 'note') ? '' : `${type.charAt(0).toUpperCase() + type.slice(1)}`,
                        type: type,
                        status: 'New',
                        description: (type === 'empty' || type === 'note') ? '' : 'Created via drag and drop.',
                        owner: 'Current User',
                        id: `ITEM-${1000 + idGenerator}` // Mock ID
                    },
                };

                setNodes((nds) => nds.concat(newNode));
            }
        },
        [reactFlowInstance, setNodes, nodes, takeSnapshot]
    );

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        // Cast to Node<TraceNodeData>
        setSelectedNode(node as Node<TraceNodeData>);
    };

    const onPaneClick = () => {
        setSelectedNode(null);
    };

    const updateNodeData = (id: string, newData: Partial<TraceNodeData>) => {
        // Snapshot is taken inside properties panel before change
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                const updatedNode = {
                    ...node,
                    data: { ...node.data, ...newData }
                };
                if (selectedNode?.id === id) {
                    setSelectedNode(updatedNode as Node<TraceNodeData>);
                }
                return updatedNode;
            }
            return node;
        }));
    };

    const deleteSelectedNode = () => {
        if (selectedNode) {
            takeSnapshot();
            setNodes((nds) => nds.filter(n => n.id !== selectedNode.id));
            setSelectedNode(null);
        }
    };

    // Autosave mock
    useEffect(() => {
        const interval = setInterval(() => {
            // console.log('Autosaving Traceboard...');
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full w-full bg-background border rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="h-12 border-b border-border bg-background flex items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={past.length === 0}>
                                    <Undo className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={future.length === 0}>
                                    <Redo className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <div className="h-4 w-px bg-border mx-2" />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => reactFlowInstance?.zoomIn()}><ZoomIn className="h-4 w-4" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Zoom In</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => reactFlowInstance?.zoomOut()}><ZoomOut className="h-4 w-4" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Zoom Out</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => reactFlowInstance?.fitView()}><Maximize className="h-4 w-4" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Fit View</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <div className="h-4 w-px bg-border mx-2" />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 hover:bg-red-50" onClick={deleteSelectedNode} disabled={!selectedNode}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Selected</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground mr-2">Last saved: Just now</span>
                    <Button size="sm" className="h-8 gap-2">
                        <Save className="h-3.5 w-3.5" />
                        Save Diagram
                    </Button>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex relative overflow-hidden">
                <Sidebar />

                <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        onNodeDragStart={onNodeDragStart} // Capture state before drag
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        fitView
                        attributionPosition="bottom-right"
                        snapToGrid
                        deleteKeyCode={["Backspace", "Delete"]} // Enable native delete
                        onNodesDelete={() => takeSnapshot()} // Snapshot before/during delete if triggered natively
                    >
                        <Controls />
                        <MiniMap />
                        <Background gap={12} size={1} />
                    </ReactFlow>
                    {selectedNode && (
                        <PropertiesPanel
                            node={selectedNode}
                            onClose={() => setSelectedNode(null)}
                            onUpdate={updateNodeData}
                            takeSnapshot={takeSnapshot}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default function VisualTraceboard() {
    return (
        <ReactFlowProvider>
            <TraceboardContent />
        </ReactFlowProvider>
    );
}
