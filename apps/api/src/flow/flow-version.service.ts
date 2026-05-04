import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface VersionDiff {
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

@Injectable()
export class FlowVersionService {
  constructor(private prisma: PrismaService) {}

  async createVersion(
    flowId: string,
    userId: string,
    nodes: any[],
    edges: any[],
    description?: string,
    isAutoSave: boolean = false
  ) {
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

    // Get the latest version number
    const latestVersion = await this.prisma.flowVersion.findFirst({
      where: { flowId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    });

    const versionNumber = (latestVersion?.versionNumber || 0) + 1;

    // Create the version
    return this.prisma.flowVersion.create({
      data: {
        flowId,
        versionNumber,
        nodes,
        edges,
        createdBy: userId,
        description,
        isAutoSave,
      },
      include: {
        creator: {
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

  /**
   * Create version for collaborators via share link
   * Bypasses ownership check
   */
  async createVersionForCollaborator(
    flowId: string,
    userId: string,
    nodes: any[],
    edges: any[],
    description?: string,
    isAutoSave: boolean = false
  ) {
    // Check if flow exists
    const flow = await this.prisma.flow.findUnique({
      where: { id: flowId },
    });

    if (!flow) {
      throw new NotFoundException('Flow not found');
    }

    // Get the latest version number
    const latestVersion = await this.prisma.flowVersion.findFirst({
      where: { flowId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    });

    const versionNumber = (latestVersion?.versionNumber || 0) + 1;

    // Create the version
    return this.prisma.flowVersion.create({
      data: {
        flowId,
        versionNumber,
        nodes,
        edges,
        createdBy: userId,
        description,
        isAutoSave,
      },
      include: {
        creator: {
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

  async getVersions(flowId: string, userId: string) {
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

    // Get all versions (exclude auto-saves)
    return this.prisma.flowVersion.findMany({
      where: {
        flowId,
        isAutoSave: false,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
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

  async getVersion(versionId: string, userId: string) {
    const version = await this.prisma.flowVersion.findUnique({
      where: { id: versionId },
      include: {
        flow: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    if (version.flow.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return version;
  }

  async getLatestVersion(flowId: string) {
    return this.prisma.flowVersion.findFirst({
      where: { flowId },
      orderBy: { versionNumber: 'desc' },
      include: {
        creator: {
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

  async revertToVersion(flowId: string, versionId: string, userId: string) {
    // Get the version to revert to
    const version = await this.getVersion(versionId, userId);

    if (version.flowId !== flowId) {
      throw new ForbiddenException('Version does not belong to this flow');
    }

    // Update the flow with the version's nodes and edges
    const updatedFlow = await this.prisma.flow.update({
      where: { id: flowId },
      data: {
        nodes: version.nodes,
        edges: version.edges,
        updatedAt: new Date(),
      },
    });

    // Create a new version for the revert (this makes revert trackable)
    const newVersion = await this.createVersion(
      flowId,
      userId,
      version.nodes as any[],
      version.edges as any[],
      `Reverted to version ${version.versionNumber}`,
      false
    );

    return {
      flow: updatedFlow,
      version: newVersion,
      revertedFrom: version,
    };
  }

  async compareVersions(versionId1: string, versionId2: string, userId: string): Promise<VersionDiff> {
    const [version1, version2] = await Promise.all([
      this.getVersion(versionId1, userId),
      this.getVersion(versionId2, userId),
    ]);

    const nodes1 = (version1.nodes as any[]) || [];
    const nodes2 = (version2.nodes as any[]) || [];
    const edges1 = (version1.edges as any[]) || [];
    const edges2 = (version2.edges as any[]) || [];

    // Calculate differences
    const diff: VersionDiff = {
      added: {
        nodes: [],
        edges: [],
      },
      removed: {
        nodes: [],
        edges: [],
      },
      modified: {
        nodes: [],
        edges: [],
      },
    };

    // Find added nodes (in version2 but not in version1)
    const nodes1Map = new Map(nodes1.map(n => [n.id, n]));
    const nodes2Map = new Map(nodes2.map(n => [n.id, n]));

    for (const node of nodes2) {
      if (!nodes1Map.has(node.id)) {
        diff.added.nodes.push(node);
      } else {
        // Check if modified
        const node1 = nodes1Map.get(node.id);
        if (JSON.stringify(node1) !== JSON.stringify(node)) {
          diff.modified.nodes.push({
            id: node.id,
            before: node1,
            after: node,
          });
        }
      }
    }

    // Find removed nodes (in version1 but not in version2)
    for (const node of nodes1) {
      if (!nodes2Map.has(node.id)) {
        diff.removed.nodes.push(node);
      }
    }

    // Same for edges
    const edges1Map = new Map(edges1.map(e => [e.id, e]));
    const edges2Map = new Map(edges2.map(e => [e.id, e]));

    for (const edge of edges2) {
      if (!edges1Map.has(edge.id)) {
        diff.added.edges.push(edge);
      } else {
        const edge1 = edges1Map.get(edge.id);
        if (JSON.stringify(edge1) !== JSON.stringify(edge)) {
          diff.modified.edges.push({
            id: edge.id,
            before: edge1,
            after: edge,
          });
        }
      }
    }

    for (const edge of edges1) {
      if (!edges2Map.has(edge.id)) {
        diff.removed.edges.push(edge);
      }
    }

    return diff;
  }

  async compareWithCurrent(versionId: string, userId: string): Promise<VersionDiff> {
    const version = await this.getVersion(versionId, userId);
    
    // Get current flow state
    const currentFlow = await this.prisma.flow.findUnique({
      where: { id: version.flowId },
    });

    if (!currentFlow) {
      throw new NotFoundException('Flow not found');
    }

    // Create a temporary version object for current state
    const currentNodes = (currentFlow.nodes as any[]) || [];
    const currentEdges = (currentFlow.edges as any[]) || [];
    const versionNodes = (version.nodes as any[]) || [];
    const versionEdges = (version.edges as any[]) || [];

    // Calculate differences
    const diff: VersionDiff = {
      added: {
        nodes: [],
        edges: [],
      },
      removed: {
        nodes: [],
        edges: [],
      },
      modified: {
        nodes: [],
        edges: [],
      },
    };

    // Find differences in nodes
    const versionNodesMap = new Map(versionNodes.map(n => [n.id, n]));
    const currentNodesMap = new Map(currentNodes.map(n => [n.id, n]));

    for (const node of currentNodes) {
      if (!versionNodesMap.has(node.id)) {
        diff.added.nodes.push(node);
      } else {
        const versionNode = versionNodesMap.get(node.id);
        if (JSON.stringify(versionNode) !== JSON.stringify(node)) {
          diff.modified.nodes.push({
            id: node.id,
            before: versionNode,
            after: node,
          });
        }
      }
    }

    for (const node of versionNodes) {
      if (!currentNodesMap.has(node.id)) {
        diff.removed.nodes.push(node);
      }
    }

    // Same for edges
    const versionEdgesMap = new Map(versionEdges.map(e => [e.id, e]));
    const currentEdgesMap = new Map(currentEdges.map(e => [e.id, e]));

    for (const edge of currentEdges) {
      if (!versionEdgesMap.has(edge.id)) {
        diff.added.edges.push(edge);
      } else {
        const versionEdge = versionEdgesMap.get(edge.id);
        if (JSON.stringify(versionEdge) !== JSON.stringify(edge)) {
          diff.modified.edges.push({
            id: edge.id,
            before: versionEdge,
            after: edge,
          });
        }
      }
    }

    for (const edge of versionEdges) {
      if (!currentEdgesMap.has(edge.id)) {
        diff.removed.edges.push(edge);
      }
    }

    return diff;
  }
}
