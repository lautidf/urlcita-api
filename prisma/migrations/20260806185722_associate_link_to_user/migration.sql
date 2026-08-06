/*
  Warnings:

  - Added the required column `creatorId` to the `Link` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
