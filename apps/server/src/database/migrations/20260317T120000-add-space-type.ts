import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('spaces')
    .addColumn('type', 'varchar(20)', (col) => col.defaultTo('default'))
    .execute();

  await db.schema
    .alterTable('spaces')
    .addColumn('portal_settings', 'jsonb', (col) => col.defaultTo(sql`'{}'::jsonb`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('spaces').dropColumn('type').execute();
  await db.schema.alterTable('spaces').dropColumn('portal_settings').execute();
}
