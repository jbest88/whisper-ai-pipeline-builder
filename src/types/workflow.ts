
import { Edge, Node } from '@xyflow/react';

export interface NodeData {
  label: string;
  type: string;
  description?: string;
  color: string;
  handles: {
    source: boolean;
    target: boolean;
  };
  icon?: React.ReactNode;
  updateNodeData?: (nodeId: string, data: Record<string, any>) => void;
  openConfig?: (nodeId: string) => void;
  edges?: WorkflowEdge[];
  nodes?: Node<NodeData>[];
  input?: string | File;
  inputType?: 'text' | 'file' | 'audio' | 'video' | 'image';
  response?: string | Blob | null;
  responseType?: 'text' | 'code' | 'image' | 'audio' | 'video';
  processing?: boolean;
  error?: string;
  apiKey?: string;
  config?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    voice?: string;
    size?: string;
    style?: string;
    duration?: string;
    resolution?: string;
    frames?: string;
    mode?: string;
    [key: string]: any;
  };
  [key: string]: any; // Add index signature to satisfy Record<string, unknown>
}

export type AINode = Node<NodeData>;

export interface WorkflowEdge extends Edge {
  animated: boolean;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}
