"use client"

import React, { useState } from 'react';
import { Clock, User, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, formatDistanceToNow } from 'date-fns';

interface AuditLogEntry {
  id: string;
  flowId: string;
  userId: string;
  action: string;
  details: any;
  timestamp: Date;
  versionId?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
}

interface AuditLogProps {
  logs: AuditLogEntry[];
  total: number;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const ACTION_LABELS: Record<string, string> = {
  SAVE: 'Saved canvas',
  NODE_ADDED: 'Added node',
  NODE_MOVED: 'Moved node',
  NODE_UPDATED: 'Updated node',
  NODE_DELETED: 'Deleted node',
  EDGE_ADDED: 'Added connection',
  EDGE_UPDATED: 'Updated connection',
  EDGE_DELETED: 'Deleted connection',
  REVERT: 'Reverted version',
  CREATED: 'Created canvas',
};

const ACTION_COLORS: Record<string, string> = {
  SAVE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  NODE_ADDED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  NODE_DELETED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  NODE_UPDATED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  NODE_MOVED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  EDGE_ADDED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  EDGE_DELETED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  REVERT: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  CREATED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

export default function AuditLog({
  logs,
  total,
  isLoading,
  onLoadMore,
  hasMore,
}: AuditLogProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filterAction, setFilterAction] = useState<string>('all');

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const filteredLogs = filterAction === 'all' 
    ? logs 
    : logs.filter(log => log.action === filterAction);

  // Group logs by date
  const groupedLogs = filteredLogs.reduce((groups, log) => {
    const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, AuditLogEntry[]>);

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Audit Log</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {total} total entries
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {ACTION_LABELS[action] || action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {Object.entries(groupedLogs).map(([date, dateLogs]) => (
            <div key={date}>
              <div className="sticky top-0 bg-background/95 backdrop-blur z-10 pb-2 mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {format(new Date(date), 'MMMM dd, yyyy')}
                </h3>
              </div>
              <div className="space-y-3">
                {dateLogs.map((log) => {
                  const isExpanded = expandedIds.has(log.id);
                  const actionLabel = ACTION_LABELS[log.action] || log.action;
                  const actionColor = ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800';

                  return (
                    <Card key={log.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={log.user.avatar || undefined} alt={log.user.name} />
                            <AvatarFallback>
                              {log.user.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{log.user.name}</span>
                              <Badge className={actionColor}>
                                {actionLabel}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                            {log.details.message && (
                              <div className="mt-1 text-sm text-muted-foreground">
                                {log.details.message}
                              </div>
                            )}
                            {isExpanded && (
                              <div className="mt-3 p-3 bg-secondary rounded text-sm">
                                <div className="font-medium mb-2">Details:</div>
                                <pre className="whitespace-pre-wrap overflow-x-auto">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(log.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && onLoadMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}

          {filteredLogs.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No audit logs found
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
