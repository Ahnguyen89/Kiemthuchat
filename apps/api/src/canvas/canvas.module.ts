import { Module, forwardRef } from '@nestjs/common';
import { CanvasGateway } from './canvas.gateway';
import { FlowModule } from '../flow/flow.module';

@Module({
  imports: [forwardRef(() => FlowModule)],
  providers: [CanvasGateway],
  exports: [CanvasGateway],
})
export class CanvasModule {}

