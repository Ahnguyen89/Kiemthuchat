import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query, Inject, forwardRef } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Provider } from '@prisma/client';
import { FlowService } from './flow.service';
import { CanvasAnalysisService } from './canvas-analysis.service';
import { TemplateGeneratorService } from './template-generator.service';
import { FlowVersionService } from './flow-version.service';
import { FlowAuditService } from './flow-audit.service';
import { CreateFlowDto, UpdateFlowDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { CanvasGateway } from '../canvas/canvas.gateway';

@Controller('flows')
export class FlowController {
  constructor(
    private flowService: FlowService,
    private canvasAnalysisService: CanvasAnalysisService,
    private templateGeneratorService: TemplateGeneratorService,
    private versionService: FlowVersionService,
    private auditService: FlowAuditService,
    private prisma: PrismaService,
    @Inject(forwardRef(() => CanvasGateway))
    private canvasGateway: CanvasGateway,
  ) {}

  private async getPreferredAiKey(userId: string): Promise<{ key?: string; provider?: Provider }> {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        userId,
        provider: 'GOOGLE',
        isActive: true,
      },
    });

    if (apiKey) {
      return { key: await this.decryptApiKey(apiKey.keyHash), provider: 'GOOGLE' };
    }

    const openAiKey = await this.prisma.apiKey.findFirst({
      where: {
        userId,
        provider: 'OPENAI',
        isActive: true,
      },
    });

    return openAiKey
      ? { key: await this.decryptApiKey(openAiKey.keyHash), provider: 'OPENAI' }
      : {};
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Request() req) {
    return {
      success: true,
      data: await this.flowService.findAll(req.user.userId),
    };
  }

  @Get('shared/:shareToken')
  async findByShareToken(@Param('shareToken') shareToken: string) {
    return {
      success: true,
      data: await this.flowService.findByShareToken(shareToken),
    };
  }

  @Patch('shared/:shareToken')
  @UseGuards(AuthGuard('jwt'))
  async updateSharedFlow(
    @Request() req,
    @Param('shareToken') shareToken: string,
    @Body() updateFlowDto: UpdateFlowDto
  ) {
    const isManualSave = updateFlowDto.isManualSave ?? false;
    const updatedFlow = await this.flowService.updateSharedFlow(
      shareToken,
      req.user.userId,
      updateFlowDto,
      isManualSave
    );

    // If this was a manual save, notify all connected users via WebSocket
    if (isManualSave) {
      try {
        // Get the latest version to get the version number
        const latestVersion = await this.versionService.getLatestVersion(updatedFlow.id);
        
        // Get user info
        const user = await this.prisma.user.findUnique({
          where: { id: req.user.userId },
          select: { name: true },
        });

        if (latestVersion && user) {
          // Notify all users in the canvas room
          this.canvasGateway.notifyCanvasSaved(
            updatedFlow.id,
            req.user.userId,
            user.name,
            latestVersion.versionNumber
          );
        }
      } catch (error) {
        // Don't fail the request if notification fails
        console.error('Failed to notify canvas save:', error);
      }
    }

    return {
      success: true,
      data: updatedFlow,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Request() req, @Param('id') id: string) {
    return {
      success: true,
      data: await this.flowService.findOne(req.user.userId, id),
    };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() createFlowDto: CreateFlowDto) {
    return {
      success: true,
      data: await this.flowService.create(req.user.userId, createFlowDto),
    };
  }

  @Post(':id/share')
  @UseGuards(AuthGuard('jwt'))
  async generateShareLink(
    @Request() req, 
    @Param('id') id: string,
    @Body() body: { permission?: 'VIEW' | 'EDIT' }
  ) {
    return {
      success: true,
      data: await this.flowService.generateShareLink(
        req.user.userId, 
        id, 
        body.permission || 'EDIT'
      ),
    };
  }

  @Delete(':id/share')
  @UseGuards(AuthGuard('jwt'))
  async revokeShareLink(@Request() req, @Param('id') id: string) {
    return {
      success: true,
      data: await this.flowService.revokeShareLink(req.user.userId, id),
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Request() req, @Param('id') id: string, @Body() updateFlowDto: UpdateFlowDto) {
    const isManualSave = updateFlowDto.isManualSave ?? false;
    return {
      success: true,
      data: await this.flowService.update(req.user.userId, id, updateFlowDto, isManualSave),
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Request() req, @Param('id') id: string) {
    await this.flowService.remove(req.user.userId, id);
    return {
      success: true,
      message: 'Flow deleted successfully',
    };
  }

  @Post(':id/summarize')
  @UseGuards(AuthGuard('jwt'))
  async summarizeCanvas(@Request() req, @Param('id') id: string) {
    // Get the flow to ensure user has access
    const flow = await this.flowService.findOne(req.user.userId, id);
    
    const aiKey = await this.getPreferredAiKey(req.user.userId);

    // Parse nodes and edges from JSON
    const nodes = Array.isArray(flow.nodes) ? flow.nodes as any[] : [];
    const edges = Array.isArray(flow.edges) ? flow.edges as any[] : [];

    const summary = await this.canvasAnalysisService.summarizeCanvas(
      nodes,
      edges,
      aiKey.key,
      aiKey.provider,
    );

    return {
      success: true,
      data: { summary },
    };
  }

  @Post(':id/ask')
  @UseGuards(AuthGuard('jwt'))
  async askQuestion(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { question: string }
  ) {
    if (!body.question) {
      return {
        success: false,
        message: 'Question is required',
      };
    }

    // Get the flow to ensure user has access
    const flow = await this.flowService.findOne(req.user.userId, id);
    
    const aiKey = await this.getPreferredAiKey(req.user.userId);

    // Parse nodes and edges from JSON
    const nodes = Array.isArray(flow.nodes) ? flow.nodes as any[] : [];
    const edges = Array.isArray(flow.edges) ? flow.edges as any[] : [];

    const answer = await this.canvasAnalysisService.answerQuestion(
      nodes,
      edges,
      body.question,
      aiKey.key,
      aiKey.provider,
    );

    return {
      success: true,
      data: { answer },
    };
  }

  @Post(':id/embeddings')
  @UseGuards(AuthGuard('jwt'))
  async generateEmbeddings(@Request() req, @Param('id') id: string) {
    // Get the flow to ensure user has access
    const flow = await this.flowService.findOne(req.user.userId, id);
    
    const aiKey = await this.getPreferredAiKey(req.user.userId);

    // Parse nodes and edges from JSON
    const nodes = Array.isArray(flow.nodes) ? flow.nodes as any[] : [];
    const edges = Array.isArray(flow.edges) ? flow.edges as any[] : [];

    const embeddings = await this.canvasAnalysisService.generateEmbeddings(
      nodes,
      edges,
      aiKey.key,
    );

    return {
      success: true,
      data: { embeddings, dimension: embeddings.length },
    };
  }

  // Helper method to decrypt API key (simplified - you should use proper encryption)
  private async decryptApiKey(keyHash: string): Promise<string> {
    // For now, we assume the keyHash is the actual key
    // In production, you should use proper encryption/decryption
    return keyHash;
  }

  // Template Generation endpoints
  @Post('templates/generate')
  @UseGuards(AuthGuard('jwt'))
  async generateTemplate(
    @Request() req,
    @Body() body: { description: string; category?: string; nodeCount?: number }
  ) {
    if (!body.description) {
      return {
        success: false,
        message: 'Description is required',
      };
    }

    const aiKey = await this.getPreferredAiKey(req.user.userId);

    const template = await this.templateGeneratorService.generateTemplate(
      {
        description: body.description,
        category: body.category,
        nodeCount: body.nodeCount,
      },
      aiKey.key,
      aiKey.provider,
    );

    return {
      success: true,
      data: template,
    };
  }

  @Post('templates/suggestions')
  @UseGuards(AuthGuard('jwt'))
  async generateTemplateSuggestions(
    @Request() req,
    @Body() body: { description: string }
  ) {
    if (!body.description) {
      return {
        success: false,
        message: 'Description is required',
      };
    }

    const aiKey = await this.getPreferredAiKey(req.user.userId);

    const suggestions = await this.templateGeneratorService.generateTemplateSuggestions(
      body.description,
      aiKey.key,
      aiKey.provider,
    );

    return {
      success: true,
      data: { suggestions },
    };
  }

  // Version Control Endpoints

  @Get(':id/versions')
  @UseGuards(AuthGuard('jwt'))
  async getVersions(@Request() req, @Param('id') id: string) {
    return {
      success: true,
      data: await this.versionService.getVersions(id, req.user.userId),
    };
  }

  @Get(':id/versions/:versionId')
  @UseGuards(AuthGuard('jwt'))
  async getVersion(
    @Request() req,
    @Param('id') id: string,
    @Param('versionId') versionId: string
  ) {
    return {
      success: true,
      data: await this.versionService.getVersion(versionId, req.user.userId),
    };
  }

  @Post(':id/revert/:versionId')
  @UseGuards(AuthGuard('jwt'))
  async revertToVersion(
    @Request() req,
    @Param('id') id: string,
    @Param('versionId') versionId: string
  ) {
    const result = await this.versionService.revertToVersion(id, versionId, req.user.userId);
    
    // Log the revert action
    await this.auditService.logRevert(
      id,
      req.user.userId,
      result.revertedFrom.id,
      result.version.id
    );

    return {
      success: true,
      data: result,
      message: `Reverted to version ${result.revertedFrom.versionNumber}`,
    };
  }

  @Get(':id/versions/:versionId/compare')
  @UseGuards(AuthGuard('jwt'))
  async compareWithCurrent(
    @Request() req,
    @Param('id') id: string,
    @Param('versionId') versionId: string
  ) {
    return {
      success: true,
      data: await this.versionService.compareWithCurrent(versionId, req.user.userId),
    };
  }

  @Get(':id/compare/:v1/:v2')
  @UseGuards(AuthGuard('jwt'))
  async compareVersions(
    @Request() req,
    @Param('id') id: string,
    @Param('v1') versionId1: string,
    @Param('v2') versionId2: string
  ) {
    return {
      success: true,
      data: await this.versionService.compareVersions(versionId1, versionId2, req.user.userId),
    };
  }

  @Get(':id/audit-log')
  @UseGuards(AuthGuard('jwt'))
  async getAuditLog(
    @Request() req,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const offsetNum = offset ? parseInt(offset, 10) : 0;

    return {
      success: true,
      data: await this.auditService.getAuditLog(
        id,
        req.user.userId,
        limitNum,
        offsetNum
      ),
    };
  }
}
