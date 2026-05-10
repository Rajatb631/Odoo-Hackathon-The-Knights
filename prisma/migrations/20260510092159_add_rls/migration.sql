-- Row-Level Security (RLS) policies — defense-in-depth at DB layer.
-- App-layer ownership checks remain primary; these policies become enforcing
-- when the connection role is non-owner OR FORCE ROW LEVEL SECURITY is added.
-- Session context is read from custom GUC `app.user_id` (set by withUserContext).

CREATE OR REPLACE FUNCTION app_user_id() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT current_setting('app.user_id', true)
$$;

ALTER TABLE "Trip"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Stop"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StopActivity"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Note"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PackingItem"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Like"          ENABLE ROW LEVEL SECURITY;

CREATE POLICY trip_select ON "Trip" FOR SELECT
  USING ("ownerId" = app_user_id() OR "isPublic" = true);
CREATE POLICY trip_modify ON "Trip" FOR ALL
  USING ("ownerId" = app_user_id())
  WITH CHECK ("ownerId" = app_user_id());

CREATE POLICY stop_owner ON "Stop" FOR ALL
  USING (EXISTS (SELECT 1 FROM "Trip" t WHERE t.id = "Stop"."tripId" AND t."ownerId" = app_user_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM "Trip" t WHERE t.id = "Stop"."tripId" AND t."ownerId" = app_user_id()));

CREATE POLICY stopactivity_owner ON "StopActivity" FOR ALL
  USING (EXISTS (
    SELECT 1 FROM "Stop" s JOIN "Trip" t ON t.id = s."tripId"
    WHERE s.id = "StopActivity"."stopId" AND t."ownerId" = app_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "Stop" s JOIN "Trip" t ON t.id = s."tripId"
    WHERE s.id = "StopActivity"."stopId" AND t."ownerId" = app_user_id()
  ));

CREATE POLICY note_select ON "Note" FOR SELECT
  USING (EXISTS (SELECT 1 FROM "Trip" t WHERE t.id = "Note"."tripId" AND t."ownerId" = app_user_id()));
CREATE POLICY note_insert ON "Note" FOR INSERT
  WITH CHECK ("authorId" = app_user_id() AND EXISTS (SELECT 1 FROM "Trip" t WHERE t.id = "Note"."tripId" AND t."ownerId" = app_user_id()));
CREATE POLICY note_modify ON "Note" FOR UPDATE
  USING ("authorId" = app_user_id())
  WITH CHECK ("authorId" = app_user_id());
CREATE POLICY note_delete ON "Note" FOR DELETE
  USING ("authorId" = app_user_id());

CREATE POLICY expense_owner ON "Expense" FOR ALL
  USING (EXISTS (SELECT 1 FROM "Trip" t WHERE t.id = "Expense"."tripId" AND t."ownerId" = app_user_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM "Trip" t WHERE t.id = "Expense"."tripId" AND t."ownerId" = app_user_id()));

CREATE POLICY packing_owner ON "PackingItem" FOR ALL
  USING (EXISTS (SELECT 1 FROM "Trip" t WHERE t.id = "PackingItem"."tripId" AND t."ownerId" = app_user_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM "Trip" t WHERE t.id = "PackingItem"."tripId" AND t."ownerId" = app_user_id()));

CREATE POLICY like_select ON "Like" FOR SELECT USING (true);
CREATE POLICY like_insert ON "Like" FOR INSERT WITH CHECK ("userId" = app_user_id());
CREATE POLICY like_delete ON "Like" FOR DELETE USING ("userId" = app_user_id());
