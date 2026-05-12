-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PROCESSING', 'SUCCESSFUL', 'FAILED');

-- CreateTable
CREATE TABLE "FileMetadata" (
    "id" TEXT NOT NULL,
    "originalPath" TEXT NOT NULL,
    "processedPath" TEXT,
    "status" "Status" NOT NULL DEFAULT 'PROCESSING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileMetadata_pkey" PRIMARY KEY ("id")
);
