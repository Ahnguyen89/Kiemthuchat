"use client"

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCanvas } from '@/hooks/use-canvas';
import AuditLog from '@/components/canvas/audit-log';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function AuditLogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { useFlow, useAuditLog } = useCanvas();
  
  const { data: flow, isLoading: isLoadingFlow } = useFlow(resolvedParams.id);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  
  const { data: auditData, isLoading: isLoadingAudit } = useAuditLog(resolvedParams.id, limit, offset);

  const handleLoadMore = () => {
    setOffset(prev => prev + limit);
  };

  const handleBackToCanvas = () => {
    router.push(`/dashboard/canvas/${resolvedParams.id}`);
  };

  if (isLoadingFlow) {
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

  const hasMore = auditData ? (offset + limit) < auditData.total : false;

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
            <p className="text-sm text-muted-foreground">Detailed Audit Log</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AuditLog
          logs={auditData?.logs || []}
          total={auditData?.total || 0}
          isLoading={isLoadingAudit}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
}
