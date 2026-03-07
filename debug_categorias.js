
import db from './src/config/db.js';

async function checkCategorias() {
    const sql = "SELECT * FROM categorias";
    try {
        const [rows] = await db.promise().query(sql);
        console.log('Categorías en BD:', rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkCategorias();
