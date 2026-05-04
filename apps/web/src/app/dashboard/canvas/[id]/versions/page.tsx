"use client"

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useCanvas } from '@/hooks/use-canvas';
import { apiClient } from '@/lib/api';
import VersionHistory from '@/components/canvas/version-history';
import VersionComparison from '@/components/canvas/version-comparison';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function VersionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { useFlow, useFlowVersions, revertToVersion } = useCanvas();
  
  const { data: flow, isLoading: isLoadingFlow } = useFlow(resolvedParams.id);
  const { data: versions, isLoading: isLoadingVersions, refetch: refetchVersions } = useFlowVersions(resolvedParams.id);
  
  const [selectedVersionForCompare, setSelectedVersionForCompare] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'compare'>('history');

  // Get comparison data when a version is selected - always call hook but conditionally enable
  const { data: comparisonData, isLoading: isLoadingComparison } = useQuery({
    queryKey: ['compare-versions', resolvedParams.id, selectedVersionForCompare],
    queryFn: async () => {
      if (!selectedVersionForCompare) return null;
      const response = await apiClient.compareVersionWithCurrent(resolvedParams.id, selectedVersionForCompare);
      return response.data;
    },
    enabled: !!resolvedParams.id && !!selectedVersionForCompare,
  });

  const handleRevert = async (versionId: string) => {
    try {
      await revertToVersion({ flowId: resolvedParams.id, versionId });
      toast({
        title: 'Version Reverted',
        description: 'Canvas has been reverted successfully.',
      });
      refetchVersions();
      router.push(`/dashboard/canvas/${resolvedParams.id}`);
    } catch (error) {
      console.error('Failed to revert:', error);
      toast({
        title: 'Revert Failed',
        description: 'Failed to revert to the selected version.',
        variant: 'destructive',
      });
    }
  };

  const handleCompare = (versionId: string) => {
    setSelectedVersionForCompare(versionId);
    setActiveTab('compare');
  };

  const handleBackToCanvas = () => {
    router.push(`/dashboard/canvas/${resolvedParams.id}`);
  };

  if (isLoadingFlow || isLoadingVersions) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Canvas Not Found</h2>
          <p className="text-muted-foreground">The canvas you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const selectedVersion = versions?.find(v => v.id === selectedVersionForCompare);
  const latestVersion = versions?.[0];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBackToCanvas}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{flow.name}</h1>
            <p className="text-sm text-muted-foreground">Version History & Audit Log</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'history' | 'compare')} className="h-full">
          <div className="border-b px-4">
            <TabsList>
              <TabsTrigger value="history">Version History</TabsTrigger>
              <TabsTrigger value="compare" disabled={!selectedVersionForCompare}>
                Compare
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="history" className="h-full m-0">
            <VersionHistory
              flowId={resolvedParams.id}
              versions={versions || []}
              isLoading={isLoadingVersions}
              onRevert={handleRevert}
              onCompare={handleCompare}
              currentVersionNumber={latestVersion?.versionNumber}
            />
          </TabsContent>
          
          <TabsContent value="compare" className="h-full m-0">
            {selectedVersionForCompare && !isLoadingComparison && comparisonData ? (
              <VersionComparison
                diff={comparisonData}
                version1Label={`Version ${selectedVersion?.versionNumber || '?'}`}
                version2Label="Current Version"
                version1Data={selectedVersion ? { nodes: selectedVersion.nodes, edges: selectedVersion.edges } : undefined}
                version2Data={flow ? { nodes: flow.nodes, edges: flow.edges } : undefined}
              />
            ) : isLoadingComparison ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Select a version to compare</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
