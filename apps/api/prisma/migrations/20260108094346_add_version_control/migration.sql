-- CreateTable
CREATE TABLE "flow_versions" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "isAutoSave" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "flow_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flow_audit_logs" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "versionId" TEXT,

    CONSTRAINT "flow_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flow_versions_flowId_createdAt_idx" ON "flow_versions"("flowId", "createdAt");

-- CreateIndex
CREATE INDEX "flow_versions_flowId_versionNumber_idx" ON "flow_versions"("flowId", "versionNumber");

-- CreateIndex
CREATE INDEX "flow_audit_logs_flowId_timestamp_idx" ON "flow_audit_logs"("flowId", "timestamp");

-- CreateIndex
CREATE INDEX "flow_audit_logs_userId_timestamp_idx" ON "flow_audit_logs"("userId", "timestamp");

-- AddForeignKey
ALTER TABLE "flow_versions" ADD CONSTRAINT "flow_versions_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "flows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_versions" ADD CONSTRAINT "flow_versions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_audit_logs" ADD CONSTRAINT "flow_audit_logs_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "flows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_audit_logs" ADD CONSTRAINT "flow_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_audit_logs" ADD CONSTRAINT "flow_audit_logs_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "flow_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
