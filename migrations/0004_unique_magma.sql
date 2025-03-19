ALTER TABLE "embeddings" ALTER COLUMN "document_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_document_id_unique" UNIQUE("document_id");