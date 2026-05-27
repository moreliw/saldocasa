-- Convites para membros adicionais entrarem na household

CREATE TABLE "household_invites" (
    "id" TEXT NOT NULL,
    "household_id" TEXT NOT NULL,
    "invited_by_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "HouseholdRole" NOT NULL DEFAULT 'MEMBER',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "accepted_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "household_invites_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "household_invites_token_key" ON "household_invites"("token");
CREATE INDEX "household_invites_household_id_accepted_at_idx" ON "household_invites"("household_id", "accepted_at");

ALTER TABLE "household_invites"
  ADD CONSTRAINT "household_invites_household_id_fkey"
  FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;
