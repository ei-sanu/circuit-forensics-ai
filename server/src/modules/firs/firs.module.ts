import { Module } from '@nestjs/common';
import { FirsController } from './firs.controller';
import { FirsService } from './firs.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [FirsController],
  providers: [FirsService],
  exports: [FirsService],
})
export class FirsModule {}
