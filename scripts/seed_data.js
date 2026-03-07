
import mysql from 'mysql2';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
    try {
        console.log('🌱 Seeding Initial Data (Standalone)...');

        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 1
        }).promise();

        const conn = await pool.getConnection();

        try {
            // 1. Users
            // Note: Schema uses 'usuario' column, not 'email'
            const hashedPassword = await bcrypt.hash('123456', 10);
            console.log('Seeding Users...');
            await conn.query(`
                INSERT IGNORE INTO usuarios(id, nombre, usuario, password, rol) VALUES
                (1, 'Admin User', 'admin', ?, 'admin'),
                (2, 'Mesero User', 'mesero', ?, 'mesero')
            `, [hashedPassword, hashedPassword]);

            // 2. Mesas
            console.log('Seeding Mesas...');
            await conn.query(`
                INSERT IGNORE INTO mesas(id, numero, capacidad) VALUES
                (1, 'Mesa 1', 4),
                (2, 'Mesa 2', 4)
            `);

            // 3. Categorias
            console.log('Seeding Categorias...');
            await conn.query(`
                INSERT IGNORE INTO categorias(id, nombre) VALUES
                (1, 'Entradas'),
                (2, 'Fondos')
            `);

            // 4. Platillos
            // Note: Ensuring columns match the user's screenshot/schema
            console.log('Seeding Platillos...');
            // We use ON DUPLICATE KEY UPDATE to ensure data is visible even if IDs exist
            await conn.query(`
                INSERT INTO platillos(id, nombre, precio, categoria_id, descripcion, activo) VALUES
                (1, 'Tequeños', 15.00, 1, 'Ricos tequeños de queso con guacamole', 1),
                (2, 'Lomo Saltado', 35.00, 2, 'Clasico lomo saltado con papas fritas', 1)
                ON DUPLICATE KEY UPDATE
                nombre = VALUES(nombre),
                precio = VALUES(precio),
                descripcion = VALUES(descripcion),
                activo = 1
            `);

            console.log('✅ Database Seeded Successfully!');
        } finally {
            conn.release();
            await pool.end();
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};

seedData();
