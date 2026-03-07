
import db from './src/config/db.js';

async function runMigration() {
    const sql = "ALTER TABLE pedidos ADD COLUMN metodo_pago VARCHAR(50) DEFAULT NULL AFTER estado";
    try {
        console.log('Ejecutando migración...');
        await db.promise().query(sql);
        console.log('✅ Migración exitosa: Columna metodo_pago agregada.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠️ La columna ya existe, no es necesario migrar.');
        } else {
            console.error('❌ Error en migración:', error);
        }
    } finally {
        process.exit();
    }
}

runMigration();
