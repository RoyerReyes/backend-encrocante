
import db from './src/config/db.js';
import fs from 'fs';
import path from 'path';

async function migrate() {
    const sqlPath = "C:/Users/Admin/.gemini/antigravity/brain/dee10472-ec83-4e1e-9ffb-b3af1d160e64/fix_platillos_schema.sql";
    const sql = fs.readFileSync(sqlPath, 'utf8');

    try {
        console.log('Ejecutando migración...');
        const [result] = await db.promise().query(sql);
        console.log('✅ Migración exitosa:', result);
    } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            console.log('⚠️ La columna ya parece tener el nombre correcto o no existe la original.');
        } else {
            console.error('❌ Error en migración:', error);
        }
    } finally {
        process.exit();
    }
}

migrate();
