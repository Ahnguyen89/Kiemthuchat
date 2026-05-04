-- CreateEnum
CREATE TYPE "SharePermission" AS ENUM ('VIEW', 'EDIT');

-- AlterTable
ALTER TABLE "flows" ADD COLUMN "sharePermission" "SharePermission" NOT NULL DEFAULT 'VIEW';

