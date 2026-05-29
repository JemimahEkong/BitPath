/*
  Warnings:

  - You are about to drop the column `lesson` on the `lesson_progress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,lessonId]` on the table `lesson_progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lessonId` to the `lesson_progress` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConversationMode" AS ENUM ('GENERAL', 'QUIZ', 'LESSON', 'TUTORIAL');

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "contextSummary" TEXT,
ADD COLUMN     "conversationMode" "ConversationMode" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "currentLessonId" TEXT;

-- AlterTable
ALTER TABLE "lesson_progress" DROP COLUMN "lesson",
ADD COLUMN     "lessonId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "quiz_attempts" ADD COLUMN     "quizQuestionId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "totalXp" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_userId_lessonId_key" ON "lesson_progress"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_currentLessonId_fkey" FOREIGN KEY ("currentLessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
