
import db from '../src/config/db.js';

const runMigration = async () => {
  try {
    const connection = await db.promise().getConnection();
    console.log('✅ Conexión a la base de datos establecida.');

    const alterTableQuery = `
      ALTER TABLE pedidos
      ADD COLUMN nombre_cliente VARCHAR(100) NULL AFTER usuario_id;
    `;

    console.log('Ejecutando la migración...');
    await connection.query(alterTableQuery);
    console.log('✅ Migración completada: La columna "nombre_cliente" ha sido agregada a la tabla "pedidos".');

    connection.release();
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    db.end();
  }
};

runMigration();
