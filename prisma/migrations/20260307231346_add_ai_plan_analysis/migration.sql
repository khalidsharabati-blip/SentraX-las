-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('CCTV', 'FIRE_ALARM', 'INTRUSION', 'NETWORK', 'MIXED');

-- CreateTable
CREATE TABLE "plans" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "plan_type" "PlanType" NOT NULL DEFAULT 'MIXED',
    "page_count" INTEGER NOT NULL DEFAULT 1,
    "uploaded_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_legends" (
    "id" SERIAL NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "symbol_name" TEXT NOT NULL,
    "symbol_label" TEXT NOT NULL,
    "symbol_category" TEXT NOT NULL DEFAULT '',
    "learned_manually" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "plan_legends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_detections" (
    "id" SERIAL NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "symbol_name" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "page_number" INTEGER NOT NULL DEFAULT 1,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "room_name" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "plan_detections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_analysis_reports" (
    "id" SERIAL NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "recommendations" TEXT NOT NULL DEFAULT '',
    "quantities_json" JSONB,
    "issues_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_analysis_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_symbol_memory" (
    "id" SERIAL NOT NULL,
    "symbol_name" TEXT NOT NULL,
    "aliases" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_symbol_memory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_legends" ADD CONSTRAINT "plan_legends_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_detections" ADD CONSTRAINT "plan_detections_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_analysis_reports" ADD CONSTRAINT "plan_analysis_reports_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
