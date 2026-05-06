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
import "./layoutFlow.css";
import { Drawer, Pill, Progress, Text } from "@mantine/core";
import { CheckIcon } from "@phosphor-icons/react";
import { classType } from "../../misc/utils.js";
import { Link } from "@tanstack/react-router";
import { useDispatch } from "react-redux";
import { setSelectedCourse } from "../../hooks/useCourse.js";

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

export const LayoutFlow = ({ opened, close }) => {
  const dispatch = useDispatch();
  const { fitView } = useReactFlow();
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [activeDirection, setActiveDirection] = useState("DOWN");
  const [notifications, setNotifications] = useState([]);

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
    const isCore =
      classType(node.id) === "Core" ||
      node.data.label.toLowerCase().includes("capstone");
    const isElective = classType(node.id) === "Elective";
    const alreadyTaken = node.taken;

    if (!alreadyTaken) {
      if (isCore && takenCore >= 12) return;
      if (isElective && takenElectives >= 3) return;
    }

    const nowTaken = !node.taken;
    setNodes((prev) =>
      prev.map((n) => (n.id === node.id ? { ...n, taken: nowTaken } : n))
    );
    if (nowTaken) {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, label: node.data?.label }]);
      setTimeout(() => setNotifications((prev) => prev.filter((t) => t.id !== id)), 3000);
    }
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
      className="layout-flow"
    >
      <div className="absolute top-5 md:top-[-15px] right-0 p-4">
        <div className="layout-buttons">
          {[
            { label: "Horizontal Layout", direction: "DOWN" },
            { label: "Vertical Layout", direction: "RIGHT" },
          ].map(({ label, direction }) => {
            const isActive = activeDirection === direction;
            return (
              <button
                key={direction}
                className={`layout-btn${isActive ? " layout-btn--active" : ""}`}
                onClick={() => {
                  setActiveDirection(direction);
                  onLayout({ direction });
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-row gap-2 justify-center pills-row">
        <Pill size="lg">
          Core ({takenCore} / {12})
        </Pill>
        <Pill size="lg">
          Elective ({takenElectives} / {3})
        </Pill>
        <Pill size="lg">
          Total ({takenCore * 4 + takenElectives * 4} / {60})
        </Pill>
      </div>
      <Background />

      <div className="toast-container">
        {notifications.map((t) => (
          <div key={t.id} className="toast-item toast-notification">
            <span className="toast-icon">
              <CheckIcon size={14} weight="bold" />
            </span>
            <div>
              <p className="toast-title">Course Added</p>
              <p className="toast-message">{t.label} marked as taken</p>
            </div>
          </div>
        ))}
      </div>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="sm"
        title={<span className="font-black text-gray-900">Degree Planner</span>}
      >
        <div className="flex flex-col gap-6">

          {/* Summary pills */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Core", taken: takenCore, total: 12 },
              { label: "Elective", taken: takenElectives, total: 3 },
              { label: "Credits", taken: takenCore * 4 + takenElectives * 4, total: 60 },
            ].map(({ label, taken, total }) => (
              <div key={label} className="flex flex-col items-center bg-gray-50 border border-gray-100 rounded-xl py-3 px-2">
                <span className="text-xs text-gray-400 font-medium mb-1">{label}</span>
                <span className="text-lg font-black text-gray-900">{taken}</span>
                <span className="text-[10px] text-gray-400">/ {total}</span>
              </div>
            ))}
          </div>

          {/* Core section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900">Core Classes</span>
              <span className="text-xs text-gray-400">{takenCore} / 12</span>
            </div>
            <Progress value={percentCore} size="sm" color="#d73f09" radius="xl" mb="sm" />
            <div className="flex flex-col gap-1.5">
              {coreNodes.map((node) => (
                <Link
                  key={node.id}
                  to="/reviews"
                  onClick={() => dispatch(setSelectedCourse(`CS ${node.data?.label}`))}
                  className="no-underline"
                >
                  <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 border transition-all duration-150 ${
                    node.taken
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-100 hover:bg-orange-50 hover:border-orange-100"
                  }`}>
                    <span className={`text-sm font-semibold ${node.taken ? "text-green-700" : "text-gray-800"}`}>
                      {node.data?.label}
                    </span>
                    {node.taken && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Done</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Electives section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900">Electives</span>
              <span className="text-xs text-gray-400">{takenElectives} / 3</span>
            </div>
            <Progress value={percentElectives} size="sm" color="#f28705" radius="xl" mb="sm" />
            <div className="flex flex-col gap-1.5">
              {electiveNodes.map((node) => (
                <Link
                  key={node.id}
                  to="/reviews"
                  onClick={() => dispatch(setSelectedCourse(`CS ${node.data?.label}`))}
                  className="no-underline"
                >
                  <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 border transition-all duration-150 ${
                    node.taken
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-100 hover:bg-orange-50 hover:border-orange-100"
                  }`}>
                    <span className={`text-sm font-semibold ${node.taken ? "text-green-700" : "text-gray-800"}`}>
                      {node.data?.label}
                    </span>
                    {node.taken && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Done</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </Drawer>
    </ReactFlow>
  );
};

export const LayoutFlowWithProvider = ({ opened, open, close }) => (
  <ReactFlowProvider>
    <LayoutFlow opened={opened} open={open} close={close} />
  </ReactFlowProvider>
);
