import { db } from "../lib/db.js";

export const createUser = async (name, email, password) => {
  const [rows] = await db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password]
  );
  return rows;
};

export const findUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
};

export const findUserById = async (id) => {
  const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

export const searchUsers = async (keyword, userId) => {
  const [rows] = await db.query(
    "SELECT id, name, email FROM users WHERE (name LIKE ? OR email LIKE ?) AND id != ?",
    [`%${keyword}%`, `%${keyword}%`, userId]
  );
  return rows;
};
