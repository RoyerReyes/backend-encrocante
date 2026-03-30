import db from './src/config/db.js';

const run = async () => {
  try {
    await db.promise().query("CREATE TABLE IF NOT EXISTS salsas (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(50) NOT NULL UNIQUE, activo BOOLEAN DEFAULT true);");
    await db.promise().query("INSERT IGNORE INTO salsas (nombre) VALUES ('BBQ'), ('Bufalo'), ('Honey Mustard'), ('Maracuya'), ('Teriyaqui'), ('Anticuchera'), ('Acevichada'), ('Mango Jalapeño'), ('Korean BBQ'), ('Spicy Thai');");
    console.log('OK');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};
run();
