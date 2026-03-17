import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { DocsPortalService } from './docs-portal.service';
import { Public } from '../../common/decorators/public.decorator';
import { FeedbackDto } from './dto/docs-portal.dto';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller('docs-portal')
export class DocsPortalController {
  constructor(private readonly docsPortalService: DocsPortalService) {}

  @Public()
  @Get(':spaceSlug')
  async getDocSpace(
    @Param('spaceSlug') spaceSlug: string,
    @Req() req: FastifyRequest,
  ) {
    const workspaceId = req.raw['workspaceId'];
    return this.docsPortalService.getDocSpace(spaceSlug, workspaceId);
  }

  @Public()
  @Get(':spaceSlug/home')
  async getDocSpaceHome(
    @Param('spaceSlug') spaceSlug: string,
    @Req() req: FastifyRequest,
  ) {
    const workspaceId = req.raw['workspaceId'];
    return this.docsPortalService.getDocSpaceHomePage(spaceSlug, workspaceId);
  }

  @Public()
  @Get(':spaceSlug/tree')
  async getDocTree(
    @Param('spaceSlug') spaceSlug: string,
    @Req() req: FastifyRequest,
  ) {
    const workspaceId = req.raw['workspaceId'];
    return this.docsPortalService.getDocTree(spaceSlug, workspaceId);
  }

  @Public()
  @Get(':spaceSlug/pages/:pageSlug')
  async getDocPage(
    @Param('spaceSlug') spaceSlug: string,
    @Param('pageSlug') pageSlug: string,
    @Req() req: FastifyRequest,
  ) {
    const workspaceId = req.raw['workspaceId'];

    // Track page view async (fire-and-forget)
    const result = await this.docsPortalService.getDocPage(
      spaceSlug,
      pageSlug,
      workspaceId,
    );

    this.docsPortalService
      .trackPageView(
        result.page.id,
        result.space.id,
        req.headers.referer || null,
        req.headers['user-agent'] || null,
      )
      .catch(() => {});

    return result;
  }

  @Public()
  @Get(':spaceSlug/search')
  async searchDocs(
    @Param('spaceSlug') spaceSlug: string,
    @Query('q') query: string,
    @Req() req: FastifyRequest,
  ) {
    const workspaceId = req.raw['workspaceId'];
    return this.docsPortalService.searchDocs(spaceSlug, query, workspaceId);
  }

  @Public()
  @Get(':spaceSlug/sitemap.xml')
  async getSitemap(
    @Param('spaceSlug') spaceSlug: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: false }) res: FastifyReply,
  ) {
    const workspaceId = req.raw['workspaceId'];
    const baseUrl =
      process.env.APP_URL || `${req.protocol}://${req.hostname}`;
    const sitemap = await this.docsPortalService.generateSitemap(
      spaceSlug,
      workspaceId,
      baseUrl,
    );
    res.type('application/xml').send(sitemap);
  }

  @Public()
  @Get(':spaceSlug/translations')
  async getTranslations(
    @Param('spaceSlug') spaceSlug: string,
    @Req() req: FastifyRequest,
  ) {
    const workspaceId = req.raw['workspaceId'];
    const space = await this.docsPortalService.getDocSpace(
      spaceSlug,
      workspaceId,
    );
    return this.docsPortalService.getSpaceTranslations(space.id);
  }

  @Public()
  @Post('feedback')
  async submitFeedback(
    @Body() feedbackDto: FeedbackDto,
    @Req() req: FastifyRequest,
  ) {
    const ip = req.ip || req.raw.socket?.remoteAddress || 'unknown';
    return this.docsPortalService.submitFeedback(
      feedbackDto.pageId,
      feedbackDto.isHelpful,
      feedbackDto.comment || null,
      ip,
    );
  }
}
