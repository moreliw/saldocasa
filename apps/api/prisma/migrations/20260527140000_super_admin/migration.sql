-- Adiciona flag de super admin global
ALTER TABLE "users"
  ADD COLUMN "is_super_admin" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "users_is_super_admin_idx" ON "users"("is_super_admin") WHERE "is_super_admin" = true;
