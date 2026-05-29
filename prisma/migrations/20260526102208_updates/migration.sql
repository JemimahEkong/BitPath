-- AlterTable
ALTER TABLE "quiz_attempts" ADD COLUMN     "satoshiEarned" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "passedQuizCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quizQuestionCount" INTEGER NOT NULL DEFAULT 10;
