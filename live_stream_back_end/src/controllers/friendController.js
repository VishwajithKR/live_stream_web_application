import { db } from "../lib/db.js";
import { searchUsers } from "../modals/userModel.js";


export const allUsers = async (req, res) => {
  try {
    const currentUserId = req.user?.id;

    const [rows] = await db.query(
      "SELECT id, name FROM users WHERE id != ?",
      [currentUserId]
    );

    res.status(200).json({
      message: "All other users fetched successfully",
      users: rows,
    });
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  const { receiver_id } = req.body;
  const sender_id = req.userId;

  try {
    await db.query(
      "INSERT INTO friends (sender_id, receiver_id, status) VALUES (?, ?, 'pending')",
      [sender_id, receiver_id]
    );
    res.json({ message: "Friend request sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  const { sender_id } = req.body;
  const receiver_id = req.userId;

  try {
    await db.query(
      "UPDATE friends SET status = 'accepted' WHERE sender_id = ? AND receiver_id = ?",
      [sender_id, receiver_id]
    );
    res.json({ message: "Friend request accepted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFriendList = async (req, res) => {
  const userId = req.userId;
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email
       FROM users u
       JOIN friends f ON 
       (f.sender_id = u.id OR f.receiver_id = u.id)
       WHERE (f.sender_id = ? OR f.receiver_id = ?) AND f.status = 'accepted' AND u.id != ?`,
      [userId, userId, userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const globalSearch = async (req, res) => {
  const { keyword } = req.query;
  try {
    const results = await searchUsers(keyword, req.userId);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
