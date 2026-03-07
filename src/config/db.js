import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

const poolConfig = {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '-05:00', // Force local time (Peru/Colombia/etc)
  dateStrings: true,  // Return dates as strings
  // Aiven y muchas DB en la nube requieren SSL
  ssl: {
    rejectUnauthorized: false
  }
};

if (process.env.DB_URL) {
  // Analizar la URL de conexión que entrega Aiven nativamente
  const dbUrl = new URL(process.env.DB_URL);
  poolConfig.host = dbUrl.hostname;
  poolConfig.port = dbUrl.port || 3306;
  poolConfig.user = dbUrl.username;
  poolConfig.password = dbUrl.password;
  poolConfig.database = dbUrl.pathname.substring(1); // Remover la barra inicial '/'
} else {
  // Configuración tradicional para entorno local o variables individuales de hosting
  poolConfig.host = isTest ? '127.0.0.1' : process.env.DB_HOST;
  poolConfig.port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
  poolConfig.user = process.env.DB_USER;
  poolConfig.password = process.env.DB_PASSWORD;
  poolConfig.database = process.env.DB_NAME;
  // En local usualmente no se requiere SSL estricto, pero para evitar errores lo eliminamos si es localhost
  if (poolConfig.host === '127.0.0.1' || poolConfig.host === 'localhost') {
     delete poolConfig.ssl;
  }
}

const db = mysql.createPool(poolConfig);

console.log(`✅ Pool de conexiones a MySQL creado (Target: ${poolConfig.host || 'unknown'}).`);

export default db;
