import { Module, forwardRef } from '@nestjs/common';
import { FlowController } from './flow.controller';
import { FlowService } from './flow.service';
import { CanvasAnalysisService } from './canvas-analysis.service';
import { TemplateGeneratorService } from './template-generator.service';
import { FlowVersionService } from './flow-version.service';
import { FlowAuditService } from './flow-audit.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CanvasModule } from '../canvas/canvas.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => CanvasModule),
  ],
  controllers: [FlowController],
  providers: [
    FlowService,
    CanvasAnalysisService,
    TemplateGeneratorService,
    FlowVersionService,
    FlowAuditService,
  ],
  exports: [FlowVersionService, FlowAuditService, FlowService],
})
export class FlowModule {}
