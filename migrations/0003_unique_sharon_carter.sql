ALTER TABLE "embeddings" DROP CONSTRAINT "embeddings_document_id_unique";--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "document_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "collection_slug" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "embedding" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "context" text;