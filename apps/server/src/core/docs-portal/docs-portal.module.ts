import { Module } from '@nestjs/common';
import { DocsPortalController } from './docs-portal.controller';
import { DocsPortalService } from './docs-portal.service';
import { DocsPortalSeoController } from './docs-portal-seo.controller';
import { ShareModule } from '../share/share.module';
import { TokenModule } from '../auth/token.module';

@Module({
  imports: [ShareModule, TokenModule],
  controllers: [DocsPortalController, DocsPortalSeoController],
  providers: [DocsPortalService],
  exports: [DocsPortalService],
})
export class DocsPortalModule {}
