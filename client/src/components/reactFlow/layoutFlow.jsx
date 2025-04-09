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
import { Drawer, Pill, Progress } from "@mantine/core";
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
            backgroundColor: "#A3E635",
            borderColor: "#4CAF50",
            fontSize: "24px",
          },
        };
      }
      return {
        ...node,
        style: {
          backgroundColor: "#FFFFFF",
          borderColor: "#000000",
          fontSize: "24px",
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
          backgroundColor: "#D73F09",
          borderColor: "#A32A00",
          fontSize: "24px",
        },
      };
    } else if (prerequisites.has(node.id)) {
      return {
        ...node,
        style: {
          backgroundColor: "#F4A261",
          borderColor: "#E76F51",
          fontSize: "24px",
        },
      };
    } else if (unlocks.has(node.id)) {
      return {
        ...node,
        style: {
          backgroundColor: "#A3E635",
          borderColor: "#4CAF50",
          fontSize: "24px",
        },
      };
    } else if (node.taken) {
      return {
        ...node,
        style: {
          backgroundColor: "#A3E635",
          borderColor: "#4CAF50",
          fontSize: "24px",
        },
      };
    }
    return {
      ...node,
      style: {
        backgroundColor: "#FFFFFF",
        borderColor: "#000000",
        fontSize: "24px",
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
    edges,
  };
  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children.map((n) => ({
        ...n,
        position: { x: n.x, y: n.y },
      })),
      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

export const LayoutFlow = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const { fitView } = useReactFlow();
  const [currentNodeId, setCurrentNodeId] = useState(null);

  const storedNodes = localStorage.getItem("flowNodes");
  const storedEdges = localStorage.getItem("flowEdges");
  let initialNodesList = [];
  let initialEdgesList = [];
  if (storedNodes) {
    try {
      initialNodesList = JSON.parse(storedNodes);
    } catch {
      initialNodesList = [];
    }
  }
  if (storedEdges) {
    try {
      initialEdgesList = JSON.parse(storedEdges);
    } catch {
      initialEdgesList = [];
    }
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesList);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdgesList);

  const onConnect = useCallback(
    (params) => setEdges((prevEdges) => addEdge(params, prevEdges)),
    []
  );

  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }) => {
      const layoutOptions = { "elk.direction": direction, ...elkOptions };
      const nodeSource = useInitialNodes ? initialNodes : nodes;
      const edgeSource = useInitialNodes ? initialEdges : edges;
      getLayoutedElements(nodeSource, edgeSource, layoutOptions).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
          const resetStyles = getHighlightedNodes(
            layoutedNodes,
            layoutedEdges,
            null
          );
          setNodes(resetStyles);
          setEdges(layoutedEdges);
          window.requestAnimationFrame(() => fitView());
        }
      );
    },
    [nodes, edges, fitView, setNodes, setEdges]
  );

  useLayoutEffect(() => {
    if (!storedNodes || !storedEdges) {
      const opts = { "elk.direction": "DOWN", ...elkOptions };
      getLayoutedElements(initialNodes, initialEdges, opts).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
          const resetStyles = getHighlightedNodes(
            layoutedNodes,
            layoutedEdges,
            null
          );
          setNodes(resetStyles);
          setEdges(layoutedEdges);
          window.requestAnimationFrame(() => fitView());
        }
      );
    } else {
      const resetStyles = getHighlightedNodes(nodes, edges, null);
      setNodes(resetStyles);
      window.requestAnimationFrame(() => fitView());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("flowNodes", JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem("flowEdges", JSON.stringify(edges));
  }, [edges]);

  const handleNodeMouseEnter = (event, node) => {
    setNodes((prev) => getHighlightedNodes(prev, edges, node.id));
    setCurrentNodeId(node.id);
  };

  const handleNodeMouseLeave = () => {
    setNodes((prev) => getHighlightedNodes(prev, edges, null));
    setCurrentNodeId(null);
  };

  const handleNodeClick = (event, node) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === node.id ? { ...n, taken: !n.taken } : n))
    );
    open();
  };

  const coreNodes = nodes.filter(
    (n) =>
      classType(n.id) === "Core" ||
      n.data.label.toLowerCase().includes("capstone")
  );

  const electiveNodes = nodes.filter((n) => classType(n.id) === "Elective");
  const takenCore = coreNodes.filter((n) => n.taken).length;
  const takenElectives = electiveNodes.filter((n) => n.taken).length;
  const percentCore = coreNodes.length
    ? Math.round((takenCore / coreNodes.length) * 100)
    : 0;
  const percentElectives = electiveNodes.length
    ? Math.round((takenElectives / electiveNodes.length) * 100)
    : 0;

  return (
    <ReactFlow
      nodes={nodes}
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
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            style={{
              padding: "0.5rem",
              backgroundColor: "#d73f09",
              color: "#fff",
            }}
            className="cursor-pointer"
            onClick={() => onLayout({ direction: "DOWN" })}
          >
            Vertical Layout
          </button>
          <button
            style={{
              padding: "0.5rem",
              backgroundColor: "#fff",
              color: "#000",
              border: "1px solid black",
            }}
            className="cursor-pointer"
            onClick={() => onLayout({ direction: "RIGHT" })}
          >
            Horizontal Layout
          </button>
        </div>
      </Panel>
      <Panel position="top-center" className="flex gap-2">
        <Pill size="lg">
          Core ({takenCore} / {12})
        </Pill>
        <Pill size="lg">
          Elective ({takenElectives} / {3})
        </Pill>
        <Pill size="lg">
          Total ({takenCore * 4 + takenElectives * 4} / {60})
        </Pill>
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
                style={{
                  padding: "0.5rem",
                  marginBottom: "0.25rem",
                  borderRadius: "0.5rem",
                  backgroundColor: node.taken ? "#bef264" : "#f3f3f3",
                }}
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
                style={{
                  padding: "0.5rem",
                  marginBottom: "0.25rem",
                  borderRadius: "0.5rem",
                  backgroundColor: node.taken ? "#bef264" : "#f3f3f3",
                }}
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
