/*
  Warnings:

  - You are about to drop the column `lessonId` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `quizzes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[moduleId]` on the table `assignments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[moduleId]` on the table `quizzes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `moduleId` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleId` to the `quizzes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_lessonId_fkey";

-- DropIndex
DROP INDEX "assignments_lessonId_key";

-- DropIndex
DROP INDEX "quizzes_lessonId_key";

-- AlterTable
ALTER TABLE "assignments" DROP COLUMN "lessonId",
ADD COLUMN     "moduleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "quizzes" DROP COLUMN "lessonId",
ADD COLUMN     "moduleId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "assignments_moduleId_key" ON "assignments"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_moduleId_key" ON "quizzes"("moduleId");

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
