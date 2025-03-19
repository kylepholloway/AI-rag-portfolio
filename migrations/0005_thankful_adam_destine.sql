ALTER TABLE "embeddings" DROP CONSTRAINT "embeddings_document_id_unique";--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "collection_slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "embedding" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "context" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "unique_document_collection" UNIQUE("document_id","collection_slug");