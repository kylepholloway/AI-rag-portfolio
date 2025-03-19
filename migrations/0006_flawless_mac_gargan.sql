ALTER TABLE "embeddings" DROP CONSTRAINT "unique_document_collection";--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "collection_slug" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "embedding" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "context" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_document_id_unique" UNIQUE("document_id");