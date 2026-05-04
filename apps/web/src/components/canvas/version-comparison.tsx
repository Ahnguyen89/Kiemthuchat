"use client"

import React, { useState } from 'react';
import { ArrowLeftRight, SplitSquareVertical, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface VersionDiff {
  added: {
    nodes: any[];
    edges: any[];
  };
  removed: {
    nodes: any[];
    edges: any[];
  };
  modified: {
    nodes: Array<{ id: string; before: any; after: any }>;
    edges: Array<{ id: string; before: any; after: any }>;
  };
}

interface VersionComparisonProps {
  diff: VersionDiff;
  version1Label: string;
  version2Label: string;
  version1Data?: { nodes: any[]; edges: any[] };
  version2Data?: { nodes: any[]; edges: any[] };
}

interface PropertyChange {
  property: string;
  oldValue: any;
  newValue: any;
}

export default function VersionComparison({
  diff,
  version1Label,
  version2Label,
  version1Data,
  version2Data,
}: VersionComparisonProps) {
  const [viewMode, setViewMode] = useState<'diff' | 'sideBySide'>('diff');

  const totalChanges =
    diff.added.nodes.length +
    diff.added.edges.length +
    diff.removed.nodes.length +
    diff.removed.edges.length +
    diff.modified.nodes.length +
    diff.modified.edges.length;

  const renderNodeLabel = (node: any) => {
    return node.data?.label || node.data?.content || node.type || node.id;
  };

  // Detect specific changes between two nodes
  const getNodeChanges = (before: any, after: any): PropertyChange[] => {
    const changes: PropertyChange[] = [];

    // Check position changes
    if (before.position?.x !== after.position?.x || before.position?.y !== after.position?.y) {
      changes.push({
        property: 'Position',
        oldValue: `(${before.position?.x || 0}, ${before.position?.y || 0})`,
        newValue: `(${after.position?.x || 0}, ${after.position?.y || 0})`,
      });
    }

    // Check size changes
    if (before.width !== after.width || before.height !== after.height) {
      changes.push({
        property: 'Size',
        oldValue: `${before.width || 'auto'} × ${before.height || 'auto'}`,
        newValue: `${after.width || 'auto'} × ${after.height || 'auto'}`,
      });
    }

    // Check data changes
    if (JSON.stringify(before.data) !== JSON.stringify(after.data)) {
      const dataChanges = getDataChanges(before.data || {}, after.data || {});
      changes.push(...dataChanges);
    }

    // Check type change
    if (before.type !== after.type) {
      changes.push({
        property: 'Type',
        oldValue: before.type,
        newValue: after.type,
      });
    }

    return changes;
  };

  // Detect specific changes in node data
  const getDataChanges = (beforeData: any, afterData: any): PropertyChange[] => {
    const changes: PropertyChange[] = [];
    const allKeys = new Set([...Object.keys(beforeData), ...Object.keys(afterData)]);

    for (const key of Array.from(allKeys)) {
      const oldVal = beforeData[key];
      const newVal = afterData[key];

      // Skip internal/system keys
      if (key === 'id' || key === '__typename') continue;

      // Skip very large base64 images in detailed comparison (just note they changed)
      if ((key.toLowerCase().includes('image') || key.toLowerCase().includes('base64')) && 
          (typeof oldVal === 'string' && oldVal.length > 1000 || 
           typeof newVal === 'string' && newVal.length > 1000)) {
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changes.push({
            property: `Data: ${key}`,
            oldValue: `[Image data: ${typeof oldVal === 'string' ? oldVal.length : 0} chars]`,
            newValue: `[Image data: ${typeof newVal === 'string' ? newVal.length : 0} chars]`,
          });
        }
        continue;
      }

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          property: `Data: ${key}`,
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    }

    return changes;
  };

  // Detect specific changes between two edges
  const getEdgeChanges = (before: any, after: any): PropertyChange[] => {
    const changes: PropertyChange[] = [];

    // Check source/target changes
    if (before.source !== after.source) {
      changes.push({
        property: 'Source',
        oldValue: before.source,
        newValue: after.source,
      });
    }

    if (before.target !== after.target) {
      changes.push({
        property: 'Target',
        oldValue: before.target,
        newValue: after.target,
      });
    }

    // Check label changes
    if (before.label !== after.label) {
      changes.push({
        property: 'Label',
        oldValue: before.label || '(none)',
        newValue: after.label || '(none)',
      });
    }

    // Check style changes
    if (JSON.stringify(before.style) !== JSON.stringify(after.style)) {
      changes.push({
        property: 'Style',
        oldValue: before.style,
        newValue: after.style,
      });
    }

    return changes;
  };

  // Format values for display with truncation for long content
  const formatValue = (value: any, maxLength: number = 200): React.ReactNode => {
    if (value === null || value === undefined) {
      return '(empty)';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    
    let stringValue: string;
    if (typeof value === 'object') {
      stringValue = JSON.stringify(value, null, 2);
    } else {
      stringValue = String(value);
    }
    
    // Truncate very long values (like base64 images)
    if (stringValue.length > maxLength) {
      const truncated = stringValue.substring(0, maxLength);
      return (
        <div className="space-y-1">
          <div className="break-all whitespace-pre-wrap font-mono text-xs">
            {truncated}...
          </div>
          <div className="text-xs text-muted-foreground italic">
            ({stringValue.length} characters - truncated for display)
          </div>
        </div>
      );
    }
    
    return <div className="break-all whitespace-pre-wrap font-mono text-xs">{stringValue}</div>;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Version Comparison</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {version1Label} vs {version2Label}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'diff' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('diff')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Diff View
            </Button>
            <Button
              variant={viewMode === 'sideBySide' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('sideBySide')}
            >
              <SplitSquareVertical className="h-4 w-4 mr-2" />
              Side by Side
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="flex gap-4 mt-4">
          <Badge variant="default" className="bg-green-600">
            +{diff.added.nodes.length + diff.added.edges.length} Added
          </Badge>
          <Badge variant="default" className="bg-red-600">
            -{diff.removed.nodes.length + diff.removed.edges.length} Removed
          </Badge>
          <Badge variant="default" className="bg-yellow-600">
            ~{diff.modified.nodes.length + diff.modified.edges.length} Modified
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'diff' ? (
          <div className="p-4 space-y-4 max-w-full">
            {totalChanges === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No changes between these versions
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Added Items */}
                {(diff.added.nodes.length > 0 || diff.added.edges.length > 0) && (
                  <Card className="border-green-600 overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-green-600 flex items-center gap-2">
                        <Badge className="bg-green-600">+</Badge>
                        Added Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {diff.added.nodes.map((node) => (
                          <div
                            key={node.id}
                            className="p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800"
                          >
                            <div className="font-medium">Node: {renderNodeLabel(node)}</div>
                            <div className="text-sm text-muted-foreground">Type: {node.type}</div>
                          </div>
                        ))}
                        {diff.added.edges.map((edge) => (
                          <div
                            key={edge.id}
                            className="p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800"
                          >
                            <div className="font-medium">
                              Connection: {edge.source} → {edge.target}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Removed Items */}
                {(diff.removed.nodes.length > 0 || diff.removed.edges.length > 0) && (
                  <Card className="border-red-600 overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-red-600 flex items-center gap-2">
                        <Badge className="bg-red-600">-</Badge>
                        Removed Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {diff.removed.nodes.map((node) => (
                          <div
                            key={node.id}
                            className="p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800"
                          >
                            <div className="font-medium">Node: {renderNodeLabel(node)}</div>
                            <div className="text-sm text-muted-foreground">Type: {node.type}</div>
                          </div>
                        ))}
                        {diff.removed.edges.map((edge) => (
                          <div
                            key={edge.id}
                            className="p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800"
                          >
                            <div className="font-medium">
                              Connection: {edge.source} → {edge.target}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Modified Items */}
                {(diff.modified.nodes.length > 0 || diff.modified.edges.length > 0) && (
                  <Card className="border-yellow-600 overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-yellow-600 flex items-center gap-2">
                        <Badge className="bg-yellow-600">~</Badge>
                        Modified Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {diff.modified.nodes.map((item) => {
                          const changes = getNodeChanges(item.before, item.after);
                          return (
                            <div
                              key={item.id}
                              className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200 dark:border-yellow-800"
                            >
                              <div className="font-medium mb-2">Node: {renderNodeLabel(item.after)}</div>
                              <div className="text-sm space-y-2">
                                {changes.map((change, idx) => (
                                  <div key={idx} className="border-l-2 border-yellow-400 pl-3">
                                    <div className="font-medium text-xs uppercase text-muted-foreground mb-1">
                                      {change.property}
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start gap-2">
                                      <div className="flex-1 w-full min-w-0">
                                        <div className="text-xs text-muted-foreground">Before:</div>
                                        <div className="text-sm bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded mt-1 overflow-hidden">
                                          {formatValue(change.oldValue)}
                                        </div>
                                      </div>
                                      <div className="flex-1 w-full min-w-0">
                                        <div className="text-xs text-muted-foreground">After:</div>
                                        <div className="text-sm bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded mt-1 overflow-hidden">
                                          {formatValue(change.newValue)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                        {diff.modified.edges.map((item) => {
                          const changes = getEdgeChanges(item.before, item.after);
                          return (
                            <div
                              key={item.id}
                              className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200 dark:border-yellow-800"
                            >
                              <div className="font-medium mb-2">
                                Connection: {item.after.source} → {item.after.target}
                              </div>
                              <div className="text-sm space-y-2">
                                {changes.map((change, idx) => (
                                  <div key={idx} className="border-l-2 border-yellow-400 pl-3">
                                    <div className="font-medium text-xs uppercase text-muted-foreground mb-1">
                                      {change.property}
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start gap-2">
                                      <div className="flex-1 w-full min-w-0">
                                        <div className="text-xs text-muted-foreground">Before:</div>
                                        <div className="text-sm bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded mt-1 overflow-hidden">
                                          {formatValue(change.oldValue)}
                                        </div>
                                      </div>
                                      <div className="flex-1 w-full min-w-0">
                                        <div className="text-xs text-muted-foreground">After:</div>
                                        <div className="text-sm bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded mt-1 overflow-hidden">
                                          {formatValue(change.newValue)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Version 1 */}
              <Card>
                <CardHeader>
                  <CardTitle>{version1Label}</CardTitle>
                  <CardDescription>
                    {version1Data?.nodes.length || 0} nodes, {version1Data?.edges.length || 0} edges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[600px] overflow-auto">
                    <div className="space-y-2">
                      {version1Data?.nodes.map((node) => (
                        <div key={node.id} className="p-2 bg-secondary rounded">
                          <div className="font-medium text-sm">{renderNodeLabel(node)}</div>
                          <div className="text-xs text-muted-foreground">{node.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Version 2 */}
              <Card>
                <CardHeader>
                  <CardTitle>{version2Label}</CardTitle>
                  <CardDescription>
                    {version2Data?.nodes.length || 0} nodes, {version2Data?.edges.length || 0} edges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[600px] overflow-auto">
                    <div className="space-y-2">
                      {version2Data?.nodes.map((node) => (
                        <div key={node.id} className="p-2 bg-secondary rounded">
                          <div className="font-medium text-sm">{renderNodeLabel(node)}</div>
                          <div className="text-xs text-muted-foreground">{node.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
