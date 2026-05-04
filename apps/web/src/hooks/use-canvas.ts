"use client"

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Node, Edge } from 'reactflow';
import { apiClient } from '@/lib/api';
import { Flow, CreateFlowRequest } from '@canvas-llm/shared';

export function useCanvas() {
  const queryClient = useQueryClient();

  // Fetch all flows
  const {
    data: flows,
    isLoading: isLoadingFlows,
    error: flowsError
  } = useQuery({
    queryKey: ['flows'],
    queryFn: async () => {
      const response = await apiClient.getFlows();
      return response.data;
    },
  });

  // Fetch single flow
  const useFlow = (flowId: string | undefined) => {
    return useQuery({
      queryKey: ['flow', flowId],
      queryFn: async () => {
        if (!flowId) return null;
        const response = await apiClient.getFlow(flowId);
        return response.data;
      },
      enabled: !!flowId,
    });
  };

  // Create flow mutation
  const createFlowMutation = useMutation({
    mutationFn: async (data: CreateFlowRequest) => {
      const response = await apiClient.createFlow(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
    },
  });

  // Update flow mutation
  const updateFlowMutation = useMutation({
    mutationFn: async ({ flowId, nodes, edges, isManualSave }: { flowId: string; nodes: any[]; edges: any[]; isManualSave?: boolean }) => {
      const response = await apiClient.updateFlow(flowId, { nodes, edges, isManualSave });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      queryClient.invalidateQueries({ queryKey: ['flow', variables.flowId] });
      if (variables.isManualSave) {
        // Invalidate version queries when manual save creates a version
        queryClient.invalidateQueries({ queryKey: ['flow-versions', variables.flowId] });
      }
    },
  });

  // Delete flow mutation
  const deleteFlowMutation = useMutation({
    mutationFn: async (flowId: string) => {
      await apiClient.deleteFlow(flowId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
    },
  });

  // Save canvas function
  const saveCanvas = useCallback(async (
    flowId: string,
    nodes: Node[],
    edges: Edge[],
    isManualSave: boolean = true
  ) => {
    return updateFlowMutation.mutateAsync({
      flowId,
      nodes: nodes as any[],
      edges: edges as any[],
      isManualSave,
    });
  }, [updateFlowMutation]);

  // Create new canvas function
  const createCanvas = useCallback(async (
    name: string,
    description?: string
  ) => {
    return createFlowMutation.mutateAsync({
      name,
      description,
    });
  }, [createFlowMutation]);

  // Rename flow function
  const renameFlow = useCallback(async (
    flowId: string,
    name: string
  ) => {
    const response = await apiClient.updateFlow(flowId, { name });
    queryClient.invalidateQueries({ queryKey: ['flows'] });
    queryClient.invalidateQueries({ queryKey: ['flow', flowId] });
    return response.data;
  }, [queryClient]);

  // Duplicate flow function
  const duplicateFlow = useCallback(async (flow: Flow) => {
    const newFlow = await createFlowMutation.mutateAsync({
      name: `${flow.name} (Copy)`,
      description: flow.description,
    });
    
    // Update the new flow with the copied nodes and edges
    if (newFlow && (flow.nodes.length > 0 || flow.edges.length > 0)) {
      await updateFlowMutation.mutateAsync({
        flowId: newFlow.id,
        nodes: flow.nodes as any[],
        edges: flow.edges as any[],
      });
    }
    
    return newFlow;
  }, [createFlowMutation, updateFlowMutation]);

  // Version control hooks
  const useFlowVersions = (flowId: string | undefined) => {
    return useQuery({
      queryKey: ['flow-versions', flowId],
      queryFn: async () => {
        if (!flowId) return null;
        const response = await apiClient.getFlowVersions(flowId);
        return response.data;
      },
      enabled: !!flowId,
    });
  };

  const revertToVersionMutation = useMutation({
    mutationFn: async ({ flowId, versionId }: { flowId: string; versionId: string }) => {
      const response = await apiClient.revertToVersion(flowId, versionId);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flow', variables.flowId] });
      queryClient.invalidateQueries({ queryKey: ['flow-versions', variables.flowId] });
      queryClient.invalidateQueries({ queryKey: ['flows'] });
    },
  });

  const useCompareVersions = (flowId: string, versionId1: string, versionId2?: string) => {
    return useQuery({
      queryKey: ['compare-versions', flowId, versionId1, versionId2],
      queryFn: async () => {
        if (versionId2) {
          const response = await apiClient.compareVersions(flowId, versionId1, versionId2);
          return response.data;
        } else {
          const response = await apiClient.compareVersionWithCurrent(flowId, versionId1);
          return response.data;
        }
      },
      enabled: !!flowId && !!versionId1,
    });
  };

  const useAuditLog = (flowId: string | undefined, limit: number = 50, offset: number = 0) => {
    return useQuery({
      queryKey: ['audit-log', flowId, limit, offset],
      queryFn: async () => {
        if (!flowId) return null;
        const response = await apiClient.getFlowAuditLog(flowId, limit, offset);
        return response.data;
      },
      enabled: !!flowId,
    });
  };

  return {
    // Data
    flows,
    isLoadingFlows,
    flowsError,
    useFlow,
    useFlowVersions,
    useCompareVersions,
    useAuditLog,

    // Mutations
    createCanvas,
    saveCanvas,
    renameFlow,
    duplicateFlow,
    deleteFlow: deleteFlowMutation.mutateAsync,
    revertToVersion: revertToVersionMutation.mutateAsync,
    
    // Loading states
    isCreatingFlow: createFlowMutation.isPending,
    isUpdatingFlow: updateFlowMutation.isPending,
    isDeletingFlow: deleteFlowMutation.isPending,
  };
}
