// src/lib/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

let db;

export async function initializeDatabase() {
  try {
    // Step 1: Base connection (no DB selected yet)
    const baseConnection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
    });

    // Step 2: Create the DB if not exists
    await baseConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`✅ Database "${DB_NAME}" ensured.`);

    // Step 3: Connect to the created DB
    db = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });
    console.log("✅ Connected to MySQL database successfully!");

  } catch (error) {
    console.error("❌ Database initialization error:", error);
    process.exit(1);
  }
}

export { db };
