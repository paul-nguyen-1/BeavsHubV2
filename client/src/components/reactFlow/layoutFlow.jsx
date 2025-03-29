import { initialNodes, initialEdges } from "./initialElements.js";
import ELK from "elkjs/lib/elk.bundled.js";
import React, {
  useCallback,
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
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
import { useDisclosure } from "@mantine/hooks";
import { Drawer, Progress } from "@mantine/core";
import { classType } from "../../misc/utils.js";

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
    return nodes.map((node) => {
      if (node.taken) {
        return {
          ...node,
          style: {
            ...node.style,
            backgroundColor: "#A3E635",
            borderColor: "#4CAF50",
            color: "#000000",
          },
        };
      }
      return {
        ...node,
        style: {
          ...node.style,
          backgroundColor: "#FFFFFF",
          borderColor: "#000000",
        },
      };
    });
  }
  const { prerequisites, unlocks } = getConnectedNodes(hoveredNodeId, edges);
  return nodes.map((node) => {
    if (node.id === hoveredNodeId) {
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
      return {
        ...node,
        style: {
          ...node.style,
          backgroundColor: "#A3E635",
          borderColor: "#4CAF50",
          color: "#000000",
        },
      };
    } else if (node.taken) {
      return {
        ...node,
        style: {
          ...node.style,
          backgroundColor: "#A3E635",
          borderColor: "#4CAF50",
          color: "#000000",
        },
      };
    }
    return {
      ...node,
      style: {
        ...node.style,
        backgroundColor: "#FFFFFF",
        borderColor: "#000000",
      },
    };
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
  const [opened, { open, close }] = useDisclosure(false);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  const onConnect = useCallback(
    (params) => setEdges((existingEdges) => addEdge(params, existingEdges)),
    []
  );

  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }) => {
      const layoutOptions = { "elk.direction": direction, ...elkOptions };
      const nodeSource = useInitialNodes ? initialNodes : nodes;
      const edgeSource = useInitialNodes ? initialEdges : edges;
      getLayoutedElements(nodeSource, edgeSource, layoutOptions).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          window.requestAnimationFrame(() => fitView());
        }
      );
    },
    [nodes, edges, fitView, setNodes, setEdges]
  );

  useLayoutEffect(() => {
    const options = { "elk.direction": "DOWN", ...elkOptions };
    getLayoutedElements(initialNodes, initialEdges, options).then(
      ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        window.requestAnimationFrame(() => fitView());
      }
    );
  }, [fitView, setNodes, setEdges]);

  const handleNodeMouseEnter = (event, node) => {
    setCurrentNodeId(node.id);
  };

  const handleNodeMouseLeave = () => {
    setCurrentNodeId(null);
  };

  const handleNodeClick = (event, node) => {
    setNodes((previousNodes) => {
      const updatedNodes = previousNodes.map((existingNode) =>
        existingNode.id === node.id
          ? { ...existingNode, taken: !existingNode.taken }
          : existingNode
      );
      return updatedNodes;
    });
    open();
  };

  const coreNodes = nodes.filter((node) => classType(node.id) === "Core");
  const electiveNodes = nodes.filter(
    (node) => classType(node.id) === "Elective"
  );
  const takenCore = coreNodes.filter((node) => node.taken).length;
  const takenElectives = electiveNodes.filter((node) => node.taken).length;
  const percentCore = coreNodes.length
    ? Math.round((takenCore / coreNodes.length) * 100)
    : 0;
  const percentElectives = electiveNodes.length
    ? Math.round((takenElectives / electiveNodes.length) * 100)
    : 0;
  const highlightedNodes = getHighlightedNodes(nodes, edges, currentNodeId);

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
      onNodeClick={handleNodeClick}
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
      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        title="Degree Planner"
      >
        <div style={{ padding: "1rem" }}>
          <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
            Core Classes
          </h3>
          <Progress value={percentCore} size="lg" color="orange" radius="xl" />
          <p style={{ marginTop: "0.5rem" }}>
            {takenCore} of {coreNodes.length} taken ({percentCore}%)
          </p>
          <div style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
            {coreNodes.map((node) => (
              <div
                key={node.id}
                className={`
                  px-3 py-2 mb-1 rounded-lg 
                  ${
                    node.taken
                      ? "bg-lime-400 font-bold text-[#1a1a1a] border-[#4caf50]"
                      : "bg-gray-100 font-normal text-gray-500"
                  }
                `}
              >
                {node.data?.label}
              </div>
            ))}
          </div>
          <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
            Electives
          </h3>
          <Progress
            value={percentElectives}
            size="lg"
            color="orange"
            radius="xl"
          />
          <p style={{ marginTop: "0.5rem" }}>
            {takenElectives} of {electiveNodes.length} taken ({percentElectives}
            %)
          </p>
          <div style={{ marginTop: "0.5rem" }}>
            {electiveNodes.map((node) => (
              <div
                key={node.id}
                className={`
                  px-3 py-2 mb-1 rounded-lg
                  ${
                    node.taken
                      ? "bg-lime-400 font-bold text-[#1a1a1a] border-1 border-[#4caf50]"
                      : "bg-gray-100 font-normal text-gray-500 border border-gray-300"
                  }
                `}
              >
                {node.data?.label}
              </div>
            ))}
          </div>
        </div>
      </Drawer>
    </ReactFlow>
  );
};

export const LayoutFlowWithProvider = () => (
  <ReactFlowProvider>
    <LayoutFlow />
  </ReactFlowProvider>
);
