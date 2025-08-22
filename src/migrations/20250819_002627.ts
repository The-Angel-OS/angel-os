import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_sub_tiers_content_access" AS ENUM('premium_posts', 'exclusive_videos', 'private_messages', 'live_streams', 'custom_content', 'early_access');
  CREATE TABLE "sub_tiers_content_access" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_sub_tiers_content_access",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "sub_tiers_content_access" ADD CONSTRAINT "sub_tiers_content_access_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sub_tiers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "sub_tiers_content_access_order_idx" ON "sub_tiers_content_access" USING btree ("order");
  CREATE INDEX "sub_tiers_content_access_parent_idx" ON "sub_tiers_content_access" USING btree ("parent_id");
  DROP TYPE "public"."content_access";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."content_access" AS ENUM('premium_posts', 'exclusive_videos', 'private_messages', 'live_streams', 'custom_content', 'early_access');
  DROP TABLE "sub_tiers_content_access" CASCADE;
  DROP TYPE "public"."enum_sub_tiers_content_access";`)
}
