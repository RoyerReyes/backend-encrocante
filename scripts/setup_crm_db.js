import db from "../src/config/db.js";

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    puntos INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

const setupDB = async () => {
    try {
        console.log("Creando tabla 'clientes'...");
        await db.promise().query(createTableQuery);
        console.log("✅ Tabla 'clientes' creada o ya existe.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creando tabla:", error);
        process.exit(1);
    }
};

setupDB();
