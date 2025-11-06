import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

let db;

async function initializeDatabase() {
  try {
    const baseConnection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
    });

    await baseConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);

    db = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

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

  await db.query(`
  CREATE TABLE IF NOT EXISTS friend_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_list JSON DEFAULT (JSON_ARRAY()),
    following_list JSON DEFAULT (JSON_ARRAY()),
    send_list JSON DEFAULT (JSON_ARRAY()),
    accept_list JSON DEFAULT (JSON_ARRAY()),
    reject_list JSON DEFAULT (JSON_ARRAY()),
    block_list JSON DEFAULT (JSON_ARRAY()),
    status TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);


    const [columns] = await db.query(`SHOW COLUMNS FROM users LIKE 'current_token'`);
    if (columns.length === 0) {
      await db.query(`ALTER TABLE users ADD COLUMN current_token VARCHAR(255)`);
    }

  } catch (err) {
    console.error("❌ Database setup error:", err.message);
  }
}

await initializeDatabase();

export { db };
