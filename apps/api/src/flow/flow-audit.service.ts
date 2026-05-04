import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum AuditAction {
  SAVE = 'SAVE',
  NODE_ADDED = 'NODE_ADDED',
  NODE_MOVED = 'NODE_MOVED',
  NODE_UPDATED = 'NODE_UPDATED',
  NODE_DELETED = 'NODE_DELETED',
  EDGE_ADDED = 'EDGE_ADDED',
  EDGE_UPDATED = 'EDGE_UPDATED',
  EDGE_DELETED = 'EDGE_DELETED',
  REVERT = 'REVERT',
  CREATED = 'CREATED',
}

export interface AuditLogEntry {
  id: string;
  flowId: string;
  userId: string;
  action: string;
  details: any;
  timestamp: Date;
  versionId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

@Injectable()
export class FlowAuditService {
  constructor(private prisma: PrismaService) {}

  async logSave(
    flowId: string,
    userId: string,
    versionId: string,
    summary: { nodeCount: number; edgeCount: number }
  ) {
    return this.prisma.flowAuditLog.create({
      data: {
        flowId,
        userId,
        action: AuditAction.SAVE,
        details: {
          versionId,
          nodeCount: summary.nodeCount,
          edgeCount: summary.edgeCount,
          message: `Saved canvas with ${summary.nodeCount} nodes and ${summary.edgeCount} edges`,
        },
        versionId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async logChange(
    flowId: string,
    userId: string,
    action: AuditAction,
    details: any
  ) {
    return this.prisma.flowAuditLog.create({
      data: {
        flowId,
        userId,
        action,
        details,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getAuditLog(
    flowId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    // Check if flow exists and user has access
    const flow = await this.prisma.flow.findUnique({
      where: { id: flowId },
    });

    if (!flow) {
      throw new NotFoundException('Flow not found');
    }

    if (flow.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Get audit logs with pagination
    const [logs, total] = await Promise.all([
      this.prisma.flowAuditLog.findMany({
        where: { flowId },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.flowAuditLog.count({
        where: { flowId },
      }),
    ]);

    return { logs: logs as AuditLogEntry[], total };
  }

  async getChangesBetweenVersions(versionId1: string, versionId2: string) {
    // Get all audit logs between two versions
    const version1 = await this.prisma.flowVersion.findUnique({
      where: { id: versionId1 },
    });

    const version2 = await this.prisma.flowVersion.findUnique({
      where: { id: versionId2 },
    });

    if (!version1 || !version2) {
      throw new NotFoundException('Version not found');
    }

    if (version1.flowId !== version2.flowId) {
      throw new ForbiddenException('Versions belong to different flows');
    }

    // Get audit logs between the two version timestamps
    const startTime = version1.createdAt < version2.createdAt ? version1.createdAt : version2.createdAt;
    const endTime = version1.createdAt > version2.createdAt ? version1.createdAt : version2.createdAt;

    return this.prisma.flowAuditLog.findMany({
      where: {
        flowId: version1.flowId,
        timestamp: {
          gte: startTime,
          lte: endTime,
        },
      },
      orderBy: { timestamp: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async logRevert(
    flowId: string,
    userId: string,
    fromVersionId: string,
    toVersionId: string
  ) {
    const fromVersion = await this.prisma.flowVersion.findUnique({
      where: { id: fromVersionId },
    });

    const toVersion = await this.prisma.flowVersion.findUnique({
      where: { id: toVersionId },
    });

    return this.logChange(flowId, userId, AuditAction.REVERT, {
      message: `Reverted from version ${fromVersion?.versionNumber} to version ${toVersion?.versionNumber}`,
      fromVersionId,
      toVersionId,
      fromVersionNumber: fromVersion?.versionNumber,
      toVersionNumber: toVersion?.versionNumber,
    });
  }

  async logCreation(flowId: string, userId: string) {
    return this.logChange(flowId, userId, AuditAction.CREATED, {
      message: 'Canvas created',
    });
  }

  // Helper method to track individual node/edge changes
  async detectAndLogChanges(
    flowId: string,
    userId: string,
    oldNodes: any[],
    oldEdges: any[],
    newNodes: any[],
    newEdges: any[]
  ) {
    const oldNodesMap = new Map(oldNodes.map(n => [n.id, n]));
    const newNodesMap = new Map(newNodes.map(n => [n.id, n]));
    const oldEdgesMap = new Map(oldEdges.map(e => [e.id, e]));
    const newEdgesMap = new Map(newEdges.map(e => [e.id, e]));

    const changes = [];

    // Detect node changes
    for (const node of newNodes) {
      if (!oldNodesMap.has(node.id)) {
        // Node added
        changes.push(
          this.logChange(flowId, userId, AuditAction.NODE_ADDED, {
            nodeId: node.id,
            nodeType: node.type,
            message: `Added ${node.type} node`,
          })
        );
      } else {
        const oldNode = oldNodesMap.get(node.id);
        // Check if node was moved
        if (
          oldNode.position?.x !== node.position?.x ||
          oldNode.position?.y !== node.position?.y
        ) {
          changes.push(
            this.logChange(flowId, userId, AuditAction.NODE_MOVED, {
              nodeId: node.id,
              from: oldNode.position,
              to: node.position,
              message: `Moved ${node.type} node`,
            })
          );
        }
        // Check if node data changed
        else if (JSON.stringify(oldNode.data) !== JSON.stringify(node.data)) {
          changes.push(
            this.logChange(flowId, userId, AuditAction.NODE_UPDATED, {
              nodeId: node.id,
              nodeType: node.type,
              message: `Updated ${node.type} node`,
            })
          );
        }
      }
    }

    // Detect deleted nodes
    for (const node of oldNodes) {
      if (!newNodesMap.has(node.id)) {
        changes.push(
          this.logChange(flowId, userId, AuditAction.NODE_DELETED, {
            nodeId: node.id,
            nodeType: node.type,
            message: `Deleted ${node.type} node`,
          })
        );
      }
    }

    // Detect edge changes
    for (const edge of newEdges) {
      if (!oldEdgesMap.has(edge.id)) {
        changes.push(
          this.logChange(flowId, userId, AuditAction.EDGE_ADDED, {
            edgeId: edge.id,
            source: edge.source,
            target: edge.target,
            message: 'Added connection',
          })
        );
      }
    }

    // Detect deleted edges
    for (const edge of oldEdges) {
      if (!newEdgesMap.has(edge.id)) {
        changes.push(
          this.logChange(flowId, userId, AuditAction.EDGE_DELETED, {
            edgeId: edge.id,
            source: edge.source,
            target: edge.target,
            message: 'Deleted connection',
          })
        );
      }
    }

    // Execute all change logs
    if (changes.length > 0) {
      await Promise.all(changes);
    }

    return changes.length;
  }
}
