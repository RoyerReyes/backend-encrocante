
import db from '../src/config/db.js';

const updateSchema = async () => {
    try {
        console.log('Updating Pedidos Enum...');
        // Note: 'en cocina' maps to 'en_preparacion', 'servido' to 'entregado' conceptualy, but we just extend the list for now or replace it.
        // We replace it to match new constants.
        const sql = `
            ALTER TABLE pedidos 
            MODIFY COLUMN estado ENUM('recibido', 'pendiente', 'en_preparacion', 'listo', 'entregado', 'pagado', 'cancelado', 'en cocina', 'servido') 
            DEFAULT 'pendiente'
        `;
        await db.promise().query(sql);
        console.log('Schema updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
};

updateSchema();
