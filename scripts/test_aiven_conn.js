import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  console.log("Testing with URI:", process.env.DB_URL);
  try {
    const dbUrl = new URL(process.env.DB_URL);
    const poolConfig = {
      host: dbUrl.hostname,
      port: dbUrl.port || 3306,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.substring(1),
      ssl: {
        rejectUnauthorized: false
      }
    };
    
    console.log("Config object:", Object.assign({}, poolConfig, { password: '***' }));
    
    const connection = await mysql.createConnection(poolConfig);
    console.log("✅ Successfully connected to Aiven!");
    await connection.end();
  } catch (error) {
    console.error("❌ Connection failed with explicitly parsed config:");
    console.error(error);
  }

  console.log("\nTesting direct URI passing...");
  try {
    const connection = await mysql.createConnection(process.env.DB_URL);
    console.log("✅ Successfully connected to Aiven using direct URI!");
    await connection.end();
  } catch (error) {
    console.error("❌ Connection failed with direct URI:");
    console.error(error);
  }
}

testConnection();
