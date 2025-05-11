
// Maximum size for localStorage items (in characters)
const MAX_STORAGE_SIZE = 2000000; // ~2MB to be safe

/**
 * Saves data to browser storage with fallbacks and size management
 * @param key Storage key
 * @param data Data to store
 * @param options Configuration options
 */
export const saveToStorage = (
  key: string,
  data: any,
  options: { 
    useSessionFallback?: boolean,
    showErrors?: boolean,
  } = { useSessionFallback: true, showErrors: true }
) => {
  // Skip saving empty data
  if (!data || (Array.isArray(data) && data.length === 0)) return;
  
  // For workflow nodes, we need special handling to reduce size
  if (key === 'workflow_nodes') {
    try {
      const compressedNodes = compressNodesForStorage(data);
      const serialized = JSON.stringify(compressedNodes);
      
      // Check if it's too large for localStorage
      if (serialized.length > MAX_STORAGE_SIZE) {
        if (options.useSessionFallback) {
          // Try sessionStorage instead (cleared when browser tab closes)
          sessionStorage.setItem(key, serialized);
          console.info(`Data for ${key} stored in sessionStorage (${(serialized.length / 1000).toFixed(1)}KB)`);
        } else if (options.showErrors) {
          console.warn(`Data for ${key} exceeds storage limit (${(serialized.length / 1000).toFixed(1)}KB)`);
        }
        return;
      }
      
      // It fits in localStorage
      localStorage.setItem(key, serialized);
    } catch (error) {
      handleStorageError(key, error, options.showErrors);
    }
    return;
  }
  
  // Regular storage for other items
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    handleStorageError(key, error, options.showErrors);
  }
};

/**
 * Loads data from browser storage with fallbacks
 */
export const loadFromStorage = (key: string) => {
  try {
    // Try localStorage first
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    
    // Check sessionStorage as fallback
    const sessionData = sessionStorage.getItem(key);
    if (sessionData) return JSON.parse(sessionData);
    
    return null;
  } catch (error) {
    console.error(`Error loading from storage (${key}):`, error);
    return null;
  }
};

/**
 * Removes data from all storage locations
 */
export const removeFromStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from storage (${key}):`, error);
  }
};

/**
 * Simplifies node data to reduce storage size
 */
const compressNodesForStorage = (nodes: any[]) => {
  return nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      label: node.data.label,
      type: node.data.type,
      description: node.data.description,
      color: node.data.color,
      handles: node.data.handles,
      config: node.data.config,
      input: node.data.input,
      inputType: node.data.inputType,
      // Only store response if it's a string and not too large
      response: typeof node.data.response === 'string' && 
        node.data.response.length < 1000 ? node.data.response : null,
      responseType: node.data.responseType,
      responseFormat: node.data.responseFormat,
      error: node.data.error,
      useResponseAsContext: node.data.useResponseAsContext,
    },
    parentId: node.parentId,
    selected: node.selected,
  }));
};

/**
 * Centralized error handling for storage operations
 */
const handleStorageError = (key: string, error: any, showErrors = true) => {
  if (showErrors) {
    console.error(`Storage error for ${key}:`, error);
  }
  
  // For quota errors, try to clear less important data
  if (error && error.name === 'QuotaExceededError') {
    try {
      // Remove potentially large items that aren't critical
      const nonCriticalKeys = [
        'workflow_nodes_backup',
        'workflow_edges_backup',
        // Add other keys that could be removed safely
      ];
      
      nonCriticalKeys.forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
        try { sessionStorage.removeItem(k); } catch (e) {}
      });
    } catch (cleanupError) {
      console.error('Failed to free up storage space:', cleanupError);
    }
  }
};
