import { db } from "../lib/db.js";

export const createFriendListTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS friend_list (
        id INT AUTO_INCREMENT PRIMARY KEY,
        follower_list JSON DEFAULT (JSON_ARRAY()),
        following_list JSON DEFAULT (JSON_ARRAY()),
        send_request_list JSON DEFAULT (JSON_ARRAY()),
        friend_request_list JSON DEFAULT (JSON_ARRAY()),
        rejected_list JSON DEFAULT (JSON_ARRAY()),
        rejected_user_list JSON DEFAULT (JSON_ARRAY()),
        blocked_list JSON DEFAULT (JSON_ARRAY()),
        blocked_user_list JSON DEFAULT (JSON_ARRAY()),
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ friend_list table ready");
  } catch (err) {
    console.error("❌ friend_list table creation failed:", err.message);
  }
};
