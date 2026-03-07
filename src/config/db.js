import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

const db = mysql.createPool({
  host: isTest ? '127.0.0.1' : process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '-05:00', // Force local time (Peru/Colombia/etc)
  dateStrings: true   // Return dates as strings to avoid JS auto-conversion
});

console.log("✅ Pool de conexiones a MySQL creado.");

export default db;
