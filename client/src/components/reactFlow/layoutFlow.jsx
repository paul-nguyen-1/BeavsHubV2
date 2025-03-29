import { initialNodes, initialEdges } from "./initialElements.js";
import ELK from "elkjs/lib/elk.bundled.js";
import React, { useCallback, useState, useLayoutEffect } from "react";
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const elk = new ELK();

const elkOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
};

const getConnectedNodes = (nodeId, edges) => {
  const prerequisites = new Set();
  const unlocks = new Set();

  edges.forEach(({ source, target }) => {
    if (source === nodeId) unlocks.add(target);
    if (target === nodeId) prerequisites.add(source);
  });

  return { prerequisites, unlocks };
};

const getHighlightedNodes = (nodes, edges, hoveredNodeId) => {
  if (!hoveredNodeId) {
    return nodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        backgroundColor: "#FFFFFF",
        borderColor: "#000000",
      },
    }));
  }

  const { prerequisites, unlocks } = getConnectedNodes(hoveredNodeId, edges);

  return nodes.map((node) => {
    if (node.id === hoveredNodeId) {
      // Source Node
      return {
        ...node,
        style: {
          ...node.style,
          backgroundColor: "#D73F09",
          borderColor: "#A32A00",
          color: "#FFFFFF",
        },
      };
    } else if (prerequisites.has(node.id)) {
      // Highlight prerequisites
      return {
        ...node,
        style: {
          ...node.style,
          backgroundColor: "#F4A261",
          borderColor: "#E76F51",
          color: "#000000",
        },
      };
    } else if (unlocks.has(node.id)) {
      // Highlight unlocked courses
      return {
        ...node,
        style: {
          ...node.style,
          backgroundColor: "#A3E635",
          borderColor: "#4CAF50",
          color: "#000000",
        },
      };
    } else {
      // Default
      return {
        ...node,
        style: {
          ...node.style,
          backgroundColor: "#FFFFFF",
          borderColor: "#000000",
        },
      };
    }
  });
};

const getLayoutedElements = (nodes, edges, options = {}) => {
  const isHorizontal = options?.["elk.direction"] === "RIGHT";
  const graph = {
    id: "root",
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      width: 300,
      height: 150,
      style: {
        border: "2.5px solid #000",
        color: "#000000",
        borderRadius: "10px",
        fontSize: "20px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    })),
    edges: edges,
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        position: { x: node.x, y: node.y },
      })),
      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

export const LayoutFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const { fitView } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }) => {
      const opts = { "elk.direction": direction, ...elkOptions };
      const ns = useInitialNodes ? initialNodes : nodes;
      const es = useInitialNodes ? initialEdges : edges;

      getLayoutedElements(ns, es, opts).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          window.requestAnimationFrame(() => fitView());
        }
      );
    },
    [nodes, edges]
  );

  useLayoutEffect(() => {
    onLayout({ direction: "DOWN", useInitialNodes: true });
  }, []);

  const handleNodeMouseEnter = (event, node) => {
    setHoveredNodeId(node.id);
  };

  const handleNodeMouseLeave = () => {
    setHoveredNodeId(null);
  };

  const highlightedNodes = getHighlightedNodes(nodes, edges, hoveredNodeId);

  return (
    <ReactFlow
      nodes={highlightedNodes}
      edges={edges}
      onConnect={onConnect}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      panOnScroll
      selectionOnDrag
      minZoom={0.1}
      onNodeMouseEnter={handleNodeMouseEnter}
      onNodeMouseLeave={handleNodeMouseLeave}
      style={{ backgroundColor: "transparent", height: "100%", width: "100%" }}
    >
      <Panel position="top-right">
        <div className="flex space-x-2 gap-2">
          <button
            className="px-4 py-2 bg-[#d73f09] text-white text-sm font-medium rounded-lg shadow-md hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-75 transition cursor-pointer"
            onClick={() => onLayout({ direction: "DOWN" })}
          >
            Vertical Layout
          </button>

          <button
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg shadow-md hover:opacity-55 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-75 transition cursor-pointer"
            onClick={() => onLayout({ direction: "RIGHT" })}
          >
            Horizontal Layout
          </button>
        </div>
      </Panel>
      <Background />
    </ReactFlow>
  );
};

export const LayoutFlowWithProvider = () => (
  <ReactFlowProvider>
    <LayoutFlow />
  </ReactFlowProvider>
);
