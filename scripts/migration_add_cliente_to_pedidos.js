import db from "../src/config/db.js";

const alterTableQuery = `
  ALTER TABLE pedidos
  ADD COLUMN cliente_id INT DEFAULT NULL,
  ADD CONSTRAINT fk_pedido_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL;
`;

const runMigration = async () => {
    try {
        console.log("Añadiendo columna 'cliente_id' a tabla 'pedidos'...");
        await db.promise().query(alterTableQuery);
        console.log("✅ Columna 'cliente_id' añadida y FK creada.");
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log("⚠️ La columna 'cliente_id' ya existe.");
            process.exit(0);
        }
        console.error("❌ Error en migración:", error);
        process.exit(1);
    }
};

runMigration();
