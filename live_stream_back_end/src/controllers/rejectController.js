import { db } from "../lib/db.js";

export const rejectRequest = async (req, res) => {
  try {
    const userId = String(req.user.id);
    const send_reject_id = String(req.body.send_reject_id);
    const send_reject_id_num = Number(send_reject_id);

    if (!send_reject_id) {
      return res.status(400).json({ message: "Target user ID required" });
    }

    if (userId === send_reject_id) {
      return res.status(400).json({ message: "You cannot reject yourself" });
    }

    // Check if target user exists
    const [targetUser] = await db.query("SELECT id FROM users WHERE id = ?", [send_reject_id_num]);
    if (targetUser.length === 0) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // Ensure both users have friend_list records
    await db.query(
      `INSERT INTO friend_list (user_id, follower_list, following_list, send_request_list, friend_request_list, rejected_list, rejected_user_list, blocked_list, blocked_user_list)
       SELECT ?, JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY()
       WHERE NOT EXISTS (SELECT 1 FROM friend_list WHERE user_id = ?)`,
      [userId, userId]
    );

    await db.query(
      `INSERT INTO friend_list (user_id, follower_list, following_list, send_request_list, friend_request_list, rejected_list, rejected_user_list, blocked_list, blocked_user_list)
       SELECT ?, JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY()
       WHERE NOT EXISTS (SELECT 1 FROM friend_list WHERE user_id = ?)`,
      [send_reject_id, send_reject_id]
    );

    // ✅ Check if send_reject_id exists in current user's friend_request_list
    const [checkRequest] = await db.query(
      `SELECT 
         JSON_SEARCH(friend_request_list, 'one', CAST(? AS CHAR)) AS found 
       FROM friend_list 
       WHERE user_id = ?`,
      [send_reject_id, userId]
    );

    if (!checkRequest[0]?.found) {
      return res.status(400).json({ message: "No friend request found from this user" });
    }

    // --- Update current user: remove from friend_request_list, add to rejected_list ---
    await db.query(
      `UPDATE friend_list
       SET 
         friend_request_list = IFNULL(
           JSON_REMOVE(friend_request_list, JSON_UNQUOTE(JSON_SEARCH(friend_request_list, 'one', CAST(? AS CHAR)))),
           friend_request_list
         ),
         rejected_list = JSON_ARRAY_APPEND(
           COALESCE(rejected_list, JSON_ARRAY()),
           '$',
           CAST(? AS CHAR)
         )
       WHERE user_id = ?`,
      [send_reject_id, send_reject_id, userId]
    );

    // --- Update target user: remove from send_request_list, add to rejected_user_list ---
    await db.query(
      `UPDATE friend_list
       SET 
         send_request_list = IFNULL(
           JSON_REMOVE(send_request_list, JSON_UNQUOTE(JSON_SEARCH(send_request_list, 'one', CAST(? AS CHAR)))),
           send_request_list
         ),
         rejected_user_list = JSON_ARRAY_APPEND(
           COALESCE(rejected_user_list, JSON_ARRAY()),
           '$',
           CAST(? AS CHAR)
         )
       WHERE user_id = ?`,
      [userId, userId, send_reject_id]
    );

    return res.status(200).json({ message: "Friend request rejected successfully" });

  } catch (error) {
    console.error("❌ Reject request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const unRejectRequest = async (req, res) => {
  try {
    const userId = String(req.user.id);
    const send_unreject_id = String(req.body.send_unreject_id);
    const send_unreject_id_num = Number(send_unreject_id);

    if (!send_unreject_id) {
      return res.status(400).json({ message: "Target user ID required" });
    }

    if (userId === send_unreject_id) {
      return res.status(400).json({ message: "You cannot unreject yourself" });
    }

    // ✅ Check if target user exists
    const [targetUser] = await db.query("SELECT id FROM users WHERE id = ?", [send_unreject_id_num]);
    if (targetUser.length === 0) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // ✅ Ensure both users have friend_list rows
    await db.query(
      `INSERT INTO friend_list (user_id, follower_list, following_list, send_request_list, friend_request_list, rejected_list, rejected_user_list, blocked_list, blocked_user_list)
       SELECT ?, JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY()
       WHERE NOT EXISTS (SELECT 1 FROM friend_list WHERE user_id = ?)`,
      [userId, userId]
    );

    await db.query(
      `INSERT INTO friend_list (user_id, follower_list, following_list, send_request_list, friend_request_list, rejected_list, rejected_user_list, blocked_list, blocked_user_list)
       SELECT ?, JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY()
       WHERE NOT EXISTS (SELECT 1 FROM friend_list WHERE user_id = ?)`,
      [send_unreject_id, send_unreject_id]
    );

    // ✅ Check if send_unreject_id exists in current user's rejected_list
    const [checkReject] = await db.query(
      `SELECT JSON_SEARCH(rejected_list, 'one', CAST(? AS CHAR)) AS found
       FROM friend_list
       WHERE user_id = ?`,
      [send_unreject_id, userId]
    );

    if (!checkReject[0]?.found) {
      return res.status(400).json({ message: "User is not in rejected list" });
    }

    // ✅ Remove from current user's rejected_list
    await db.query(
      `UPDATE friend_list
       SET 
         rejected_list = IFNULL(
           JSON_REMOVE(rejected_list, JSON_UNQUOTE(JSON_SEARCH(rejected_list, 'one', CAST(? AS CHAR)))),
           rejected_list
         )
       WHERE user_id = ?`,
      [send_unreject_id, userId]
    );

    // ✅ Remove from target user's rejected_user_list
    await db.query(
      `UPDATE friend_list
       SET 
         rejected_user_list = IFNULL(
           JSON_REMOVE(rejected_user_list, JSON_UNQUOTE(JSON_SEARCH(rejected_user_list, 'one', CAST(? AS CHAR)))),
           rejected_user_list
         )
       WHERE user_id = ?`,
      [userId, send_unreject_id]
    );

    return res.status(200).json({ message: "User unrejected successfully" });

  } catch (error) {
    console.error("❌ Unreject request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
