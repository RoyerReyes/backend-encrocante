import db from './src/config/db.js';

async function runMigration() {
  console.log("🚀 Iniciando migración de Base de Datos temporal...");
  try {
    const result = await db.promise().query(
      "ALTER TABLE pedidos ADD COLUMN costo_delivery DECIMAL(10,2) DEFAULT 0.00;"
    );
    console.log("✅ Columna costo_delivery agregada a la tabla pedidos.");
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
       console.log("✅ La columna costo_delivery ya existe.");
    } else {
       console.error("❌ Error en la migración:", error);
    }
  } finally {
    process.exit(0);
  }
}

runMigration();
