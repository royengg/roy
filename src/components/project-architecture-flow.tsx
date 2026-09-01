"use client";

import { useEffect, useMemo, useState } from "react";
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs/lib/elk-api";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import type {
  ProjectSystemDesign,
  SystemDesignNode,
  SystemDesignNote,
} from "@/data/project-system-design";

export type ArchitectureVariant = "overview" | "high-level" | "frontend" | "backend";

type ArchitectureNodeData = {
  architecture: SystemDesignNode;
  label?: string;
};

type DecisionNodeData = {
  index: number;
  note: SystemDesignNote;
};

type ArchitectureNode = Node<ArchitectureNodeData, "architecture">;
type DecisionNode = Node<DecisionNodeData, "decision">;
type DiagramNode = ArchitectureNode | DecisionNode;
type DiagramEdge = Edge<{ label?: string; quiet?: boolean }, "architecture">;

type GraphSpec = {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

type LaidOutGraph = GraphSpec & {
  width: number;
  height: number;
};

const elk = new ELK();

const roleLabels: Record<SystemDesignNode["role"], string> = {
  client: "client",
  service: "service",
  worker: "async / compute",
  data: "durable state",
  external: "external system",
};

const architectureNodeSize = { width: 216, height: 112 };
const decisionNodeSize = { width: 228, height: 104 };

function ArchitectureCard({ data }: NodeProps<ArchitectureNode>) {
  const { architecture, label } = data;

  return (
    <div className="flow-architecture-node" data-role={architecture.role}>
      <Handle className="flow-node-handle" type="target" position={Position.Left} />
      <div className="flow-architecture-kicker">
        <span aria-hidden="true" />
        {label ?? roleLabels[architecture.role]}
      </div>
      <strong>{architecture.title}</strong>
      <small>{architecture.technologies.slice(0, 2).join(" · ")}</small>
      <Handle className="flow-node-handle" type="source" position={Position.Right} />
    </div>
  );
}

function DecisionCard({ data }: NodeProps<DecisionNode>) {
  return (
    <div className="flow-decision-node">
      <Handle className="flow-node-handle" type="target" position={Position.Left} />
      <span>{String(data.index + 1).padStart(2, "0")}</span>
      <div>
        <strong>{data.note.title}</strong>
        <small>{data.note.description}</small>
      </div>
    </div>
  );
}

function ArchitectureEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}: EdgeProps<DiagramEdge>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
    offset: 24,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        className={data?.quiet ? "flow-edge-path flow-edge-path-quiet" : "flow-edge-path"}
      />
      {data?.label ? (
        <EdgeLabelRenderer>
          <span
            className="flow-edge-label nodrag nopan"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {data.label}
          </span>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

const nodeTypes = {
  architecture: ArchitectureCard,
  decision: DecisionCard,
};

const edgeTypes = {
  architecture: ArchitectureEdge,
};

function architectureNode(
  id: string,
  architecture: SystemDesignNode,
  label?: string,
): ArchitectureNode {
  return {
    id,
    type: "architecture",
    position: { x: 0, y: 0 },
    data: { architecture, label },
    width: architectureNodeSize.width,
    height: architectureNodeSize.height,
    draggable: false,
    selectable: false,
  };
}

function decisionNode(id: string, note: SystemDesignNote, index: number): DecisionNode {
  return {
    id,
    type: "decision",
    position: { x: 0, y: 0 },
    data: { note, index },
    width: decisionNodeSize.width,
    height: decisionNodeSize.height,
    draggable: false,
    selectable: false,
  };
}

function architectureEdge(
  id: string,
  source: string,
  target: string,
  label?: string,
  quiet = false,
): DiagramEdge {
  return {
    id,
    source,
    target,
    type: "architecture",
    data: { label, quiet },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 14,
      height: 14,
    },
    selectable: false,
    focusable: false,
  };
}

function buildGraph(design: ProjectSystemDesign, variant: ArchitectureVariant): GraphSpec {
  const [client, service, processing, data] = design.flow;
  const [firstNote, secondNote] = design.notes;

  if (variant === "high-level") {
    return {
      nodes: [
        architectureNode("client", client),
        architectureNode("service", service),
        architectureNode("processing", processing),
        architectureNode("data", data),
      ],
      edges: [
        architectureEdge("client-service", "client", "service", client.handoff),
        architectureEdge("service-processing", "service", "processing", service.handoff),
        architectureEdge("processing-data", "processing", "data", processing.handoff),
      ],
    };
  }

  if (variant === "frontend") {
    return {
      nodes: [
        architectureNode("client", client, "frontend"),
        architectureNode("service", service, "server"),
        architectureNode("processing", processing, "background path"),
        architectureNode("data", data, "state"),
      ],
      edges: [
        architectureEdge(
          "client-service",
          "client",
          "service",
          "request + identity · state + response",
        ),
        architectureEdge("service-processing", "service", "processing", service.handoff),
        architectureEdge("service-data", "service", "data", "read + write"),
      ],
    };
  }

  if (variant === "backend") {
    return {
      nodes: [
        architectureNode("service", service),
        architectureNode("processing", processing),
        architectureNode("data", data, "state adapter"),
        architectureNode("client", client, "read model"),
        decisionNode("decision-0", firstNote, 0),
        decisionNode("decision-1", secondNote, 1),
      ],
      edges: [
        architectureEdge("service-processing", "service", "processing", service.handoff),
        architectureEdge("processing-data", "processing", "data", processing.handoff),
        architectureEdge("data-client", "data", "client", "publish result"),
        architectureEdge("processing-decision", "processing", "decision-0", "retry / recover", true),
        architectureEdge("data-decision", "data", "decision-1", "verify / audit", true),
      ],
    };
  }

  return {
    nodes: [
      architectureNode("client", client),
      architectureNode("service", service),
      architectureNode("processing", processing),
      architectureNode("data", data),
    ],
    edges: [
      architectureEdge("client-service", "client", "service", client.handoff),
      architectureEdge("service-processing", "service", "processing", service.handoff),
      architectureEdge("service-data", "service", "data", "read + write"),
    ],
  };
}

function minimumCanvas(variant: ArchitectureVariant) {
  if (variant === "overview") return { width: 1020, height: 390 };
  if (variant === "backend") return { width: 940, height: 330 };
  return { width: 780, height: 300 };
}

async function layoutGraph(spec: GraphSpec, variant: ArchitectureVariant): Promise<LaidOutGraph> {
  const minimum = minimumCanvas(variant);
  const graph: ElkNode = {
    id: `architecture-${variant}`,
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.padding": "[top=36,left=38,bottom=36,right=38]",
      "elk.spacing.nodeNode": "46",
      "elk.layered.spacing.nodeNodeBetweenLayers": variant === "overview" ? "96" : "168",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
    },
    children: spec.nodes.map((node) => ({
      id: node.id,
      width: node.type === "decision" ? decisionNodeSize.width : architectureNodeSize.width,
      height: node.type === "decision" ? decisionNodeSize.height : architectureNodeSize.height,
    })),
    edges: spec.edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };
  const layout = await elk.layout(graph);

  const layoutWidth = layout.width ?? minimum.width;
  const layoutHeight = layout.height ?? minimum.height;
  const width = Math.max(minimum.width, Math.ceil(layoutWidth));
  const height = Math.max(minimum.height, Math.ceil(layoutHeight));
  const offsetX = Math.max(0, (width - layoutWidth) / 2);
  const offsetY = Math.max(0, (height - layoutHeight) / 2);
  const positions = new Map(
    layout.children?.map((node) => [node.id, { x: (node.x ?? 0) + offsetX, y: (node.y ?? 0) + offsetY }]),
  );

  return {
    nodes: spec.nodes.map((node) => ({
      ...node,
      position: positions.get(node.id) ?? node.position,
    })),
    edges: spec.edges,
    width,
    height,
  };
}

function fallbackLayout(spec: GraphSpec, variant: ArchitectureVariant): LaidOutGraph {
  const minimum = minimumCanvas(variant);
  const gap = 96;
  const inset = 38;
  const width = Math.max(
    minimum.width,
    inset * 2 + spec.nodes.length * architectureNodeSize.width + (spec.nodes.length - 1) * gap,
  );

  return {
    nodes: spec.nodes.map((node, index) => ({
      ...node,
      position: {
        x: inset + index * (architectureNodeSize.width + gap),
        y: (minimum.height - (node.type === "decision" ? decisionNodeSize.height : architectureNodeSize.height)) / 2,
      },
    })),
    edges: spec.edges,
    width,
    height: minimum.height,
  };
}

export function ProjectArchitectureFlow({
  design,
  projectTitle,
  variant,
}: {
  design: ProjectSystemDesign;
  projectTitle: string;
  variant: ArchitectureVariant;
}) {
  const spec = useMemo(() => buildGraph(design, variant), [design, variant]);
  const [graph, setGraph] = useState<LaidOutGraph | null>(null);

  useEffect(() => {
    let active = true;

    void layoutGraph(spec, variant)
      .then((nextGraph) => {
        if (active) setGraph(nextGraph);
      })
      .catch(() => {
        if (active) setGraph(fallbackLayout(spec, variant));
      });

    return () => {
      active = false;
    };
  }, [spec, variant]);

  const label = variant === "overview"
    ? `${projectTitle} system architecture overview`
    : `${projectTitle} ${variant.replace("-", " ")} architecture`;

  if (!graph) {
    const minimum = minimumCanvas(variant);
    return (
      <div className="architecture-flow-frame" data-variant={variant}>
        <div
          className="architecture-flow-loading"
          style={{ width: minimum.width, height: minimum.height }}
          aria-label={`Laying out ${label}`}
          role="status"
        >
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  return (
    <div
      className="architecture-flow-frame"
      data-variant={variant}
      tabIndex={0}
      role="img"
      aria-label={`${label}. Use horizontal scrolling to inspect the full diagram on a narrow screen.`}
    >
      <div
        className="architecture-flow-canvas"
        style={{ width: graph.width, height: graph.height }}
        aria-hidden="true"
      >
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={1}
          maxZoom={1}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          selectNodesOnDrag={false}
          panOnDrag={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          nodesFocusable={false}
          edgesFocusable={false}
          disableKeyboardA11y
          deleteKeyCode={null}
          selectionKeyCode={null}
          multiSelectionKeyCode={null}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={28}
            size={0.8}
            color="var(--color-border-subtle)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
