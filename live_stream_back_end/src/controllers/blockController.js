import { db } from "../lib/db.js";

export const blockRequest = async (req, res) => {
  try {
    const userId = String(req.user.id);
    const send_block_id = String(req.body.send_block_id);
    const send_block_id_num = Number(send_block_id);

    if (!send_block_id) {
      return res.status(400).json({ message: "Target user ID required" });
    }

    if (userId === send_block_id) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    const [targetUser] = await db.query("SELECT id FROM users WHERE id = ?", [send_block_id_num]);
    if (targetUser.length === 0) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const [hasUserList] = await db.query("SELECT user_id FROM friend_list WHERE user_id = ?", [userId]);
    if (hasUserList.length === 0) {
      await db.query(
        `INSERT INTO friend_list (user_id, follower_list, following_list, send_request_list, friend_request_list, rejected_list, rejected_user_list, blocked_list, blocked_user_list)
         VALUES (?, JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY())`,
        [userId]
      );
    }

    const [hasTargetList] = await db.query("SELECT user_id FROM friend_list WHERE user_id = ?", [send_block_id]);
    if (hasTargetList.length === 0) {
      await db.query(
        `INSERT INTO friend_list (user_id, follower_list, following_list, send_request_list, friend_request_list, rejected_list, rejected_user_list, blocked_list, blocked_user_list)
         VALUES (?, JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY())`,
        [send_block_id]
      );
    }

    const [checkBlock] = await db.query(
      `SELECT JSON_CONTAINS(blocked_list, JSON_QUOTE(?), '$') AS alreadyBlocked
       FROM friend_list
       WHERE user_id = ?`,
      [send_block_id, userId]
    );

    if (checkBlock[0]?.alreadyBlocked === 1) {
      return res.status(400).json({ message: "User already blocked" });
    }

    await db.query(
      `UPDATE friend_list
       SET 
         follower_list = IFNULL(JSON_REMOVE(follower_list, JSON_UNQUOTE(JSON_SEARCH(follower_list, 'one', CAST(? AS CHAR)))), follower_list),
         following_list = IFNULL(JSON_REMOVE(following_list, JSON_UNQUOTE(JSON_SEARCH(following_list, 'one', CAST(? AS CHAR)))), following_list),
         send_request_list = IFNULL(JSON_REMOVE(send_request_list, JSON_UNQUOTE(JSON_SEARCH(send_request_list, 'one', CAST(? AS CHAR)))), send_request_list),
         friend_request_list = IFNULL(JSON_REMOVE(friend_request_list, JSON_UNQUOTE(JSON_SEARCH(friend_request_list, 'one', CAST(? AS CHAR)))), friend_request_list),
         rejected_list = IFNULL(JSON_REMOVE(rejected_list, JSON_UNQUOTE(JSON_SEARCH(rejected_list, 'one', CAST(? AS CHAR)))), rejected_list),
         rejected_user_list = IFNULL(JSON_REMOVE(rejected_user_list, JSON_UNQUOTE(JSON_SEARCH(rejected_user_list, 'one', CAST(? AS CHAR)))), rejected_user_list),
         blocked_list = JSON_ARRAY_APPEND(COALESCE(blocked_list, JSON_ARRAY()), '$', CAST(? AS CHAR))
       WHERE user_id = ?`,
      [
        send_block_id, send_block_id, send_block_id, send_block_id,
        send_block_id, send_block_id, send_block_id, userId
      ]
    );

    await db.query(
      `UPDATE friend_list
       SET 
         follower_list = IFNULL(JSON_REMOVE(follower_list, JSON_UNQUOTE(JSON_SEARCH(follower_list, 'one', CAST(? AS CHAR)))), follower_list),
         following_list = IFNULL(JSON_REMOVE(following_list, JSON_UNQUOTE(JSON_SEARCH(following_list, 'one', CAST(? AS CHAR)))), following_list),
         send_request_list = IFNULL(JSON_REMOVE(send_request_list, JSON_UNQUOTE(JSON_SEARCH(send_request_list, 'one', CAST(? AS CHAR)))), send_request_list),
         friend_request_list = IFNULL(JSON_REMOVE(friend_request_list, JSON_UNQUOTE(JSON_SEARCH(friend_request_list, 'one', CAST(? AS CHAR)))), friend_request_list),
         rejected_list = IFNULL(JSON_REMOVE(rejected_list, JSON_UNQUOTE(JSON_SEARCH(rejected_list, 'one', CAST(? AS CHAR)))), rejected_list),
         rejected_user_list = IFNULL(JSON_REMOVE(rejected_user_list, JSON_UNQUOTE(JSON_SEARCH(rejected_user_list, 'one', CAST(? AS CHAR)))), rejected_user_list),
         blocked_user_list = JSON_ARRAY_APPEND(COALESCE(blocked_user_list, JSON_ARRAY()), '$', CAST(? AS CHAR))
       WHERE user_id = ?`,
      [
        userId, userId, userId, userId,
        userId, userId, userId, send_block_id
      ]
    );

    return res.status(200).json({ message: "User blocked successfully" });

  } catch (error) {
    console.error("❌ Block request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const unBlockRequest = async (req, res) => {
  try {
    const userId = String(req.user.id);
    const send_unblock_id = String(req.body.send_unblock_id);
    const send_unblock_id_num = Number(send_unblock_id);

    if (!send_unblock_id) {
      return res.status(400).json({ message: "Target user ID required" });
    }

    if (userId === send_unblock_id) {
      return res.status(400).json({ message: "You cannot unblock yourself" });
    }

    const [targetUser] = await db.query("SELECT id FROM users WHERE id = ?", [send_unblock_id_num]);
    if (targetUser.length === 0) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const [userList] = await db.query("SELECT user_id FROM friend_list WHERE user_id = ?", [userId]);
    if (userList.length === 0) {
      await db.query(
        `INSERT INTO friend_list (user_id, follower_list, following_list, send_request_list, friend_request_list, rejected_list, rejected_user_list, blocked_list, blocked_user_list)
         VALUES (?, JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY())`,
        [userId]
      );
    }

    const [targetList] = await db.query("SELECT user_id FROM friend_list WHERE user_id = ?", [send_unblock_id]);
    if (targetList.length === 0) {
      await db.query(
        `INSERT INTO friend_list (user_id, follower_list, following_list, send_request_list, friend_request_list, rejected_list, rejected_user_list, blocked_list, blocked_user_list)
         VALUES (?, JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY())`,
        [send_unblock_id]
      );
    }

    const [checkBlock] = await db.query(
      `SELECT JSON_CONTAINS(blocked_list, JSON_QUOTE(?), '$') AS isBlocked
       FROM friend_list
       WHERE user_id = ?`,
      [send_unblock_id, userId]
    );

    if (checkBlock[0]?.isBlocked === 0) {
      return res.status(400).json({ message: "User is not blocked" });
    }

    await db.query(
      `UPDATE friend_list
       SET 
         blocked_list = IFNULL(
           JSON_REMOVE(blocked_list, JSON_UNQUOTE(JSON_SEARCH(blocked_list, 'one', CAST(? AS CHAR)))),
           blocked_list
         )
       WHERE user_id = ?`,
      [send_unblock_id, userId]
    );

    await db.query(
      `UPDATE friend_list
       SET 
         blocked_user_list = IFNULL(
           JSON_REMOVE(blocked_user_list, JSON_UNQUOTE(JSON_SEARCH(blocked_user_list, 'one', CAST(? AS CHAR)))),
           blocked_user_list
         )
       WHERE user_id = ?`,
      [userId, send_unblock_id]
    );

    return res.status(200).json({ message: "User unblocked successfully" });

  } catch (error) {
    console.error("❌ Unblock request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
