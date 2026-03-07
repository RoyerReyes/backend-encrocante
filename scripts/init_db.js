
import mysql from 'mysql2';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const initDb = async () => {
    console.log('🚀 Initializing Database...');

    // Create connection
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }).promise();

    try {
        console.log('connected to db');

        // 1. Mesas
        console.log('Inserting Mesas...');
        await connection.query("INSERT IGNORE INTO mesas (id, numero, capacidad) VALUES (1, 'Mesa 1', 4)");

        // 2. Categorias
        console.log('Inserting Categorias...');
        await connection.query("INSERT IGNORE INTO categorias (id, nombre) VALUES (1, 'Entradas')");

        // 3. Platillos
        console.log('Inserting Platillos...');
        // Note: Using 'activo' as per schema 1/0
        await connection.query("INSERT IGNORE INTO platillos (id, nombre, precio, categoria_id, activo) VALUES (1, 'Tequeños', 15.00, 1, 1)");

        // 4. Usuarios
        console.log('Inserting Usuarios...');
        const pass = bcrypt.hashSync('123456', 10);
        // Ensure using 'usuario' column NOT 'email' check schema!
        // My audit showed 'usuario' column in schema.
        await connection.query(`
            INSERT IGNORE INTO usuarios (id, nombre, usuario, password, rol, activo) 
            VALUES (1, 'Admin User', 'admin', ?, 'admin', 1)
        `, [pass]);

        await connection.query(`
            INSERT IGNORE INTO usuarios (id, nombre, usuario, password, rol, activo) 
            VALUES (2, 'Mesero User', 'mesero', ?, 'mesero', 1)
        `, [pass]);

        console.log('✅ Database Initialized Successfully!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Init Failed:', e);
        process.exit(1);
    } finally {
        await connection.end();
    }
};

initDb();
