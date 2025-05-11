
import { Node, Edge } from '@xyflow/react';

export interface NodeData {
  label: string;
  type: string;
  description?: string;
  color: string;
  handles?: {
    source: boolean;
    target: boolean;
  };
  icon?: JSX.Element;
  config?: Record<string, any>;
  input?: string;
  response?: string;
  error?: string;
  processing?: boolean;
  updateNodeData?: (nodeId: string, data: Record<string, any>) => void;
  edges?: Edge[];
  [key: string]: unknown; // Add index signature to satisfy Record<string, unknown>
}

// Define properly typed AINode and WorkflowEdge
export type AINode = Node<NodeData>;
export type WorkflowEdge = Edge;
