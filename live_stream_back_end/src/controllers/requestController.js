import { db } from "../lib/db.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { send_request_id } = req.body;

    if (!send_request_id) {
      return res.status(400).json({ message: "Target user ID required" });
    }

    if (String(userId) === String(send_request_id)) {
      return res.status(400).json({ message: "You cannot send a request to yourself" });
    }

    const [targetUser] = await db.query("SELECT id FROM users WHERE id = ?", [send_request_id]);
    if (targetUser.length === 0) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // ---- Sender Side ----
    const [senderList] = await db.query("SELECT * FROM friend_list WHERE user_id = ?", [userId]);

    if (senderList.length === 0) {
      await db.query(
        "INSERT INTO friend_list (user_id, send_request_list) VALUES (?, JSON_ARRAY(?))",
        [userId, String(send_request_id)]
      );
    } else {
      const [exists] = await db.query(
        `SELECT JSON_CONTAINS(send_request_list, JSON_QUOTE(?), '$') AS alreadySent
         FROM friend_list WHERE user_id = ?`,
        [String(send_request_id), userId]
      );

      if (exists[0]?.alreadySent === 1) {
        return res.status(400).json({ message: "You have already sent a friend request to this user" });
      }

    await db.query(
        `UPDATE friend_list
        SET send_request_list = JSON_ARRAY_APPEND(send_request_list, '$', CAST(? AS CHAR))
        WHERE user_id = ?`,
        [String(send_request_id), userId]
      );

    }

    // ---- Receiver Side ----
    const [receiverList] = await db.query("SELECT * FROM friend_list WHERE user_id = ?", [send_request_id]);

    if (receiverList.length === 0) {
      await db.query(
        "INSERT INTO friend_list (user_id, friend_request_list) VALUES (?, JSON_ARRAY(?))",
        [send_request_id, String(userId)]
      );
    } else {
      const [alreadyRequested] = await db.query(
        `SELECT JSON_CONTAINS(friend_request_list, JSON_QUOTE(?), '$') AS alreadyExists
         FROM friend_list WHERE user_id = ?`,
        [String(userId), send_request_id]
      );

      if (alreadyRequested[0]?.alreadyExists !== 1) {
       await db.query(
          `UPDATE friend_list
          SET friend_request_list = JSON_ARRAY_APPEND(friend_request_list, '$', CAST(? AS CHAR))
          WHERE user_id = ?`,
          [String(userId), send_request_id]
        );

      }
    }

    res.status(200).json({ message: "Friend request sent successfully" });

  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = String(req.user.id);
    const send_accept_id = String(req.body.send_accept_id);
    const send_accept_id_num = Number(send_accept_id);

    if (!send_accept_id) {
      return res.status(400).json({ message: "Target user ID required" });
    }

    if (userId === send_accept_id) {
      return res.status(400).json({ message: "You cannot accept a request to yourself" });
    }

    // ✅ Check target exists
    const [targetUser] = await db.query("SELECT id FROM users WHERE id = ?", [send_accept_id_num]);
    if (targetUser.length === 0) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // ✅ Check that send_accept_id exists inside current user's friend_request_list
    const [checkSend] = await db.query(
      `SELECT JSON_CONTAINS(friend_request_list, CAST(? AS JSON), '$') AS hasRequest
       FROM friend_list
       WHERE user_id = ?`,
      [JSON.stringify(send_accept_id), userId]
    );

    if (!checkSend[0] || checkSend[0].hasRequest !== 1) {
      return res.status(400).json({ message: "This user is not in your friend request list" });
    }

    // ✅ Step 1: Remove send_accept_id from current user's friend_request_list & add to follower_list
    const [pathRow] = await db.query(
      `SELECT JSON_UNQUOTE(JSON_SEARCH(friend_request_list, 'one', CAST(? AS CHAR))) AS path
       FROM friend_list
       WHERE user_id = ?`,
      [send_accept_id, userId]
    );

    const removePath = pathRow[0]?.path;

    if (removePath) {
      await db.query(
        `UPDATE friend_list
         SET friend_request_list = COALESCE(JSON_REMOVE(friend_request_list, ?), JSON_ARRAY()),
             follower_list = JSON_ARRAY_APPEND(follower_list, '$', CAST(? AS CHAR))
         WHERE user_id = ?`,
        [removePath, send_accept_id, userId]
      );
    } else {
      await db.query(
        `UPDATE friend_list
         SET follower_list = JSON_ARRAY_APPEND(follower_list, '$', CAST(? AS CHAR))
         WHERE user_id = ?`,
        [send_accept_id, userId]
      );
    }

    // ✅ Step 2: Remove userId from target user's friend_request_list & add to following_list
    const [targetPathRow] = await db.query(
      `SELECT JSON_UNQUOTE(JSON_SEARCH(friend_request_list, 'one', CAST(? AS CHAR))) AS path
       FROM friend_list
       WHERE user_id = ?`,
      [userId, send_accept_id]
    );

    const targetRemovePath = targetPathRow[0]?.path;

    if (targetRemovePath) {
      await db.query(
        `UPDATE friend_list
         SET friend_request_list = COALESCE(JSON_REMOVE(friend_request_list, ?), JSON_ARRAY()),
             following_list = JSON_ARRAY_APPEND(following_list, '$', CAST(? AS CHAR))
         WHERE user_id = ?`,
        [targetRemovePath, userId, send_accept_id]
      );
    } else {
      await db.query(
        `UPDATE friend_list
         SET following_list = JSON_ARRAY_APPEND(following_list, '$', CAST(? AS CHAR))
         WHERE user_id = ?`,
        [userId, send_accept_id]
      );
    }

    // ✅ Step 3: (NEW) — remove userId from target’s send_request_list if present
    const [targetSendPath] = await db.query(
      `SELECT JSON_UNQUOTE(JSON_SEARCH(send_request_list, 'one', CAST(? AS CHAR))) AS path
       FROM friend_list
       WHERE user_id = ?`,
      [userId, send_accept_id]
    );

    const sendRemovePath = targetSendPath[0]?.path;

    if (sendRemovePath) {
      await db.query(
        `UPDATE friend_list
         SET send_request_list = COALESCE(JSON_REMOVE(send_request_list, ?), JSON_ARRAY())
         WHERE user_id = ?`,
        [sendRemovePath, send_accept_id]
      );
    }

    return res.status(200).json({ message: "Friend request accepted successfully" });

  } catch (error) {
    console.error("❌ Accept friend request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};





