import { db } from "../lib/db.js";

export const allUsers = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const findUserList = req.body.user_type;

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: user ID missing" });
    }

    const userLists = {
      follower: "follower_list",
      following: "following_list",
      sendrequest: "send_request_list",
      friendrequest: "friend_request_list",
      rejectrequest: "rejected_list",
      rejectuser: "rejected_user_list",
      blocked: "blocked_list",
      blockeduser: "blocked_user_list",
    };

    const filteredData = userLists[findUserList] || "";

    // ---------- FILTERED LIST HANDLING ----------
    if (filteredData) {
      const [filteredListRows] = await db.query(
        `SELECT ${filteredData} FROM friend_list WHERE user_id = ?`,
        [currentUserId]
      );

      if (filteredListRows.length === 0) {
        return res.status(200).json({
         message: `${findUserList} user list fetched successfully`,
          users: [],
        });
      }

      const filteredLists = filteredListRows[0];
      let filteredExcludedIds = filteredLists[filteredData] || [];

      // Handle case when MySQL JSON is a string (e.g., '["1","2"]')
      if (typeof filteredExcludedIds === "string") {
        try {
          filteredExcludedIds = JSON.parse(filteredExcludedIds);
        } catch {
          filteredExcludedIds = [];
        }
      }

      // If list empty, return []
      if (!Array.isArray(filteredExcludedIds) || filteredExcludedIds.length === 0) {
        return res.status(200).json({
         message: `${findUserList} user list fetched successfully`,
          users: [],
        });
      }

      const placeholders = filteredExcludedIds.map(() => "?").join(", ");
      const filteredQuery = `
        SELECT id, name 
        FROM users 
        WHERE id IN (${placeholders})
        ORDER BY id ASC
      `;
      const [rows] = await db.query(filteredQuery, filteredExcludedIds);

      return res.status(200).json({
       message: `${findUserList} user list fetched successfully`,
        users: rows,
      });
    }

    // ---------- DEFAULT LIST (if no user_type provided) ----------
    const [friendListRows] = await db.query(
      `SELECT following_list, send_request_list, blocked_list, blocked_user_list 
       FROM friend_list 
       WHERE user_id = ?`,
      [currentUserId]
    );

    let excludedIds = [String(currentUserId)];

    if (friendListRows.length > 0) {
      const lists = friendListRows[0];

      // Parse JSON fields if stored as strings
      const parseList = (list) => {
        if (!list) return [];
        if (typeof list === "string") {
          try {
            return JSON.parse(list);
          } catch {
            return [];
          }
        }
        return list;
      };

      excludedIds = [
        ...excludedIds,
        ...parseList(lists.following_list),
        ...parseList(lists.send_request_list),
        ...parseList(lists.blocked_list),
        ...parseList(lists.blocked_user_list),
      ];
    }

    const placeholders = excludedIds.map(() => "?").join(", ");
    const query = `
      SELECT id, name 
      FROM users 
      ${excludedIds.length ? `WHERE id NOT IN (${placeholders})` : ""}
      ORDER BY id ASC
    `;

    const [rows] = await db.query(query, excludedIds);

    return res.status(200).json({
      message: `${findUserList} user list fetched successfully`,
      users: rows,
    });
  } catch (error) {
    console.error("❌ Fetch users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
