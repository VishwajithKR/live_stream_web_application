import { db } from "../lib/db.js";

export const createUserTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mobile VARCHAR(12) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        current_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ users table ready");
  } catch (err) {
    console.error("❌ users table creation failed:", err.message);
  }
};
