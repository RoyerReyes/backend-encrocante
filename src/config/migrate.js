import db from './db.js';

export const runMigrations = async () => {
  try {
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS salsas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        activo BOOLEAN DEFAULT true
      )
    `);
    
    // Check if empty salsas
    const [rowsSalsas] = await db.promise().query('SELECT COUNT(*) as count FROM salsas');
    if (rowsSalsas[0].count === 0) {
      await db.promise().query(`
        INSERT IGNORE INTO salsas (nombre) VALUES 
        ('BBQ'), ('Bufalo'), ('Honey Mustard'), ('Maracuya'), ('Teriyaqui'), 
        ('Anticuchera'), ('Acevichada'), ('Mango Jalapeño'), ('Korean BBQ'), ('Spicy Thai')
      `);
      console.log('✅ Migrations: Tabla salsas creada y poblada.');
    } else {
      console.log('✅ Migrations: Tabla salsas ya existente.');
    }

    // CREATE PRESAS
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS presas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        activo BOOLEAN DEFAULT true
      )
    `);

    // Check if empty presas
    const [rowsPresas] = await db.promise().query('SELECT COUNT(*) as count FROM presas');
    if (rowsPresas[0].count === 0) {
      await db.promise().query(`
        INSERT IGNORE INTO presas (nombre) VALUES 
        ('Pecho'), ('Encuentro')
      `);
      console.log('✅ Migrations: Tabla presas creada y poblada.');
    } else {
      console.log('✅ Migrations: Tabla presas ya existente.');
    }

  } catch (error) {
    console.error('❌ Error en migraciones de BD:', error);
  }
};
