import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlowDto, UpdateFlowDto } from './dto';
import { FlowVersionService } from './flow-version.service';
import { FlowAuditService } from './flow-audit.service';
import { randomBytes } from 'crypto';

@Injectable()
export class FlowService {
  constructor(
    private prisma: PrismaService,
    private versionService: FlowVersionService,
    private auditService: FlowAuditService,
  ) {}

  private generateShareToken(): string {
    return randomBytes(16).toString('hex');
  }

  async findAll(userId: string) {
    return this.prisma.flow.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, flowId: string) {
    const flow = await this.prisma.flow.findUnique({
      where: { id: flowId },
    });

    if (!flow) {
      throw new NotFoundException('Flow not found');
    }

    if (flow.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return flow;
  }

  async create(userId: string, createFlowDto: CreateFlowDto) {
    const flow = await this.prisma.flow.create({
      data: {
        ...createFlowDto,
        userId,
        nodes: [],
        edges: [],
      },
    });

    // Log creation in audit log
    await this.auditService.logCreation(flow.id, userId);

    return flow;
  }

  async update(userId: string, flowId: string, updateFlowDto: UpdateFlowDto, isManualSave: boolean = false) {
    // Check if flow exists and belongs to user
    const flow = await this.findOne(userId, flowId);

    // Extract isManualSave from DTO to prevent passing it to Prisma
    const { isManualSave: _, ...dataToUpdate } = updateFlowDto;

    // If manual save and nodes/edges are provided, create version and audit log
    if (isManualSave && (updateFlowDto.nodes || updateFlowDto.edges)) {
      const nodes = updateFlowDto.nodes || (flow.nodes as any[]);
      const edges = updateFlowDto.edges || (flow.edges as any[]);

      // Create version snapshot
      const version = await this.versionService.createVersion(
        flowId,
        userId,
        nodes,
        edges,
        undefined, // description (can be added later)
        false // not an auto-save
      );

      // Create audit log for save
      await this.auditService.logSave(flowId, userId, version.id, {
        nodeCount: nodes.length,
        edgeCount: edges.length,
      });

      // Detect and log individual changes if there were previous nodes/edges
      const oldNodes = (flow.nodes as any[]) || [];
      const oldEdges = (flow.edges as any[]) || [];
      
      if (oldNodes.length > 0 || oldEdges.length > 0) {
        await this.auditService.detectAndLogChanges(
          flowId,
          userId,
          oldNodes,
          oldEdges,
          nodes,
          edges
        );
      }
    }

    return this.prisma.flow.update({
      where: { id: flowId },
      data: dataToUpdate,
    });
  }

  async remove(userId: string, flowId: string) {
    // Check if flow exists and belongs to user
    await this.findOne(userId, flowId);

    return this.prisma.flow.delete({
      where: { id: flowId },
    });
  }

  async generateShareLink(userId: string, flowId: string, permission: 'VIEW' | 'EDIT' = 'EDIT') {
    // Check if flow exists and belongs to user
    await this.findOne(userId, flowId);

    const shareToken = this.generateShareToken();

    return this.prisma.flow.update({
      where: { id: flowId },
      data: {
        isPublic: true,
        shareToken,
        sharePermission: permission,
      },
    });
  }

  async revokeShareLink(userId: string, flowId: string) {
    // Check if flow exists and belongs to user
    await this.findOne(userId, flowId);

    return this.prisma.flow.update({
      where: { id: flowId },
      data: {
        isPublic: false,
        shareToken: null,
      },
    });
  }

  async findByShareToken(shareToken: string) {
    const flow = await this.prisma.flow.findUnique({
      where: { shareToken },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!flow) {
      throw new NotFoundException('Shared canvas not found');
    }

    if (!flow.isPublic) {
      throw new ForbiddenException('This canvas is no longer shared');
    }

    return flow;
  }

  async updateSharedFlow(
    shareToken: string,
    collaboratorUserId: string,
    updateFlowDto: UpdateFlowDto,
    isManualSave: boolean = false
  ) {
    // Find flow by share token
    const flow = await this.prisma.flow.findUnique({
      where: { shareToken },
    });

    if (!flow) {
      throw new NotFoundException('Shared canvas not found');
    }

    if (!flow.isPublic) {
      throw new ForbiddenException('This canvas is no longer shared');
    }

    // Check if user has EDIT permission
    if (flow.sharePermission !== 'EDIT') {
      throw new ForbiddenException('You do not have edit permission for this canvas');
    }

    // Extract isManualSave from DTO to prevent passing it to Prisma
    const { isManualSave: _, ...dataToUpdate } = updateFlowDto;

    // If manual save and nodes/edges are provided, create version and audit log
    if (isManualSave && (updateFlowDto.nodes || updateFlowDto.edges)) {
      const nodes = updateFlowDto.nodes || (flow.nodes as any[]);
      const edges = updateFlowDto.edges || (flow.edges as any[]);

      // Create version snapshot (credited to collaborator)
      const version = await this.versionService.createVersionForCollaborator(
        flow.id,
        collaboratorUserId,
        nodes,
        edges,
        undefined, // description (can be added later)
        false // not an auto-save
      );

      // Create audit log for save (credited to collaborator)
      await this.auditService.logSave(flow.id, collaboratorUserId, version.id, {
        nodeCount: nodes.length,
        edgeCount: edges.length,
      });

      // Detect and log individual changes if there were previous nodes/edges
      const oldNodes = (flow.nodes as any[]) || [];
      const oldEdges = (flow.edges as any[]) || [];
      
      if (oldNodes.length > 0 || oldEdges.length > 0) {
        await this.auditService.detectAndLogChanges(
          flow.id,
          collaboratorUserId,
          oldNodes,
          oldEdges,
          nodes,
          edges
        );
      }
    }

    // Update the flow
    return this.prisma.flow.update({
      where: { id: flow.id },
      data: dataToUpdate,
    });
  }
}
