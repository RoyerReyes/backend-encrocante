
import db from './src/config/db.js';

async function checkLastOrder() {
    const sql = "SELECT id, estado, metodo_pago, total FROM pedidos ORDER BY id DESC LIMIT 1";
    try {
        const [rows] = await db.promise().query(sql);
        console.log('Último pedido en BD:', rows[0]);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkLastOrder();
