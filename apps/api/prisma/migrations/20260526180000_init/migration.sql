-- Initial schema for saldocasa (Fase 1)
-- Tables: users, households, household_users, categories, payment_methods,
-- transactions, recurring_transactions, budgets, audit_logs.

-- ===================== ENUMS =====================
CREATE TYPE "HouseholdRole" AS ENUM ('OWNER', 'MEMBER');
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE "TransactionStatus" AS ENUM ('PAID', 'PENDING', 'CANCELLED');
CREATE TYPE "RecurringFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'YEARLY');

-- ===================== users =====================
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- ===================== households =====================
CREATE TABLE "households" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "owner_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "households_owner_user_id_idx" ON "households"("owner_user_id");

-- ===================== household_users =====================
CREATE TABLE "household_users" (
    "id" TEXT NOT NULL,
    "household_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "HouseholdRole" NOT NULL DEFAULT 'MEMBER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "household_users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "household_users_household_id_user_id_key" ON "household_users"("household_id", "user_id");
CREATE INDEX "household_users_user_id_idx" ON "household_users"("user_id");

-- ===================== categories =====================
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "household_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#64748b',
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "categories_household_id_name_type_key" ON "categories"("household_id", "name", "type");
CREATE INDEX "categories_household_id_type_is_active_idx" ON "categories"("household_id", "type", "is_active");

-- ===================== payment_methods =====================
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "household_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "payment_methods_household_id_name_key" ON "payment_methods"("household_id", "name");
CREATE INDEX "payment_methods_household_id_is_active_idx" ON "payment_methods"("household_id", "is_active");

-- ===================== transactions =====================
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "household_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "payment_method_id" TEXT,
    "type" "TransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "transaction_date" DATE NOT NULL,
    "due_date" DATE,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PAID',
    "notes" TEXT,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurring_transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "transactions_household_id_transaction_date_idx" ON "transactions"("household_id", "transaction_date");
CREATE INDEX "transactions_household_id_status_idx" ON "transactions"("household_id", "status");
CREATE INDEX "transactions_household_id_type_transaction_date_idx" ON "transactions"("household_id", "type", "transaction_date");
CREATE INDEX "transactions_household_id_category_id_idx" ON "transactions"("household_id", "category_id");
CREATE INDEX "transactions_household_id_deleted_at_idx" ON "transactions"("household_id", "deleted_at");

-- ===================== recurring_transactions =====================
CREATE TABLE "recurring_transactions" (
    "id" TEXT NOT NULL,
    "household_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "payment_method_id" TEXT,
    "type" "TransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "frequency" "RecurringFrequency" NOT NULL,
    "due_day" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "recurring_transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "recurring_transactions_household_id_is_active_idx" ON "recurring_transactions"("household_id", "is_active");

-- ===================== budgets =====================
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "household_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "planned_amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "budgets_household_id_category_id_year_month_key" ON "budgets"("household_id", "category_id", "year", "month");
CREATE INDEX "budgets_household_id_year_month_idx" ON "budgets"("household_id", "year", "month");

-- ===================== audit_logs =====================
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "household_id" TEXT,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_household_id_created_at_idx" ON "audit_logs"("household_id", "created_at");
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- ===================== FOREIGN KEYS =====================
ALTER TABLE "households"
    ADD CONSTRAINT "households_owner_user_id_fkey"
    FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "household_users"
    ADD CONSTRAINT "household_users_household_id_fkey"
    FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "household_users"
    ADD CONSTRAINT "household_users_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "categories"
    ADD CONSTRAINT "categories_household_id_fkey"
    FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payment_methods"
    ADD CONSTRAINT "payment_methods_household_id_fkey"
    FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transactions"
    ADD CONSTRAINT "transactions_household_id_fkey"
    FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transactions"
    ADD CONSTRAINT "transactions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions"
    ADD CONSTRAINT "transactions_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions"
    ADD CONSTRAINT "transactions_payment_method_id_fkey"
    FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transactions"
    ADD CONSTRAINT "transactions_recurring_transaction_id_fkey"
    FOREIGN KEY ("recurring_transaction_id") REFERENCES "recurring_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "recurring_transactions"
    ADD CONSTRAINT "recurring_transactions_household_id_fkey"
    FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recurring_transactions"
    ADD CONSTRAINT "recurring_transactions_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recurring_transactions"
    ADD CONSTRAINT "recurring_transactions_payment_method_id_fkey"
    FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "budgets"
    ADD CONSTRAINT "budgets_household_id_fkey"
    FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budgets"
    ADD CONSTRAINT "budgets_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_household_id_fkey"
    FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
