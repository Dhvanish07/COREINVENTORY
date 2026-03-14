import { query } from "../config/mysql.js";

export const logActivity = async ({ action, entityType, entityId, meta = {}, user }) => {
  await query(
    "INSERT INTO activities (action, entity_type, entity_id, meta_json, user_id) VALUES (?, ?, ?, ?, ?)",
    [action, entityType, entityId ? String(entityId) : null, JSON.stringify(meta || {}), user || null]
  );
};