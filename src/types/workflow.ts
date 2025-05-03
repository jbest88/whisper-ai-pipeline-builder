
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
}

export type AINode = Node<NodeData>;
export type WorkflowEdge = Edge;
