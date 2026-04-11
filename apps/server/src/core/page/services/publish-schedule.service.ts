import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectKysely } from 'nestjs-kysely';
import { KyselyDB } from '@docmost/db/types/kysely.types';

@Injectable()
export class PublishScheduleService {
  private readonly logger = new Logger(PublishScheduleService.name);

  constructor(@InjectKysely() private readonly db: KyselyDB) {}

  // Run every 60 seconds to check for pages scheduled to publish
  @Interval('scheduled-publish', 60 * 1000)
  async processScheduledPublishing() {
    try {
      const now = new Date();

      const result = await this.db
        .updateTable('pages')
        .set({
          isDraft: false,
          publishAt: null,
          updatedAt: now,
        })
        .where('isDraft', '=', true)
        .where('publishAt', 'is not', null)
        .where('publishAt', '<=', now)
        .where('deletedAt', 'is', null)
        .executeTakeFirst();

      const count = Number(result.numUpdatedRows);
      if (count > 0) {
        this.logger.log(`Scheduled publishing: ${count} page(s) published`);
      }
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Scheduled publishing failed: ${error.message}`,
        error.stack,
      );
    }
  }
}
