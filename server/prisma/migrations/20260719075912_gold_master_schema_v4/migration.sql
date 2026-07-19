/*
  Warnings:

  - You are about to drop the column `date` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `activities` table. All the data in the column will be lost.
  - The `type` column on the `activities` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `table` on the `audit_logs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[activityId,teamId]` on the table `activity_results` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[conferenceId,name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[conferenceId,name]` on the table `teams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `activities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `activities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `activity_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityType` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('GAME', 'LECTURE', 'MEMORY', 'MASS', 'ROAD', 'OTHER');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('USER', 'CONFERENCE', 'TEAM', 'MEMBER', 'CATEGORY', 'REASON', 'TRANSACTION', 'ACTIVITY', 'ACTIVITY_RESULT');

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "date",
DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "startTime" TIMESTAMP(3),
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "totalPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "ActivityType" NOT NULL DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "activity_results" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "table",
ADD COLUMN     "entityType" "EntityType" NOT NULL;

-- AlterTable
ALTER TABLE "conferences" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "code" TEXT,
ADD COLUMN     "photo" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "activity_results_activityId_idx" ON "activity_results"("activityId");

-- CreateIndex
CREATE INDEX "activity_results_teamId_idx" ON "activity_results"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "activity_results_activityId_teamId_key" ON "activity_results"("activityId", "teamId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "categories_conferenceId_name_key" ON "categories"("conferenceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "members_code_key" ON "members"("code");

-- CreateIndex
CREATE INDEX "reasons_categoryId_idx" ON "reasons"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "teams_conferenceId_name_key" ON "teams"("conferenceId", "name");

-- CreateIndex
CREATE INDEX "transactions_createdById_idx" ON "transactions"("createdById");

-- AddForeignKey
ALTER TABLE "activity_results" ADD CONSTRAINT "activity_results_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
