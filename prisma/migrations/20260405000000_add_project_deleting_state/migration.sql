-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'DELETING';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "deleteWorkflowName" TEXT;

-- CreateIndex
CREATE INDEX "Project_deleteWorkflowName_idx" ON "Project"("deleteWorkflowName");
