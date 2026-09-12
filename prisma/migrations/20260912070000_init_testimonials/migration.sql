-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TestimonialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NoteColor" AS ENUM ('PAPER', 'YELLOW', 'SAGE', 'ROSE');

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "submissionKey" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "message" VARCHAR(280) NOT NULL,
    "context" VARCHAR(80),
    "color" "NoteColor" NOT NULL DEFAULT 'PAPER',
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "TestimonialStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardRateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoardRateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Testimonial_submissionKey_key" ON "Testimonial"("submissionKey");

-- CreateIndex
CREATE INDEX "Testimonial_status_createdAt_idx" ON "Testimonial"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BoardRateLimit_expiresAt_idx" ON "BoardRateLimit"("expiresAt");

ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_content_check"
CHECK (char_length(btrim("name")) BETWEEN 2 AND 60 AND char_length(btrim("message")) BETWEEN 10 AND 280);
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_position_check"
CHECK ("x" BETWEEN 0 AND 1 AND "y" BETWEEN 0 AND 1 AND "rotation" BETWEEN -3 AND 3);
