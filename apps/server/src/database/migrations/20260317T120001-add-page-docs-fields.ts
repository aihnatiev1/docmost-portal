import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('pages')
    .addColumn('is_draft', 'boolean', (col) => col.defaultTo(false))
    .execute();

  await db.schema
    .alterTable('pages')
    .addColumn('publish_at', 'timestamptz')
    .execute();

  await db.schema
    .alterTable('pages')
    .addColumn('meta_description', 'text')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('pages').dropColumn('is_draft').execute();
  await db.schema.alterTable('pages').dropColumn('publish_at').execute();
  await db.schema.alterTable('pages').dropColumn('meta_description').execute();
}
