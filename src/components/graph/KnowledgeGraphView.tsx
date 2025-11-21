'use client';

import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { RefreshCw, Maximize2, Download, Info } from 'lucide-react';

interface GraphNode {
  id: string;
  title: string;
  type: string;
  size: number;
}

interface GraphEdge {
  source: string;
  target: string;
  strength: number;
  type: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    avgConnections: number;
  };
}

interface KnowledgeGraphViewProps {
  onNodeClick?: (nodeId: string) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  onNodeClick,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [stats, setStats] = useState({
    totalNodes: 0,
    totalEdges: 0,
    avgConnections: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchGraphData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/graph?limit=100&minStrength=0.5');

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to fetch graph data');
      }

      const data: GraphData = await response.json();

      // Transform data into React Flow format
      const flowNodes: Node[] = data.nodes.map((node, index) => {
        // Calculate node size based on connections
        const size = Math.max(60, Math.min(150, 60 + node.size * 10));

        // Assign colors based on note type
        const colorMap: Record<string, string> = {
          idea: '#FFB800', // Highlight amber
          research: '#3498DB', // Editorial blue
          interview: '#2ECC71', // Editorial green
          note: '#1A1A1A', // Ink
        };

        return {
          id: node.id,
          type: 'default',
          position: {
            x: Math.random() * 800,
            y: Math.random() * 600,
          },
          data: {
            label: (
              <div className="text-center px-2">
                <div className="font-crimson font-bold text-sm line-clamp-2">
                  {node.title}
                </div>
                <div className="text-xs text-ink/60 font-dm mt-1">
                  {node.size} connections
                </div>
              </div>
            ),
          },
          style: {
            background: colorMap[node.type] || '#1A1A1A',
            color: node.type === 'note' || node.type === 'idea' ? '#F5F1E8' : '#1A1A1A',
            border: `2px solid ${colorMap[node.type] || '#1A1A1A'}`,
            borderRadius: '8px',
            padding: '10px',
            width: size,
            height: size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        };
      });

      const flowEdges: Edge[] = data.edges.map((edge) => ({
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: edge.strength > 0.8,
        style: {
          stroke: edge.strength > 0.8 ? '#FFB800' : '#1A1A1A',
          strokeWidth: Math.max(1, edge.strength * 3),
          opacity: edge.strength,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edge.strength > 0.8 ? '#FFB800' : '#1A1A1A',
        },
        label: edge.strength > 0.9 ? 'Strong' : '',
        labelStyle: {
          fill: '#1A1A1A',
          fontSize: 10,
          fontFamily: 'var(--font-dm-sans)',
        },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClickInternal = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  const rebuildGraph = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/graph', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to rebuild graph');
      }

      // Refresh graph data
      await fetchGraphData();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const downloadGraph = () => {
    const graphData = {
      nodes: nodes.map((n) => ({ id: n.id, ...n.data })),
      edges: edges.map((e) => ({ source: e.source, target: e.target })),
    };

    const blob = new Blob([JSON.stringify(graphData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge-graph.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-highlight-amber border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink/60 font-dm">Building your knowledge graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-highlight-red/10 border border-highlight-red/30 rounded-sm p-6 text-center">
        <p className="text-highlight-red font-dm">{error}</p>
        <Button
          variant="outline"
          onClick={fetchGraphData}
          className="mt-4"
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-sm shadow-sm border border-ink/10 ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[600px]'}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClickInternal}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#E8E4DB" gap={16} />
        <Controls className="bg-white border border-ink/10 rounded-sm" />
        <MiniMap
          nodeColor={(node) => {
            return node.style?.background?.toString() || '#1A1A1A';
          }}
          className="bg-newsprint border border-ink/10 rounded-sm"
        />

        <Panel position="top-left" className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-ink/10 rounded-sm p-4 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-highlight-amber" />
              <h3 className="font-crimson font-bold text-lg text-ink">
                Story Connections
              </h3>
            </div>

            <div className="space-y-2 text-sm font-dm">
              <div className="flex justify-between">
                <span className="text-ink/60">Total Notes:</span>
                <span className="font-semibold text-ink">{stats.totalNodes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Connections:</span>
                <span className="font-semibold text-ink">{stats.totalEdges}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Avg. Links:</span>
                <span className="font-semibold text-ink">
                  {stats.avgConnections.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-ink/10">
              <p className="text-xs text-ink/50 font-dm mb-2">Legend:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-highlight-amber"></div>
                  <span className="text-xs font-dm">Ideas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-editorial-blue"></div>
                  <span className="text-xs font-dm">Research</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-editorial-green"></div>
                  <span className="text-xs font-dm">Interviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-ink"></div>
                  <span className="text-xs font-dm">Notes</span>
                </div>
              </div>
            </div>
          </motion.div>
        </Panel>

        <Panel position="top-right" className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            icon={<Maximize2 className="w-4 h-4" />}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={rebuildGraph}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Rebuild
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadGraph}
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};
