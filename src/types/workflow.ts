
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
  nodes?: AINode[];
  input?: string | File;
  inputType?: 'text' | 'file' | 'audio' | 'video' | 'image';
  response?: string | Blob | null;
  responseType?: 'text' | 'code' | 'image' | 'audio' | 'video';
  processing?: boolean;
  error?: string;
  apiKey?: string;
  context?: any[] | string; // Can be an array of messages or a string context
  credentials?: Record<string, string>;
  executed?: boolean;
  config?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    voice?: string;
    size?: string;
    style?: string;
    quality?: string;
    duration?: string;
    resolution?: string;
    frames?: string;
    mode?: string;
    operation?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url?: string;
    headers?: Record<string, string>;
    bodyType?: 'json' | 'form' | 'raw';
    body?: string | Record<string, any>;
    parameters?: Array<{
      name: string;
      value: string;
      type: 'string' | 'number' | 'boolean';
      required: boolean;
    }>;
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

export enum ExecutionStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface WorkflowExecution {
  id: string;
  status: ExecutionStatus;
  startTime: number;
  endTime?: number;
  nodeResults: Record<string, {
    status: ExecutionStatus;
    startTime: number;
    endTime?: number;
    input?: any;
    output?: any;
    error?: string;
  }>;
}
