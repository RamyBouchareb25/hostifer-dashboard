/*
  Warnings:

  - Made the column `triggeredBy` on table `Deployment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Deployment" DROP CONSTRAINT "Deployment_triggeredBy_fkey";

-- AlterTable
ALTER TABLE "Deployment" ALTER COLUMN "triggeredBy" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_triggeredBy_fkey" FOREIGN KEY ("triggeredBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
