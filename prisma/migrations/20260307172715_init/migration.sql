-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('TAX_INVOICE', 'TAX_INVOICE_RECEIPT', 'CREDIT_NOTE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CHECK', 'BANK_TRANSFER', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_PARTS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL', 'SICK', 'PERSONAL', 'UNPAID');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('MONTHLY', 'HOURLY', 'DAILY');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE');

-- CreateEnum
CREATE TYPE "SerialStatus" AS ENUM ('IN_STOCK', 'INSTALLED', 'RETURNED', 'DEFECTIVE');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR', 'DEBUG');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "language" TEXT NOT NULL DEFAULT 'ar',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "record_id" INTEGER,
    "old_data" JSONB,
    "new_data" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "company_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "id_number" TEXT,
    "customer_type" "CustomerType" NOT NULL DEFAULT 'BUSINESS',
    "tax_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_contacts" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "contact_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "customer_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_sites" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "site_name" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "gps_lat" DECIMAL(10,7),
    "gps_lng" DECIMAL(10,7),

    CONSTRAINT "customer_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_documents" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "doc_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "project_number" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "site_id" INTEGER,
    "project_manager_id" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "project_type" TEXT NOT NULL DEFAULT 'general',
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "start_date" DATE,
    "end_date" DATE,
    "estimated_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actual_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "has_cameras" BOOLEAN NOT NULL DEFAULT false,
    "has_alarm" BOOLEAN NOT NULL DEFAULT false,
    "has_fire" BOOLEAN NOT NULL DEFAULT false,
    "has_gates" BOOLEAN NOT NULL DEFAULT false,
    "has_access_control" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_tasks" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "assigned_to" INTEGER,
    "task_name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "due_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_materials" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "qty_used" DECIMAL(10,2) NOT NULL,
    "unit_cost" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "project_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_maps" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "map_markers" (
    "id" SERIAL NOT NULL,
    "map_id" INTEGER NOT NULL,
    "marker_type" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "x" DECIMAL(8,2) NOT NULL,
    "y" DECIMAL(8,2) NOT NULL,

    CONSTRAINT "map_markers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "item_code" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_he" TEXT NOT NULL DEFAULT '',
    "name_en" TEXT NOT NULL DEFAULT '',
    "category_id" INTEGER,
    "brand_id" INTEGER,
    "unit" TEXT NOT NULL DEFAULT 'unit',
    "item_type" TEXT NOT NULL DEFAULT 'equipment',
    "purchase_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sell_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "min_stock_alert" INTEGER NOT NULL DEFAULT 0,
    "warranty_months" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL DEFAULT '',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "parent_id" INTEGER,

    CONSTRAINT "item_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_brands" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "item_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_balances" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "qty_available" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "stock_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER,
    "project_id" INTEGER,
    "movement_type" "MovementType" NOT NULL,
    "qty" DECIMAL(10,2) NOT NULL,
    "unit_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "reference" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "movement_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serial_numbers" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "serial_number" TEXT NOT NULL,
    "status" "SerialStatus" NOT NULL DEFAULT 'IN_STOCK',
    "warranty_end_date" DATE,
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "serial_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "vat" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" SERIAL NOT NULL,
    "quote_number" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vat_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.17,
    "vat_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "valid_until" DATE,
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_items" (
    "id" SERIAL NOT NULL,
    "quote_id" INTEGER NOT NULL,
    "item_id" INTEGER,
    "description" TEXT NOT NULL,
    "qty" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "quote_id" INTEGER,
    "invoice_type" "InvoiceType" NOT NULL DEFAULT 'TAX_INVOICE',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vat_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.17,
    "vat_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "issue_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" DATE,
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "item_id" INTEGER,
    "description" TEXT NOT NULL,
    "qty" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "payment_number" TEXT NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT NOT NULL DEFAULT '',
    "payment_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_notes" (
    "id" SERIAL NOT NULL,
    "delivery_number" TEXT NOT NULL,
    "project_id" INTEGER,
    "invoice_id" INTEGER,
    "delivery_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_note_items" (
    "id" SERIAL NOT NULL,
    "delivery_note_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "qty" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "delivery_note_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_sequences" (
    "id" SERIAL NOT NULL,
    "doc_type" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "last_number" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "document_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "full_name" TEXT NOT NULL,
    "id_number" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "position" TEXT NOT NULL DEFAULT '',
    "department" TEXT NOT NULL DEFAULT '',
    "salary" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "salary_type" "SalaryType" NOT NULL DEFAULT 'MONTHLY',
    "contract_type" "ContractType" NOT NULL DEFAULT 'FULL_TIME',
    "hire_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_attendance" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "work_date" DATE NOT NULL,
    "clock_in" TIMESTAMP(3),
    "clock_out" TIMESTAMP(3),
    "total_hours" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "overtime" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "employee_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_leaves" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "leave_type" "LeaveType" NOT NULL,
    "from_date" DATE NOT NULL,
    "to_date" DATE NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" INTEGER,
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salaries" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "base_salary" DECIMAL(10,2) NOT NULL,
    "overtime_pay" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bonuses" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "net_salary" DECIMAL(10,2) NOT NULL,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "employee_salaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_contracts" (
    "id" SERIAL NOT NULL,
    "contract_number" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "visits_per_year" INTEGER NOT NULL DEFAULT 4,
    "annual_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_tickets" (
    "id" SERIAL NOT NULL,
    "ticket_number" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "contract_id" INTEGER,
    "assigned_tech_id" INTEGER,
    "issue_type" TEXT NOT NULL DEFAULT 'general',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "service_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_visits" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "tech_id" INTEGER,
    "visit_date" DATE NOT NULL,
    "duration" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "work_done" TEXT NOT NULL DEFAULT '',
    "result" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_parts" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "qty_used" INTEGER NOT NULL DEFAULT 1,
    "billable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "service_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_he" TEXT NOT NULL DEFAULT '',
    "name_en" TEXT NOT NULL DEFAULT '',
    "vat_number" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "logo_path" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_settings" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" SERIAL NOT NULL,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "context" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_module_action_key" ON "permissions"("module", "action");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "audit_logs_module_action_idx" ON "audit_logs"("module", "action");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "login_sessions_token_key" ON "login_sessions"("token");

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "customers"("name");

-- CreateIndex
CREATE INDEX "customers_phone_idx" ON "customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "projects_project_number_key" ON "projects"("project_number");

-- CreateIndex
CREATE INDEX "projects_customer_id_idx" ON "projects"("customer_id");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE UNIQUE INDEX "items_item_code_key" ON "items"("item_code");

-- CreateIndex
CREATE INDEX "items_item_code_idx" ON "items"("item_code");

-- CreateIndex
CREATE UNIQUE INDEX "stock_balances_item_id_warehouse_id_key" ON "stock_balances"("item_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "stock_movements_item_id_idx" ON "stock_movements"("item_id");

-- CreateIndex
CREATE INDEX "stock_movements_movement_date_idx" ON "stock_movements"("movement_date");

-- CreateIndex
CREATE UNIQUE INDEX "serial_numbers_serial_number_key" ON "serial_numbers"("serial_number");

-- CreateIndex
CREATE INDEX "serial_numbers_serial_number_idx" ON "serial_numbers"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_quote_number_key" ON "quotes"("quote_number");

-- CreateIndex
CREATE INDEX "quotes_customer_id_idx" ON "quotes"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_quote_id_key" ON "invoices"("quote_id");

-- CreateIndex
CREATE INDEX "invoices_customer_id_idx" ON "invoices"("customer_id");

-- CreateIndex
CREATE INDEX "invoices_payment_status_idx" ON "invoices"("payment_status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_number_key" ON "payments"("payment_number");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_notes_delivery_number_key" ON "delivery_notes"("delivery_number");

-- CreateIndex
CREATE UNIQUE INDEX "document_sequences_doc_type_year_key" ON "document_sequences"("doc_type", "year");

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");

-- CreateIndex
CREATE INDEX "employee_attendance_employee_id_work_date_idx" ON "employee_attendance"("employee_id", "work_date");

-- CreateIndex
CREATE UNIQUE INDEX "employee_salaries_employee_id_month_year_key" ON "employee_salaries"("employee_id", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_contracts_contract_number_key" ON "maintenance_contracts"("contract_number");

-- CreateIndex
CREATE UNIQUE INDEX "service_tickets_ticket_number_key" ON "service_tickets"("ticket_number");

-- CreateIndex
CREATE INDEX "service_tickets_status_idx" ON "service_tickets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "company_settings_company_id_key_key" ON "company_settings"("company_id", "key");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "system_logs_level_idx" ON "system_logs"("level");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_sessions" ADD CONSTRAINT "login_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_sites" ADD CONSTRAINT "customer_sites_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_documents" ADD CONSTRAINT "customer_documents_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "customer_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_project_manager_id_fkey" FOREIGN KEY ("project_manager_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_materials" ADD CONSTRAINT "project_materials_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_materials" ADD CONSTRAINT "project_materials_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_maps" ADD CONSTRAINT "project_maps_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_markers" ADD CONSTRAINT "map_markers_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "project_maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "item_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "item_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_categories" ADD CONSTRAINT "item_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "item_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_balances" ADD CONSTRAINT "stock_balances_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_balances" ADD CONSTRAINT "stock_balances_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_note_items" ADD CONSTRAINT "delivery_note_items_delivery_note_id_fkey" FOREIGN KEY ("delivery_note_id") REFERENCES "delivery_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_attendance" ADD CONSTRAINT "employee_attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_attendance" ADD CONSTRAINT "employee_attendance_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_leaves" ADD CONSTRAINT "employee_leaves_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salaries" ADD CONSTRAINT "employee_salaries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_contracts" ADD CONSTRAINT "maintenance_contracts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_contracts" ADD CONSTRAINT "maintenance_contracts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "maintenance_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_assigned_tech_id_fkey" FOREIGN KEY ("assigned_tech_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_visits" ADD CONSTRAINT "service_visits_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "service_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_parts" ADD CONSTRAINT "service_parts_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "service_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_parts" ADD CONSTRAINT "service_parts_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
