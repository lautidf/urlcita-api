-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_creatorId_fkey";

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
