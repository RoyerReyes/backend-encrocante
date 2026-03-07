import db from './src/config/db.js';
import fs from 'fs';
import path from 'path';

const sqlPath = 'C:/Users/Admin/.gemini/antigravity/brain/dee10472-ec83-4e1e-9ffb-b3af1d160e64/add_loyalty_columns.sql';
const sql = fs.readFileSync(sqlPath, 'utf8');

console.log('Ejecutando migración...');

db.promise().query(sql)
    .then(() => {
        console.log('Migración completada exitosamente.');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error en migración:', err);
        process.exit(1);
    });
