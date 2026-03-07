
import db from './src/config/db.js';

async function checkSchema() {
    const sql = "DESCRIBE platillos";
    try {
        const [rows] = await db.promise().query(sql);
        console.log('Estructura de la tabla platillos:', rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkSchema();
