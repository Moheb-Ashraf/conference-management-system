/*
  Warnings:

  - You are about to drop the column `createdBy` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConferenceStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'FINISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('MEMBER', 'TEAM');

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_createdBy_fkey";

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "entityId" TEXT;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "color" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "conferences" ADD COLUMN     "logo" TEXT,
ADD COLUMN     "status" "ConferenceStatus" NOT NULL DEFAULT 'UPCOMING',
ADD COLUMN     "theme" TEXT;

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "church" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "reasons" ADD COLUMN     "isPositive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "color" TEXT DEFAULT '#000000',
ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" "TransactionSource" NOT NULL DEFAULT 'MEMBER';

-- CreateTable
CREATE TABLE "conference_settings" (
    "id" TEXT NOT NULL,
    "conferenceId" TEXT NOT NULL,
    "versePoint" INTEGER NOT NULL DEFAULT 1,
    "questionPoint" INTEGER NOT NULL DEFAULT 5,
    "behaviorInitialScore" INTEGER NOT NULL DEFAULT 100,
    "firstPlacePoints" INTEGER NOT NULL DEFAULT 30,
    "secondPlacePoints" INTEGER NOT NULL DEFAULT 20,
    "thirdPlacePoints" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "conference_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT,
    "conferenceId" TEXT NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_results" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "position" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "activity_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conference_settings_conferenceId_key" ON "conference_settings"("conferenceId");

-- CreateIndex
CREATE INDEX "activities_conferenceId_idx" ON "activities"("conferenceId");

-- CreateIndex
CREATE INDEX "categories_conferenceId_idx" ON "categories"("conferenceId");

-- CreateIndex
CREATE INDEX "members_teamId_idx" ON "members"("teamId");

-- CreateIndex
CREATE INDEX "teams_conferenceId_idx" ON "teams"("conferenceId");

-- CreateIndex
CREATE INDEX "transactions_conferenceId_idx" ON "transactions"("conferenceId");

-- CreateIndex
CREATE INDEX "transactions_teamId_idx" ON "transactions"("teamId");

-- CreateIndex
CREATE INDEX "transactions_memberId_idx" ON "transactions"("memberId");

-- CreateIndex
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");

-- AddForeignKey
ALTER TABLE "conference_settings" ADD CONSTRAINT "conference_settings_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "conferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "conferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_results" ADD CONSTRAINT "activity_results_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_results" ADD CONSTRAINT "activity_results_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
