import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { KyselyDB } from '@docmost/db/types/kysely.types';
import { SpaceRepo } from '@docmost/db/repos/space/space.repo';
import { PageRepo } from '@docmost/db/repos/page/page.repo';
import { ShareService } from '../share/share.service';
import { validate as isValidUUID } from 'uuid';
import { sql } from 'kysely';
import * as crypto from 'crypto';

@Injectable()
export class DocsPortalService {
  private readonly logger = new Logger(DocsPortalService.name);

  constructor(
    private readonly spaceRepo: SpaceRepo,
    private readonly pageRepo: PageRepo,
    private readonly shareService: ShareService,
    @InjectKysely() private readonly db: KyselyDB,
  ) {}

  async getDocSpace(spaceSlug: string, workspaceId: string) {
    const space = await this.db
      .selectFrom('spaces')
      .selectAll()
      .where('slug', '=', spaceSlug)
      .where('workspaceId', '=', workspaceId)
      .where('type', '=', 'documentation')
      .where('deletedAt', 'is', null)
      .executeTakeFirst();

    if (!space) {
      throw new NotFoundException('Documentation space not found');
    }

    return {
      id: space.id,
      name: space.name,
      slug: space.slug,
      description: space.description,
      logo: space.logo,
      portalSettings: space.portalSettings || {},
    };
  }

  async getDocTree(spaceSlug: string, workspaceId: string) {
    const space = await this.getDocSpaceEntity(spaceSlug, workspaceId);

    const pages = await this.db
      .selectFrom('pages')
      .select([
        'id',
        'title',
        'slugId',
        'icon',
        'parentPageId',
        'position',
        'spaceId',
      ])
      .where('spaceId', '=', space.id)
      .where('workspaceId', '=', workspaceId)
      .where('deletedAt', 'is', null)
      .where((eb) =>
        eb.or([
          eb('isDraft', '=', false),
          eb('isDraft', 'is', null),
        ]),
      )
      .orderBy('position', 'asc')
      .orderBy('title', 'asc')
      .execute();

    return pages;
  }

  async getDocPage(
    spaceSlug: string,
    pageSlug: string,
    workspaceId: string,
  ) {
    const space = await this.getDocSpaceEntity(spaceSlug, workspaceId);

    const pageId = isValidUUID(pageSlug) ? pageSlug : null;
    const slugId = !pageId ? this.extractSlugId(pageSlug) : null;

    let page;
    if (pageId) {
      page = await this.pageRepo.findById(pageId, {
        includeContent: true,
        includeCreator: true,
      });
    } else if (slugId) {
      page = await this.pageRepo.findById(slugId, {
        includeContent: true,
        includeCreator: true,
      });
    }

    if (!page || page.deletedAt || page.spaceId !== space.id) {
      throw new NotFoundException('Page not found');
    }

    if ((page as any).isDraft) {
      throw new NotFoundException('Page not found');
    }

    // Process public attachments
    page.content = await this.shareService.updatePublicAttachments(page);

    return {
      page: {
        id: page.id,
        title: page.title,
        slugId: page.slugId,
        icon: page.icon,
        content: page.content,
        parentPageId: page.parentPageId,
        metaDescription: (page as any).metaDescription,
        coverPhoto: page.coverPhoto,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        creator: (page as any).creator,
      },
      space: {
        id: space.id,
        name: space.name,
        slug: space.slug,
        portalSettings: space.portalSettings || {},
      },
    };
  }

  async getDocSpaceHomePage(spaceSlug: string, workspaceId: string) {
    const space = await this.getDocSpaceEntity(spaceSlug, workspaceId);

    // Get the first root page (no parent) ordered by position
    const firstPage = await this.db
      .selectFrom('pages')
      .select(['id', 'slugId', 'title'])
      .where('spaceId', '=', space.id)
      .where('workspaceId', '=', workspaceId)
      .where('parentPageId', 'is', null)
      .where('deletedAt', 'is', null)
      .where((eb) =>
        eb.or([
          eb('isDraft', '=', false),
          eb('isDraft', 'is', null),
        ]),
      )
      .orderBy('position', 'asc')
      .limit(1)
      .executeTakeFirst();

    return firstPage;
  }

  async searchDocs(spaceSlug: string, query: string, workspaceId: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const space = await this.getDocSpaceEntity(spaceSlug, workspaceId);

    const results = await this.db
      .selectFrom('pages')
      .select([
        'id',
        'title',
        'slugId',
        'icon',
        sql<string>`ts_headline('english', text_content, plainto_tsquery('english', ${query}), 'StartSel=<mark>, StopSel=</mark>, MaxWords=35, MinWords=15, MaxFragments=3')`.as(
          'highlight',
        ),
        sql<number>`ts_rank(tsv, plainto_tsquery('english', ${query}))`.as(
          'rank',
        ),
      ])
      .where('spaceId', '=', space.id)
      .where('workspaceId', '=', workspaceId)
      .where('deletedAt', 'is', null)
      .where((eb) =>
        eb.or([
          eb('isDraft', '=', false),
          eb('isDraft', 'is', null),
        ]),
      )
      .where(sql<boolean>`tsv @@ plainto_tsquery('english', ${query})`)
      .orderBy('rank', 'desc')
      .limit(25)
      .execute();

    return results;
  }

  async generateSitemap(spaceSlug: string, workspaceId: string, baseUrl: string) {
    const space = await this.getDocSpaceEntity(spaceSlug, workspaceId);

    const pages = await this.db
      .selectFrom('pages')
      .select(['slugId', 'title', 'updatedAt'])
      .where('spaceId', '=', space.id)
      .where('workspaceId', '=', workspaceId)
      .where('deletedAt', 'is', null)
      .where((eb) =>
        eb.or([
          eb('isDraft', '=', false),
          eb('isDraft', 'is', null),
        ]),
      )
      .orderBy('position', 'asc')
      .execute();

    const urls = pages.map((page) => {
      const slug = page.title
        ? `${page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${page.slugId}`
        : page.slugId;
      const lastmod = page.updatedAt
        ? new Date(page.updatedAt as any).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      return `  <url>\n    <loc>${baseUrl}/docs/${spaceSlug}/${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  }

  async submitFeedback(
    pageId: string,
    isHelpful: boolean,
    comment: string | null,
    ipAddress: string,
  ) {
    const ipHash = crypto
      .createHash('sha256')
      .update(ipAddress || 'unknown')
      .digest('hex')
      .substring(0, 16);

    await this.db
      .insertInto('pageFeedback')
      .values({
        pageId,
        isHelpful,
        comment: comment || null,
        ipHash,
      })
      .execute();

    return { success: true };
  }

  async trackPageView(
    pageId: string,
    spaceId: string,
    referrer: string | null,
    userAgent: string | null,
  ) {
    const userAgentHash = userAgent
      ? crypto
          .createHash('sha256')
          .update(userAgent)
          .digest('hex')
          .substring(0, 16)
      : null;

    await this.db
      .insertInto('pageViews')
      .values({
        pageId,
        spaceId,
        referrer: referrer || null,
        userAgentHash,
      })
      .execute();
  }

  async getSpaceTranslations(spaceId: string) {
    return this.db
      .selectFrom('spaceTranslations')
      .innerJoin('spaces', 'spaces.id', 'spaceTranslations.targetSpaceId')
      .select([
        'spaceTranslations.locale',
        'spaces.slug as targetSlug',
        'spaces.name as targetName',
      ])
      .where('spaceTranslations.sourceSpaceId', '=', spaceId)
      .execute();
  }

  private async getDocSpaceEntity(spaceSlug: string, workspaceId: string) {
    const space = await this.db
      .selectFrom('spaces')
      .selectAll()
      .where('slug', '=', spaceSlug)
      .where('workspaceId', '=', workspaceId)
      .where('type', '=', 'documentation')
      .where('deletedAt', 'is', null)
      .executeTakeFirst();

    if (!space) {
      throw new NotFoundException('Documentation space not found');
    }

    return space;
  }

  async getAnalytics(spaceId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Total views
    const totalViews = await this.db
      .selectFrom('pageViews')
      .select(sql<number>`count(*)`.as('count'))
      .where('spaceId', '=', spaceId)
      .where('createdAt', '>=', since)
      .executeTakeFirst();

    // Views per day
    const viewsPerDay = await this.db
      .selectFrom('pageViews')
      .select([
        sql<string>`to_char(created_at, 'YYYY-MM-DD')`.as('date'),
        sql<number>`count(*)`.as('count'),
      ])
      .where('spaceId', '=', spaceId)
      .where('createdAt', '>=', since)
      .groupBy(sql`to_char(created_at, 'YYYY-MM-DD')`)
      .orderBy('date', 'asc')
      .execute();

    // Top pages by views
    const topPages = await this.db
      .selectFrom('pageViews')
      .innerJoin('pages', 'pages.id', 'pageViews.pageId')
      .select([
        'pages.id',
        'pages.title',
        'pages.slugId',
        sql<number>`count(*)`.as('views'),
      ])
      .where('pageViews.spaceId', '=', spaceId)
      .where('pageViews.createdAt', '>=', since)
      .groupBy(['pages.id', 'pages.title', 'pages.slugId'])
      .orderBy('views', 'desc')
      .limit(20)
      .execute();

    // Top referrers
    const topReferrers = await this.db
      .selectFrom('pageViews')
      .select([
        'referrer',
        sql<number>`count(*)`.as('count'),
      ])
      .where('spaceId', '=', spaceId)
      .where('createdAt', '>=', since)
      .where('referrer', 'is not', null)
      .where('referrer', '!=', '')
      .groupBy('referrer')
      .orderBy('count', 'desc')
      .limit(10)
      .execute();

    // Feedback stats
    const feedbackStats = await this.db
      .selectFrom('pageFeedback')
      .innerJoin('pages', 'pages.id', 'pageFeedback.pageId')
      .select([
        sql<number>`count(*) filter (where is_helpful = true)`.as('helpful'),
        sql<number>`count(*) filter (where is_helpful = false)`.as('notHelpful'),
        sql<number>`count(*)`.as('total'),
      ])
      .where('pages.spaceId', '=', spaceId)
      .where('pageFeedback.createdAt', '>=', since)
      .executeTakeFirst();

    // Recent feedback with comments
    const recentFeedback = await this.db
      .selectFrom('pageFeedback')
      .innerJoin('pages', 'pages.id', 'pageFeedback.pageId')
      .select([
        'pageFeedback.id',
        'pageFeedback.isHelpful',
        'pageFeedback.comment',
        'pageFeedback.createdAt',
        'pages.title as pageTitle',
        'pages.slugId as pageSlugId',
      ])
      .where('pages.spaceId', '=', spaceId)
      .where('pageFeedback.comment', 'is not', null)
      .orderBy('pageFeedback.createdAt', 'desc')
      .limit(20)
      .execute();

    // Unique visitors (by user_agent_hash)
    const uniqueVisitors = await this.db
      .selectFrom('pageViews')
      .select(sql<number>`count(distinct user_agent_hash)`.as('count'))
      .where('spaceId', '=', spaceId)
      .where('createdAt', '>=', since)
      .executeTakeFirst();

    return {
      period: { days, since: since.toISOString() },
      overview: {
        totalViews: Number(totalViews?.count || 0),
        uniqueVisitors: Number(uniqueVisitors?.count || 0),
        feedbackTotal: Number(feedbackStats?.total || 0),
        feedbackHelpful: Number(feedbackStats?.helpful || 0),
        feedbackNotHelpful: Number(feedbackStats?.notHelpful || 0),
      },
      viewsPerDay: viewsPerDay.map((d) => ({
        date: d.date,
        count: Number(d.count),
      })),
      topPages: topPages.map((p) => ({
        id: p.id,
        title: p.title,
        slugId: p.slugId,
        views: Number(p.views),
      })),
      topReferrers: topReferrers.map((r) => ({
        referrer: r.referrer,
        count: Number(r.count),
      })),
      recentFeedback,
    };
  }

  private extractSlugId(slug: string): string {
    if (!slug) return undefined;
    if (isValidUUID(slug)) return slug;
    const parts = slug.split('-');
    return parts.length > 1 ? parts[parts.length - 1] : slug;
  }
}
