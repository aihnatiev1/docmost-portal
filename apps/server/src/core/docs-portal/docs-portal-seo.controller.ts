import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { DocsPortalService } from './docs-portal.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { join } from 'path';
import * as fs from 'node:fs';
import { WorkspaceRepo } from '@docmost/db/repos/workspace/workspace.repo';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { Workspace } from '@docmost/db/types/entity.types';
import { htmlEscape } from '../../common/helpers/html-escaper';

@Controller('docs')
export class DocsPortalSeoController {
  constructor(
    private readonly docsPortalService: DocsPortalService,
    private workspaceRepo: WorkspaceRepo,
    private environmentService: EnvironmentService,
  ) {}

  @Get([':spaceSlug', ':spaceSlug/:pageSlug'])
  async getDocsPage(
    @Res({ passthrough: false }) res: FastifyReply,
    @Req() req: FastifyRequest,
    @Param('spaceSlug') spaceSlug: string,
    @Param('pageSlug') pageSlug?: string,
  ) {
    let workspace: Workspace = null;
    if (this.environmentService.isSelfHosted()) {
      workspace = await this.workspaceRepo.findFirst();
    } else {
      const header = req.raw.headers.host;
      const subdomain = header.split('.')[0];
      workspace = await this.workspaceRepo.findByHostname(subdomain);
    }

    const clientDistPath = join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'client/dist',
    );

    if (!fs.existsSync(clientDistPath)) {
      res.status(404).send('Not found');
      return;
    }

    const indexFilePath = join(clientDistPath, 'index.html');

    if (!workspace) {
      return this.sendIndex(indexFilePath, res);
    }

    try {
      let metaTitle = 'Documentation';
      let metaDescription = '';
      let canonicalUrl = `${process.env.APP_URL || ''}/docs/${spaceSlug}`;

      if (pageSlug) {
        const result = await this.docsPortalService.getDocPage(
          spaceSlug,
          pageSlug,
          workspace.id,
        );

        const rawTitle = htmlEscape(result.page.title ?? 'untitled');
        metaTitle =
          rawTitle.length > 80 ? `${rawTitle.slice(0, 77)}…` : rawTitle;
        metaDescription = result.page.metaDescription || '';
        canonicalUrl = `${process.env.APP_URL || ''}/docs/${spaceSlug}/${pageSlug}`;
      } else {
        const space = await this.docsPortalService.getDocSpace(
          spaceSlug,
          workspace.id,
        );
        metaTitle = htmlEscape(space.name || 'Documentation');
        metaDescription = space.description || '';
      }

      if (metaDescription.length > 160) {
        metaDescription = metaDescription.substring(0, 157) + '…';
      }

      const metaTagVar = '<!--meta-tags-->';
      const metaTags = [
        `<meta property="og:title" content="${metaTitle}" />`,
        `<meta property="og:description" content="${htmlEscape(metaDescription)}" />`,
        `<meta property="og:type" content="article" />`,
        `<meta property="og:url" content="${canonicalUrl}" />`,
        `<meta name="twitter:title" content="${metaTitle}" />`,
        `<meta name="twitter:description" content="${htmlEscape(metaDescription)}" />`,
        `<link rel="canonical" href="${canonicalUrl}" />`,
      ]
        .filter(Boolean)
        .join('\n    ');

      const html = fs.readFileSync(indexFilePath, 'utf8');
      const transformedHtml = html
        .replace(/<title>[\s\S]*?<\/title>/i, `<title>${metaTitle}</title>`)
        .replace(metaTagVar, metaTags);

      res.type('text/html').send(transformedHtml);
    } catch {
      return this.sendIndex(indexFilePath, res);
    }
  }

  private sendIndex(indexFilePath: string, res: FastifyReply) {
    const stream = fs.createReadStream(indexFilePath);
    res.type('text/html').send(stream);
  }
}
