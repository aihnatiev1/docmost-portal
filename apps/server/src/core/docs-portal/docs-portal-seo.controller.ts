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
    return this.renderDocsPage(res, req, spaceSlug, pageSlug);
  }

  async renderDocsPage(
    res: FastifyReply,
    req: FastifyRequest,
    spaceSlug: string,
    pageSlug?: string,
    locale?: string,
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

    const localePrefix = locale ? `/${locale}` : '';
    const appUrl = process.env.APP_URL || '';

    try {
      let metaTitle = 'Documentation';
      let metaDescription = '';
      let canonicalUrl = `${appUrl}${localePrefix}/docs/${spaceSlug}`;
      let jsonLd = '';

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
        canonicalUrl = `${appUrl}${localePrefix}/docs/${spaceSlug}/${pageSlug}`;

        const pageUpdatedAt = result.page.updatedAt
          ? new Date(result.page.updatedAt).toISOString()
          : null;
        const pageCreatedAt = result.page.createdAt
          ? new Date(result.page.createdAt).toISOString()
          : null;

        const articleJsonLd: Record<string, any> = {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: result.page.title || 'Untitled',
          url: canonicalUrl,
          ...(metaDescription && { description: metaDescription }),
          ...(pageCreatedAt && { datePublished: pageCreatedAt }),
          ...(pageUpdatedAt && { dateModified: pageUpdatedAt }),
          ...(locale && { inLanguage: locale }),
          publisher: {
            '@type': 'Organization',
            name: workspace.name || 'Documentation',
          },
          isPartOf: {
            '@type': 'WebSite',
            name: result.space?.name || spaceSlug,
            url: `${appUrl}${localePrefix}/docs/${spaceSlug}`,
          },
        };
        jsonLd = `<script type="application/ld+json">${JSON.stringify(articleJsonLd)}</script>`;
      } else {
        const space = await this.docsPortalService.getDocSpace(
          spaceSlug,
          workspace.id,
        );
        metaTitle = htmlEscape(space.name || 'Documentation');
        metaDescription = space.description || '';

        const websiteJsonLd: Record<string, any> = {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: space.name || 'Documentation',
          url: canonicalUrl,
          ...(metaDescription && { description: metaDescription }),
          ...(locale && { inLanguage: locale }),
          publisher: {
            '@type': 'Organization',
            name: workspace.name || 'Documentation',
          },
        };
        jsonLd = `<script type="application/ld+json">${JSON.stringify(websiteJsonLd)}</script>`;
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
        locale ? `<meta property="og:locale" content="${htmlEscape(locale)}" />` : '',
        `<meta name="twitter:title" content="${metaTitle}" />`,
        `<meta name="twitter:description" content="${htmlEscape(metaDescription)}" />`,
        `<link rel="canonical" href="${canonicalUrl}" />`,
        jsonLd,
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

@Controller()
export class DocsPortalLocaleSeoController {
  constructor(
    private readonly docsPortalService: DocsPortalService,
    private workspaceRepo: WorkspaceRepo,
    private environmentService: EnvironmentService,
  ) {}

  @Get([':locale/docs/:spaceSlug', ':locale/docs/:spaceSlug/:pageSlug'])
  async getLocalizedDocsPage(
    @Res({ passthrough: false }) res: FastifyReply,
    @Req() req: FastifyRequest,
    @Param('locale') locale: string,
    @Param('spaceSlug') spaceSlug: string,
    @Param('pageSlug') pageSlug?: string,
  ) {
    // Reuse the same render logic with locale
    const seo = new DocsPortalSeoController(
      this.docsPortalService,
      this.workspaceRepo,
      this.environmentService,
    );
    return seo.renderDocsPage(res, req, spaceSlug, pageSlug, locale);
  }
}
